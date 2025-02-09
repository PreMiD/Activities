#! /usr/bin/env node

import { readFile } from 'node:fs/promises'
import { cac } from 'cac'
import { build } from './commands/build.js'
import { bump } from './commands/bump.js'
import { newActivity } from './commands/new.js'
import { release } from './commands/release.js'
import { updateAssets } from './commands/updateAssets.js'
import { getPackageJson } from './util/getPackageJson.js'
import { exit } from './util/log.js'

const cli = cac('pmd')
const localPackageJson = await getPackageJson()

if (localPackageJson.name !== 'activities') {
  exit('This CLI is only available in the activities repository')
}

const cliPackageJson = JSON.parse(await readFile('./cli/package.json', 'utf-8').catch(() => {
  exit('This CLI is only available in the activities repository')
}))

cli
  .command('new [activity]', 'Create a new activity')
  .action(newActivity)

cli
  .command('dev [activity]', 'Run an activity in dev mode')
  .action(service => build(service, { watch: true }))

cli
  .command('build [activity]', 'Build an activity')
  .option('--all', 'Build all activities')
  .option('--watch', 'Watch for changes and rebuild (Same as `dev`)')
  .option('--changed', 'Build only changed activities')
  .option('--kill', 'Kill the process on error', { default: true })
  .option('--validate', 'Check if the activity is valid (metadata, images, etc.)')
  .option('--sarif', 'Output the result in SARIF format (Doesn\'t work with --kill)')
  .action(build)

cli
  .command('bump [activity] [version]', 'Bump an activity')
  .option('-all', 'Bump all activities')
  .option('-changed', 'Bump only changed activities')
  .action(bump)

cli
  .command('update-assets', 'Update assets for all activities in CI')
  .action(updateAssets)

cli
  .command('release', 'Release all activities in CI')
  .action(release)

cli.help()
cli.version(cliPackageJson.version)

cli.parse()
