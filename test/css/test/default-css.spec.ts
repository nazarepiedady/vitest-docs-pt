import { describe, expect, test } from 'vitest'
import { useRemoveStyles } from './utils'

describe('don\'t process css by default', () => {
  useRemoveStyles()

  test('doesn\'t apply css', async () => {
    await import('../src/App.css')

    const element = document.createElement('div')
    element.className = 'main'
    const computed = window.getComputedStyle(element)
    expect(computed.display).toBe('block')
    expect(element).toMatchInlineSnapshot(`
      <div
        class="main"
      />
    `)
  })

  test('module is not processed', async () => {
    const { default: styles } = await import('../src/App.module.css')

    // HASH is static, based on the filepath to root
    expect(styles.module).toBe('_module_6dc87e')
    expect(styles.someRandomValue).toBe('_someRandomValue_6dc87e')
    const element = document.createElement('div')
    element.className = '_module_6dc87e'
    const computed = window.getComputedStyle(element)
    expect(computed.display).toBe('block')
    expect(computed.width).toBe('')
    expect(element).toMatchInlineSnapshot(`
      <div
        class="_module_6dc87e"
      />
    `)
  })
})
