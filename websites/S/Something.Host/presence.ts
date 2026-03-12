const presence = new Presence({
  clientId: '503557087041683458',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Something.Host/assets/logo.png',
    name: 'Something.Host',
  }

  // Support - support.something.host
  if (window.location.hostname === 'support.something.host') {
    presenceData.details = 'Helpdesk'

    if (window.location.pathname.includes('/article')) {
      presenceData.state = `Article: ${
        document.querySelector('html > body > nav > div > div >div > div > h1')
          ?.textContent
      }`
    }
    else if (window.location.pathname.includes('/category')) {
      presenceData.state = `Category: ${
        document.querySelector(
          'body > nav > div > div > div > div > span.csh-navigation-title-list-subject > span.csh-category-badge.csh-font-sans-semibold',
        )?.textContent
      }`
    }
    else {
      presenceData.state = 'Browsing'
    }
  }

  // Landing Site - something.host
  if (window.location.hostname === 'something.host') {
    presenceData.details = 'Landing Site'

    if (
      document.querySelector('head > title')?.textContent
      === 'Home || SomethingHost'
    ) {
      presenceData.state = 'Home'
    }
    else {
      presenceData.state = document
        .querySelector('head > title')
        ?.textContent
        ?.replace('SomethingHost', '')
        .replace(/\|/g, '')
    }
  }

  // CDN - content.something.host
  if (window.location.hostname === 'content.something.host')
    presenceData.details = 'Content'

  // Files - files.something.host
  if (window.location.hostname === 'files.something.host')
    presenceData.details = 'File Manager'

  // Control Panel - cp.something.host
  if (window.location.hostname === 'cp.something.host') {
    presenceData.details = 'Control Panel'

    if (window.location.pathname.startsWith('/profile')) {
      presenceData.state = 'Profile'
    }
    else {
      presenceData.state = document
        .querySelector('head > title')
        ?.textContent
        ?.replace('SomethingCP - ', '')
    }
  }
  presence.setActivity(presenceData)
})
