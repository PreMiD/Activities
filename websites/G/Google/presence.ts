import { Assets } from 'premid'

const presence = new Presence({
  clientId: '612704158826496028',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  chartUp = 'https://cdn.rcd.gg/PreMiD/websites/G/Google/assets/0.png',
  chartDown = 'https://cdn.rcd.gg/PreMiD/websites/G/Google/assets/1.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Google/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  const pathArr = document.location.pathname.split('/')
  const searchInput = document.querySelector<HTMLInputElement>(`[name='q']`)
  const homepageImage = document.querySelector<HTMLImageElement>('img.lnXdpd')
  const [privacy, showSmallImages] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showSmallImages'),
  ])

  if ((searchInput && homepageImage) || !document.location.pathname) {
    presenceData.details = 'Home'
  }
  else if (document.location.pathname.startsWith('/finance')) {
    presenceData.name = 'Google Finance'
    presenceData.details = 'Home'

    switch (pathArr[2]) {
      case 'quote': {
        const marketPourcentage = document.querySelector(`c-wiz[style*='visibility: visible'] span.NydbP.tnNmPe`)?.getAttribute('aria-label')
        const marketResult = document.querySelector(`c-wiz[style*='visibility: visible'] span.P2Luy.ZYVHBb`)?.textContent
        presenceData.details = !privacy ? `Viewing market : ${document.querySelector(`c-wiz[style*='visibility: visible'] div.zzDege`)?.textContent}` : 'Browsing through markets'
        if (marketResult?.startsWith('+') && !privacy) {
          presenceData.smallImageKey = ActivityAssets.chartUp
          presenceData.smallImageText = `${marketPourcentage} • ${marketResult}`
        }
        else if (marketResult?.startsWith('-') && !privacy) {
          presenceData.smallImageKey = ActivityAssets.chartDown
          presenceData.smallImageText = `${marketPourcentage} • ${marketResult}`
        }
        break
      }
      case 'markets': {
        presenceData.details = `Explore market trends : ${document.querySelector(`c-wiz[style*='visibility: visible'] a.GqNdIe.GqNdIe-YySNWc`)?.textContent}`

        break
      }
      case 'portfolio': {
        const portfolioType = document.querySelector(`c-wiz[style*='visibility: visible'] div.xsHABd span.zMQeMc`)?.textContent
        const portfolioName = document.querySelector(`c-wiz[style*='visibility: visible'] div.xsHABd span.sZflkf`)?.textContent
        if (portfolioType === 'insert_chart') {
          presenceData.details = !privacy ? `Explore Portfolio : ${portfolioName}` : 'Explore their Portfolios'
        }
        else if (portfolioType === 'format_list_bulleted') {
          presenceData.details = !privacy ? `Explore Watchlist : ${portfolioName}` : 'Explore their Watchlists'
        }

        break
      }
    }
  }
  else if (document.location.pathname.startsWith('/search')) {
    const urlParams = new URL(document.location.href).searchParams
    const searchTab = urlParams?.get('tbm') || urlParams?.get('udm')
    presenceData.smallImageKey = Assets.Search

    if (!searchTab) {
      presenceData.details = `Searching for : ${searchInput?.value}`
      presenceData.state = document.querySelector('#result-stats')?.textContent
    }
    else {
      switch (searchTab) {
        case '2': {
          presenceData.name = 'Google Images'
          presenceData.details = `Searching for : ${searchInput?.value}`

          break
        }
        case '7': {
          presenceData.name = 'Google Videos'
          presenceData.details = `Searching for : ${searchInput?.value}`

          break
        }
        case 'nws': {
          presenceData.name = 'Google News'
          presenceData.details = `Searching for : ${searchInput?.value}`

          break
        }
        case '36': {
          presenceData.name = 'Google Books'
          presenceData.details = `Searching for : ${searchInput?.value}`

          break
        }
        case 'pers': {
          presenceData.name = 'Google Personal'
          presenceData.details = `Searching for : ${searchInput?.value}`

          break
        }
        case '3': {
          presenceData.name = 'Google Products'
          presenceData.details = `Searching for : ${searchInput?.value}`

          break
        }
        case '18': {
          presenceData.name = 'Google Forums'
          presenceData.details = `Searching for : ${searchInput?.value}`

          break
        }
        case '1': {
          presenceData.name = 'Google Places'
          presenceData.details = `Searching for : ${searchInput?.value}`

          break
        }
        case '11': {
          presenceData.name = 'Google Places sites'
          presenceData.details = `Searching for : ${searchInput?.value}`

          break
        }
        case '14': {
          presenceData.name = 'Google Web'
          presenceData.details = `Searching for : ${searchInput?.value}`

          break
        }
        case '5': {
          presenceData.name = 'Google Lodging'
          presenceData.details = `Searching for : ${searchInput?.value}`

          break
        }
      }
    }
    if (privacy) {
      delete presenceData.state
      if (
        typeof presenceData.details === 'string'
        && presenceData.details.includes('Searching for :')
      ) {
        presenceData.details = 'Searching'
        presenceData.name = 'Google'
      }
    }
  }
  if (!showSmallImages)
    delete presenceData.smallImageKey
  presence.setActivity(presenceData)
})
