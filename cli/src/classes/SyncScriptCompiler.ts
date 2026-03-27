import { existsSync } from 'node:fs'
import { cp, rm } from 'node:fs/promises'
import { basename, dirname, resolve } from 'node:path'
import process from 'node:process'
import chalk from 'chalk'
import { watch } from 'chokidar'
import { build } from 'esbuild'
import ora from 'ora'
import ts from 'typescript'
import { error, exit, info, prefix } from '../util/log.js'
import { WebSocketServer } from './WebSocketServer.js'

export interface SyncScriptMetadata {
  service: string
  regExp: string
  iframeRegExp?: string
}

export class SyncScriptCompiler {
  ws: WebSocketServer | undefined

  constructor(
    public readonly cwd: string,
    public readonly metadata: SyncScriptMetadata,
  ) {}

  async compile({ kill }: { kill: boolean }): Promise<boolean> {
    const success = await this.typecheck(kill)
    if (!success)
      return false

    const spinner = ora(prefix + chalk.greenBright(` Compiling ${this.metadata.service}...`))
    spinner.start()

    const hasIframe = existsSync(resolve(this.cwd, 'iframe.ts'))
    const hasMainworld = existsSync(resolve(this.cwd, 'mainworld.ts'))

    if (existsSync(resolve(this.cwd, 'dist')))
      await rm(resolve(this.cwd, 'dist'), { recursive: true })

    await build({
      entryPoints: [
        resolve(this.cwd, 'content.ts'),
        ...(hasIframe ? [resolve(this.cwd, 'iframe.ts')] : []),
        ...(hasMainworld ? [resolve(this.cwd, 'mainworld.ts')] : []),
      ],
      outdir: resolve(this.cwd, 'dist'),
      bundle: true,
      minify: true,
      sourcemap: 'inline',
      tsconfig: resolve(this.cwd, 'tsconfig.json'),
    })

    await cp(resolve(this.cwd, 'metadata.json'), resolve(this.cwd, 'dist', 'metadata.json'))

    spinner.succeed(prefix + chalk.greenBright(` Compiled ${this.metadata.service}!`))
    return true
  }

  async watch() {
    this.ws = new WebSocketServer(this.cwd, 'localSyncScript')

    watch(this.cwd, {
      depth: 0,
      ignoreInitial: true,
      ignored: ['**/dist/**'],
      persistent: true,
    }).on('all', async (event, path) => {
      if (['add', 'unlink'].includes(event) && (basename(path) === 'iframe.ts' || basename(path) === 'mainworld.ts')) {
        return this.restartTsWatch()
      }

      if (event === 'change' && basename(path) === 'metadata.json') {
        return this.compileAndSend()
      }
    })

    this.startTsWatch()
  }

  private program: ts.WatchOfFilesAndCompilerOptions<ts.SemanticDiagnosticsBuilderProgram> | undefined

  private startTsWatch() {
    const hasIframe = existsSync(resolve(this.cwd, 'iframe.ts'))
    const hasMainworld = existsSync(resolve(this.cwd, 'mainworld.ts'))
    const tsconfigPath = resolve(this.cwd, 'tsconfig.json')

    const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile)
    if (configFile.error) {
      error('Failed to read tsconfig.json:')
      exit(ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'))
    }

    const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, this.cwd)
    if (parsedConfig.errors.length) {
      error('Failed to parse tsconfig.json:')
      parsedConfig.errors.forEach((diagnostic) => {
        error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
      })
      process.exit(1)
    }

    const host = ts.createWatchCompilerHost(
      [resolve(this.cwd, 'content.ts'), ...(hasIframe ? [resolve(this.cwd, 'iframe.ts')] : []), ...(hasMainworld ? [resolve(this.cwd, 'mainworld.ts')] : [])],
      {
        ...parsedConfig.options,
        noEmit: true,
      },
      ts.sys,
      ts.createSemanticDiagnosticsBuilderProgram,
      (diagnostic) => {
        if (!diagnostic.file) {
          return error(ts.formatDiagnostic(diagnostic, {
            getCanonicalFileName: fileName => fileName,
            getCurrentDirectory: () => this.cwd,
            getNewLine: () => '\n',
          }))
        }
        error(chalk.white(`${chalk.cyan(
          `${basename(dirname(diagnostic.file.fileName))}/${basename(diagnostic.file.fileName)}`,
        )}`
        + `:${
          chalk.yellowBright(diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!).line + 1)
        }:${
          chalk.yellowBright(diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!).character + 1)
        } - ${
          chalk.redBright('Error ')
        }${chalk.gray(`TS${diagnostic.code}:`)
        } ${
          ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`))
      },
      (diagnostic) => {
        info(diagnostic.messageText as string)

        if (diagnostic.code === 6194 && (diagnostic.messageText as string).startsWith('Found 0 errors.')) {
          this.compileAndSend()
        }
      },
    )

    this.program = ts.createWatchProgram(host)
  }

  private stopTsWatch() {
    this.program?.updateRootFileNames([])
    this.program?.close()
    this.program = undefined
  }

  private restartTsWatch() {
    this.stopTsWatch()
    this.startTsWatch()
  }

  private async compileAndSend() {
    await this.compile({ kill: false })
    await this.ws?.send()
  }

  private async typecheck(killOnError: boolean): Promise<boolean> {
    const spinner = ora(
      prefix + chalk.yellow(` Type checking ${this.metadata.service}...`),
    ).start()

    const hasIframe = existsSync(resolve(this.cwd, 'iframe.ts'))
    const hasMainworld = existsSync(resolve(this.cwd, 'mainworld.ts'))
    const tsconfigPath = resolve(this.cwd, 'tsconfig.json')

    const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile)
    if (configFile.error) {
      spinner.fail(prefix + chalk.red(' Failed to read tsconfig.json:'))
      exit(ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'))
    }

    const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, this.cwd)
    if (parsedConfig.errors.length) {
      spinner.fail(prefix + chalk.red(' Failed to parse tsconfig.json:'))
      parsedConfig.errors.forEach((diagnostic) => {
        error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
      })
      if (killOnError)
        process.exit(1)
      return false
    }

    const program = ts.createProgram({
      rootNames: [resolve(this.cwd, 'content.ts'), ...(hasIframe ? [resolve(this.cwd, 'iframe.ts')] : []), ...(hasMainworld ? [resolve(this.cwd, 'mainworld.ts')] : [])],
      options: { ...parsedConfig.options, noEmit: true },
    })

    const allDiagnostics = ts
      .getPreEmitDiagnostics(program)
      .concat(program.emit().diagnostics)

    if (allDiagnostics.length > 0) {
      spinner.fail(prefix + chalk.red(' Type checking failed:'))
      allDiagnostics.forEach((diagnostic) => {
        if (diagnostic.file) {
          const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!)
          const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
          error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`)
        }
        else {
          error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
        }
      })
      if (killOnError)
        process.exit(1)
      return false
    }

    spinner.succeed(prefix + chalk.greenBright(` Type checking ${this.metadata.service} passed!`))
    return true
  }
}
