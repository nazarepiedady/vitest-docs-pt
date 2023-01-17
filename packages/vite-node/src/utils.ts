import { fileURLToPath, pathToFileURL } from 'node:url'
import { existsSync } from 'node:fs'
import { resolve } from 'pathe'
import type { Arrayable, Nullable } from './types'

export const isWindows = process.platform === 'win32'

export function slash(str: string) {
  return str.replace(/\\/g, '/')
}

export const VALID_ID_PREFIX = '/@id/'

export function normalizeRequestId(id: string, base?: string): string {
  if (base && id.startsWith(base))
    id = `/${id.slice(base.length)}`

  return id
    .replace(/^\/@id\/__x00__/, '\0') // virtual modules start with `\0`
    .replace(/^\/@id\//, '')
    .replace(/^__vite-browser-external:/, '')
    .replace(/^file:/, '')
    .replace(/^\/+/, '/') // remove duplicate leading slashes
    .replace(/\?v=\w+/, '?') // remove ?v= query
    .replace(/&v=\w+/, '') // remove &v= query
    .replace(/\?t=\w+/, '?') // remove ?t= query
    .replace(/&t=\w+/, '') // remove &t= query
    .replace(/\?import/, '?') // remove ?import query
    .replace(/&import/, '') // remove &import query
    .replace(/\?&/, '?') // replace ?& with just ?
    .replace(/\?+$/, '') // remove end query mark
}

export const queryRE = /\?.*$/s
export const hashRE = /#.*$/s

export const cleanUrl = (url: string): string =>
  url.replace(hashRE, '').replace(queryRE, '')

const internalRequests = [
  '@vite/client',
  '@vite/env',
]

const internalRequestRegexp = new RegExp(`^/?(${internalRequests.join('|')})$`)

export const isInternalRequest = (id: string): boolean => {
  return internalRequestRegexp.test(id)
}

export function normalizeModuleId(id: string) {
  return id
    .replace(/\\/g, '/')
    .replace(/^\/@fs\//, isWindows ? '' : '/')
    .replace(/^file:\//, '/')
    .replace(/^node:/, '')
    .replace(/^\/+/, '/')
}

export function isPrimitive(v: any) {
  return v !== Object(v)
}

export function toFilePath(id: string, root: string): { path: string; exists: boolean } {
  let { absolute, exists } = (() => {
    if (id.startsWith('/@fs/'))
      return { absolute: id.slice(4), exists: true }
    // check if /src/module.js -> <root>/src/module.js
    if (!id.startsWith(root) && id.startsWith('/')) {
      const resolved = resolve(root, id.slice(1))
      if (existsSync(cleanUrl(resolved)))
        return { absolute: resolved, exists: true }
    }
    else if (id.startsWith(root) && existsSync(cleanUrl(id))) {
      return { absolute: id, exists: true }
    }
    return { absolute: id, exists: false }
  })()

  if (absolute.startsWith('//'))
    absolute = absolute.slice(1)

  // disambiguate the `<UNIT>:/` on windows: see nodejs/node#31710
  return {
    path: isWindows && absolute.startsWith('/')
      ? slash(fileURLToPath(pathToFileURL(absolute.slice(1)).href))
      : absolute,
    exists,
  }
}

/**
 * Convert `Arrayable<T>` to `Array<T>`
 *
 * @category Array
 */
export function toArray<T>(array?: Nullable<Arrayable<T>>): Array<T> {
  if (array === null || array === undefined)
    array = []

  if (Array.isArray(array))
    return array

  return [array]
}
