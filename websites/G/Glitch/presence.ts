const presence = new Presence({
  clientId: '630101652380188692',
})

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Glitch/assets/logo.png',
  }

  if (document.location.hostname.includes('.glitch.me')) {
    presenceData.details = 'Viewing a webpage'
    presenceData.state = document.location.hostname
  }
  else if (document.location.hostname === 'status.glitch.com') {
    presenceData.details = 'https://status.glitch.com'
  }
  else if (document.location.hostname === 'support.glitch.com') {
    if (document.location.pathname.toLowerCase() === '/') {
      presenceData.details = 'Viewing support topics'
      presenceData.state = 'Latest topics'
    }
    else if (document.location.pathname.toLowerCase() === '/latest') {
      presenceData.details = 'Viewing support topics'
      presenceData.state = 'Latest topics'
    }
    else if (document.location.pathname.toLowerCase() === '/new') {
      presenceData.details = 'Viewing support topics'
      presenceData.state = 'New topics'
    }
    else if (document.location.pathname.toLowerCase() === '/unread') {
      presenceData.details = 'Viewing support topics'
      presenceData.state = 'Unread topics'
    }
    else if (document.location.pathname.toLowerCase() === '/top') {
      presenceData.details = 'Viewing support topics'
      presenceData.state = 'Top topics'
    }
    else if (document.location.pathname.toLowerCase() === '/categories') {
      presenceData.details = 'Viewing support topics'
      presenceData.state = 'Categories'
    }
    else if (
      document.location.pathname.toLowerCase().startsWith('/t/')
    ) {
      presenceData.details = 'Viewing a topic:'
      presenceData.state = document.title
    }
    else if (
      document.location.pathname.toLowerCase().startsWith('/u/')
    ) {
      presenceData.details = 'Viewing a user profile:'
      presenceData.state = document.querySelector(
        'body > section > div > div > div > section > section > div > div > div > div > h2 ',
      )?.textContent
    }
  }
  else {
    presenceData.details = 'Viewing a page:'
    if (document.location.pathname.toLowerCase() === '/') {
      presenceData.state = 'Homepage'
    }
    else if (document.location.pathname.toLowerCase().includes('/questions')) {
      presenceData.details = 'Viewing a page:'
      presenceData.state = 'Questions'
    }
    else if (document.location.pathname.toLowerCase().includes('/create')) {
      presenceData.details = 'Viewing a page:'
      presenceData.state = 'Create'
    }
    else if (document.location.pathname.toLowerCase().includes('/about')) {
      presenceData.details = 'Viewing a page:'
      presenceData.state = 'About'
    }
    else if (document.location.pathname.toLowerCase().includes('/culture')) {
      presenceData.details = 'Viewing a page:'
      presenceData.state = 'Blog & Culture'
    }
    else if (document.location.pathname.toLowerCase().includes('/help')) {
      presenceData.details = 'Viewing a page:'
      presenceData.state = 'Help & FAQ'
    }
    else if (document.location.pathname.toLowerCase().includes('/legal')) {
      presenceData.details = 'Viewing a page:'
      presenceData.state = 'Legal'
    }
    else if (document.location.pathname.toLowerCase().includes('edit')) {
      presenceData.details = 'Editing a project:'
      presenceData.state = document.querySelector(
        'body > div > div > header > nav > button > div > span',
      )?.textContent
    }
    else if (document.location.pathname.toLowerCase().includes('~')) {
      presenceData.details = 'Viewing a project:'
      presenceData.state = document.location.pathname.replace('/', '')
    }
    else if (document.location.pathname.toLowerCase().includes('@')) {
      presenceData.details = 'Viewing a team or user:'
      presenceData.state = document.location.pathname.replace('/', '')
    }
    else {
      delete presenceData.details
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
