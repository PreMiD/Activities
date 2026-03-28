import type { SyncScriptMetadata } from '../classes/SyncScriptCompiler.js'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { search } from '@inquirer/prompts'
import { globby } from 'globby'
import isCI from 'is-ci'
import multimatch from 'multimatch'
import { decodeUtf8Escapes, getChangedFilesCi, getChangedFilesLocal } from './getChangedFiles.js'
import { exit } from './log.js'
import { searchChoices } from './searchChoices.js'

export interface SyncScriptMetadataAndFolder {
  metadata: SyncScriptMetadata
  folder: string
}

export async function getSyncScripts(): Promise<SyncScriptMetadataAndFolder[]> {
  return (await Promise.all(
    (
      await globby([`syncScripts/*/metadata.json`], {
        absolute: true,
      })
    ).map(async (file): Promise<SyncScriptMetadataAndFolder> => ({
      metadata: JSON.parse(await readFile(file, 'utf-8')),
      folder: dirname(file),
    })),
  )).sort(({ metadata: a }, { metadata: b }) => a.service.localeCompare(b.service))
}

export async function getChangedSyncScripts(): Promise<{
  changed: SyncScriptMetadataAndFolder[]
  deleted: { metadata: Pick<SyncScriptMetadata, 'service'>, folder: string }[]
}> {
  const changedFiles = (isCI ? await getChangedFilesCi() : getChangedFilesLocal())
    .map(file => ({
      ...file,
      path: resolve(process.cwd(), decodeUtf8Escapes(file.path)),
    }))

  const syncScriptsDir = resolve(process.cwd(), 'syncScripts')
  const scriptPaths = new Set<string>()

  for (const file of changedFiles.filter(f => !f.deleted)) {
    if (!file.path.startsWith(syncScriptsDir))
      continue

    let path = file.path
    while (!existsSync(resolve(path, 'metadata.json'))) {
      const parent = dirname(path)
      if (parent === path || parent === syncScriptsDir || parent === process.cwd())
        break
      path = parent
    }

    if (existsSync(resolve(path, 'metadata.json')))
      scriptPaths.add(path)
  }

  const deletedFolders = changedFiles
    .filter(f => f.deleted && f.path.startsWith(syncScriptsDir))
    .map(f => dirname(f.path))
    .filter(folder => multimatch(folder, ['**/syncScripts/*']).length > 0)
    .filter(folder => !Array.from(scriptPaths).some(p => p.startsWith(folder)))

  return {
    changed: await Promise.all(
      Array.from(scriptPaths).map(async (folder): Promise<SyncScriptMetadataAndFolder> => ({
        metadata: JSON.parse(await readFile(resolve(folder, 'metadata.json'), 'utf-8')),
        folder,
      })),
    ),
    deleted: deletedFolders.map((folder) => {
      const service = folder.split('/').at(-1) ?? ''
      return { metadata: { service }, folder }
    }),
  }
}

export async function getSingleSyncScript(message: string, service?: string): Promise<SyncScriptMetadataAndFolder> {
  const scripts = await getSyncScripts()

  if (scripts.length === 0)
    exit('No sync scripts found')

  if (service) {
    const match = scripts.find(s => s.metadata.service.toLowerCase() === service.toLowerCase())
    if (!match)
      exit(`No sync script found for service "${service}"`)
    return match
  }

  return search({
    message,
    source: input => searchChoices(
      scripts.map(s => ({ name: s.metadata.service, value: s })),
      input,
    ),
  })
}
