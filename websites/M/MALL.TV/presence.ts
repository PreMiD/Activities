import { Assets } from 'premid'

const presence = new Presence({
  clientId: '813680039354826784',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/MALL.TV/assets/logo.png',
  }
  const strings = await presence.getStrings({
    browsing: 'general.browsing',
    playing: 'general.playing',
    paused: 'general.paused',
    live: 'general.live',
    homepage: 'general.viewHome',
    watchVideo: 'general.buttonWatchVideo',
    watchStream: 'general.buttonWatchStream',
    viewChannel: 'general.buttonViewChannel',
  })
  const channel = document.querySelector<HTMLHeadingElement>('h1.text-ellipsis')
  const videoElement = document.querySelector<HTMLVideoElement>('#vp-player > video')
  const videoTitle = document.querySelector<HTMLHeadingElement>(
    'h1.video__info-title',
  )
  const videoChannel = document.querySelector<HTMLAnchorElement>(
    'a.influencer__info-link',
  )
  if (document.location.pathname === '/') {
    presenceData.details = strings.homepage
    presenceData.state = strings.browsing
    presenceData.smallImageKey = Assets.Reading
  }
  else if (channel) {
    presenceData.details = channel.textContent
    presenceData.state = strings.browsing
    presenceData.smallImageKey = Assets.Reading
  }
  else if (videoTitle && videoChannel) {
    const videoLive = document.querySelector<HTMLButtonElement>('button.vp-live')
    presenceData.details = videoTitle.textContent
    presenceData.state = videoChannel.textContent
    presenceData.buttons = [
      {
        label: videoLive?.style.display === 'none'
          ? strings.watchVideo
          : strings.watchStream,
        url: document.URL.split('?')[0]!,
      },
      {
        label: strings.viewChannel,
        url: videoChannel.href,
      },
    ]
    if (videoLive?.style.display !== 'none') {
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = strings.live
    }
    else if (videoElement && !videoElement.paused) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(videoElement)
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = strings.playing
    }
    else {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = strings.paused
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
