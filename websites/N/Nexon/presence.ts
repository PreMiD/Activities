import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})

let prevURL: string
let browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  AirlinesLogo = 'https://cdn.rcd.gg/PreMiD/websites/N/Nexon/assets/0.png',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/N/Nexon/assets/1.jpeg',
}

presence.on('UpdateData', async () => {
  const { pathname, hostname, href } = document.location
  const presenceData: PresenceData = {
    largeImageKey: hostname?.includes('airlines')
      ? ActivityAssets.AirlinesLogo
      : ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    name: 'Nexon',
  }
  const [privacy, buttons, showCover] = await Promise.all([
    presence.getSetting<number>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('cover'),
  ])

  if (!prevURL)
    prevURL = href
  else if (prevURL !== href)
    browsingTimestamp = Math.floor(Date.now() / 1000)

  switch (hostname) {
    case 'nexonlogistics.com': {
      presenceData.name = 'Nexon Logistics'
      switch (true) {
        case pathname === '':
        case pathname === '/': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing the homepage'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
        case pathname === '/about': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing the about section'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
        case pathname === '/team': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing the team'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
        case pathname === '/division': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing all divisions'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
        case pathname.includes('/division'): {
          presenceData.details = privacy === 0
            ? 'Viewing division'
            : privacy === 1
              ? 'Viewing a division'
              : privacy === 2
                ? 'Viewing a page'
                : 'Browsing'
          presenceData.state = document.querySelector('.division-heading')?.textContent?.split(' ')?.[0]
          break
        }
        case pathname === '/contracts': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing all contracts'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
        case pathname.includes('/contracts'): {
          presenceData.details = privacy === 0
            ? 'Viewing contract'
            : privacy === 1
              ? 'Viewing a contract'
              : privacy === 2
                ? 'Viewing a page'
                : 'Browsing'
          presenceData.state = document.querySelector('h2')?.textContent?.split(' ')?.[0]
          break
        }
        case pathname === '/tours': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Exploring all tours'
            : privacy === 2
              ? 'Exploring a page'
              : 'Browsing'
          presenceData.smallImageKey = Assets.Reading
          presenceData.buttons = [{ label: 'View Tours', url: href }]
          break
        }
        case pathname === '/bank': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing the bank'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          presenceData.buttons = [{ label: 'View Bank', url: href }]
          break
        }
        case pathname === '/stats': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing the stats'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          presenceData.smallImageKey = Assets.Reading
          presenceData.buttons = [{ label: 'View Stats', url: href }]
          break
        }
        case pathname === '/ranks': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing the ranks'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          presenceData.smallImageKey = Assets.Reading
          presenceData.buttons = [{ label: 'View Ranks', url: href }]
          break
        }
        case pathname === '/cargomarket': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing the cargomarket'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          const sortedBy = document.querySelector('[aria-controls="radix-«rbh»"] > span')?.textContent
          presenceData.state = sortedBy ? `Sorted by: ${sortedBy}` : ''
          presenceData.smallImageKey = Assets.Reading
          presenceData.buttons = [{ label: 'View Cargomarket', url: href }]
          break
        }
        case pathname === '/marketplace': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing the cargomarket'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          const sortedBy = document.querySelector('[data-state="active"]')?.textContent
          presenceData.state = sortedBy !== 'All' ? `Filtered for: ${sortedBy}` : ''
          presenceData.smallImageKey = Assets.Reading
          presenceData.buttons = [{ label: 'View Marketplace', url: href }]
          break
        }
        case pathname === '/fleets': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing all fleets'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          presenceData.smallImageKey = Assets.Reading
          presenceData.buttons = [{ label: 'View Fleets', url: href }]
          break
        }
        case pathname === '/rules': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Read the rules'
            : privacy === 2
              ? 'Reading page'
              : 'Browsing'
          presenceData.smallImageKey = Assets.Reading
          presenceData.buttons = [{ label: 'Read The Rules', url: href }]
          break
        }
        case pathname === '/gallery': {
          const totalPages = document.querySelectorAll('.btn.log.gray')
          presenceData.details = privacy === 0
            ? `Viewing the gallery - Page ${document.querySelector('.btn.log.active')?.textContent}/${totalPages[totalPages.length - 1]?.textContent}`
            : privacy === 1
              ? 'Viewing images'
              : privacy === 2
                ? 'Viewing page'
                : 'Browsing'
          presenceData.buttons = [{ label: 'View Images', url: href }]
          break
        }
        case pathname === '/events': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing all events'
            : privacy === 2
              ? 'Viewing page'
              : 'Browsing'
          presenceData.buttons = [{ label: 'View All Events', url: href }]
          break
        }
        case pathname.includes('/events/'): {
          presenceData.details = privacy === 0
            ? 'Viewing event'
            : privacy === 1
              ? 'Viewing an event'
              : privacy === 2
                ? 'Viewing page'
                : 'Browsing'
          presenceData.state = document.querySelector('h3')?.textContent
          presenceData.buttons = [{ label: 'View Event', url: href }]
          break
        }
        case pathname === '/news': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing all news'
            : privacy === 2
              ? 'Viewing page'
              : 'Browsing'
          presenceData.buttons = [
            { label: 'View All News Articles', url: href },
          ]
          break
        }
        case pathname.includes('/news/'): {
          presenceData.details = privacy === 0
            ? 'Reading a news article about'
            : privacy === 1
              ? 'Reading an article'
              : privacy === 2
                ? 'Reading page'
                : 'Browsing'

          presenceData.state = document.querySelectorAll('div.flex.items-center.gap-2')?.[1]?.textContent
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = 'Reading'
          presenceData.buttons = [{ label: 'Read Article', url: href }]
        }
      }
      break
    }
    case 'shop.nexonlogistics.com': {
      presenceData.name = 'Nexon Logistics Shop'
      switch (true) {
        case pathname === '/index':
        case pathname === '':
        case pathname === '/': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing the homepage'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
        case pathname === '/product.html': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing all products'
            : privacy === 2
              ? 'Viewing page'
              : 'Browsing'
          break
        }
        case pathname === '/contact': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing the contact page'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
        case !!document.querySelector('.product_section'): {
          presenceData.details = privacy === 0
            ? 'Viewing product'
            : privacy === 1
              ? 'Viewing a product'
              : privacy === 2
                ? 'Viewing page'
                : 'Browsing'
          presenceData.state
            = document.querySelector('.product_section')?.textContent
          presenceData.buttons = [{ label: 'View Product', url: href }]
          presenceData.largeImageKey
            = document.querySelector<HTMLImageElement>('[alt="IMG-PRODUCT"]')
              ?.src ?? ActivityAssets.Logo
          break
        }
        case !!document.querySelector('.text-uppercase'):
        {
          presenceData.details = privacy === 0
            ? 'Reading article'
            : privacy === 1
              ? 'Reading an article'
              : privacy === 2
                ? 'Reading a page'
                : 'Browsing'
          presenceData.state = document
            .querySelector('.text-uppercase')
            ?.textContent
            ?.toLowerCase()
          presenceData.smallImageKey = Assets.Reading
          presenceData.buttons = [{ label: 'Read Article', url: href }]
          break
        }
      }
      break
    }
    case 'hub.nexonlogistics.com': {
      presenceData.name = 'Nexon Logistics Drivershub'
      switch (true) {
        case !!document.querySelector('#claimPointsModalLabel') && !document.querySelector('#claimPointsModalLabel')?.ariaHidden: {
          presenceData.state
            = privacy === 0 || privacy === 1
              ? 'Claiming their daily rewards'
              : privacy === 2
                ? 'Viewing a page'
                : 'Browsing'
          break
        }
        case pathname === '/banners': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing all banners'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
        case pathname === '/leaderboard': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing all leaderboards'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
        case pathname === '/members': {
          const memberSearch = document.querySelector<HTMLInputElement>('[type="search"]')?.value

          if (memberSearch) {
            presenceData.details = privacy === 0
              ? 'Searching members for:'
              : privacy === 1
                ? 'Searching members'
                : privacy === 2
                  ? 'Viewing a page'
                  : 'Browsing'
            presenceData.state = memberSearch
            presenceData.smallImageKey = Assets.Search
          }
          else {
            presenceData.details = privacy === 0 || privacy === 1
              ? 'Viewing all members'
              : privacy === 2
                ? 'Viewing a page'
                : 'Browsing'
          }
          break
        }
        case pathname === '/': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing the dashboard'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
        case pathname === '/events': {
          presenceData.details = privacy === 0
            ? 'Viewing all events for'
            : privacy === 1
              ? 'Viewing all events'
              : privacy === 2
                ? 'Viewing a page'
                : 'Browsing'
          presenceData.state = document.querySelector('.fc-toolbar-title')?.textContent
          break
        }
        case pathname === '/jobs': {
          const items = {
            menu: document.querySelector('.menu-item.open')?.textContent,
            submenu: document.querySelector('.menu-item.active')?.textContent,
          }
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing jobs'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          presenceData.state = items.menu && items.submenu ? `${items.menu} - ${items.submenu}` : items.menu ? `${items.menu}` : items.submenu ? `${items.submenu}` : 'Unknown menu'
          break
        }
        case pathname === '/tourbonus': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing the tourbonuses'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
        case pathname === '/standardtour': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing the standard tour'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
        case pathname === '/divisiontour': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing the division tour'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
        case pathname === '/tourstatistics': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing the division tour'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
        case pathname === '/accepthauls': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing hauls that can be accepted'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
        case pathname === '/validatetourreport': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing tours that can be validated'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
        case pathname === '/addaward': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing tours awards that can be added'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
        case pathname === '/addtour': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing tours awards that can be added'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
        case pathname === '/addcargo': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing tours cargo that can be added'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
        case pathname === '/xpbonus': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing tours bonus that can be set'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
      }
      break
    }
    case 'map.nexonlogistics.com': {
      presenceData.name = 'Nexon Logistics Map'
      switch (true) {
        case pathname === '':
        case pathname === '/': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing all maps'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
        case pathname.includes('/ets2'): {
          presenceData.details = privacy === 0
            ? 'Viewing the ETS2 map'
            : privacy === 1
              ? 'Viewing a map'
              : privacy === 2
                ? 'Viewing a page'
                : 'Browsing'
          break
        }
        case pathname.includes('/ats'): {
          presenceData.details = privacy === 0
            ? 'Viewing the ATS map'
            : privacy === 1
              ? 'Viewing a map'
              : privacy === 2
                ? 'Viewing a page'
                : 'Browsing'
          break
        }
        case pathname.includes('/tmp'): {
          presenceData.details = privacy === 0
            ? 'Viewing the TMP map'
            : privacy === 1
              ? 'Viewing a map'
              : privacy === 2
                ? 'Viewing a page'
                : 'Browsing'
          break
        }
        case pathname.includes('/ets2promods'): {
          presenceData.details = privacy === 0
            ? 'Viewing the ETS2 ProMods map'
            : privacy === 1
              ? 'Viewing a map'
              : privacy === 2
                ? 'Viewing a page'
                : 'Browsing'
          break
        }
        case pathname.includes('/atspromods'): {
          presenceData.details = privacy === 0
            ? 'Viewing the ATS ProMods map'
            : privacy === 1
              ? 'Viewing a map'
              : privacy === 2
                ? 'Viewing a page'
                : 'Browsing'
          break
        }
      }
      break
    }
    case 'nexonairlines.com': {
      presenceData.name = 'Nexon Airlines'
      switch (true) {
        case pathname === '':
        case pathname === '/': {
          presenceData.details = privacy === 0 || privacy === 1
            ? `Viewing ${document
              .querySelector('.active')
              ?.textContent
              ?.toLowerCase()}`
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
        case pathname === '/about': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing the about section'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
        case pathname === '/register': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing the registration form'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
        case !!document.querySelector('.active'): {
          presenceData.details = privacy === 0 || privacy === 1
            ? `Viewing ${document
              .querySelector('.active')
              ?.textContent
              ?.toLowerCase()}`
            : 'Viewing a page'
          break
        }
      }
      break
    }
    case 'hub.nexonairlines.com': {
      presenceData.name = 'Nexon Airlines Pilothub'
      switch (true) {
        case pathname === '':
        case pathname === '/': {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing the homepage'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
        case pathname.includes('/leaderboard'): {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing the leaderboard'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          presenceData.buttons = [{ label: 'View The Leaderboard', url: href }]
          break
        }
        case pathname.includes('/members'): {
          presenceData.details = privacy === 0 || privacy === 1
            ? 'Viewing all members'
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          presenceData.buttons = [{ label: 'View All Members', url: href }]
          break
        }
        case pathname.includes('/flights/'): {
          presenceData.details = privacy === 0
            ? 'Viewing flight'
            : privacy === 1
              ? 'Viewing a flight'
              : privacy === 2
                ? 'Viewing a page'
                : 'Browsing'
          presenceData.state = document.querySelector('h3')?.textContent
          presenceData.buttons = [{ label: 'View Flight', url: href }]
          break
        }
        case pathname.includes('/profile/'): {
          presenceData.largeImageKey
            = document.querySelector<HTMLImageElement>(
              '.user-avatar-section > div > img',
            )?.src ?? ActivityAssets.AirlinesLogo

          if (presenceData.largeImageKey !== ActivityAssets.AirlinesLogo)
            presenceData.smallImageKey = ActivityAssets.AirlinesLogo

          presenceData.details = privacy === 0
            ? 'Viewing the profile of'
            : privacy === 1
              ? 'Viewing a profile'
              : privacy === 2
                ? 'Viewing a page'
                : 'Browsing'
          presenceData.state = document.querySelector('h4')?.textContent
          presenceData.buttons = [{ label: 'View Profile', url: href }]
          break
        }
        case !!document.querySelector('.active'): {
          presenceData.details = privacy === 0 || privacy === 1
            ? `Viewing ${document
              .querySelector('.active')
              ?.textContent
              ?.toLowerCase()}`
            : privacy === 2
              ? 'Viewing a page'
              : 'Browsing'
          break
        }
      }
      break
    }
  }
  if (
    privacy === 3
    && presenceData.smallImageKey
    && presenceData.smallImageText
  ) {
    delete presenceData.smallImageText
    delete presenceData.smallImageKey
  }

  if (privacy === 3 && presenceData.smallImageKey)
    delete presenceData.smallImageKey

  if (privacy !== 0 && presenceData.state)
    delete presenceData.state

  if ((!buttons || privacy !== 0) && presenceData.buttons)
    delete presenceData.buttons

  if (
    (!showCover || privacy !== 0)
    && !ActivityAssets[presenceData.largeImageKey as keyof typeof ActivityAssets]
  ) {
    presenceData.largeImageKey = hostname.includes('airlines')
      ? ActivityAssets.AirlinesLogo
      : ActivityAssets.Logo
  }
  presence.setActivity(presenceData)
})
