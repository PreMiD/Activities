import { Assets } from 'premid'

const presence = new Presence({
  clientId: '640969147911503910',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/GameStar/assets/logo.png',
  }

  if (document.location.hostname === 'www.gamestar.de') {
    if (document.location.pathname === '/') {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Betrachtet die Startseite'
    }
    else if (document.location.pathname.includes('/artikel/')) {
      presenceData.startTimestamp = browsingTimestamp
      const user = document.querySelector(
        '#content > div:nth-child(3) > div > div > div.col-xs-12.div-article-title > div:nth-child(6) > div:nth-child(1) > h1',
      )
      presenceData.details = 'Liest Artikel:'
      presenceData.state = user?.textContent
      presenceData.smallImageKey = Assets.Reading
    }
    else if (document.location.pathname.includes('/videos/')) {
      const video = document.querySelector<HTMLVideoElement>(
        '#playerID > div.jw-wrapper.jw-reset > div.jw-media.jw-reset > video',
      )
      const title = document.querySelector(
        '#content > div:nth-child(3) > div > div > div > div:nth-child(3) > div > h1',
      )?.textContent
      if (video && !Number.isNaN(video.duration)) {
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video.paused
          ? (await strings).pause
          : (await strings).play;
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
          Math.floor(video.currentTime),
          Math.floor(video.duration),
        );

        [presenceData.details] = title?.split('-') ?? []
        presenceData.state = title?.replace(`${title.split('-')[0]}- `, '')

        if (video.paused) {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
      }
      else if (video && Number.isNaN(video.duration)) {
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Betrachtet:'
        presenceData.state = title
      }
    }
  }

  if (!presenceData.details) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Betrachtet Seite:'
    presenceData.state = document.querySelector('head > title')?.textContent
    presence.setActivity(presenceData)
  }
  else {
    presence.setActivity(presenceData)
  }
})
