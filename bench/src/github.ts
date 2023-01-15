// Base code is from https://github.com/antfu/export-size-action

import type { Context } from '@actions/github/lib/context'
import type { WebhookPayload } from '@actions/github/lib/interfaces'

import { markdownTable as table } from 'markdown-table'
import { setFailed } from '@actions/core'
import { context, getOctokit } from '@actions/github'
import { exec } from '@actions/exec'

import type { Result } from './bench'
import { runBench } from './bench'

type GitHub = ReturnType<typeof getOctokit>
type Repo = Context['repo']
type Pull = WebhookPayload['pull_request']

const COMMENT_HEADING = '## Benchmark'

async function fetchPreviousComment(
  octokit: GitHub,
  repo: { owner: string; repo: string },
  pr: { number: number },
) {
  const { data: comments } = await octokit.rest.issues.listComments(
    {
      ...repo,
      issue_number: pr.number,
    },
  )

  return comments.find(comment => comment.body.startsWith(COMMENT_HEADING))
}

const token = process.env.GITHUB_TOKEN // getInput('github_token')

export async function buildAndGetTime(branch: string | null): Promise<Result[]> {
  if (branch) {
    try {
      await exec(`git fetch origin ${branch} --depth=1`)
    }
    catch (error) {
      // eslint-disable-next-line no-console
      console.log('Fetch failed', error.message)
    }

    await exec(`git checkout -f ${branch}`)
  }

  await exec('npx -p @antfu/ni nci', [], { cwd: '..' })

  await exec('npx -p @antfu/ni nr build', [], { cwd: '..' })

  await exec('npx -p @antfu/ni nci', [])

  return new Promise(runBench)
}

function formatCompareTable(nowResults: Result[], wasResults: Result[]): string {
  let body = ''

  const results = wasResults
    .map((was) => {
      const now = nowResults.find(i => i.name === was.name)

      const delta = now.mean - was.mean
      const deltaPercent = delta / was.mean

      return {
        name: now.name,
        baseTime: was.mean,
        baseRme: was.rme,
        currentRme: now.rme,
        currentTime: now.mean,
        delta,
        deltaPercent,
      }
    })

  body += table(
    [
      ['Name', 'Previous', 'Time', 'Delta'],
      ...results
        .map(({
          name,
          currentTime,
          currentRme,
          baseTime,
          baseRme,
          deltaPercent,
        }) => {
          const deltaPercentStr = deltaPercent === 0
            ? ''
            : deltaPercent > 0
              ? `+${(deltaPercent * 100).toFixed(2)}% ${baseTime !== 0 ? '🔺' : '➕'}`
              : `${(deltaPercent * 100).toFixed(2)}% 🔽`

          return [name, `${baseTime.toFixed(3)}s ± ${baseRme.toFixed(2)}%`, `${currentTime.toFixed(3)}s ± ${currentRme.toFixed(2)}%`, deltaPercentStr]
        }),
    ],
    { align: ['l', 'r', 'r', 'l'] },
  )

  // eslint-disable-next-line no-console
  console.log(body)

  return `${body}`
}

async function compareToRef(ref: string, pr?: Pull, repo?: Repo, octokit?: GitHub) {
  let body = `${COMMENT_HEADING}\n\n`

  const now = await buildAndGetTime(null)
  const was = await buildAndGetTime(ref)

  body += formatCompareTable(now, was)

  if (pr && repo) {
    let comment = await fetchPreviousComment(octokit, repo, pr)
    comment = null

    try {
      if (!comment) {
        await octokit.rest.issues.createComment({
          ...repo,
          issue_number: pr.number,
          body,
        })
      }
      else {
        await octokit.rest.issues.updateComment({
          ...repo,
          comment_id: comment.id,
          body,
        })
      }
    }
    catch (error) {
      console.error(error)
      console.error(
        'Error creating/updating comment. This can happen for PR\'s originating from a fork without write permissions.',
      )
    }
  }
}

async function run() {
  const isPr = context.payload?.issue?.pull_request != null

  try {
    if (isPr) {
      const octokit = getOctokit(token)
      const repo = context.repo
      const pr = await octokit.rest.pulls.get({
        ...repo,
        pull_number: context.payload.issue.number,
      })

      await compareToRef(pr.data.base.ref, pr.data, context.repo, octokit)
    }
    else {
      await compareToRef('HEAD^')
    }
  }
  catch (error) {
    console.error(error)
    setFailed(error)
  }
}

run()
