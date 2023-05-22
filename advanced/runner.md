# Executor de Teste {#test-runner}

:::warning AVISO
Isto é uma API avançada. Se estiveres apenas a executar testes, provavelmente não precisas disto. Isto é usado primariamente por autores de biblioteca.
:::

Tu podes especificar um caminho para o teu executor de teste com a opção `runner` no teu ficheiro de configuração. Este ficheiro deve ter uma exportação padrão com uma classe implementado estes métodos:

```ts
export interface VitestRunner {
  /**
   * First thing that's getting called before actually collecting and running tests.
   */
  onBeforeCollect?(paths: string[]): unknown
  /**
   * Called after collecting tests and before "onBeforeRun".
   */
  onCollected?(files: File[]): unknown

  /**
   * Called before running a single test. Doesn't have "result" yet.
   */
  onBeforeRunTest?(test: Test): unknown
  /**
   * Called before actually running the test function. Already has "result" with "state" and "startTime".
   */
  onBeforeTryTest?(test: Test, retryCount: number): unknown
  /**
   * Called after result and state are set.
   */
  onAfterRunTest?(test: Test): unknown
  /**
   * Called right after running the test function. Doesn't have new state yet. Will not be called, if the test function throws.
   */
  onAfterTryTest?(test: Test, retryCount: number): unknown

  /**
   * Called before running a single suite. Doesn't have "result" yet.
   */
  onBeforeRunSuite?(suite: Suite): unknown
  /**
   * Called after running a single suite. Has state and result.
   */
  onAfterRunSuite?(suite: Suite): unknown

  /**
   * If defined, will be called instead of usual Vitest suite partition and handling.
   * "before" and "after" hooks will not be ignored.
   */
  runSuite?(suite: Suite): Promise<void>
  /**
   * If defined, will be called instead of usual Vitest handling. Useful, if you have your custom test function.
   * "before" and "after" hooks will not be ignored.
   */
  runTest?(test: Test): Promise<void>

  /**
   * Called, when a task is updated. The same as "onTaskUpdate" in a reporter, but this is running in the same thread as tests.
   */
  onTaskUpdate?(task: [string, TaskResult | undefined][]): Promise<void>

  /**
   * Called before running all tests in collected paths.
   */
  onBeforeRun?(files: File[]): unknown
  /**
   * Called right after running all tests in collected paths.
   */
  onAfterRun?(files: File[]): unknown
  /**
   * Called when new context for a test is defined. Useful, if you want to add custom properties to the context.
   * If you only want to define custom context with a runner, consider using "beforeAll" in "setupFiles" instead.
   */
  extendTestContext?(context: TestContext): TestContext
  /**
   * Called, when certain files are imported. Can be called in two situations: when collecting tests and when importing setup files.
   */
  importFile(filepath: string, source: VitestRunnerImportSource): unknown
  /**
   * Publicly available configuration.
   */
  config: VitestRunnerConfig
}
```

Quando inicializas esta classe, a Vitest passa a configuração da Vitest, - deverias expor ela como uma propriedade `config`.

:::warning AVISO
A Vitest também injeta uma instância de `ViteNodeRunner` como a propriedade `__vitest_executor`. Tu podes usá-la para processar ficheiros no método `importFile` (este é o comportamento padrão de `TestRunner` e `BenchmarkRunner`).

`ViteNodeRunner` expõe o método `executeId`, o qual é usado para importar os ficheiros de teste num ambiente amigável a Vite. Significa que, resolverá as importações e transformará o conteúdo em tempo de execução para que a Node possa entendê-lo.
:::

:::tip DICA
Suporte de Fotografia e algumas outras funcionalidades depende do executor. Se não quiseres perdê-lo, podes estender o teu executor a partir de `VitestTestRunner` importado de `vitest/runners`. Ele também expõe `BenchmarkNodeRunner`, se quiseres estender a funcionalidade de avaliação comparativa.
:::

## A função da tua tarefa {#your-task-function}

Tu podes estender o sistema de tarefa da Vitest com as tuas tarefas. Uma tarefa é um objeto que é parte dum grupo. Ele é adicionado automaticamente ao grupo atual com um método `suite.custom`:

```js
// ./utils/custom.js
import { getCurrentSuite, setFn } from 'vitest/suite'

export { describe, beforeAll, afterAll } from 'vitest'

// esta função será chamada, quando a Vitest recolher as tarefas
export const myCustomTask = function (name, fn) {
  const task = getCurrentSuite().custom(name)
  task.meta = {
    customPropertyToDifferentiateTask: true
  }
  setFn(task, fn || (() => {}))
}
```

```js
// ./garden/tasks.test.js
import { afterAll, beforeAll, describe, myCustomTask } from '../utils/custom.js'
import { gardener } from './gardener.js'

describe('take care of the garden', () => {
  beforeAll(() => {
    gardener.putWorkingClothes()
  })

  myCustomTask('weed the grass', () => {
    gardener.weedTheGrass()
  })
  myCustomTask('water flowers', () => {
    gardener.waterFlowers()
  })

  afterAll(() => {
    gardener.goHome()
  })
})
```

```bash
vitest ./garden/tasks.test.js
```

:::warning AVISO
Se não tiveres um executor personalizado ou não definiste o método `runTest`, a Vitest tentará recuperar uma tarefa automaticamente. Se não adicionaste uma função com `setFn`, esta falhará.
:::

:::tip DICA
O sistema de tarefa personalizado suporta gatilhos e contextos. Se quiseres suportar acorrentamento de propriedade (como, `only`, `skip`, e aqueles teus personalizados), podes importar `createChainable` de `vitest/suite` e envolver a tua função com ela. Tu precisarás de chamar `custom` como `custom.call(this)`, se decidires fazer isto.
:::
