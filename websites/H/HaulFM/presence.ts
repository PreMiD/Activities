import { ActivityType, StatusDisplayType } from 'premid'

const presence = new Presence({
  clientId: '1567264207593017354',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/H/HaulFM/assets/logo.png', // logo
  Play = 'https://cdn.rcd.gg/PreMiD/websites/H/HaulFM/assets/0.png', // play
  Pause = 'https://cdn.rcd.gg/PreMiD/websites/H/HaulFM/assets/1.png', // pause
}

const PAUSE_GRACE_MS = 3000
const LISTEN_URL = 'https://haul.fm/listen'

const PAGE_DETAILS: Record<string, string> = {
  '/about': 'Reading about haul.fm',
  '/account': 'Managing their account',
  '/api': 'Reading the API docs',
  '/chart': 'Checking the chart',
  '/contact': 'Contacting haul.fm',
  '/faq': 'Reading the FAQ',
  '/history': 'Browsing recently played tracks',
  '/listen': 'On the listen page',
  '/privacy': 'Reading the privacy policy',
  '/request': 'Requesting a song',
  '/schedule': 'Viewing the schedule',
  '/team': 'Meeting the team',
}

let startTimestamp: number | undefined
let lastPlayingAt = 0

/** Returns the trimmed text of the first element (by id) that has any text. */
function getText(...ids: string[]): string | undefined {
  for (const id of ids) {
    const text = document.getElementById(id)?.textContent?.trim()
    if (text)
      return text
  }
  return undefined
}

function detectPlaying(): boolean {
  const audio = document.querySelector<HTMLAudioElement>('audio')
  if (audio)
    return !audio.paused && !audio.ended

  return document.querySelector('[data-player="toggle"][data-state="playing"]') !== null
}

/** The mini player is on every page and exposes the cover as `cover|<hash>`. */
function getCoverUrl(): string | undefined {
  const art = document.getElementById('mini-art')?.dataset.art
  if (!art?.startsWith('cover|'))
    return undefined

  const hash = art.slice('cover|'.length)
  return hash ? `https://haul.fm/covers/${hash}-300.webp` : undefined
}

/** Name of the live presenter, or undefined while AutoDJ is on air. */
function getLivePresenter(): string | undefined {
  if (document.getElementById('who')?.dataset.status === 'auto')
    return undefined

  const name = getText('onair-name')
  return name?.toLowerCase() === 'autodj' ? undefined : name
}

function getPageDetails(): string {
  const path = document.location.pathname.replace(/\/+$/, '') || '/'
  return PAGE_DETAILS[path] ?? 'Browsing haul.fm'
}

presence.on('UpdateData', async () => {
  const [privacy, showCover, showButtons, showPresenter] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('presenter'),
  ])

  if (detectPlaying())
    lastPlayingAt = Date.now()

  const isPlaying = Date.now() - lastPlayingAt < PAUSE_GRACE_MS
  const buttons: PresenceData['buttons'] = showButtons && !privacy
    ? [{ label: 'Listen on haul.fm', url: LISTEN_URL }]
    : undefined

  if (!isPlaying) {
    startTimestamp = undefined

    presence.setActivity({
      largeImageKey: ActivityAssets.Logo,
      details: privacy ? 'Browsing haul.fm' : getPageDetails(),
      smallImageKey: ActivityAssets.Pause,
      smallImageText: 'Paused',
      buttons,
    })
    return
  }

  startTimestamp ??= Math.floor(Date.now() / 1000)

  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'haul.fm',
    smallImageKey: ActivityAssets.Play,
    smallImageText: 'Playing',
    startTimestamp,
    buttons,
  }

  if (privacy) {
    presenceData.details = 'Listening to haul.fm'
  }
  else {
    const trackName = getText('mini-title', 'title')
    const artistName = getText('mini-artist', 'artist')
    const presenter = showPresenter ? getLivePresenter() : undefined
    const coverUrl = showCover ? getCoverUrl() : undefined

    presenceData.details = trackName ?? 'Listening to haul.fm'
    presenceData.state = trackName ? artistName : undefined
    presenceData.statusDisplayType = StatusDisplayType.Details

    if (presenter)
      presenceData.largeImageText = `Live with ${presenter}`
    if (coverUrl)
      presenceData.largeImageKey = coverUrl
  }

  presence.setActivity(presenceData)
})
