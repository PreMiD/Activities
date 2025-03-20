import process from 'node:process'
import { getActivities } from '../../util/getActivities.js'
import { info } from '../../util/log.js'
import { writeSarifLog } from '../../util/sarif.js'
import { buildActivity } from './buildActivity.js'

export async function buildAll({
  kill,
  validate,
  sarif,
  zip,
}: {
  kill: boolean
  validate: boolean
  sarif: boolean
  zip: boolean
}) {
  const activities = await getActivities()

  info(`Building ${activities.length} activities...`)

  let success = true
  for (const activity of activities) {
    const isSuccess = await buildActivity({
      path: activity.folder,
      activity: activity.metadata,
      versionized: activity.versionized,
      watch: false,
      kill,
      validate,
      zip,
    })
    success = success && isSuccess
  }

  info(`${activities.length} activities built ${success ? 'successfully' : 'with errors'}`)

  if (sarif) {
    await writeSarifLog()
  }

  process.exit(success ? 0 : 1)
}
