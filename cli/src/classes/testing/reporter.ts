import type { TesterEvent, TestResult } from '../ActivityTester.js'
import chalk from 'chalk'

function formatSeconds(durationMs: number): string {
  return (durationMs / 1000).toFixed(1)
}

function printResult(service: string, result: TestResult, log: (line: string) => void) {
  const title = `${service} › ${result.name}`
  switch (result.status) {
    case 'passed':
      log(chalk.green(`✓ ${title} (${formatSeconds(result.durationMs)}s)`))
      break
    case 'skipped':
      log(chalk.yellow(`↷ ${title} (skipped)`))
      break
    case 'failed':
      log(chalk.red(`✗ ${title}`))
      if (result.error !== undefined)
        log(`  ${result.error}`)
      if (result.lastActivity !== undefined)
        log(`  Last activity: ${JSON.stringify(result.lastActivity)}`)
      break
    case 'cancelled':
      break
  }
}

export function createReporter(service: string, log: (line: string) => void = console.log): (event: TesterEvent) => void {
  return (event) => {
    switch (event.type) {
      case 'start':
        break
      case 'waiting':
        log(chalk.yellow(`⏸ ${service} › ${event.name}: waiting for you: ${event.message}`))
        break
      case 'result':
        printResult(service, event.result, log)
        break
    }
  }
}

export function printSummary(results: TestResult[], log: (line: string) => void = console.log): void {
  const count = (status: TestResult['status']) => results.filter(result => result.status === status).length
  log(`Tests: ${count('passed')} passed, ${count('failed')} failed, ${count('skipped')} skipped`)
}
