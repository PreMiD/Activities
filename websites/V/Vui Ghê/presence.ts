import { Assets } from 'premid'

const presence = new Presence({
  clientId: '642111645774118944',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/Vui%20Gh%C3%AA/assets/logo.png',
  }

  if (document.location.hostname === 'vuighe.net') {
    if (document.location.pathname === '/') {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Đang xem trang chủ'
    }
    else if (document.querySelector('#player > video.player-video')) {
      let currentTime: number | undefined
      let duration: number | undefined
      let paused: boolean = false
      let timestamps: number[] = []
      let video: HTMLVideoElement | null
      video = document.querySelector('#player > video.player-video')
      if (!video)
        video = document.querySelector('#centerDivVideo > div > div > video')

      const title = document.querySelector(
        'body > div.container > div.film-info > h1',
      )?.textContent ?? undefined
      const user = document.querySelector(
        'body > div.container > div.film-info > div.film-info-views',
      )?.textContent ?? undefined

      if (video) {
        ({ currentTime, duration, paused } = video)
        timestamps = presence.getTimestamps(
          Math.floor(currentTime),
          Math.floor(duration),
        )
      }
      if (!Number.isNaN(duration)) {
        presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = paused
          ? (await strings).pause
          : (await strings).play;
        [presenceData.startTimestamp, presenceData.endTimestamp] = timestamps

        presenceData.details = title
        presenceData.state = user

        if (paused) {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
      }
      else if (Number.isNaN(duration)) {
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Đang xem:'
        presenceData.state = title
      }
    }
    else if (document.location.pathname.includes('/anime')) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Đang xem:'
      presenceData.state = `Anime - ${
        document.querySelector(
          'body > div.container > div.genre > a.genre-item.activated',
        )?.textContent
      }`
      presenceData.smallImageKey = Assets.Reading
    }
    else if (document.location.pathname.includes('/bang-xep-hang')) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Đang xem:'
      presenceData.state = 'Bảng xếp hạng anime'
      presenceData.smallImageKey = Assets.Reading
    }
    else if (document.location.pathname.includes('/tim-kiem')) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.smallImageKey = Assets.Search;
      [presenceData.details, presenceData.state] = document
        .querySelector('body > div.container > section > div.tray-title')
        ?.textContent
        ?.split(': ') ?? []
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
