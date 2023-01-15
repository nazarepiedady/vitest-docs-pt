import { startVitest } from 'vitest/node'

const configs = [
  ['test/default-css', {}],
  ['test/process-css', { include: [/App\.css/] }],
  ['test/process-module', { include: [/App\.module\.css/] }],
  ['test/scope-module', { include: [/App\.module\.css/], modules: { classNameStrategy: 'scoped' } }],
  ['test/non-scope-module', { include: [/App\.module\.css/], modules: { classNameStrategy: 'non-scoped' } }],
]

async function runTests() {
  for (const [name, config] of configs) {
    await startVitest('test', [name], {
      run: true,
      css: config,
      update: false,
      teardownTimeout: 1000_000_000,
    })

    if (process.exitCode)
      process.exit()
  }

  process.exit(0)
}

runTests()
