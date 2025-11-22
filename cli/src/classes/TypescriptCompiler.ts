import type { ActivityMetadata } from './ActivityCompiler.js'
import { existsSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import process from 'node:process'
import chalk from 'chalk'
import ora from 'ora'
import ts from 'typescript'
import { error, exit, info, prefix } from '../util/log.js'
import { addSarifLog, SarifRuleId } from '../util/sarif.js'

export class TypescriptCompiler {
  constructor(
    public readonly cwd: string,
    public readonly activity: ActivityMetadata,
  ) { }

  async typecheck(killOnError: boolean): Promise<boolean> {
    const spinner = ora(
      prefix + chalk.yellow(` Type checking ${this.activity.service}...`),
    ).start()

    const hasIframe = existsSync(resolve(this.cwd, 'iframe.ts'))
    const tsconfigPath = resolve(this.cwd, 'tsconfig.json')

    //* Parse the tsconfig file
    const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile)
    if (configFile.error) {
      spinner.fail(prefix + chalk.red(' Failed to read tsconfig.json:'))
      exit(ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'))
    }

    //* Parse the config into compiler options
    const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, this.cwd)
    if (parsedConfig.errors.length) {
      spinner.fail(prefix + chalk.red(' Failed to parse tsconfig.json:'))
      parsedConfig.errors.forEach((diagnostic) => {
        error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
      })
      if (killOnError) {
        process.exit(1)
      }
      return false
    }

    const program = ts.createProgram({
      rootNames: [resolve(this.cwd, 'presence.ts'), ...(hasIframe ? [resolve(this.cwd, 'iframe.ts')] : [])],
      options: { ...parsedConfig.options, noEmit: true },
    })

    //* Get both syntactic and semantic diagnostics
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
          addSarifLog({
            path: diagnostic.file.fileName,
            message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
            ruleId: SarifRuleId.typeCheck,
            position: {
              line: line + 1,
              column: character + 1,
            },
          })
        }
        else {
          error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
        }
      })
      if (killOnError) {
        process.exit(1)
      }
      return false
    }

    spinner.succeed(prefix + chalk.greenBright(` Type checking ${this.activity.service} passed!`))
    return true
  }

  private program: ts.WatchOfFilesAndCompilerOptions<ts.SemanticDiagnosticsBuilderProgram> | undefined
  private isRestarting = false

  async watch(onSuccess: () => void) {
    const hasIframe = existsSync(resolve(this.cwd, 'iframe.ts'))
    const tsconfigPath = resolve(this.cwd, 'tsconfig.json')

    //* Parse the tsconfig file
    const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile)
    if (configFile.error) {
      error('Failed to read tsconfig.json:')
      exit(ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'))
    }

    //* Parse the config into compiler options
    const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, this.cwd)
    if (parsedConfig.errors.length) {
      error(' Failed to parse tsconfig.json:')
      parsedConfig.errors.forEach((diagnostic) => {
        error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
      })
      process.exit(1)
    }

    const host = ts.createWatchCompilerHost(
      [resolve(this.cwd, 'presence.ts'), ...(hasIframe ? [resolve(this.cwd, 'iframe.ts')] : [])],
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
          onSuccess()
        }
      },
    )

    this.program = ts.createWatchProgram(host)
  }

  async stop() {
    this.program?.updateRootFileNames([])
    this.program?.close()
    this.program = undefined
  }

  async restart(onSuccess: () => void) {
    //* Prevent concurrent restarts
    if (this.isRestarting) {
      return
    }

    this.isRestarting = true
    try {
      await this.stop()
      await this.watch(onSuccess)
    }
    finally {
      this.isRestarting = false
    }
  }
}
