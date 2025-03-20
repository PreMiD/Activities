import { Assets } from 'premid'

const presence = new Presence({
  clientId: '719119956486258749',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/TwitLonger/assets/logo.png',
  }

  if (document.location.pathname === '/') {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Home'
  }
  else if (document.location.pathname.includes('/show/')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Reading an post'
    presenceData.state = `${
      document.querySelector<HTMLElement>('#postcontent > h3')?.textContent
    } by ${
      document.querySelector<HTMLElement>(
        '#user-info > div > h4 > a:nth-child(1)',
      )?.textContent
    } (${
      document.querySelector<HTMLElement>(
        '#user-info > div > h4 > a:nth-child(2)',
      )?.textContent
    })`
    presenceData.smallImageKey = Assets.Reading
  }
  else if (document.location.pathname.includes('/about')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'About'
  }
  else if (document.location.pathname.includes('/privacy')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Privacy'
  }
  else if (document.location.pathname.includes('/ad-free')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Ad-free'
  }
  else if (document.location.pathname.includes('/post')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Writing an Post'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
