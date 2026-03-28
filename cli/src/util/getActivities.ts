import type { ActivityMetadata } from '../classes/ActivityCompiler.js'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { globby } from 'globby'
import isCI from 'is-ci'
import multimatch from 'multimatch'
import { decodeUtf8Escapes, getChangedFilesCi, getChangedFilesLocal } from './getChangedFiles.js'

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
    resolve(process.cwd(), 'syncScripts'),
  ]

  const syncScriptsDir = resolve(process.cwd(), 'syncScripts')
  const modifiedAddedFiles = changedFiles.filter(file => !file.deleted)
  for (const file of modifiedAddedFiles) {
    if (file.path.startsWith(syncScriptsDir))
      continue

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
