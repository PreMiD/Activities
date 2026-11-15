#! /usr/bin/env node

import process from 'node:process'
import { cac } from 'cac'
import { build } from './commands/build.js'
import { bump } from './commands/bump.js'
import { checkDns } from './commands/checkDns.js'
import { mcp } from './commands/mcp.js'
import { newActivity } from './commands/new.js'
import { release } from './commands/release.js'
import { syncBuild, syncDev, syncKeygen, syncNew, syncRelease } from './commands/sync.js'
import { test } from './commands/test.js'
import { updateAssets } from './commands/updateAssets.js'
import { getCliPackageJson, getPackageJson } from './util/getPackageJson.js'
import { exit } from './util/log.js'

const cli = cac('pmd')
const localPackageJson = await getPackageJson()

if (localPackageJson.name !== 'activities') {
  exit('This CLI is only available in the activities repository')
}

const cliPackageJson = await getCliPackageJson()

cli
  .command('new [activity]', 'Create a new activity')
  .action(newActivity)

cli
  .command('dev [activity]', 'Run an activity in dev mode')
  .option('--validate', 'Check if the activity is valid (metadata, images, etc.)')
  .option('--sarif', 'Output the result in SARIF format')
  .option('--zip', 'Zip the activity')
  .action((service, options) => build(service, { ...options, watch: true }))

cli
  .command('build [activity]', 'Build an activity')
  .option('--all', 'Build all activities')
  .option('--watch', 'Watch for changes and rebuild (Same as `dev`)')
  .option('--changed', 'Build only changed activities')
  .option('--kill', 'Kill the process on error', { default: true })
  .option('--validate', 'Check if the activity is valid (metadata, images, etc.)')
  .option('--sarif', 'Output the result in SARIF format (Doesn\'t work with --kill)')
  .option('--zip', 'Zip the activity')
  .action(build)

cli
  .command('test [activity]', 'Run the e2e tests of an activity')
  .action(test)

cli
  .command('bump [activity] [version]', 'Bump an activity')
  .option('--all', 'Bump all activities (Usage: bump "" [version] --all)')
  .option('--changed', 'Bump only changed activities (Usage: bump "" [version] --changed)')
  .action(bump)

cli
  .command('check-dns [activity]', 'Check DNS records for activity URLs')
  .option('--all', 'Check all activities')
  .option('--changed', 'Check only changed activities')
  .option('--fix', 'Remove invalid URLs and activities')
  .action(checkDns)

cli
  .command('sync-new [script]', 'Create a new sync script')
  .action(syncNew)

cli
  .command('sync-dev [script]', 'Develop a sync script with hot-reload')
  .action(syncDev)

cli
  .command('sync-build [script]', 'Build a sync script')
  .option('--all', 'Build all sync scripts')
  .option('--kill', 'Kill on error', { default: true })
  .option('--zip', 'Zip the sync script')
  .option('--validate', 'Also check that every changed script raised its version over the base branch')
  .action(syncBuild)

cli
  .command('sync-release [script]', 'Build and release a sync script to the API')
  .option('--changed', 'Release the sync scripts changed since the base commit and delete removed ones')
  .option('--all', 'Release every sync script')
  .action(syncRelease)

cli
  .command('sync-keygen', 'Print a new Ed25519 key pair for signing sync scripts')
  .action(syncKeygen)

cli
  .command('update-assets', 'Update assets for all activities in CI')
  .action(updateAssets)

cli
  .command('release', 'Release all activities in CI')
  .action(release)

cli
  .command('mcp', 'Run the MCP server for AI agents')
  .action(mcp)

cli.help()
cli.version(cliPackageJson.version)

cli.parse()

if (!cli.matchedCommand && !cli.options.help && !cli.options.version) {
  cli.outputHelp()
}

process.on('uncaughtException', (error) => {
  if (error instanceof Error && error.name === 'ExitPromptError') {
    // Exit gracefully
  }
  else {
    exit(error.message)
  }
})
