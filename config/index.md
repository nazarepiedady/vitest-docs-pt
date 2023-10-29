---
outline: deep
---

# Configurando a Vitest {#configuring-vitest}

## Configuração {#configuration}

`vitest` will read your root `vite.config.ts` when it is present to match with the plugins and setup as your Vite app. If you want to have a different configuration for testing or your main app doesn't rely on Vite specifically, you could either:

- Create `vitest.config.ts`, which will have the higher priority and will override the configuration from `vite.config.ts`
- Pass `--config` option to CLI, e.g. `vitest --config ./path/to/vitest.config.ts`
- Use `process.env.VITEST` or `mode` property on `defineConfig` (will be set to `test`/`benchmark` if not overridden) to conditionally apply different configuration in `vite.config.ts`

To configure `vitest` itself, add `test` property in your Vite config. You'll also need to add a reference to Vitest types using a [triple slash command](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html#-reference-types-) at the top of your config file, if you are importing `defineConfig` from `vite` itself.

using `defineConfig` from `vite` you should follow this:

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    // ... Specify options here.
  },
})
```

using `defineConfig` from `vitest/config` you should follow this:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // ... Specify options here.
  },
})
```

You can retrieve Vitest's default options to expand them if needed:

```ts
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'packages/template/*'],
  },
})
```

When using a separate `vitest.config.js`, you can also extend Vite's options from another config file if needed:

```ts
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    exclude: ['packages/template/*'],
  },
}))
```

:::warning AVISO
`mergeConfig` helper is availabe in Vitest since v0.30.0. You can import it from `vite` directly, if you use lower version.
:::

If your vite config is defined as a function, you can define the config like this:

```ts
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default defineConfig(configEnv => mergeConfig(
  viteConfig(configEnv),
  defineConfig({
    test: {
      exclude: ['packages/template/*'],
    },
  })
))
```

## Opções {#options}

