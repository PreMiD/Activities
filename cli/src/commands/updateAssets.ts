import { execSync } from 'node:child_process'
import process from 'node:process'
import * as core from '@actions/core'
import * as github from '@actions/github'
import isCI from 'is-ci'
import { AssetsManager } from '../classes/AssetsManager.js'
import { getChangedActivities } from '../util/getActivities.js'
import { exit, MESSAGES, success } from '../util/log.js'

const NAME = 'Assets updater / pmd'

//* Checks if there are any git changes in the working directory
function hasGitChanges(): boolean {
  const output = execSync('git status --porcelain').toString()
  return output.length > 0
}

//* Command to update assets and manage GitHub status checks for push events
export async function updateAssets() {
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

  if (!process.env.CDN_TOKEN) {
    return exit(MESSAGES.noCdnToken)
  }

  const octokit = github.getOctokit(token)
  const context = github.context
  const sha = context.sha

  const { changed, deleted } = await getChangedActivities()

  core.info(`Found ${changed.length} changed activities, ${deleted.length} deleted activities`)

  //* If no activities changed, return success
  if (changed.length === 0 && deleted.length === 0) {
    await octokit.rest.repos.createCommitStatus({
      ...context.repo,
      sha,
      state: 'success',
      description: MESSAGES.noActivities,
      context: NAME,
    })

    return success(MESSAGES.noActivities)
  }

  core.info('Checking and updating assets...')

  try {
    //* Create pending status while we process
    await octokit.rest.repos.createCommitStatus({
      ...context.repo,
      sha,
      state: 'pending',
      description: MESSAGES.checkingAndUpdatingAssets,
      context: NAME,
    })

    let valid = true
    for (const [index, activity] of changed.entries()) {
      const assetsManager = new AssetsManager(activity.folder, activity.metadata, activity.versionized)

      const assets = await assetsManager.getAssets()
      for (const asset of assets) {
        if (!(await assetsManager.validateImage({ asset, kill: false }))) {
          valid = false
        }
      }

      core.info(`Validated ${assets.length} assets for ${activity.metadata.service} (${index + 1}/${changed.length})`)
    }

    if (!valid) {
      await octokit.rest.repos.createCommitStatus({
        ...context.repo,
        sha,
        state: 'failure',
        description: MESSAGES.someInvalidAssets,
        context: NAME,
      })

      return exit(MESSAGES.someInvalidAssets)
    }

    core.info('Assets validated, updating assets...')

    let count = 0

    //* Delete assets for each deleted activity
    for (const [index, activity] of deleted.entries()) {
      const assetsManager = new AssetsManager(activity.folder, activity.metadata, activity.versionized)

      const deletedCount = await assetsManager.deleteCdnAssets()
      count += deletedCount

      core.info(`Deleted ${deletedCount} assets for ${activity.metadata.service} (${index + 1}/${deleted.length})`)
    }

    //* Update assets for each activity
    for (const [index, activity] of changed.entries()) {
      const assetsManager = new AssetsManager(activity.folder, activity.metadata, activity.versionized)

      const updatedCount = await assetsManager.updateCdnAssets()
      count += updatedCount

      core.info(`Updated ${updatedCount} assets for ${activity.metadata.service} (${index + 1}/${changed.length})`)
    }

    core.info(`Updated ${count} assets`)

    //* Check if there are any changes to commit
    if (!hasGitChanges()) {
      core.info('No changes to commit')
      await octokit.rest.repos.createCommitStatus({
        ...context.repo,
        sha,
        state: 'success',
        description: MESSAGES.assetsUpdatedCount(count),
        context: NAME,
      })
      return
    }

    //* Run ESLint on changed files
    const changedFiles = execSync('git diff --name-only HEAD').toString().trim()
    const tsAndJsonFiles = changedFiles.split('\n').filter(file => file.endsWith('.ts') || file.endsWith('.json'))

    if (tsAndJsonFiles.length > 0) {
      core.info('Running ESLint on changed files')
      try {
        //* Run eslint on each file individually to avoid command injection
        for (const file of tsAndJsonFiles) {
          //* Validate file path to prevent injection
          if (!file.match(/^[\w\-./]+$/)) {
            core.warning(`Skipping file with suspicious characters: ${file}`)
            continue
          }
          try {
            execSync(`npx eslint --fix "${file.replace(/"/g, '\\"')}"`, {
              stdio: 'ignore',
            })
          }
          catch {
            //* Individual file failures are not critical
          }
        }
      }
      catch (error) {
        core.debug(`ESLint failed: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    //* Eslint may have changed the files back to the original state, so we need to check again
    if (!hasGitChanges()) {
      core.info('No changes to commit')
      await octokit.rest.repos.createCommitStatus({
        ...context.repo,
        sha,
        state: 'success',
        description: MESSAGES.assetsUpdatedCount(count),
        context: NAME,
      })
      return
    }

    //* Commit and push changes
    core.info('Committing and pushing changes')
    execSync('git add .')
    execSync('git commit -m "chore: update assets"')
    execSync('git pull --rebase')
    execSync('git push')

    await octokit.rest.repos.createCommitStatus({
      ...context.repo,
      sha,
      state: 'success',
      description: MESSAGES.assetsUpdatedCount(count),
      context: NAME,
    })
  }
  catch (error) {
    //* Update status to failure if something goes wrong
    await octokit.rest.repos.createCommitStatus({
      ...context.repo,
      sha,
      state: 'failure',
      description: MESSAGES.error,
      context: NAME,
    })

    throw error
  }
}
