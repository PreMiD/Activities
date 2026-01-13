/// <reference path="../../../@types/premid/index.d.ts" />

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

  return document
    .querySelector<HTMLMetaElement>('meta[property="og:title"]')
    ?.content
    ?.trim()
}

function getProgressText() {
  // 進捗バー本体。aria-label が無い場合もあるので、role だけで拾って中身から判定する
  const progressBar = document.querySelector('[role="progressbar"]') as HTMLElement | null
  if (!progressBar)
    return null

  const valueNow = progressBar.getAttribute('aria-valuenow')
  if (valueNow)
    return `進捗度${valueNow}%`

  const ariaLabel = progressBar.getAttribute('aria-label') || ''
  const text = progressBar.textContent || ''
  const combined = `${ariaLabel} ${text}`.replace(/\s+/g, ' ').trim()

  // 「進捗度xx%」の部分だけを抜き出して返す
  const match = combined.match(/進捗度\s*\d+%/)
  if (!match)
    return null

  return match[0]
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
    const lessonTitle = getPageTitle() || document.querySelector('h1')?.textContent || 'A lesson'
    const video = document.querySelector<HTMLVideoElement>('#video-player')
    const isPlaying = video && !video.paused && !video.ended && video.currentTime > 0
    const progressText = getProgressText()

    presenceData.details = isPlaying ? 'Watching a lesson' : 'Lesson paused'
    if (privacyMode) {
      presenceData.state = progressText ? `Learning（${progressText}）` : 'Learning'
    }
    else {
      presenceData.state = progressText ? `${lessonTitle}（${progressText}）` : lessonTitle
    }
  }
  // Viewing a course
  else if (pathname.startsWith('/courses/')) {
    // 評価レポートページ（例: /courses/.../evaluation_report/...）では進捗バーを優先して表示
    if (url.includes('/evaluation_report/')) {
      const progressText = getProgressText()
      presenceData.details = 'Viewing report'
      presenceData.state = progressText ? `集中モード（${progressText}）` : '集中モード'
    }
    else {
      // Try to get course/subject title from various selectors
      const courseTitle = getPageTitle()
        || document.querySelector('h1')?.textContent
        || document.querySelector('[class*="title"]')?.textContent
        || document.querySelector('[class*="course"]')?.textContent
        || 'A course'

      presenceData.details = 'Studying'
      presenceData.state = privacyMode ? 'A course' : courseTitle.trim()
    }
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

  // どのページでも進捗バーがあれば state に進捗度を付け足す
  if (!privacyMode) {
    const globalProgressText = getProgressText()
    if (globalProgressText && !(presenceData.state && presenceData.state.includes('進捗度')))
      presenceData.state = presenceData.state ? `${presenceData.state}（${globalProgressText}）` : globalProgressText

    presence.setActivity(presenceData)
  }
  else {
    presenceData.details = 'Learning on ZEN Study'
    presenceData.state = undefined
    presence.setActivity(presenceData)
  }
})
