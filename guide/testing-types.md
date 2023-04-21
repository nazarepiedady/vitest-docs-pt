---
title: Testando Tipos | Guia
---

# Testando Tipos {#testing-types}

A Vitest permite-te escrever testes para os teus tipos, usando as sintaxes `expectTypeOf` ou `assertType`. Por padrão todos os testes dentro dos ficheiros `*.test-d.ts` são considerados testes de tipo, mas podes mudar isto com a opção de configuração [`typecheck.include`](/config/#typecheck-include).

Nos bastidores a Vitest chama a `tsc` ou `vue-tsc`, dependendo da tua configuração, e analisa os resultados. A Vitest também imprime erros de tipo no teu código-fonte, se encontrar algum. Tu podes desativar isto com a opção de configuração [`typecheck.ignoreSourceErrors`](/config/#typecheck-ignoresourceerrors).

Lembra-te de que a Vitest não executa ou compila estes ficheiros, apenas são analisadas estaticamente pelo compilador, e por causa esta razão não podes usar quaisquer declarações dinâmicas. Significa que, não podes usar os nomes de teste dinâmicos, e as APIs `test.each`, `test.runIf`, `test.skipIf`, `test.concurrent`. Mas podes usar outras APIs, como `test`, `describe`, `.only`, `.skip` e `.todo`.

Usando opções de interface da linha de comando, como `--allowOnly` e `-` também são suportadas pela verificação de tipo:

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

Qualquer erro de tipo acionado dentro de um ficheiro de teste será tratado como erro de teste, assim podes usar qualquer truque de tipo que quiseres para testar os tipos do teu projeto.

Tu podes ver uma lista de possíveis correspondentes na [seção da API](/api/expect-typeof).

## Lendo os Erros {#reading-errors}

Se estiveres a usar a API `expectTypeOf`, podes notar a dificuldade de ler erros ou lidar com coisas inesperadas:

```ts
expectTypeOf(1).toEqualTypeOf<string>()
//             ^^^^^^^^^^^^^^^^^^^^^^
// index-c3943160.d.ts(90, 20): Arguments for the rest parameter 'MISMATCH' were not provided.
```

Isto é devido ao como a [`expect-type`](https://github.com/mmkal/expect-type) lida com os erros de tipo.

Infelizmente, a TypeScript não fornece metadados de tipo sem remendar, assim não podemos fornecer mensagens de erro úteis até o momento, mas existem [trabalhos no projeto da TypeScript](https://github.com/microsoft/TypeScript/pull/40468) para corrigir isto. Se quiseres mensagens melhores, peça a equipa da TypeScript que dê uma olhada no pedido de atualização de repositório mencionada.

Se o considerares difícil de trabalhar com a API a `expectTypeOf` e descobrires erros, sempre podes usar a API mais simples `assertType`:

```ts
const answer = 42

assertType<number>(answer)
// @ts-expect-error answer is not a string
assertType<string>(answer)
```

:::tip DICA
Quando usares a sintaxe `@ts-expect-error`, podes querer certificar-te de que cometeste um erro de digitação. Tu podes fazer isto incluindo os teus ficheiros de tipo na opção de configuração [`test.include`](/config/#include), assim a Vitest também *executará* efetivamente estes testes e falhará com `ReferenceError`.

Isto passará, porque espera um erro, mas a palavra “answer” tem um erro de digitação, assim é um erro de falso positivo:

```ts
// @ts-expect-error answer is not a string
assertType<string>(answr) //
```
:::

## Executar a Verificação de Tipo {#run-typechecking}

Adicione este comando à tua seção de `scripts` no `package.json`:

```json
{
  "scripts": {
    "typecheck": "vitest typecheck"
  }
}
```

Agora podes executar a verificação de tipo:

```sh
# npm
npm run typecheck

# yarn
yarn typecheck

# pnpm
pnpm run typecheck
```

A Vitest usa `tsc --noEmit` ou `vue-tsc --noEmit`, dependendo da tua configuração, assim podes remover estes programas da tua contunda.
