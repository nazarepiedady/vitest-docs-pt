import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/reporters.spec.ts'],
  },
})
