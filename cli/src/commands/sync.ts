import { existsSync } from 'node:fs'
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { confirm, input } from '@inquirer/prompts'
import chalk from 'chalk'
import { SyncScriptCompiler } from '../classes/SyncScriptCompiler.js'
import { getSingleSyncScript, getSyncScripts } from '../util/getSyncScripts.js'
import { exit, info, prefix, success } from '../util/log.js'
import { sanitazeFolderName } from '../util/sanitazeFolderName.js'

export async function syncDev(service?: string) {
  const { metadata, folder } = await getSingleSyncScript('Select a sync script to develop', service)

  await cp(
    resolve(process.cwd(), 'cli/templates/sync-tsconfig.json'),
    resolve(folder, 'tsconfig.json'),
  )

  const compiler = new SyncScriptCompiler(folder, metadata)
  await compiler.watch()
}

export async function syncBuild(service?: string, { all = false, kill = true, zip = false }: { all?: boolean, kill?: boolean, zip?: boolean } = {}) {
  if (all) {
    const scripts = await getSyncScripts()

    if (scripts.length === 0)
      exit('No sync scripts found')

    info(`Building ${scripts.length} sync scripts...`)

    let allSuccess = true
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
  process.exit(isSuccess ? 0 : 1)
}

export async function syncRelease(service?: string) {
  const apiKey = process.env.ADMIN_API_KEY
  if (!apiKey)
    exit('ADMIN_API_KEY environment variable is required')

  const apiUrl = process.env.API_URL || 'https://api.premid.app/v6'

  const { metadata, folder } = await getSingleSyncScript('Select a sync script to release', service)

  await cp(
    resolve(process.cwd(), 'cli/templates/sync-tsconfig.json'),
    resolve(folder, 'tsconfig.json'),
  )

  const compiler = new SyncScriptCompiler(folder, metadata)
  const built = await compiler.compile({ kill: false, zip: false })
  if (!built)
    exit(`Failed to build ${metadata.service}`)

  const contentJs = await readFile(resolve(folder, 'dist', 'content.js'), 'utf8')
  const iframeJs = existsSync(resolve(folder, 'dist', 'iframe.js'))
    ? await readFile(resolve(folder, 'dist', 'iframe.js'), 'utf8')
    : undefined
  const mainworldJs = existsSync(resolve(folder, 'dist', 'mainworld.js'))
    ? await readFile(resolve(folder, 'dist', 'mainworld.js'), 'utf8')
    : undefined

  info(`Releasing ${metadata.service}...`)

  const response = await fetch(`${apiUrl}/sync-scripts/v1`, {
    method: 'POST',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service: metadata.service,
      contentJs,
      iframeJs,
      mainworldJs,
      regExp: metadata.regExp,
      iframeRegExp: metadata.iframeRegExp,
    }),
  })

  if (response.ok)
    success(`Released sync script: ${metadata.service}`)
  else
    exit(`Failed to release ${metadata.service}: ${response.statusText} — ${await response.text()}`)
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
    default: `^https?[:][/][/]([a-z0-9-]+[.])*${service!.toLowerCase().replaceAll(/\W/g, '')}[.]com[/]`,
  }).catch(() => exit('Something went wrong.'))

  const useIframe = await confirm({
    message: 'Does this sync script need iframe support?',
    default: false,
  }).catch(() => exit('Something went wrong.'))

  const metadata: Record<string, string> = {
    service,
    regExp,
  }

  if (useIframe) {
    metadata.iframeRegExp = await input({
      message: 'RegExp pattern for iframe URL matching',
    }).catch(() => exit('Something went wrong.'))
  }

  const templatesDir = resolve(fileURLToPath(import.meta.url), '../../../templates')

  await mkdir(path, { recursive: true })
  await writeFile(resolve(path, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`)
  await cp(resolve(templatesDir, 'sync-content.ts'), resolve(path, 'content.ts'))

  if (useIframe)
    await cp(resolve(templatesDir, 'sync-iframe.ts'), resolve(path, 'iframe.ts'))

  success(
    `Sync script created successfully! ${chalk.grey(chalk.underline(resolve(path, 'metadata.json')))}\n${prefix} ${chalk.white('Please edit the metadata.json file and add the correct information.')}\n${prefix} ${chalk.white(`After that, run ${chalk.cyan(`pmd sync-dev "${service}"`)} to start developing.`)}`,
  )
}
