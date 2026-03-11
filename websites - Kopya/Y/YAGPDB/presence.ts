import { Assets } from 'premid'

const presence = new Presence({
  clientId: '633795089600348160',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Y/YAGPDB/assets/logo.png',
  }

  if (document.location.hostname === 'yagpdb.xyz') {
    presenceData.startTimestamp = browsingTimestamp
    switch (document.URL) {
      case 'yagpdb.xyz': {
        presenceData.details = 'Viewing the homepage'
        break
      }
      case 'yagpdb.xyz/#features': {
        presenceData.details = 'Viewing the features'
        break
      }
      case 'yagpdb.xyz/#about': {
        presenceData.details = 'Viewing the about section'
        break
      }
      default:
        if (document.querySelector('#main-content > header > h2')) {
          const title = document.querySelector('#main-content > header > h2')
          presenceData.details = 'Control Panel - Editing:'
          presenceData.smallImageKey = Assets.Writing
          presenceData.state = title?.textContent
          if (title?.textContent === 'News and updates') {
            presenceData.details = 'Reading the news'
            presenceData.smallImageKey = Assets.Reading
            delete presenceData.state
          }
        }
        else if (document.location.pathname.includes('/manage/')) {
          presenceData.details = 'Viewing the Control Panel'
        }
    }
  }
  else if (document.location.hostname === 'docs.yagpdb.xyz') {
    const title = document.querySelector('head > title')
    const search = document.querySelector<HTMLInputElement>(
      '#__GITBOOK__ROOT__ > div > div.reset-3c756112--bodyContent-2f98451b > div > div.reset-3c756112--backdrop-1322b68a--sheetBackdrop-457fd54f > div > div.reset-3c756112--sheetHeader-2187bd71--small-2783b5d4 > div.reset-3c756112--sheetHeaderInner-96159b50 > div > div > div.reset-3c756112--inputInnerSizer-756c9114 > input',
    )
    presenceData.startTimestamp = browsingTimestamp
    if (search) {
      if (search.value !== '') {
        presenceData.details = 'Docs searching for:'
        presenceData.state = search.value
        presenceData.smallImageKey = Assets.Search
      }
      else {
        presenceData.details = 'Docs going to search something up'
        presenceData.smallImageKey = Assets.Search
      }
    }
    else if (title?.textContent === 'MEE6 Helpdesk') {
      presenceData.details = 'Browsing the helpdesk'
    }
    else {
      presenceData.details = 'Docs viewing:'
      presenceData.state = title?.textContent?.replace(' - YAGPDB', '')
      presenceData.smallImageKey = Assets.Reading
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
