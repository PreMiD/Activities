const presence = new Presence({
  clientId: '1370078552581603489',
})

const startTimestamp = Math.floor(Date.now() / 1000)

const ActivityAssets = {
  Logo: 'https://i.ibb.co/6c2kY3tv/icon.png',
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp,
  }

  const cleanTitle = document.title.replace(/\s*[-|–]\s*Hexa\s*Watch\s*$/i, '').trim()

  switch (true) {
    case pathname.startsWith('/watch/movie'):
      presenceData.details = 'Watching a movie'
      presenceData.state = cleanTitle || 'A Movie'
      break

    case pathname.startsWith('/watch/tv'):
      presenceData.details = 'Watching a TV show'
      presenceData.state = cleanTitle || 'A TV Show'
      break

    case pathname.startsWith('/details/movie'):
      presenceData.details = 'Browsing movie details'
      presenceData.state = cleanTitle || 'A Movie'
      break

    case pathname.startsWith('/details/tv'):
      presenceData.details = 'Browsing TV show details'
      presenceData.state = cleanTitle || 'A TV Show'
      break

    case pathname.startsWith('/search'):
      presenceData.details = 'Searching on Hexa Watch'
      break

    case pathname.startsWith('/collections'):
      presenceData.details = 'Browsing collections'
      break

    default:
      presenceData.details = 'Browsing Hexa Watch'
      break
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
