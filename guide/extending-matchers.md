---
title: Estendendo os Avaliadores de Correspondência | Guia
---

# Estendendo os Avaliadores de Correspondência {#extending-matchers}

Já que a Vitest é compatível com ambas Chai e Jest, podes usar tanto a API de `chai.use` ou `expect.extend`, seja qual for que preferires.

Este guia explorará o ampliar dos avaliadores de correspondência com `expect.extend`. Se estiveres interessado na API da Chai. consulte [este guia](https://www.chaijs.com/guide/plugins/).

Para estenderes os avaliadores de correspondência padrão, chame `expect.extend` com um objeto contendo os teus avaliadores:

```ts
expect.extend({
  toBeFoo(received, expected) {
    const { isNot } = this
    return {
      // não altere a tua "pass" baseada no isNot.
      // A Vitest faz isto por ti
      pass: received === 'foo',
      message: () => `${received} is${isNot ? ' not' : ''} foo`
    }
  }
})
```

Se estiveres a usar a TypeScript, podes estender a interface dos avaliadores padrão num ficheiro de declaração de ambiente (por exemplo, `vitest.d.ts`) com o código abaixo:

```ts
interface CustomMatchers<R = unknown> {
  toBeFoo(): R
}

declare namespace Vi {
  interface Assertion extends CustomMatchers {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}

  // Nota: o aumento da interface jest.Matchers também funcionará.
}
```

:::warning AVISO
Não te esqueças de incluir o ficheiro de declaração de ambiente no teu `tsconfig.json`.
:::

O valor de retorno de um avaliador deve ser compatível com a seguinte interface:

```ts
interface MatcherResult {
  pass: boolean
  message: () => string
  // Se passares estes, aparecerão automaticamente dentro de uma diferença
  // quando o avaliador não passar, então não precisas de imprimir a diferença
  actual?: unknown
  expected?: unknown
}
```

:::warning AVISO
Se criares um avaliadores de correspondência assíncrono, não te esqueças de `await` o resultado `(await expect('foo').toBeFoo())` no próprio teste.
:::

O primeiro argumento dentro de uma função de avaliação de correspondência é o valor recebido (aquele dentro de `expect(received)`). O resto são argumentos passados diretamente ao avaliador.

A função avaliadora tem acesso ao contexto `this` com as seguintes propriedades:

- `isNot`

Retorna verdadeiro, se o avaliador foi chamado no `not` (`expect(received).not.toBeFoo()`).

- `promise`

Se o avaliador foi chamado no `resolved/rejected`, este valor conterá o nome do modificador. De outro modo, será um sequência de caracteres vazia.

- `equals`

Isto é uma função utilitária que permite-te comparar dois valores. Isto retornará `true` se os valores forem iguais, de outro modo é `false`. Esta função é usada intencionalmente para praticamente todo avaliador. Esta suporta objetos com avaliadores assimétricos por padrão.

- `utils`

Isto contém um conjunto de função utilitárias que podes usar para exibir mensagens.

O contexto de `this` também contém informação sobre o teste atual. Tu podes também recebê-lo chamando `expect.getState()`. As propriedades mais úteis são:

- `currentTestName`

Nome completo do teste atual (incluindo bloco que descreve).

- `testPath`

Caminho para o teste atual.
