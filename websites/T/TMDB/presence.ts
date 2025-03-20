const presence: Presence = new Presence({
  clientId: '966643093308837938',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/TMDB/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = window.location

  if (pathname.startsWith('/u')) {
    const user = pathname.split('/')[2]

    if (pathname.includes('watchlist'))
      presenceData.details = `Viewing ${user}'s watchlist`
    else if (pathname.includes('favorites'))
      presenceData.details = `Viewing ${user}'s favorites`
    else if (pathname.includes('lists'))
      presenceData.details = `Viewing ${user}'s lists`
    else if (pathname.includes('activity'))
      presenceData.details = `Viewing ${user}'s activity`
    else if (pathname.includes('discussions'))
      presenceData.details = `Reading ${user}'s discussions`
    else if (pathname.includes('ratings'))
      presenceData.details = `Viewing ${user}'s ratings`
    else if (pathname.includes('recommendations'))
      presenceData.details = `Viewing ${user}'s recommendations`
    else if (pathname.includes('events'))
      presenceData.details = `Viewing ${user}'s events`
    else presenceData.details = `Viewing ${user}'s profile`
  }
  else if (pathname.startsWith('/movie')) {
    if (pathname.startsWith('/movie/now-playing')) {
      presenceData.details = 'Viewing now playing movies'
    }
    else if (pathname.startsWith('/movie/upcoming')) {
      presenceData.details = 'Viewing upcoming movies'
    }
    else if (pathname.startsWith('/movie/top-rated')) {
      presenceData.details = 'Viewing top rated movies'
    }
    else if (pathname.startsWith('/movie/new')) {
      presenceData.details = 'Adding a new movie'
    }
    else if (pathname.split('/').length === 3) {
      presenceData.details = `Viewing ${document
        .querySelector(`h2 > [href="${pathname}"]`)
        ?.textContent
        ?.trim()}`
    }
    else if (pathname.includes('/reviews')) {
      presenceData.details = `Reading ${document
        .querySelector(
          `h2 > [href="${pathname.split('/').slice(0, 3).join('/')}"]`,
        )
        ?.textContent
        ?.trim()}'s reviews`
    }
    else if (pathname.includes('/discuss')) {
      presenceData.details = `Reading ${document
        .querySelector('h2')
        ?.textContent
        ?.trim()}`
    }
    else {
      presenceData.details = 'Viewing movies'
    }
  }
  else if (pathname.startsWith('/tv')) {
    if (pathname.startsWith('/tv/airing-today')) {
      presenceData.details = 'Viewing airing today TV shows'
    }
    else if (pathname.startsWith('/tv/on-the-air')) {
      presenceData.details = 'Viewing airing TV shows'
    }
    else if (pathname.startsWith('/tv/top-rated')) {
      presenceData.details = 'Viewing top rated TV shows'
    }
    else if (pathname.startsWith('/tv/new')) {
      presenceData.details = 'Adding a new TV show'
    }
    else if (pathname.split('/').length === 3) {
      presenceData.details = `Viewing ${document
        .querySelector(`h2 > [href="${pathname}"]`)
        ?.textContent
        ?.trim()}`
    }
    else if (pathname.includes('/reviews')) {
      presenceData.state = `Reading ${document
        .querySelector(
          `h2 > [href="${pathname.split('/').slice(0, 3).join('/')}"]`,
        )
        ?.textContent
        ?.trim()}'s reviews`
    }
    else if (pathname.includes('/discuss')) {
      presenceData.details = `Reading ${document
        .querySelector('h2')
        ?.textContent
        ?.trim()}`
    }
    else {
      presenceData.details = 'Viewing TV shows'
    }
  }
  else if (pathname.startsWith('/person')) {
    if (pathname.split('/').length === 3) {
      presenceData.details = `Viewing ${document
        .querySelector(`h2 > [href="${pathname}"]`)
        ?.textContent
        ?.trim()}`
    }
    else {
      presenceData.details = 'Viewing Popular People list'
    }
  }
  else if (pathname.startsWith('/discuss')) {
    presenceData.details = 'Viewing discussions'
  }
  else if (pathname.startsWith('/leaderboard')) {
    presenceData.details = 'Viewing leaderboard'
  }
  else if (pathname.startsWith('/talk')) {
    presenceData.details = 'Viewing TMDB support'
  }
  else if (pathname.startsWith('/search')) {
    const query = document.querySelector<HTMLInputElement>('input')?.value
    if (query && query.length > 0)
      presenceData.details = `Searching for ${query}`
    else presenceData.details = 'Searching'
  }
  else if (pathname.startsWith('/')) {
    presenceData.details = 'Browsing TMDB'
  }

  presence.setActivity(presenceData)
})
