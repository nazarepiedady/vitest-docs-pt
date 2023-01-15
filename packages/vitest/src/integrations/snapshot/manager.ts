import { basename, dirname, join } from 'pathe'
import type { SnapshotResult, SnapshotStateOptions, SnapshotSummary } from '../../types'

export class SnapshotManager {
  summary: SnapshotSummary = undefined!
  extension = '.snap'

  constructor(public options: SnapshotStateOptions) {
    this.clear()
  }

  clear() {
    this.summary = emptySummary(this.options)
  }

  add(result: SnapshotResult) {
    addSnapshotResult(this.summary, result)
  }

  resolvePath(testPath: string) {
    const resolver = this.options.resolveSnapshotPath || (() => {
      return join(
        join(
          dirname(testPath), '__snapshots__'),
        `${basename(testPath)}${this.extension}`,
      )
    })

    return resolver(testPath, this.extension)
  }
}

export function emptySummary(options: SnapshotStateOptions): SnapshotSummary {
  const summary = {
    added: 0,
    failure: false,
    filesAdded: 0,
    filesRemoved: 0,
    filesRemovedList: [],
    filesUnmatched: 0,
    filesUpdated: 0,
    matched: 0,
    total: 0,
    unchecked: 0,
    uncheckedKeysByFile: [],
    unmatched: 0,
    updated: 0,
    didUpdate: options.updateSnapshot === 'all',
  }
  return summary
}

export function addSnapshotResult(summary: SnapshotSummary, result: SnapshotResult): void {
  if (result.added)
    summary.filesAdded++
  if (result.fileDeleted)
    summary.filesRemoved++
  if (result.unmatched)
    summary.filesUnmatched++
  if (result.updated)
    summary.filesUpdated++

  summary.added += result.added
  summary.matched += result.matched
  summary.unchecked += result.unchecked
  if (result.uncheckedKeys && result.uncheckedKeys.length > 0) {
    summary.uncheckedKeysByFile.push({
      filePath: result.filepath,
      keys: result.uncheckedKeys,
    })
  }

  summary.unmatched += result.unmatched
  summary.updated += result.updated
  summary.total += result.added + result.matched + result.unmatched + result.updated
}
