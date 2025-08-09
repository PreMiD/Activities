const presence = new Presence({
  clientId: '503557087041683458',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/Roblox%20Forum/assets/logo.png',
    name: 'Roblox Forum',
  }
  if (document.location.pathname === '/') {
    presenceData.details = 'Viewing the homepage'
  }
  else if (document.location.pathname.startsWith('/threads/')) {
    presenceData.details = 'Browsing a thread'
    presenceData.state = `Thread: ${document
      .querySelector('meta[property=\'og:title\']')
      ?.getAttribute('content')}`
    presenceData.buttons = [
      {
        label: 'View Thread',
        url: document.location.href,
      },
    ]
  }
  else if (document.location.pathname.startsWith('/forums/')) {
    presenceData.details = 'Browsing a category'
    presenceData.state = `Category: ${document
      .querySelector('meta[property=\'og:title\']')
      ?.getAttribute('content')}`
  }
  else if (document.location.pathname.startsWith('/members/')) {
    presenceData.details = 'Viewing a profile'
    presenceData.state = `Profile: ${document
      .querySelector('meta[property=\'og:title\']')
      ?.getAttribute('content')}`
    presenceData.buttons = [
      {
        label: 'View Profile',
        url: document.location.href,
      },
    ]
  }
  else if (document.location.pathname.startsWith('/whats-new/')) {
    presenceData.details = 'Browsing the latest content'
  }
  else {
    switch (document.location.pathname) {
      case '/pages/premium/':
        presenceData.details = 'Browsing premium packages'
        break
      case '/account/account-details/':
        presenceData.details = 'Editing my account details'
        break
      case '/account/alerts':
        presenceData.details = 'Viewing my alerts in full'
        break
      case '/account/privacy':
        presenceData.details = 'Editing my privacy settings'
        break
    }
    presenceData.details = 'Unknown page'
  }
  presence.setActivity(presenceData)
})
