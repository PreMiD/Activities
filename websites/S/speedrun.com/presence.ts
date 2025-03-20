import { Assets } from 'premid'

const presence = new Presence({
  clientId: '639603634451120138',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/speedrun.com/assets/logo.png',
  }

  if (document.location.hostname === 'www.speedrun.com') {
    if (document.location.pathname === '/') {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Viewing home page'
    }
    else if (document.location.pathname.includes('/games')) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Viewing all games'
    }
    else if (document.location.pathname.includes('/streams')) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Viewing all streams'
    }
    else if (document.location.pathname.includes('/thread/')) {
      const title = document.querySelector(
        '#centerbar > div > div:nth-child(1) > span',
      )
      presenceData.smallImageKey = Assets.Reading
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Viewing forum post:'
      if (title?.textContent && title.textContent.length > 128)
        presenceData.state = `${title.textContent.substring(0, 125)}...`
      else presenceData.state = title?.textContent
    }
    else if (document.location.pathname.includes('/forum')) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Browsing the forums...'
    }
  }

  if (!presenceData.details) {
    const title = document.querySelector('head > title')
    presenceData.state = title?.textContent?.replace(' - speedrun.com', '')
    presenceData.details = 'Viewing:'
    presenceData.startTimestamp = browsingTimestamp
    presence.setActivity(presenceData)
  }
  else {
    presence.setActivity(presenceData)
  }
})
