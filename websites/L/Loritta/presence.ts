const presence = new Presence({
  clientId: '720139757363003455',
})
const presenceData: PresenceData = {
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/Loritta/assets/logo.png',
  startTimestamp: Date.now(),
}

presence.on('UpdateData', () => {
  const path = document.location.pathname
  const host = document.location.hostname
  if (host === 'loritta.website') {
    if (path === '/br' || path === '/us' || path === '/br/' || path === '/us/') {
      presenceData.details = 'Home'
    }
    else if (path.includes('dashboard')) {
      presenceData.details = document.querySelector('.server-name')?.textContent
      presenceData.state = document.querySelector('.selected-item')?.textContent
    }
    else if (path.endsWith('/guidelines')) {
      presenceData.details = 'Guidelines'
    }
    else if (path.endsWith('/support')) {
      presenceData.details = 'Support'
    }
    else if (path.includes('fanarts')) {
      const artist = document.querySelector('.name')
      if (artist) {
        presenceData.details = 'FanArts'
        presenceData.state = artist.textContent
      }
      else {
        presenceData.details = 'FanArts'
      }
    }
    else if (path.endsWith('/donate')) {
      presenceData.details = 'Donate'
    }
    else if (path.includes('extras')) {
      presenceData.details = document.querySelector('.server-name')?.textContent
      presenceData.state = document.querySelector('.selected-item')?.textContent
    }
    else if (path.includes('blog')) {
      const title = document.querySelector('h1')
      if (title) {
        presenceData.details = 'Blog'
        presenceData.state = title.textContent
      }
      else {
        presenceData.details = 'Blog'
      }
    }
    else if (path.endsWith('/daily')) {
      presenceData.details = 'Daily'
    }
  }
  if (host.includes('cluster')) {
    if (path.includes('dashboard') || path.includes('guild')) {
      presenceData.details = document.querySelector('.server-name')?.textContent
      presenceData.state = document.querySelector('.selected-item')?.textContent
    }
    else if (path.endsWith('/guidelines')) {
      presenceData.details = 'Guidelines'
    }
    else if (path.endsWith('/daily')) {
      presenceData.state = 'Daily'
    }
    else if (path.endsWith('/support')) {
      presenceData.details = 'Support'
    }
    else if (path.includes('fanarts')) {
      const artist = document.querySelector('.name')
      if (artist) {
        presenceData.details = 'FanArts'
        presenceData.state = artist.textContent
      }
      else {
        presenceData.details = 'FanArts'
      }
    }
    else if (path.endsWith('/donate')) {
      presenceData.details = 'Donate'
    }
    else if (path.includes('extras')) {
      presenceData.details = document.querySelector('.server-name')?.textContent
      presenceData.state = document.querySelector('.selected-item')?.textContent
    }
    else if (path.includes('blog')) {
      const title = document.querySelector('h1')
      if (title) {
        presenceData.details = 'Blog'
        presenceData.state = title.textContent
      }
      else {
        presenceData.details = 'Blog'
      }
    }
  }
  presence.setActivity(presenceData)
})
