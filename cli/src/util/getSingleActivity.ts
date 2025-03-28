import type { ActivityMetadata } from '../classes/ActivityCompiler.js'
import type { ActivityMetadataAndFolder } from './getActivities.js'
import { select } from '@inquirer/prompts'
import { exit } from '../util/log.js'
import { mapActivityToChoice } from '../util/mapActivityToChoice.js'
import { getActivities } from './getActivities.js'

export async function getSingleActivity(searchMessage: string, service?: string): Promise<ActivityMetadataAndFolder> {
  const activities = await getActivities()
  let metadata: ActivityMetadata
  let folder: string
  let versionized: boolean
  if (!service) {
    ({ metadata, folder, versionized } = await select({
      message: searchMessage,
      choices: activities.map(activity => mapActivityToChoice(activity)),
    }))
  }
  else {
    const sameServiceActivities = activities.filter(({ metadata }) => metadata.service.toLowerCase() === service.toLowerCase())

    if (sameServiceActivities.length === 0) {
      exit(`No activities found for service ${service}`)
    }

    if (sameServiceActivities.length > 1) {
      ({ metadata, folder, versionized } = await select({
        message: searchMessage,
        choices: sameServiceActivities.map(activity => mapActivityToChoice(activity)),
      }))
    }
    else {
      metadata = sameServiceActivities[0].metadata
      folder = sameServiceActivities[0].folder
      versionized = sameServiceActivities[0].versionized
    }
  }

  return {
    metadata,
    folder,
    versionized,
  }
}
