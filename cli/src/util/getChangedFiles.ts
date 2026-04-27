import { execSync } from 'node:child_process'
import process from 'node:process'
import { context } from '@actions/github'
import gitDiffParser from 'gitdiff-parser'
import { exit, info } from './log.js'

export interface ChangedFile {
  path: string
  deleted: boolean
}

export async function getChangedFilesCi(): Promise<ChangedFile[]> {
  if (!process.env.GITHUB_TOKEN)
    exit('GITHUB_TOKEN is not set')

  let base: string | undefined
  let head: string | undefined

  switch (context.eventName) {
    case 'pull_request':
    case 'pull_request_review':
      base = context.payload.pull_request?.base?.sha
      head = context.payload.pull_request?.head?.sha
      break
    case 'push':
      base = context.payload.before
      head = context.payload.after
      break
  }

  if (!base || !head)
    exit('No base or head found')

  info(`Getting changed files from ${base} to ${head}`)

  const response = await fetch(`https://github.com/${context.repo.owner}/${context.repo.repo}/compare/${base}...${head}.diff`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
  })

  const files = gitDiffParser.parse(await response.text())
  return files.map(file => ({
    path: file.type === 'delete' ? file.oldPath : file.newPath,
    deleted: file.type === 'delete',
  }))
}

export function getChangedFilesLocal(): ChangedFile[] {
  const base = execSync('git merge-base main HEAD').toString().trim()
  const head = execSync('git rev-parse HEAD').toString().trim()
  const diffOutput = execSync(`git diff --name-status ${base} ${head}`).toString().trim()

  return diffOutput.split('\n').filter(line => line.length > 0).map((line) => {
    const [status, path] = line.split('\t')
    return {
      path,
      deleted: status === 'D',
    }
  })
}

export function decodeUtf8Escapes(filePath: string): string {
  filePath = filePath
    .replace(/"$/, '')
    .replace(/^"/, '')
    .replace(/^\//, '')

  const decodedPath = filePath.replace(/\\(\d{3})/g, (_, octalCode) =>
    String.fromCharCode(Number.parseInt(octalCode, 8)))

  const bytes = new Uint8Array([...decodedPath].map(char => char.charCodeAt(0)))
  return new TextDecoder('utf-8').decode(bytes)
}
