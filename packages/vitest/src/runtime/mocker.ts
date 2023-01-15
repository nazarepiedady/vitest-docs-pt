import { existsSync, readdirSync } from 'node:fs'
import { isNodeBuiltin } from 'mlly'
import { basename, dirname, extname, isAbsolute, join, resolve } from 'pathe'
import c from 'picocolors'
import { getAllMockableProperties, getType, getWorkerState } from '../utils'
import { distDir } from '../constants'
import type { MockFactory, PendingSuiteMock } from '../types/mocker'
import type { VitestRunner } from './execute'

class RefTracker {
  private idMap = new Map<any, number>()
  private mockedValueMap = new Map<number, any>()

  public getId(value: any) {
    return this.idMap.get(value)
  }

  public getMockedValue(id: number) {
    return this.mockedValueMap.get(id)
  }

  public track(originalValue: any, mockedValue: any): number {
    const newId = this.idMap.size
    this.idMap.set(originalValue, newId)
    this.mockedValueMap.set(newId, mockedValue)
    return newId
  }
}

type Key = string | symbol

function isSpecialProp(prop: Key, parentType: string) {
  return parentType.includes('Function')
      && typeof prop === 'string'
      && ['arguments', 'callee', 'caller', 'length', 'name'].includes(prop)
}

export class VitestMocker {
  private static pendingIds: PendingSuiteMock[] = []
  private static spyModulePath = resolve(distDir, 'spy.js')
  private static spyModule?: typeof import('../integrations/spy')
  private resolveCache = new Map<string, Record<string, string>>()

  constructor(
    public runner: VitestRunner,
  ) {}

  private get root() {
    return this.runner.options.root
  }

  private get base() {
    return this.runner.options.base
  }

  private get mockMap() {
    return this.runner.options.mockMap
  }

  private get moduleCache() {
    return this.runner.moduleCache
  }

  public getSuiteFilepath(): string {
    return getWorkerState().filepath || 'global'
  }

  public getMocks() {
    const suite = this.getSuiteFilepath()
    const suiteMocks = this.mockMap.get(suite)
    const globalMocks = this.mockMap.get('global')

    return {
      ...globalMocks,
      ...suiteMocks,
    }
  }

  private async resolvePath(rawId: string, importer: string) {
    const [id, fsPath] = await this.runner.resolveUrl(rawId, importer)
    // external is node_module or unresolved module
    // for example, some people mock "vscode" and don't have it installed
    const external = !isAbsolute(fsPath) || fsPath.includes('/node_modules/') ? rawId : null

    return {
      id,
      fsPath,
      external,
    }
  }

  private async resolveMocks() {
    await Promise.all(VitestMocker.pendingIds.map(async (mock) => {
      const { fsPath, external } = await this.resolvePath(mock.id, mock.importer)
      if (mock.type === 'unmock')
        this.unmockPath(fsPath)
      if (mock.type === 'mock')
        this.mockPath(mock.id, fsPath, external, mock.factory)
    }))

    VitestMocker.pendingIds = []
  }

  private async callFunctionMock(dep: string, mock: MockFactory) {
    const cached = this.moduleCache.get(dep)?.exports
    if (cached)
      return cached
    let exports: any
    try {
      exports = await mock()
    }
    catch (err) {
      const vitestError = new Error(
        '[vitest] There was an error, when mocking a module. '
      + 'If you are using "vi.mock" factory, make sure there are no top level variables inside, since this call is hoisted to top of the file. '
      + 'Read more: https://vitest.dev/api/#vi-mock')
      vitestError.cause = err
      throw vitestError
    }

    const filepath = dep.slice(5)
    const mockpath = this.resolveCache.get(this.getSuiteFilepath())?.[filepath] || filepath

    if (exports === null || typeof exports !== 'object')
      throw new Error(`[vitest] vi.mock("${mockpath}", factory?: () => unknown) is not returning an object. Did you mean to return an object with a "default" key?`)

    const moduleExports = new Proxy(exports, {
      get(target, prop) {
        const val = target[prop]

        // 'then' can exist on non-Promise objects, need nested instanceof check for logic to work
        if (prop === 'then') {
          if (target instanceof Promise)
            return target.then.bind(target)
        }
        else if (!(prop in target)) {
          throw new Error(
            `[vitest] No "${String(prop)}" export is defined on the "${mockpath}" mock. `
            + 'Did you forget to return it from "vi.mock"?'
            + '\nIf you need to partially mock a module, you can use "vi.importActual" inside:\n\n'
            + `${c.green(`vi.mock("${mockpath}", async () => {
  const actual = await vi.importActual("${mockpath}")
  return {
    ...actual,
    // your mocked methods
  },
})`)}\n`,
          )
        }

        return val
      },
    })

    this.moduleCache.set(dep, { exports: moduleExports })

    return moduleExports
  }

