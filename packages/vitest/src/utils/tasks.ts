import type { Arrayable, Benchmark, Suite, Task, Test } from '../types'
import { toArray } from './base'

function isAtomTest(s: Task): s is Test | Benchmark {
  return (s.type === 'test' || s.type === 'benchmark')
}

export function getTests(suite: Arrayable<Task>): (Test | Benchmark)[] {
  return toArray(suite).flatMap(s => isAtomTest(s) ? [s] : s.tasks.flatMap(c => isAtomTest(c) ? [c] : getTests(c)))
}

export function getTasks(tasks: Arrayable<Task> = []): Task[] {
  return toArray(tasks).flatMap(s => isAtomTest(s) ? [s] : [s, ...getTasks(s.tasks)])
}

export function getSuites(suite: Arrayable<Task>): Suite[] {
  return toArray(suite).flatMap(s => s.type === 'suite' ? [s, ...getSuites(s.tasks)] : [])
}

export function hasTests(suite: Arrayable<Suite>): boolean {
  return toArray(suite).some(s => s.tasks.some(c => isAtomTest(c) || hasTests(c)))
}

export function hasBenchmark(suite: Arrayable<Suite>): boolean {
  return toArray(suite).some(s => s?.tasks?.some(c => c.type === 'benchmark' || hasBenchmark(c as Suite)))
}

export function hasFailed(suite: Arrayable<Task>): boolean {
  return toArray(suite).some(s => s.result?.state === 'fail' || (s.type === 'suite' && hasFailed(s.tasks)))
}

export function hasFailedSnapshot(suite: Arrayable<Task>): boolean {
  return getTests(suite).some((s) => {
    return s.result?.errors?.some(e => e.message.match(/Snapshot .* mismatched/))
  })
}

export function getNames(task: Task) {
  const names = [task.name]
  let current: Task | undefined = task

  while (current?.suite || current?.file) {
    current = current.suite || current.file
    if (current?.name)
      names.unshift(current.name)
  }

  return names
}
