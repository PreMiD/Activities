import type { Ora } from 'ora'
import type { TesterEvent, TestResult } from '../ActivityTester.js'
import process from 'node:process'
import chalk from 'chalk'
import ora from 'ora'

const INDENT = '   '

function formatSeconds(durationMs: number): string {
  return `${(durationMs / 1000).toFixed(1)}s`
}

function resultLines(result: TestResult): string[] {
  switch (result.status) {
    case 'passed':
      return [`${chalk.green('✓')} ${result.name} ${chalk.dim(formatSeconds(result.durationMs))}`]
    case 'skipped':
      return [`${chalk.yellow('↷')} ${chalk.dim(`${result.name} (skipped)`)}`]
    case 'failed':
      return [
        `${chalk.red('✗')} ${chalk.red(result.name)} ${chalk.dim(formatSeconds(result.durationMs))}`,
        ...(result.error ?? '').split('\n').filter(Boolean).map(line => `  ${chalk.red(line)}`),
        ...(result.lastActivity !== undefined ? [`  ${chalk.dim(`Last activity: ${JSON.stringify(result.lastActivity)}`)}`] : []),
      ]
    case 'cancelled':
      return []
  }
}

/**
 * Prints test progress. In a terminal the running test is a live line that turns into its result,
 * elsewhere (CI, `pmd mcp`) only the waiting and result lines are printed.
 */
export function createReporter(service: string, log: (line: string) => void = console.log): (event: TesterEvent) => void {
  let spinner: Ora | undefined
  let current = ''

  // discardStdin: false keeps the spinner from swallowing the `p` and `t` keys of `pmd dev`.
  const live = (text: string) => {
    spinner ??= ora({ stream: process.stdout, discardStdin: false, indent: INDENT.length })
    if (!spinner.isEnabled)
      return false
    spinner.text = text
    if (!spinner.isSpinning)
      spinner.start()
    return true
  }

  return (event) => {
    switch (event.type) {
      case 'run':
        log('')
        log(`${chalk.bold(service)} ${chalk.dim(`${event.count} ${event.count === 1 ? 'test' : 'tests'}`)}`)
        break
      case 'start':
        current = event.name
        live(current)
        break
      case 'waiting':
        if (!live(`${current} ${chalk.yellow(`⏸ waiting for you: ${event.message}`)}`))
          log(`${INDENT}${chalk.yellow('⏸')} ${event.name} ${chalk.yellow(`waiting for you: ${event.message}`)}`)
        break
      case 'result':
        spinner?.stop()
        for (const line of resultLines(event.result))
          log(`${INDENT}${line}`)
        break
    }
  }
}

export function printSummary(results: TestResult[], log: (line: string) => void = console.log): void {
  const count = (status: TestResult['status']) => results.filter(result => result.status === status).length
  const parts = [
    count('failed') > 0 && chalk.red(`${count('failed')} failed`),
    count('passed') > 0 && chalk.green(`${count('passed')} passed`),
    count('skipped') > 0 && chalk.yellow(`${count('skipped')} skipped`),
  ].filter(Boolean)
  const total = results.reduce((sum, result) => sum + result.durationMs, 0)

  log('')
  log(`${chalk.dim(' Tests')}  ${parts.length > 0 ? parts.join(chalk.dim(' · ')) : chalk.dim('none ran')} ${chalk.dim(`(${results.length})`)}`)
  log(`${chalk.dim('  Time')}  ${formatSeconds(total)}`)
}