  public getMockPath(dep: string) {
    return `mock:${dep}`
  }

  public getDependencyMock(id: string) {
    return this.getMocks()[id]
  }

  public normalizePath(path: string) {
    return this.moduleCache.normalizePath(path)
  }

  public resolveMockPath(mockPath: string, external: string | null) {
    const path = external || mockPath

    // it's a node_module alias
    // all mocks should be inside <root>/__mocks__
    if (external || isNodeBuiltin(mockPath) || !existsSync(mockPath)) {
      const mockDirname = dirname(path) // for nested mocks: @vueuse/integration/useJwt
      const mockFolder = join(this.root, '__mocks__', mockDirname)

      if (!existsSync(mockFolder))
        return null

      const files = readdirSync(mockFolder)
      const baseOriginal = basename(path)

      for (const file of files) {
        const baseFile = basename(file, extname(file))
        if (baseFile === baseOriginal)
          return resolve(mockFolder, file)
      }

      return null
    }

    const dir = dirname(path)
    const baseId = basename(path)
    const fullPath = resolve(dir, '__mocks__', baseId)
    return existsSync(fullPath) ? fullPath : null
  }

  public mockObject(object: Record<Key, any>, mockExports: Record<Key, any> = {}) {
    if (!VitestMocker.spyModule) {
      throw new Error(
        'Error: Spy module is not defined. '
        + 'This is likely an internal bug in Vitest. '
        + 'Please report it to https://github.com/vitest-dev/vitest/issues')
    }
    const spyModule = VitestMocker.spyModule

    const finalizers = new Array<() => void>()
    const refs = new RefTracker()

    const define = (container: Record<Key, any>, key: Key, value: any) => {
      try {
        container[key] = value
        return true
      }
      catch {
        return false
      }
    }

    const mockPropertiesOf = (container: Record<Key, any>, newContainer: Record<Key, any>) => {
      const containerType = getType(container)
      const isModule = containerType === 'Module' || !!container.__esModule
      for (const { key: property, descriptor } of getAllMockableProperties(container, isModule)) {
        // Modules define their exports as getters. We want to process those.
        if (!isModule && descriptor.get) {
          try {
            Object.defineProperty(newContainer, property, descriptor)
          }
          catch (error) {
            // Ignore errors, just move on to the next prop.
          }
          continue
        }

        // Skip special read-only props, we don't want to mess with those.
        if (isSpecialProp(property, containerType))
          continue

        const value = container[property]

        // Special handling of references we've seen before to prevent infinite
        // recursion in circular objects.
        const refId = refs.getId(value)
        if (refId !== undefined) {
          finalizers.push(() => define(newContainer, property, refs.getMockedValue(refId)))
          continue
        }

        const type = getType(value)

        if (Array.isArray(value)) {
          define(newContainer, property, [])
          continue
        }

        const isFunction = type.includes('Function') && typeof value === 'function'
        if ((!isFunction || value.__isMockFunction) && type !== 'Object' && type !== 'Module') {
          define(newContainer, property, value)
          continue
        }

        // Sometimes this assignment fails for some unknown reason. If it does,
        // just move along.
        if (!define(newContainer, property, isFunction ? value : {}))
          continue

        if (isFunction) {
          spyModule.spyOn(newContainer, property).mockImplementation(() => undefined)
          // tinyspy retains length, but jest doesn't.
          Object.defineProperty(newContainer[property], 'length', { value: 0 })
        }

        refs.track(value, newContainer[property])
        mockPropertiesOf(value, newContainer[property])
      }
    }

    const mockedObject: Record<Key, any> = mockExports
    mockPropertiesOf(object, mockedObject)

    // Plug together refs
    for (const finalizer of finalizers)
      finalizer()

    return mockedObject
  }

