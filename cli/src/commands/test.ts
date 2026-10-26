import { cp } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import chalk from 'chalk'
import { ActivityCompiler } from '../classes/ActivityCompiler.js'
import { ActivityTester, findTestFiles } from '../classes/ActivityTester.js'
import { createReporter, printSummary } from '../classes/testing/reporter.js'
import { WebSocketServer } from '../classes/WebSocketServer.js'
import { getSingleActivity } from '../util/getSingleActivity.js'
import { exit, info } from '../util/log.js'

const EXTENSION_WAIT_MS = 15_000

async function waitForExtension(ws: WebSocketServer): Promise<boolean> {
  const deadline = Date.now() + EXTENSION_WAIT_MS
  while (!ws.isConnected) {
    if (Date.now() >= deadline)
      return false
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  return true
}

export async function test(service?: string) {
  const { metadata, folder, versionized } = await getSingleActivity('Select or search for an activity to test', service)

  // Checked before compiling or probing the extension, so a tests-less activity exits at once.
  if ((await findTestFiles(folder)).length === 0) {
    info(`No tests found for ${metadata.service}`)
    process.exit(0)
  }

  await cp(
    resolve(process.cwd(), `cli/templates/tsconfig${versionized ? '.versionized' : ''}.json`),
    resolve(folder, 'tsconfig.json'),
  )

  const compiler = new ActivityCompiler(folder, metadata, versionized)
  await compiler.compile({ kill: true, validate: false, preCheck: true, zip: false })

  const ws = new WebSocketServer(folder)
  if (!(await waitForExtension(ws))) {
    exit('Extension not connected. Is developer mode on?')
  }

  await ws.send()

  const tester = new ActivityTester(folder, metadata.service, ws, createReporter(metadata.service))
  if (!(await tester.isSupported())) {
    await ws.close()
    exit(`Your extension doesn't support tests yet, or developer mode is off`)
  }

  let results
  try {
    results = await tester.run({ signal: new AbortController().signal, interactive: true })
  }
  catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(chalk.red(`✗ ${metadata.service}: ${message}`))
    await ws.close()
    process.exit(1)
  }

  printSummary(results)
  await ws.close()

  const failed = results.some(result => result.status === 'failed')
  process.exit(failed ? 1 : 0)
}
