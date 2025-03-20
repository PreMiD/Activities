import type { ActivityMetadata } from '../classes/ActivityCompiler.js'
import type { ActivityMetadataAndFolder } from './getActivities.js'
import autocomplete from 'inquirer-autocomplete-standalone'
import { exit } from '../util/log.js'
import { mapActivityToChoice } from '../util/mapActivityToChoice.js'
import { getActivities } from './getActivities.js'

export async function getSingleActivity(searchMessage: string, service?: string): Promise<ActivityMetadataAndFolder> {
  const activities = await getActivities()
  let metadata: ActivityMetadata
  let folder: string
  let versionized: boolean
  if (!service) {
    ({ metadata, folder, versionized } = await autocomplete<ActivityMetadataAndFolder>({
      message: searchMessage,
      source: async (input) => {
        if (!input) {
          return activities.map(activity => mapActivityToChoice(activity))
        }
        return activities
          .filter(({ metadata }) => metadata.service.toLowerCase().includes(input.toLowerCase()))
          .map(activity => mapActivityToChoice(activity))
      },
    }))
  }
  else {
    const sameServiceActivities = activities.filter(({ metadata }) => metadata.service.toLowerCase() === service.toLowerCase())

    if (sameServiceActivities.length === 0) {
      exit(`No activities found for service ${service}`)
    }

    if (sameServiceActivities.length > 1) {
      ({ metadata, folder, versionized } = await autocomplete<ActivityMetadataAndFolder>({
        message: searchMessage,
        source: async () => {
          return sameServiceActivities.map(activity => mapActivityToChoice(activity))
        },
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
