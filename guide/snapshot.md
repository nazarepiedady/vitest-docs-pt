---
title: Fotografia | Guia
---

# Fotografia {#snapshot}

<CourseLink href="https://vueschool.io/lessons/snapshots-in-vitest?friend=vueuse">
  Saiba mais sobre Fotografia na Vue School
</CourseLink>

Testes de fotografia são uma ferramenta muito útil sempre quiseres ter a certeza de que a saída das tuas funções não mudam inesperadamente.

Quando usas fotografia, a Vitest tirará uma fotografia do dado valor, depois compara-o com um ficheiro de fotografia de referência armazenado ao lado do teste. O teste falhará se as duas fotografias não condizerem: ou a mudança é inesperada, ou a fotografia de referência precisa de ser atualizada para a nova versão do resultado.

## Usar Fotografias {#use-snapshots}

Para fotografares um valor, podes usar a [`toMatchSnapshot()`](/api/expect#tomatchsnapshot) da API `expect()`:

```ts
import { expect, it } from 'vitest'

it('toUpperCase', () => {
  const result = toUpperCase('foobar')
  expect(result).toMatchSnapshot()
})
```

A primeira vez que este teste for executado, a Vitest cria um ficheiro de fotografia que parece-se com este:

```js
// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html

exports['toUpperCase 1'] = '"FOOBAR"'
```

O artefacto de fotografia deveria ser consolidado junto das mudanças de código, e revisado como parte do teu processo de revisão de código. Na execução do teste subsequente, a Vitest comparará a saída apresentada com a fotografia anterior. Se condizerem, o teste passará. Se não condizerem, ou o executor de teste encontrou um erro de programação no teu código que deveria ser corregido, ou a implementação mudou e a fotografia precisa de ser atualizada.

:::warning AVISO
Quando usas Fotografias com testes simultâneos assíncronos, o `expect` do [Contexto de Teste](/guide/test-context) Local deve ser usado para garantir que o teste correto foi detetado.
:::

## Fotografias Em Linha {#inline-snapshots}

Similarmente, podes usar [`toMatchInlineSnapshot()`](/api/expect#tomatchinlinesnapshot) para armazenar a fotografia em linha dentro do ficheiro de teste:

```ts
import { expect, it } from 'vitest'

it('toUpperCase', () => {
  const result = toUpperCase('foobar')
  expect(result).toMatchInlineSnapshot()
})
```

No lugar de criar um ficheiro de fotografia, a Vitest modificará o diretório do ficheiro de teste para atualizar a fotografia como uma sequência de caracteres:

```ts
import { expect, it } from 'vitest'

it('toUpperCase', () => {
  const result = toUpperCase('foobar')
  expect(result).toMatchInlineSnapshot('"FOOBAR"')
})
```

Isto permite-te ver a saída esperada diretamente sem saltar através dos diferentes ficheiros.

:::warning AVISO
Quando usas Fotografias com testes simultâneos assíncronos, o `expect` do [Contexto de Teste](/guide/test-context) Local deve ser usado para garantir que o teste correto foi detetado.
:::

## Atualizando as Fotografias {#updating-snapshots}

Quando o valor recebido não condizer com a fotografia, o teste falha e mostra-te a diferença entre eles. Quando a mudança da fotografia é esperada, talvez queiras atualizar a fotografia a partir do estado atual.

No modo de observação, podes pressionar a tecla  `u` no terminal para atualizar a fotografia falhada diretamente.

Ou podes usar a opção `--update` ou `-u` na interface da linha de comando para fazer a Vitest atualizar as fotografias:

```bash
vitest -u
```

## Fotografias de Ficheiro {#file-snapshots}

Quando chamamos `toMatchSnapshot()`, armazenamos todas as fotografias num ficheiro de foto formatado. Isto significa que precisamos de escapar alguns caracteres (nomeadamente as aspas duplas `"` e `\``) na sequência de caracteres da fotografia. Entretanto, podes perder o destacamento de sintaxe para o conteúdo da fotografia (se estiverem em alguma linguagem).

Para melhorar este caso, introduzimos [`toMatchFileSnapshot()`](/api/expect#tomatchfilesnapshot) para fotografar explicitamente num ficheiro. Isto permite-te atribuir qualquer extensão de ficheiro ao ficheiro da fotografia, e torná-los mais legíveis:

```ts
import { expect, it } from 'vitest'

it('render basic', async () => {
  const result = renderHTML(h('div', { class: 'foo' }))
  await expect(result).toMatchFileSnapshot('./test/basic.output.html')
})
```

Ela comparará com o conteúdo de `./test/basic.output.html`. E pode ser escrito de volta com a opção `--update`.

## Fotografias de Imagem {#image-snapshots}

É também possível fotografar imagens usando [`jest-image-snapshot`](https://github.com/americanexpress/jest-image-snapshot):

```bash
npm i -D jest-image-snapshot
```

```ts
test('image snapshot', () => {
  expect(readFileSync('./test/stubs/input-image.png'))
    .toMatchImageSnapshot()
})
```

Tu podes saber mais no exemplo [`examples/image-snapshot`](https://github.com/vitest-dev/vitest/blob/main/examples/image-snapshot).

## Serializador Personalizado {#custom-serializer}

Tu podes adicionar a tua própria lógica para alterar como as tuas fotografias são serializadas. Tal como a Jest, a Vitest tem serializadores padrão para os tipos de JavaScript embutidos, elementos de HTML, ImmutableJS e para os elementos de React.

Exemplificar o módulo serializador:

```ts
expect.addSnapshotSerializer({
  serialize(val, config, indentation, depth, refs, printer) {
    // `printer` é uma função que serializa um valor usando extensões existentes.
    return `Pretty foo: ${printer(val.foo)}`
  },
  test(val) {
    return val && Object.prototype.hasOwnProperty.call(val, 'foo')
  },
})
```

Depois de adicionar um teste como este:

```ts
test('foo snapshot test', () => {
  const bar = {
    foo: {
      x: 1,
      y: 2,
    },
  }

  expect(bar).toMatchSnapshot()
})
```

Tu receberás a seguinte fotografia:

```
Pretty foo: Object {
  "x": 1,
  "y": 2,
}
```

Nós estamos a usar a `pretty-format` da Jest para serializar as fotografia. Tu podes ler mais sobre isto aqui: [pretty-format](https://github.com/facebook/jest/blob/main/packages/pretty-format/README.md#serialize).

## Diferenciar da Jest {#difference-from-jest}

A Vitest fornece uma funcionalidade de fotografia quase compatível com as de [Jest](https://jestjs.io/docs/snapshot-testing) com algumas exceções:

#### 1. Cabeçalho de comentário no ficheiro de fotografia é diferente {#comment-header-in-the-snapshot-file-is-different}

```diff
- // Jest Snapshot v1, https://goo.gl/fbAQLP
+ // Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
```

Isto de fato não afeta a funcionalidade mas pode afetar a tua diferença de consolidação quando migrares da Jest.

#### 2. `printBasicPrototype` é predefinido para `false` {#printbasicprototype-is-default-to-false}

Ambas fotografias de Jest e Vitest são alimentadas pelo [`pretty-format`](https://github.com/facebook/jest/blob/main/packages/pretty-format). Na Vitest definimos o valor padrão de `printBasicPrototype` para `false` para fornecer uma saída de fotografia mais clara, enquanto na Jest <29.0.0 é `true` por padrão:

```ts
import { expect, test } from 'vitest'

test('snapshot', () => {
  const bar = [
    {
      foo: 'bar',
    },
  ]

  // na Jest
  expect(bar).toMatchInlineSnapshot(`
    Array [
      Object {
        "foo": "bar",
      },
    ]
  `)

  // na Vitest
  expect(bar).toMatchInlineSnapshot(`
    [
      {
        "foo": "bar",
      },
    ]
  `)
})
```

Nós acreditamos que isto é um padrão mais razoável para legibilidade e toda experiência de programação. Se ainda preferires o comportamento da Jest, podes mudar a tua configuração:

```ts
// vitest.config.js
export default defineConfig({
  test: {
    snapshotFormat: {
      printBasicPrototype: true
    }
  }
})
```

#### 3. O sinal de maior do que `>` é usado como um separador no lugar dos dois pontos `:` para mensagens personalizados {#chevron-is-used-as-a-separator-instead-of-colon-for-custom-messages}

A Vitest usa o sinal de maior do que `>` como um separador no lugar dos dois pontos `:` para legibilidade, quando uma mensagem personalizadas é passada durante a criação dum ficheiro de fotografia.

Para o seguinte código de teste de exemplo:

```js
test('toThrowErrorMatchingSnapshot', () => {
  expect(() => {
    throw new Error('error')
  }).toThrowErrorMatchingSnapshot('hint')
})
```

Na Jest, a fotografia seria:

```console
exports[`toThrowErrorMatchingSnapshot: hint 1`] = `"error"`;
```

Na Vitest, a fotografia equivalente será:

```console
exports[`toThrowErrorMatchingSnapshot > hint 1`] = `"error"`;
```
