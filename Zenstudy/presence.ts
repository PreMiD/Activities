import { Assets } from 'premid'

const presence: Presence = new Presence({
  clientId: '1434188318760767568',
})
const startTimestamp: number = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings({
    browsing: 'general.browsing',
    reading: 'general.reading',
    viewing: 'general.viewing',
  })
}

enum ActivityAssets {
  Logo = 'https://i.imgur.com/8g7M0MY.png',
}

let strings: Awaited<ReturnType<typeof getStrings>>

function getPageTitle() {
  const rawTitle = document.title?.trim()
  if (rawTitle) {
    // 末尾の「- ZEN Study」を削る
    return rawTitle.replace(/\s*-\s*ZEN Study\s*$/i, '')
  }

  const meta = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null
  return meta?.content?.trim()
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp,
  }

  const privacyMode = await presence.getSetting<boolean>('privacyMode')
  strings = await getStrings()

  const pathname = document.location.pathname
  const url = document.location.href

  // Home page
  if (pathname === '/home' || pathname === '/') {
    const pageTitle = getPageTitle()
    presenceData.details = pageTitle || 'Browsing courses'
    presenceData.state = pageTitle ? 'ZEN Study' : 'On the home page'
  }
  // Viewing a lesson
  else if (pathname.startsWith('/lessons/')) {
    const lessonTitle =
      getPageTitle()
      || document.querySelector('h1')?.textContent
      || 'A lesson'
    const video = document.querySelector<HTMLVideoElement>('#video-player')
    const isPlaying = video && !video.paused && !video.ended && video.currentTime > 0

    presenceData.details = isPlaying ? 'Watching a lesson' : 'Lesson paused'
    presenceData.state = privacyMode ? 'Learning' : lessonTitle
  }
  // Viewing a course
  else if (pathname.startsWith('/courses/')) {
    // Try to get course/subject title from various selectors
    const courseTitle =
      getPageTitle()
      || document.querySelector('h1')?.textContent ||
      document.querySelector('[class*="title"]')?.textContent ||
      document.querySelector('[class*="course"]')?.textContent ||
      'A course'
    
    presenceData.details = 'Studying'
    presenceData.state = privacyMode ? 'A course' : courseTitle.trim()
  }
  // Viewing a genre
  else if (pathname.startsWith('/genres/')) {
    const genreTitle = getPageTitle() || document.querySelector('h1')?.textContent || 'A genre'
    presenceData.details = 'Browsing genre'
    presenceData.state = privacyMode ? 'Learning' : genreTitle
  }
  // My courses
  else if (pathname.includes('/my_course')) {
    presenceData.details = 'Viewing'
    presenceData.state = 'My courses'
  }
  // Forum / Questions
  else if (pathname.includes('/questions')) {
    presenceData.details = 'Reading'
    presenceData.state = 'The forum'
  }
  // Default
  else {
    presenceData.details = strings.browsing
    presenceData.state = 'ZEN Study'
  }

  if (!privacyMode) {
    presence.setActivity(presenceData)
  } else {
    presenceData.details = 'Learning on ZEN Study'
    presenceData.state = undefined
    presence.setActivity(presenceData)
  }
})
