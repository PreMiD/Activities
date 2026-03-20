import { Assets, ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1483241564619669546',
})

const LOGO = 'https://i.imgur.com/D2pn7EL.png'

function findEpisode() {
  const el = document.querySelector(
    '[data-vc-element="top-playback-info-episode"] p.font-bold'
  )
  return el ? el.textContent.trim() : null
}

function findEpisodeTitle() {
  const el = document.querySelector(
    '[data-vc-element="top-playback-info-episode"] p:not(.font-bold)'
  )
  return el ? el.textContent.trim() : null
}

function findChapter() {
  const nodes = document.querySelectorAll('div, span')
  for (const n of nodes) {
    const text = n.textContent ? n.textContent.trim() : ''
    if (text && /^chapter\s*\d+/i.test(text)) return text
  }
  return null
}

function findPageCounter() {
  const nodes = document.querySelectorAll('div, span')
  for (const n of nodes) {
    const text = n.textContent ? n.textContent.trim() : ''
    if (text && /^\d+\s*\/\s*\d+$/.test(text)) return text
  }
  return null
}

presence.on('UpdateData', async () => {
  const path = window.location.pathname
  const rawTitle = document.title.replace(' | Seanime', '')

  // Home / browsing
  if (!path || path === '/' || path.length <= 1) {
    presence.setActivity({
      type: ActivityType.Playing,
      details: 'Browsing Library',
      state: 'Looking for something to watch',
      largeImageKey: LOGO,
    })
    return
  }

  // Manga reading
  if (path.includes('/manga/entry')) {
    const chapter = findChapter()
    const page = findPageCounter()

    presence.setActivity({
      type: ActivityType.Watching,
      name: 'Reading Manga',
      details: rawTitle,
      state: [chapter, page].filter(Boolean).join(' • '),
      largeImageKey: LOGO,
    })
    return
  }

  const video = document.querySelector('video')

  // Watching anime
  if (video) {
    const episode = findEpisode()
    const episodeTitle = findEpisodeTitle()

    const cleanTitle =
      document
        .querySelector('[data-vc-element="top-playback-info-title"]')
        ?.textContent?.trim() || rawTitle

    const epNumber = episode ? episode.match(/\d+/) : null
    const epShort = epNumber ? `Ep ${epNumber[0]}` : null

    const current = Math.floor(video.currentTime || 0)
    const total = Math.floor(video.duration || 0)

    const startTimestamp = Math.floor(Date.now() / 1000) - current
    const endTimestamp = startTimestamp + total

    const paused = video.paused

    presence.setActivity({
      type: ActivityType.Watching,
      name: 'Anime',
      details: cleanTitle,
      state: paused
        ? `Paused • ${epShort || ''}\n${episodeTitle || ''}`.trim()
        : `${epShort || ''}\n${episodeTitle || ''}`.trim(),
      largeImageKey: LOGO,
      startTimestamp: paused ? undefined : startTimestamp,
      endTimestamp: paused ? undefined : endTimestamp,
      smallImageKey: paused ? Assets.Pause : Assets.Play,
      smallImageText: paused ? 'Paused' : 'Playing',
    })

    return
  }

  // Fallback
  presence.setActivity({
    type: ActivityType.Playing,
    details: rawTitle,
    state: 'Browsing',
    largeImageKey: LOGO,
  })
})
