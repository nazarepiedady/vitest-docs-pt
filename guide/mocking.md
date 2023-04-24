---
title: Simulação | Guia
---

# Simulação {#mocking}

Quando escreves os testes é apenas uma questão de tempo antes de precisares de criar uma versão de "imitação" de um serviço — interno — ou externo. Isto é normalmente referenciado como **simulação**. A Vitest fornece funções utilitárias para ajudar-te através do sua auxiliar **`vi`**. Tu podes `import { vi } from 'vitest'` ou acessá-la **globalmente** (quando a [configuração global](/config/#globals) estiver **ativada**).

:::warning AVISO
Lembre sempre de limpar ou reiniciar as imitações antes ou depois de cada teste executar para desfazeres as mudanças de estado da imitação entre as execuções! Consulte a documentação de [`mockReset`](/api/mock#mockreset) por mais informações.
:::

Se primeiro quiseres mergulhar de cabeça, consulte a [seção da API](/api/vi) de outro modo continue a leitura para dar um mergulho ainda mais profundo para o mundo da simulação.

## Datas {#dates}

Algumas vezes precisas estar no controlo da data para garantires a consistência quando testas. A Vitest usa o pacote [`@sinonjs/fake-timers`](https://github.com/sinonjs/fake-timers) para manipulação de temporizadores, bem como a data do sistema. Tu podes encontrar mais sobre a API específica em detalhe por [aqui](/api/vi#vi-setsystemtime).

### Exemplo {#dates-example}

```js
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const businessHours = [9, 17]

function purchase() {
  const currentHour = new Date().getHours()
  const [open, close] = businessHours

  if (currentHour > open && currentHour < close)
    return { message: 'Success' }

  return { message: 'Error' }
}

describe('purchasing flow', () => {
  beforeEach(() => {
    // dizer a vitest que usamos tempo simulado
    vi.useFakeTimers()
  })

  afterEach(() => {
    // reiniciar a data depois de cada teste executar
    vi.useRealTimers()
  })

  it('allows purchases within business hours', () => {
    // definir a hora dentro das horas de negócio
    const date = new Date(2000, 1, 1, 13)
    vi.setSystemTime(date)

    // acessar Date.now() resultará na data definida acima
    expect(purchase()).toEqual({ message: 'Success' })
  })

  it('disallows purchases outside of business hours', () => {
    // definir a hora das horas de negócio
    const date = new Date(2000, 1, 1, 19)
    vi.setSystemTime(date)

    // acessar Date.now() resultará na data definida acima
    expect(purchase()).toEqual({ message: 'Error' })
  })
})
```

## Funções {#functions}

A simulação de funções pode ser separada em duas diferentes categorias; *espionagem & imitação*.

Algumas vezes tudo o que precisas é validar se ou não uma função específica foi chamada (e possivelmente quais argumentos foram passados). Nestes casos uma espia seria todo o que precisamos, a qual podes usar diretamente com `vi.spyOn` ([leia mais sobre esta](/api/vi#vi-spyon)).

No entanto as espias apenas podem ajudar-te a **espiar** funções, não são capazes de alterar a implementação destas funções. No caso onde precisamos de criar um versão falsificada (ou simulada) de uma função podemos usar `vi.fn()` ([leia mais sobre esta](/api/vi#vi-fn)).

Nós usamos [Tinyspy](https://github.com/tinylibs/tinyspy) como uma base para as funções de simulação, mas temos o nosso próprio invólucro para tornar isto compatível com a `jest`. Ambas `vi.fn()` e `vi.spyOn()` partilham os mesmos métodos, no entanto apenas retornam resultado se `vi.fn()` for chamável.

### Exemplo {#functions-example}

```js
import { afterEach, describe, expect, it, vi } from 'vitest'

function getLatest(index = messages.items.length - 1) {
  return messages.items[index]
}

const messages = {
  items: [
    { message: 'Simple test message', from: 'Testman' },
    // ...
  ],
  getLatest, // também pode ser um `recuperador ou definidor se suportado`
}

describe('reading messages', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should get the latest message with a spy', () => {
    const spy = vi.spyOn(messages, 'getLatest')
    expect(spy.getMockName()).toEqual('getLatest')

    expect(messages.getLatest()).toEqual(
      messages.items[messages.items.length - 1],
    )

    expect(spy).toHaveBeenCalledTimes(1)

    spy.mockImplementationOnce(() => 'access-restricted')
    expect(messages.getLatest()).toEqual('access-restricted')

    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('should get with a mock', () => {
    const mock = vi.fn().mockImplementation(getLatest)

    expect(mock()).toEqual(messages.items[messages.items.length - 1])
    expect(mock).toHaveBeenCalledTimes(1)

    mock.mockImplementationOnce(() => 'access-restricted')
    expect(mock()).toEqual('access-restricted')

    expect(mock).toHaveBeenCalledTimes(2)

    expect(mock()).toEqual(messages.items[messages.items.length - 1])
    expect(mock).toHaveBeenCalledTimes(3)
  })
})
```

### Mais {#more-functions}

- [Funções de Imitação da Jest](https://jestjs.io/docs/mock-function-api)

## Globais {#globals}

Tu podes imitar variáveis globais que não estão presentes com `jsdom` ou `node` usando a auxiliar [`vi.stubGlobal`](/api/vi#vi-stubglobal). Ela colocará o valor da variável global em um objeto `globalThis`:

```ts
import { vi } from 'vitest'

const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}))

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

// agora podes acessá-la como `IntersectionObserver` ou `window.IntersectionObserver`
```

## Módulos {#modules}

Os módulos de imitação observam bibliotecas de terceiros, que são invocados algum outro código, permitindo-te testar argumentos, saída ou mesmo redeclarar sua implementação.

Consulte a [seção da API de `vi.mock()`](/api/vi#vi-mock) para uma descrição da API detalha em profundidade.

### Algoritmo de Simulação Automática {#automocking-algorithm}

Se o teu código estiver importando um módulo simulado, sem qualquer ficheiro `__mocks__` associado ou `factory` para este módulo, a Vitest imitará o próprio módulo invocando-o e simulando cada exportação.

Os seguintes princípios aplicam-se:

* Todos os arranjos serão esvaziados
* Todos primitivos e coleções continuarão na mesma
* Todos os objetos serão profundamente clonados
* Todas as instâncias de classes e seus protótipos serão profundamente clonados

### Exemple {#module-example}

```js
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Client } from 'pg'
import { failure, success } from './handlers.js'

// manipuladores
export function success(data) {}
export function failure(data) {}

// get todos
export async function getTodos(event, context) {
  const client = new Client({
    // ...clientOptions
  })

  await client.connect()

  try {
    const result = await client.query('SELECT * FROM todos;')

    client.end()

    return success({
      message: `${result.rowCount} item(s) returned`,
      data: result.rows,
      status: true,
    })
  }
  catch (e) {
    console.error(e.stack)

    client.end()

    return failure({ message: e, status: false })
  }
}

vi.mock('pg', () => {
  const Client = vi.fn()
  Client.prototype.connect = vi.fn()
  Client.prototype.query = vi.fn()
  Client.prototype.end = vi.fn()

  return { Client }
})

vi.mock('./handlers', () => {
  return {
    success: vi.fn(),
    failure: vi.fn(),
  }
})

describe('get a list of todo items', () => {
  let client

  beforeEach(() => {
    client = new Client()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return items successfully', async () => {
    client.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })

    await getTodos()

    expect(client.connect).toBeCalledTimes(1)
    expect(client.query).toBeCalledWith('SELECT * FROM todos;')
    expect(client.end).toBeCalledTimes(1)

    expect(success).toBeCalledWith({
      message: '0 item(s) returned',
      data: [],
      status: true,
    })
  })

  it('should throw an error', async () => {
    const mError = new Error('Unable to retrieve rows')
    client.query.mockRejectedValueOnce(mError)

    await getTodos()

    expect(client.connect).toBeCalledTimes(1)
    expect(client.query).toBeCalledWith('SELECT * FROM todos;')
    expect(client.end).toBeCalledTimes(1)
    expect(failure).toBeCalledWith({ message: mError, status: false })
  })
})
```

## Requisições {#requests}

Uma vez que a Vitest executa na Node, simular requisições de rede é complicado; As APIs da Web não estão disponíveis, assim precisamos de algo que imitará o comportamento da rede por nós. Nós recomendados o [Operário de Serviço de Imitação](https://mswjs.io/) para levar isto a cabo. Ele permitir-te-á imitar ambas requisições de rede `REST` e `GraphQL`, e é agnóstica de abstração.

Operário de Serviço de Imitação (MSW) funciona intercetando as requisições que os teus testes fazem, permitindo-te usá-lo sem mudar nada do código da tua aplicação. No navegador, este usa [API de Operário de Serviço](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API). Na Node.js, e para a Vitest, usa [`node-request-interceptor`](https://mswjs.io/docs/api/setup-server#operation). Para saber mais sore MSW, leia a sua [introdução](https://mswjs.io/docs/).


### Configuração {#configuration}

Tu podes usá-lo como abaixo no teu [ficheiro de configuração](/config/#setupfiles):

```js
import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import { graphql, rest } from 'msw'

const posts = [
  {
    userId: 1,
    id: 1,
    title: 'first post title',
    body: 'first post body',
  },
  // ...
]

export const restHandlers = [
  rest.get('https://rest-endpoint.example/path/to/posts', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(posts))
  }),
]

const graphqlHandlers = [
  graphql.query('https://graphql-endpoint.example/api/v1/posts', (req, res, ctx) => {
    return res(ctx.data(posts))
  }),
]

const server = setupServer(...restHandlers, ...graphqlHandlers)

// Iniciar o servidor antes de todos os testes
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

//  Close server after all tests
afterAll(() => server.close())

// Reiniciar os manipuladores depois de cada teste
// `importante para isolação de teste`
afterEach(() => server.resetHandlers())
```

> Configurar o servidor com `onUnhandleRequest: 'error'` assegura que um erro é lançado sempre que existir uma requisição que não tem um manipulador de requisição correspondente.

### Exemple {#requests-example}

Nós temos um exemplo completo funcionando que usa MSW: [Testagem de React com MSW](https://github.com/vitest-dev/vitest/tree/main/examples/react-testing-lib-msw).

### Mais {#more-requests}

Existe muito mais para MSW. Tu podes acessar os cookies e os parâmetros de consulta, definir respostas de erro de simulação, e muito mais! Para veres todo o que podes fazer com MSW, leia a [sua documentação](https://mswjs.io/docs/recipes).

## Temporizadores {#timers}

Sempre que testamos código que envolve pausas ou intervalos, ao invés de ter os nossos testes de esperar ou pausar. Nós também podemos acelerar os nossos testes usando temporizadores de "falsificação" simulando chamadas para `setTimeout` e `setInterval`.

Consulte a [seção da API de `vi.useFakeTimers`](/api/vi#vi-usefaketimers) por uma descrição da API detalhada em profundidade.

### Exemplo {#timers-example}

```js
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

function executeAfterTwoHours(func) {
  setTimeout(func, 1000 * 60 * 60 * 2) // 2 horas
}

function executeEveryMinute(func) {
  setInterval(func, 1000 * 60) // 1 minuto
}

const mock = vi.fn(() => console.log('executed'))

describe('delayed execution', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('should execute the function', () => {
    executeAfterTwoHours(mock)
    vi.runAllTimers()
    expect(mock).toHaveBeenCalledTimes(1)
  })
  it('should not execute the function', () => {
    executeAfterTwoHours(mock)
    // avançar por 2 milissegundos não acionará a função
    vi.advanceTimersByTime(2)
    expect(mock).not.toHaveBeenCalled()
  })
  it('should execute every minute', () => {
    executeEveryMinute(mock)
    vi.advanceTimersToNextTimer()
    expect(mock).toHaveBeenCalledTimes(1)
    vi.advanceTimersToNextTimer()
    expect(mock).toHaveBeenCalledTimes(2)
  })
})
```

## Folha de Consultas {#cheat-sheet}

:::info INFORMAÇÃO
A `vi` nos exemplos abaixo é importada diretamente de `vitest`. Tu podes também usá-la globalmente, se definires `globals` para `true` na tua [configuração](/config/).
:::

Eu quero...

- Espiar um `method`:

```ts
const instance = new SomeClass()
vi.spyOn(instance, 'method')
```

- Simular variáveis exportadas:

```js
// some-path.js
export const getter = 'variable'
```
```ts
// some-path.test.ts
import * as exports from './some-path.js'

vi.spyOn(exports, 'getter', 'get').mockReturnValue('mocked')
```

- Simular função exportada:

Exemplo com `vi.mock`:

```ts
// ./some-path.js
export function method() {}
```
```ts
import { method } from './some-path.js'

vi.mock('./some-path.js', () => ({
  method: vi.fn()
}))
```

:::warning AVISO
Não te esqueças que a chamada de `vi.mock` é içada para início do ficheiro. **Não** coloque as chamadas de `vi.mock` dentro de `beforeEach`, apenas uma destas simulará de fato um módulo.
:::

Exemplo com `vi.spyOn`:

```ts
import * as exports from './some-path.js'

vi.spyOn(exports, 'method').mockImplementation(() => {})
```

- Simular implementação de classe exportada

Exemplo com `vi.mock` e o protótipo:

```ts
// some-path.ts
export class SomeClass {}
```
```ts
import { SomeClass } from './some-path.js'

vi.mock('./some-path.js', () => {
  const SomeClass = vi.fn()
  SomeClass.prototype.someMethod = vi.fn()
  return { SomeClass }
})
// SomeClass.mock.instances terá SomeClass
```

Exemplo com `vi.mock` e valor de retorno:

```ts
import { SomeClass } from './some-path.js'

vi.mock('./some-path.js', () => {
  const SomeClass = vi.fn(() => ({
    someMethod: vi.fn()
  }))
  return { SomeClass }
})
// SomeClass.mock.returns terá objeto retornado
```

Exemplo com `vi.spyOn`:

```ts
import * as exports from './some-path.js'

vi.spyOn(exports, 'SomeClass').mockImplementation(() => {
  // whatever suites you from first two examples
})
```

- Espiar um objeto retornado duma função

Exemplo usando o armazenamento de consulta imediata:

```ts
// some-path.ts
export function useObject() {
  return { method: () => true }
}
```

```ts
// useObject.js
import { useObject } from './some-path.js'

const obj = useObject()
obj.method()
```

```ts
// useObject.test.js
import { useObject } from './some-path.js'

vi.mock('./some-path.js', () => {
  let _cache
  const useObject = () => {
    if (!_cache) {
      _cache = {
        method: vi.fn(),
      }
    }
    // agora toda vez que useObject() for chamado
    // retornará a mesma referência de objeto
    return _cache
  }
  return { useObject }
})

const obj = useObject()
// obj.method foi chamado dentro de some-path
expect(obj.method).toHaveBeenCalled()
```

- Simular parte dum módulo

```ts
import { mocked, original } from './some-path.js'

vi.mock('./some-path.js', async () => {
  const mod = await vi.importActual<typeof import('./some-path.js')>('./some-path.js')
  return {
    ...mod,
    mocked: vi.fn()
  }
})
original() // tem comportamento original
mocked() // é uma função espia
```

- Simular a data atual

Para simular o tempo do `Date`, podes usar a função auxiliar `vi.setSystemTime`. Este valor **não** reiniciará automaticamente entre testes diferentes.

Cuidado que usar `vi.useFakeTimers` também muda o tempo do `Date`:

```ts
const mockDate = new Date(2022, 0, 1)
vi.setSystemTime(mockDate)
const now = new Date()
expect(now.valueOf()).toBe(mockDate.valueOf())
// reiniciar o tempo simulado
vi.useRealTimers()
```

- Simular variável global

Tu podes definir variável global atribuindo um valor para `globalThis` ou usando a auxiliar [`vi.stubGlobal`](/api/vi#vi-stubglobal). Quando estiveres a usar `vi.stubGlobal`, este **não** reiniciará automaticamente entre testes diferentes, a menos que atives a opção de configuração [`unstubGlobals`](/config/#unstubglobals) ou chames [`vi.unstubAllGlobals`](/api/vi#vi-unstuballglobals):

```ts
vi.stubGlobal('__VERSION__', '1.0.0')
expect(__VERSION__).toBe('1.0.0')
```

- Simular `import.meta.env`

Para mudar a variável ambiental, podes apenas atribuir um novo valor para ela. Este valor **não** reiniciará automaticamente entre testes diferentes:

```ts
import { beforeEach, expect, it } from 'vitest'

// tu podes reiniciá-lo no gatilho beforeEach manualmente
const originalViteEnv = import.meta.env.VITE_ENV

beforeEach(() => {
  import.meta.env.VITE_ENV = originalViteEnv
})

it('changes value', () => {
  import.meta.env.VITE_ENV = 'staging'
  expect(import.meta.env.VITE_ENV).toBe('staging')
})
```

Se quiseres reiniciar o valor automaticamente, podes usar a auxiliar `vi.stubEnv` com a opção de configuração [`unstubEnvs`](/config/#unstubEnvs) ativada (ou chamar [`vi.unstubAllEnvs`](/api/vi#vi-unstuballenvs) manualmente no gatilho `beforeEach`):

```ts
import { expect, it, vi } from 'vitest'

// antes de executar os testes "VITE_ENV" é "test"
import.meta.env.VITE_ENV === 'test'

it('changes value', () => {
  vi.stubEnv('VITE_ENV', 'staging')
  expect(import.meta.env.VITE_ENV).toBe('staging')
})

it('the value is restored before running an other test', () => {
  expect(import.meta.env.VITE_ENV).toBe('test')
})
```

```ts
// vitest.config.ts
export default {
  test: {
    unstubAllEnvs: true,
  }
}
```
