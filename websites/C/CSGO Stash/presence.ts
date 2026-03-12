const presence = new Presence({
  clientId: '918832169823125555',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/CSGO%20Stash/assets/logo.png',
  Skins = 'https://cdn.rcd.gg/PreMiD/websites/C/CSGO%20Stash/assets/0.png',
  Case = 'https://cdn.rcd.gg/PreMiD/websites/C/CSGO%20Stash/assets/1.png',
  Sticker = 'https://cdn.rcd.gg/PreMiD/websites/C/CSGO%20Stash/assets/2.png',
  Glove = 'https://cdn.rcd.gg/PreMiD/websites/C/CSGO%20Stash/assets/3.png',
  Items = 'https://cdn.rcd.gg/PreMiD/websites/C/CSGO%20Stash/assets/4.png',
}

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    details: 'Browsing...',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const shortTitle = document.title.substring(
    0,
    document.title.lastIndexOf('-') - 1,
  )
  const path = document.location.pathname
  const priceLeft = document.querySelector<HTMLSpanElement>(
    '#prices > div:nth-child(2) > a > span.pull-left',
  )
  const priceRight = document.querySelector<HTMLSpanElement>(
    '#prices > div:nth-child(2) > a > span.pull-right',
  )
  const priceMiddle = document.querySelector<HTMLAnchorElement>(
    'a.btn.btn-default.market-button-item',
  )
  const steamPrice = document.querySelector<HTMLSpanElement>(
    'div.col-md-6.col-md-6-collapse-top-margin > div:nth-child(2) > a > span.pull-right',
  )
  const middleImage = document.querySelector<HTMLImageElement>(
    'div.col-md-8.col-widen > div > div:nth-child(2) > div:nth-child(1) > img',
  )
  const leftImage = document.querySelector<HTMLImageElement>(
    'body > div.container.main-content > div:nth-child(3) > div > div:nth-child(1) > a > img',
  )

  if (path.startsWith('/skin')) {
    presenceData.details = `Viewing: ${shortTitle}`
    presenceData.state = `${priceLeft?.textContent}: ${priceRight?.textContent}`
    presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
      'a.image-popup-vertical-fit.misc-click > img',
    )?.src
    presenceData.buttons = [{ label: 'View Skin', url: document.URL }]
  }
  else if (path.startsWith('/weapon')) {
    presenceData.details = 'Browsing weapon skins'
    presenceData.state = shortTitle
    presenceData.smallImageKey = ActivityAssets.Skins
    presenceData.smallImageText = 'Viewing skins'
  }
  else if (path.startsWith('/skin-rarity')) {
    presenceData.details = 'Viewing a skin rarity catalog'
    presenceData.state = shortTitle
    presenceData.smallImageKey = ActivityAssets.Skins
    presenceData.smallImageText = 'Viewing skins'
  }
  else if (path.startsWith('/case')) {
    presenceData.details = `Viewing case: ${shortTitle}`
    presenceData.state = priceMiddle?.textContent
    presenceData.largeImageKey = leftImage?.src
    presenceData.buttons = [{ label: 'View Case', url: document.URL }]
  }
  else if (path.startsWith('/containers')) {
    presenceData.details = 'Browsing containers'
    presenceData.state = shortTitle
    presenceData.smallImageKey = ActivityAssets.Case
    presenceData.smallImageText = 'Viewing containers'
  }
  else if (path.startsWith('/collection')) {
    presenceData.details = 'Viewing a skin collection'
    presenceData.state = shortTitle
  }
  else if (path.startsWith('/sticker')) {
    if (path.startsWith('/stickers/tournament')) {
      presenceData.details = 'Browsing tournament stickers'
      presenceData.state = shortTitle
    }
    else if (path.startsWith('/stickers/community')) {
      presenceData.details = 'Browsing community stickers'
      presenceData.state = shortTitle
    }
    else if (path.startsWith('/stickers/capsule')) {
      delete presenceData.smallImageKey
      delete presenceData.smallImageText
      presenceData.details = `Viewing the ${shortTitle}`
      presenceData.state = priceMiddle?.textContent
      presenceData.largeImageKey = leftImage?.src
      presenceData.buttons = [{ label: 'View Capsule', url: document.URL }]
    }
    else if (path.startsWith('/sticker/regular')) {
      presenceData.details = 'Browsing stickers'
    }
    else {
      presenceData.details = `Viewing sticker: ${shortTitle}`
      presenceData.state = `Steam price: ${steamPrice?.textContent}`
      presenceData.largeImageKey = middleImage?.src
      presenceData.smallImageKey = ActivityAssets.Sticker
      presenceData.smallImageText = 'Viewing stickers'
      presenceData.buttons = [{ label: 'View Sticker', url: document.URL }]
    }
  }
  else if (path.startsWith('/glove')) {
    if (path === '/gloves') {
      presenceData.details = 'Browsing gloves'
      presenceData.smallImageKey = ActivityAssets.Glove
      presenceData.smallImageText = 'Viewing gloves'
    }
    else {
      presenceData.details = `Viewing glove: ${shortTitle}`
      presenceData.state = `${priceLeft?.textContent}: ${priceRight?.textContent}`
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
        'div.well.result-box.nomargin > img',
      )?.src
      presenceData.buttons = [{ label: 'View Glove', url: document.URL }]
    }
  }
  else if (path.startsWith('/agent')) {
    if (path === '/agents') {
      presenceData.details = 'Browsing agents'
    }
    else if (path.startsWith('/agents')) {
      presenceData.details = 'Browsing agents'
      presenceData.state = shortTitle
    }
    else {
      presenceData.details = `Viewing agent: ${shortTitle}`
      presenceData.state = `Steam price: ${steamPrice?.textContent}`
      presenceData.largeImageKey = middleImage?.src
      presenceData.buttons = [{ label: 'View Agent', url: document.URL }]
    }
  }
  else if (path.startsWith('/patch')) {
    if (path.startsWith('/patches')) {
      presenceData.details = 'Browsing patches'
      presenceData.state = shortTitle
    }
    else {
      presenceData.details = `Viewing patch: ${shortTitle}`
      presenceData.state = `Steam price: ${steamPrice?.textContent}`
      presenceData.largeImageKey = middleImage?.src
      presenceData.buttons = [{ label: 'View Patch', url: document.URL }]
    }
  }
  else if (path.startsWith('/graffiti')) {
    if (path === '/graffiti') {
      presenceData.details = 'Browsing graffitis'
    }
    else if (path.startsWith('/graffiti/collection')) {
      presenceData.details = 'Browsing graffiti collection'
      presenceData.state = shortTitle
    }
    else if (path.startsWith('/graffiti/tournament')) {
      presenceData.details = 'Browsing tournament graffitis'
      presenceData.state = shortTitle
    }
    else if (path.startsWith('/graffiti/box')) {
      presenceData.details = `Viewing graffiti box: ${shortTitle}`
      presenceData.state = `Steam price: ${priceMiddle?.textContent}`
      presenceData.largeImageKey = leftImage?.src
      presenceData.buttons = [
        { label: 'View Graffiti Box', url: document.URL },
      ]
    }
    else {
      presenceData.details = `Viewing graffiti: ${shortTitle}`
      presenceData.state = `Steam price: ${steamPrice?.textContent}`
      presenceData.largeImageKey = middleImage?.src
      presenceData.buttons = [{ label: 'View Graffiti', url: document.URL }]
    }
  }
  else if (path.startsWith('/item')) {
    if (path === '/items') {
      presenceData.details = 'Browsing items'
      presenceData.smallImageKey = ActivityAssets.Items
      presenceData.smallImageText = 'Viewing items'
    }
    else {
      presenceData.details = `Viewing item: ${shortTitle}`
      presenceData.state = `Steam price: ${steamPrice?.textContent}`
      presenceData.largeImageKey = middleImage?.src
      presenceData.buttons = [{ label: 'View Item', url: document.URL }]
    }
  }
  else if (path.includes('google-search')) {
    presenceData.details = 'Searching for:'
    presenceData.state = document.querySelector(
      'span.gcsc-find-more-on-google-query',
    )?.textContent
  }
  else if (document.location.href === 'https://csgostash.com') {
    presenceData.details = 'Home page'
  }

  presence.setActivity(presenceData)
})
