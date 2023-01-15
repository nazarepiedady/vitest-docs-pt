---
title: Mocking | Guide
---

# Mocking

When writing tests it's only a matter of time before you need to create a "fake" version of an internal — or external — service. This is commonly referred to as **mocking**. Vitest provides utility functions to help you out through its **vi** helper. You can `import { vi } from 'vitest'` or access it **globally** (when [global configuration](/config/#globals) is **enabled**).

::: warning
Always remember to clear or restore mocks before or after each test run to undo mock state changes between runs! See [`mockReset`](/api/#mockreset) docs for more info.
:::

If you wanna dive in head first, check out the [API section](/api/#vi) otherwise keep reading to take a deeper dive into the world of mocking.

## Dates

Sometimes you need to be in control of the date to ensure consistency when testing. Vitest uses [`@sinonjs/fake-timers`](https://github.com/sinonjs/fake-timers) package for manipulating timers, as well as system date. You can find more about the specific API in detail [here](/api/#vi-setsystemtime).

### Example

```js
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const businessHours = [9, 17]

const purchase = () => {
  const currentHour = new Date().getHours()
  const [open, close] = businessHours

  if (currentHour > open && currentHour < close)
    return { message: 'Success' }

  return { message: 'Error' }
}

describe('purchasing flow', () => {
  beforeEach(() => {
    // tell vitest we use mocked time
    vi.useFakeTimers()
  })

  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers()
  })

  it('allows purchases within business hours', () => {
    // set hour within business hours
    const date = new Date(2000, 1, 1, 13)
    vi.setSystemTime(date)

    // access Date.now() will result in the date set above
    expect(purchase()).toEqual({ message: 'Success' })
  })

  it('disallows purchases outside of business hours', () => {
    // set hour outside business hours
    const date = new Date(2000, 1, 1, 19)
    vi.setSystemTime(date)

    // access Date.now() will result in the date set above
    expect(purchase()).toEqual({ message: 'Error' })
  })
})
```

## Functions

Mocking functions can be split up into two different categories; *spying & mocking*.

Sometimes all you need is to validate whether or not a specific function has been called (and possibly which arguments were passed). In these cases a spy would be all we need which you can use directly with `vi.spyOn()` ([read more here](/api/#vi-spyon)).

However spies can only help you **spy** on functions, they are not able to alter the implementation of those functions. In the case where we do need to create a fake (or mocked) version of a function we can  use `vi.fn()` ([read more here](/api/#vi-fn)).

We use [Tinyspy](https://github.com/tinylibs/tinyspy) as a base for mocking functions, but we have our own wrapper to make it `jest` compatible. Both `vi.fn()` and `vi.spyOn()` share the same methods, however only the return result of `vi.fn()` is callable.

### Example

```js
import { afterEach, describe, expect, it, vi } from 'vitest'

const getLatest = (index = messages.items.length - 1) => messages.items[index]

const messages = {
  items: [
    { message: 'Simple test message', from: 'Testman' },
    // ...
  ],
  getLatest, // can also be a `getter or setter if supported`
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

### More

- [Jest's Mock Functions](https://jestjs.io/docs/mock-function-api)

## Globals

You can mock global variables that are not present with `jsdom` or `node` by using [`vi.stubGlobal`](/api/#vi-stubglobal) helper. It will put the value of the global variable into a `globalThis` object.

```ts
import { vi } from 'vitest'

const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}))

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

// now you can access it as `IntersectionObserver` or `window.IntersectionObserver`
```

## Modules

Mock modules observe third-party-libraries, that are invoked in some other code, allowing you to test arguments, output or even redeclare its implementation.

See the [`vi.mock()` api section](/api/#vi-mock) for a more in-depth detailed API description.

### Automocking algorithm

If your code is importing a mocked module, without any associated `__mocks__` file or `factory` for this module, Vitest will mock the module itself by invoking it and mocking every export.

The following principles apply
* All arrays will be emptied
* All primitives and collections will stay the same
* All objects will be deeply cloned
* All instances of classes and their prototypes will be deeply cloned

### Example

```js
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Client } from 'pg'
import { failure, success } from './handlers'

// handlers
export function success(data) {}
export function failure(data) {}

// get todos
export const getTodos = async (event, context) => {
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

## Requests

Because Vitest runs in Node, mocking network requests is tricky; web APIs are not available, so we need something that will mimic network behavior for us. We recommend [Mock Service Worker](https://mswjs.io/) to accomplish this. It will let you mock both `REST` and `GraphQL` network requests, and is framework agnostic.

Mock Service Worker (MSW) works by intercepting the requests your tests make, allowing you to use it without changing any of your application code. In-browser, this uses the [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API). In Node.js, and for Vitest, it uses [node-request-interceptor](https://mswjs.io/docs/api/setup-server#operation). To learn more about MSW, read their [introduction](https://mswjs.io/docs/)


### Configuration

You can use it like below in your [setup file](/config/#setupfiles)
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

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

//  Close server after all tests
afterAll(() => server.close())

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers())
```

> Configuring the server with `onUnhandleRequest: 'error'` ensures that an error is thrown whenever there is a request that does not have a corresponding request handler.

### Example

We have a full working example which uses MSW: [React Testing with MSW](https://github.com/vitest-dev/vitest/tree/main/examples/react-testing-lib-msw).

### More
There is much more to MSW. You can access cookies and query parameters, define mock error responses, and much more! To see all you can do with MSW, read [their documentation](https://mswjs.io/docs/recipes).

## Timers

Whenever we test code that involves timeouts or intervals, instead of having our tests wait it out or timeout. We can speed up our tests by using "fake" timers by mocking calls to `setTimeout` and `setInterval`, too.

See the [`vi.usefaketimers` api section](/api/#vi-usefaketimers) for a more in depth detailed API description.

### Example

```js
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const executeAfterTwoHours = (func) => {
  setTimeout(func, 1000 * 60 * 60 * 2) // 2 hours
}

const executeEveryMinute = (func) => {
  setInterval(func, 1000 * 60) // 1 minute
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
    // advancing by 2ms won't trigger the func
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

## Cheat Sheet

:::info
`vi` in the examples below is imported directly from `vitest`. You can also use it globally, if you set `globals` to `true` in your [config](/config/).
:::

I want to…

- Spy on a `method`

```ts
const instance = new SomeClass()
vi.spyOn(instance, 'method')
```

- Mock exported variables
```ts
// some-path.ts
export const getter = 'variable'
```
```ts
// some-path.test.ts
import * as exports from 'some-path'
vi.spyOn(exports, 'getter', 'get').mockReturnValue('mocked')
```

- Mock exported function

Example with `vi.mock`:
```ts
// ./some-path.ts
export function method() {}
```
```ts
import { method } from './some-path.ts'
vi.mock('./some-path.ts', () => ({
  method: vi.fn()
}))
```

::: warning
Don't forget that `vi.mock` call is hoisted to top of the file. **Do not** put `vi.mock` calls inside `beforeEach`, only one of these will actually mock a module.
:::

Example with `vi.spyOn`:
```ts
import * as exports from 'some-path'
vi.spyOn(exports, 'method').mockImplementation(() => {})
```

- Mock exported class implementation

Example with `vi.mock` and prototype:
```ts
// some-path.ts
export class SomeClass {}
```
```ts
import { SomeClass } from 'some-path'
vi.mock('some-path', () => {
  const SomeClass = vi.fn()
  SomeClass.prototype.someMethod = vi.fn()
  return { SomeClass }
})
// SomeClass.mock.instances will have SomeClass
```

Example with `vi.mock` and return value:
```ts
import { SomeClass } from 'some-path'
vi.mock('some-path', () => {
  const SomeClass = vi.fn(() => ({
    someMethod: vi.fn()
  }))
  return { SomeClass }
})
// SomeClass.mock.returns will have returned object
```

Example with `vi.spyOn`:

```ts
import * as exports from 'some-path'
vi.spyOn(exports, 'SomeClass').mockImplementation(() => {
  // whatever suites you from first two examples
})
```

- Spy on an object returned from a function

Example using cache:

```ts
// some-path.ts
export function useObject() {
  return { method: () => true }
}
```

```ts
// useObject.js
import { useObject } from 'some-path'
const obj = useObject()
obj.method()
```

```ts
// useObject.test.js
import { useObject } from 'some-path'
vi.mock('some-path', () => {
  let _cache
  const useObject = () => {
    if (!_cache) {
      _cache = {
        method: vi.fn(),
      }
    }
    // now everytime useObject() is called it will
    // return the same object reference
    return _cache
  }
  return { useObject }
})

const obj = useObject()
// obj.method was called inside some-path
expect(obj.method).toHaveBeenCalled()
```

- Mock part of a module

```ts
import { mocked, original } from 'some-path'
vi.mock('some-path', async () => {
  const mod = await vi.importActual<typeof import('some-path')>('some-path')
  return {
    ...mod,
    mocked: vi.fn()
  }
})
original() // has original behaviour
mocked() // is a spy function
```

- Mock current date

To mock `Date`'s time, you can use `vi.setSystemTime` helper function. This value will **not** automatically reset between different tests.

Beware that using `vi.useFakeTimers` also changes the `Date`'s time.

```ts
const mockDate = new Date(2022, 0, 1)
vi.setSystemTime(mockDate)
const now = new Date()
expect(now.valueOf()).toBe(mockDate.valueOf())
// reset mocked time
vi.useRealTimers()
```

- Mock global variable

You can set global variable by assigning a value to `globalThis` or using [`vi.stubGlobal`](/api/#vi-stubglobal) helper. When using `vi.stubGlobal`, it will **not** automatically reset between different tests, unless you enable [`unstubGlobals`](/config/#unstubglobals) config option or call [`vi.unstubAllGlobals`](/api/#vi-unstuballglobals).

```ts
vi.stubGlobal('__VERSION__', '1.0.0')
expect(__VERSION__).toBe('1.0.0')
```

- Mock `import.meta.env`

To change environmental variable, you can just assign a new value to it. This value will **not** automatically reset between different tests.

```ts
import { beforeEach, expect, it } from 'vitest'

// you can reset it in beforeEach hook manually
const originalViteEnv = import.meta.env.VITE_ENV

beforeEach(() => {
  import.meta.env.VITE_ENV = originalViteEnv
})

it('changes value', () => {
  import.meta.env.VITE_ENV = 'staging'
  expect(import.meta.env.VITE_ENV).toBe('staging')
})
```

If you want to automatically reset value, you can use `vi.stubEnv` helper with [`unstubEnvs`](/config/#unstubEnvs) config option enabled (or call [`vi.unstubAllEnvs`](/api/#vi-unstuballenvs) manually in `beforeEach` hook):

```ts
import { expect, it, vi } from 'vitest'

// before running tests "VITE_ENV" is "test"
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
