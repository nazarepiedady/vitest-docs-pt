import { createRequire } from 'node:module'
// we need native dirname, because windows __dirname has \\
import { dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import vm from 'node:vm'
import { isNodeBuiltin } from 'mlly'
import { resolve } from 'pathe'
import createDebug from 'debug'
import { VALID_ID_PREFIX, cleanUrl, isInternalRequest, isPrimitive, normalizeModuleId, normalizeRequestId, slash, toFilePath } from './utils'
import type { HotContext, ModuleCache, ViteNodeRunnerOptions } from './types'
import { extractSourceMap } from './source-map'

const debugExecute = createDebug('vite-node:client:execute')
const debugNative = createDebug('vite-node:client:native')

const clientStub = {
  injectQuery: (id: string) => id,
  createHotContext() {
    return {
      accept: () => {},
      prune: () => {},
      dispose: () => {},
      decline: () => {},
      invalidate: () => {},
      on: () => {},
    }
  },
  updateStyle(id: string, css: string) {
    if (typeof document === 'undefined')
      return

    const element = document.getElementById(id)
    if (element)
      element.remove()

    const head = document.querySelector('head')
    const style = document.createElement('style')
    style.setAttribute('type', 'text/css')
    style.id = id
    style.innerHTML = css
    head?.appendChild(style)
  },
}

export const DEFAULT_REQUEST_STUBS = {
  '/@vite/client': clientStub,
  '@vite/client': clientStub,
}

export class ModuleCacheMap extends Map<string, ModuleCache> {
  normalizePath(fsPath: string) {
    return normalizeModuleId(fsPath)
  }

  /**
   * Assign partial data to the map
   */
  update(fsPath: string, mod: Partial<ModuleCache>) {
    fsPath = this.normalizePath(fsPath)
    if (!super.has(fsPath))
      super.set(fsPath, mod)
    else
      Object.assign(super.get(fsPath) as ModuleCache, mod)
    return this
  }

  setByModuleId(modulePath: string, mod: ModuleCache) {
    return super.set(modulePath, mod)
  }

  set(fsPath: string, mod: ModuleCache) {
    return this.setByModuleId(this.normalizePath(fsPath), mod)
  }

  getByModuleId(modulePath: string): ModuleCache {
    if (!super.has(modulePath))
      super.set(modulePath, {})
    return super.get(modulePath)!
  }

  get(fsPath: string): ModuleCache {
    return this.getByModuleId(this.normalizePath(fsPath))
  }

  deleteByModuleId(modulePath: string): boolean {
    return super.delete(modulePath)
  }

  delete(fsPath: string) {
    return this.deleteByModuleId(this.normalizePath(fsPath))
  }

  /**
   * Invalidate modules that dependent on the given modules, up to the main entry
   */
  invalidateDepTree(ids: string[] | Set<string>, invalidated = new Set<string>()) {
    for (const _id of ids) {
      const id = this.normalizePath(_id)
      if (invalidated.has(id))
        continue
      invalidated.add(id)
      const mod = super.get(id)
      if (mod?.importers)
        this.invalidateDepTree(mod.importers, invalidated)
      super.delete(id)
    }
    return invalidated
  }

  /**
   * Invalidate dependency modules of the given modules, down to the bottom-level dependencies
   */
  invalidateSubDepTree(ids: string[] | Set<string>, invalidated = new Set<string>()) {
    for (const _id of ids) {
      const id = this.normalizePath(_id)
      if (invalidated.has(id))
        continue
      invalidated.add(id)
      const subIds = Array.from(super.entries())
        .filter(([,mod]) => mod.importers?.has(id))
        .map(([key]) => key)
      subIds.length && this.invalidateSubDepTree(subIds, invalidated)
      super.delete(id)
    }
    return invalidated
  }

  /**
   * Return parsed source map based on inlined source map of the module
   */
  getSourceMap(id: string) {
    const cache = this.get(id)
    if (cache.map)
      return cache.map
    const map = cache.code && extractSourceMap(cache.code)
    if (map) {
      cache.map = map
      return map
    }
    return null
  }
}

export class ViteNodeRunner {
  root: string

  debug: boolean

  /**
   * Holds the cache of modules
   * Keys of the map are filepaths, or plain package names
   */
  moduleCache: ModuleCacheMap

  constructor(public options: ViteNodeRunnerOptions) {
    this.root = options.root ?? process.cwd()
    this.moduleCache = options.moduleCache ?? new ModuleCacheMap()
    this.debug = options.debug ?? (typeof process !== 'undefined' ? !!process.env.VITE_NODE_DEBUG_RUNNER : false)
  }

  async executeFile(file: string) {
    const url = `/@fs/${slash(resolve(file))}`
    return await this.cachedRequest(url, url, [])
  }

  async executeId(rawId: string) {
    const [id, url] = await this.resolveUrl(rawId)
    return await this.cachedRequest(id, url, [])
  }

  getSourceMap(id: string) {
    return this.moduleCache.getSourceMap(id)
  }

  /** @internal */
  async cachedRequest(id: string, fsPath: string, callstack: string[]) {
    const importee = callstack[callstack.length - 1]

    const mod = this.moduleCache.get(fsPath)

    if (!mod.importers)
      mod.importers = new Set()
    if (importee)
      mod.importers.add(importee)

    // the callstack reference itself circularly
    if (callstack.includes(fsPath) && mod.exports)
      return mod.exports

    // cached module
    if (mod.promise)
      return mod.promise

    const promise = this.directRequest(id, fsPath, callstack)
    Object.assign(mod, { promise, evaluated: false })

    try {
      return await promise
    }
    finally {
      mod.evaluated = true
    }
  }

  shouldResolveId(id: string, _importee?: string) {
    return !isInternalRequest(id) && !isNodeBuiltin(id)
  }

  private async _resolveUrl(id: string, importee?: string): Promise<[url: string, fsPath: string]> {
    if (!this.shouldResolveId(id))
      return [id, id]
    // we don't pass down importee here, because otherwise Vite doesn't resolve it correctly
    if (importee && id.startsWith(VALID_ID_PREFIX))
      importee = undefined
    id = normalizeRequestId(id, this.options.base)
    if (!this.options.resolveId)
      return [id, toFilePath(id, this.root)]
    const resolved = await this.options.resolveId(id, importee)
    const resolvedId = resolved
      ? normalizeRequestId(resolved.id, this.options.base)
      : id
    // to be compatible with dependencies that do not resolve id
    const fsPath = resolved ? resolvedId : toFilePath(id, this.root)
    return [resolvedId, fsPath]
  }

  async resolveUrl(id: string, importee?: string) {
    const resolveKey = `resolve:${id}`
    // put info about new import as soon as possible, so we can start tracking it
    this.moduleCache.setByModuleId(resolveKey, { resolving: true })
    try {
      return await this._resolveUrl(id, importee)
    }
    finally {
      this.moduleCache.deleteByModuleId(resolveKey)
    }
  }

  /** @internal */
  async dependencyRequest(id: string, fsPath: string, callstack: string[]) {
    const getStack = () => {
      return `stack:\n${[...callstack, fsPath].reverse().map(p => `- ${p}`).join('\n')}`
    }

    let debugTimer: any
    if (this.debug)
      debugTimer = setTimeout(() => console.warn(() => `module ${fsPath} takes over 2s to load.\n${getStack()}`), 2000)

    try {
      if (callstack.includes(fsPath)) {
        const depExports = this.moduleCache.get(fsPath)?.exports
        if (depExports)
          return depExports
        throw new Error(`[vite-node] Failed to resolve circular dependency, ${getStack()}`)
      }

      return await this.cachedRequest(id, fsPath, callstack)
    }
    finally {
      if (debugTimer)
        clearTimeout(debugTimer)
    }
  }

  /** @internal */
  async directRequest(id: string, fsPath: string, _callstack: string[]) {
    const moduleId = normalizeModuleId(fsPath)
    const callstack = [..._callstack, moduleId]

    const mod = this.moduleCache.getByModuleId(moduleId)

    const request = async (dep: string) => {
      const [id, depFsPath] = await this.resolveUrl(dep, fsPath)
      return this.dependencyRequest(id, depFsPath, callstack)
    }

    const requestStubs = this.options.requestStubs || DEFAULT_REQUEST_STUBS
    if (id in requestStubs)
      return requestStubs[id]

    // eslint-disable-next-line prefer-const
    let { code: transformed, externalize } = await this.options.fetchModule(id)

    if (externalize) {
      debugNative(externalize)
      const exports = await this.interopedImport(externalize)
      mod.exports = exports
      return exports
    }

    if (transformed == null)
      throw new Error(`[vite-node] Failed to load "${id}" imported from ${callstack[callstack.length - 2]}`)

    const modulePath = cleanUrl(moduleId)
    // disambiguate the `<UNIT>:/` on windows: see nodejs/node#31710
    const href = pathToFileURL(modulePath).href
    const meta = { url: href }
    const exports = Object.create(null)
    Object.defineProperty(exports, Symbol.toStringTag, {
      value: 'Module',
      enumerable: false,
      configurable: false,
    })
    // this prosxy is triggered only on exports.{name} and module.exports access
    const cjsExports = new Proxy(exports, {
      set: (_, p, value) => {
        // treat "module.exports =" the same as "exports.default =" to not have nested "default.default",
        // so "exports.default" becomes the actual module
        if (p === 'default' && this.shouldInterop(modulePath, { default: value })) {
          exportAll(cjsExports, value)
          exports.default = value
          return true
        }

        if (!Reflect.has(exports, 'default'))
          exports.default = {}

        // returns undefined, when accessing named exports, if default is not an object
        // but is still present inside hasOwnKeys, this is Node behaviour for CJS
        if (isPrimitive(exports.default)) {
          defineExport(exports, p, () => undefined)
          return true
        }

        exports.default[p] = value
        if (p !== 'default')
          defineExport(exports, p, () => value)

        return true
      },
    })

    Object.assign(mod, { code: transformed, exports })
    const __filename = fileURLToPath(href)
    const moduleProxy = {
      set exports(value) {
        exportAll(cjsExports, value)
        exports.default = value
      },
      get exports() {
        return cjsExports
      },
    }

    // Vite hot context
    let hotContext: HotContext | undefined
    if (this.options.createHotContext) {
      Object.defineProperty(meta, 'hot', {
        enumerable: true,
        get: () => {
          hotContext ||= this.options.createHotContext?.(this, `/@fs/${fsPath}`)
          return hotContext
        },
        set: (value) => {
          hotContext = value
        },
      })
    }

    // Be careful when changing this
    // changing context will change amount of code added on line :114 (vm.runInThisContext)
    // this messes up sourcemaps for coverage
    // adjust `offset` variable in packages/coverage-c8/src/provider.ts#86 if you do change this
    const context = this.prepareContext({
      // esm transformed by Vite
      __vite_ssr_import__: request,
      __vite_ssr_dynamic_import__: request,
      __vite_ssr_exports__: exports,
      __vite_ssr_exportAll__: (obj: any) => exportAll(exports, obj),
      __vite_ssr_import_meta__: meta,

      // cjs compact
      require: createRequire(href),
      exports: cjsExports,
      module: moduleProxy,
      __filename,
      __dirname: dirname(__filename),
    })

    debugExecute(__filename)

    // remove shebang
    if (transformed[0] === '#')
      transformed = transformed.replace(/^\#\!.*/, s => ' '.repeat(s.length))

    // add 'use strict' since ESM enables it by default
    const codeDefinition = `'use strict';async (${Object.keys(context).join(',')})=>{{`
    const code = `${codeDefinition}${transformed}\n}}`
    const fn = vm.runInThisContext(code, {
      filename: __filename,
      lineOffset: 0,
      columnOffset: -codeDefinition.length,
    })

    await fn(...Object.values(context))

    return exports
  }

  prepareContext(context: Record<string, any>) {
    return context
  }

  /**
   * Define if a module should be interop-ed
   * This function mostly for the ability to override by subclass
   */
  shouldInterop(path: string, mod: any) {
    if (this.options.interopDefault === false)
      return false
    // never interop ESM modules
    // TODO: should also skip for `.js` with `type="module"`
    return !path.endsWith('.mjs') && 'default' in mod
  }

  /**
   * Import a module and interop it
   */
  async interopedImport(path: string) {
    const importedModule = await import(path)

    if (!this.shouldInterop(path, importedModule))
      return importedModule

    const { mod, defaultExport } = interopModule(importedModule)

    return new Proxy(mod, {
      get(mod, prop) {
        if (prop === 'default')
          return defaultExport
        return mod[prop] ?? defaultExport?.[prop]
      },
      has(mod, prop) {
        if (prop === 'default')
          return defaultExport !== undefined
        return prop in mod || (defaultExport && prop in defaultExport)
      },
      getOwnPropertyDescriptor(mod, prop) {
        const descriptor = Reflect.getOwnPropertyDescriptor(mod, prop)
        if (descriptor)
          return descriptor
        if (prop === 'default' && defaultExport !== undefined) {
          return {
            value: defaultExport,
            enumerable: true,
            configurable: true,
          }
        }
      },
    })
  }
}

function interopModule(mod: any) {
  if (isPrimitive(mod)) {
    return {
      mod: { default: mod },
      defaultExport: mod,
    }
  }

  let defaultExport = 'default' in mod ? mod.default : mod

  if (!isPrimitive(defaultExport) && '__esModule' in defaultExport) {
    mod = defaultExport
    if ('default' in defaultExport)
      defaultExport = defaultExport.default
  }

  return { mod, defaultExport }
}

// keep consistency with Vite on how exports are defined
function defineExport(exports: any, key: string | symbol, value: () => any) {
  Object.defineProperty(exports, key, {
    enumerable: true,
    configurable: true,
    get: value,
  })
}

function exportAll(exports: any, sourceModule: any) {
  // #1120 when a module exports itself it causes
  // call stack error
  if (exports === sourceModule)
    return

  if (isPrimitive(sourceModule) || Array.isArray(sourceModule))
    return

  for (const key in sourceModule) {
    if (key !== 'default') {
      try {
        defineExport(exports, key, () => sourceModule[key])
      }
      catch (_err) { }
    }
  }
}
