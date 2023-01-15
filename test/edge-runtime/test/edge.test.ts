/**
 *  @vitest-environment edge-runtime
 */
import { describe, expect, it } from 'vitest'
describe('edge runtime api', () => {
  it('TextEncoder references the same global Uint8Array constructor', () => {
    expect(new TextEncoder().encode('abc')).toBeInstanceOf(Uint8Array)
  })

  it('allows to run fetch', async () => {
    const response = await fetch('https://github.com/robots.txt')
    expect(response.status).toEqual(200)
  })

  it('allows to run crypto', async () => {
    const array = new Uint32Array(10)
    expect(crypto.getRandomValues(array)).toHaveLength(array.length)
  })
})
