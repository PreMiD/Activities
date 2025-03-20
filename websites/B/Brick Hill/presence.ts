const presence = new Presence({
  clientId: '797879854343127040',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey:
      'https://cdn.rcd.gg/PreMiD/websites/B/Brick%20Hill/assets/logo.png',
    details: 'Viewing Page:',
    state: '404',
    startTimestamp: browsingTimestamp,
  }

  // Main Presence
  if (
    document.location.pathname === '/'
    || document.location.pathname === '/dashboard'
  ) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Dashboard'
  }
  else if (document.location.pathname.includes('/login/')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Login'
  }
  else if (document.location.pathname.includes('/register/')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Register'
  }
  else if (document.location.pathname.includes('/play/')) {
    if (document.location.pathname === '/play/') {
      presenceData.details = 'Viewing Page:'
      presenceData.state = 'Games'
    }
    else {
      presenceData.details = 'Viewing Game:'
      presenceData.state = document.querySelector(
        'body > div.main-holder.grid > div:nth-child(2) > div:nth-child(1) > div.top.blue',
      )?.textContent
    }
  }
  else if (document.location.pathname.includes('/clans/')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Clans'
  }
  else if (document.location.pathname.includes('/clan/')) {
    presenceData.details = 'Viewing Clan:'
    presenceData.state = document.querySelector(
      'body > div.main-holder.grid > div:nth-child(2) > div.card > div.top > span',
    )?.textContent
  }
  else if (document.location.pathname.includes('/search/')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Search'
  }
  else if (document.location.pathname.includes('/user/')) {
    presenceData.details = 'Viewing User:'
    presenceData.state = document.querySelector(
      'body > div.main-holder.grid > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div > span.ellipsis',
    )?.textContent
  }
  else if (document.location.pathname === '/forum/') {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Forum'
  }
  else if (document.location.pathname.includes('/membership/')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Membership'
  }
  else if (document.location.pathname.includes('/customize/')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Avatar'
  }
  else if (document.location.pathname.includes('/client/')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Download'
  }
  else if (document.location.pathname.includes('/trades/')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Trades'
  }
  else if (document.location.pathname.includes('/promocodes/')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Promocodces'
  }
  else if (document.location.pathname.includes('/currency/')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Currency'
  }
  else if (document.location.pathname.includes('/settings/')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Settings'
  }
  else if (document.location.pathname.includes('/thread/')) {
    presenceData.details = 'Viewing Thread:'
    presenceData.state = document.querySelector('.top')?.textContent
  }
  else if (document.location.pathname.includes('/shop/')) {
    if (document.location.pathname === '/shop/') {
      presenceData.details = 'Viewing Page:'
      presenceData.state = 'Shop'
    }
    else {
      presenceData.details = 'Viewing Item:'
      presenceData.state = document.querySelector('.medium-text')?.textContent
    }
  }

  // Blog Presence
  if (document.location.hostname === 'blog.brick-hill.com') {
    if (document.location.pathname === '/') {
      presenceData.details = 'Viewing Page:'
      presenceData.state = 'Blog'
    }
    else if (document.location.pathname.includes('/author/')) {
      presenceData.details = 'Viewing Blog Author:'
      presenceData.state = document.querySelector(
        'body > div > section > h1',
      )?.textContent
    }
    else if (document.location.pathname.includes('/page/')) {
      presenceData.details = 'Viewing Page:'
      presenceData.state = `Blog (${
        document.querySelector('#content > div > nav > span')?.textContent
      })`
    }
  }

  // API Presence
  if (
    document.location.hostname === 'api.brick-hill.com'
    && document.location.pathname.includes('/docs')
  ) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'API Docs'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
