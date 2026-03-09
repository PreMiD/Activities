import { existsSync } from 'node:fs'
import { cp, readdir, readFile, rm } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import AdmZip from 'adm-zip'
import chalk from 'chalk'
import { watch } from 'chokidar'
import { build } from 'esbuild'
import ora from 'ora'
import { inc } from 'semver'
import { getDmcaServices, isDmcaBlocked } from '../util/dmca.js'
import {
  checkDomainDns,
  isValidDomain,
  sanitizeDomain,
} from '../util/dnsValidator.js'
import { getChangedActivities } from '../util/getActivities.js'
import { getJsonPosition } from '../util/getJsonPosition.js'
import { error, exit, prefix } from '../util/log.js'
import { sanitazeFolderName } from '../util/sanitazeFolderName.js'
import { addSarifLog, SarifRuleId, writeSarifLog } from '../util/sarif.js'
import { AssetsManager } from './AssetsManager.js'
import { DependenciesManager } from './DependenciesManager.js'
import { TypescriptCompiler } from './TypescriptCompiler.js'
import { WebSocketServer } from './WebSocketServer.js'

export interface ActivityMetadata {
  service: string
  apiVersion: number
  version: string
  logo: string
  thumbnail: string
  url: string | string[]
  iframe?: boolean
  iFrameRegExp?: string
  description: Record<string, string>
  tags: string[]
}

export class ActivityCompiler {
  dependencies: DependenciesManager
  ts: TypescriptCompiler
  ws: WebSocketServer | undefined
  assetsManager: AssetsManager

  constructor(
    public readonly cwd: string,
    public readonly activity: ActivityMetadata,
    public readonly versionized: boolean,
  ) {
    this.dependencies = new DependenciesManager(cwd, activity)
    this.ts = new TypescriptCompiler(cwd, activity)
    this.assetsManager = new AssetsManager(cwd, activity, versionized)
  }

  async compile({
    kill,
    validate,
    preCheck = true,
    zip,
  }: {
    kill: boolean
    validate: boolean
    preCheck?: boolean
    zip: boolean
  }): Promise<boolean> {
    let checksSucceeded = true
    if (preCheck) {
      await this.dependencies.installDependencies()
      const success = await this.ts.typecheck(kill)
      if (!success) {
        checksSucceeded = false
      }
    }

    if (validate) {
      const success = await this.validate({ kill })
      if (!success) {
        checksSucceeded = false
      }
    }

    if (!checksSucceeded) {
      return false
    }

    const spinner = ora(prefix + chalk.greenBright(` Compiling ${this.activity.service}...`))
    spinner.start()

    const hasIframe = existsSync(resolve(this.cwd, 'iframe.ts'))
    const hasI18nFile = existsSync(resolve(this.cwd, `${this.activity.service}.json`))

    if (existsSync(resolve(this.cwd, 'dist'))) {
      await rm(resolve(this.cwd, 'dist'), { recursive: true })
    }

    await build({
      entryPoints: [
        resolve(this.cwd, 'presence.ts'),
        ...(hasIframe ? [resolve(this.cwd, 'iframe.ts')] : []),
      ],
      outdir: resolve(this.cwd, 'dist'),
      bundle: true,
      minify: true,
      sourcemap: 'inline',
      tsconfig: resolve(this.cwd, 'tsconfig.json'),
    })

    await cp(resolve(this.cwd, 'metadata.json'), resolve(this.cwd, 'dist', 'metadata.json'))
    if (hasI18nFile) {
      await cp(resolve(this.cwd, `${this.activity.service}.json`), resolve(this.cwd, 'dist', `${this.activity.service}.json`))
    }

    spinner.succeed(prefix + chalk.greenBright(` Compiled ${this.activity.service}!`))

    if (zip) {
      await zipDir(resolve(this.cwd, 'dist'), `${this.activity.service}.zip`)
    }

    return true
  }

  async watch({ validate, zip, sarif }: { validate: boolean, zip: boolean, sarif: boolean }) {
    await this.dependencies.installDependencies()

    this.ws = new WebSocketServer(this.cwd)

    watch(this.cwd, {
      depth: 0,
      ignoreInitial: true,
      ignored: ['**/dist/**'],
      persistent: true,
    }).on('all', async (event, path) => {
      if (['add', 'unlink'].includes(event) && basename(path) === 'iframe.ts') {
        return this.ts.restart(this.compileAndSend.bind(this, { validate, zip, sarif }))
      }

      if (basename(path) === 'package.json') {
        if (
          ['add', 'change'].includes(event)
          && !(await this.dependencies.isValidPackageJson())
        ) {
          return error('Invalid package.json!')
        }

        await this.ts.stop()
        if (event === 'change') {
          await this.dependencies.installDependencies()
        }
        else if (event === 'unlink') {
          if (existsSync(resolve(this.cwd, 'node_modules'))) {
            await rm(resolve(this.cwd, 'node_modules'), { recursive: true })
          }
          if (existsSync(resolve(this.cwd, 'package-lock.json'))) {
            await rm(resolve(this.cwd, 'package-lock.json'))
          }
        }

        await this.ts.restart(this.compileAndSend.bind(this, { validate, zip, sarif }))
      }

      // Handle string file and metadata.json changes
      if (
        event === 'change'
        && (basename(path) === `${this.activity.service}.json` || basename(path) === 'metadata.json')
      ) {
        return this.compileAndSend({ validate, zip, sarif })
      }
    })

    this.ts.watch(this.compileAndSend.bind(this, { validate, zip, sarif }))
  }

