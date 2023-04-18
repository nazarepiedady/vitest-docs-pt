---
title: Funcionalidades | Guia
outline: deep
---

# Funcionalidades {#features}

<FeaturesList class="!gap-1 text-lg" />

<div h-2 />
<CourseLink href="https://vueschool.io/lessons/your-first-test?friend=vueuse">
Saiba como escrever o teu primeiro teste
</CourseLink>

## Configuração Partilhada entre Teste, Desenvolvimento e Construção {#shared-config-between-test-dev-build}

Resolvedores, transformadores, configuração e extensões da Vite. Usa a mesma configuração da tua aplicação para executar os testes.

Saiba mais em [Configurando a Vitest](/guide/#configuring-vitest).

## Modo de Observação {#watch-mode}

```bash
$ vitest
```

Quando modificas o teu código-fonte ou ficheiros de teste, a Vitest procura inteligentemente o gráfico do módulo e apenas executa novamente os testes relacionados, [tal como a substituição de módulo instantânea funciona na Vite!](https://twitter.com/antfu7/status/1468233216939245579).

A `vitest` inicia inteligentemente no `watch mode` **por padrão em ambiente de desenvolvimento** e `run mode` em ambiente de integração continua (quando `process.env.CI` estiver presente). Tu podes usar `vitest watch` ou `vitest run` para especificar explicitamente o modo desejado.

## Idiomas de Web Comuns Fora da Caixa {#common-web-idioms-out-of-the-box}

Suporte de Módulo de ECMAScript / TypeScript / JSX / PostCSS fora da caixa.

## Linhas de Processamento {#threads}

Operários executando em várias linhas de processamentos através de [Tinypool](https://github.com/tinylibs/tinypool) (uma bifurcação leve de [Piscina](https://github.com/piscinajs/piscina)), permitindo os testes executar simultaneamente. As linhas de processamento são ativadas por padrão na Vitest, e podem ser desativadas passando `--no-threads` na interface da linha de comando.

A Vitest também isola cada ambiente do ficheiro assim as mutações de ambiente em um ficheiro não afetam os outros. O isolamento pode ser desativado passando `--no-isolate` para a interface da linha de comando (trocando correção por desempenho de execução).

## Filtragem de Teste {#test-filtering}

A Vitest fornece muitas maneiras de reduzir os testes à executar para acelerar a testagem assim podes concentrar-te no desenvolvimento.

Saiba mais sobre [Filtragem de Teste](./filtering.md).

## Executando Testes Simultaneamente {#running-tests-concurrently}

Use `.concurrent` nos testes consecutivos para executá-los em paralelo:

```ts
import { describe, it } from 'vitest'

// Os dois testes marcados com `.concurrent` executarão em paralelo
describe('suite', () => {
  it('serial test', async () => { /* ... */ })
  it.concurrent('concurrent test 1', async ({ expect }) => { /* ... */ })
  it.concurrent('concurrent test 2', async ({ expect }) => { /* ... */ })
})
```

Se usares `.concurrent` em um grupo, todo teste nele será executado em paralelo:

```ts
import { describe, it } from 'vitest'

// Todos os testes dentro deste grupo serão executados em paralelo
describe.concurrent('suite', () => {
  it('concurrent test 1', async ({ expect }) => { /* ... */ })
  it('concurrent test 2', async ({ expect }) => { /* ... */ })
  it.concurrent('concurrent test 3', async ({ expect }) => { /* ... */ })
})
```

Tu também podes usar `.skip`, `.only`, e `.todo` com os grupos e testes simultâneos. Leia mais na [Referência da API](/api/#test-concurrent).

:::warning AVISO
Quando executares testes simultâneos, as fotografias e afirmações devem usar `expect` do [Contexto de Teste](/guide/test-context.md) local para garantir que o teste correto é detetado.
:::

## Fotografia {#snapshot}

Suporte de fotografia [compatível com a Jest](https://jestjs.io/docs/snapshot-testing):

```ts
import { expect, it } from 'vitest'

it('renders correctly', () => {
  const result = render()
  expect(result).toMatchSnapshot()
})
```

Saiba mais em [Fotografia](/guide/snapshot).

## Compatibilidade de `expect` de Jest e Chai {#chai-and-jest-expect-compatibility}

A [Chai](https://www.chaijs.com/) é embutida para afirmações mais as APIs compatíveis com a [`expect` de Jest](https://jestjs.io/docs/expect).

Repara que se estiveres a usar bibliotecas de terceiros que adicionam correspondentes, definir `test.globals` para `true` fornecerá melhor compatibilidade.

## Simulação {#mocking}

A [Tinyspy](https://github.com/tinylibs/tinyspy) é embutida para simulação com as APIs compatíveis de `jest` no objeto `vi`:

```ts
import { expect, vi } from 'vitest'

const fn = vi.fn()

fn('hello', 1)

expect(vi.isMockFunction(fn)).toBe(true)
expect(fn.mock.calls[0]).toEqual(['hello', 1])

fn.mockImplementation(arg => arg)

fn('world', 2)

expect(fn.mock.results[1].value).toBe('world')
```

A Vitest suporta ambos [`happy-dom`](https://github.com/capricorn86/happy-dom) e [`jsdom`](https://github.com/jsdom/jsdom) para simular as APIs do Navegador e do DOM. Elas não vem com a Vitest, podes precisar de instalá-las:

```bash
$ npm i -D happy-dom
# ou
$ npm i -D jsdom
```

Depois disto, mude a opção `environment` no teu ficheiro de configuração:

```ts
// vite.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom', // ou 'jsdom', 'node'
  },
})
```

Saiba mais em [Simulação](/guide/mocking).

## Cobertura {#coverage}

A Vitest suporta a cobertura de código nativa através de [`c8`](https://github.com/bcoe/c8) e a cobertura de código instrumentalizada através da [`istanbul`](https://istanbul.js.org/):

```json
{
  "scripts": {
    "test": "vitest",
    "coverage": "vitest run --coverage"
  }
}
```

Saiba mais em [Cobertura](/guide/coverage).

## Testagem Na Fonte {#in-source-testing}

A Vitest também fornece uma maneira de executar os testes dentro do teu código-fonte juntamente com a implementação, parecido com os [testes de módulo da Rust](https://doc.rust-lang.org/book/ch11-03-test-organization.html#the-tests-module-and-cfgtest).

Isto faz os testes partilharem o mesmo encerramento que as implementações e capaz de testar contra estados privados sem exportar. Entretanto, também trás o laço de reações para mais próximo do desenvolvimento:

```ts
// src/index.ts

// a implementação
export function add(...args: number[]) {
  return args.reduce((a, b) => a + b, 0)
}

// grupos de teste na fonte
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest
  it('add', () => {
    expect(add()).toBe(0)
    expect(add(1)).toBe(1)
    expect(add(1, 2, 3)).toBe(6)
  })
}
```

Saiba mais em [testagem na fonte](/guide/in-source).

## Analise Comparativa <sup><code>experimental</code></sup> {#benchmarking-experimental}

Desde a versão 0.23.0 da Vitest, podes executar testes de marco de referência com a função [`bench`](/api/#bench) através da [Tinybench](https://github.com/tinylibs/tinybench) para comparar os resultados de desempenho:

```ts
import { bench, describe } from 'vitest'

describe('sort', () => {
  bench('normal', () => {
    const x = [1, 5, 4, 2, 3]
    x.sort((a, b) => {
      return a - b
    })
  })

  bench('reverse', () => {
    const x = [1, 5, 4, 2, 3]
    x.reverse().sort((a, b) => {
      return a - b
    })
  })
})
```

## Testagem de Tipo <sup><code>experimental</code></sup> {#type-testing-experimental}

Desde a versão 0.25.0, podes [escrever testes](/guide/testing-types) para capturar regressões de tipo. A Vitest com o pacote [`expect-type`](https://github.com/mmkal/expect-type) para fornecer-te uma API parecida e fácil de entender:

```ts
import { assertType, expectTypeOf } from 'vitest'
import { mount } from './mount.js'

test('my types work properly', () => {
  expectTypeOf(mount).toBeFunction()
  expectTypeOf(mount).parameter(0).toMatchTypeOf<{ name: string }>()

  // @ts-expect-error name is a string
  assertType(mount({ name: 42 }))
})
```
