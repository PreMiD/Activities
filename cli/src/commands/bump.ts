import type { ActivityMetadataAndFolder } from '../util/getActivities.js'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { search } from '@inquirer/prompts'
import chalk from 'chalk'
import { compare, inc, valid } from 'semver'
import { getActivities, getChangedActivities } from '../util/getActivities.js'
import { getSingleActivity } from '../util/getSingleActivity.js'
import { exit, info, prefix } from '../util/log.js'
import { searchChoices } from '../util/searchChoices.js'

export async function bump(service?: string, version?: string, {
  all = false,
  changed = false,
}: {
  all?: boolean
  changed?: boolean
} = {}) {
  let activities: ActivityMetadataAndFolder[] = []

  if (all)
    activities = await getActivities()
  else if (changed)
    ({ changed: activities } = await getChangedActivities())
  else
    activities = [await getSingleActivity(`Select or search for an activity to bump`, service)]

  for (const activity of activities) {
    await bumpActivity(activity, version)
  }
}

async function bumpActivity(activity: ActivityMetadataAndFolder, version?: string) {
  if (!valid(activity.metadata.version)) {
    exit(`The current version of ${activity.metadata.service} is not a valid version`)
  }

  switch (version?.toLowerCase()) {
    case 'major':
      activity.metadata.version = inc(activity.metadata.version, 'major')!
      break
    case 'minor':
      activity.metadata.version = inc(activity.metadata.version, 'minor')!
      break
    case 'patch':
      activity.metadata.version = inc(activity.metadata.version, 'patch')!
      break
    default: {
      if (version) {
        if (valid(version) && compare(activity.metadata.version, version) === -1) {
          activity.metadata.version = version
          break
        }

        info(`Version ${activity.metadata.version} is already greater than ${version}, please choose a different version`)
      }

      const validVersions = [
        inc(activity.metadata.version, 'patch')!,
        inc(activity.metadata.version, 'minor')!,
        inc(activity.metadata.version, 'major')!,
      ]

      const selectedVersion = await search({
        message: `Please select a version to bump ${activity.metadata.service} to`,
        source: input => searchChoices(validVersions.map(x => ({ name: x, value: x })), input),
      }).catch(() => exit('Something went wrong.'))

      if (!selectedVersion) {
        exit('No version selected')
      }

      activity.metadata.version = selectedVersion
      break
    }
  }

  await writeFile(resolve(activity.folder, 'metadata.json'), `${JSON.stringify(activity.metadata, null, 2)}\n`)

  console.log(chalk.greenBright('✔ ') + prefix, chalk.greenBright(`${activity.metadata.service} has been bumped to ${activity.metadata.version}`))
}
