import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1142417275966738503',
})
const browsingTimestamp = Math.floor(Date.now() / 1_000)

enum ActivityAssets {
  Logo = 'https://zelyon.xyz/icon-512.png',
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

presence.on('UpdateData', async () => {
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

  if (data.premidMediaUrl) {
    try {
      const mediaUrl = new URL(data.premidMediaUrl)
      if (mediaUrl.protocol === 'https:' && supportedHosts.has(mediaUrl.hostname))
        presenceData.detailsUrl = mediaUrl.href
    }
    catch {
      // Une URL invalide est simplement ignorée.
    }
  }

  if (playbackState === 'playing' && position !== null && duration !== null && duration > position) {
    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(position, duration)
  }

  presence.setActivity(presenceData)
})
