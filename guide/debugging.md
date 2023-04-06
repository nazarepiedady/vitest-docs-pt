---
title: Debugging | Guide
---

# Debugging

:::tip
When debugging tests you might want to use `--test-timeout` CLI argument to prevent tests from timing out when stopping at breakpoints.
:::

## VSCode

Quick way to debug tests in VSCode is via `JavaScript Debug Terminal`. Open a new `JavaScript Debug Terminal` and run `npm run test` or `vitest` directly. *this works with any code ran in Node, so will work with most JS testing frameworks*

![image](https://user-images.githubusercontent.com/5594348/212169143-72bf39ce-f763-48f5-822a-0c8b2e6a8484.png)

You can also add a dedicated launch configuration to debug a test file in VSCode:

```json
{
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Current Test File",
      "autoAttachChildProcesses": true,
      "skipFiles": ["<node_internals>/**", "**/node_modules/**"],
      "program": "${workspaceRoot}/node_modules/vitest/vitest.mjs",
      "args": ["run", "${relativeFile}"],
      "smartStep": true,
      "console": "integratedTerminal"
    }
  ]
}
```

Then in the debug tab, ensure 'Debug Current Test File' is selected. You can then open the test file you want to debug and press F5 to start debugging.

## IntelliJ IDEA

Create a 'Node.js' run configuration. Use the following settings to run all tests in debug mode:

Setting | Value
 --- | ---
Working directory | /path/to/your-project-root
JavaScript file | ./node_modules/vitest/vitest.mjs
Application parameters | run --threads false

Then run this configuration in debug mode. The IDE will stop at JS/TS breakpoints set in the editor.

## Node Inspector, e.g. Chrome DevTools

Vitest also supports debugging tests without IDEs. However this requires that tests are not run parallel. Use one of the following commands to launch Vitest.

```sh
# To run in a single worker
vitest --inspect-brk --single-thread

# To run in a child process
vitest --inspect-brk --no-threads
```

Once Vitest starts it will stop execution and waits for you to open developer tools that can connect to [NodeJS inspector](https://nodejs.org/en/docs/guides/debugging-getting-started/). You can use Chrome DevTools for this by opening `chrome://inspect` on browser.

In watch mode you can keep the debugger open during test re-runs by using the `--single-thread --isolate false` options.
