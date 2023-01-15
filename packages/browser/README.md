# @vitest/browser

Browser runner for Vitest.

> ⚠️ This package is **not yet ready** and it's for preview only. While this package will be released along with other packages, it will not follow semver for breaking changes until we mark it as ready. **Do not use it in production**.

## Progress

Current Status: **Working in progress**

- [x] Init package and integration
- [x] Stub node packages for Vitest runtime
- [ ] Works in development mode
- [ ] Better log in terminal
- [ ] Fulfill tests (using Browser only APIs, Vue and React components)
- [ ] Show progress and error on the browser page
- [ ] Headless mode in CI
- [ ] Docs

Related PRs

- [#1302](https://github.com/vitest-dev/vitest/pull/1302)

## Development Setup

At project root:

```bash
pnpm dev

cd test/browser
pnpm vitest --browser
```
