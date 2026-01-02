import type { ActivityMetadataAndFolder } from '../util/getActivities.js'
import { readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { setTimeout } from 'node:timers/promises'
import * as core from '@actions/core'
import chalk from 'chalk'
import isCI from 'is-ci'
import { inc, valid } from 'semver'
import {
  checkDomainDns,
  isValidDomain,
  sanitizeDomain,

} from '../util/dnsValidator.js'
import { getActivities, getChangedActivities } from '../util/getActivities.js'
import { getSingleActivity } from '../util/getSingleActivity.js'
import { info, prefix, success } from '../util/log.js'

interface ActivityCheckResult {
  activity: ActivityMetadataAndFolder
  validUrls: string[]
  invalidUrls: string[]
  allUrlsInvalid: boolean
}

interface ChangesSummary {
  removed: Array<{
    name: string
    urls: string[]
  }>
  updated: Array<{
    name: string
    oldVersion: string
    newVersion: string
    removedUrls: string[]
    keptUrls: string[]
  }>
  totalChecked: number
  totalActivities: number
}

export async function checkDns(
  service?: string,
  {
    all = false,
    changed = false,
    fix = false,
  }: {
    all?: boolean
    changed?: boolean
    fix?: boolean
  } = {},
) {
  let activities: ActivityMetadataAndFolder[] = []

  if (all) {
    activities = await getActivities()
  }
  else if (changed) {
    ;({ changed: activities } = await getChangedActivities())
  }
  else {
    activities = [
      await getSingleActivity(
        `Select or search for an activity to check DNS`,
        service,
      ),
    ]
  }

  info(`Checking DNS for ${activities.length} activities...`)

  // Check all activities
  const results = await checkActivities(activities)

  // Display results
  displayResults(results)

  // Apply fixes if requested
  if (fix) {
    info('\nApplying fixes...')
    const changes = await applyFixes(results)

    if (changes.removed.length > 0 || changes.updated.length > 0) {
      // In CI, write summary file for the create-pull-request action
      if (isCI) {
        const date = new Date().toISOString().split('T')[0]
        const body = generatePRBody(changes, date)
        const summaryPath = join(tmpdir(), 'dns-check-summary.md')
        await writeFile(summaryPath, body)
        core.setOutput('has_changes', 'true')
        core.setOutput('summary_path', summaryPath)
      }

      success(
        `Fixed ${changes.removed.length + changes.updated.length} activities`,
      )
    }
    else {
      success('No changes needed - all DNS checks passed')
    }
  }
  else {
    success('DNS check completed (no changes made)')
  }
}

async function checkActivities(
  activities: ActivityMetadataAndFolder[],
): Promise<ActivityCheckResult[]> {
  const results: ActivityCheckResult[] = []
  const BATCH_SIZE = 100
  const BATCH_DELAY = 2000 // 2 seconds

  // Process in batches to avoid overwhelming DNS servers
  for (let i = 0; i < activities.length; i += BATCH_SIZE) {
    const batch = activities.slice(i, i + BATCH_SIZE)
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(activities.length / BATCH_SIZE)

    info(
      `Processing batch ${batchNumber}/${totalBatches} (${batch.length} activities)...`,
    )

    const batchResults = await Promise.all(
      batch.map(activity => checkActivity(activity)),
    )

    results.push(...batchResults)

    // Delay between batches (except last batch)
    if (i + BATCH_SIZE < activities.length) {
      await setTimeout(BATCH_DELAY)
    }
  }

  return results
}

async function checkActivity(
  activity: ActivityMetadataAndFolder,
): Promise<ActivityCheckResult> {
  try {
    // Read metadata
    const metadataPath = resolve(activity.folder, 'metadata.json')
    const content = await readFile(metadataPath, 'utf-8')
    const metadata = JSON.parse(content)

    // Extract URLs (handle both string and array)
    const urls = Array.isArray(metadata.url) ? metadata.url : [metadata.url]

    // Separate URLs into those to check and those to skip (localhost/IPs)
    const urlsToCheck: string[] = []
    const skippedUrls: string[] = []

    for (const url of urls) {
      if (typeof url !== 'string')
        continue

      const domain = sanitizeDomain(url)

      if (!isValidDomain(domain)) {
        // Skip localhost and IP addresses - don't count as invalid
        skippedUrls.push(url)
      }
      else {
        urlsToCheck.push(url)
      }
    }

    // Check each valid domain URL
    const urlChecks = await Promise.all(
      urlsToCheck.map(async (url: string) => {
        const domain = sanitizeDomain(url)
        const result = await checkDomainDns(domain)
        return {
          url,
          ...result,
        }
      }),
    )

    const validUrls = [
      ...urlChecks.filter(check => check.valid).map(check => check.url),
      ...skippedUrls, // Include skipped URLs as "valid" (don't remove them)
    ]
    const invalidUrls = urlChecks
      .filter(check => !check.valid)
      .map(check => check.url)

    return {
      activity,
      validUrls,
      invalidUrls,
      allUrlsInvalid: validUrls.length === 0 && invalidUrls.length > 0,
    }
  }
  catch (error: any) {
    // If we can't read/parse metadata, treat as invalid
    console.error(
      `${chalk.red('✗')} ${activity.metadata.service}: ${error.message}`,
    )
    return {
      activity,
      validUrls: [],
      invalidUrls: [],
      allUrlsInvalid: true,
    }
  }
}

function displayResults(results: ActivityCheckResult[]) {
  const activitiesWithIssues = results.filter(
    r => r.invalidUrls.length > 0 || r.allUrlsInvalid,
  )
  const totalInvalidUrls = results.reduce(
    (sum, r) => sum + r.invalidUrls.length,
    0,
  )

  info(`\n${'='.repeat(60)}`)
  info('DNS Check Results')
  info('='.repeat(60))

  if (activitiesWithIssues.length === 0) {
    console.log(chalk.green('✓ All activities passed DNS checks'))
    return
  }

  console.log(
    chalk.yellow(
      `⚠ Found ${activitiesWithIssues.length} activities with DNS issues`,
    ),
  )
  console.log(chalk.yellow(`⚠ Total invalid URLs: ${totalInvalidUrls}`))
  console.log('')

  // Group by type
  const toBeRemoved = activitiesWithIssues.filter(r => r.allUrlsInvalid)
  const toBeUpdated = activitiesWithIssues.filter(r => !r.allUrlsInvalid)

  if (toBeRemoved.length > 0) {
    console.log(chalk.red(`\nActivities to be removed (${toBeRemoved.length}):`))
    for (const result of toBeRemoved) {
      console.log(
        chalk.red('  ✗'),
        chalk.bold(result.activity.metadata.service),
        chalk.dim('-'),
        chalk.dim(result.invalidUrls.join(', ')),
      )
    }
  }

  if (toBeUpdated.length > 0) {
    console.log(chalk.yellow(`\nActivities to be updated (${toBeUpdated.length}):`))
    for (const result of toBeUpdated) {
      console.log(
        chalk.yellow('  ⚠'),
        chalk.bold(result.activity.metadata.service),
      )
      console.log(
        chalk.dim('    Removed:'),
        chalk.red(result.invalidUrls.join(', ')),
      )
      console.log(
        chalk.dim('    Kept:'),
        chalk.green(result.validUrls.join(', ')),
      )
    }
  }

  info('='.repeat(60))
}

async function applyFixes(
  results: ActivityCheckResult[],
): Promise<ChangesSummary> {
  const changes: ChangesSummary = {
    removed: [],
    updated: [],
    totalChecked: results.length,
    totalActivities: results.length,
  }

  for (const result of results) {
    if (result.allUrlsInvalid) {
      // Remove entire activity
      await removeActivity(result.activity)
      changes.removed.push({
        name: result.activity.metadata.service,
        urls: result.invalidUrls,
      })
      console.log(
        chalk.red('✗'),
        prefix,
        `Removed ${result.activity.metadata.service}`,
      )
    }
    else if (result.invalidUrls.length > 0) {
      // Update activity (remove invalid URLs and increment version)
      const oldVersion = result.activity.metadata.version
      const newVersion = await updateActivity(result.activity, result.validUrls)
      changes.updated.push({
        name: result.activity.metadata.service,
        oldVersion,
        newVersion,
        removedUrls: result.invalidUrls,
        keptUrls: result.validUrls,
      })
      console.log(
        chalk.yellow('⚠'),
        prefix,
        `Updated ${result.activity.metadata.service} (${oldVersion} → ${newVersion})`,
      )
    }
  }

  return changes
}

async function removeActivity(
  activity: ActivityMetadataAndFolder,
): Promise<void> {
  try {
    await rm(activity.folder, { recursive: true, force: true })
  }
  catch (error: any) {
    console.error(
      chalk.red('Failed to remove activity:'),
      activity.metadata.service,
      error.message,
    )
  }
}

async function updateActivity(
  activity: ActivityMetadataAndFolder,
  validUrls: string[],
): Promise<string> {
  const metadataPath = resolve(activity.folder, 'metadata.json')
  const content = await readFile(metadataPath, 'utf-8')
  const metadata = JSON.parse(content)

  // Update URL field
  metadata.url = validUrls.length === 1 ? validUrls[0] : validUrls

  // Increment version
  if (!valid(metadata.version)) {
    metadata.version = '1.0.1'
  }
  else {
    metadata.version = inc(metadata.version, 'patch')!
  }

  // Write back
  await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`)

  return metadata.version
}

function generatePRBody(changes: ChangesSummary, date: string): string {
  let body = `## DNS Check Results

This PR automatically removes activities with URLs that failed DNS resolution checks.

`

  if (changes.removed.length > 0) {
    body += `### Activities Removed (${changes.removed.length})

The following activities were completely removed because all their URLs failed DNS checks:

`
    for (const item of changes.removed) {
      body += `- **${item.name}** - URLs: \`${item.urls.join(', ')}\`\n`
    }
    body += '\n'
  }

  if (changes.updated.length > 0) {
    body += `### Activities Updated (${changes.updated.length})

The following activities had some invalid URLs removed:

`
    for (const item of changes.updated) {
      body += `- **${item.name}** (v${item.oldVersion} → v${item.newVersion})\n`
      body += `  - Removed: \`${item.removedUrls.join(', ')}\`\n`
      body += `  - Kept: \`${item.keptUrls.join(', ')}\`\n`
    }
    body += '\n'
  }

  body += `### Check Details

- **Run Date:** ${date}
- **Total Activities Checked:** ${changes.totalChecked}
- **DNS Check Method:** A/AAAA record resolution
- **Retry Logic:** 3 attempts with progressive backoff (1s, 3s, 5s)
`

  return body
}
