import { afterAll, expect, test } from 'vitest'

declare let __DEFINE__: string
declare let __JSON__: any
declare let __MODE__: string
declare let SOME: {
  VARIABLE: string
  SOME: {
    VARIABLE: string
  }
}

// functions to test that they are not statically replaced
const get__DEFINE__ = () => __DEFINE__
const get__JSON__ = () => __JSON__
const get__MODE__ = () => __MODE__

const MODE = process.env.MODE

afterAll(() => {
  process.env.MODE = MODE
})

test('process.env.HELLO_PROCESS is defined on "defined" but exists on process.env', () => {
  expect('HELLO_PROCESS' in process.env).toBe(true)
  expect(process.env.HELLO_PROCESS).toBe('hello process')
})

test('can redeclare standard define', () => {
  expect(get__DEFINE__()).toBe('defined')
  __DEFINE__ = 'new defined'
  expect(get__DEFINE__()).toBe('new defined')
})

test('can redeclare json object', () => {
  expect(get__JSON__()).toEqual({ hello: 'world' })
  __JSON__ = { hello: 'test' }
  const name = '__JSON__'
  expect(get__JSON__()).toEqual({ hello: 'test' })
  expect((globalThis as any)[name]).toEqual({ hello: 'test' })
})

test('reassigning __MODE__', () => {
  const env = process.env.MODE
  expect(get__MODE__()).toBe(env)
  process.env.MODE = 'development'
  expect(get__MODE__()).toBe('development')
})

test('dotted defines are processed by Vite, but cannot be reassigned', () => {
  expect(SOME.VARIABLE).toBe('variable')
  expect(SOME.SOME.VARIABLE).toBe('nested variable')
  SOME.VARIABLE = 'new variable'
  expect(SOME.VARIABLE).not.toBe('new variable')
})
