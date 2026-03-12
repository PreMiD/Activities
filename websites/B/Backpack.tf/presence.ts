const presence = new Presence({
  clientId: '850295838361649153',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/B/Backpack.tf/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  if (document.location.pathname === '/') {
    presenceData.details = 'Viewing Main page'
  }
  else if (document.location.pathname.includes('/overview/')) {
    presenceData.largeImageKey = (
      document.querySelector(
        'head > meta[property=\'og:image\']',
      ) as HTMLMetaElement
    ).content
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.details = 'Viewing item stats:'
    presenceData.state = (
      document.querySelector(
        '#page-content > div:nth-child(1) > div.stats-body > div > h1',
      ) as HTMLHeadingElement
    ).textContent
    presenceData.buttons = [
      {
        label: 'View the Stats',
        url: document.URL,
      },
    ]
  }
  else if (document.location.pathname.includes('/stats/')) {
    if (
      document.location.pathname.includes(
        'Unique/Mann%20Co.%20Supply%20Crate%20Key',
      )
    ) {
      presenceData.details = 'Viewing Key price:'
      presenceData.state = `${
        (
          document.querySelector(
            '#page-content > div.row > div.col-md-8.stats-panel.stats-header-panel > div.stats-body > div.stats-subheader > div.price-boxes > a:nth-child(1) > div.text > div.textContent',
          ) as HTMLDivElement
        ).textContent
      } | ${
        (
          document.querySelector(
            '#page-content > div.row > div.col-md-8.stats-panel.stats-header-panel > div.stats-body > div.stats-subheader > div.price-boxes > a:nth-child(2) > div.text > div.textContent',
          ) as HTMLDivElement
        ).textContent
      }`
    }
    else if (document.location.pathname.includes('Unique/Earbuds')) {
      presenceData.details = 'Viewing Earbuds price:'
      presenceData.state = `${
        (
          document.querySelector(
            '#page-content > div.row > div.col-md-8.stats-panel.stats-header-panel > div.stats-body > div.stats-subheader > div.price-boxes > a:nth-child(1) > div.text > div.textContent',
          ) as HTMLDivElement
        ).textContent
      } | ${
        (
          document.querySelector(
            '#page-content > div.row > div.col-md-8.stats-panel.stats-header-panel > div.stats-body > div.stats-subheader > div.price-boxes > a:nth-child(2) > div.text > div.textContent',
          ) as HTMLDivElement
        ).textContent
      }`
    }
    else if (document.location.pathname === '/stats') {
      presenceData.details = 'Browsing through:'
      presenceData.state = 'Team Fortress 2 Items'
    }
    else {
      presenceData.details = 'Viewing item:'
      presenceData.smallImageKey = ActivityAssets.Logo
      presenceData.smallImageText = 'Backpack.tf Item stats'
      presenceData.largeImageKey = (
        document.querySelector(
          'head > meta[property=\'og:image\']',
        ) as HTMLMetaElement
      ).content
      presenceData.buttons = [
        {
          label: 'View the Item',
          url: document.URL,
        },
      ]
      presenceData.state = (
        document.querySelector(
          '#page-content > div.row > div.col-md-8.stats-panel.stats-header-panel > div.stats-body > div.stats-header > div.stats-header-item > div.stats-header-title',
        ) as HTMLDivElement
      ).textContent
    }
  }
  else if (document.location.pathname.includes('/category')) {
    presenceData.details = 'Browsing through Team Fortress 2 Items'
    if (document.location.pathname === '/category/slots') {
      presenceData.state = 'Items by Slot'
    }
    else if (document.location.pathname.includes('/slot/')) {
      presenceData.details = 'Viewing item:'
      presenceData.state = document.querySelector(
        '#page-content > div > div.stats-body > div.stats-header > p',
      )?.textContent
    }
    else if (document.location.pathname === '/category/classes') {
      presenceData.state = 'Items by Class'
    }
    else if (document.location.pathname.includes('/class/')) {
      presenceData.details = 'Viewing item:'
      presenceData.state = document.querySelector(
        '#page-content > div > div.stats-body > div.stats-header > p',
      )?.textContent
    }
    else {
      presenceData.details = 'This page doesn\'t exist you know :/'
    }
  }
  else if (document.location.pathname.includes('/u/')) {
    presenceData.details = 'Viewing a profile page:'
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.largeImageKey = (
      document.querySelector(
        '#page-content > div.panel.panel-main.user-panel- > div.panel-body > div > div.information > div.avatar-container > a > img',
      ) as HTMLImageElement
    ).src
    presenceData.state = (
      document.querySelector(
        'head > meta[property=\'og:title\']',
      ) as HTMLMetaElement
    ).content
    presenceData.buttons = [
      {
        label: 'View the Profile',
        url: document.URL,
      },
    ]
  }
  else if (document.location.pathname.includes('/profiles/')) {
    presenceData.details = 'Viewing a profile page:'
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.largeImageKey = (
      document.querySelector(
        '#page-content > div.panel.panel-main.user-panel- > div.panel-body > div > div.information > div.avatar-container > a > img',
      ) as HTMLImageElement
    ).src
    presenceData.state = (
      document.querySelector(
        'head > meta[property=\'og:title\']',
      ) as HTMLMetaElement
    ).content
    presenceData.buttons = [
      {
        label: 'View the Profile',
        url: document.URL,
      },
    ]
  }
  else if (document.location.pathname.includes('/friends/')) {
    presenceData.details = 'Viewing a profile page:'
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.largeImageKey = (
      document.querySelector(
        '#page-content > div.panel.panel-main.user-panel- > div.panel-body > div > div.information > div.avatar-container > a > img',
      ) as HTMLImageElement
    ).src
    presenceData.state = (
      document.querySelector(
        'head > meta[property=\'og:title\']',
      ) as HTMLMetaElement
    ).content
    presenceData.buttons = [
      {
        label: 'View the Profile',
        url: document.URL,
      },
    ]
  }
  else if (document.location.pathname.includes('/unusual/')) {
    presenceData.details = 'Viewing Unusual Pricelist:'
    presenceData.state = (
      document.querySelector('head > title') as HTMLHeadElement
    ).textContent
  }
  else if (document.location.pathname.includes('/effect/')) {
    presenceData.details = 'Viewing Unusual Effects Pricelist:'
    presenceData.state = (
      document.querySelector('head > title') as HTMLHeadElement
    ).textContent
  }
  else if (document.location.pathname.includes('/item/')) {
    presenceData.details = `Viewing ${
      (
        document.querySelector(
          '#page-content > div > div > div > div.panel-heading > span:nth-child(1)',
        ) as HTMLSpanElement
      ).textContent
    }:`
    presenceData.state = (
      document.querySelector(
        '#page-content > div > div > div > div.panel-body > div > div.item-wrapper > div.item-text > h2',
      ) as HTMLHeadingElement
    ).textContent
  }
  else if (document.location.pathname.includes('/settings')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Settings'
  }
  else if (document.location.pathname.includes('/alerts')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Alerts'
  }
  else if (document.location.pathname.includes('/notifications')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Notifications'
  }
  else if (document.location.pathname.includes('/connections')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Connections'
  }
  else if (document.location.pathname.includes('/payments')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Payment History'
  }
  else if (document.location.pathname.includes('/award-tickets')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Tickets'
  }
  else if (document.location.pathname.includes('/donate')) {
    presenceData.details = 'Viewing Donation page'
  }
  else if (document.location.pathname.includes('/premium/subscribe')) {
    presenceData.details = 'Viewing Premium subscription'
  }
  else if (document.location.pathname.includes('/premium/search')) {
    presenceData.details = 'Using the Premium Search'
  }
  else if (document.location.pathname.includes('/pricelist')) {
    presenceData.details = 'Viewing Community Pricelist'
    presenceData.state = 'Pricegrid view'
  }
  else if (document.location.pathname.includes('/spreadsheet')) {
    presenceData.details = 'Viewing Community Pricelist'
    presenceData.state = 'Spreadsheet view'
  }
  else if (document.location.pathname.includes('/vote')) {
    presenceData.details = 'Browsing Suggestions'
  }
  else if (document.location.pathname.includes('/latest')) {
    presenceData.details = 'Viewing the Latest Price Updates'
  }
  else if (document.location.pathname.includes('/unusuals')) {
    presenceData.details = 'Viewing Unusual Pricelist'
    presenceData.state = 'Browsing by Item'
  }
  else if (document.location.pathname.includes('/effects')) {
    presenceData.details = 'Viewing Unusual Pricelist'
    presenceData.state = 'Browse by Effect'
  }
  else if (document.location.pathname.includes('/market')) {
    presenceData.details = 'Searching through:'
    presenceData.state = 'Steam Community Market Pricelist'
  }
  else if (document.location.pathname.includes('/classifieds')) {
    presenceData.details = 'Searching through:'
    presenceData.state = 'Classified Listings'
    presenceData.buttons = [
      {
        label: 'View the Classifieds',
        url: document.URL,
      },
    ]
  }
  else if (document.location.pathname.includes('/suggestion/')) {
    presenceData.details = 'Searching through:'
    presenceData.state = 'Price Suggestions'
    presenceData.buttons = [
      {
        label: 'View the Suggestions',
        url: document.URL,
      },
    ]
  }
  else if (document.location.pathname.includes('/about')) {
    presenceData.details = 'Viewing page:'
    presenceData.state = 'About backpack.tf'
  }
  else if (document.location.pathname.includes('/issues')) {
    presenceData.details = 'Viewing page:'
    presenceData.state = 'Issue tracker'
  }
  else if (document.location.pathname.includes('/calculator')) {
    presenceData.details = 'Useing Calculator'
  }
  else if (document.location.pathname.includes('/top/backpacks')) {
    presenceData.details = 'Viewing Top Backpacks'
  }
  else if (document.location.pathname.includes('/top/donators')) {
    presenceData.details = 'Viewing Top Donators'
  }
  else if (document.location.pathname.includes('/top/generous')) {
    presenceData.details = 'Viewing Top Gifters'
  }
  else if (document.location.pathname.includes('/top/contributors')) {
    presenceData.details = 'Viewing Top Contributors'
  }
  else if (document.location.pathname.includes('/developer')) {
    presenceData.details = 'Viewing Develoapers page'
  }
  else if (document.location.pathname.includes('/help')) {
    presenceData.details = 'Viewing help center'
  }
  else if (document.location.pathname.includes('/rules')) {
    presenceData.details = 'Reading rules'
  }
  else if (document.location.pathname.includes('/servers')) {
    presenceData.details = 'Viewing servers with backpack.tf plugin'
  }
  else if (document.location.pathname.includes('/top/accurate')) {
    presenceData.details = 'Viewing The Most Accurate Users'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
