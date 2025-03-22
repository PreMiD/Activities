import type { ActivityMetadataAndFolder } from './getActivities.js'

export function mapActivityToChoice(activity: ActivityMetadataAndFolder) {
  return {
    value: activity,
    name: `${activity.metadata.service}${activity.versionized ? ` (APIv${activity.metadata.apiVersion})` : ''}`,
  }
}
