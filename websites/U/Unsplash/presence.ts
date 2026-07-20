const presence = new Presence({
  clientId: '764198138495893554',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/U/Unsplash/assets/logo.png',
  }

  if (document.location.pathname === '/') {
    presenceData.details = 'Viewing home page'
  }
  else if (document.location.pathname.startsWith('/t/')) {
    presenceData.details = 'Browsing tag'
    if (document.querySelectorAll('h1').length > 0)
      presenceData.state = document.querySelectorAll('h1')[0]?.textContent
  }
  else if (document.location.pathname === '/t') {
    presenceData.details = 'Browsing topics'
  }
  else if (document.location.pathname.includes('following')) {
    presenceData.details = 'Browsing following'
  }
  else if (document.location.pathname.startsWith('/@')) {
    presenceData.details = 'Viewing profile'
    if (document.querySelectorAll('._3FvGs').length === 1)
      presenceData.state = document.querySelectorAll('._3FvGs')[0]?.textContent
    else presenceData.state = document.location.pathname.replace('/', '')
  }
  else if (document.location.pathname.includes('/account')) {
    presenceData.details = 'Editing their profile'
  }
  else if (document.location.pathname.includes('/awards')) {
    presenceData.details = 'Viewing Unsplash Awards'
  }
  else if (document.location.pathname.startsWith('/s/')) {
    if (document.location.pathname.startsWith('/s/photos'))
      presenceData.details = 'Searching for photos'
    else if (document.location.pathname.startsWith('/s/collections'))
      presenceData.details = 'Searching for collections'
    else if (document.location.pathname.startsWith('/s/users'))
      presenceData.details = 'Searching for users'
    else presenceData.details = 'Searching'

    if (document.querySelectorAll('h1').length > 0) {
      presenceData.state = `"${
        document.querySelectorAll('h1')[0]?.textContent
      }"`
    }
  }
  else if (document.location.pathname.startsWith('/photos')) {
    presenceData.details = 'Viewing photo'
    if (
      document.querySelectorAll(
        '._3XzpS._1ByhS._4kjHg._1O9Y0._3l__V._1CBrG.xLon9',
      ).length > 0
    ) {
      presenceData.state = `by ${
        document.querySelectorAll(
          '._3XzpS._1ByhS._4kjHg._1O9Y0._3l__V._1CBrG.xLon9',
        )[0]?.textContent
      }`
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
