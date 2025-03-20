import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '842112189618978897',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/Apple%20Music/assets/logo.png',
  } as PresenceData
  const [timestamps, cover, listening] = await Promise.all([
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('cover'),
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
  if (video?.title || audio?.title) {
    const media = video || audio
    const timestamp = document
      .querySelector('amp-lcd.lcd.lcd__music')
      ?.shadowRoot
      ?.querySelector<HTMLInputElement>(
        'input#playback-progress[aria-valuenow][aria-valuemax]',
      )
    const paused = media && (media.paused || media.readyState <= 2)

    presenceData.details = navigator.mediaSession.metadata?.title
    presenceData.state = navigator.mediaSession.metadata?.artist

    presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = paused
      ? (await strings).pause
      : (await strings).play

    if (cover) {
      presenceData.largeImageKey = navigator.mediaSession.metadata?.artwork[0]?.src.replace(
        /\d{1,2}x\d{1,2}[a-z]{1,2}/,
        '1024x1024',
      )
    }

    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
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
  else if (+presence.getExtensionVersion() < 224) {
    presence.setActivity()
  }
  else {
    presence.clearActivity()
  }
})
