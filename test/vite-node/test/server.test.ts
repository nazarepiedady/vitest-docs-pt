import { ViteNodeServer } from 'vite-node/server'
import { describe, expect, test, vi } from 'vitest'

describe('server works correctly', async () => {
  test('resolve id considers transform mode', async () => {
    const resolveId = vi.fn()

    const vnServer = new ViteNodeServer({
      pluginContainer: { resolveId },
      config: {
        root: '/',
      },
      moduleGraph: {
        idToModuleMap: new Map(),
      },
    } as any, {
      transformMode: {
        web: [/web/],
        ssr: [/ssr/],
      },
    })

    await vnServer.resolveId('/path', '/web path')
    expect(resolveId).toHaveBeenCalledWith('/path', '/web path', { ssr: false })

    await vnServer.resolveId('/ssr', '/ssr path')
    expect(resolveId).toHaveBeenCalledWith('/ssr', '/ssr path', { ssr: true })
  })
})
