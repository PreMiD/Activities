import { ActivityType, Assets } from 'premid'

interface ButtonData {
  label: string
  url: string
}

// Initialize presence client
const PRESENCE = new Presence({ clientId: '1343650415555776563' })
const STRINGS = PRESENCE.getStrings({ play: 'general.playing', pause: 'general.paused' })

// Route definitions
const ROUTES = {
  SEARCH: /\/courses\/search/,
  LESSON: /\/courses\/[^/]+\/[^/]+\/[^/]+$/,
  COURSE: /\/courses\//,
  CERTIFICATION: /\/certifications\//,
  COURSES_LIST: /\/courses$/,
  CERTS_LIST: /\/certifications$/,
  DASHBOARD: /^\/dashboard/,
}

// Cache DOM queries for performance
let _difficultyObserver: MutationObserver | null = null
let _cachedTimestamp = Math.floor(Date.now() / 1000)

/**
 * Tracks difficulty filter changes
 */
function trackDifficultyChanges(): void {
  if (_difficultyObserver) {
    _difficultyObserver.disconnect()
  }

  const trigger = document.querySelector('button[data-melt-select-trigger]')
  if (!trigger)
    return

  _difficultyObserver = new MutationObserver(() => {
    _cachedTimestamp = Math.floor(Date.now() / 1000)
    PRESENCE.setActivity({
      startTimestamp: _cachedTimestamp,
    })
  })

  _difficultyObserver.observe(trigger, {
    childList: true,
    characterData: true,
    subtree: true,
  })
}

/**
 * Formats title text with proper capitalization
 */
function formatText(text: string): string {
  if (!text)
    return 'Unknown'
  return text.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

/**
 * Builds presence data for lesson pages
 */
async function buildLessonPresence(): Promise<PresenceData> {
  const pathParts = document.location.pathname.split('/')
  const lessonTitle = formatText(pathParts.pop() || '')

  // Updated course link selector to match the exact structure
  const courseLink = document.querySelector('a.text-base.font-medium.text-gray-900')
  const courseName = courseLink?.textContent?.trim() || 'Unknown'
  const courseUrl = courseLink?.getAttribute('href') || ''
  const fullCourseUrl = courseUrl ? new URL(courseUrl, document.location.origin).href : ''

  // Media state detection
  const media = document.querySelector('media-controller')
  const video = document.querySelector('hls-video')

  let isPaused = true
  if (media && media.hasAttribute('mediapaused')) {
    isPaused = true
  }
  else if (media) {
    isPaused = false
  }

  let currentTime = 0
  if (media && media.getAttribute('mediacurrenttime')) {
    currentTime = Number(media.getAttribute('mediacurrenttime'))
  }

  let duration = 0
  if (media && media.getAttribute('mediaduration')) {
    duration = Number(media.getAttribute('mediaduration'))
  }

  const presence: PresenceData = {
    type: ActivityType.Watching,
    details: lessonTitle,
    state: courseName,
    startTimestamp: _cachedTimestamp,
    buttons: [
      { label: 'View Lesson', url: document.location.href },
    ],
  }

  // Only add course button if we have a valid URL
  if (fullCourseUrl) {
    const courseButton: ButtonData = { label: 'View Course', url: fullCourseUrl }
    presence.buttons = presence.buttons ? [presence.buttons[0], courseButton] : [courseButton]
  }

  if (video) {
    presence.smallImageKey = isPaused ? Assets.Pause : Assets.Play
    const strings = await STRINGS
    presence.smallImageText = isPaused ? strings.pause : strings.play

    if (!isPaused && duration > 0) {
      const startTime = Math.floor(Date.now() / 1000 - currentTime)
      presence.startTimestamp = startTime
      presence.endTimestamp = startTime + Math.floor(duration)
    }
  }
  else {
    presence.smallImageKey = Assets.Play
    presence.smallImageText = 'Learning'
  }

  return presence
}

/**
 * Main handler for presence updates
 */
PRESENCE.on('UpdateData', async () => {
  const path = document.location.pathname
  let presence: PresenceData = { startTimestamp: _cachedTimestamp }

  // Pattern matching for different pages
  switch (true) {
    case ROUTES.SEARCH.test(path): {
      const params = new URLSearchParams(document.location.search)
      let query = 'Something'

      if (params.has('q')) {
        const paramQuery = params.get('q')
        if (paramQuery) {
          query = paramQuery.replace(/\+/g, ' ')
        }
      }

      presence = {
        ...presence,
        details: 'Searching for:',
        state: query,
        smallImageKey: Assets.Search,
      }
      break
    }

    case ROUTES.LESSON.test(path):
      presence = await buildLessonPresence()
      break

    case ROUTES.COURSE.test(path) && !document.querySelector('video'): {
      const courseTitle = document.querySelector('h2.font-satoshi.text-3xl')?.textContent || 'Unknown Course'
      presence = {
        ...presence,
        type: ActivityType.Watching,
        details: 'Browsing course:',
        state: courseTitle,
        smallImageKey: Assets.Search,
        buttons: [{ label: 'View Course', url: document.location.href }],
      }
      break
    }

    case ROUTES.CERTIFICATION.test(path): {
      const certTitle = document.querySelector('h2.font-satoshi.text-3xl')?.textContent || 'Unknown Certification'
      presence = {
        ...presence,
        type: ActivityType.Watching,
        details: 'Browsing certifications:',
        state: certTitle,
        smallImageKey: Assets.Search,
        buttons: [{ label: 'View Certification', url: document.location.href }],
      }
      break
    }

    case ROUTES.COURSES_LIST.test(path): {
      const filterElement = document.querySelector('button[data-melt-select-trigger]')
      let filter = ''

      if (filterElement && filterElement.textContent) {
        const textParts = filterElement.textContent.trim().split(' ')
        if (textParts.length > 0) {
          filter = textParts[0] ?? ''
        }
      }

      presence = {
        ...presence,
        type: ActivityType.Watching,
        details: 'Browsing Courses',
        state: filter ? `${filter} Courses` : 'All Courses',
      }
      trackDifficultyChanges()
      break
    }

    case ROUTES.CERTS_LIST.test(path):
      presence = {
        ...presence,
        type: ActivityType.Watching,
        details: 'Browsing Updraft',
        state: 'Certifications',
      }
      trackDifficultyChanges()
      break

    case ROUTES.DASHBOARD.test(path):
      presence = {
        ...presence,
        type: ActivityType.Watching,
        details: 'Browsing Updraft:',
        state: 'Dashboard',
      }
      break

    default:
      presence = {
        ...presence,
        type: ActivityType.Watching,
        details: 'Viewing a page:',
        state: 'Dashboard',
      }
  }

  PRESENCE.setActivity(presence)
})
