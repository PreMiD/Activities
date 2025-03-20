import { Assets } from 'premid'

const presence = new Presence({
  clientId: '728904519055966228',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/motorsport.com/assets/logo.png',
    smallImageKey: Assets.Reading,
    smallImageText: 'Reading',
    startTimestamp: browsingTimestamp,
  }

  function checkSubPage(): void {
    if (document.location.pathname.endsWith('/news/')) {
      presenceData.details = 'Reading the news'
    }
    else if (document.location.pathname.includes('/photos/')) {
      presenceData.details = 'Looking at photos'
      presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/motorsport.com/assets/0.png'
      presenceData.smallImageText = 'Photos'
    }
    else if (document.location.pathname.includes('/videos')) {
      presenceData.details = 'Searching for videos'
    }
    else if (document.location.pathname.includes('/video/')) {
      presenceData.details = 'Watching a video'
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Watching'
    }
    else if (document.location.pathname.includes('/schedule')) {
      presenceData.details = 'Looking at schedules'
    }
    else if (document.location.pathname.includes('/results')) {
      presenceData.details = 'Looking at results'
    }
    else if (document.location.pathname.includes('/standings/')) {
      presenceData.details = 'Looking at the Standings'
    }
    else if (document.location.pathname.includes('/drivers/')) {
      presenceData.details = 'Looking at Drivers'
    }
    else if (document.location.pathname.includes('/teams/')) {
      presenceData.details = 'Looking at teams'
    }
  }

  function articleCheck(): void {
    if (
      document.location.pathname.includes('/news/')
      && !document.location.pathname.endsWith('/news/')
    ) {
      presenceData.details = 'Reading an article'
      presenceData.state = document.querySelector(
        '.ms-entity-detail-header_title',
      )?.textContent
    }
  }

  if (document.location.hostname === 'www.motorsport.com') {
    presenceData.details = 'Viewing a Page'
    presenceData.state = 'Home Page'

    // categories
    if (document.location.pathname.startsWith('/category/')) {
      presenceData.details = 'Viewing a Category'
      checkSubPage()
      if (document.location.pathname.startsWith('/category/motogp/'))
        presenceData.state = 'Moto GP Series'
      else if (document.location.pathname.startsWith('/category/nascar/'))
        presenceData.state = 'NASCAR Series'
      else if (document.location.pathname.startsWith('/category/openwheel/'))
        presenceData.state = 'Openwheel Series'
      else if (document.location.pathname.startsWith('/category/sportcar/'))
        presenceData.state = 'Sportscar Series'
      else if (document.location.pathname.startsWith('/category/touring/'))
        presenceData.state = 'Touring Series'
      else if (document.location.pathname.startsWith('/category/rally/'))
        presenceData.state = 'Rally Series'
      else if (document.location.pathname.startsWith('/category/more/'))
        presenceData.state = 'More Categories'
    }

    // /all/xyz/
    if (document.location.pathname.includes('/all/')) {
      presenceData.state = 'All categories'
      checkSubPage()
    }

    // MotoGP series
    if (document.location.pathname.includes('/motogp/')) {
      presenceData.state = 'Moto GP'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/wsbk/')) {
      presenceData.state = 'World Superbike'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/moto2/')) {
      presenceData.state = 'Moto 2'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/moto3/')) {
      presenceData.state = 'Moto 3'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/motoe/')) {
      presenceData.state = 'Moto E'
      checkSubPage()
      articleCheck()
    }

    // NASCAR series
    if (document.location.pathname.includes('/nascar-cup/')) {
      presenceData.state = 'NASCAR Cup'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/nascar-xs/')) {
      presenceData.state = 'NASCAR XFINITY'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/nascar-truck/')) {
      presenceData.state = 'NASCAR Truck'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/nascar-cdm/')) {
      presenceData.state = 'NASCAR Canada'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/nascar-euro/')) {
      presenceData.state = 'NASCAR Euro'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/nascar-mexico/')) {
      presenceData.state = 'NASCAR Mexico'
      checkSubPage()
      articleCheck()
    }

    // Openwheel series
    if (document.location.pathname.includes('/indycar/')) {
      presenceData.state = 'IndyCar'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/indylights/')) {
      presenceData.state = 'Indy Lights'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/fia-f2/')) {
      presenceData.state = 'FIA Formula 2'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/fia-f3/')) {
      presenceData.state = 'FIA Formula 3'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/super-formula/')) {
      presenceData.state = 'Super Formula'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/w-series/')) {
      presenceData.state = 'W Series'
      checkSubPage()
      articleCheck()
    }

    // Sportscar series
    if (document.location.pathname.includes('/imsa/')) {
      presenceData.state = 'IMSA'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/elms/')) {
      presenceData.state = 'European Le Mans'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/aslms/')) {
      presenceData.state = 'Asian Le Mans'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/sro-anerica/')) {
      presenceData.state = 'SRO America'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/gtwce-endurance/')) {
      presenceData.state = 'GT World Challenge Europe Endurance'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/gtwce-sprint/')) {
      presenceData.state = 'GT World Challenge Europe Sprint'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/supergt/')) {
      presenceData.state = 'Super GT'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/endurance/')) {
      presenceData.state = 'Endurance'
      checkSubPage()
      articleCheck()
    }

    // Touring series
    if (document.location.pathname.includes('/wtcr/')) {
      presenceData.state = 'WTCR'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/tcr/')) {
      presenceData.state = 'tcr'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/dtm/')) {
      presenceData.state = 'DTM'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/v8supercars/')) {
      presenceData.state = 'V8 Supercars'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/btcc/')) {
      presenceData.state = 'BTCC'
      checkSubPage()
      articleCheck()
    }

    // Rally series
    if (document.location.pathname.includes('/wrc/')) {
      presenceData.state = 'WRC'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/world-rx/')) {
      presenceData.state = 'World Rallycross'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/dakar/')) {
      presenceData.state = 'Dakar'
      checkSubPage()
      articleCheck()
    }

    // more categories
    if (document.location.pathname.includes('/general/')) {
      presenceData.state = 'General'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/kart/')) {
      presenceData.state = 'Karting'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/nhra/')) {
      presenceData.state = 'NHRA'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/vintage/')) {
      presenceData.state = 'Vintage'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/ferrari/')) {
      presenceData.state = 'Ferrari'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/roadracing/')) {
      presenceData.state = 'Road Racing'
      checkSubPage()
      articleCheck()
    }

    if (document.location.pathname.includes('/f1/')) {
      presenceData.state = 'Formula 1'
      checkSubPage()
      articleCheck()
    }

    if (document.location.pathname.includes('/wec/')) {
      presenceData.state = 'World Endurance Championship'
      checkSubPage()
      articleCheck()
    }

    if (document.location.pathname.includes('/gaming/')) {
      presenceData.state = 'Esports'
      checkSubPage()
      articleCheck()
    }

    if (document.location.pathname.includes('/formula-e/')) {
      presenceData.state = 'Formula E'
      checkSubPage()
      articleCheck()
    }
    else if (document.location.pathname.includes('/driver/')) {
      presenceData.details = 'Looking at a driver'
      presenceData.state = document.querySelector(
        '.ms-entity-header_title',
      )?.textContent
    }
    else if (document.location.pathname.includes('/team/')) {
      presenceData.details = 'Looking at a team'
      presenceData.state = document.querySelector(
        '.ms-entity-header_title',
      )?.textContent
    }

    if (document.location.pathname.includes('/collection/giorgio-piola/')) {
      presenceData.details = 'Collection'
      presenceData.state = 'Giorgio Piola'
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
