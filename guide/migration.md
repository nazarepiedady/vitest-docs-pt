---
title: Guia de Migração | Guia
---

# Guia de Migração {#migration-guide}

## Migrando da Jest {#migrating-from-jest}

A Vitest tem sido desenhada com uma API compatível de Jest, para tornar a migração a partir de Jest o mais simples possível. Apesar destes esforços, ainda podes deparar-te com as seguintes diferenças:

**Globais como um Padrão**

A Jest tem as suas [API globais](https://jestjs.io/docs/api) ativadas por padrão. A Vitest não. Tu podes ou ativar os globais através da [definição da configuração `globals`](/config/#globals) ou atualizar o teu código para usar as importações do módulo `vitest`.

Se decidires manter os globais desativado, esteja ciente de que bibliotecas comuns como [`testing-library`](https://testing-library.com/) não executarão a [limpeza](https://testing-library.com/docs/svelte-testing-library/api/#cleanup) do DOM automaticamente.

**Simulação de Módulo**

Quando estiveres a simular um módulo na Jest, o valor de retorno do argumento de fábrica é a exportação padrão. Na Vitest, o argumento de fábrica tem de retornar um objeto com cada exportação explicita definida. Por exemplo, o seguinte `jest.mock` teria de ser atualizada como se segue:

```diff
- jest.mock('./some-path', () => 'hello')
+ vi.mock('./some-path', () => ({
+   default: 'hello',
+ })
```

Por mais detalhes consulte a [seção da API de `vi.mock`](/api/vi#vi-mock).

**Comportamento de Auto-Simulação**

Ao contrário de Jest, os módulos simulados na `<root>/__mocks__` não são carregados a menos de `vi.mock()` seja chamada. Se precisares que elas sejam simuladas em todo teste, como na Jest, podes simulá-las dentro de [`setupFiles`](/config/#setupfiles).

**Importando o original de um pacote simulado**

Se apenas estiveres parcialmente simulando um pacote, podes ter usado antes a função da Jest `requireActual`. Na Vitest, podes substituir estas chamadas com `vi.importActual`:

```diff
- const { cloneDeep } = jest.requireActual('lodash/cloneDeep')
+ const { cloneDeep } = await vi.importActual('lodash/cloneDeep')
```

**API de Jasmine**

A Jest exporta vários globais de [`jasmine`](https://jasmine.github.io/) (tais como `jasmine.any()`). Quaisquer instâncias destas precisarão de ser migradas para [suas equivalentes de Vitest](/api/).

**Variáveis de Ambiente**

Tal como a Jest, a Vitest define `NODE_ENV` para `test`, se foi definida antes. A Vitest também tem um equivalente para `JEST_WORKER_ID` chamado de `VITEST_POOL_ID` (sempre menor do ou igual à `maxThreads`), assim se dependeres dele, não te esqueças de renomeia-lo. A Vitest também expõe a `VITEST_WORKER_ID` que é um identificador único de um operário em execução - este número não é afetado pelo `maxThreads`, e aumentará com cada operário criado.

Se quiseres modificar as variáveis de ambiente, usarás a [API de `replaceProperty`](https://jestjs.io/docs/jest-object#jestreplacepropertyobject-propertykey-value) na Jest, podes usar a [`vi.stubEnv`](https://vitest.dev/api/vi.html#vi-stubenv) para também fazer isto na Vitest.

**Função de Resposta Feita**

Desde a versão 0.10.0 da Vitest, o estilo da função de resposta de declarar testes está depreciado. Tu podes reescrevê-los para usar funções `async` ou `await`, ou usar promessa para imitar o estilo da função de resposta:

```diff
- it('should work', (done) => {
+ it('should work', () => new Promise(done => {
    // ...
    done()
- })
+ }))
```

**Gatilhos**

Os gatilhos `beforeAll` e `beforeEach` podem retornar a [função de demolição](/api/#setup-and-teardown) na Vitest. Por causa disto podes precisares de reescrever as tuas declarações de gatilhos, se retornarem alguma coisa senão `undefined` ou `null`:

```diff
- beforeEach(() => setActivePinia(createTestingPinia()))
+ beforeEach(() => { setActivePinia(createTestingPinia()) })
```

**Tipos**

A Vitest não expõe muitos tipos sobre o nome de espaço `Vi`, ela existe principalmente para compatibilidade com os correspondentes, assim podes precisar de importar os tipos diretamente de `vitest` ao invés de depender do nome de espaço `Vi`:

```diff
- let fn: jest.Mock<string, [string]>
+ import type { Mock } from 'vitest'
+ let fn: Mock<[string], string>
```

Além disto, a Vitest tem o tipo `Args` como primeiro argumento ao invés de `Returns`, conforme podes ver na diferença:

**Temporizadores**

A Vitest não suporta os temporizadores de herança da Jest.

**Fotografias de Vue**

Isto não é uma funcionalidade específica de Jest, mas se antes estavas a usar a Jest com predefinição da `vue-cli`, precisarás de instalar o pacote [`jest-serializer-vue`](https://github.com/eddyerburgh/jest-serializer-vue), e usá-lo dentro de [`setupFiles`](/config/#setupfiles):

`vite.config.js`

```js
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    setupFiles: ['./tests/unit/setup.js']
  }
})
```

`tests/unit/setup.js`

```js
import vueSnapshotSerializer from 'jest-serializer-vue'

expect.addSnapshotSerializer(vueSnapshotSerializer)
```

De outro modo as tuas fotografias terão de ter muitos caracteres `"` escapados.
