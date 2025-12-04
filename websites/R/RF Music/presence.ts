import { getTimestamps, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '1346614173517221940',
})

const cleanText = (value?: string | null) => value?.replace(/\s+/g, ' ').trim() || ''
const defaultLanguage = 'en'

async function getStrings() {
  return presence.getStrings({ paused: 'general.paused' })
}

let cachedStrings: Awaited<ReturnType<typeof getStrings>> | null = null
let cachedLanguage: string | null = null

presence.on('UpdateData', async () => {
  if (!document.location.pathname.includes('/')) {
    presence.setActivity()
    return
  }

  const language = await presence.getSetting<string>('lang').catch(() => defaultLanguage)

  if (!cachedStrings || language !== cachedLanguage) {
    cachedStrings = await getStrings()
    cachedLanguage = language
  }

  const [showAlbumArt, artistAsTitle, showButtons] = await Promise.all([
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('artistAsTitle'),
    presence.getSetting<boolean>('buttons'),
  ])

  const titleElement = document.querySelector('.track-text-details h2')
  const artistElement = document.querySelector('.track-text-details p')
  const albumArtImgElement = document.querySelector('.now-playing-center .album-art')
    || document.querySelector('.mobile-now-playing-glass-container .album-art')
  const playingIndicator = document.querySelector('.player-control-button.play-pause-main[title="Pause"]')
  const currentTimeDisplayElement = document.querySelector('.progress-bar-wrapper .current-time')
  const durationDisplayElement = document.querySelector('.progress-bar-wrapper .duration-time')

  const title = cleanText(titleElement?.textContent)
  const artist = cleanText(artistElement?.textContent)
  const albumArtSrc = albumArtImgElement ? albumArtImgElement.getAttribute('src') : null

  const trackTitle = title && title !== 'Nothing Playing' ? title : undefined
  const trackArtist = artist || undefined
  const trackAlbumArt = showAlbumArt && albumArtSrc && !albumArtSrc.includes('placehold.co') ? albumArtSrc : undefined
  const presenceName = artistAsTitle && trackArtist ? trackArtist.substring(0, 128) : 'RF Music'
  const trackId =
    document.querySelector<HTMLElement>('[data-track-id]')?.dataset.trackId
    || document.querySelector<HTMLElement>('[data-trackid]')?.dataset.trackid
    || (() => {
      try {
        const lastPlay = JSON.parse(localStorage.getItem('rfmusic.lastplay.v1') ?? 'null')
        return lastPlay?.currentTrack?.id || lastPlay?.currentTrack?.trackId || null
      }
      catch {
        return null
      }
    })()
  const trackUrl = trackId ? `https://music.rfproductions.org/track/${encodeURIComponent(trackId)}` : 'https://music.rfproductions.org'
  const buttons: [ButtonData, ButtonData?] | undefined = showButtons
    ? [
        { label: '\u{1F3B5} Play on RF Music', url: trackUrl },
      ]
    : undefined

  const isPlaying = !!(playingIndicator && trackTitle)
  const currentTime = timestampFromFormat(currentTimeDisplayElement?.textContent ?? '')
  const duration = timestampFromFormat(durationDisplayElement?.textContent ?? '')

  if (isPlaying && trackTitle) {
    const activityData: PresenceData = {
      type: 2,
      name: presenceName,
      details: trackTitle.substring(0, 128),
      ...(trackArtist ? { state: trackArtist.substring(0, 128) } : {}),
      ...(buttons ? { buttons } : {}),
      largeImageKey: trackAlbumArt || 'rf_white',
    }

    if (duration > 0 && currentTime >= 0) {
      const [startTimestamp, endTimestamp] = getTimestamps(currentTime, duration)
      activityData.startTimestamp = startTimestamp
      activityData.endTimestamp = endTimestamp
    }

    presence.setActivity(activityData)
    return
  }

  if (trackTitle) {
    const pausedPresence: PresenceData = {
      type: 2,
      name: presenceName,
      details: trackTitle.substring(0, 128),
      state: trackArtist
        ? trackArtist.substring(0, 128)
        : (cachedStrings?.paused || 'Paused'),
      ...(buttons ? { buttons } : {}),
      largeImageKey: trackAlbumArt || 'rf_white',
    }
    presence.setActivity(pausedPresence)
    return
  }

  presence.setActivity()
})
