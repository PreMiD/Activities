import type { ActivityMetadata } from '../classes/ActivityCompiler.js'
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { context } from '@actions/github'
import gitDiffParser from 'gitdiff-parser'
import { globby } from 'globby'
import isCI from 'is-ci'
import multimatch from 'multimatch'
import { exit, info } from './log.js'

export interface ActivityMetadataAndFolder {
  metadata: ActivityMetadata
  folder: string
  versionized: boolean
}

export async function getActivities(): Promise<ActivityMetadataAndFolder[]> {
  return (await Promise.all(
    (
      await globby([`websites/*/*/metadata.json`, `websites/*/*/v*/metadata.json`], {
        absolute: true,
      })
    ).map(async (file): Promise<ActivityMetadataAndFolder> => ({
      metadata: JSON.parse(await readFile(file, 'utf-8')),
      folder: dirname(file),
      versionized: multimatch(dirname(file), '**/websites/*/*/v*').length > 0,
    })),
  )).sort(({ metadata: a }, { metadata: b }) => {
    if (a.service !== b.service)
      return a.service.localeCompare(b.service)
    return a.apiVersion - b.apiVersion
  })
}

let cache: {
  changed: ActivityMetadataAndFolder[]
  deleted: ActivityMetadataAndFolder[]
} | null = null

export async function getChangedActivities(): Promise<{
  changed: ActivityMetadataAndFolder[]
  deleted: ActivityMetadataAndFolder[]
}> {
  if (cache) {
    return cache
  }

  const changedFiles = (isCI ? await getChangedFilesCi() : await getChangedFilesLocal())
    .map(file => ({
      ...file,
      path: resolve(process.cwd(), decodeUtf8Escapes(file.path)),
    }))
  const activityPaths = new Set<string>()

  const endAt = [
    '/',
    process.cwd(),
    resolve(process.cwd(), 'websites'),
  ]

  const modifiedAddedFiles = changedFiles.filter(file => !file.deleted)
  for (const file of modifiedAddedFiles) {
    let path = file.path
    while (!existsSync(resolve(path, 'metadata.json'))) {
      path = dirname(path)
      if (endAt.includes(path)) {
        break
      }
    }

    if (endAt.includes(path)) {
      continue
    }

    activityPaths.add(path)
  }

  const deletedFolders = new Set<string>(
    changedFiles
      //* Make sure the file is deleted
      .filter(file => file.deleted)
      //* Get the folder of the deleted file
      .map(file => dirname(file.path))
      //* Make sure the file is in the websites folder
      .filter(folder => multimatch(folder, ['**/websites/*/*/v*', '**/websites/*/*']).length > 0)
      //* Make sure the folder is not in the activityPaths set
      .filter(folder => !Array.from(activityPaths).some(activityPath => activityPath.startsWith(folder))),
  )

  return cache = {
    changed: (
      await Promise.all(
        Array.from(activityPaths)
          .map(async (folder): Promise<ActivityMetadataAndFolder> => ({
            metadata: JSON.parse(await readFile(resolve(folder, 'metadata.json'), 'utf-8')),
            folder,
            versionized: multimatch(folder, '**/websites/*/*/v*').length > 0,
          })),
      )
    ),
    deleted: Array.from(deletedFolders).map((folder) => {
      const versionized = multimatch(folder, '**/websites/*/*/v*').length > 0
      const [, service, apiVersion] = /websites\/[^/]+\/([^/]+)(?:\/v(\d+))?$/.exec(folder) || []
      return {
        metadata: {
          service,
          apiVersion: versionized ? Number(apiVersion) : 1,
          description: {
            en: 'No description available',
          },
          logo: '',
          thumbnail: '',
          url: '',
          version: '1.0.0',
          tags: [],
        },
        folder,
        versionized,
      } satisfies ActivityMetadataAndFolder
    }),
  }
}

async function getChangedFilesCi() {
  if (!process.env.GITHUB_TOKEN) {
    exit('GITHUB_TOKEN is not set')
  }

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

  if (!base || !head) {
    exit('No base or head found')
  }

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

async function getChangedFilesLocal() {
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

function decodeUtf8Escapes(filePath: string) {
  filePath = filePath
    .replace(/"$/, '')
    .replace(/^"/, '')
    .replace(/^\//, '')

  const decodedPath = filePath.replace(/\\(\d{3})/g, (_, octalCode) =>
    String.fromCharCode(Number.parseInt(octalCode, 8)))

  const bytes = new Uint8Array([...decodedPath].map(char => char.charCodeAt(0)))
  const decoder = new TextDecoder('utf-8')
  return decoder.decode(bytes)
}