  private async compileAndSend({ validate, zip, sarif }: { validate: boolean, zip: boolean, sarif: boolean }) {
    await this.compile({ validate, zip, preCheck: false, kill: false })
    if (sarif) {
      await writeSarifLog()
    }
    await this.ws?.send()
  }

  private async validate({ kill }: { kill: boolean }): Promise<boolean> {
    const metadata: ActivityMetadata = JSON.parse(await readFile(resolve(this.cwd, 'metadata.json'), 'utf-8'))

    const dmcaServices = await getDmcaServices()
    if (isDmcaBlocked(metadata.service, dmcaServices)) {
      const message = `Activity "${metadata.service}" is on the DMCA blocklist and cannot be added or modified`
      if (kill) {
        exit(message)
      }

      error(message)
      addSarifLog({
        path: resolve(this.cwd, 'metadata.json'),
        message,
        ruleId: SarifRuleId.dmcaCheck,
        position: await getJsonPosition(resolve(this.cwd, 'metadata.json'), 'service'),
      })
      return false
    }

    const libraryVersion: ActivityMetadata | null = await fetch(`https://api.premid.app/v6/activities${this.versionized ? `/v${metadata.apiVersion}` : ''}/${encodeURIComponent(metadata.service)}/metadata.json`).then(res => res.json()).catch(() => null)

    let serviceFolder: string
    if (this.versionized) {
      serviceFolder = basename(dirname(this.cwd))
    }
    else {
      serviceFolder = basename(this.cwd)
    }

    let valid = true

    if (serviceFolder !== sanitazeFolderName(metadata.service)) {
      const message = `Expected service folder to be ${sanitazeFolderName(metadata.service)}, but got ${serviceFolder}`
      if (kill) {
        exit(message)
      }

      error(message)
      addSarifLog({
        path: resolve(this.cwd, 'metadata.json'),
        message,
        ruleId: SarifRuleId.serviceFolderCheck,
        position: await getJsonPosition(resolve(this.cwd, 'metadata.json'), 'service'),
      })
      valid = false
    }

    if (!libraryVersion && metadata.version !== '1.0.0') {
      const message = `Expected initial version of activity ${metadata.service} to be 1.0.0`
      if (kill) {
        exit(message)
      }

      error(message)
      addSarifLog({
        path: resolve(this.cwd, 'metadata.json'),
        message,
        ruleId: SarifRuleId.bumpCheck,
        position: await getJsonPosition(resolve(this.cwd, 'metadata.json'), 'version'),
      })
      valid = false
    }

    if (libraryVersion) {
      const expectedVersions = [
        inc(libraryVersion.version, 'patch'),
        inc(libraryVersion.version, 'minor'),
        inc(libraryVersion.version, 'major'),
      ]

      const { changed } = await getChangedActivities()
      if (
        changed.some(activity => activity.folder === this.cwd)
        && !expectedVersions.includes(metadata.version)
      ) {
        const message = `Expected version of activity ${metadata.service} to be bumped to one of the following: ${expectedVersions.join(', ')}`
        if (kill) {
          exit(message)
        }

        error(message)
        addSarifLog({
          path: resolve(this.cwd, 'metadata.json'),
          message,
          ruleId: SarifRuleId.bumpCheck,
          position: await getJsonPosition(resolve(this.cwd, 'metadata.json'), 'version'),
        })
        valid = false
      }
    }

    if (metadata.iframe && !existsSync(resolve(this.cwd, 'iframe.ts'))) {
      const message = `Expected iframe.ts to exist for activity ${metadata.service}, as metadata.iframe is true`
      if (kill) {
        exit(message)
      }

      error(message)
      addSarifLog({
        path: resolve(this.cwd, 'metadata.json'),
        message,
        ruleId: SarifRuleId.iframeCheck,
        position: await getJsonPosition(resolve(this.cwd, 'metadata.json'), 'iframe'),
      })
      valid = false
    }

    if (!metadata.iframe && existsSync(resolve(this.cwd, 'iframe.ts'))) {
      const message = `Expected iframe.ts to not exist for activity ${metadata.service}, as metadata.iframe is false`
      if (kill) {
        exit(message)
      }

      error(message)
      addSarifLog({
        path: resolve(this.cwd, 'metadata.json'),
        message,
        ruleId: SarifRuleId.iframeCheck,
        position: await getJsonPosition(resolve(this.cwd, 'metadata.json'), 'iframe'),
      })
      valid = false
    }

    if (metadata.iFrameRegExp === '.*') {
      const message = `iFrameRegExp is not allowed to be .*, as it is a wildcard`
      if (kill) {
        exit(message)
      }

      error(message)
      addSarifLog({
        path: resolve(this.cwd, 'metadata.json'),
        message,
        ruleId: SarifRuleId.iframeRegexpCheck,
        position: await getJsonPosition(resolve(this.cwd, 'metadata.json'), 'iFrameRegExp'),
      })
      valid = false
    }

    const allowedLanguages = await fetch('https://api.premid.app/v6/locales').then(res => res.json()).catch(() => [])
    for (const language of Object.keys(metadata.description)) {
      if (!allowedLanguages.includes(language)) {
        const message = `Language ${language} is not a valid language`
        if (kill) {
          exit(message)
        }

        error(message)
        addSarifLog({
          path: resolve(this.cwd, 'metadata.json'),
          message,
          ruleId: SarifRuleId.languageCheck,
          position: await getJsonPosition(resolve(this.cwd, 'metadata.json'), 'description', language),
        })
        valid = false
      }
    }

    const clientIds = await this.assetsManager.getClientIds()
    if (clientIds.length === 0) {
      const message = `No Client ID found for activity ${metadata.service}`
      if (kill) {
        exit(message)
      }

      error(message)
      addSarifLog({
        path: resolve(this.cwd, 'presence.ts'),
        message,
        ruleId: SarifRuleId.clientIdExistsCheck,
        position: {
          line: 0,
          column: 0,
        },
      })
      valid = false
    }
    else {
      for (const clientId of clientIds) {
        if (!(await this.assetsManager.validateClientId({ clientId, kill }))) {
          valid = false
        }
      }
    }

    const assets = await this.assetsManager.getAssets()
    for (const asset of assets) {
      if (!(await this.assetsManager.validateImage({ asset, kill }))) {
        valid = false
      }
    }

    if (new Set(metadata.tags).size !== metadata.tags.length) {
      const message = `Tags must be unique`
      if (kill) {
        exit(message)
      }

      error(message)
      addSarifLog({
        path: resolve(this.cwd, 'metadata.json'),
        message,
        ruleId: SarifRuleId.tagsCheck,
        position: await getJsonPosition(resolve(this.cwd, 'metadata.json'), 'tags'),
      })
      valid = false
    }

    if (metadata.tags.includes(metadata.service.toLowerCase().replace(/[A-Z\s!"#$%&'()*+,./:;<=>?@[\\\]^_`{|}~]/g, ''))) {
      const message = `Tags must not contain the service name`
      if (kill) {
        exit(message)
      }

      error(message)
      addSarifLog({
        path: resolve(this.cwd, 'metadata.json'),
        message,
        ruleId: SarifRuleId.tagsServiceCheck,
        position: await getJsonPosition(resolve(this.cwd, 'metadata.json'), 'tags'),
      })
      valid = false
    }

    // DNS validation for URLs
    const urls = Array.isArray(metadata.url) ? metadata.url : [metadata.url]

    // Check all URLs in parallel for this activity
    const urlChecks = await Promise.all(
      urls
        .filter((url: any): url is string => typeof url === 'string')
        .map(async (url: string, index: number) => {
          const domain = sanitizeDomain(url)
          if (!isValidDomain(domain))
            return { url, index, skipped: true }

          const result = await checkDomainDns(domain)
          return { url, index, result, skipped: false }
        }),
    )

    // Process results
    for (const check of urlChecks) {
      if (check.skipped || check.result?.valid)
        continue

      const message = `DNS check failed for URL "${check.url}": ${check.result?.message || check.result?.error}`
      if (kill) {
        exit(message)
      }

      error(message)

      // Get position in metadata.json
      const position = Array.isArray(metadata.url)
        ? await getJsonPosition(resolve(this.cwd, 'metadata.json'), 'url', check.index)
        : await getJsonPosition(resolve(this.cwd, 'metadata.json'), 'url')

      addSarifLog({
        path: resolve(this.cwd, 'metadata.json'),
        message,
        ruleId: SarifRuleId.dnsCheck,
        position,
      })

      valid = false
    }

    return valid
  }
}

async function zipDir(dir: string, filename: string) {
  const zip = new AdmZip()
  const zipPathInDir = resolve(dir, filename)

  //* Read all files in the directory and add them to the zip
  const files = await readdir(dir, { recursive: true })

  for (const file of files) {
    const filePath = join(dir, file)
    zip.addLocalFile(filePath)
  }

  zip.writeZip(zipPathInDir)
}
