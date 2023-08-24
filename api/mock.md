# Funções Simuladas {#mock-functions}

Nós podemos criar uma função espionagem (simulada) para rastrear a sua execução com o método `vi.fn`. Se quisermos rastrear um método num objeto já criado, podemos usar o método `vi.spyOn`:

```js
import { vi } from 'vitest'

const fn = vi.fn()
fn('hello world')
fn.mock.calls[0] === ['hello world']

const market = {
  getApples: () => 100
}

const getApplesSpy = vi.spyOn(market, 'getApples')
market.getApples()
getApplesSpy.mock.calls.length === 1
```

Nós devemos usar asserções de espionagem (por exemplo, [`toHaveBeenCalled`](/api/expect#tohavebeencalled)) na [`expect`](/api/expect) para asserir o resultado da espionagem. Esta referência de API descreve as propriedades e métodos disponíveis para manipular o comportamento de espionagem.

## `getMockName` {#getmockname}

- **Tipo:** `() => string`

  Usamos-o para retornar o nome dado ao simulado com o método `.mockName(name)`.

## `mockClear` {#mockclear}

- **Tipo:** `() => MockInstance`

  Limpa toda informação sobre todas as chamadas. Depois de chamá-la, [`spy.mock.calls`](#mock-calls), [`spy.mock.results`](#mock-results) retornarão vetores vazios. É útil se precisarmos de limpar a espia entre diferentes asserções.

  Se quisermos que este método seja chamado automaticamente antes de cada teste, podemos ativar a definição [`clearMocks`](/config/#clearmocks) na configuração.

## `mockName` {#mockname}

- **Tipo:** `(name: string) => MockInstance`

  Define o nome simulado interno. Úteis para ver qual simulado reprovou a asserção.

## `mockImplementation` {#mockimplementation}

- **Tipo:** `(fn: Function) => MockInstance`

  Aceita uma função que será usada como uma implementação do simulado.

  Por exemplo:

  ```ts
  const mockFn = vi.fn().mockImplementation(apples => apples + 1)
  // ou: vi.fn(apples => apples + 1);

  const NelliesBucket = mockFn(0)
  const BobsBucket = mockFn(1)

  NelliesBucket === 1 // true
  BobsBucket === 2 // true

  mockFn.mock.calls[0][0] === 0 // true
  mockFn.mock.calls[1][0] === 1 // true
  ```

## `mockImplementationOnce` {#mockimplementationonce}

- **Tipo:** `(fn: Function) => MockInstance`

  Aceita uma função que será usada como uma implementação do simulado para uma chamada à função simulada. Pode ser encadeada para que várias chamadas de função produzam diferentes resultados.

  ```ts
  const myMockFn = vi
    .fn()
    .mockImplementationOnce(() => true)
    .mockImplementationOnce(() => false)

  myMockFn() // true
  myMockFn() // false
  ```

  Quando a função simulada esgotar as implementações, invocará a implementação padrão que foi definida com `vi.fn(() => defaultValue)` ou `.mockImplementation(() => defaultValue)` se forem chamadas:

  ```ts
  const myMockFn = vi
    .fn(() => 'default')
    .mockImplementationOnce(() => 'first call')
    .mockImplementationOnce(() => 'second call')

  // 'first call', 'second call', 'default', 'default'
  console.log(myMockFn(), myMockFn(), myMockFn(), myMockFn())
  ```

## `withImplementation` {#withimplementation}

- **Tipo:** `(fn: Function, callback: () => void) => MockInstance`
- **Tipo:** `(fn: Function, callback: () => Promise<unknown>) => Promise<MockInstance>`

  Sobrepõe a implementação simulada original temporariamente enquanto a função de resposta estiver sendo executada.

  ```js
  const myMockFn = vi.fn(() => 'original')

  myMockFn.withImplementation(() => 'temp', () => {
    myMockFn() // 'temp'
  })

  myMockFn() // 'original'
  ```

  Pode ser usada com uma função de resposta assíncrona. Este método tem de ser aguardado para usar a implementação original mais tarde.

  ```ts
  test('async callback', () => {
    const myMockFn = vi.fn(() => 'original')

    // Nós aguardamos esta chamada já que
    // a função de resposta é assíncrona
    await myMockFn.withImplementation(
      () => 'temp',
      async () => {
        myMockFn() // 'temp'
      },
    )

    myMockFn() // 'original'
  })
  ```

  Além disto, tem prioridade em relação a [`mockImplementationOnce`](#mockimplementationonce).

## `mockRejectedValue` {#mockrejectedvalue}

- **Tipo:** `(value: any) => MockInstance`

  Aceita um erro que será rejeitado, quando a função assíncrona for chamada.

  ```ts
  const asyncMock = vi.fn().mockRejectedValue(new Error('Async error'))

  await asyncMock() // throws "Async error"
  ```

## `mockRejectedValueOnce` {#mockrejectedvalueonce}

- **Tipo:** `(value: any) => MockInstance`

  Aceita um valor que será rejeitado para uma chamada à função simulada. Se encadeada, todas as chamadas sucessivas rejeitarão o valor passado.

  ```ts
  const asyncMock = vi
    .fn()
    .mockResolvedValueOnce('first call')
    .mockRejectedValueOnce(new Error('Async error'))

  await asyncMock() // first call
  await asyncMock() // throws "Async error"
  ```

## `mockReset` {#mockreset}

- **Tipo:** `() => MockInstance`

  Faz o que `mockClear` faz e torna a implementação interna uma função vazia (retornando `undefined`, quando invocada). Isto é úil quando queremos reiniciar completamente um simulado de volta ao seu estado inicial.

  Se quisermos que este método seja chamado automaticamente antes de cada teste, podemos ativar a definição [`mockReset`](/config/#mockreset) na configuração.

## `mockRestore` {#mockrestore}

- **Tipo:** `() => MockInstance`

  Faz o que `mockReset` faz e restaura a implementação interna à função original.

  Nota que restaurar o simulado a partir da `vi.fn()` definirá a implementação à uma função vazia que retorna `undefined`. Restaurar uma `vi.fn(impl)` restaurará a implementação à `impl`.

  Se quisermos que este método seja chamado automaticamente antes de cada teste, podemos ativar a definição [`restoreMocks`](/config/#restoremocks) na configuração.

## `mockResolvedValue` {#mockresolvedvalue}

- **Tipo:** `(value: any) => MockInstance`

  Aceita um valor que será resolvido, quando a função assíncrona ser chamada.

  ```ts
  const asyncMock = vi.fn().mockResolvedValue(43)

  await asyncMock() // 43
  ```

## `mockResolvedValueOnce` {#mockresolvedvalueonce}

- **Tipo:** `(value: any) => MockInstance`

  Aceita um valor que será resolvida para uma chamada à função simulada. Se encadeada, todas as chamadas sucessivas resolverão o valor passado.

  ```ts
  const asyncMock = vi
    .fn()
    .mockResolvedValue('default')
    .mockResolvedValueOnce('first call')
    .mockResolvedValueOnce('second call')

  await asyncMock() // first call
  await asyncMock() // second call
  await asyncMock() // default
  await asyncMock() // default
  ```

## `mockReturnThis` {#mockreturnthis}

- **Tipo:** `() => MockInstance`

  Define a implementação interna para retornar o contexto `this`.

## `mockReturnValue` {#mockreturnvalue}

- **Tipo:** `(value: any) => MockInstance`

  Aceita um valor que será retornado sempre que a função simulada for chamada.

  ```ts
  const mock = vi.fn()
  mock.mockReturnValue(42)
  mock() // 42
  mock.mockReturnValue(43)
  mock() // 43
  ```

## `mockReturnValueOnce` {#mockreturnvalueonce}

- **Tipo:** `(value: any) => MockInstance`

  Aceita um valor que será retornada para uma chamada à função simulado. Se encadeada, todas as chamadas sucessivas retornarão o valor passado. Quando não existirem mais valores de `mockReturnValueOnce` a usar, chama uma função especificada pela `mockImplementation` ou outros métodos de `mockReturn*`.

  ```ts
  const myMockFn = vi
    .fn()
    .mockReturnValue('default')
    .mockReturnValueOnce('first call')
    .mockReturnValueOnce('second call')

  // 'first call', 'second call', 'default', 'default'
  console.log(myMockFn(), myMockFn(), myMockFn(), myMockFn())
  ```

## `mock.calls` {#mock-calls}

Isto é um vetor contendo todos os argumentos para cada chamada. Um item do vetor é o argumento daquela chamada.

```js
const fn = vi.fn()

fn('arg1', 'arg2')
fn('arg3', 'arg4')

fn.mock.calls === [
  ['arg1', 'arg2'], // first call
  ['arg3', 'arg4'], // second call
]
```

## `mock.lastCall` {#mock-lastCall}

Isto contém os argumentos da última chamada. Se espia não fosse chamada, retornará `undefined`.

## `mock.results` {#mock-results}

Isto é um vetor contendo todos os valores, que foram retornados a partir da função. Um item do vetor é um objeto com as propriedades `type` e `value`. Os tipos disponíveis são:

- `'return'` - função retornou sem lançamento.
- `'throw'` - função lançou um valor.

A propriedade `value` contém o valor retornado ou erro lançado.

```js
const fn = vi.fn()

const result = fn() // 'result' retornado

try {
  fn() // threw Error
}
catch {}

fn.mock.results === [
  // first result
  {
    type: 'return',
    value: 'result',
  },
  // last result
  {
    type: 'throw',
    value: Error,
  },
]
```

## `mock.instances` {#mock-instances}

Isto é um vetor contendo todas as instâncias que foram instanciadas quando o simulado foi chamado com uma palavra-chave `new`. Nota, este é um contexto verdadeiro da função, não um valor de retorno.

:::warning AVISO
Se o simulado foi instanciado com `new MyClass()`, então `mock.instances` será um vetor com um valor:

```js
const MyClass = vi.fn()
const a = new MyClass()

MyClass.mock.instances[0] === a
```

Se retornarmos um valor a partir do construtor, não estará no vetor `instances`, mas dentro de `results`:

```js
const Spy = vi.fn(() => ({ method: vi.fn() }))
const a = new Spy()

Spy.mock.instances[0] !== a
Spy.mock.results[0] === a
```
:::
