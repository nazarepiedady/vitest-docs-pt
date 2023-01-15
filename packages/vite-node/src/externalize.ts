import { existsSync } from 'node:fs'
import { isNodeBuiltin, isValidNodeImport } from 'mlly'
import type { DepsHandlingOptions } from './types'
import { slash } from './utils'

const KNOWN_ASSET_TYPES = [
  // images
  'png',
  'jpe?g',
  'jfif',
  'pjpeg',
  'pjp',
  'gif',
  'svg',
  'ico',
  'webp',
  'avif',

  // media
  'mp4',
  'webm',
  'ogg',
  'mp3',
  'wav',
  'flac',
  'aac',

  // fonts
  'woff2?',
  'eot',
  'ttf',
  'otf',

  // other
  'webmanifest',
  'pdf',
  'txt',
]

const ESM_EXT_RE = /\.(es|esm|esm-browser|esm-bundler|es6|module)\.js$/
const ESM_FOLDER_RE = /\/(es|esm)\/(.*\.js)$/

const defaultInline = [
  /virtual:/,
  /\.[mc]?ts$/,

  // special Vite query strings
  /[?&](init|raw|url|inline)\b/,
  // Vite returns a string for assets imports, even if it's inside "node_modules"
  new RegExp(`\\.(${KNOWN_ASSET_TYPES.join('|')})$`),
]

const depsExternal = [
  /\.cjs\.js$/,
  /\.mjs$/,
]

export function guessCJSversion(id: string): string | undefined {
  if (id.match(ESM_EXT_RE)) {
    for (const i of [
      id.replace(ESM_EXT_RE, '.mjs'),
      id.replace(ESM_EXT_RE, '.umd.js'),
      id.replace(ESM_EXT_RE, '.cjs.js'),
      id.replace(ESM_EXT_RE, '.js'),
    ]) {
      if (existsSync(i))
        return i
    }
  }
  if (id.match(ESM_FOLDER_RE)) {
    for (const i of [
      id.replace(ESM_FOLDER_RE, '/umd/$1'),
      id.replace(ESM_FOLDER_RE, '/cjs/$1'),
      id.replace(ESM_FOLDER_RE, '/lib/$1'),
      id.replace(ESM_FOLDER_RE, '/$1'),
    ]) {
      if (existsSync(i))
        return i
    }
  }
}

const _defaultExternalizeCache = new Map<string, Promise<string | false>>()
export async function shouldExternalize(
  id: string,
  options?: DepsHandlingOptions,
  cache = _defaultExternalizeCache,
) {
  if (!cache.has(id))
    cache.set(id, _shouldExternalize(id, options))
  return cache.get(id)!
}

async function _shouldExternalize(
  id: string,
  options?: DepsHandlingOptions,
): Promise<string | false> {
  if (isNodeBuiltin(id))
    return id

  // data: should be processed by native import,
  // since it is a feature of ESM
  if (id.startsWith('data:'))
    return id

  id = patchWindowsImportPath(id)

  if (matchExternalizePattern(id, options?.inline))
    return false
  if (matchExternalizePattern(id, options?.external))
    return id

  const isNodeModule = id.includes('/node_modules/')
  const guessCJS = isNodeModule && options?.fallbackCJS
  id = guessCJS ? guessCJSversion(id) || id : id

  if (matchExternalizePattern(id, defaultInline))
    return false
  if (matchExternalizePattern(id, depsExternal))
    return id

  const isDist = id.includes('/dist/')
  if ((isNodeModule || isDist) && await isValidNodeImport(id))
    return id

  return false
}

function matchExternalizePattern(id: string, patterns?: (string | RegExp)[] | true) {
  if (patterns == null)
    return false
  if (patterns === true)
    return true
  for (const ex of patterns) {
    if (typeof ex === 'string') {
      if (id.includes(`/node_modules/${ex}/`))
        return true
    }
    else {
      if (ex.test(id))
        return true
    }
  }
  return false
}

function patchWindowsImportPath(path: string) {
  if (path.match(/^\w:\\/))
    return `file:///${slash(path)}`
  else if (path.match(/^\w:\//))
    return `file:///${path}`
  else
    return path
}
