const presence = new Presence({
  clientId: '855316349655711744',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/K/Ko-Fi/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  const { pathname, href } = document.location
  const buttons = await presence.getSetting<boolean>('buttons')

  if (pathname === '/') {
    presenceData.details = 'Viewing the home page.'
  }
  else if (pathname.startsWith('/dashboard/')) {
    presenceData.details = 'Managing the settings of:'
    presenceData.state = document.querySelector('body > div.app > header > ul.navbar-nav.ml-auto.d-none.d-sm-inline-block > div > div')?.textContent?.trim()
  }
  else if (pathname.toLowerCase().startsWith('/account/register')) {
    presenceData.details = 'Registering...'
  }
  else if (pathname.toLowerCase().startsWith('/account/login') || pathname.toLowerCase().startsWith('/account/externallogincallback')) {
    presenceData.details = 'Logining in...'
  }
  else if (pathname.toLowerCase().startsWith('/account/')) {
    presenceData.details = 'Setting up account...'
  }
  else if (pathname.startsWith('/gold')) {
    presenceData.details = 'Viewing the Gold plan.'
  }
  else if (pathname.startsWith('/art')) {
    presenceData.details = 'Viewing art creations.'
  }
  else if (pathname.startsWith('/cosplay')) {
    presenceData.details = 'Viewing cosplay creations.'
  }
  else if (pathname.startsWith('/commissionsopen')) {
    presenceData.details = 'Viewing open commissions.'
  }
  else if (pathname.toLowerCase().startsWith('/home/featured')) {
    presenceData.details = 'Viewing featured creators.'
  }
  else if (pathname.toLowerCase() === '/explore') {
    presenceData.details = 'Viewing the explore page.'
  }
  else if (pathname.toLowerCase().startsWith('/blog/')) {
    presenceData.details = 'Creating a blog post...'
  }
  else if (pathname.toLowerCase().startsWith('/manage')) {
    presenceData.details = 'Managing Ko-Fi'
  }
  else if (pathname.toLowerCase().startsWith('/settings') || pathname.toLowerCase().startsWith("/discord/settings")) {
    presenceData.details = 'Adjusting user settings...'
  }
  else if (pathname.toLowerCase().startsWith('/newsfeed') || pathname.toLowerCase().startsWith("/feed")) {
    presenceData.details = 'Viewing the newsfeed...'
  }
  else if (pathname.toLowerCase().startsWith('/my-supporters')) {
    presenceData.details = 'Viewing supporters...'
  }
  else if (pathname.toLowerCase().startsWith('/messages')) {
    presenceData.details = 'Viewing messages...'
  }
  else if (pathname.toLowerCase().startsWith('/streamalerts')) {
    presenceData.details = 'Viewing stream alerts.'
  }
  else if (pathname.toLowerCase().startsWith('/promote')) {
    presenceData.details = 'Viewing promote page.'
  }
  else if (pathname.toLowerCase().startsWith('/discount')) {
    presenceData.details = 'Viewing discounts page.'
  }
  else if (pathname.toLowerCase().startsWith('/memberships/settings')) {
    presenceData.details = 'Adjusting membership settings...'
  }
  else if (pathname.toLowerCase().startsWith('/shop')) {
    presenceData.details = 'Viewing shop.'
  }
  else if (pathname.toLowerCase() === '/about') {
    presenceData.details = 'Viewing Ko-Fi\'s About Page'
  }
  else if (pathname.toLowerCase().startsWith('/s/')) {
    try {
      presenceData.details = `Viewing ${document.querySelector('#shop-item-detail > div > div.kfds-lyt-between-algn-top-row-to-col.kfds-c-sticky > div.sidebar.kfds-c-sticky-wrapper.kfds-c-order-2.kfds-c-shop-detail-wrapper > div.kfds-lyt-width-100.kfds-c-lyt-pdg-16-24.kfds-c-shop-detail-column-control > span')?.textContent?.trim()}`
      presenceData.state = `By ${document.querySelector('#body-content font')?.textContent?.trim()}`

      if (buttons) {
        presenceData.buttons = [
          {
            label: 'View Item',
            url: href
          }
        ]
      }
    }
    catch {
      presenceData.details = 'Viewing a shop item.'
    }
  }
  else if (pathname.toLowerCase().startsWith('/summary')) {
    presenceData.details = 'Viewing payment summary.'
  }
  else if (pathname.toLowerCase().startsWith('/home/coffeeshop')) {
    presenceData.details = 'Just bought someone coffee!'
  }
  else if (pathname.toLowerCase().startsWith('/home/about')) {
    presenceData.details = 'Viewing Ko-Fi\'s About Page'
  }
  else if (pathname.toLowerCase().startsWith('/home')) {
    presenceData.details = 'Viewing the home page.'
  }
  else if (pathname.toLowerCase().startsWith('/post')) {
    presenceData.details = 'Viewing a post.'
    try {
      presenceData.details = 'Viewing a post:'
      presenceData.state = document.querySelector('h1')?.textContent?.trim()

      if (buttons) {
        presenceData.buttons = [
          {
            label: 'View Post',
            url: href,
          }
        ]
      }
    }
    catch {
      presenceData.details = 'Viewing a post.'
    }
  }
  else if (pathname.toLowerCase().startsWith('/album')) {
    try {
      const user = document.querySelector('name')?.textContent?.trim()
      presenceData.details = 'Viewing an album.'
      if (user !== 'undefined') {
        presenceData.details = 'Viewing a users album:'
        presenceData.state = user
      }
    }
    catch {
      presenceData.details = 'Viewing an album.'
    }
  }
  else if (pathname.toLowerCase().startsWith("/polls")) {
    try {
      const user = document.querySelector('name')?.textContent?.trim()
      presenceData.details = 'Viewing an poll.'

      if (buttons) {
        presenceData.buttons = [
          {
            label: 'View Poll',
            url: href,
          }
        ]
      }
      if (user !== 'undefined') {
        presenceData.details = 'Viewing a users poll:'
        presenceData.state = user
      }
    } catch {
      presenceData.details = 'Viewing an poll.'
    }
  }
  else if (pathname.toLowerCase() === '/404.html') {
    presenceData.details = 'Oh No! Page Not Found.'
  }
  else {
    try {
      const user = document.querySelector('#displayName')?.textContent?.trim()
      const userSplit = pathname.split('/')[1]

      if (user !== 'undefined') {
        presenceData.details = 'Viewing this users page:'
        presenceData.state = user

        if (buttons) {
          presenceData.buttons = [
            {
              label: 'View Page',
              url: `https://ko-fi.com/${userSplit}`,
            }
          ]
        }
      }

      if (pathname.startsWith(`/${userSplit}/gallery`))
        presenceData.details = 'Viewing this users gallery:'
      else if (pathname.startsWith(`/${userSplit}/posts`))
        presenceData.details = 'Viewing this users posts:'
      else if (pathname.startsWith(`/${userSplit}/shop`))
        presenceData.details = 'Viewing this users shop:'
      else if (pathname.startsWith(`/${userSplit}/commissions`))
        presenceData.details = 'Viewing this users commissions:'
      else if (pathname.startsWith(`/${userSplit}/tiers`))
        presenceData.details = 'Viewing this users tier options:'
    }
    catch {
      presenceData.details = 'Viewing an unsupported page.'
    }
  }

  presence.setActivity(presenceData)
})
