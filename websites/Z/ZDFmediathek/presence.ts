import { ActivityType, Assets } from 'premid'

let elapsed = Math.floor(Date.now() / 1000)
let prevUrl = document.location.href

const assets = {
  'zdf': 'https://cdn.rcd.gg/PreMiD/websites/Z/ZDFmediathek/assets/0.png',
  '3sat': 'https://cdn.rcd.gg/PreMiD/websites/Z/ZDFmediathek/assets/1.png',
  'phoenix': 'https://cdn.rcd.gg/PreMiD/websites/Z/ZDFmediathek/assets/2.png',
  'arte': 'https://cdn.rcd.gg/PreMiD/websites/Z/ZDFmediathek/assets/3.png',
  'zdfinfo': 'https://cdn.rcd.gg/PreMiD/websites/Z/ZDFmediathek/assets/4.png',
  'zdfneo': 'https://cdn.rcd.gg/PreMiD/websites/Z/ZDFmediathek/assets/5.png',
  'kika': 'https://cdn.rcd.gg/PreMiD/websites/Z/ZDFmediathek/assets/6.png',
}
const presence = new Presence({
  clientId: '854999470357217290',
})
// TODO: Add multiLang
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  browsing: 'general.browsing',
  browsingThrough: 'discord.browseThrough',
  buttonWatchVideo: 'general.buttonWatchVideo',
  buttonWatchStream: 'general.buttonWatchStream',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Z/ZDFmediathek/assets/logo.png',
  } as PresenceData
  const video = document.querySelector<HTMLVideoElement>(
    'div.zdfplayer-video-container video',
  )

  if (document.location.href !== prevUrl) {
    prevUrl = document.location.href
    elapsed = Math.floor(Date.now() / 1000)
  }

  if (video) {
    presenceData.type = ActivityType.Watching
    if (location.pathname.startsWith('/live-tv')) {
      // Livestream
      const mediathekLivechannel = document
        .querySelector<HTMLHeadingElement>(
          'div.m-active h2[class=\'visuallyhidden\']',
        )
        ?.textContent
        ?.replace(/ {2}/g, ' ')
        .replaceAll(' im Livestream', '')
        .replaceAll(' Livestream', '')
      let livename = mediathekLivechannel
      switch (livename) {
        case 'phoenix':
          livename = 'PHOENIX'
          break
        case 'KiKA':
          livename = 'KI\\.KA'
          break
        default:
      }
      const channel = document.querySelector<HTMLHeadingElement>(
        `section.timeline-${livename} ul li.m-live h4 a span`,
      )
      const videoInfoTag = document
        .querySelector<HTMLHeadingElement>(
          `section.timeline-${livename} ul li.m-live h4 a`,
        )
        ?.getAttribute('aria-label')
        ?.replace(mediathekLivechannel ?? '', '')
      let channelname = ''
      if (channel?.textContent && channel.textContent !== ':')
        channelname = channel.textContent.replace(':', ' -')
      presenceData.largeImageKey = assets[mediathekLivechannel?.toLowerCase() as keyof typeof assets]
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = 'Live'
      presenceData.details = videoInfoTag
      presenceData.state = `${channelname}${mediathekLivechannel} Live`
      presenceData.startTimestamp = elapsed
      presenceData.buttons = [
        { label: (await strings).buttonWatchStream, url: prevUrl },
      ]

      if (
        document.querySelector<HTMLVideoElement>(
          'div.m-active div figure div div video',
        )?.paused
      ) {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = (await strings).pause
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }
    else {
      // Video-on-demand
      presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/Z/ZDFmediathek/assets/logo.png'
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = (await strings).play

      presenceData.state = document.querySelector(
        'ol li:nth-last-child(2) a',
      )?.textContent
      presenceData.details = document.querySelector(
        'ol li:nth-last-child(1) span',
      )?.textContent;
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
        Math.floor(video.currentTime),
        Math.floor(video.duration),
      )
      presenceData.buttons = [
        { label: (await strings).buttonWatchVideo, url: prevUrl },
      ]
      if (video.paused) {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = (await strings).pause
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }
  }
  else {
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = (await strings).browsingThrough
    presenceData.details = (await strings).browsing
    presenceData.startTimestamp = elapsed
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
