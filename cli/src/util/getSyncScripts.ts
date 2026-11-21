import type { SyncScriptMetadata } from '../classes/SyncScriptCompiler.js'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { basename, dirname, relative, resolve, sep } from 'node:path'
import process from 'node:process'
import { search } from '@inquirer/prompts'
import { globby } from 'globby'
import isCI from 'is-ci'
import { decodeUtf8Escapes, getBaseSha, getChangedFilesCi, getChangedFilesLocal, listFilesAtRef, readFileAtRef } from './getChangedFiles.js'
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

/** The services the base commit had sync scripts for, or undefined when the base is not available locally. */
function getBaseServices(base: string): string[] | undefined {
  const files = listFilesAtRef(base, 'syncScripts')
  if (!files)
    return undefined

  return files
    .filter(file => /^syncScripts\/[^/]+\/metadata\.json$/.test(file))
    .flatMap((file) => {
      try {
        const service = JSON.parse(readFileAtRef(base, file) ?? '').service
        return typeof service === 'string' ? [service] : []
      }
      catch {
        return []
      }
    })
}

export async function getChangedSyncScripts(): Promise<{
  changed: SyncScriptMetadataAndFolder[]
  deleted: { metadata: Pick<SyncScriptMetadata, 'service'> }[]
}> {
  const changedFiles = (isCI ? await getChangedFilesCi() : getChangedFilesLocal())
    .map(file => ({
      ...file,
      path: resolve(process.cwd(), decodeUtf8Escapes(file.path)),
    }))

  const syncScriptsDir = resolve(process.cwd(), 'syncScripts')
  const scriptPaths = new Set<string>()
  const deletedFolders = new Set<string>()

  for (const file of changedFiles) {
    const [name, ...rest] = relative(syncScriptsDir, file.path).split(sep)
    if (!name || name === '..' || !rest.length)
      continue

    const folder = resolve(syncScriptsDir, name)
    // A script is only gone once its metadata is; deleting one of its other files is a change to rebuild.
    if (existsSync(resolve(folder, 'metadata.json')))
      scriptPaths.add(folder)
    else if (file.deleted)
      deletedFolders.add(folder)
  }

  const changed = await Promise.all(
    Array.from(scriptPaths).map(async (folder): Promise<SyncScriptMetadataAndFolder> => ({
      metadata: JSON.parse(await readFile(resolve(folder, 'metadata.json'), 'utf-8')),
      folder,
    })),
  )

  // Comparing services rather than folders also catches renamed folders and a changed service name.
  const base = getBaseSha()
  const baseServices = base ? getBaseServices(base) : undefined
  if (baseServices) {
    const currentServices = new Set((await getSyncScripts()).map(script => script.metadata.service))
    return {
      changed,
      deleted: baseServices.filter(service => !currentServices.has(service)).map(service => ({ metadata: { service } })),
    }
  }

  return {
    changed,
    deleted: Array.from(deletedFolders, folder => ({ metadata: { service: basename(folder) } })),
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