  public unmockPath(path: string) {
    const suitefile = this.getSuiteFilepath()

    const id = this.normalizePath(path)

    const mock = this.mockMap.get(suitefile)
    if (mock && id in mock)
      delete mock[id]

    const mockId = this.getMockPath(id)
    if (this.moduleCache.get(mockId))
      this.moduleCache.delete(mockId)
  }

  public mockPath(originalId: string, path: string, external: string | null, factory?: MockFactory) {
    const suitefile = this.getSuiteFilepath()
    const id = this.normalizePath(path)

    const mocks = this.mockMap.get(suitefile) || {}
    const resolves = this.resolveCache.get(suitefile) || {}

    mocks[id] = factory || this.resolveMockPath(path, external)
    resolves[id] = originalId

    this.mockMap.set(suitefile, mocks)
    this.resolveCache.set(suitefile, resolves)
  }

  public async importActual<T>(rawId: string, importee: string): Promise<T> {
    const { id, fsPath } = await this.resolvePath(rawId, importee)
    const result = await this.runner.cachedRequest(id, fsPath, [importee])
    return result as T
  }

  public async importMock(rawId: string, importee: string): Promise<any> {
    const { id, fsPath, external } = await this.resolvePath(rawId, importee)

    const normalizedId = this.normalizePath(fsPath)
    let mock = this.getDependencyMock(normalizedId)

    if (mock === undefined)
      mock = this.resolveMockPath(fsPath, external)

    if (mock === null) {
      const mod = await this.runner.cachedRequest(id, fsPath, [importee])
      return this.mockObject(mod)
    }

    if (typeof mock === 'function')
      return this.callFunctionMock(fsPath, mock)
    return this.runner.dependencyRequest(mock, mock, [importee])
  }

  public async initializeSpyModule() {
    if (VitestMocker.spyModule)
      return
    VitestMocker.spyModule = await this.runner.executeId(VitestMocker.spyModulePath)
  }

  public async requestWithMock(url: string, callstack: string[]) {
    if (VitestMocker.pendingIds.length)
      await this.resolveMocks()

    const id = this.normalizePath(url)
    const mock = this.getDependencyMock(id)

    const mockPath = this.getMockPath(id)

    if (mock === null) {
      const cache = this.moduleCache.get(mockPath)
      if (cache.exports)
        return cache.exports

      const exports = {}
      // Assign the empty exports object early to allow for cycles to work. The object will be filled by mockObject()
      this.moduleCache.set(mockPath, { exports })
      const mod = await this.runner.directRequest(url, url, callstack)
      this.mockObject(mod, exports)
      return exports
    }
    if (typeof mock === 'function' && !callstack.includes(mockPath) && !callstack.includes(url)) {
      callstack.push(mockPath)
      const result = await this.callFunctionMock(mockPath, mock)
      const indexMock = callstack.indexOf(mockPath)
      callstack.splice(indexMock, 1)
      return result
    }
    if (typeof mock === 'string' && !callstack.includes(mock))
      return mock
  }

  public queueMock(id: string, importer: string, factory?: MockFactory) {
    VitestMocker.pendingIds.push({ type: 'mock', id, importer, factory })
  }

  public queueUnmock(id: string, importer: string) {
    VitestMocker.pendingIds.push({ type: 'unmock', id, importer })
  }
}
