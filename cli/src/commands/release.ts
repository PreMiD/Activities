import type { ActivityMetadata } from '../classes/ActivityCompiler.js'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import * as core from '@actions/core'
import * as github from '@actions/github'
import isCI from 'is-ci'
import { getDmcaServices, isDmcaBlocked } from '../util/dmca.js'
import { getChangedActivities } from '../util/getActivities.js'
import { getFolderLetter } from '../util/getFolderLetter.js'
import { exit, MESSAGES, success } from '../util/log.js'
import { sanitazeFolderName } from '../util/sanitazeFolderName.js'
import { buildActivity } from './build/buildActivity.js'

interface ActivityData {
  service: string
  apiVersion?: number
  githubUrl: string
  folderName: string
  url: string
  metadata: ActivityMetadata
  presenceJs: string
  iframeJs?: string
}

//* Command to release new versions of activities
export async function release() {
  if (!isCI) {
    return exit(MESSAGES.ciOnly)
  }

  //* Only run for PreMiD/Activities repository
  if (github.context.repo.owner !== 'PreMiD' || github.context.repo.repo !== 'Activities') {
    return success(MESSAGES.wrongRepository)
  }

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    return exit(MESSAGES.noToken)
  }

  const apiKey = process.env.ADMIN_API_KEY
  if (!apiKey) {
    return exit('No Admin API key provided')
  }

  const apiUrl = process.env.API_URL || 'https://api.premid.app/v6'

  const { changed: allChanged, deleted } = await getChangedActivities()

  const dmcaServices = await getDmcaServices()
  const changed = allChanged.filter((activity) => {
    if (isDmcaBlocked(activity.metadata.service, dmcaServices)) {
      core.warning(`Skipping DMCA-blocked activity: ${activity.metadata.service}`)
      return false
    }
    return true
  })

  core.info(`Found ${changed.length} changed activities, ${deleted.length} deleted activities`)

  //* If no activities changed, return success
  if (changed.length === 0 && deleted.length === 0) {
    return success(MESSAGES.noActivities)
  }

  if (deleted.length) {
    for (const activity of deleted) {
      const folderName = sanitazeFolderName(activity.metadata.service)
      const apiVersion = activity.versionized ? `/v${activity.metadata.apiVersion}` : ''

      try {
        const response = await fetch(`${apiUrl}/activities${apiVersion}/${encodeURIComponent(folderName)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `${apiKey}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          core.setFailed(`Failed to delete activity ${activity.metadata.service}: ${response.statusText}, ${await response.text()}`)
        }
      }
      catch (error) {
        core.setFailed(`Error deleting activity ${activity.metadata.service}: ${error}`)
      }
    }

    core.info(`Deleted ${deleted.length} activities`)
  }

  let successCount = 0

  for (const activity of changed) {
    await buildActivity({
      activity: activity.metadata,
      path: activity.folder,
      versionized: activity.versionized,
      kill: true,
      validate: false,
      watch: false,
      zip: false,
    })

    const folderLetter = encodeURIComponent(getFolderLetter(activity.metadata.service))
    const folderName = sanitazeFolderName(activity.metadata.service)
    const folderNameEncoded = encodeURIComponent(folderName)
    const apiVersion = activity.versionized ? `/v${activity.metadata.apiVersion}` : ''

    const activityData: ActivityData = {
      service: activity.metadata.service,
      apiVersion: activity.versionized ? activity.metadata.apiVersion : undefined,
      metadata: activity.metadata,
      folderName,
      githubUrl: `https://github.com/PreMiD/Activities/tree/main/websites/${folderLetter}/${folderNameEncoded}${apiVersion}`,
      url: `${apiUrl}/activities${apiVersion}/${folderNameEncoded}`,
      presenceJs: await readFile(resolve(activity.folder, 'dist', 'presence.js'), 'utf8'),
      ...(existsSync(resolve(activity.folder, 'dist', 'iframe.js')) && {
        iframeJs: await readFile(resolve(activity.folder, 'dist', 'iframe.js'), 'utf8'),
      }),
    }

    try {
      const response = await fetch(`${apiUrl}/activities`, {
        method: 'POST',
        headers: {
          'Authorization': `${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      })

      if (response.ok) {
        successCount++
      }
      else {
        core.setFailed(`Failed to update activity ${activity.metadata.service}: ${response.statusText}, ${await response.text()}`)
      }
    }
    catch (error) {
      core.setFailed(`Error updating activity ${activity.metadata.service}: ${error}`)
    }
  }

  core.info(`Successfully updated ${successCount} activities`)
}
