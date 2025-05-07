const presence = new Presence({
  clientId: '503557087041683458',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/SiriusXM/assets/logo.jpg',
    name: 'SiriusXM',
  }

  switch (document.location.pathname) {
    case '/home/foryou': {
      presenceData.details = 'Viewing SiriusXM Home'
      break
    }
    case '/home/music': {
      presenceData.details = 'Viewing Music Home'
      break
    }
    case '/home/sports': {
      presenceData.details = 'Viewing Sports Home'
      break
    }
    case '/home/news': {
      presenceData.details = 'Viewing News Home'
      break
    }
    case '/home/entertainment': {
      presenceData.details = 'Viewing Talk Home'
      break
    }
    case '/home/howard': {
      presenceData.details = 'Viewing Howard Stern Home'
      break
    }
    case '/favorites/channels': {
      presenceData.details = 'Viewing Favorite Channels'
      break
    }
    case '/favorites/shows': {
      presenceData.details = 'Viewing Favorite Shows'
      break
    }
    case '/favorites/episodes': {
      presenceData.details = 'Viewing Favorite Episodes'
      break
    }
    case '/recently-played': {
      presenceData.details = 'Viewing Recently Played Stations'
      break
    }
    case '/query': {
      presenceData.details = 'Searching SiriusXM'
      break
    }
    default:
      if (document.location.pathname.includes('/query')) {
        presenceData.details = 'Viewing: '
        presenceData.state = document.querySelector<HTMLInputElement>(
          '[name="searchText"]',
        )?.value
      }
      else if (document.location.pathname.includes('/category-listing')) {
        presenceData.details = 'Viewing Category: '
        presenceData.state = document.querySelector(
          'span.sxm-breadcrumb__text',
        )?.textContent
      }
      else {
        presenceData.details = 'Unknown page'
      }
  }

  if (document.querySelector('.sxm-player-controls.no-select')) {
    const data = {
      channel: document.querySelector('.channel-name')?.textContent,
      track: document.querySelector('.track-name')?.textContent ?? 'Loading',
      artist: document.querySelector('.artist-name')?.textContent ?? 'Loading',
    }

    if (data.track === data.artist)
      presenceData.details = data.track
    else if (data.channel)
      presenceData.details = `${data.track} - ${data.artist}`
    else presenceData.details = data.track

    if (data.channel)
      presenceData.state = data.channel
    else presenceData.state = data.artist
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
