import type { CodestoState } from '../config/types.js'
import { ActivityType } from 'premid'
import { ActivityAssets, browsingTimestamp, codestoIcons } from '../config/constants.js'
import { buildButtons, smallImageFor } from '../util/activity.js'
import { clean, isVisible, queryText, textOf } from '../util/dom.js'

/** Returns the language icon for a file name, if it has one. */
export function codestoIcon(file: string | undefined): ActivityAssets | undefined {
  return codestoIcons[file?.split('.').pop()?.toLowerCase() ?? '']
}

/** Whether the current page is a Codesto project editor at `/codesto/p/<id>`. */
export function isCodestoWorkspace(): boolean {
  return /^\/codesto\/p\/[^/]+/i.test(document.location.pathname)
}

/** Removes a language badge such as "TS" or "JS" glued to the front of a file name. */
export function stripBadge(name: string): string {
  const extension = name.split('.').pop()?.toUpperCase() ?? ''
  const aliases: Record<string, string[]> = {
    MJS: ['JS'],
    CJS: ['JS'],
    JSX: ['JS'],
    TSX: ['TS'],
    YML: ['YAML'],
    YAML: ['YML'],
  }

  for (const badge of [extension, ...(aliases[extension] ?? [])]) {
    const rest = name.slice(badge.length)

    if (name.startsWith(badge) && /^[a-z_@-]/.test(rest)) {
      return rest
    }
  }

  return name
}

/** Finds a file name inside `element`, preferring a child that holds only the name. */
export function fileNameIn(element: Element): string | undefined {
  const pattern = /[\w@+.-]+\.[a-z][a-z0-9]{0,7}/i

  for (const child of Array.from(element.querySelectorAll('*'))) {
    const text = textOf(child)

    if (text && child.children.length === 0 && text.match(pattern)?.[0] === text) {
      return text
    }
  }

  const match = textOf(element)?.match(pattern)?.[0]

  return match ? stripBadge(match) : undefined
}

/** Finds the file name of the active editor tab. */
export function getCodestoFile(): string | undefined {
  const fileName = /[\w@+.-]+\.[a-z][a-z0-9]{0,7}/i
  const tabPath = document
    .querySelector('[role="tab"][aria-selected="true"]')
    ?.getAttribute('title')
  const tabName = tabPath?.split('/').pop()

  if (tabName && /\.[a-z][a-z0-9]{0,7}$/i.test(tabName)) {
    return tabName
  }

  const tabElement = document.querySelector(
    '#wsTabs [aria-selected="true"], #wsTabs .active, #wsTabs [class*="active"], [role="tab"][aria-selected="true"]',
  )
  const fromTab = tabElement ? fileNameIn(tabElement) : undefined

  if (fromTab) {
    return fromTab
  }

  const active = document.querySelectorAll(
    '[aria-selected="true"], [data-active="true"], [data-state="active"], [class*="active" i], [class*="selected" i], [class*="current" i]',
  )

  for (const element of Array.from(active)) {
    const text = textOf(element)

    if (!text || text.length > 60 || !isVisible(element)) {
      continue
    }

    const match = fileName.test(text) ? fileNameIn(element) : undefined

    if (match) {
      return match
    }
  }

  return undefined
}

/** Collects the project, active file and run state of the workspace. */
export function getCodestoState(): CodestoState {
  const title = clean(document.title)
    ?.replace(/\s*[—·-]\s*storm\s*$/i, '')
    .replace(/\s*[—·-]\s*codesto\s*$/i, '')

  return {
    project:
      textOf(document.querySelector('#wsName'))
      ?? queryText([
        '[data-project-name]',
        '[class*="project-name" i]',
        '[class*="projectName" i]',
      ])
      ?? (title && !/^(?:codesto|editor)$/i.test(title) ? title : undefined),
    file: getCodestoFile(),
    running:
      Boolean(document.querySelector('.cs-run-btn[aria-label="Stop"]'))
      || Array.from(document.querySelectorAll('button')).some(
        button =>
          /^(?:stop|running)\b/i.test(textOf(button) ?? '')
          && isVisible(button),
      ),
    url: document.location.href,
  }
}

/** Builds the presence shown while working in a Codesto project, like an editor. */
export function buildCodestoActivity(code: CodestoState, privacy: boolean): PresenceData {
  const icon = codestoIcon(code.file)
  const idle = !code.file && !code.running

  return {
    type: ActivityType.Playing,
    details: code.running
      ? privacy || !code.project ? 'Running a project' : `Running ${code.project}`
      : idle
        ? 'Idling'
        : `Editing ${privacy ? 'a file' : code.file ?? 'a file'}`,
    state: privacy || !code.project ? 'Codesto' : `Workspace: ${code.project}`,
    largeImageKey: idle ? ActivityAssets.Keyboard : icon ?? ActivityAssets.Logo,
    ...(idle
      ? { smallImageKey: ActivityAssets.Moon, smallImageText: 'Idling' }
      : smallImageFor(undefined, Boolean(icon))),
    startTimestamp: browsingTimestamp,
    buttons: privacy
      ? buildButtons()
      : buildButtons({ label: 'Open Project', url: code.url }),
  }
}
