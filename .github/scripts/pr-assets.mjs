import { Buffer } from 'node:buffer'

export const COMMENT_MARKER = '<!-- pr-assets-comment -->'
export const MANAGED_LABELS = [
  'activity creation',
  'activity update',
  'activity deletion',
  'multiple activities',
]

// Matches files inside an activity folder, including versioned subfolders.
// Intentionally uses [^/]+ for the letter folder (covers A-Z, # and 0-9).
const ACTIVITY_RE = /^websites\/([^/]+)\/([^/]+)(?:\/(v\d+))?\//
const IMAGE_URL_RE = /https?:\/\/[^\s"'`)\]]+\.(?:png|jpe?g|gif|webp|svg|ico)(?:\?[^\s"'`)\]]*)?/gi

// GitHub caps comment bodies at 65536 characters.
const MAX_COMMENT_LENGTH = 65000

/**
 * Extract the activity folder key from a changed file path.
 * Example: websites/Y/YouTube/v2/presence.ts -> websites/Y/YouTube/v2
 */
export function activityKey(filename) {
  const match = filename.match(ACTIVITY_RE)
  if (!match)
    return null
  const [, letter, name, version] = match
  return version ? `websites/${letter}/${name}/${version}` : `websites/${letter}/${name}`
}

/**
 * Group changed files by activity folder, sorted for stable output.
 */
export function groupActivities(files) {
  const activities = new Map()
  for (const file of files) {
    const key = activityKey(file.filename)
    if (!key)
      continue
    if (!activities.has(key))
      activities.set(key, { folder: key, files: [] })
    activities.get(key).files.push(file)
  }
  return [...activities.values()].sort((a, b) => a.folder.localeCompare(b.folder))
}

/**
 * Classify an activity folder's change as creation, deletion or update.
 * Renamed files intentionally fall through to update to avoid spurious
 * creation+deletion pairs.
 */
export function classify(activity) {
  const metadata = activity.files.find(file => file.filename === `${activity.folder}/metadata.json`)
  if (metadata?.status === 'added')
    return 'creation'
  if (metadata?.status === 'removed' && activity.files.every(file => file.status === 'removed'))
    return 'deletion'
  return 'update'
}

/**
 * Extract image URLs from the added lines of a file's diff patch.
 */
export function imagesFromPatch(patch) {
  if (!patch)
    return []
  const urls = []
  for (const line of patch.split('\n')) {
    if (!line.startsWith('+') || line.startsWith('+++'))
      continue
    for (const match of line.matchAll(IMAGE_URL_RE))
      urls.push(match[0])
  }
  return urls
}

/**
 * Fallback display name derived from the folder path.
 * Example: websites/Y/YouTube/v2 -> YouTube v2
 */
export function displayName(folder) {
  const [, , name, version] = folder.split('/')
  return version ? `${name} ${version}` : name
}

/**
 * Render the sticky comment body for the collected activities.
 */
export function buildCommentBody(activities) {
  if (activities.length === 0)
    return `${COMMENT_MARKER}\nNo activity assets in this PR.`

  const sections = activities.map((activity) => {
    const lines = [`### ${activity.name} (\`${activity.folder}\`) — ${activity.type}`, '']

    if (activity.type === 'deletion') {
      lines.push('_Activity deleted in this PR._')
      return lines.join('\n')
    }

    if (activity.metadataError)
      lines.push('_⚠️ `metadata.json` could not be loaded — logo/thumbnail previews unavailable._', '')

    if (activity.assets.length === 0) {
      lines.push('_No asset URLs found in this change._')
      return lines.join('\n')
    }

    lines.push('| Preview | Source | URL |', '| --- | --- | --- |')
    for (const asset of activity.assets)
      lines.push(`| <img src="${asset.url}" width="${asset.width}"> | ${asset.source} | ${asset.url} |`)
    return lines.join('\n')
  })

  const header = `${COMMENT_MARKER}\n## 🖼️ Activity asset preview\n`
  const footer = '\n---\n<sub>Auto-generated — updates on each push.</sub>'

  let omitted = 0
  let body = [header, ...sections].join('\n')
  while (body.length + footer.length > MAX_COMMENT_LENGTH && sections.length > 0) {
    sections.pop()
    omitted++
    body = [header, ...sections, `_…and ${omitted} more ${omitted === 1 ? 'activity' : 'activities'} (comment size limit)._`].join('\n')
  }
  return body + footer
}

/**
 * Compute the desired set of managed labels for the collected activities.
 */
export function desiredLabels(activities) {
  const desired = new Set(activities.map(activity => `activity ${activity.type}`))
  if (activities.length > 1)
    desired.add('multiple activities')
  return desired
}

/**
 * Fetch logo/thumbnail (and service name) from metadata.json at the PR head.
 * Uses getContent instead of the diff patch — patches are truncated/omitted
 * for large files.
 */
async function fetchMetadataAssets(github, head, folder) {
  try {
    const { data } = await github.rest.repos.getContent({
      owner: head.repo.owner.login,
      repo: head.repo.name,
      path: `${folder}/metadata.json`,
      ref: head.sha,
    })
    const metadata = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'))
    const url = field => typeof metadata[field] === 'string' && /^https?:\/\//.test(metadata[field]) ? metadata[field] : null
    return {
      service: typeof metadata.service === 'string' ? metadata.service : null,
      logo: url('logo'),
      thumbnail: url('thumbnail'),
    }
  }
  catch {
    return { error: true }
  }
}

/**
 * Create or update the single sticky comment identified by COMMENT_MARKER.
 */
async function upsertComment(github, context, core, activities) {
  const comments = await github.paginate(github.rest.issues.listComments, {
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.payload.pull_request.number,
    per_page: 100,
  })
  const existing = comments.find(comment => comment.body?.includes(COMMENT_MARKER))

  if (activities.length === 0 && !existing) {
    core.info('No activities touched and no prior comment — skipping comment.')
    return
  }

  const body = buildCommentBody(activities)
  if (existing) {
    await github.rest.issues.updateComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: existing.id,
      body,
    })
    core.info(`Updated comment ${existing.id}`)
  }
  else {
    const { data: created } = await github.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.payload.pull_request.number,
      body,
    })
    core.info(`Created comment ${created.id}`)
  }
}

