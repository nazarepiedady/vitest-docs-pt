import { access } from 'fs'
import { sep } from 'pathe'
import { expect, test } from 'vitest'
import { A } from '../src/sourceA'

test('A equals A', () => {
  expect(A).toBe('A')
  expect(typeof sep).toBe('string')
  // doesn't throw
  expect(typeof access).toBe('function')
})
