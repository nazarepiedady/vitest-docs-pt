/* eslint-disable vars-on-top */

import { beforeEach, describe, expect, it, vi } from 'vitest'

declare global {
  // eslint-disable-next-line no-var
  var __defined__: unknown
}

describe('stubbing globals', () => {
  beforeEach(() => {
    delete globalThis.__defined__
    vi.unstubAllGlobals()
  })

  it('stubs and restores already defined value', () => {
    globalThis.__defined__ = 'true'
    vi.stubGlobal('__defined__', 'false')
    expect(__defined__).toBe('false')
    expect(globalThis.__defined__).toBe('false')
    vi.unstubAllGlobals()
    expect(__defined__).toBe('true')
    expect(globalThis.__defined__).toBe('true')
  })

  it('stubs and removes undefined value', () => {
    vi.stubGlobal('__defined__', 'false')
    expect(__defined__).toBe('false')
    expect(globalThis.__defined__).toBe('false')
    vi.unstubAllGlobals()
    expect('__defined__' in globalThis).toBe(false)
    expect(() => __defined__).toThrowError(ReferenceError)
    expect(globalThis.__defined__).toBeUndefined()
  })

  it('restores the first available value', () => {
    globalThis.__defined__ = 'true'
    vi.stubGlobal('__defined__', 'false')
    vi.stubGlobal('__defined__', false)
    vi.stubGlobal('__defined__', null)
    expect(__defined__).toBe(null)
    expect(globalThis.__defined__).toBe(null)
    vi.unstubAllGlobals()
    expect(__defined__).toBe('true')
    expect(globalThis.__defined__).toBe('true')
  })
})

describe('stubbing envs', () => {
  beforeEach(() => {
    process.env.VITE_TEST_UPDATE_ENV = 'development'
    vi.unstubAllEnvs()
  })

  it('stubs and restores env', () => {
    vi.stubEnv('VITE_TEST_UPDATE_ENV', 'production')
    expect(import.meta.env.VITE_TEST_UPDATE_ENV).toBe('production')
    expect(process.env.VITE_TEST_UPDATE_ENV).toBe('production')
    vi.unstubAllEnvs()
    expect(import.meta.env.VITE_TEST_UPDATE_ENV).toBe('development')
    expect(process.env.VITE_TEST_UPDATE_ENV).toBe('development')
  })

  it('stubs and restores previously not defined env', () => {
    delete process.env.VITE_TEST_UPDATE_ENV
    vi.stubEnv('VITE_TEST_UPDATE_ENV', 'production')
    expect(import.meta.env.VITE_TEST_UPDATE_ENV).toBe('production')
    expect(process.env.VITE_TEST_UPDATE_ENV).toBe('production')
    vi.unstubAllEnvs()
    expect('VITE_TEST_UPDATE_ENV' in process.env).toBe(false)
    expect('VITE_TEST_UPDATE_ENV' in import.meta.env).toBe(false)
    expect(import.meta.env.VITE_TEST_UPDATE_ENV).toBeUndefined()
    expect(process.env.VITE_TEST_UPDATE_ENV).toBeUndefined()
  })

  it('restores the first available value', () => {
    globalThis.__defined__ = 'true'
    vi.stubEnv('VITE_TEST_UPDATE_ENV', 'production')
    vi.stubEnv('VITE_TEST_UPDATE_ENV', 'staging')
    vi.stubEnv('VITE_TEST_UPDATE_ENV', 'test')
    expect(import.meta.env.VITE_TEST_UPDATE_ENV).toBe('test')
    expect(process.env.VITE_TEST_UPDATE_ENV).toBe('test')
    vi.unstubAllEnvs()
    expect(import.meta.env.VITE_TEST_UPDATE_ENV).toBe('development')
    expect(process.env.VITE_TEST_UPDATE_ENV).toBe('development')
  })
})
