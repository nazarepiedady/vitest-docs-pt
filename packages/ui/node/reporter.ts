import { existsSync, promises as fs } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { basename, dirname, relative, resolve } from 'pathe'
import c from 'picocolors'
import fg from 'fast-glob'
import { stringify } from 'flatted'
// eslint-disable-next-line no-restricted-imports
import type { File, ModuleGraphData, Reporter, ResolvedConfig, Vitest } from 'vitest'
import { getModuleGraph } from '../../vitest/src/utils/graph'
import { getOutputFile } from '../../vitest/src/utils/config-helpers'

interface HTMLReportData {
  paths: string[]
  files: File[]
  config: ResolvedConfig
  moduleGraph: Record<string, ModuleGraphData>
}

const distDir = resolve(fileURLToPath(import.meta.url), '../../dist')

export default class HTMLReporter implements Reporter {
  start = 0
  ctx!: Vitest
  reportUIPath!: string

  async onInit(ctx: Vitest) {
    this.ctx = ctx
    this.start = Date.now()
  }

  async onFinished() {
    const result: HTMLReportData = {
      paths: await this.ctx.state.getPaths(),
      files: this.ctx.state.getFiles(),
      config: this.ctx.config,
      moduleGraph: {},
    }
    await Promise.all(
      result.files.map(async (file) => {
        result.moduleGraph[file.filepath] = await getModuleGraph(this.ctx, file.filepath)
      }),
    )
    await this.writeReport(stringify(result))
  }

  async writeReport(report: string) {
    const htmlFile = getOutputFile(this.ctx.config, 'html') || 'html/index.html'
    const htmlFileName = basename(htmlFile)
    const htmlDir = resolve(this.ctx.config.root, dirname(htmlFile))

    const metaFile = resolve(htmlDir, 'html.meta.json')

    if (!existsSync(htmlDir))
      await fs.mkdir(resolve(htmlDir, 'assets'), { recursive: true })

    await fs.writeFile(metaFile, report, 'utf-8')
    const ui = resolve(distDir, 'client')
    // copy ui
    const files = fg.sync('**/*', { cwd: ui })
    await Promise.all(files.map(async (f) => {
      if (f === 'index.html') {
        const html = await fs.readFile(resolve(ui, f), 'utf-8')
        const filePath = relative(htmlDir, metaFile)
        await fs.writeFile(
          resolve(htmlDir, htmlFileName),
          html.replace('<!-- !LOAD_METADATA! -->', `<script>window.METADATA_PATH="${filePath}"</script>`),
        )
      }
      else {
        await fs.copyFile(resolve(ui, f), resolve(htmlDir, f))
      }
    }))

    this.ctx.logger.log(`${c.bold(c.inverse(c.magenta(' HTML ')))} ${c.magenta('Report is generated')}`)
    this.ctx.logger.log(`${c.dim('       You can run ')}${c.bold(`npx vite preview --base __vitest__ --outDir ${relative(this.ctx.config.root, htmlDir)}`)}${c.dim(' to see the test results.')}`)
  }
}
