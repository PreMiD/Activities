import type { ActivityMetadata } from '../classes/ActivityCompiler.js'
import type { ActivityMetadataAndFolder } from './getActivities.js'
import { search } from '@inquirer/prompts'
import { getActivities } from './getActivities.js'
import { exit } from './log.js'
import { mapActivityToChoice } from './mapActivityToChoice.js'
import { searchChoices } from './searchChoices.js'

export async function getSingleActivity(searchMessage: string, service?: string): Promise<ActivityMetadataAndFolder> {
  const activities = await getActivities()
  let metadata: ActivityMetadata
  let folder: string
  let versionized: boolean
  if (!service) {
    ({ metadata, folder, versionized } = await search({
      message: searchMessage,
      source: input => searchChoices(activities.map(activity => mapActivityToChoice(activity)), input),
    }))
  }
  else {
    const sameServiceActivities = activities.filter(({ metadata }) => metadata.service.toLowerCase() === service.toLowerCase())

    if (sameServiceActivities.length === 0) {
      exit(`No activities found for service ${service}`)
    }

    if (sameServiceActivities.length > 1) {
      ({ metadata, folder, versionized } = await search({
        message: searchMessage,
        source: input => searchChoices(sameServiceActivities.map(activity => mapActivityToChoice(activity)), input),
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
