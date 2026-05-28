const presence = new Presence({
  clientId: '1509466786779758674',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData = {
    largeImageKey: 'logo',
    startTimestamp: browsingTimestamp,
    type: 3,
  }

  const { pathname, search } = document.location
  const params = new URLSearchParams(search)

  if (pathname === '/' || pathname === '/home') {
    presenceData.details = 'Browsing AnixTV'
    presenceData.state = 'Home'
  }
  else if (pathname.includes('/anime-watch')) {
    const title =
      document.querySelector('.anis-title-detail .main-name')?.textContent?.trim() ||
      document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
      document.title

    const episode =
      document.querySelector('.ep-name')?.textContent?.trim() ||
      document.querySelector('.anis-ep-name')?.textContent?.trim() ||
      document.querySelector('.current-ep')?.textContent?.trim()

    const cover = document.querySelector('meta[property="og:image"]')?.getAttribute('content')

    presenceData.details = title ? `Watching: ${title}` : 'Watching an anime'

    if (episode) {
      presenceData.state = episode
    }

    if (cover && cover.startsWith('http')) {
      presenceData.smallImageKey = cover
      presenceData.smallImageText = title || 'AnixTV'
    }

    const video = document.querySelector('video')
    if (video && !video.paused && video.duration) {
      presenceData.startTimestamp = Math.floor(Date.now() / 1000 - video.currentTime)
      presenceData.endTimestamp = Math.floor(Date.now() / 1000 + (video.duration - video.currentTime))
    }
    else if (video && video.paused) {
      delete presenceData.startTimestamp
      presenceData.smallImageKey = 'pause'
      presenceData.smallImageText = 'Paused'
    }
  }
  else if (pathname.includes('/anime-details')) {
    const title =
      document.querySelector('.anime-name')?.textContent?.trim() ||
      document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
      document.title

    presenceData.details = 'Viewing anime details'
    presenceData.state = title || 'Unknown anime'
  }
  else if (pathname.includes('/search') || search.includes('keyword=')) {
    const query = params.get('keyword') || ''
    presenceData.details = 'Searching for anime'
    if (query) presenceData.state = `"${query}"`
  }
  else if (pathname.includes('/genre') || pathname.includes('/category')) {
    const genre = document.querySelector('.title')?.textContent?.trim() || 'a genre'
    presenceData.details = 'Browsing by genre'
    presenceData.state = genre
  }
  else {
    presenceData.details = 'Browsing AnixTV'
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
