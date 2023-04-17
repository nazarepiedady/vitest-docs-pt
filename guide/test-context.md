---
title: Contexto de Teste | Guia
---

# Contexto de Teste {#test-context}

Inspirado pela [Instalações de Playwright](https://playwright.dev/docs/test-fixtures), o contexto de teste da Vitest permite-te definir utilitários, estados, e instalações que podem ser usadas nos teus testes.

## Uso {#usage}

O primeiro argumento para cada função de resposta de teste é um contexto de teste:

```ts
import { it } from 'vitest'

it('should work', (ctx) => {
  // imprime o nome do teste
  console.log(ctx.meta.name)
})
```

## Contexto de Teste Embutido {#built-in-test-context}

#### `context.meta` {#context-meta}

Um objeto de apenas leitura que contém metadados sobre o teste.

#### `context.expect` {#context-expect}

A API `expect` ligada ao teste atual.

## Estender o Contexto de Teste {#extend-test-context}

Os contextos são diferentes para cada teste. Tu podes acessar e estendê-los dentro dos gatilhos `beforeEach` e `afterEach`:

```ts
import { beforeEach, it } from 'vitest'

beforeEach(async (context) => {
  // estender o contexto
  context.foo = 'bar'
})

it('should work', ({ foo }) => {
  console.log(foo) // 'bar'
})
```

### TypeScript {#typescript}

Para fornecer tipos de propriedades para todos os teus contextos personalizados, podes agregar o tipo `TestContext` adicionando:

```ts
declare module 'vitest' {
  export interface TestContext {
    foo?: string
  }
}
```

Se quiseres fornecer tipos de propriedade apenas para gatilhos específicos como `afterEach`, `it`, e `test`, podes passar o tipo como um genérico:

```ts
interface LocalTestContext {
  foo: string
}

beforeEach<LocalTestContext>(async (context) => {
  // o tipo de `context` é 'TestContext & LocalTestContext'
  context.foo = 'bar'
})

it<LocalTestContext>('should work', ({ foo }) => {
  // o tipo de `foo` é 'string'
  console.log(foo) // 'bar'
})
```
