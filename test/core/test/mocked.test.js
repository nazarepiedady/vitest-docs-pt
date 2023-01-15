// this file should not be converted to ts
// so it won't be transformed by esbuild

import { assert, test, vi } from 'vitest'
import { two } from '../src/submodule'
import { timeout } from '../src/timeout'

/*
    vi.mock('../src/timeout', () => ({ timeout: 0 }))
 /* */

// vi.mock('../src/timeout', () => ({ timeout: 0 }))

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const text = `
  vi.mock('../src/timeout', () => ({ timeout: 0 }))
`

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const textComment = `
  vi.mock('../src/timeout', () => ({ timeout: 0 }))
  /**
    vi.mock('../src/timeout', () => ({ timeout: 0 }))
    vi.mock('../src/timeout', () => ({ timeout: 0 }))
  */
`

vi.mock(
  '../src/submodule',
  () => ({
    two: 55,
  }),
)

// vi.mock('../src/submodule')

test('vitest correctly passes multiline vi.mock syntax', () => {
  assert.equal(55, two)
  assert.equal(100, timeout)
})