:::tip DICA
In addition to the following options, you can also use any configuration option from [Vite](https://vitejs.dev/config/). For example, `define` to define global variables, or `resolve.alias` to define aliases.
:::

:::tip DICA
All configuration options that are not supported inside a [workspace](/guide/workspace) project config have <NonProjectOption /> sign next to them.
:::

### `include` {#include}

- **Type:** `string[]`
- **Default:** `['**/*.{test,spec}.?(c|m)[jt]s?(x)']`

Files to include in the test run, using glob pattern.

### `exclude` {#exclude}

- **Type:** `string[]`
- **Default:** `['**/node_modules/**', '**/dist/**', '**/cypress/**', '**/.{idea,git,cache,output,temp}/**', '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*']`

Files to exclude from the test run, using glob pattern.

### `includeSource` {#includesource}

- **Type:** `string[]`
- **Default:** `[]`

Include globs for in-source test files.

When defined, Vitest will run all matched files with `import.meta.vitest` inside.

### `server` {#server}

- **Type:** `{ sourcemap?, deps?, ... }`
- **Version:** Since Vitest 0.34.0

Vite-Node server options.

#### `server.sourcemap` {#server-sourcemap}

- **Type:** `'inline' | boolean`
- **Default:** `'inline'`

Inject inline sourcemap to modules.

#### `server.debug` {#server-debug}

- **Type:** `{ dumpModules?, loadDumppedModules? }`

Vite-Node debugger options.

#### `server.debug.dumpModules` {#server-debug-dumpmodules}

- **Type:** `boolean | string`

Dump the transformed module to filesystem. Passing a string will dump to the specified path.

#### `server.debug.loadDumppedModules` {#server-debug-loaddumppedmodules}

- **Type:** `boolean`

Read dumped module from filesystem whenever exists. Useful for debugging by modifying the dump result from the filesystem.

#### `server.deps` {#server-deps}

- **Type:** `{ external?, inline?, ... }`

Handling for dependencies resolution.

#### `server.deps.external` {#server-deps-external}

- **Type:** `(string | RegExp)[]`
- **Default:** `[/\/node_modules\//]`

Externalize means that Vite will bypass the package to the native Node. Externalized dependencies will not be applied to Vite's transformers and resolvers, so they do not support HMR on reload. By default, all packages inside `node_modules` are externalized.

These options support package names as they are written in `node_modules` or specified inside [`deps.moduleDirectories`](#deps-moduledirectories). For example, package `@company/some-name` located inside `packages/some-name` should be specified as `some-name`, and `packages` should be included in `deps.moduleDirectories`. Basically, Vitest always checks the file path, not the actual package name.

If regexp is used, Vitest calls it on the _file path_, not the package name.

#### `server.deps.inline` {#server-deps-inline}

- **Type:** `(string | RegExp)[] | true`
- **Default:** `[]`

Vite will process inlined modules. This could be helpful to handle packages that ship `.js` in ESM format (that Node can't handle).

If `true`, every dependency will be inlined. All dependencies, specified in [`ssr.noExternal`](https://vitejs.dev/guide/ssr.html#ssr-externals) will be inlined by default.

#### `server.deps.fallbackCJS` {#server-deps-fallbackcjs}

- **Type** `boolean`
- **Default:** `false`

When a dependency is a valid ESM package, try to guess the cjs version based on the path. This might be helpful, if a dependency has the wrong ESM file.

This might potentially cause some misalignment if a package has different logic in ESM and CJS mode.

#### `server.deps.cacheDir` {#server-deps-cachedir}

- **Type** `string`
- **Default**: `'node_modules/.vite'`

Directory to save cache files.

### `deps` {#deps}

- **Type:** `{ optimizer?, registerNodeLoader?, ... }`

Handling for dependencies resolution.

#### `deps.optimizer` {#deps-optimizer}

- **Type:** `{ ssr?, web? }`
- **Version:** Since Vitest 0.34.0
- **See also:** [Dep Optimization Options](https://vitejs.dev/config/dep-optimization-options.html)

Enable dependency optimization. If you have a lot of tests, this might improve their performance. Before Vitest 0.34.0, it was named as `deps.experimentalOptimizer`.

When Vitest encounters the external library listed in `include`, it will be bundled into a single file using esbuild and imported as a whole module. This is good for several reasons:

- Importing packages with a lot of imports is expensive. By bundling them into one file we can save a lot of time
- Importing UI libraries is expensive because they are not meant to run inside Node.js
- Your `alias` configuration is now respected inside bundled packages
- Code in your tests is running closer to how it's running in the browser

Be aware that only packages in `deps.optimizer?.[mode].include` option are bundled (some plugins populate this automatically, like Svelte). You can read more about available options in [Vite](https://vitejs.dev/config/dep-optimization-options.html) docs (Vitest doesn't support `disable` and `noDiscovery` options). By default, Vitest uses `optimizer.web` for `jsdom` and `happy-dom` environments, and `optimizer.ssr` for `node` and `edge` environments, but it is configurable by [`transformMode`](#transformmode).

This options also inherits your `optimizeDeps` configuration (for web Vitest will extend `optimizeDeps`, for ssr - `ssr.optimizeDeps`). If you redefine `include`/`exclude` option in `deps.optimizer` it will extend your `optimizeDeps` when running tests. Vitest automatically removes the same options from `include`, if they are listed in `exclude`.

:::tip Dica
You will not be able to edit your `node_modules` code for debugging, since the code is actually located in your `cacheDir` or `test.cache.dir` directory. If you want to debug with `console.log` statements, edit it directly or force rebundling with `deps.optimizer?.[mode].force` option.
:::

#### `deps.optimizer.{mode}.enabled` {#deps-optimizer-mode-enabled}

- **Type:** `boolean`
- **Default:** `true` if using >= Vite 4.3.2, `false` otherwise

Enable dependency optimization.

:::warning AVISO
This option only works with Vite 4.3.2 and higher.
:::

#### `deps.web` {#deps-dev}

- **Type:** `{ transformAssets?, ... }`
- **Version:** Since Vite 0.34.2

Options that are applied to external files when transform mode is set to `web`. By default, `jsdom` and `happy-dom` use `web` mode, while `node` and `edge` environments use `ssr` transform mode, so these options will have no affect on files inside those environments.

Usually, files inside `node_modules` are externalized, but these options also affect files in [`server.deps.external`](#server-deps-external).

#### `deps.web.transformAssets` {#deps-web-transformassets}

- **Type:** `boolean`
- **Default:** `true`

Should Vitest process assets (.png, .svg, .jpg, etc) files and resolve them like Vite does in the browser.

This module will have a default export equal to the path to the asset, if no query is specified.

:::warning AVISO
At the moment, this option only works with [`vmThreads`](#vmthreads) pool.
:::

#### `deps.web.transformCss` {#deps-web-transformcss}

- **Type:** `boolean`
- **Default:** `true`

Should Vitest process CSS (.css, .scss, .sass, etc) files and resolve them like Vite does in the browser.

If CSS files are disabled with [`css`](#css) options, this option will just silence `ERR_UNKNOWN_FILE_EXTENSION` errors.

:::warning AVISO
At the moment, this option only works with [`vmThreads`](#vmthreads) pool.
:::

#### `deps.web.transformGlobPattern` {#deps-web-transformglobpattern}

- **Type:** `RegExp | RegExp[]`
- **Default:** `[]`

Regexp pattern to match external files that should be transformed.

By default, files inside `node_modules` are externalized and not transformed, unless it's CSS or an asset, and corresponding option is not disabled.

:::warning AVISO
At the moment, this option only works with [`vmThreads`](#vmthreads) pool.
:::

#### `deps.registerNodeLoader`<NonProjectOption /> {#deps-registernodeloader}

- **Type:** `boolean`
- **Default:** `false`

Use [experimental Node loader](https://nodejs.org/api/esm.html#loaders) to resolve imports inside externalized files, using Vite resolve algorithm.

If disabled, your `alias` and `<plugin>.resolveId` won't affect imports inside externalized packages (by default, `node_modules`).

#### `deps.interopDefault` {#deps-interopdefault}

- **Type:** `boolean`
- **Default:** `true`

Interpret CJS module's default as named exports. Some dependencies only bundle CJS modules and don't use named exports that Node.js can statically analyze when a package is imported using `import` syntax instead of `require`. When importing such dependencies in Node environment using named exports, you will see this error:

```
import { read } from 'fs-jetpack';
         ^^^^
SyntaxError: Named export 'read' not found. The requested module 'fs-jetpack' is a CommonJS module, which may not support all module.exports as named exports.
CommonJS modules can always be imported via the default export.
```

Vitest doesn't do static analysis, and cannot fail before your running code, so you will most likely see this error when running tests, if this feature is disabled:

```
TypeError: createAsyncThunk is not a function
TypeError: default is not a function
```

By default, Vitest assumes you are using a bundler to bypass this and will not fail, but you can disable this behaviour manually, if you code is not processed.

#### `deps.moduleDirectories` {#deps-moduledirectories}

- **Type:** `string[]`
- **Default**: `['node_modules']`

A list of directories that should be treated as module directories. This config option affects the behavior of [`vi.mock`](/api/vi#vi-mock): when no factory is provided and the path of what you are mocking matches one of the `moduleDirectories` values, Vitest will try to resolve the mock by looking for a `__mocks__` folder in the [root](/config/#root) of the project.

This option will also affect if a file should be treated as a module when externalizing dependencies. By default, Vitest imports external modules with native Node.js bypassing Vite transformation step.

Setting this option will _override_ the default, if you wish to still search `node_modules` for packages include it along with any other options:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    deps: {
      moduleDirectories: ['node_modules', path.resolve('../../packages')],
    }
  },
})
```

### `runner` {#runner}

- **Type**: `VitestRunnerConstructor`
- **Default**: `node`, when running tests, or `benchmark`, when running benchmarks

Path to a custom test runner. This is an advanced feature and should be used with custom library runners. You can read more about it in [the documentation](/advanced/runner).

### `benchmark` {#benchmark}

- **Type:** `{ include?, exclude?, ... }`

Options used when running `vitest bench`.

#### `benchmark.include` {#benchmark-include}

- **Type:** `string[]`
- **Default:** `['**/*.{bench,benchmark}.?(c|m)[jt]s?(x)']`

Include globs for benchmark test files

#### `benchmark.exclude` {#benchmark-exclude}

- **Type:** `string[]`
- **Default:** `['node_modules', 'dist', '.idea', '.git', '.cache']`

Exclude globs for benchmark test files

#### `benchmark.includeSource` {#benchmark-includesource}

- **Type:** `string[]`
- **Default:** `[]`

Include globs for in-source benchmark test files. This option is similar to [`includeSource`](#includesource).

When defined, Vitest will run all matched files with `import.meta.vitest` inside.

#### `benchmark.reporters` {#benchmark-reporters}

- **Type:** `Arrayable<BenchmarkBuiltinReporters | Reporter>`
- **Default:** `'default'`

Custom reporter for output. Can contain one or more built-in report names, reporter instances, and/or paths to custom reporters.

#### `benchmark.outputFile` {#benchmark-outputfile}

- **Type:** `string | Record<string, string>`

Write benchmark results to a file when the `--reporter=json` option is also specified.
By providing an object instead of a string you can define individual outputs when using multiple reporters.

To provide object via CLI command, use the following syntax: `--outputFile.json=./path --outputFile.junit=./other-path`.

### `alias` {#alias}

- **Type:** `Record<string, string> | Array<{ find: string | RegExp, replacement: string, customResolver?: ResolverFunction | ResolverObject }>`

Define custom aliases when running inside tests. They will be merged with aliases from `resolve.alias`.

### `globals` {#globals}

- **Type:** `boolean`
- **Default:** `false`
- **CLI:** `--globals`, `--globals=false`

By default, `vitest` does not provide global APIs for explicitness. If you prefer to use the APIs globally like Jest, you can pass the `--globals` option to CLI or add `globals: true` in the config.

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
  },
})
```

To get TypeScript working with the global APIs, add `vitest/globals` to the `types` field in your `tsconfig.json`

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

If you are already using [`unplugin-auto-import`](https://github.com/antfu/unplugin-auto-import) in your project, you can also use it directly for auto importing those APIs.

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    AutoImport({
      imports: ['vitest'],
      dts: true, // generate TypeScript declaration
    }),
  ],
})
```

### `environment` {#environment}

- **Type:** `'node' | 'jsdom' | 'happy-dom' | 'edge-runtime' | string`
- **Default:** `'node'`
- **CLI:** `--environment=<env>`

The environment that will be used for testing. The default environment in Vitest
is a Node.js environment. If you are building a web application, you can use
browser-like environment through either [`jsdom`](https://github.com/jsdom/jsdom)
or [`happy-dom`](https://github.com/capricorn86/happy-dom) instead.
If you are building edge functions, you can use [`edge-runtime`](https://edge-runtime.vercel.app/packages/vm) environment

By adding a `@vitest-environment` docblock or comment at the top of the file,
you can specify another environment to be used for all tests in that file:

Docblock style:

```js
/**
 * @vitest-environment jsdom
 */

test('use jsdom in this test file', () => {
  const element = document.createElement('div')
  expect(element).not.toBeNull()
})
```

Comment style:

```js
// @vitest-environment happy-dom

test('use happy-dom in this test file', () => {
  const element = document.createElement('div')
  expect(element).not.toBeNull()
})
```

For compatibility with Jest, there is also a `@jest-environment`:

```js
/**
 * @jest-environment jsdom
 */

test('use jsdom in this test file', () => {
  const element = document.createElement('div')
  expect(element).not.toBeNull()
})
```

If you are running Vitest with [`--threads=false`](#threads) flag, your tests will be run in this order: `node`, `jsdom`, `happy-dom`, `edge-runtime`, `custom environments`. Meaning, that every test with the same environment is grouped together, but is still running sequentially.

Starting from 0.23.0, you can also define custom environment. When non-builtin environment is used, Vitest will try to load package `vitest-environment-${name}`. That package should export an object with the shape of `Environment`:

```ts
import type { Environment } from 'vitest'

export default <Environment>{
  name: 'custom',
  transformMode: 'ssr',
  setup() {
    // custom setup
    return {
      teardown() {
        // called after all tests with this env have been run
      }
    }
  }
}
```

Vitest also exposes `builtinEnvironments` through `vitest/environments` entry, in case you just want to extend it. You can read more about extending environments in [our guide](/guide/environment).

### `environmentOptions` {#environmentoptions}

- **Type:** `Record<'jsdom' | string, unknown>`
- **Default:** `{}`

These options are passed down to `setup` method of current [`environment`](#environment). By default, you can configure only JSDOM options, if you are using it as your test environment.

### `environmentMatchGlobs` {#environmentmatchglobs}

- **Type:** `[string, EnvironmentName][]`
- **Default:** `[]`

Automatically assign environment based on globs. The first match will be used.

For example:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environmentMatchGlobs: [
      // all tests in tests/dom will run in jsdom
      ['tests/dom/**', 'jsdom'],
      // all tests in tests/ with .edge.test.ts will run in edge-runtime
      ['**\/*.edge.test.ts', 'edge-runtime'],
      // ...
    ]
  }
})
```

### `poolMatchGlobs` {#poolmatchglobs}

- **Type:** `[string, 'threads' | 'forks' | 'vmThreads' | 'typescript'][]`
- **Default:** `[]`
- **Version:** Since Vitest 0.29.4

Automatically assign pool in which tests will run based on globs. The first match will be used.

For example:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    poolMatchGlobs: [
      // all tests in "worker-specific" directory will run inside a worker as if you enabled `--threads` for them,
      ['**/tests/worker-specific/**', 'threads'],
      // run all tests in "browser" directory in an actual browser
      ['**/tests/browser/**', 'browser'],
      // all other tests will run based on "browser.enabled" and "threads" options, if you didn't specify other globs
      // ...
    ]
  }
})
```

### `update`<NonProjectOption /> {#update}

- **Type:** `boolean`
- **Default:** `false`
- **CLI:** `-u`, `--update`, `--update=false`

Update snapshot files. This will update all changed snapshots and delete obsolete ones.

### `watch`<NonProjectOption /> {#watch}

- **Type:** `boolean`
- **Default:** `true`
- **CLI:** `-w`, `--watch`, `--watch=false`

Enable watch mode

### `root`

- **Type:** `string`
- **CLI:** `-r <path>`, `--root=<path>`

Project root

### `reporters`<NonProjectOption /> {#reporters}

- **Type:** `Reporter | Reporter[]`
- **Default:** `'default'`
- **CLI:** `--reporter=<name>`, `--reporter=<name1> --reporter=<name2>`

Custom reporters for output. Reporters can be [a Reporter instance](https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/types/reporter.ts) or a string to select built in reporters:

  - `'default'` - collapse suites when they pass
  - `'basic'` - give a reporter like default reporter in ci
  - `'verbose'` - keep the full task tree visible
  - `'dot'` -  show each task as a single dot
  - `'junit'` - JUnit XML reporter (you can configure `testsuites` tag name with `VITEST_JUNIT_SUITE_NAME` environmental variable, and `classname` tag property with `VITEST_JUNIT_CLASSNAME`)
  - `'json'` -  give a simple JSON summary
  - `'html'` -  outputs HTML report based on [`@vitest/ui`](/guide/ui)
  - `'hanging-process'` - displays a list of hanging processes, if Vitest cannot exit process safely. This might be a heavy operation, enable it only if Vitest consistently cannot exit process
  - path of a custom reporter (e.g. `'./path/to/reporter.ts'`, `'@scope/reporter'`)

### `outputFile`<NonProjectOption /> {#outputfile}

- **Type:** `string | Record<string, string>`
- **CLI:** `--outputFile=<path>`, `--outputFile.json=./path`

Write test results to a file when the `--reporter=json`, `--reporter=html` or `--reporter=junit` option is also specified.
By providing an object instead of a string you can define individual outputs when using multiple reporters.

### `pool`<NonProjectOption /> {#pool}

- **Type:** `'threads' | 'forks' | 'vmThreads'`
- **Default:** `'threads'`
- **CLI:** `--pool=threads`
- **Version:** Since Vitest 1.0.0-beta

Pool used to run tests in.

#### `threads`<NonProjectOption /> {#threads}

Enable multi-threading using [tinypool](https://github.com/tinylibs/tinypool) (a lightweight fork of [Piscina](https://github.com/piscinajs/piscina)). When using threads you are unable to use process related APIs such as `process.chdir()`. Some libraries written in native languages, such as Prisma, `bcrypt` and `canvas`, have problems when running in multiple threads and run into segfaults. In these cases it is adviced to use `forks` pool instead.

#### `forks`<NonProjectOption /> {#forks}

Similar as `threads` pool but uses `child_process` instead of `worker_threads` via [tinypool](https://github.com/tinylibs/tinypool). Communication between tests and main process is not as fast as with `threads` pool. Process related APIs such as `process.chdir()` are available in `forks` pool.

#### `vmThreads`<NonProjectOption /> {#vmthreads}

Run tests using [VM context](https://nodejs.org/api/vm.html) (inside a sandboxed environment) in a `threads` pool.

This makes tests run faster, but the VM module is unstable when running [ESM code](https://github.com/nodejs/node/issues/37648). Your tests will [leak memory](https://github.com/nodejs/node/issues/33439) - to battle that, consider manually editing [`poolOptions.vmThreads.memoryLimit`](#pooloptions-vmthreads-memorylimit) value.

:::warning AVISO
Running code in a sandbox has some advantages (faster tests), but also comes with a number of disadvantages.

- The globals within native modules, such as (`fs`, `path`, etc), differ from the globals present in your test environment. As a result, any error thrown by these native modules will reference a different Error constructor compared to the one used in your code:

```ts
try {
  fs.writeFileSync('/doesnt exist')
}
catch (err) {
  console.log(err instanceof Error) // false
}
```

- Importing ES modules caches them indefinitely which introduces memory leaks if you have a lot of contexts (test files). There is no API in Node.js that clears that cache.
- Accessing globals [takes longer](https://github.com/nodejs/node/issues/31658) in a sandbox environment.

Please, be aware of these issues when using this option. Vitest team cannot fix any of the issues on our side.
:::

### `poolOptions`<NonProjectOption /> {#pooloptions}

- **Type:** `Record<'threads' | 'forks' | 'vmThreads', {}>`
- **Default:** `{}`
- **Version:** Since Vitest 1.0.0-beta

#### `poolOptions.threads`<NonProjectOption /> {#pooloptions-threads}

Options for `threads` pool.

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    poolOptions: {
      threads: {
        // Threads related options here
      }
    }
  }
})
```

##### `poolOptions.threads.maxThreads`<NonProjectOption /> {#pooloptions-threads-maxthreads}

- **Type:** `number`
- **Default:** _available CPUs_

Maximum number of threads. You can also use `VITEST_MAX_THREADS` environment variable.

##### `poolOptions.threads.minThreads`<NonProjectOption /> {#pooloptions-threads-minthreads}

- **Type:** `number`
- **Default:** _available CPUs_

Minimum number of threads. You can also use `VITEST_MIN_THREADS` environment variable.

##### `poolOptions.threads.singleThread`<NonProjectOption /> {#pooloptions-threads-singlethread}

- **Type:** `boolean`
- **Default:** `false`

Run all tests with the same environment inside a single worker thread. This will disable built-in module isolation (your source code or [inlined](#deps-inline) code will still be reevaluated for each test), but can improve test performance.


:::warning AVISO
Even though this option will force tests to run one after another, this option is different from Jest's `--runInBand`. Vitest uses workers not only for running tests in parallel, but also to provide isolation. By disabling this option, your tests will run sequentially, but in the same global context, so you must provide isolation yourself.

This might cause all sorts of issues, if you are relying on global state (frontend frameworks usually do) or your code relies on environment to be defined separately for each test. But can be a speed boost for your tests (up to 3 times faster), that don't necessarily rely on global state or can easily bypass that.
:::

##### `poolOptions.threads.useAtomics`<NonProjectOption /> {#pooloptions-threads-useatomics}

- **Type:** `boolean`
- **Default:** `false`

Use Atomics to synchronize threads.

This can improve performance in some cases, but might cause segfault in older Node versions.

##### `poolOptions.threads.isolate`<NonProjectOption /> {#pooloptions-threads-isolate}

- **Type:** `boolean`
- **Default:** `true`

Isolate environment for each test file.

#### `poolOptions.forks`<NonProjectOption /> {#pooloptions-forks}

Options for `forks` pool.

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    poolOptions: {
      forks: {
        // Forks related options here
      }
    }
  }
})
```

##### `poolOptions.forks.maxForks`<NonProjectOption /> {#pooloptions-forks-maxforks}

- **Type:** `number`
- **Default:** _available CPUs_

Maximum number of forks.

##### `poolOptions.forks.minForks`<NonProjectOption /> {#pooloptions-forks-minforks}

- **Type:** `number`
- **Default:** _available CPUs_

Minimum number of forks.

##### `poolOptions.forks.isolate`<NonProjectOption /> {#pooloptions-forks-isolate}

- **Type:** `boolean`
- **Default:** `true`

Isolate environment for each test file.

##### `poolOptions.forks.singleFork`<NonProjectOption /> {#pooloptions-forks-singlefork}

- **Type:** `boolean`
- **Default:** `false`

Run all tests with the same environment inside a single child process. This will disable built-in module isolation (your source code or [inlined](#deps-inline) code will still be reevaluated for each test), but can improve test performance.


:::warning AVISO
Even though this option will force tests to run one after another, this option is different from Jest's `--runInBand`. Vitest uses child processes not only for running tests in parallel, but also to provide isolation. By disabling this option, your tests will run sequentially, but in the same global context, so you must provide isolation yourself.

This might cause all sorts of issues, if you are relying on global state (frontend frameworks usually do) or your code relies on environment to be defined separately for each test. But can be a speed boost for your tests (up to 3 times faster), that don't necessarily rely on global state or can easily bypass that.
:::

#### `poolOptions.vmThreads`<NonProjectOption /> {#pooloptions-vmthreads}

Options for `vmThreads` pool.

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    poolOptions: {
      vmThreads: {
        // VM threads related options here
      }
    }
  }
})
```

##### `poolOptions.vmThreads.maxThreads`<NonProjectOption /> {#pooloptions-vmthreads-maxthreads}

- **Type:** `number`
- **Default:** _available CPUs_

Maximum number of threads. You can also use `VITEST_MAX_THREADS` environment variable.

##### `poolOptions.vmThreads.minThreads`<NonProjectOption /> {#pooloptions-vmthreads-minthreads}

- **Type:** `number`
- **Default:** _available CPUs_

Minimum number of threads. You can also use `VITEST_MIN_THREADS` environment variable.

##### `poolOptions.vmThreads.memoryLimit`<NonProjectOption /> {#pooloptions-vmthreads-memorylimit}

- **Type:** `string | number`
- **Default:** `1 / CPU Cores`

Specifies the memory limit for workers before they are recycled. This value heavily depends on your environment, so it's better to specify it manually instead of relying on the default.

:::tip DICA
The implementation is based on Jest's [`workerIdleMemoryLimit`](https://jestjs.io/docs/configuration#workeridlememorylimit-numberstring).

The limit can be specified in a number of different ways and whatever the result is `Math.floor` is used to turn it into an integer value:

- `<= 1` - The value is assumed to be a percentage of system memory. So 0.5 sets the memory limit of the worker to half of the total system memory
- `\> 1` - Assumed to be a fixed byte value. Because of the previous rule if you wanted a value of 1 byte (I don't know why) you could use 1.1.
- With units
  - `50%` - As above, a percentage of total system memory
  - `100KB`, `65MB`, etc - With units to denote a fixed memory limit.
    - `K` / `KB` - Kilobytes (x1000)
    - `KiB` - Kibibytes (x1024)
    - `M` / `MB` - Megabytes
    - `MiB` - Mebibytes
    - `G` / `GB` - Gigabytes
    - `GiB` - Gibibytes
:::

:::warning AVISO
Percentage based memory limit [does not work on Linux CircleCI](https://github.com/jestjs/jest/issues/11956#issuecomment-1212925677) workers due to incorrect system memory being reported.
:::

##### `poolOptions.vmThreads.useAtomics`<NonProjectOption /> {#pooloptions-vmthreads-useatomics}

- **Type:** `boolean`
- **Default:** `false`

Use Atomics to synchronize threads.

This can improve performance in some cases, but might cause segfault in older Node versions.

### `testTimeout` {#testtimeout}

- **Type:** `number`
- **Default:** `5000`
- **CLI:** `--test-timeout=5000`

Default timeout of a test in milliseconds

### `hookTimeout` {#hooktimeout}

- **Type:** `number`
- **Default:** `10000`

Default timeout of a hook in milliseconds

### `teardownTimeout`<NonProjectOption /> {#teardowntimeout}

- **Type:** `number`
- **Default:** `10000`

Default timeout to wait for close when Vitest shuts down, in milliseconds

### `silent`<NonProjectOption /> {#silent}

- **Type:** `boolean`
- **Default:** `false`
- **CLI:** `--silent`, `--silent=false`

Silent console output from tests

### `setupFiles` {#setupfiles}

- **Type:** `string | string[]`

Path to setup files. They will be run before each test file.

:::info INFORMAÇÃO
Changing setup files will trigger rerun of all tests.
:::

You can use `process.env.VITEST_POOL_ID` (integer-like string) inside to distinguish between threads.

:::tip DICA
Note, that if you are running [`--threads=false`](#threads), this setup file will be run in the same global scope multiple times. Meaning, that you are accessing the same global object before each test, so make sure you are not doing the same thing more than you need.
:::

For example, you may rely on a global variable:

```ts
import { config } from '@some-testing-lib'

if (!globalThis.defined) {
  config.plugins = [myCoolPlugin]
  computeHeavyThing()
  globalThis.defined = true
}

// hooks are reset before each suite
afterEach(() => {
  cleanup()
})

globalThis.resetBeforeEachTest = true
```

### `globalSetup` {#globalsetup}

- **Type:** `string | string[]`

Path to global setup files, relative to project root.

A global setup file can either export named functions `setup` and `teardown` or a `default` function that returns a teardown function ([example](https://github.com/vitest-dev/vitest/blob/main/test/global-setup/vitest.config.ts)).

:::info INFORMAÇÃO
Multiple globalSetup files are possible. setup and teardown are executed sequentially with teardown in reverse order.
:::

:::warning AVISO
Beware that the global setup is running in a different global scope, so your tests don't have access to variables defined here. Also, since Vitest 1.0.0-beta, global setup runs only if there is at least one running test. This means that global setup might start running during watch mode after test file is changed, for example (the test file will wait for global setup to finish before running).
:::


### `watchExclude`<NonProjectOption /> {#watchexclude}

- **Type:** `string[]`
- **Default:** `['**/node_modules/**', '**/dist/**']`

Glob pattern of file paths to be ignored from triggering watch rerun.

### `forceRerunTriggers`<NonProjectOption /> {#forcereruntriggers}

- **Type**: `string[]`
- **Default:** `['**/package.json/**', '**/vitest.config.*/**', '**/vite.config.*/**']`

Glob pattern of file paths that will trigger the whole suite rerun. When paired with the `--changed` argument will run the whole test suite if the trigger is found in the git diff.

Useful if you are testing calling CLI commands, because Vite cannot construct a module graph:

```ts
test('execute a script', async () => {
  // Vitest cannot rerun this test, if content of `dist/index.js` changes
  await execa('node', ['dist/index.js'])
})
```

:::tip DICA
Make sure that your files are not excluded by `watchExclude`.
:::

### `coverage`<NonProjectOption /> {#coverage}

You can use [`v8`](https://v8.dev/blog/javascript-code-coverage), [`istanbul`](https://istanbul.js.org/) or [a custom coverage solution](/guide/coverage#custom-coverage-provider) for coverage collection.

You can provide coverage options to CLI with dot notation:

```sh
npx vitest --coverage.enabled --coverage.provider=istanbul --coverage.all
```

:::warning AVISO
If you are using coverage options with dot notation, don't forget to specify `--coverage.enabled`. Do not provide a single `--coverage` option in that case.
:::

#### `coverage.provider` {#coverage-provider}

- **Type:** `'v8' | 'istanbul' | 'custom'`
- **Default:** `'v8'`
- **CLI:** `--coverage.provider=<provider>`

Use `provider` to select the tool for coverage collection.

#### `coverage.enabled` {#coverage-enabled}

- **Type:** `boolean`
- **Default:** `false`
- **Available for providers:** `'v8' | 'istanbul'`
- **CLI:** `--coverage.enabled`, `--coverage.enabled=false`

Enables coverage collection. Can be overridden using `--coverage` CLI option.

#### `coverage.include` {#coverage-include}

- **Type:** `string[]`
- **Default:** `['**']`
- **Available for providers:** `'v8' | 'istanbul'`
- **CLI:** `--coverage.include=<path>`, `--coverage.include=<path1> --coverage.include=<path2>`

List of files included in coverage as glob patterns

#### `coverage.extension` {#coverage-extension}

- **Type:** `string | string[]`
- **Default:** `['.js', '.cjs', '.mjs', '.ts', '.mts', '.cts', '.tsx', '.jsx', '.vue', '.svelte', '.marko']`
- **Available for providers:** `'v8' | 'istanbul'`
- **CLI:** `--coverage.extension=<extension>`, `--coverage.extension=<extension1> --coverage.extension=<extension2>`

#### `coverage.exclude` {#coverage-exclude}

- **Type:** `string[]`
- **Default:**
```js
[
  'coverage/**',
  'dist/**',
  'packages/*/test?(s)/**',
  '**/*.d.ts',
  '**/virtual:*',
  '**/__x00__*',
  '**/\x00*',
  'cypress/**',
  'test?(s)/**',
  'test?(-*).?(c|m)[jt]s?(x)',
  '**/*{.,-}{test,spec}.?(c|m)[jt]s?(x)',
  '**/__tests__/**',
  '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
  '**/vitest.{workspace,projects}.[jt]s?(on)',
  '**/.{eslint,mocha,prettier}rc.{?(c|m)js,yml}',
]
```
- **Available for providers:** `'v8' | 'istanbul'`
- **CLI:** `--coverage.exclude=<path>`, `--coverage.exclude=<path1> --coverage.exclude=<path2>`

List of files excluded from coverage as glob patterns.

#### `coverage.all` {#coverage-all}

- **Type:** `boolean`
- **Default:** `true` (since Vitest `1.0.0`)
- **Available for providers:** `'v8' | 'istanbul'`
- **CLI:** `--coverage.all`, `--coverage.all=false`

Whether to include all files, including the untested ones into report.

#### `coverage.clean` {#coverage-clean}

- **Type:** `boolean`
- **Default:** `true`
- **Available for providers:** `'v8' | 'istanbul'`
- **CLI:** `--coverage.clean`, `--coverage.clean=false`

Clean coverage results before running tests

#### `coverage.cleanOnRerun` {#coverage-cleanonrerun}

- **Type:** `boolean`
- **Default:** `true`
- **Available for providers:** `'v8' | 'istanbul'`
- **CLI:** `--coverage.cleanOnRerun`, `--coverage.cleanOnRerun=false`

Clean coverage report on watch rerun

#### `coverage.reportsDirectory` {#coverage-reportsdirectory}

- **Type:** `string`
- **Default:** `'./coverage'`
- **Available for providers:** `'v8' | 'istanbul'`
- **CLI:** `--coverage.reportsDirectory=<path>`

Directory to write coverage report to.

#### `coverage.reporter` {#coverage-reporter}

- **Type:** `string | string[] | [string, {}][]`
- **Default:** `['text', 'html', 'clover', 'json']`
- **Available for providers:** `'v8' | 'istanbul'`
- **CLI:** `--coverage.reporter=<reporter>`, `--coverage.reporter=<reporter1> --coverage.reporter=<reporter2>`

Coverage reporters to use. See [istanbul documentation](https://istanbul.js.org/docs/advanced/alternative-reporters/) for detailed list of all reporters. See [`@types/istanbul-reporter`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/276d95e4304b3670eaf6e8e5a7ea9e265a14e338/types/istanbul-reports/index.d.ts) for details about reporter specific options.

The reporter has three different types:

- A single reporter: `{ reporter: 'html' }`
- Multiple reporters without options: `{ reporter: ['html', 'json'] }`
- A single or multiple reporters with reporter options:
  <!-- eslint-skip -->
  ```ts
  {
    reporter: [
      ['lcov', { 'projectRoot': './src' }],
      ['json', { 'file': 'coverage.json' }],
      ['text']
    ]
  }
  ```

Since Vitest 0.31.0, you can check your coverage report in Vitest UI: check [Vitest UI Coverage](/guide/coverage#vitest-ui) for more details.

#### `coverage.reportOnFailure` {#coverage-reportonfailure}

- **Type:** `boolean`
- **Default:** `false` (since Vitest `0.34.0`)
- **Available for providers:** `'v8' | 'istanbul'`
- **CLI:** `--coverage.reportOnFailure`, `--coverage.reportOnFailure=false`
- **Version:** Since Vitest 0.31.2

Generate coverage report even when tests fail.

#### `coverage.allowExternal` {#coverage-allowexternal}

- **Type:** `boolean`
- **Default:** `false`
- **Available for providers:** `'v8' | 'istanbul'`
- **CLI:** `--coverage.allowExternal`, `--coverage.allowExternal=false`

Collect coverage of files outside the [project `root`](https://vitest.dev/config/#root).

#### `coverage.skipFull` {#coverage-skipfull}

- **Type:** `boolean`
- **Default:** `false`
- **Available for providers:** `'v8' | 'istanbul'`
- **CLI:** `--coverage.skipFull`, `--coverage.skipFull=false`

Do not show files with 100% statement, branch, and function coverage.

#### `coverage.perFile` {#coverage-perfile}

- **Type:** `boolean`
- **Default:** `false`
- **Available for providers:** `'v8' | 'istanbul'`
- **CLI:** `--coverage.perFile`, `--coverage.perFile=false`

Check thresholds per file.
See `lines`, `functions`, `branches` and `statements` for the actual thresholds.

#### `coverage.thresholdAutoUpdate` {#coverage-thresholdautoupdate}

- **Type:** `boolean`
- **Default:** `false`
- **Available for providers:** `'v8' | 'istanbul'`
- **CLI:** `--coverage.thresholdAutoUpdate=<boolean>`

Update threshold values `lines`, `functions`, `branches` and `statements` to configuration file when current coverage is above the configured thresholds.
This option helps to maintain thresholds when coverage is improved.

#### `coverage.lines` {#coverage-lines}

- **Type:** `number`
- **Available for providers:** `'v8' | 'istanbul'`
- **CLI:** `--coverage.lines=<number>`

Threshold for lines.
See [istanbul documentation](https://github.com/istanbuljs/nyc#coverage-thresholds) for more information.

#### `coverage.functions` {#coverage-functions}

- **Type:** `number`
- **Available for providers:** `'v8' | 'istanbul'`
- **CLI:** `--coverage.functions=<number>`

Threshold for functions.
See [istanbul documentation](https://github.com/istanbuljs/nyc#coverage-thresholds) for more information.

#### `coverage.branches` {#coverage-branches}

- **Type:** `number`
- **Available for providers:** `'v8' | 'istanbul'`
- **CLI:** `--coverage.branches=<number>`

Threshold for branches.
See [istanbul documentation](https://github.com/istanbuljs/nyc#coverage-thresholds) for more information.

#### `coverage.statements` {#coverage-statements}

- **Type:** `number`
- **Available for providers:** `'v8' | 'istanbul'`
- **CLI:** `--coverage.statements=<number>`

Threshold for statements.
See [istanbul documentation](https://github.com/istanbuljs/nyc#coverage-thresholds) for more information.

#### `coverage.100` {#coverage-100}

- **Type:** `boolean`
- **Default:** `false`
- **Available for providers:** `'v8' | 'istanbul'`
- **CLI:** `--coverage.100`, `--coverage.100=false`

Shortcut for `--coverage.lines 100 --coverage.functions 100 --coverage.branches 100 --coverage.statements 100`.

#### `coverage.ignoreClassMethods` {#coverage-ignoreclassmethods}

- **Type:** `string[]`
- **Default:** `[]`
- **Available for providers:** `'istanbul'`
- **CLI:** `--coverage.ignoreClassMethods=<method>`

Set to array of class method names to ignore for coverage.
See [istanbul documentation](https://github.com/istanbuljs/nyc#ignoring-methods) for more information.

#### `coverage.watermarks` {#coverage.watermarks}

- **Type:**
<!-- eslint-skip -->
```ts
{
  statements?: [number, number],
  functions?: [number, number],
  branches?: [number, number],
  lines?: [number, number]
}
```

- **Default:**
<!-- eslint-skip -->
```ts
{
  statements: [50, 80],
  functions: [50, 80],
  branches: [50, 80],
  lines: [50, 80]
}
```

- **Available for providers:** `'v8' | 'istanbul'`

Watermarks for statements, lines, branches and functions. See [istanbul documentation](https://github.com/istanbuljs/nyc#high-and-low-watermarks) for more information.

#### `coverage.customProviderModule` {#coverage-customprovidermodule}

- **Type:** `string`
- **Available for providers:** `'custom'`
- **CLI:** `--coverage.customProviderModule=<path or module name>`

Specifies the module name or path for the custom coverage provider module. See [Guide - Custom Coverage Provider](/guide/coverage#custom-coverage-provider) for more information.

### `testNamePattern`<NonProjectOption /> {#testnamepattern}

- **Type** `string | RegExp`
- **CLI:** `-t <pattern>`, `--testNamePattern=<pattern>`, `--test-name-pattern=<pattern>`

Run tests with full names matching the pattern.
If you add `OnlyRunThis` to this property, tests not containing the word `OnlyRunThis` in the test name will be skipped.

```js
import { expect, test } from 'vitest'

// run
test('OnlyRunThis', () => {
  expect(true).toBe(true)
})

// skipped
test('doNotRun', () => {
  expect(true).toBe(true)
})
```

### `open`<NonProjectOption /> {#open}

- **Type:** `boolean`
- **Default:** `false`
- **CLI:** `--open`, `--open=false`

Open Vitest UI (WIP)

### `api` {#api}

- **Type:** `boolean | number`
- **Default:** `false`
- **CLI:** `--api`, `--api.port`, `--api.host`, `--api.strictPort`

Listen to port and serve API. When set to true, the default port is 51204

### `browser` {#browser}

- **Type:** `{ enabled?, name?, provider?, headless?, api?, slowHijackESM? }`
- **Default:** `{ enabled: false, headless: process.env.CI, api: 63315 }`
- **Version:** Since Vitest 0.29.4
- **CLI:** `--browser`, `--browser=<name>`, `--browser.name=chrome --browser.headless`

Run Vitest tests in a browser. We use [WebdriverIO](https://webdriver.io/) for running tests by default, but it can be configured with [browser.provider](/config/#browser-provider) option.

:::tip NOTA
Read more about testing in a real browser in the [guide page](/guide/browser).
:::

:::warning AVISO
This is an experimental feature. Breaking changes might not follow semver, please pin Vitest's version when using it.
:::

#### `browser.enabled` {#browser-enabled}

- **Type:** `boolean`
- **Default:** `false`
- **CLI:** `--browser`, `--browser.enabled=false`

Run all tests inside a browser by default. Can be overriden with [`poolMatchGlobs`](/config/#poolmatchglobs) option.

#### `browser.name` {#browser-name}

- **Type:** `string`
- **CLI:** `--browser=safari`

Run all tests in a specific browser. Possible options in different providers:

- `webdriverio`: `firefox`, `chrome`, `edge`, `safari`
- `playwright`: `firefox`, `webkit`, `chromium`
- custom: any string that will be passed to the provider

#### `browser.headless` {#browser-headless}

- **Type:** `boolean`
- **Default:** `process.env.CI`
- **CLI:** `--browser.headless`, `--browser.headless=false`

Run the browser in a `headless` mode. If you are running Vitest in CI, it will be enabled by default.

#### `browser.isolate` {#browser-isolate}

- **Type:** `boolean`
- **Default:** `true`
- **CLI:** `--browser.isolate`, `--browser.isolate=false`

Isolate test environment after each test.

#### `browser.api` {#browser-api}

- **Type:** `number | { port?, strictPort?, host? }`
- **Default:** `63315`
- **CLI:** `--browser.api=63315`, `--browser.api.port=1234, --browser.api.host=example.com`

Configure options for Vite server that serves code in the browser. Does not affect [`test.api`](/config/#api) option.

#### `browser.provider` {#browser-provider}

- **Type:** `'webdriverio' | 'playwright' | string`
- **Default:** `'webdriverio'`
- **CLI:** `--browser.provider=playwright`

Path to a provider that will be used when running browser tests. Vitest provides two providers which are `webdriverio` (default) and `playwright`. Custom providers should be exported using `default` export and have this shape:

```ts
export interface BrowserProvider {
  name: string
  getSupportedBrowsers(): readonly string[]
  initialize(ctx: Vitest, options: { browser: string }): Awaitable<void>
  openPage(url: string): Awaitable<void>
  close(): Awaitable<void>
}
```

:::warning AVISO
This is an advanced API for library authors. If you just need to run tests in a browser, use the [browser](/config/#browser) option.
:::

#### `browser.slowHijackESM` {#browser-slowhijackesm}

- **Type:** `boolean`
- **Default:** `true`
- **Version:** Since Vitest 0.31.0

When running tests in Node.js Vitest can use its own module resolution to easily mock modules with `vi.mock` syntax. However it's not so easy to replicate ES module resolution in browser, so we need to transform your source files before browser can consume it.

This option has no effect on tests running inside Node.js.

This options is enabled by default when running in the browser. If you don't rely on spying on ES modules with `vi.spyOn` and don't use `vi.mock`, you can disable this to get a slight boost to performance.


### `clearMocks` {#clearmocks}

- **Type:** `boolean`
- **Default:** `false`

Will call [`.mockClear()`](/api/mock#mockclear) on all spies before each test. This will clear mock history, but not reset its implementation to the default one.

### `mockReset` {#mockreset}

- **Type:** `boolean`
- **Default:** `false`

Will call [`.mockReset()`](/api/mock#mockreset) on all spies before each test. This will clear mock history and reset its implementation to an empty function (will return `undefined`).

### `restoreMocks` {#restoremocks}

- **Type:** `boolean`
- **Default:** `false`

Will call [`.mockRestore()`](/api/mock#mockrestore) on all spies before each test. This will clear mock history and reset its implementation to the original one.

### `unstubEnvs` {#unstubenvs}

- **Type:** `boolean`
- **Default:** `false`
- **Version:** Since Vitest 0.26.0

Will call [`vi.unstubAllEnvs`](/api/vi#vi-unstuballenvs) before each test.

### `unstubGlobals` {#unstubglobals}

- **Type:** `boolean`
- **Default:** `false`
- **Version:** Since Vitest 0.26.0

Will call [`vi.unstubAllGlobals`](/api/vi#vi-unstuballglobals) before each test.

### `testTransformMode` {#testtransformmode}

 - **Type:** `{ web?, ssr? }`
 - **Version:** Since Vitest 0.34.0

 Determine the transform method for all modules imported inside a test that matches the glob pattern. By default, relies on the environment. For example, tests with JSDOM environment will process all files with `ssr: false` flag and tests with Node environment process all modules with `ssr: true`.

 #### `testTransformMode.ssr` {#testtransformmode-ssr}

 - **Type:** `string[]`
 - **Default:** `[]`

 Use SSR transform pipeline for all modules inside specified tests.<br>
 Vite plugins will receive `ssr: true` flag when processing those files.

 #### `testTransformMode.web` {#testtransformmode-web}

 - **Type:** `string[]`
 - **Default:** `[]`

 First do a normal transform pipeline (targeting browser), then do a SSR rewrite to run the code in Node.<br>
 Vite plugins will receive `ssr: false` flag when processing those files.

### `snapshotFormat`<NonProjectOption /> {#snapshotformat}

- **Type:** `PrettyFormatOptions`

Format options for snapshot testing. These options are passed down to [`pretty-format`](https://www.npmjs.com/package/pretty-format).

:::tip DICA
Beware that `plugins` field on this object will be ignored.

If you need to extend snapshot serializer via pretty-format plugins, please, use [`expect.addSnapshotSerializer`](/api/expect#expect-addsnapshotserializer) API.
:::

### `resolveSnapshotPath`<NonProjectOption /> {#resolvesnapshotpath}

- **Type**: `(testPath: string, snapExtension: string) => string`
- **Default**: stores snapshot files in `__snapshots__` directory

Overrides default snapshot path. For example, to store snapshots next to test files:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    resolveSnapshotPath: (testPath, snapExtension) => testPath + snapExtension,
  },
})
```

### `allowOnly` {#allowonly}

- **Type**: `boolean`
- **Default**: `false`
- **CLI:** `--allowOnly`, `--allowOnly=false`

Allow tests and suites that are marked as only.

### `dangerouslyIgnoreUnhandledErrors`<NonProjectOption /> {#dangerouslyignoreunhandlederrors}

- **Type**: `boolean`
- **Default**: `false`
- **CLI:** `--dangerouslyIgnoreUnhandledErrors` `--dangerouslyIgnoreUnhandledErrors=false`

Ignore any unhandled errors that occur.

### `passWithNoTests`<NonProjectOption /> {#passwithnotests}

- **Type**: `boolean`
- **Default**: `false`
- **CLI:** `--passWithNoTests`, `--passWithNoTests=false`

Vitest will not fail, if no tests will be found.

### `logHeapUsage` {#logheapusage}

- **Type**: `boolean`
- **Default**: `false`
- **CLI:** `--logHeapUsage`, `--logHeapUsage=false`

Show heap usage after each test. Useful for debugging memory leaks.

### `css` {#css}

- **Type**: `boolean | { include?, exclude?, modules? }`

Configure if CSS should be processed. When excluded, CSS files will be replaced with empty strings to bypass the subsequent processing. CSS Modules will return a proxy to not affect runtime.

#### `css.include` {#css-include}

- **Type**: `RegExp | RegExp[]`
- **Default**: `[]`

RegExp pattern for files that should return actual CSS and will be processed by Vite pipeline.

:::tip DICA
To process all CSS files, use `/.+/`.
:::

#### `css.exclude` {#css-exclude}

- **Type**: `RegExp | RegExp[]`
- **Default**: `[]`

RegExp pattern for files that will return an empty CSS file.

#### `css.modules` {#css-modules}

- **Type**: `{ classNameStrategy? }`
- **Default**: `{}`

#### `css.modules.classNameStrategy` {#css-modules-classnamestrategy}

- **Type**: `'stable' | 'scoped' | 'non-scoped'`
- **Default**: `'stable'`

If you decide to process CSS files, you can configure if class names inside CSS modules should be scoped. You can choose one of the options:

- `stable`: class names will be generated as `_${name}_${hashedFilename}`, which means that generated class will stay the same, if CSS content is changed, but will change, if the name of the file is modified, or file is moved to another folder. This setting is useful, if you use snapshot feature.
- `scoped`: class names will be generated as usual, respecting `css.modules.generateScopeName` method, if you have one and CSS processing is enabled. By default, filename will be generated as `_${name}_${hash}`, where hash includes filename and content of the file.
- `non-scoped`: class names will not be hashed.

:::warning AVISO
By default, Vitest exports a proxy, bypassing CSS Modules processing. If you rely on CSS properties on your classes, you have to enable CSS processing using `include` option.
:::

### `maxConcurrency` {#maxconcurrency}

- **Type**: `number`
- **Default**: `5`

A number of tests that are allowed to run at the same time marked with `test.concurrent`.

Test above this limit will be queued to run when available slot appears.

### `cache`<NonProjectOption /> {#cache}

- **Type**: `false | { dir? }`

Options to configure Vitest cache policy. At the moment Vitest stores cache for test results to run the longer and failed tests first.

#### `cache.dir` {#cache-dir}

- **Type**: `string`
- **Default**: `node_modules/.vitest`

Path to cache directory.

### `sequence` {#sequence}

- **Type**: `{ sequencer?, shuffle?, seed?, hooks?, setupFiles? }`

Options for how tests should be sorted.

You can provide sequence options to CLI with dot notation:

```sh
npx vitest --sequence.shuffle --sequence.seed=1000
```

#### `sequence.sequencer`<NonProjectOption /> {#sequence-sequencer}

- **Type**: `TestSequencerConstructor`
- **Default**: `BaseSequencer`

A custom class that defines methods for sharding and sorting. You can extend `BaseSequencer` from `vitest/node`, if you only need to redefine one of the `sort` and `shard` methods, but both should exist.

Sharding is happening before sorting, and only if `--shard` option is provided.

#### `sequence.shuffle` {#sequence-shuffle}

- **Type**: `boolean`
- **Default**: `false`
- **CLI**: `--sequence.shuffle`, `--sequence.shuffle=false`

If you want tests to run randomly, you can enable it with this option, or CLI argument [`--sequence.shuffle`](/guide/cli).

Vitest usually uses cache to sort tests, so long running tests start earlier - this makes tests run faster. If your tests will run in random order you will lose this performance improvement, but it may be useful to track tests that accidentally depend on another run previously.

#### `sequence.concurrent` {#sequence-concurrent}

- **Type**: `boolean`
- **Default**: `false`
- **CLI**: `--sequence.concurrent`, `--sequence.concurrent=false`
- **Version**: Since Vitest 0.32.2

If you want tests to run in parallel, you can enable it with this option, or CLI argument [`--sequence.concurrent`](/guide/cli).

#### `sequence.seed`<NonProjectOption /> {#sequence-seed}

- **Type**: `number`
- **Default**: `Date.now()`
- **CLI**: `--sequence.seed=1000`

Sets the randomization seed, if tests are running in random order.

#### `sequence.hooks` {#sequence-hooks}

- **Type**: `'stack' | 'list' | 'parallel'`
- **Default**: `'parallel'`
- **CLI**: `--sequence.hooks=<value>`

Changes the order in which hooks are executed.

- `stack` will order "after" hooks in reverse order, "before" hooks will run in the order they were defined
- `list` will order all hooks in the order they are defined
- `parallel` will run hooks in a single group in parallel (hooks in parent suites will still run before the current suite's hooks)

#### `sequence.setupFiles` {#sequence-setupfiles}

- **Type**: `'list' | 'parallel'`
- **Default**: `'parallel'`
- **CLI**: `--sequence.setupFiles=<value>`
- **Version**: Since Vitest 0.29.3

Changes the order in which setup files are executed.

- `list` will run setup files in the order they are defined
- `parallel` will run setup files in parallel

### `typecheck` {#typecheck}

Options for configuring [typechecking](/guide/testing-types) test environment.

#### `typecheck.enabled` {#typecheck-enabled}

- **Type**: `boolean`
- **Default**: `false`
- **CLI**: `--typecheck`, `--typecheck.enabled`
- **Version**: Since Vitest 1.0.0-beta.3

Enable typechecking alongside your regular tests.

#### `typecheck.only` {#typecheck-only}

- **Type**: `boolean`
- **Default**: `false`
- **CLI**: `--typecheck.only`
- **Version**: Since Vitest 1.0.0-beta.3

Run only typecheck tests, when typechecking is enabled. When using CLI, this option will automatically enable typechecking.

#### `typecheck.checker` {#typecheck-checker}

- **Type**: `'tsc' | 'vue-tsc' | string`
- **Default**: `tsc`

What tools to use for type checking. Vitest will spawn a process with certain parameters for easier parsing, depending on the type. Checker should implement the same output format as `tsc`.

You need to have a package installed to use typechecker:

- `tsc` requires `typescript` package
- `vue-tsc` requires `vue-tsc` package

You can also pass down a path to custom binary or command name that produces the same output as `tsc --noEmit --pretty false`.

#### `typecheck.include` {#typecheck-include}

- **Type**: `string[]`
- **Default**: `['**/*.{test,spec}-d.?(c|m)[jt]s?(x)']`

Glob pattern for files that should be treated as test files

#### `typecheck.exclude` {#typecheck-exclude}

- **Type**: `string[]`
- **Default**: `['**/node_modules/**', '**/dist/**', '**/cypress/**', '**/.{idea,git,cache,output,temp}/**']`

Glob pattern for files that should not be treated as test files

#### `typecheck.allowJs` {#typecheck-allowjs}

- **Type**: `boolean`
- **Default**: `false`

Check JS files that have `@ts-check` comment. If you have it enabled in tsconfig, this will not overwrite it.

#### `typecheck.ignoreSourceErrors` {#typecheck-ignoresourceerrors}

- **Type**: `boolean`
- **Default**: `false`

Do not fail, if Vitest found errors outside the test files. This will not show you non-test errors at all.

By default, if Vitest finds source error, it will fail test suite.

#### `typecheck.tsconfig` {#typecheck-tsconfig}

- **Type**: `string`
- **Default**: _tries to find closest tsconfig.json_

Path to custom tsconfig, relative to the project root.

### `slowTestThreshold`<NonProjectOption /> {#slowtestthreshold}

- **Type**: `number`
- **Default**: `300`

The number of milliseconds after which a test is considered slow and reported as such in the results.

### `chaiConfig` {#chaiconfig}

- **Type:** `{ includeStack?, showDiff?, truncateThreshold? }`
- **Default:** `{ includeStack: false, showDiff: true, truncateThreshold: 40 }`
- **Version:** Since Vitest 0.30.0

Equivalent to [Chai config](https://github.com/chaijs/chai/blob/4.x.x/lib/chai/config.js).

#### `chaiConfig.includeStack` {#chaiconfig-includestack}

- **Type:** `boolean`
- **Default:** `false`

Influences whether stack trace is included in Assertion error message. Default of false suppresses stack trace in the error message.

#### `chaiConfig.showDiff` {#chaiconfig-showdiff}

- **Type:** `boolean`
- **Default:** `true`

Influences whether or not the `showDiff` flag should be included in the thrown AssertionErrors. `false` will always be `false`; `true` will be true when the assertion has requested a diff to be shown.

#### `chaiConfig.truncateThreshold` {#chaiconfig-truncatethreshold}

- **Type:** `number`
- **Default:** `40`

Sets length threshold for actual and expected values in assertion errors. If this threshold is exceeded, for example for large data structures, the value is replaced with something like `[ Array(3) ]` or `{ Object (prop1, prop2) }`. Set it to `0` if you want to disable truncating altogether.

This config option affects truncating values in `test.each` titles and inside the assertion error message.

### `bail` {#bail}

- **Type:** `number`
- **Default:** `0`
- **CLI**: `--bail=<value>`
- **Version:** Since Vitest 0.31.0

Stop test execution when given number of tests have failed.

By default Vitest will run all of your test cases even if some of them fail. This may not be desired for CI builds where you are only interested in 100% successful builds and would like to stop test execution as early as possible when test failures occur. The `bail` option can be used to speed up CI runs by preventing it from running more tests when failures have occured.

### `retry` {#retry}

- **Type:** `number`
- **Default:** `0`
- **CLI:** `--retry=<value>`
- **Version:** Since Vitest 0.32.3

Retry the test specific number of times if it fails.

### `onConsoleLog` {#onconsolelog}

- **Type**: `(log: string, type: 'stdout' | 'stderr') => false | void`

Custom handler for `console.log` in tests. If you return `false`, Vitest will not print the log to the console.

Can be useful for filtering out logs from third-party libraries.

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    onConsoleLog(log: string, type: 'stdout' | 'stderr'): boolean | void {
      if (log === 'message from third party library' && type === 'stdout')
        return false
    },
  },
})
```

### `diff` {#diff}

- **Type:** `string`
- **CLI:** `--diff=<value>`
- **Version:** Since Vitest 0.34.5

Path to a diff config that will be used to generate diff interface. Useful if you want to customize diff display.

:::code-group
```ts [vitest.diff.ts]
import type { DiffOptions } from 'vitest'
import c from 'picocolors'

export default {
  aIndicator: c.bold('--'),
  bIndicator: c.bold('++'),
  omitAnnotationLines: true,
} satisfies DiffOptions
```

```ts [vitest.config.js]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    diff: './vitest.diff.ts'
  }
})
```
:::
