import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1511505666664038460',
})
const NintendoMusicLogo = 'https://cdn.rcd.gg/PreMiD/websites/N/Nintendo%20Music/assets/logo.png'

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const title = document.title
  const audio = document.querySelector('audio')
  const mediaSession = navigator.mediaSession
  const isPlaying = mediaSession.playbackState === 'playing'
  const currentTime = audio?.currentTime ?? 0
  const duration = audio?.duration || 0 // NOTE: audio.duration is NaN before loadedmetadata fires
  const now = Math.floor(Date.now() / 1000)

  const albumArt = document.querySelector<HTMLImageElement>('#main-column img')?.src ?? NintendoMusicLogo

  const [showTimestamps, showSongArt] = await Promise.all([
    presence.getSetting<boolean>('showTimestamps'),
    presence.getSetting<boolean>('showSongArt'),
  ])

  const presenceData: PresenceData = {
    largeImageKey: NintendoMusicLogo,
    type: ActivityType.Listening,
  }

  if (isPlaying && mediaSession?.metadata) {
    const songArt = mediaSession.metadata.artwork?.[0]?.src ?? NintendoMusicLogo
    const songName = mediaSession.metadata.title ?? 'Unknown'
    const gameName = mediaSession.metadata.album ?? 'Nintendo'

    presenceData.details = songName
    presenceData.state = gameName
    presenceData.startTimestamp = now - Math.floor(currentTime)
    presenceData.endTimestamp = now + Math.floor(duration - currentTime)

    if (showSongArt) {
      presenceData.largeImageKey = songArt
    }
  }
  else if (pathname.includes('/search')) {
    presenceData.details = 'Searching...'
    presenceData.largeImageKey = NintendoMusicLogo
  }
  else if (pathname.includes('/game')) {
    const parts = title.replace(' - Nintendo Music', '').trim().split(/[・·]/)
    const gameName = parts[1]?.trim() ?? 'Nintendo'
    const mainTitle = document.querySelector('#main-column h1')?.textContent

    presenceData.details = `Browsing ${mainTitle}`
    presenceData.state = gameName
    presenceData.startTimestamp = now

    if (showSongArt) {
      presenceData.largeImageKey = albumArt
    }
  }
  else if (pathname.includes('/user-playlist')) {
    const parts = title.replace(' - Nintendo Music', '').trim().split(/[・·]/)
    const songName = parts[0]?.trim() ?? 'Unknown'

    presenceData.details = songName
    presenceData.state = 'Personal Playlist'
    presenceData.startTimestamp = now

    if (showSongArt) {
      presenceData.largeImageKey = albumArt
    }
  }
  else if (pathname.includes('/playlist')) {
    const parts = title.replace(' - Nintendo Music', '').trim().split(/[・·]/)
    const songName = parts[0]?.trim() ?? 'Unknown'

    presenceData.details = songName
    presenceData.state = 'Official Playlist'
    presenceData.startTimestamp = now

    if (showSongArt) {
      presenceData.largeImageKey = albumArt
    }
  }
  else if (pathname.includes('/my-music')) {
    const mainTitle = document.querySelector('#main-column h1')?.textContent

    presenceData.details = mainTitle
    presenceData.state = 'My Music'
    presenceData.startTimestamp = now
  }
  else {
    presenceData.details = 'Browsing Music...'
    presenceData.startTimestamp = now
  }

  if (!showTimestamps) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
