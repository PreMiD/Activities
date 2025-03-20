import type { ChoiceOrSeparatorArray } from 'inquirer-autocomplete-standalone'
import type { ActivityMetadataAndFolder } from './getActivities.js'

export function mapActivityToChoice(activity: ActivityMetadataAndFolder): ChoiceOrSeparatorArray<ActivityMetadataAndFolder>[number] {
  return {
    value: activity,
    name: `${activity.metadata.service}${activity.versionized ? ` (APIv${activity.metadata.apiVersion})` : ''}`,
  }
}
