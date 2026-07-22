import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1142417275966738503',
})
const browsingTimestamp = Math.floor(Date.now() / 1_000)
const heartbeatAttribute = 'data-premid-extension-heartbeat'

enum ActivityAssets {
  Logo = 'https://i.imgur.com/RWdxBEH.png',
}

const supportedHosts = new Set([
  'heiwastream.fr',
  'www.heiwastream.fr',
  'zelyon.xyz',
  'www.zelyon.xyz',
])

function lireNombre(value: string | undefined): number | null {
  if (!value)
    return null
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

function lireUrlHeiwa(value: string | undefined): string | null {
  if (!value)
    return null

  try {
    const url = new URL(value)
    return url.protocol === 'https:' && supportedHosts.has(url.hostname) ? url.href : null
  }
  catch {
    return null
  }
}

function mettreAJourActivite(): void {
  // Le site utilise ce signal local pour ne plus proposer PreMiD lorsque
  // l'activité HeiwaStream est déjà réellement chargée par l'extension.
  document.documentElement.setAttribute(heartbeatAttribute, String(Date.now()))

  const data = document.documentElement.dataset
  const title = data.premidWatching

  if (!title) {
    const presenceData: PresenceData = {
      name: 'HeiwaStream',
      type: ActivityType.Playing,
      details: 'Parcourt HeiwaStream',
      state: data.premidPage ?? 'Accueil',
      largeImageKey: ActivityAssets.Logo,
      smallImageKey: Assets.Search,
      smallImageText: 'Navigation',
      startTimestamp: lireNombre(data.premidSince) ?? browsingTimestamp,
    }
    presence.setActivity(presenceData)
    return
  }

  const playbackState = data.premidState ?? 'playing'
  const position = lireNombre(data.premidPosition)
  const duration = lireNombre(data.premidDuration)
  const metadata = [data.premidEpisode, data.premidProvider, data.premidLanguage, data.premidQuality]
    .filter(Boolean)
    .join(' · ')
  const stateLabel = playbackState === 'paused'
    ? 'En pause'
    : playbackState === 'loading'
      ? 'Chargement'
      : 'En lecture'

  const presenceData: PresenceData = {
    name: 'HeiwaStream',
    type: ActivityType.Watching,
    details: title,
    state: metadata ? `${stateLabel} · ${metadata}`.slice(0, 128) : stateLabel,
    largeImageKey: data.premidPoster ?? ActivityAssets.Logo,
    largeImageText: 'HeiwaStream',
    smallImageKey: playbackState === 'paused' ? Assets.Pause : Assets.Play,
    smallImageText: stateLabel,
  }

  const mediaUrl = lireUrlHeiwa(data.premidMediaUrl)
  const pageUrl = lireUrlHeiwa(data.premidPageUrl)
  const contentType = data.premidContentType
  const isMovie = contentType === 'movie' || data.premidMediaType === 'movie'
  const detailsUrl = pageUrl ?? mediaUrl

  if (detailsUrl)
    presenceData.detailsUrl = detailsUrl

  if (isMovie && mediaUrl) {
    presenceData.buttons = [{ label: 'Watch Movie', url: mediaUrl }]
  }
  else if (data.premidEpisode && mediaUrl) {
    presenceData.buttons = [{ label: 'Watch Episode', url: mediaUrl }]
    if (pageUrl && pageUrl !== mediaUrl) {
      presenceData.buttons.push({
        label: contentType === 'anime' ? 'View Anime' : 'View Series',
        url: pageUrl,
      })
    }
  }

  if (playbackState === 'playing' && position !== null && duration !== null && duration > position) {
    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(position, duration)
  }

  presence.setActivity(presenceData)
}

let miseAJourPlanifiee = false

function planifierMiseAJour(): void {
  if (miseAJourPlanifiee)
    return

  miseAJourPlanifiee = true
  queueMicrotask(() => {
    miseAJourPlanifiee = false
    mettreAJourActivite()
  })
}

presence.on('UpdateData', mettreAJourActivite)

// Le lecteur est une modale React : l'URL ne change pas lorsqu'il s'ouvre.
// On observe donc directement le pont DOM afin que Discord reflète aussitôt
// le contenu, la lecture/pause et le timecode, sans attendre le cycle PreMiD.
new MutationObserver(planifierMiseAJour).observe(document.documentElement, {
  attributes: true,
  attributeFilter: [
    'data-premid-watching',
    'data-premid-episode',
    'data-premid-media-type',
    'data-premid-content-type',
    'data-premid-provider',
    'data-premid-language',
    'data-premid-quality',
    'data-premid-poster',
    'data-premid-media-url',
    'data-premid-position',
    'data-premid-duration',
    'data-premid-state',
    'data-premid-page',
    'data-premid-page-url',
    'data-premid-since',
  ],
})
