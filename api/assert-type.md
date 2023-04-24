# assertType {#asserttype}

  - **Tipo:** `<T>(value: T): void`

  Tu podes usar esta função como uma alternativa ao [`expectTypeOf`](/api/expect-typeof) para afirmar facilmente que o tipo do argumento é igual ao genérico fornecido:


  ```ts
  import { assertType } from 'vitest'

  function concat(a: string, b: string): string
  function concat(a: number, b: number): number
  function concat(a: string | number, b: string | number): string | number

  assertType<string>(concat('a', 'b'))
  assertType<number>(concat(1, 2))
  // @ts-expect-error wrong types
  assertType(concat('a', 2))
  ```
