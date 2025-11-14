import type { ActivityMetadata } from './ActivityCompiler.js'
import { exec } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import chalk from 'chalk'
import ora from 'ora'
import { prefix } from '../util/log.js'

export class DependenciesManager {
  constructor(
    public readonly cwd: string,
    public readonly activity: ActivityMetadata,
  ) { }

  async isValidPackageJson() {
    if (!existsSync(resolve(this.cwd, 'package.json')))
      return false

    try {
      JSON.parse(await readFile(resolve(this.cwd, 'package.json'), 'utf8'))
      return true
    }
    catch {
      return false
    }
  }

  async installDependencies() {
    const prevNodeEnv = process.env.NODE_ENV
    delete process.env.NODE_ENV

    if (!(await this.isValidPackageJson()))
      return

    const spinner = ora(
      prefix + chalk.yellow(` Installing dependencies for ${this.activity.service}...`),
    ).start()

    try {
      //* Run npm install
      const job = exec('npm install --loglevel error --save-exact', {
        cwd: this.cwd,
      })

      let errorChunks: any[] = []
      job.stderr?.on('data', (data: any) => {
        errorChunks = errorChunks.concat(data)
      })

      //* Handle exec errors
      job.on('error', (error: any) => {
        spinner.fail(`${prefix} ${chalk.red(`Failed to run npm install: ${error.message}`)}`)
      })

      await new Promise<void>((resolve, reject) =>
        job.once('exit', (code: any) => {
          if (code === 0) {
            spinner.succeed(prefix + chalk.greenBright(` Installed dependencies for ${this.activity.service}!`))

            return resolve()
          }

          spinner.fail(`${prefix} ${chalk.red(errorChunks.join(''))}`)

          resolve()
        }),
      )
    }
    catch (error) {
      spinner.fail(`${prefix} ${chalk.red(`Unexpected error during npm install: ${error instanceof Error ? error.message : String(error)}`)}`)
    }
    finally {
      process.env.NODE_ENV = prevNodeEnv
    }
  }
}
