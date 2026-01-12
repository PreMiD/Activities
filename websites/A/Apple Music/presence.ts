import { ActivityType, Assets, getTimestamps } from 'premid'

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

interface NowPlayingItem {
  attributes: Attributes
}

interface AudioPlayer {
  _nowPlayingItem: NowPlayingItem
  _currentPlaybackProgress: number
  _paused: boolean
  _stopped: boolean
  _playbackDidStart: boolean
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
  const [hidePaused, timestamps, cover, playback, buttons, listening] = await Promise.all([
    presence.getSetting<boolean>('hidePaused'),
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('playback'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('listening'),
  ])
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

  const audioPlayer = await presence.getPageVariable<{ audioPlayer: AudioPlayer }>('audioPlayer').then(res => res?.audioPlayer)
  if (audioPlayer?._nowPlayingItem) {
    const { attributes } = audioPlayer._nowPlayingItem
    const paused = audioPlayer._paused || audioPlayer._stopped || !audioPlayer._playbackDidStart

    if (paused && hidePaused) {
      clearActivity()
      return
    }

    presenceData.details = attributes.name
    presenceData.state = attributes.artistName

    if (playback) {
      presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = paused
        ? (await strings).pause
        : (await strings).play
    }

    if (cover) {
      const { url, width, height } = attributes.artwork
      presenceData.largeImageKey = url.replace('{w}', String(width)).replace('{h}', String(height))
      presenceData.largeImageText = attributes.albumName
    }

    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
      audioPlayer._currentPlaybackProgress * attributes.durationInMillis / 1000 || 0,
      attributes.durationInMillis / 1000,
    )

    if (paused || !timestamps) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    if (listening)
      presenceData.type = ActivityType.Listening

    if (buttons && attributes.url) {
      presenceData.buttons = [
        {
          label: 'Listen on Apple Music',
          url: attributes.url,
        },
      ]
    }

    presence.setActivity(presenceData)
  }
  else if (video?.title || audio?.title) {
    const media = video || audio
    const timestamp = document
      .querySelector('amp-lcd.lcd.lcd__music')
      ?.shadowRoot
      ?.querySelector<HTMLInputElement>(
        'input#playback-progress[aria-valuenow][aria-valuemax]',
      )
    const paused = media && (media.paused || media.readyState <= 2)

    if (paused && hidePaused) {
      clearActivity()
      return
    }

    presenceData.details = navigator.mediaSession.metadata?.title
    presenceData.state = navigator.mediaSession.metadata?.artist

    if (playback) {
      presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = paused
        ? (await strings).pause
        : (await strings).play
    }

    if (cover) {
      presenceData.largeImageKey = navigator.mediaSession.metadata?.artwork[0]?.src.replace(
        /\d{1,2}x\d{1,2}[a-z]{1,2}/,
        '1024x1024',
      )
      presenceData.largeImageText = navigator.mediaSession.metadata?.album
    }

    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
      Number(timestamp ? timestamp.ariaValueNow : media!.currentTime),
      Number(timestamp ? timestamp.ariaValueMax : media!.duration),
    )

    if (paused || !timestamps) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    if (listening)
      presenceData.type = ActivityType.Listening

    presence.setActivity(presenceData)
  }
  else {
    clearActivity()
  }
})
