/* Global variables */
const presence = new Presence({
  clientId: '795235371029233684',
})

/* Main eventHandler */
presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/VRCArena/assets/logo.jpg',
  }
  const privacymode = await presence.getSetting<boolean>('privacy')

  if (document.location.hostname === 'www.vrcarena.com') {
    if (!privacymode) {
      presenceData.buttons = [
        {
          label: 'View on VRCArena',
          url: document.URL.split('?')[0]!,
        },
      ]
    }
    // Categories
    if (document.location.pathname.includes('/category')) {
      switch (document.location.pathname) {
        case '/category/accessory':
          presenceData.details = 'Browsing accessoires'
          presence.setActivity(presenceData)
          break
        case '/category/animation':
          presenceData.details = 'Browsing animations'
          presence.setActivity(presenceData)
          break
        case '/category/avatar':
          presenceData.details = 'Browsing avatars'
          presence.setActivity(presenceData)
          break
        case '/category/tutorial':
          presenceData.details = 'Browsing tutorials'
          presence.setActivity(presenceData)
          break
        case '/category/world':
          presenceData.details = 'Browsing worlds'
          presence.setActivity(presenceData)
          break
        case '/category/tool':
          presenceData.details = 'Browsing tools'
          presence.setActivity(presenceData)
          break
        case '/category/alteration':
          presenceData.details = 'Browsing alterations'
          presence.setActivity(presenceData)
          break
      }
      // Asset pages
    }
    else if (document.location.pathname.includes('/assets')) {
      // User is viewing an asset.
      if (document.location.pathname.includes('/create')) {
        presenceData.details = 'Creating an asset'
      }
      else if (privacymode === false) {
        presenceData.details = document.querySelector(
          'h1.MuiTypography-root > a',
        )?.textContent
        presenceData.state = document
          .querySelector('h1.MuiTypography-root')
          ?.parentNode
          ?.querySelector('div > div')
          ?.textContent
      }
      else {
        presenceData.details = 'Looking at an asset'
      }
      presence.setActivity(presenceData)
      // User pages
    }
    else if (document.location.pathname.includes('/users')) {
      const thetitle = document.querySelector(
        'h1.MuiTypography-root',
      )?.textContent
      if (thetitle === 'All Users') {
        presenceData.details = 'Browsing users'
      }
      else if (privacymode === false) {
        presenceData.details = 'Viewing user'
        presenceData.state = thetitle
      }
      else {
        presenceData.details = 'Browsing users'
      }
      presence.setActivity(presenceData)
      // Pages that aren't the focus of the website will be kept in the else statement.
    }
    else if (document.location.pathname.includes('/species')) {
      const thetitle = document.querySelector(
        'h1.MuiTypography-root',
      )?.textContent
      presenceData.details = 'Browsing species'
      if (thetitle !== 'All Species' && privacymode === false)
        presenceData.state = thetitle

      presence.setActivity(presenceData)
    }
    else {
      switch (document.location.pathname) {
        case '/discord-servers':
          presenceData.details = 'Browsing Discord servers'
          break
        case '/news':
          presenceData.details = 'Browsing news'
          break
        case '/authors':
          presenceData.details = 'Browsing authors'
          break
        case '/about':
          presenceData.details = 'Browsing about page'
          break
        case '/requests':
          presenceData.details = 'Browsing requests'
          break
        case '/requests/create':
          presenceData.details = 'Creating a request'
          break
        case '/patreon':
          presenceData.details = 'Browsing patrons'
          break
        case '/streams':
          presenceData.details = 'Browsing streams'
          break
        case '/activity':
          presenceData.details = 'Browsing activity'
          break
        case '/my-account':
          presenceData.details = 'Account settings'
          break
        case '/nsfw':
          if (privacymode === false)
            presenceData.details = 'Browsing NSFW'
          else presenceData.details = 'Browsing VRCArena'

          break
        default:
          presenceData.details = 'Browsing VRCArena'
          break
      }
      presence.setActivity(presenceData)
    }
  }
})
