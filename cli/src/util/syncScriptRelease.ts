import type { SyncScriptMetadataAndFolder } from './getSyncScripts.js'
import { existsSync } from 'node:fs'
import { cp, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { SyncScriptCompiler } from '../classes/SyncScriptCompiler.js'

export interface ReleaseTarget {
  apiUrl: string
  apiKey: string
}

/** Builds and uploads one script. Returns true, or why it failed. */
export async function releaseSyncScript({ metadata, folder }: SyncScriptMetadataAndFolder, { apiUrl, apiKey }: ReleaseTarget): Promise<true | string> {
  try {
    await cp(
      resolve(process.cwd(), 'cli/templates/sync-tsconfig.json'),
      resolve(folder, 'tsconfig.json'),
    )

    const compiler = new SyncScriptCompiler(folder, metadata)
    if (!await compiler.compile({ kill: false, zip: false }))
      return 'build failed'

    const contentJs = await readFile(resolve(folder, 'dist', 'content.js'), 'utf8')
    const mainworldJs = existsSync(resolve(folder, 'dist', 'mainworld.js'))
      ? await readFile(resolve(folder, 'dist', 'mainworld.js'), 'utf8')
      : undefined

    const response = await fetch(`${apiUrl}/sync-scripts/v1`, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service: metadata.service,
        contentJs,
        mainworldJs,
        regExp: metadata.regExp,
      }),
    })

    if (!response.ok)
      return `upload failed: ${response.status} ${response.statusText}, ${await response.text()}`

    return true
  }
  catch (error) {
    return `${error instanceof Error ? error.message : error}`
  }
}

export async function deleteSyncScript(service: string, { apiUrl, apiKey }: ReleaseTarget): Promise<true | string> {
  try {
    const response = await fetch(`${apiUrl}/sync-scripts/v1/${encodeURIComponent(service)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok)
      return `delete failed: ${response.status} ${response.statusText}, ${await response.text()}`

    return true
  }
  catch (error) {
    return `${error instanceof Error ? error.message : error}`
  }
}
