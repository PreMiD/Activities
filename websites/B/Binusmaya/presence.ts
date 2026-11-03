import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1560317220737777775',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/B/Binusmaya/assets/0.png',
}

/**
 * Per-section timer: it keeps counting while you move between pages of the
 * same section (e.g. forum list -> forum thread) and restarts when you switch
 * to another section (e.g. forum -> course).
 *
 * It is also saved in sessionStorage (prefixed with PMD_ as the guidelines
 * require), so a full page reload inside the same section does not reset it.
 */
const STORAGE_KEY = 'PMD_BinusLMS_sectionTimer'

let currentSection: string | null = null
let sectionTimestamp = Math.floor(Date.now() / 1000)

try {
  const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null') as { section: string, timestamp: number } | null
  if (saved && typeof saved.section === 'string' && typeof saved.timestamp === 'number') {
    currentSection = saved.section
    sectionTimestamp = saved.timestamp
  }
}
catch {}

function getSectionTimestamp(section: string): number {
  if (section !== currentSection) {
    currentSection = section
    sectionTimestamp = Math.floor(Date.now() / 1000)
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ section, timestamp: sectionTimestamp }))
    }
    catch {}
  }
  return sectionTimestamp
}

/**
 * Returns the trimmed text of the first element matching `selector`,
 * or `fallback` if the element is missing or empty.
 */
function getText(selector: string, fallback: string): string {
  return document.querySelector(selector)?.textContent?.trim() || fallback
}

presence.on('UpdateData', async () => {
  const [privacy, showTimestamp, showButtons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('buttons'),
  ])

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  // "/lms/course/123/" -> ["lms", "course", "123"]
  const segments = document.location.pathname
    .toLowerCase()
    .split('/')
    .filter(Boolean)
  const [root, section] = segments
  // True when there is something after the section, e.g. /lms/course/<id>
  const isDetailPage = segments.length > 2

  let buttonLabel: string | undefined

  if (segments.length === 0) {
    presenceData.details = 'Playing Binusmaya'
    presenceData.state = 'On the home page'
  }
  else if (root !== 'lms') {
    presence.clearActivity()
    return
  }
  else {
    switch (section) {
      case 'dashboard': {
        presenceData.details = 'Playing Binusmaya'
        presenceData.state = 'Checking the dashboard'
        break
      }
      case 'course': {
        if (isDetailPage) {
          presenceData.details = 'Studying'
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = 'Studying'
          presenceData.state = privacy
            ? 'A course'
            // TODO: verify selector for the course name on a course page
            : getText('[data-testid="course-title"], .course-header h1, main h1', 'A course')
          buttonLabel = 'View Course'
        }
        else {
          presenceData.details = 'Browsing courses'
          presenceData.state = 'Picking a course'
          presenceData.smallImageKey = Assets.Search
          presenceData.smallImageText = 'Browsing'
        }
        break
      }
      case 'forum': {
        presenceData.details = 'Reading forum'
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = 'Reading'

        if (isDetailPage) {
          presenceData.state = privacy
            ? 'A discussion thread'
            // TODO: verify selector for the forum thread title
            : getText('[data-testid="thread-title"], .forum-thread-title, main h1', 'A discussion thread')
          buttonLabel = 'View Thread'
        }
        else {
          presenceData.state = 'Browsing discussions'
        }

        // TODO: verify selector for the forum reply/post editor
        const editor = document.querySelector<HTMLElement>('.ql-editor, [contenteditable="true"], textarea')
        if (editor === document.activeElement || editor?.contains(document.activeElement)) {
          presenceData.details = 'Writing in forum'
          presenceData.smallImageKey = Assets.Writing
          presenceData.smallImageText = 'Writing'
        }
        break
      }
      case 'assessment': {
        presenceData.details = 'Reading assignment'
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = 'Reading'
        presenceData.state = privacy
          ? 'An assessment'
          // TODO: verify selector for the assignment / quiz / exam title
          : getText('[data-testid="assessment-title"], .assessment-title, main h1', 'An assessment')
        if (isDetailPage)
          buttonLabel = 'View Assignment'
        break
      }
      case 'attendance': {
        presenceData.details = 'Checking attendance'
        break
      }
      case 'gradebook': {
        // Grades are never read from the page, regardless of privacy mode
        presenceData.details = 'Checking grades'
        presenceData.state = 'Viewing the gradebook'
        break
      }
      case 'announcement': {
        presenceData.details = 'Reading announcements'
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = 'Reading'

        if (isDetailPage) {
          presenceData.state = privacy
            ? 'An announcement'
            // TODO: verify selector for the announcement title
            : getText('[data-testid="announcement-title"], .announcement-title, main h1', 'An announcement')
          buttonLabel = 'View Announcement'
        }
        else {
          presenceData.state = 'Browsing announcements'
        }
        break
      }
      case 'schedule': {
        presenceData.details = 'Checking class schedule'
        break
      }
      default: {
        presence.clearActivity()
        return
      }
    }
  }

  // "home" for the home page, otherwise the section name ("forum", "course", ...)
  const startTimestamp = getSectionTimestamp(section ?? 'home')

  if (showTimestamp)
    presenceData.startTimestamp = startTimestamp

  // Buttons are never shown in privacy mode, even if the hidden setting is still on
  if (showButtons && !privacy && buttonLabel) {
    presenceData.buttons = [
      {
        label: buttonLabel,
        url: document.location.href,
      },
    ]
  }

  presence.setActivity(presenceData)
})
