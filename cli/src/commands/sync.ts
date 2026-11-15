import type { SyncScriptMetadataAndFolder } from '../util/getSyncScripts.js'
import { existsSync } from 'node:fs'
import { cp, mkdir, writeFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { confirm, input } from '@inquirer/prompts'
import chalk from 'chalk'
import isCI from 'is-ci'
import { SyncScriptCompiler } from '../classes/SyncScriptCompiler.js'
import { getBaseSha, getChangedPathsSince, readFileAtRef } from '../util/getChangedFiles.js'
import { getChangedSyncScripts, getSingleSyncScript, getSyncScripts } from '../util/getSyncScripts.js'
import { error, exit, info, prefix, success } from '../util/log.js'
import { sanitazeFolderName } from '../util/sanitazeFolderName.js'
import { deleteSyncScript, releaseSyncScript } from '../util/syncScriptRelease.js'
import { checkVersionBumps, validateSyncScripts } from '../util/validateSyncScripts.js'

function getVersionBumpErrors(scripts: SyncScriptMetadataAndFolder[]): string[] {
  const base = getBaseSha()
  if (!base) {
    info('No base commit to compare against, skipping the version bump check')
    return []
  }

  const paths = getChangedPathsSince(base, 'syncScripts')
  if (!paths) {
    if (isCI)
      return [`Base commit ${base} is not available, check out the full history to compare versions`]
    info(`Base commit ${base} is not available, skipping the version bump check`)
    return []
  }

  const changedFolders = new Set(
    paths
      .map(path => path.split('/'))
      .filter(parts => parts[0] === 'syncScripts' && parts.length > 2)
      .map(parts => parts[1]!),
  )

  return checkVersionBumps(scripts, changedFolders, (folder) => {
    const content = readFileAtRef(base, `syncScripts/${folder}/metadata.json`)
    try {
      return content ? JSON.parse(content) : undefined
    }
    catch {
      return undefined
    }
  })
}

/** Prints every metadata problem and returns whether there were none. */
export function validateAll(scripts: SyncScriptMetadataAndFolder[], { versions = false }: { versions?: boolean } = {}): boolean {
  const errors = validateSyncScripts(scripts)
  if (versions)
    errors.push(...getVersionBumpErrors(scripts))
  for (const message of errors)
    error(message)
  return errors.length === 0
}

export async function syncDev(service?: string) {
  const { metadata, folder } = await getSingleSyncScript('Select a sync script to develop', service)

  await cp(
    resolve(process.cwd(), 'cli/templates/sync-tsconfig.json'),
    resolve(folder, 'tsconfig.json'),
  )

  const compiler = new SyncScriptCompiler(folder, metadata)
  await compiler.watch()
}

export async function syncBuild(service?: string, { all = false, kill = true, zip = false, validate = false }: { all?: boolean, kill?: boolean, zip?: boolean, validate?: boolean } = {}) {
  const valid = validateAll(await getSyncScripts(), { versions: validate })
  if (!valid && kill)
    exit('Sync script metadata is invalid')

  if (all) {
    const scripts = await getSyncScripts()

    if (scripts.length === 0)
      exit('No sync scripts found')

    info(`Building ${scripts.length} sync scripts...`)

    let allSuccess = valid
    for (const script of scripts) {
      await cp(
        resolve(process.cwd(), 'cli/templates/sync-tsconfig.json'),
        resolve(script.folder, 'tsconfig.json'),
      )

      const compiler = new SyncScriptCompiler(script.folder, script.metadata)
      const isSuccess = await compiler.compile({ kill, zip })
      allSuccess = allSuccess && isSuccess
    }

    info(`${scripts.length} sync scripts built ${allSuccess ? 'successfully' : 'with errors'}`)
    process.exit(allSuccess ? 0 : 1)
  }

  const { metadata, folder } = await getSingleSyncScript('Select a sync script to build', service)

  await cp(
    resolve(process.cwd(), 'cli/templates/sync-tsconfig.json'),
    resolve(folder, 'tsconfig.json'),
  )

  const compiler = new SyncScriptCompiler(folder, metadata)
  const isSuccess = await compiler.compile({ kill, zip })
  process.exit(isSuccess && valid ? 0 : 1)
}

export async function syncRelease(service?: string, { changed = false, all = false }: { changed?: boolean, all?: boolean } = {}) {
  const apiKey = process.env.ADMIN_API_KEY
  if (!apiKey)
    exit('ADMIN_API_KEY environment variable is required')

  const apiUrl = process.env.API_URL || 'https://api.premid.app/v6'

  const allScripts = await getSyncScripts()
  const failures: string[] = []
  let scripts: SyncScriptMetadataAndFolder[]
  if (all) {
    scripts = allScripts
  }
  else if (changed) {
    const { changed: changedScripts, deleted } = await getChangedSyncScripts()
    scripts = changedScripts
    for (const { metadata } of deleted) {
      const result = await deleteSyncScript(metadata.service, { apiUrl, apiKey })
      if (result !== true)
        failures.push(`${metadata.service}: ${result}`)
    }
  }
  else {
    scripts = [await getSingleSyncScript('Select a sync script to release', service)]
  }

  info(`Releasing ${scripts.length} sync scripts...`)

  const metadataErrors = validateSyncScripts(allScripts)
  let released = 0

  for (const script of scripts) {
    const errors = metadataErrors.filter(message => message.split(': ')[0]!.split(', ').includes(basename(script.folder)))
    if (errors.length) {
      errors.forEach(message => error(message))
      failures.push(`${script.metadata.service}: invalid metadata`)
      continue
    }

    const result = await releaseSyncScript(script, { apiUrl, apiKey })
    if (result === true)
      released++
    else
      failures.push(`${script.metadata.service}: ${result}`)
  }

  info(`Released ${released} of ${scripts.length} sync scripts`)

  if (failures.length) {
    failures.forEach(message => error(message))
    exit(`${failures.length} sync scripts failed to release`)
  }
}

export async function syncNew(service?: string) {
  if (!service)
    service = await input({ message: 'What is the name of the service?' }).catch(() => undefined)

  if (!service)
    exit('Service name is required')

  const sanitized = sanitazeFolderName(service)
  const path = resolve(process.cwd(), 'syncScripts', sanitized)

  if (existsSync(path)) {
    const develop = await confirm({
      message: 'The sync script already exists. Would you like to develop it?',
    })

    if (develop)
      return syncDev(service)

    exit('Sync script already exists')
  }

  const regExp = await input({
    message: 'RegExp pattern for URL matching',
    default: `^https?[:][/][/]([a-z0-9-]{1,63}[.])?${service!.toLowerCase().replaceAll(/\W/g, '')}[.]com[/]`,
  }).catch(() => exit('Something went wrong.'))

  const metadata = { service, regExp, version: '1.0.0' }

  const templatesDir = resolve(fileURLToPath(import.meta.url), '../../../templates')

  await mkdir(path, { recursive: true })
  await writeFile(resolve(path, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`)
  await cp(resolve(templatesDir, 'sync-content.ts'), resolve(path, 'content.ts'))

  success(
    `Sync script created successfully! ${chalk.grey(chalk.underline(resolve(path, 'metadata.json')))}\n${prefix} ${chalk.white('Please edit the metadata.json file and add the correct information.')}\n${prefix} ${chalk.white(`After that, run ${chalk.cyan(`pmd sync-dev "${service}"`)} to start developing.`)}`,
  )
}
