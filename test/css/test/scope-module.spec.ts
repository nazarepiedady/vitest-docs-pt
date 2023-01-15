import { expect, test } from 'vitest'

test('module is processed and scoped', async () => {
  const { default: styles } = await import('../src/App.module.css')

  expect(styles.module).toMatch(/_module_\w+_\w/)
  expect(styles.someRandomValue).toBeUndefined()
  const element = document.createElement('div')
  element.className = 'module main'
  const computedStatic = window.getComputedStyle(element)
  expect(computedStatic.display).toBe('block')
  expect(computedStatic.width).toBe('')
  expect(element).toMatchInlineSnapshot(`
    <div
      class="module main"
    />
  `)

  element.className = `${styles.module} ${styles.main}`
  const computedModules = window.getComputedStyle(element)
  expect(computedModules.display).toBe('flex')
  expect(computedModules.width).toBe('100px')
  expect(element).toMatchInlineSnapshot(`
    <div
      class="_module_19cso_5 _main_19cso_1"
    />
  `)
})