/**
 * Sync the managed activity labels — never touches any other label.
 */
async function syncLabels(github, context, core, activities) {
  const desired = desiredLabels(activities)
  const current = new Set(
    context.payload.pull_request.labels
      .map(label => label.name)
      .filter(name => MANAGED_LABELS.includes(name)),
  )

  const toAdd = MANAGED_LABELS.filter(label => desired.has(label) && !current.has(label))
  const toRemove = MANAGED_LABELS.filter(label => !desired.has(label) && current.has(label))

  if (toAdd.length > 0) {
    await github.rest.issues.addLabels({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.payload.pull_request.number,
      labels: toAdd,
    })
    core.info(`Added labels: ${toAdd.join(', ')}`)
  }

  for (const label of toRemove) {
    try {
      await github.rest.issues.removeLabel({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.payload.pull_request.number,
        name: label,
      })
      core.info(`Removed label: ${label}`)
    }
    catch (error) {
      // 404 — label was already removed (e.g. concurrent run); ignore.
      if (error.status !== 404)
        throw error
    }
  }
}

export default async function run({ github, context, core }) {
  const pullRequest = context.payload.pull_request
  const files = await github.paginate(github.rest.pulls.listFiles, {
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: pullRequest.number,
    per_page: 100,
  })
  core.info(`PR #${pullRequest.number}: ${files.length} changed file(s)`)

  const activities = []
  for (const group of groupActivities(files)) {
    const type = classify(group)
    const activity = {
      folder: group.folder,
      type,
      name: displayName(group.folder),
      assets: [],
      metadataError: false,
    }

    if (type !== 'deletion') {
      const seen = new Set()

      // head.repo is null when the fork was deleted — skip metadata, still label.
      if (pullRequest.head.repo) {
        const metadata = await fetchMetadataAssets(github, pullRequest.head, group.folder)
        if (metadata.error) {
          activity.metadataError = true
        }
        else {
          if (metadata.service) {
            const version = group.folder.split('/')[3]
            activity.name = version ? `${metadata.service} ${version}` : metadata.service
          }
          for (const [field, width] of [['logo', 64], ['thumbnail', 120]]) {
            const url = metadata[field]
            if (url && !seen.has(url)) {
              seen.add(url)
              activity.assets.push({ url, source: field, width })
            }
          }
        }
      }
      else {
        activity.metadataError = true
      }

      for (const file of group.files) {
        if (!file.filename.endsWith('.ts'))
          continue
        for (const url of imagesFromPatch(file.patch)) {
          if (seen.has(url))
            continue
          seen.add(url)
          activity.assets.push({
            url,
            source: `code (\`${file.filename.slice(group.folder.length + 1)}\`)`,
            width: 64,
          })
        }
      }
    }

    activities.push(activity)
  }

  core.info(`Activities: ${activities.map(activity => `${activity.folder} (${activity.type})`).join(', ') || 'none'}`)

  await upsertComment(github, context, core, activities)
  await syncLabels(github, context, core, activities)
}
