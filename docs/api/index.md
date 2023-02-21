---
outline: deep
---

# Test API Reference

The following types are used in the type signatures below

```ts
type Awaitable<T> = T | PromiseLike<T>
type TestFunction = () => Awaitable<void>

interface TestOptions {
  timeout?: number
  retry?: number
}
```

When a test function returns a promise, the runner will wait until it is resolved to collect async expectations. If the promise is rejected, the test will fail.

::: tip
In Jest, `TestFunction` can also be of type `(done: DoneCallback) => void`. If this form is used, the test will not be concluded until `done` is called. You can achieve the same using an `async` function, see the [Migration guide Done Callback section](/guide/migration#done-callback).
:::

## test

- **Type:** `(name: string, fn: TestFunction, timeout?: number | TestOptions) => void`
- **Alias:** `it`

  `test` defines a set of related expectations. It receives the test name and a function that holds the expectations to test.

  Optionally, you can provide a timeout (in milliseconds) for specifying how long to wait before terminating. The default is 5 seconds, and can be configured globally with [testTimeout](/config/#testtimeout)

  ```ts
  import { expect, test } from 'vitest'

  test('should work as expected', () => {
    expect(Math.sqrt(4)).toBe(2)
  })
  ```

### test.skip

- **Type:** `(name: string, fn: TestFunction, timeout?: number | TestOptions) => void`
- **Alias:** `it.skip`

  If you want to skip running certain tests, but you don't want to delete the code due to any reason, you can use `test.skip` to avoid running them.

  ```ts
  import { assert, test } from 'vitest'

  test.skip('skipped test', () => {
    // Test skipped, no error
    assert.equal(Math.sqrt(4), 3)
  })
  ```

### test.skipIf

- **Type:** `(condition: any) => Test`
- **Alias:** `it.skipIf`

  In some cases you might run tests multiple times with different environments, and some of the tests might be environment-specific. Instead of wrapping the test code with `if`, you can use `test.skipIf` to skip the test whenever the condition is truthy.

  ```ts
  import { assert, test } from 'vitest'

  const isDev = process.env.NODE_ENV === 'development'

  test.skipIf(isDev)('prod only test', () => {
    // this test only runs in production
  })
  ```

::: warning
You cannot use this syntax, when using Vitest as [type checker](/guide/testing-types).
:::

### test.runIf

- **Type:** `(condition: any) => Test`
- **Alias:** `it.runIf`

  Opposite of [test.skipIf](#test-skipif).

  ```ts
  import { assert, test } from 'vitest'

  const isDev = process.env.NODE_ENV === 'development'

  test.runIf(isDev)('dev only test', () => {
    // this test only runs in development
  })
  ```

::: warning
You cannot use this syntax, when using Vitest as [type checker](/guide/testing-types).
:::

### test.only

- **Type:** `(name: string, fn: TestFunction, timeout?: number) => void`
- **Alias:** `it.only`

  Use `test.only` to only run certain tests in a given suite. This is useful when debugging.

  Optionally, you can provide a timeout (in milliseconds) for specifying how long to wait before terminating. The default is 5 seconds, and can be configured globally with [testTimeout](/config/#testtimeout).

  ```ts
  import { assert, test } from 'vitest'

  test.only('test', () => {
    // Only this test (and others marked with only) are run
    assert.equal(Math.sqrt(4), 2)
  })
  ```

  Sometimes it is very useful to run `only` tests in a certain file, ignoring all other tests from the whole test suite, which pollute the output.

  In order to do that run `vitest` with specific file containing the tests in question.
  ```
  # vitest interesting.test.ts
  ```

### test.concurrent

- **Type:** `(name: string, fn: TestFunction, timeout?: number) => void`
- **Alias:** `it.concurrent`

  `test.concurrent` marks consecutive tests to be run in parallel. It receives the test name, an async function with the tests to collect, and an optional timeout (in milliseconds).

  ```ts
  import { describe, test } from 'vitest'

  // The two tests marked with concurrent will be run in parallel
  describe('suite', () => {
    test('serial test', async () => { /* ... */ })
    test.concurrent('concurrent test 1', async () => { /* ... */ })
    test.concurrent('concurrent test 2', async () => { /* ... */ })
  })
  ```

  `test.skip`, `test.only`, and `test.todo` works with concurrent tests. All the following combinations are valid:

  ```ts
  test.concurrent(/* ... */)
  test.skip.concurrent(/* ... */) // or test.concurrent.skip(/* ... */)
  test.only.concurrent(/* ... */) // or test.concurrent.only(/* ... */)
  test.todo.concurrent(/* ... */) // or test.concurrent.todo(/* ... */)
  ```

  When running concurrent tests, Snapshots and Assertions must use `expect` from the local [Test Context](/guide/test-context.md) to ensure the right test is detected.


  ```ts
  test.concurrent('test 1', async ({ expect }) => {
    expect(foo).toMatchSnapshot()
  })
  test.concurrent('test 2', async ({ expect }) => {
    expect(foo).toMatchSnapshot()
  })
  ```

::: warning
You cannot use this syntax, when using Vitest as [type checker](/guide/testing-types).
:::

### test.todo

- **Type:** `(name: string) => void`
- **Alias:** `it.todo`

  Use `test.todo` to stub tests to be implemented later. An entry will be shown in the report for the tests so you know how many tests you still need to implement.

  ```ts
  // An entry will be shown in the report for this test
  test.todo('unimplemented test')
  ```

### test.fails

- **Type:** `(name: string, fn: TestFunction, timeout?: number) => void`
- **Alias:** `it.fails`

  Use `test.fails` to indicate that an assertion will fail explicitly.

  ```ts
  import { expect, test } from 'vitest'
  const myAsyncFunc = () => new Promise(resolve => resolve(1))
  test.fails('fail test', async () => {
    await expect(myAsyncFunc()).rejects.toBe(1)
  })
  ```

::: warning
You cannot use this syntax, when using Vitest as [type checker](/guide/testing-types).
:::

### test.each

- **Type:** `(cases: ReadonlyArray<T>, ...args: any[]) => void`
- **Alias:** `it.each`

  Use `test.each` when you need to run the same test with different variables.
  You can inject parameters with [printf formatting](https://nodejs.org/api/util.html#util_util_format_format_args) in the test name in the order of the test function parameters.

  - `%s`: string
  - `%d`: number
  - `%i`: integer
  - `%f`: floating point value
  - `%j`: json
  - `%o`: object
  - `%#`: index of the test case
  - `%%`: single percent sign ('%')

  ```ts
  test.each([
    [1, 1, 2],
    [1, 2, 3],
    [2, 1, 3],
  ])('add(%i, %i) -> %i', (a, b, expected) => {
    expect(a + b).toBe(expected)
  })

  // this will return
  // ✓ add(1, 1) -> 2
  // ✓ add(1, 2) -> 3
  // ✓ add(2, 1) -> 3
  ```

  You can also access object properties with `$` prefix, if you are using objects as arguments:

    ```ts
    test.each([
      { a: 1, b: 1, expected: 2 },
      { a: 1, b: 2, expected: 3 },
      { a: 2, b: 1, expected: 3 },
    ])('add($a, $b) -> $expected', ({ a, b, expected }) => {
      expect(a + b).toBe(expected)
    })

  // this will return
  // ✓ add(1, 1) -> 2
  // ✓ add(1, 2) -> 3
  // ✓ add(2, 1) -> 3
  ```

  You can also access Object attributes with `.`, if you are using objects as arguments:

    ```ts
    test.each`
    a               | b      | expected
    ${{ val: 1 }}   | ${'b'} | ${'1b'}
    ${{ val: 2 }}   | ${'b'} | ${'2b'}
    ${{ val: 3 }}   | ${'b'} | ${'3b'}
    `('add($a.val, $b) -> $expected', ({ a, b, expected }) => {
      expect(a.val + b).toBe(expected)
    })

    // this will return
    // ✓ add(1, b) -> 1b
    // ✓ add(2, b) -> 2b
    // ✓ add(3, b) -> 3b
    ```


  Starting from Vitest 0.25.3, you can also use template string table.

  * First row should be column names, separated by `|`;
  * One or more subsequent rows of data supplied as template literal expressions using `${value}` syntax.

  ```ts
  test.each`
    a               | b      | expected
    ${1}            | ${1}   | ${2}
    ${'a'}          | ${'b'} | ${'ab'}
    ${[]}           | ${'b'} | ${'b'}
    ${{}}           | ${'b'} | ${'[object Object]b'}
    ${{ asd: 1 }}   | ${'b'} | ${'[object Object]b'}
  `('returns $expected when $a is added $b', ({ a, b, expected }) => {
    expect(a + b).toBe(expected)
  })
  ```

  If you want to have access to `TestContext`, use `describe.each` with a single test.

::: warning
You cannot use this syntax, when using Vitest as [type checker](/guide/testing-types).
:::

## bench

- **Type:** `(name: string, fn: BenchFunction, options?: BenchOptions) => void`

`bench` defines a benchmark. In Vitest terms benchmark is a function that defines a series of operations. Vitest runs this function multiple times to display different performance results.

Vitest uses [`tinybench`](https://github.com/tinylibs/tinybench) library under the hood, inheriting all its options that can be used as a third argument.

  ```ts
  import { bench } from 'vitest'

  bench('normal sorting', () => {
    const x = [1, 5, 4, 2, 3]
    x.sort((a, b) => {
      return a - b
    })
  }, { time: 1000 })
  ```

  ```ts
  export interface Options {
    /**
     * time needed for running a benchmark task (milliseconds)
     * @default 500
     */
    time?: number

    /**
     * number of times that a task should run if even the time option is finished
     * @default 10
     */
    iterations?: number

    /**
     * function to get the current timestamp in milliseconds
     */
    now?: () => number

    /**
     * An AbortSignal for aborting the benchmark
     */
    signal?: AbortSignal

    /**
     * warmup time (milliseconds)
     * @default 100ms
     */
    warmupTime?: number

    /**
     * warmup iterations
     * @default 5
     */
    warmupIterations?: number

    /**
     * setup function to run before each benchmark task (cycle)
     */
    setup?: Hook

    /**
     * teardown function to run after each benchmark task (cycle)
     */
    teardown?: Hook
  }
  ```

### bench.skip

- **Type:** `(name: string, fn: BenchFunction, options?: BenchOptions) => void`

You can use `bench.skip` syntax to skip running certain benchmarks.

  ```ts
  import { bench } from 'vitest'

  bench.skip('normal sorting', () => {
    const x = [1, 5, 4, 2, 3]
    x.sort((a, b) => {
      return a - b
    })
  })
  ```

### bench.only

- **Type:** `(name: string, fn: BenchFunction, options?: BenchOptions) => void`

Use `bench.only` to only run certain benchmarks in a given suite. This is useful when debugging.

  ```ts
  import { bench } from 'vitest'

  bench.only('normal sorting', () => {
    const x = [1, 5, 4, 2, 3]
    x.sort((a, b) => {
      return a - b
    })
  })
  ```

### bench.todo

- **Type:** `(name: string) => void`

Use `bench.todo` to stub benchmarks to be implemented later.

  ```ts
  import { bench } from 'vitest'

  bench.todo('unimplemented test')
  ```

## describe

When you use `test` or `bench` in the top level of file, they are collected as part of the implicit suite for it. Using `describe` you can define a new suite in the current context, as a set of related tests or benchmarks and other nested suites. A suite lets you organize your tests and benchmarks so reports are more clear.

  ```ts
  // basic.spec.ts
  // organizing tests

  import { describe, expect, test } from 'vitest'

  const person = {
    isActive: true,
    age: 32,
  }

  describe('person', () => {
    test('person is defined', () => {
      expect(person).toBeDefined()
    })

    test('is active', () => {
      expect(person.isActive).toBeTruthy()
    })

    test('age limit', () => {
      expect(person.age).toBeLessThanOrEqual(32)
    })
  })
  ```

  ```ts
  // basic.bench.ts
  // organizing benchmarks

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

  You can also nest describe blocks if you have a hierarchy of tests or benchmarks:

  ```ts
  import { describe, expect, test } from 'vitest'

  const numberToCurrency = (value) => {
    if (typeof value !== 'number')
      throw new Error('Value must be a number')

    return value.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  describe('numberToCurrency', () => {
    describe('given an invalid number', () => {
      test('composed of non-numbers to throw error', () => {
        expect(() => numberToCurrency('abc')).toThrowError()
      })
    })

    describe('given a valid number', () => {
      test('returns the correct currency format', () => {
        expect(numberToCurrency(10000)).toBe('10,000.00')
      })
    })
  })
  ```

### describe.skip

- **Type:** `(name: string, fn: TestFunction, options?: number | TestOptions) => void`

  Use `describe.skip` in a suite to avoid running a particular describe block.

  ```ts
  import { assert, describe, test } from 'vitest'

  describe.skip('skipped suite', () => {
    test('sqrt', () => {
      // Suite skipped, no error
      assert.equal(Math.sqrt(4), 3)
    })
  })
  ```

### describe.skipIf

- **Type:** `(condition: any) => void`

  In some cases, you might run suites multiple times with different environments, and some of the suites might be environment-specific. Instead of wrapping the suite with `if`, you can use `describe.skipIf` to skip the suite whenever the condition is truthy.

  ```ts
  import { assert, test } from 'vitest'

  const isDev = process.env.NODE_ENV === 'development'

  describe.skipIf(isDev)('prod only test', () => {
    // this test only runs in production
  })
  ```

::: warning
You cannot use this syntax when using Vitest as [type checker](/guide/testing-types).
:::

### describe.only

- **Type:** `(name: string, fn: TestFunction, options?: number | TestOptions) => void`

  Use `describe.only` to only run certain suites

  ```ts
  // Only this suite (and others marked with only) are run
  describe.only('suite', () => {
    test('sqrt', () => {
      assert.equal(Math.sqrt(4), 3)
    })
  })

  describe('other suite', () => {
    // ... will be skipped
  })
  ```

  Sometimes it is very useful to run `only` tests in a certain file, ignoring all other tests from the whole test suite, which pollute the output.

  In order to do that run `vitest` with specific file containing the tests in question.
  ```
  # vitest interesting.test.ts
  ```

### describe.concurrent

- **Type:** `(name: string, fn: TestFunction, options?: number | TestOptions) => void`

  `describe.concurrent` in a suite marks every tests as concurrent

  ```ts
  // All tests within this suite will be run in parallel
  describe.concurrent('suite', () => {
    test('concurrent test 1', async () => { /* ... */ })
    test('concurrent test 2', async () => { /* ... */ })
    test.concurrent('concurrent test 3', async () => { /* ... */ })
  })
  ```

  `.skip`, `.only`, and `.todo` works with concurrent suites. All the following combinations are valid:

  ```ts
  describe.concurrent(/* ... */)
  describe.skip.concurrent(/* ... */) // or describe.concurrent.skip(/* ... */)
  describe.only.concurrent(/* ... */) // or describe.concurrent.only(/* ... */)
  describe.todo.concurrent(/* ... */) // or describe.concurrent.todo(/* ... */)
  ```

When running concurrent tests, Snapshots and Assertions must use `expect` from the local [Test Context](/guide/test-context.md) to ensure the right test is detected.


  ```ts
  describe.concurrent('suite', () => {
    test('concurrent test 1', async ({ expect }) => {
      expect(foo).toMatchSnapshot()
    })
    test('concurrent test 2', async ({ expect }) => {
      expect(foo).toMatchSnapshot()
    })
  })
  ```
::: warning
You cannot use this syntax, when using Vitest as [type checker](/guide/testing-types).
:::

### describe.shuffle

- **Type:** `(name: string, fn: TestFunction, options?: number | TestOptions) => void`

  Vitest provides a way to run all tests in random order via CLI flag [`--sequence.shuffle`](/guide/cli) or config option [`sequence.shuffle`](/config/#sequence-shuffle), but if you want to have only part of your test suite to run tests in random order, you can mark it with this flag.

  ```ts
  describe.shuffle('suite', () => {
    test('random test 1', async () => { /* ... */ })
    test('random test 2', async () => { /* ... */ })
    test('random test 3', async () => { /* ... */ })
  })
  // order depends on sequence.seed option in config (Date.now() by default)
  ```

`.skip`, `.only`, and `.todo` works with random suites.

::: warning
You cannot use this syntax, when using Vitest as [type checker](/guide/testing-types).
:::

### describe.todo

- **Type:** `(name: string) => void`

  Use `describe.todo` to stub suites to be implemented later. An entry will be shown in the report for the tests so you know how many tests you still need to implement.

  ```ts
  // An entry will be shown in the report for this suite
  describe.todo('unimplemented suite')
  ```

### describe.each

- **Type:** `(cases: ReadonlyArray<T>, ...args: any[]): (name: string, fn: (...args: T[]) => void, options?: number | TestOptions) => void`

  Use `describe.each` if you have more than one test that depends on the same data.

  ```ts
  describe.each([
    { a: 1, b: 1, expected: 2 },
    { a: 1, b: 2, expected: 3 },
    { a: 2, b: 1, expected: 3 },
  ])('describe object add($a, $b)', ({ a, b, expected }) => {
    test(`returns ${expected}`, () => {
      expect(a + b).toBe(expected)
    })

    test(`returned value not be greater than ${expected}`, () => {
      expect(a + b).not.toBeGreaterThan(expected)
    })

    test(`returned value not be less than ${expected}`, () => {
      expect(a + b).not.toBeLessThan(expected)
    })
  })
  ```

  Starting from Vitest 0.25.3, you can also use template string table.

  * First row should be column names, separated by `|`;
  * One or more subsequent rows of data supplied as template literal expressions using `${value}` syntax.

  ```ts
  describe.each`
    a               | b      | expected
    ${1}            | ${1}   | ${2}
    ${'a'}          | ${'b'} | ${'ab'}
    ${[]}           | ${'b'} | ${'b'}
    ${{}}           | ${'b'} | ${'[object Object]b'}
    ${{ asd: 1 }}   | ${'b'} | ${'[object Object]b'}
  `('describe template string add($a, $b)', ({ a, b, expected }) => {
    test(`returns ${expected}`, () => {
      expect(a + b).toBe(expected)
    })
  })
  ```

::: warning
You cannot use this syntax, when using Vitest as [type checker](/guide/testing-types).
:::

## Setup and Teardown

These functions allow you to hook into the life cycle of tests to avoid repeating setup and teardown code. They apply to the current context: the file if they are used at the top-level or the current suite if they are inside a `describe` block. These hooks are not called, when you are running Vitest as a type checker.

### beforeEach

- **Type:** `beforeEach(fn: () => Awaitable<void>, timeout?: number)`

  Register a callback to be called before each of the tests in the current context runs.
  If the function returns a promise, Vitest waits until the promise resolve before running the test.

  Optionally, you can pass a timeout (in milliseconds) defining how long to wait before terminating. The default is 5 seconds.

  ```ts
  import { beforeEach } from 'vitest'

  beforeEach(async () => {
    // Clear mocks and add some testing data after before each test run
    await stopMocking()
    await addUser({ name: 'John' })
  })
  ```

  Here, the `beforeEach` ensures that user is added for each test.

  Since Vitest v0.10.0, `beforeEach` also accepts an optional cleanup function (equivalent to `afterEach`).

  ```ts
  import { beforeEach } from 'vitest'

  beforeEach(async () => {
    // called once before each test run
    await prepareSomething()

    // clean up function, called once after each test run
    return async () => {
      await resetSomething()
    }
  })
  ```

### afterEach

- **Type:** `afterEach(fn: () => Awaitable<void>, timeout?: number)`

  Register a callback to be called after each one of the tests in the current context completes.
  If the function returns a promise, Vitest waits until the promise resolve before continuing.

  Optionally, you can provide a timeout (in milliseconds) for specifying how long to wait before terminating. The default is 5 seconds.

  ```ts
  import { afterEach } from 'vitest'

  afterEach(async () => {
    await clearTestingData() // clear testing data after each test run
  })
  ```
  Here, the `afterEach` ensures that testing data is cleared after each test runs.

### beforeAll

- **Type:** `beforeAll(fn: () => Awaitable<void>, timeout?: number)`

  Register a callback to be called once before starting to run all tests in the current context.
  If the function returns a promise, Vitest waits until the promise resolve before running tests.

  Optionally, you can provide a timeout (in milliseconds) for specifying how long to wait before terminating. The default is 5 seconds.

  ```ts
  import { beforeAll } from 'vitest'

  beforeAll(async () => {
    await startMocking() // called once before all tests run
  })
  ```

  Here the `beforeAll` ensures that the mock data is set up before tests run.

  Since Vitest v0.10.0, `beforeAll` also accepts an optional cleanup function (equivalent to `afterAll`).

  ```ts
  import { beforeAll } from 'vitest'

  beforeAll(async () => {
    // called once before all tests run
    await startMocking()

    // clean up function, called once after all tests run
    return async () => {
      await stopMocking()
    }
  })
  ```

### afterAll

- **Type:** `afterAll(fn: () => Awaitable<void>, timeout?: number)`

  Register a callback to be called once after all tests have run in the current context.
  If the function returns a promise, Vitest waits until the promise resolve before continuing.

  Optionally, you can provide a timeout (in milliseconds) for specifying how long to wait before terminating. The default is 5 seconds.

  ```ts
  import { afterAll } from 'vitest'

  afterAll(async () => {
    await stopMocking() // this method is called after all tests run
  })
  ```

  Here the `afterAll` ensures that `stopMocking` method is called after all tests run.
