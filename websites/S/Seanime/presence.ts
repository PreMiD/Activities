import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1483241564619669546',
})

const LOGO = 'https://i.imgur.com/D2pn7EL.png'

// ICON URLS (use direct + cache safe)
const PLAY_ICON = 'https://i.imgur.com/Fi1hHy2.png'
const PAUSE_ICON = 'https://i.imgur.com/OnySmVp.png'

// =========================
// HELPERS
// =========================
function findEpisode(): string | null {
  const el = document.querySelector(
    '[data-vc-element="top-playback-info-episode"] p.font-bold',
  )
  return el?.textContent?.trim() || null
}

function findEpisodeTitle(): string | null {
  const el = document.querySelector(
    '[data-vc-element="top-playback-info-episode"] p:not(.font-bold)',
  )
  return el?.textContent?.trim() || null
}

function findChapter(): string | null {
  const nodes = document.querySelectorAll('div, span')

  for (const n of nodes) {
    const text = n.textContent?.trim()

    if (text && /^chapter\s*\d+/i.test(text)) {
      return text
    }
  }

  return null
}

function findPageCounter(): string | null {
  const nodes = document.querySelectorAll('div, span')

  for (const n of nodes) {
    const text = n.textContent?.trim()

    if (text && /^\d+\s*\/\s*\d+$/.test(text)) {
      return text
    }
  }

  return null
}

// =========================
// MAIN
// =========================
presence.on('UpdateData', async () => {
  const path = window.location.pathname
  const rawTitle = document.title.replace(' | Seanime', '')

  // =========================
  // 🏠 HOME
  // =========================
  if (path === '/' || path === '') {
    presence.setActivity({
      type: ActivityType.Playing,
      details: 'Browsing Library',
      state: 'Looking for something to watch',
      largeImageKey: LOGO,
    })
    return
  }

  // =========================
  // 📖 MANGA
  // =========================
  if (path.includes('/manga/entry')) {
    const chapter = findChapter()
    const page = findPageCounter()

    presence.setActivity({
      type: ActivityType.Playing,
      name: 'Reading Manga',
      details: rawTitle,
      state: [chapter, page].filter(Boolean).join(' • '),
      largeImageKey: LOGO,
    })
    return
  }

  // =========================
  // 🎬 ANIME
  // =========================
  const video = document.querySelector<HTMLVideoElement>('video')

  if (video) {
    const episode = findEpisode()
    const episodeTitle = findEpisodeTitle()

    const cleanTitle =
      document
        .querySelector('[data-vc-element="top-playback-info-title"]')
        ?.textContent?.trim()
      || rawTitle

    const epNumber = episode?.match(/\d+/)?.[0]
    const epShort = epNumber ? `Ep ${epNumber}` : null

    const mainLine = epShort
    const subLine = episodeTitle

    const current = Math.floor(video.currentTime)
    const total = Math.floor(video.duration || 0)

    const startTimestamp = Math.floor(Date.now() / 1000) - current
    const endTimestamp = startTimestamp + total

    const paused = video.paused

    presence.setActivity({
      type: ActivityType.Watching,
      name: 'Anime',
      details: cleanTitle,
      state: paused
        ? `Paused • ${mainLine}\n${subLine ?? ''}`.trim()
        : `${mainLine}\n${subLine ?? ''}`.trim(),
      largeImageKey: LOGO,
      startTimestamp: paused ? undefined : startTimestamp,
      endTimestamp: paused ? undefined : endTimestamp,
      smallImageKey: paused ? PAUSE_ICON : PLAY_ICON,
      smallImageText: paused ? 'Paused' : 'Playing',
    })
  }
})
