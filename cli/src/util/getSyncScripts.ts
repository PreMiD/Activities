import type { SyncScriptMetadata } from '../classes/SyncScriptCompiler.js'
import { readFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { search } from '@inquirer/prompts'
import { globby } from 'globby'
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
