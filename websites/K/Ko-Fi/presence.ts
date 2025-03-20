const presence = new Presence({
  clientId: '855316349655711744',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/K/Ko-Fi/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  if (document.location.pathname === '/') {
    presenceData.details = 'Viewing the home page.'
  }
  else if (document.location.pathname.startsWith('/dashboard/')) {
    presenceData.details = 'Managing the settings of:'
    presenceData.state = document
      .querySelector(
        'body > div.app > header > ul.navbar-nav.ml-auto.d-none.d-sm-inline-block > div > div',
      )
      ?.textContent
      ?.trim()
  }
  else if (
    document.location.pathname.toLowerCase().startsWith('/account/register')
  ) {
    presenceData.details = 'Registering...'
  }
  else if (
    document.location.pathname.toLowerCase().startsWith('/account/login')
    || document.location.pathname
      .toLowerCase()
      .startsWith('/account/externallogincallback')
  ) {
    presenceData.details = 'Logining in...'
  }
  else if (document.location.pathname.toLowerCase().startsWith('/account/')) {
    presenceData.details = 'Setting up account...'
  }
  else if (document.location.pathname.startsWith('/gold')) {
    presenceData.details = 'Viewing the Gold plan.'
  }
  else if (document.location.pathname.startsWith('/art')) {
    presenceData.details = 'Viewing art creations.'
  }
  else if (document.location.pathname.startsWith('/cosplay')) {
    presenceData.details = 'Viewing cosplay creations.'
  }
  else if (document.location.pathname.startsWith('/commissionsopen')) {
    presenceData.details = 'Viewing open commissions.'
  }
  else if (
    document.location.pathname.toLowerCase().startsWith('/home/featured')
  ) {
    presenceData.details = 'Viewing featured creators.'
  }
  else if (document.location.pathname.toLowerCase() === '/explore') {
    presenceData.details = 'Viewing the explore page.'
  }
  else if (document.location.pathname.toLowerCase().startsWith('/blog/')) {
    presenceData.details = 'Creating a blog post...'
  }
  else if (document.location.pathname.toLowerCase().startsWith('/manage')) {
    presenceData.details = 'Managing Ko-Fi'
  }
  else if (document.location.pathname.toLowerCase().startsWith('/settings')) {
    presenceData.details = 'Adjusting user settings...'
  }
  else if (document.location.pathname.toLowerCase().startsWith('/newsfeed')) {
    presenceData.details = 'Viewing the newsfeed...'
  }
  else if (
    document.location.pathname.toLowerCase().startsWith('/my-supporters')
  ) {
    presenceData.details = 'Viewing supporters...'
  }
  else if (document.location.pathname.toLowerCase().startsWith('/streamalerts')) {
    presenceData.details = 'Viewing stream alerts.'
  }
  else if (document.location.pathname.toLowerCase().startsWith('/shop')) {
    presenceData.details = 'Viewing shop.'
  }
  else if (document.location.pathname.toLowerCase() === '/about') {
    presenceData.details = 'Viewing Ko-Fi\'s About Page'
  }
  else if (document.location.pathname.toLowerCase().startsWith('/s/')) {
    try {
      presenceData.details = `Viewing ${document
        .querySelector(
          '#shop-item-detail > div > div.kfds-lyt-between-algn-top-row-to-col.kfds-c-sticky > div.sidebar.kfds-c-sticky-wrapper.kfds-c-order-2.kfds-c-shop-detail-wrapper > div.kfds-lyt-width-100.kfds-c-lyt-pdg-16-24.kfds-c-shop-detail-column-control > span',
        )
        ?.textContent
        ?.trim()}`
      presenceData.state = `By ${document
        .querySelector(
          '#shop-item-detail > div > div.kfds-lyt-between-algn-top-row-to-col.kfds-c-sticky > div.sidebar.kfds-c-sticky-wrapper.kfds-c-order-2.kfds-c-shop-detail-wrapper > div.kfds-lyt-width-100.kfds-c-lyt-pdg-16-24.kfds-c-shop-detail-column-control > div > a > div > span:nth-child(1)',
        )
        ?.textContent
        ?.trim()}`
      presenceData.buttons = [
        {
          label: 'View Item',
          url: `https://ko-fi.com/s/${
            document.location.pathname.split('/')[2]
          }?ref=premid_discord_presence`,
        },
      ]
    }
    catch {
      presenceData.details = 'Viewing a shop item.'
    }
  }
  else if (document.location.pathname.toLowerCase().startsWith('/summary')) {
    presenceData.details = 'Viewing payment summary.'
  }
  else if (
    document.location.pathname.toLowerCase().startsWith('/home/coffeeshop')
  ) {
    presenceData.details = 'Just bought someone coffee!'
  }
  else if (document.location.pathname.toLowerCase().startsWith('/home/about')) {
    presenceData.details = 'Viewing Ko-Fi\'s About Page'
  }
  else if (document.location.pathname.toLowerCase().startsWith('/home')) {
    presenceData.details = 'Viewing the home page.'
  }
  else if (document.location.pathname.toLowerCase().startsWith('/post')) {
    presenceData.details = 'Viewing a post.'
    try {
      presenceData.details = 'Viewing a post:'
      presenceData.state = document
        .querySelector(
          '#body-content > div > div.wrapper.wrapper-content.article > div > div > div > div > div:nth-child(4) > div > h1',
        )
        ?.textContent
        ?.trim()
      presenceData.buttons = [
        {
          label: 'View Post',
          url: `https://ko-fi.com/post/${
            document.location.pathname.split('/')[2]
          }?ref=premid_discord_presence`,
        },
      ]
    }
    catch {
      presenceData.details = 'Viewing a post.'
    }
  }
  else if (document.location.pathname.toLowerCase().startsWith('/album')) {
    try {
      const user = document
        .querySelector(
          '#body-content > div > div > div:nth-child(2) > div > a > name',
        )
        ?.textContent
        ?.trim()
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
  else if (document.location.pathname.toLowerCase() === '/404.html') {
    presenceData.details = 'Oh No! Page Not Found.'
  }
  else {
    try {
      const user = document
        .querySelector(
          '#profile-header-v2 > div > div.kfds-lyt-column.kfds-lyt-width-100.kfds-c-header-showmobile-at-736 > div.kfds-lyt-row-start.kfds-lyt-width-100 > div > div.kfds-font-size-22.kfds-font-bold > span',
        )
        ?.textContent
        ?.trim()
      const userSplit = document.location.pathname.split('/')
      // userFixed = user.toLowerCase().split(" ").join("");
      // console.log(userFixed)

      if (user !== 'undefined') {
        presenceData.details = 'Viewing this users page:'
        presenceData.state = user
        presenceData.buttons = [
          {
            label: 'View Page',
            url: `https://ko-fi.com/${userSplit[1]}?ref=premid_discord_presence`,
          },
        ]
      }

      if (document.location.pathname.startsWith(`/${userSplit[1]}/gallery`))
        presenceData.details = 'Viewing this users gallery:'
      else if (document.location.pathname.startsWith(`/${userSplit[1]}/posts`))
        presenceData.details = 'Viewing this users posts:'
      else if (document.location.pathname.startsWith(`/${userSplit[1]}/shop`))
        presenceData.details = 'Viewing this users shop:'
      else if (
        document.location.pathname.startsWith(`/${userSplit[1]}/commissions`)
      )
        presenceData.details = 'Viewing this users commissions:'
      else if (document.location.pathname.startsWith(`/${userSplit[1]}/tiers`))
        presenceData.details = 'Viewing this users tier options:'
    }
    catch {
      presenceData.details = 'Viewing an unsupported page.'
    }
  }

  presence.setActivity(presenceData)
})
