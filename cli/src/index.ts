#! /usr/bin/env node

import process from 'node:process'
import { cac } from 'cac'
import { build } from './commands/build.js'
import { bump } from './commands/bump.js'
import { checkDns } from './commands/checkDns.js'
import { newActivity } from './commands/new.js'
import { release } from './commands/release.js'
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
  .command('bump [activity] [version]', 'Bump an activity')
  .option('--all', 'Bump all activities (Usage: bump "" [version] --all)')
  .option('--changed', 'Bump only changed activities (Usage: bump "" [version] --changed)')
  .action(bump)

cli
  .command('check-dns [activity]', 'Check DNS records for activity URLs')
  .option('--all', 'Check all activities')
  .option('--changed', 'Check only changed activities')
  .option('--fix', 'Remove invalid URLs and activities')
  .option('--create-pr', 'Create a pull request with fixes (CI only, requires --fix)')
  .action(checkDns)

cli
  .command('update-assets', 'Update assets for all activities in CI')
  .action(updateAssets)

cli
  .command('release', 'Release all activities in CI')
  .action(release)

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
