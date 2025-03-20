import { Assets } from 'premid'

const presence = new Presence({
  clientId: '641969062083035146',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let user: string | null | undefined,
  title: string | null | undefined,
  currentTime: number,
  duration: number,
  paused: boolean,
  startTimestamp: number,
  endTimestamp: number

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Sdarot.TV/assets/logo.png',
  }

  if (
    document.location.pathname === '/'
    || document.location.pathname === '/index'
  ) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'צופה בדף הבית'
  }
  else if (document.location.pathname === '/series') {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'צופה ברשימת הסדרות'
  }
  else if (document.location.pathname.includes('/watch/')) {
    const video = document.querySelector<HTMLVideoElement>('#playerDiv > div > video')
      ?? document.querySelector('#videojs_html5_api')

    title = document.querySelector(
      '#watchEpisode > div.poster > div > h1',
    )?.textContent
    user = document.querySelector('#player > div.head > p')?.textContent
    if (user?.includes(' - '))
      [, user] = user.split(' - ')

    if (video) {
      ({ currentTime, duration, paused } = video);
      [startTimestamp, endTimestamp] = presence.getTimestamps(
        Math.floor(currentTime),
        Math.floor(duration),
      )
    }

    if (!Number.isNaN(duration)) {
      presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = paused
        ? (await strings).pause
        : (await strings).play;
      [presenceData.startTimestamp, presenceData.endTimestamp] = [
        startTimestamp,
        endTimestamp,
      ]

      presenceData.details = title
      presenceData.state = user

      if (paused) {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }
    else if (Number.isNaN(duration)) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = ':צופה ב'
      presenceData.state = `${title} - ${user}`
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
