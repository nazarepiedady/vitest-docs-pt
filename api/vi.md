# Vi

Vitest provides utility functions to help you out through its `vi` helper. You can access it globally (when [globals configuration](/config/#globals) is **enabled**), or import from `vitest`:

```js
import { vi } from 'vitest'
```

## vi.advanceTimersByTime

- **Type:** `(ms: number) => Vitest`

  Works just like `runAllTimers`, but will end after passed milliseconds. For example this will log `1, 2, 3` and will not throw:

  ```ts
  let i = 0
  setInterval(() => console.log(++i), 50)

  vi.advanceTimersByTime(150)
  ```

### vi.advanceTimersByTimeAsync

- **Type:** `(ms: number) => Promise<Vitest>`

  Works just like `runAllTimersAsync`, but will end after passed milliseconds. This will include asynchronously set timers. For example this will log `1, 2, 3` and will not throw:

  ```ts
  let i = 0
  setInterval(() => Promise.resolve().then(() => console.log(++i)), 50)

  await vi.advanceTimersByTimeAsync(150)
  ```

## vi.advanceTimersToNextTimer

- **Type:** `() => Vitest`

  Will call next available timer. Useful to make assertions between each timer call. You can chain call it to manage timers by yourself.

  ```ts
  let i = 0
  setInterval(() => console.log(++i), 50)

  vi.advanceTimersToNextTimer() // log 1
    .advanceTimersToNextTimer() // log 2
    .advanceTimersToNextTimer() // log 3
  ```

### vi.advanceTimersToNextTimerAsync

- **Type:** `() => Promise<Vitest>`

  Will call next available timer even if it was set asynchronously. Useful to make assertions between each timer call. You can chain call it to manage timers by yourself.

  ```ts
  let i = 0
  setInterval(() => Promise.resolve().then(() => console.log(++i)), 50)

  vi.advanceTimersToNextTimerAsync() // log 1
    .advanceTimersToNextTimerAsync() // log 2
    .advanceTimersToNextTimerAsync() // log 3
  ```

## vi.getTimerCount

- **Type:** `() => number`

  Get the number of waiting timers.

## vi.clearAllMocks

  Will call [`.mockClear()`](/api/mock#mockclear) on all spies. This will clear mock history, but not reset its implementation to the default one.

## vi.clearAllTimers

  Removes all timers that are scheduled to run. These timers will never run in the future.

## vi.dynamicImportSettled

  Wait for all imports to load. Useful, if you have a synchronous call that starts importing a module, that you cannot wait otherwise.

## vi.fn

- **Type:** `(fn?: Function) => Mock`

  Creates a spy on a function, though can be initiated without one. Every time a function is invoked, it stores its call arguments, returns, and instances. Also, you can manipulate its behavior with [methods](/api/mock).
  If no function is given, mock will return `undefined`, when invoked.

  ```ts
  const getApples = vi.fn(() => 0)

  getApples()

  expect(getApples).toHaveBeenCalled()
  expect(getApples).toHaveReturnedWith(0)

  getApples.mockReturnValueOnce(5)

  const res = getApples()
  expect(res).toBe(5)
  expect(getApples).toHaveNthReturnedWith(2, 5)
  ```

## vi.getMockedSystemTime

- **Type**: `() => Date | null`

  Returns mocked current date that was set using `setSystemTime`. If date is not mocked, will return `null`.

## vi.getRealSystemTime

- **Type**: `() => number`

  When using `vi.useFakeTimers`, `Date.now` calls are mocked. If you need to get real time in milliseconds, you can call this function.

## vi.hoisted

- **Type**: `<T>(factory: () => T) => T`
- **Version**: Since Vitest 0.31.0

  All static `import` statements in ES modules are hoisted to top of the file, so any code that is define before the imports will actually be executed after imports are evaluated.

  Hovewer it can be useful to invoke some side effect like mocking dates before importing a module.

  To bypass this limitation, you can rewrite static imports into dynamic ones like this:

  ```diff
  callFunctionWithSideEffect()
  - import { value } from './some/module.ts'
  + const { value } = await import('./some/module.ts')
  ```

  When running `vitest`, you can do this automatically by using `vi.hoisted` method.

  ```diff
  - callFunctionWithSideEffect()
  import { value } from './some/module.ts'
  + vi.hoisted(() => callFunctionWithSideEffect())
  ```

  This method returns the value that was returned from the factory. You can use that value in your `vi.mock` factories if you need an easy access to locally defined variables:

  ```ts
  import { expect, vi } from 'vitest'
  import { originalMethod } from './path/to/module.js'

  const { mockedMethod } = vi.hoisted(() => {
    return { mockedMethod: vi.fn() }
  })

  vi.mock('./path/to/module.js', () => {
    return { originalMethod: mockedMethod }
  })

  mockedMethod.mockReturnValue(100)
  expect(originalMethod()).toBe(100)
  ```


## vi.mock

- **Type**: `(path: string, factory?: () => unknown) => void`

  Substitutes all imported modules from provided `path` with another module. You can use configured Vite aliases inside a path. The call to `vi.mock` is hoisted, so it doesn't matter where you call it. It will always be executed before all imports. If you need to reference some variables outside of its scope, you can define them inside [`vi.hoisted`](/api/vi#vi-hoisted) and reference them inside `vi.mock`.

  ::: warning
  `vi.mock` works only for modules that were imported with the `import` keyword. It doesn't work with `require`.

  Vitest statically analyzes your files to hoist `vi.mock`. It means that you cannot use `vi` that was not imported directly from `vitest` package (for example, from some utility file). To fix this, always use `vi.mock` with `vi` imported from `vitest`, or enable [`globals`](/config/#globals) config option.
  :::

  ::: warning
	Mocking modules is not currently supported in the [browser mode](/guide/browser). You can track this feature in the GitHub <a href="https://github.com/vitest-dev/vitest/issues/3046">issue</a>.
  :::

  If `factory` is defined, all imports will return its result. Vitest calls factory only once and caches result for all subsequent imports until [`vi.unmock`](#vi-unmock) or [`vi.doUnmock`](#vi-dounmock) is called.

  Unlike in `jest`, the factory can be asynchronous, so you can use [`vi.importActual`](#vi-importactual) or a helper, received as the first argument, inside to get the original module.

  ```ts
  vi.mock('./path/to/module.js', async (importOriginal) => {
    const mod = await importOriginal()
    return {
      ...mod,
      // replace some exports
      namedExport: vi.fn(),
    }
  })
  ```

  ::: warning
  `vi.mock` is hoisted (in other words, _moved_) to **top of the file**. It means that whenever you write it (be it inside `beforeEach` or `test`), it will actually be called before that.

  This also means that you cannot use any variables inside the factory that are defined outside the factory.

  If you need to use variables inside the factory, try [`vi.doMock`](#vi-domock). It works the same way but isn't hoisted. Beware that it only mocks subsequent imports.

  You can also reference variables defined by `vi.hoisted` method if it was declared before `vi.mock`:

  ```ts
  import { namedExport } from './path/to/module.js'

  const mocks = vi.hoisted(() => {
    return {
      namedExport: vi.fn(),
    }
  })

  vi.mock('./path/to/module.js', () => {
    return {
      namedExport: mocks.namedExport,
    }
  })

  vi.mocked(namedExport).mockReturnValue(100)

  expect(namedExport()).toBe(100)
  expect(namedExport).toBe(mocks.namedExport)
  ```
  :::

  ::: warning
  If you are mocking a module with default export, you will need to provide a `default` key within the returned factory function object. This is an ES modules-specific caveat, therefore `jest` documentation may differ as `jest` uses CommonJS modules. For example,

  ```ts
  vi.mock('./path/to/module.js', () => {
    return {
      default: { myDefaultKey: vi.fn() },
      namedExport: vi.fn(),
      // etc...
    }
  })
  ```
  :::

  If there is a `__mocks__` folder alongside a file that you are mocking, and the factory is not provided, Vitest will try to find a file with the same name in the `__mocks__` subfolder and use it as an actual module. If you are mocking a dependency, Vitest will try to find a `__mocks__` folder in the [root](/config/#root) of the project (default is `process.cwd()`). You can tell Vitest where the dependencies are located through the [deps.moduleDirectories](/config/#deps-moduledirectories) config option.

  For example, you have this file structure:

  ```
  - __mocks__
    - axios.js
  - src
    __mocks__
      - increment.js
    - increment.js
  - tests
    - increment.test.js
  ```

  If you call `vi.mock` in a test file without a factory provided, it will find a file in the `__mocks__` folder to use as a module:

  ```ts
  // increment.test.js
  import { vi } from 'vitest'

  // axios is a default export from `__mocks__/axios.js`
  import axios from 'axios'

  // increment is a named export from `src/__mocks__/increment.js`
  import { increment } from '../increment.js'

  vi.mock('axios')
  vi.mock('../increment.js')

  axios.get(`/apples/${increment(1)}`)
  ```

  ::: warning
  Beware that if you don't call `vi.mock`, modules **are not** mocked automatically. To replicate Jest's automocking behaviour, you can call `vi.mock` for each required module inside [`setupFiles`](/config/#setupfiles).
  :::

  If there is no `__mocks__` folder or a factory provided, Vitest will import the original module and auto-mock all its exports. For the rules applied, see [algorithm](/guide/mocking#automocking-algorithm).

## vi.doMock

- **Type**: `(path: string, factory?: () => unknown) => void`

  The same as [`vi.mock`](#vi-mock), but it's not hoisted at the top of the file, so you can reference variables in the global file scope. The next [dynamic import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) of the module will be mocked. This will not mock modules that were imported before this was called.

```ts
// ./increment.js
export function increment(number) {
  return number + 1
}
```

```ts
import { beforeEach, test } from 'vitest'
import { increment } from './increment.js'

// the module is not mocked, because vi.doMock is not called yet
increment(1) === 2

let mockedIncrement = 100

beforeEach(() => {
  // you can access variables inside a factory
  vi.doMock('./increment.js', () => ({ increment: () => ++mockedIncrement }))
})

test('importing the next module imports mocked one', async () => {
  // original import WAS NOT MOCKED, because vi.doMock is evaluated AFTER imports
  expect(increment(1)).toBe(2)
  const { increment: mockedIncrement } = await import('./increment.js')
  // new dynamic import returns mocked module
  expect(mockedIncrement(1)).toBe(101)
  expect(mockedIncrement(1)).toBe(102)
  expect(mockedIncrement(1)).toBe(103)
})
```

## vi.mocked

- **Type**: `<T>(obj: T, deep?: boolean) => MaybeMockedDeep<T>`
- **Type**: `<T>(obj: T, options?: { partial?: boolean; deep?: boolean }) => MaybePartiallyMockedDeep<T>`

  Type helper for TypeScript. In reality just returns the object that was passed.

  When `partial` is `true` it will expect a `Partial<T>` as a return value.
  ```ts
  import example from './example.js'

  vi.mock('./example.js')

  test('1+1 equals 2', async () => {
    vi.mocked(example.calc).mockRestore()

    const res = example.calc(1, '+', 1)

    expect(res).toBe(2)
  })
  ```

## vi.importActual

- **Type**: `<T>(path: string) => Promise<T>`

  Imports module, bypassing all checks if it should be mocked. Can be useful if you want to mock module partially.

  ```ts
  vi.mock('./example.js', async () => {
    const axios = await vi.importActual('./example.js')

    return { ...axios, get: vi.fn() }
  })
   ```

## vi.importMock

- **Type**: `<T>(path: string) => Promise<MaybeMockedDeep<T>>`

  Imports a module with all of its properties (including nested properties) mocked. Follows the same rules that [`vi.mock`](#vi-mock) follows. For the rules applied, see [algorithm](/guide/mocking#automocking-algorithm).

## vi.resetAllMocks

  Will call [`.mockReset()`](/api/mock#mockreset) on all spies. This will clear mock history and reset its implementation to an empty function (will return `undefined`).

## vi.resetConfig

- **Type**: `RuntimeConfig`

  If [`vi.setConfig`](#vi-setconfig) was called before, this will reset config to the original state.

## vi.resetModules

- **Type**: `() => Vitest`

  Resets modules registry by clearing cache of all modules. This allows modules to be reevaluated when reimported. Top-level imports cannot be reevaluated. Might be useful to isolate modules where local state conflicts between tests.

  ```ts
  import { vi } from 'vitest'

  import { data } from './data.js' // Will not get reevaluated beforeEach test

  beforeEach(() => {
    vi.resetModules()
  })

  test('change state', async () => {
    const mod = await import('./some/path.js') // Will get reevaluated
    mod.changeLocalState('new value')
    expect(mod.getLocalState()).toBe('new value')
  })

  test('module has old state', async () => {
    const mod = await import('./some/path.js') // Will get reevaluated
    expect(mod.getLocalState()).toBe('old value')
  })
  ```

::: warning
Does not reset mocks registry. To clear mocks registry, use [`vi.unmock`](#vi-unmock) or [`vi.doUnmock`](#vi-dounmock).
:::

## vi.restoreAllMocks

  Will call [`.mockRestore()`](/api/mock#mockrestore) on all spies. This will clear mock history and reset its implementation to the original one.

## vi.stubEnv

- **Type:** `(name: string, value: string) => Vitest`
- **Version:** Since Vitest 0.26.0

  Changes the value of environmental variable on `process.env` and `import.meta.env`. You can restore its value by calling `vi.unstubAllEnvs`.

```ts
import { vi } from 'vitest'

// `process.env.NODE_ENV` and `import.meta.env.NODE_ENV`
// are "development" before calling "vi.stubEnv"

vi.stubEnv('NODE_ENV', 'production')

process.env.NODE_ENV === 'production'
import.meta.env.NODE_ENV === 'production'
// doesn't change other envs
import.meta.env.MODE === 'development'
```

:::tip
You can also change the value by simply assigning it, but you won't be able to use `vi.unstubAllEnvs` to restore previous value:

```ts
import.meta.env.MODE = 'test'
```
:::

## vi.unstubAllEnvs

- **Type:** `() => Vitest`
- **Version:** Since Vitest 0.26.0

  Restores all `import.meta.env` and `process.env` values that were changed with `vi.stubEnv`. When it's called for the first time, Vitest remembers the original value and will store it, until `unstubAllEnvs` is called again.

```ts
import { vi } from 'vitest'

// `process.env.NODE_ENV` and `import.meta.env.NODE_ENV`
// are "development" before calling stubEnv

vi.stubEnv('NODE_ENV', 'production')

process.env.NODE_ENV === 'production'
import.meta.env.NODE_ENV === 'production'

vi.stubEnv('NODE_ENV', 'staging')

process.env.NODE_ENV === 'staging'
import.meta.env.NODE_ENV === 'staging'

vi.unstubAllEnvs()

// restores to the value that were stored before the first "stubEnv" call
process.env.NODE_ENV === 'development'
import.meta.env.NODE_ENV === 'development'
```

## vi.stubGlobal

- **Type:** `(name: string | number | symbol, value: unknown) => Vitest`

  Changes the value of global variable. You can restore its original value by calling `vi.unstubAllGlobals`.

```ts
import { vi } from 'vitest'

// `innerWidth` is "0" before calling stubGlobal

vi.stubGlobal('innerWidth', 100)

innerWidth === 100
globalThis.innerWidth === 100
// if you are using jsdom or happy-dom
window.innerWidth === 100
```

:::tip
You can also change the value by simply assigning it to `globalThis` or `window` (if you are using `jsdom` or `happy-dom` environment), but you won't be able to use `vi.unstubAllGlobals` to restore original value:

```ts
globalThis.innerWidth = 100
// if you are using jsdom or happy-dom
window.innerWidth = 100
```
:::

## vi.unstubAllGlobals

- **Type:** `() => Vitest`
- **Version:** Since Vitest 0.26.0

  Restores all global values on `globalThis`/`global` (and `window`/`top`/`self`/`parent`, if you are using `jsdom` or `happy-dom` environment) that were changed with `vi.stubGlobal`. When it's called for the first time, Vitest remembers the original value and will store it, until `unstubAllGlobals` is called again.

```ts
import { vi } from 'vitest'

const Mock = vi.fn()

// IntersectionObserver is "undefined" before calling "stubGlobal"

vi.stubGlobal('IntersectionObserver', Mock)

IntersectionObserver === Mock
global.IntersectionObserver === Mock
globalThis.IntersectionObserver === Mock
// if you are using jsdom or happy-dom
window.IntersectionObserver === Mock

vi.unstubAllGlobals()

globalThis.IntersectionObserver === undefined
'IntersectionObserver' in globalThis === false
// throws ReferenceError, because it's not defined
IntersectionObserver === undefined
```

## vi.runAllTicks

- **Type:** `() => Vitest`

  Calls every microtask that was queued by `process.nextTick`. This will also run all microtasks scheduled by themselves.

## vi.runAllTimers

- **Type:** `() => Vitest`

  This method will invoke every initiated timer until the timers queue is empty. It means that every timer called during `runAllTimers` will be fired. If you have an infinite interval,
  it will throw after 10 000 tries. For example this will log `1, 2, 3`:

  ```ts
  let i = 0
  setTimeout(() => console.log(++i))
  const interval = setInterval(() => {
    console.log(++i)
    if (i === 3)
      clearInterval(interval)

  }, 50)

  vi.runAllTimers()
  ```

### vi.runAllTimersAsync

- **Type:** `() => Promise<Vitest>`

  This method will asynchronously invoke every initiated timer until the timers queue is empty. It means that every timer called during `runAllTimersAsync` will be fired even asynchronous timers. If you have an infinite interval,
  it will throw after 10 000 tries. For example this will log `result`:

  ```ts
  setTimeout(async () => {
    console.log(await Promise.resolve('result'))
  }, 100)

  await vi.runAllTimersAsync()
  ```

## vi.runOnlyPendingTimers

- **Type:** `() => Vitest`

  This method will call every timer that was initiated after `vi.useFakeTimers()` call. It will not fire any timer that was initiated during its call. For example this will only log `1`:

  ```ts
  let i = 0
  setInterval(() => console.log(++i), 50)

  vi.runOnlyPendingTimers()
  ```

### vi.runOnlyPendingTimersAsync

- **Type:** `() => Promise<Vitest>`

  This method will asynchronously call every timer that was initiated after `vi.useFakeTimers()` call, even asynchronous ones. It will not fire any timer that was initiated during its call. For example this will log `2, 3, 3, 1`:

  ```ts
  setTimeout(() => {
    console.log(1)
  }, 100)
  setTimeout(() => {
    Promise.resolve().then(() => {
      console.log(2)
      setInterval(() => {
        console.log(3)
      }, 40)
    })
  }, 10)

  await vi.runOnlyPendingTimersAsync()
  ```

## vi.setSystemTime

- **Type**: `(date: string | number | Date) => void`

  Sets current date to the one that was passed. All `Date` calls will return this date.

  Useful if you need to test anything that depends on the current date - for example [luxon](https://github.com/moment/luxon/) calls inside your code.

  ```ts
  const date = new Date(1998, 11, 19)

  vi.useFakeTimers()
  vi.setSystemTime(date)

  expect(Date.now()).toBe(date.valueOf())

  vi.useRealTimers()
  ```

## vi.setConfig

- **Type**: `RuntimeConfig`

  Updates config for the current test file. You can only affect values that are used, when executing tests.

## vi.spyOn

- **Type:** `<T, K extends keyof T>(object: T, method: K, accessType?: 'get' | 'set') => MockInstance`

  Creates a spy on a method or getter/setter of an object.

  ```ts
  let apples = 0
  const cart = {
    getApples: () => 13,
  }

  const spy = vi.spyOn(cart, 'getApples').mockImplementation(() => apples)
  apples = 1

  expect(cart.getApples()).toBe(1)

  expect(spy).toHaveBeenCalled()
  expect(spy).toHaveReturnedWith(1)
  ```

## vi.stubGlobal

- **Type**: `(key: keyof globalThis & Window, value: any) => Vitest`

  Puts a value on global variable. If you are using `jsdom` or `happy-dom`, also puts the value on `window` object.

  Read more in ["Mocking Globals" section](/guide/mocking.html#globals).

## vi.unmock

- **Type**: `(path: string) => void`

  Removes module from the mocked registry. All calls to import will return the original module even if it was mocked before. This call is hoisted (moved) to the top of the file, so it will only unmock modules that were defined in `setupFiles`, for example.

## vi.doUnmock

- **Type**: `(path: string) => void`

  The same as [`vi.unmock`](#vi-unmock), but is not hoisted to the top of the file. The next import of the module will import the original module instead of the mock. This will not unmock previously imported modules.

```ts
// ./increment.js
export function increment(number) {
  return number + 1
}
```

```ts
import { increment } from './increment.js'

// increment is already mocked, because vi.mock is hoisted
increment(1) === 100

// this is hoisted, and factory is called before the import on line 1
vi.mock('./increment.js', () => ({ increment: () => 100 }))

// all calls are mocked, and `increment` always returns 100
increment(1) === 100
increment(30) === 100

// this is not hoisted, so other import will return unmocked module
vi.doUnmock('./increment.js')

// this STILL returns 100, because `vi.doUnmock` doesn't reevaluate a module
increment(1) === 100
increment(30) === 100

// the next import is unmocked, now `increment` is the original function that returns count + 1
const { increment: unmockedIncrement } = await import('./increment.js')

unmockedIncrement(1) === 2
unmockedIncrement(30) === 31
```

## vi.useFakeTimers

- **Type:** `() => Vitest`

  To enable mocking timers, you need to call this method. It will wrap all further calls to timers (such as `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`, `nextTick`, `setImmediate`, `clearImmediate`, and `Date`), until [`vi.useRealTimers()`](#vi-userealtimers) is called.

  Mocking `nextTick` is not supported when running Vitest inside `node:child_process` by using `--pool=forks`. NodeJS uses `process.nextTick` internally in `node:child_process` and hangs when it is mocked. Mocking `nextTick` is supported when running Vitest with `--pool=threads`.

  The implementation is based internally on [`@sinonjs/fake-timers`](https://github.com/sinonjs/fake-timers).

  ::: tip
  Since version `0.35.0` `vi.useFakeTimers()` no longer automatically mocks `process.nextTick`.
  It can still be mocked by specyfing the option in `toFake` argument: `vi.useFakeTimers({ toFake: ['nextTick'] })`.
  :::

## vi.isFakeTimers

- **Type:** `() => boolean`
- **Version:** Since Vitest 0.34.5

  Returns `true` if fake timers are enabled.

## vi.useRealTimers

- **Type:** `() => Vitest`

  When timers are run out, you may call this method to return mocked timers to its original implementations. All timers that were run before will not be restored.

## vi.waitFor

- **Type:** `<T>(callback: WaitForCallback<T>, options?: number | WaitForOptions) => Promise<T>`
- **Version**: Since Vitest 0.34.5

Wait for the callback to execute successfully. If the callback throws an error or returns a rejected promise it will continue to wait until it succeeds or times out.

This is very useful when you need to wait for some asynchronous action to complete, for example, when you start a server and need to wait for it to start.

```ts
import { expect, test, vi } from 'vitest'
import { createServer } from './server.js'

test('Server started successfully', async () => {
  const server = createServer()

  await vi.waitFor(
    () => {
      if (!server.isReady)
        throw new Error('Server not started')

      console.log('Server started')
    }, {
      timeout: 500, // default is 1000
      interval: 20, // default is 50
    }
  )
  expect(server.isReady).toBe(true)
})
```

It also works for asynchronous callbacks

```ts
// @vitest-environment jsdom

import { expect, test, vi } from 'vitest'
import { getDOMElementAsync, populateDOMAsync } from './dom.js'

test('Element exists in a DOM', async () => {
  // start populating DOM
  populateDOMAsync()

  const element = await vi.waitFor(async () => {
    // try to get the element until it exists
    const element = await getDOMElementAsync() as HTMLElement | null
    expect(element).toBeTruthy()
    expect(element.dataset.initialized).toBeTruthy()
    return element
  }, {
    timeout: 500, // default is 1000
    interval: 20, // default is 50
  })
  expect(element).toBeInstanceOf(HTMLElement)
})
```

If `vi.useFakeTimers` is used, `vi.waitFor` automatically calls `vi.advanceTimersByTime(interval)` in every check callback.

## vi.waitUntil

- **Type:** `<T>(callback: WaitUntilCallback<T>, options?: number | WaitUntilOptions) => Promise<T>`
- **Version**: Since Vitest 0.34.5

This is similar to `vi.waitFor`, but if the callback throws any errors, execution is immediately interrupted and an error message is received. If the callback returns falsy value, the next check will continue until truthy value is returned. This is useful when you need to wait for something to exist before taking the next step.

Look at the example below. We can use `vi.waitUntil` to wait for the element to appear on the page, and then we can do something with the element.

```ts
import { expect, test, vi } from 'vitest'

test('Element render correctly', async () => {
  const element = await vi.waitUntil(
    () => document.querySelector('.element'),
    {
      timeout: 500, // default is 1000
      interval: 20, // default is 50
    }
  )

  // do something with the element
  expect(element.querySelector('.element-child')).toBeTruthy()
})
```
