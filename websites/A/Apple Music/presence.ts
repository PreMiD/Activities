import { ActivityType, Assets, getTimestamps, StatusDisplayType } from 'premid'

interface Attributes {
  albumName: string
  artistName: string
  artwork: {
    height: number
    url: string
    width: number
  }
  durationInMillis: number
  name: string
  url?: string
}

interface AudioPlayer {
  nowPlayingItem: {
    attributes: Attributes
  }
  currentPlaybackProgress: number
  isPlaying: boolean
}

const presence = new Presence({
  clientId: '842112189618978897',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})

function clearActivity() {
  if (+presence.getExtensionVersion() < 224) {
    presence.setActivity()
  }
  else {
    presence.clearActivity()
  }
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/Apple%20Music/assets/logo.png',
  } as PresenceData
  const [hidePaused, displayType, timestamps, cover, playback, buttons, listening] = await Promise.all([
    presence.getSetting<boolean>('hidePaused'),
    presence.getSetting<number>('displayType'),
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('playback'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('listening'),
  ])

  let data

  const audio = document.querySelector<HTMLAudioElement>(
    'audio#apple-music-player',
  )
  const video = document
    .querySelector('apple-music-video-player')
    ?.shadowRoot
    ?.querySelector(
      'amp-window-takeover > .container > amp-video-player-internal',
    )
    ?.shadowRoot
    ?.querySelector('amp-video-player')
    ?.shadowRoot
    ?.querySelector('div#video-container')
    ?.querySelector<HTMLVideoElement>('video#apple-music-video-player')

  const audioPlayer = await presence.getPageVariable('audioPlayer.nowPlayingItem.attributes', 'audioPlayer.isPlaying', 'audioPlayer.currentPlaybackProgress').then((res) => {
    return {
      nowPlayingItem: {
        attributes: res['audioPlayer.nowPlayingItem.attributes'],
      },
      isPlaying: res['audioPlayer.isPlaying'],
      currentPlaybackProgress: res['audioPlayer.currentPlaybackProgress'],
    }
  }).catch(() => null) as AudioPlayer | null

  if (audioPlayer?.nowPlayingItem?.attributes) {
    const { attributes } = audioPlayer.nowPlayingItem
    const { artwork, name, artistName, albumName, durationInMillis, url } = attributes
    const duration = durationInMillis / 1000

    data = {
      album: albumName,
      artist: artistName,
      artwork: artwork.url.replace('{w}', String(artwork.width)).replace('{h}', String(artwork.height)),
      duration,
      elapsedTime: audioPlayer.currentPlaybackProgress * duration,
      name,
      paused: !audioPlayer.isPlaying,
      url,
    }
  }
  else if (video?.title || audio?.title) {
    const media = video || audio
    const paused = !!media && (media.paused || media.readyState <= 2)
    const metadata = navigator.mediaSession.metadata

    data = {
      album: metadata?.album || '',
      artist: metadata?.artist || '',
      artwork: metadata?.artwork[0]?.src.replace(/\d{1,2}x\d{1,2}[a-z]{1,2}/, '1024x1024') || '',
      duration: media!.duration,
      elapsedTime: media!.currentTime,
      name: metadata?.title || '',
      paused,
      url: undefined,
    }
  }

  if (data) {
    presenceData.details = data.name
    presenceData.state = data.artist

    if (data.paused && hidePaused) {
      clearActivity()
      return
    }

    if (playback) {
      presenceData.smallImageKey = data.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = data.paused
        ? (await strings).pause
        : (await strings).play
    }

    if (cover) {
      presenceData.largeImageKey = data.artwork
      presenceData.largeImageText = data.album
    }

    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
      data.elapsedTime,
      data.duration,
    )

    if (data.paused || !timestamps) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    if (listening)
      presenceData.type = ActivityType.Listening

    if (buttons && data.url) {
      presenceData.buttons = [
        {
          label: 'Listen on Apple Music',
          url: data.url,
        },
      ]
    }

    switch (displayType) {
      case 1:
        presenceData.statusDisplayType = StatusDisplayType.State
        break
      case 2:
        presenceData.statusDisplayType = StatusDisplayType.Details
        break
    }

    presence.setActivity(presenceData)
  }
  else {
    clearActivity()
  }
})
