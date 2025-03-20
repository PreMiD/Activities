import { Assets } from 'premid'

const presence = new Presence({
  clientId: '848082293427273748',
})
const presenceData: PresenceData = {
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/Westmanga/assets/logo.png',
  startTimestamp: Math.floor(Date.now() / 1000),
}

presence.on('UpdateData', async () => {
  switch (
    document.location.pathname.endsWith('/')
    && document.location.pathname.length > 1
      ? document.location.pathname.slice(
          0,
          document.location.pathname.length - 1,
        )
      : document.location.pathname
  ) {
    case '/':
      presenceData.details = 'Viewing homepage...'
      break
    case '/project':
      presenceData.details = 'Viewing project list...'
      break
    case '/manga':
      presenceData.details = 'Viewing manga list...'
      break
    case '/bookmark':
      presenceData.details = 'Viewing my bookmark...'
      break
    case '/contact-us':
      presenceData.details = 'Viewing contact-us...'
      break
    case '/copyright':
      presenceData.details = 'Viewing copyright...'
      break
    case '/info-update':
      presenceData.details = 'Viewing info updates...'
      break
    case '/apk':
      presenceData.details = 'Viewing apk information...'
      break
    case '/donasi':
      presenceData.details = 'Viewing donation...'
      break
    default: {
      if (document.location.pathname.includes('/genres/')) {
        presenceData.details = 'Searching by genres...'
        presenceData.state = `Genre: ${
          document.querySelector('div.wrapper > div > div > div.releases > h1')
            ?.textContent
        }`
        presenceData.smallImageKey = Assets.Search
      }
      if (document.location.pathname.startsWith('/manga')) {
        const type = document.querySelector(
          'div.seriestucon > div.seriestucontent > div.seriestucontentr > div.seriestucont > div > table > tbody > tr:nth-child(2) > td:nth-child(2)',
        )?.textContent
        presenceData.details = `Viewing ${type}`
        presenceData.state = document.querySelector(
          'div.seriestucon > div.seriestuheader > h1',
        )?.textContent
        presenceData.buttons = [
          { label: `View ${type}`, url: document.location.href },
        ]
      }
      if (document.querySelector('.chapterbody')) {
        presenceData.details = `Reading ${
          document.querySelector('div.headpost > div > a')?.textContent
        }`
        presenceData.state = `${
          document.querySelector<HTMLSelectElement>('#chapter')
            ?.selectedOptions[0]
            ?.textContent
        } of ${
          document.querySelector('#chapter > option:nth-child(2)')?.textContent
        }`
        presenceData.buttons = [
          { label: 'Read Manga', url: document.location.href },
        ]
      }
      break
    }
  }
  presence.setActivity(presenceData)
})
