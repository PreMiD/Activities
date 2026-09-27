import type { MediaSample } from './media.js'
import { ActivityType, Assets, getTimestamps } from 'premid'
import { logoUrl } from './assets.js'
import { sampleVideo, validSample } from './media.js'
import { playerSelector, readPage } from './page.js'

const presence = new Presence({
  clientId: '1553525922097922148',
})

let player: HTMLIFrameElement | null = null
let playerKey = ''
let token = ''
let received: { sample: MediaSample, at: number } | null = null
let generation = 0
let pendingUpdate: Promise<void> | undefined
let updateRequested = false

function resetMedia() {
  token = `${Date.now()}-${++generation}-${Math.random().toString(36).slice(2)}`
  received = null
}

function syncPlayer() {
  const page = readPage(document)
  const next = page.kind === 'browse' ? null : document.querySelector<HTMLIFrameElement>(playerSelector)
  const nextKey = `${page.key}|${next?.getAttribute('src') || ''}`
  if (next !== player || nextKey !== playerKey) {
    player?.removeEventListener('load', resetMedia)
    player = next
    playerKey = nextKey
    player?.addEventListener('load', resetMedia)
    resetMedia()
  }
}

new MutationObserver(syncPlayer).observe(document.documentElement, {
  subtree: true,
  childList: true,
  attributes: true,
  attributeFilter: ['src', 'data-current-episode', 'data-current-type', 'data-title', 'class'],
})

presence.on('iFrameData', (data: unknown) => {
  syncPlayer()
  if (!data || typeof data !== 'object')
    return
  const message = data as { source?: string, token?: string, sample?: unknown }
  if (!player || message.source !== 'french-stream' || message.token !== token)
    return
  const previous = received?.sample
  received = validSample(message.sample) ? { sample: message.sample, at: Date.now() } : null
  const next = received?.sample
  // Publish transitions immediately, without creating a challenge/response loop
  // for the periodic time samples.
  if (Boolean(previous) !== Boolean(next) || previous?.paused !== next?.paused
    || previous?.ended !== next?.ended || previous?.playbackRate !== next?.playbackRate) {
    return requestUpdate()
  }
})

async function getStrings() {
  return presence.getStrings({
    playing: 'general.playing',
    paused: 'general.paused',
    browsing: 'general.browsing',
    search: 'general.search',
    viewMovie: 'general.buttonViewMovie',
    viewSeries: 'general.buttonViewSeries',
  })
}

let strings: Awaited<ReturnType<typeof getStrings>> | undefined
let previousLanguage = ''

async function updateActivity() {
  const [lang, browsing, covers, buttons] = await Promise.all([
    presence.getSetting<string>('lang').then(value => typeof value === 'string' && value.trim() ? value : 'fr').catch(() => 'fr'),
    presence.getSetting<boolean>('browsing').then(value => value !== false).catch(() => true),
    presence.getSetting<boolean>('covers').then(value => value !== false).catch(() => true),
    presence.getSetting<boolean>('buttons').then(value => value !== false).catch(() => true),
  ])
  if (!strings || previousLanguage !== lang) {
    strings = await getStrings().catch(() => ({
      playing: 'Lecture',
      paused: 'En pause',
      browsing: 'Navigation',
      search: 'Recherche',
      viewMovie: 'Voir le film',
      viewSeries: 'Voir la série',
    }))
    previousLanguage = lang
  }
  syncPlayer()
  const page = readPage(document)
  if (!page.valid || (page.kind === 'browse' && !browsing)) {
    received = null
    return presence.clearActivity()
  }
  const fr = lang.toLowerCase().startsWith('fr')
  const logo = logoUrl.includes('fs01.lol')
    ? new URL('/favicon-96x96.png', document.location.origin).href
    : logoUrl
  const activity: Omit<PresenceData, 'type' | 'largeImageText'> = {
    largeImageKey: covers && page.cover ? page.cover : logo,
  }
  if (page.kind === 'browse') {
    const sections: Record<string, string> = fr
      ? { home: 'Accueil', films: 'Films', series: 'Séries', category: 'Catégories', browse: 'French Stream', search: strings.search }
      : { home: 'Home', films: 'Movies', series: 'Series', category: 'Categories', browse: 'French Stream', search: strings.search }
    activity.details = strings.browsing
    activity.state = sections[page.section] || 'French Stream'
    return presence.setActivity(activity)
  }

  if (player?.getAttribute('src')) {
    try {
      const target = new URL(player.src)
      if (target.protocol === 'https:' || target.protocol === 'http:')
        player.contentWindow?.postMessage({ source: 'french-stream-request', token }, target.origin)
    }
    catch { received = null }
  }

  const direct = sampleVideo(document.querySelector<HTMLVideoElement>('#main-player video'))
  const media = direct || (received && Date.now() - received.at < 10000 ? received.sample : null)
  const playing = media && !media.ended
  activity.details = page.title.slice(0, 128)
  const episode = [page.season && `S${page.season}`, page.episode && `E${page.episode}`].filter(Boolean).join(' · ')
  const kind = page.kind === 'series' ? (fr ? 'Série' : 'Series') : (fr ? 'Film' : 'Movie')
  activity.state = [playing ? (media.paused ? strings.paused : strings.playing) : (fr ? 'Consulte' : 'Viewing'), kind, episode, page.language].filter(Boolean).join(' · ').slice(0, 128)
  if (playing) {
    activity.smallImageKey = media.paused ? Assets.Pause : Assets.Play
    activity.smallImageText = media.paused ? strings.paused : strings.playing
    if (!media.paused) {
      const [start, end] = getTimestamps(media.currentTime / media.playbackRate, media.duration / media.playbackRate)
      activity.startTimestamp = start
      activity.endTimestamp = end
    }
  }
  if (buttons)
    activity.buttons = [{ label: page.kind === 'series' ? strings.viewSeries : strings.viewMovie, url: page.url }]
  return presence.setActivity({ ...activity, type: playing ? ActivityType.Watching : ActivityType.Playing })
}

function requestUpdate(): Promise<void> {
  updateRequested = true
  if (!pendingUpdate) {
    // Serialize the entire async update, including setActivity: PreMiD keeps
    // mutable activity data while resolving images. Retain only the latest
    // media state when several transitions arrive during that operation.
    pendingUpdate = Promise.resolve().then(async () => {
      try {
        while (updateRequested) {
          updateRequested = false
          await updateActivity()
        }
      }
      finally {
        pendingUpdate = undefined
      }
    })
  }
  return pendingUpdate
}

presence.on('UpdateData', requestUpdate)
for (const event of ['play', 'playing', 'pause', 'seeked', 'ended', 'emptied', 'ratechange']) {
  document.addEventListener(event, (event) => {
    if (event.target instanceof HTMLVideoElement && event.target.matches('#main-player video'))
      void requestUpdate().catch(console.error)
  }, true)
}
