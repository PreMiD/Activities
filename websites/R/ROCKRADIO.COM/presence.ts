import { Assets } from 'premid'

const presence = new Presence({
  clientId: '639616115873546261',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/ROCKRADIO.COM/assets/logo.png',
  }

  if (document.location.hostname === 'www.rockradio.com') {
    if (document.location.pathname === '/') {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Browsing...'
    }
    else if (
      document.querySelector(
        '#now-playing > div.info-container > div.progress-container > div > span > span > span.total',
      ) !== null
    ) {
      const user = document.querySelector(
        '#now-playing > div.info-container > div.progress-container > div > span > span > span.remain',
      )
      const title = document.querySelector(
        '#now-playing > div.info-container > div.title-container > div > span > span.artist-name',
      )
      const replace = document.querySelector(
        '#now-playing > div.info-container > div.title-container > div > span > span.track-name',
      )
      presenceData.details = `${title?.textContent}${replace?.textContent}`
      presenceData.state = `${user?.textContent?.replace('-', '')} left`
      const playing = document.querySelector('#play-button > div > a')?.className
        === 'ico icon-pause'
        ? Assets.Play
        : Assets.Pause
      presenceData.smallImageKey = playing
    }
    else if (document.querySelector('#channel-title')) {
      const title = document.querySelector('#channel-title')
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Viewing channel:'
      presenceData.state = title?.textContent
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
