const presence = new Presence({
  clientId: '719331723560878091',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const searchTypeMap: ItemMap = {
  web: 'Searching on the web',
  news: 'Searching the news',
  images: 'Searching images',
  videos: 'Searching videos',
  social: 'Searching social media',
  shopping: 'Searching for products',
}
const searchMusicTypeMap: ItemMap = {
  overview: 'Searching music',
  albums: 'Searching music albums',
  artists: 'Searching music artists',
  songs: 'Searching songs',
}
const searchJuniorTypeMap: ItemMap = {
  web: 'Searching on the web',
  images: 'Searching images',
  videos: 'Searching videos',
  education: 'Searching educational content',
}

interface ItemMap {
  [key: string]: string
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/Q/Qwant/assets/logo.png',
  Qwantjunior = 'https://cdn.rcd.gg/PreMiD/websites/Q/Qwant/assets/0.png',
  Music = 'https://cdn.rcd.gg/PreMiD/websites/Q/Qwant/assets/1.png',
  Maps = 'https://cdn.rcd.gg/PreMiD/websites/Q/Qwant/assets/2.png',
  News = 'https://cdn.rcd.gg/PreMiD/websites/Q/Qwant/assets/3.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  let query: URLSearchParams | null = null

  if (location.hostname === 'www.qwant.com') {
    switch (location.pathname.split('/')[1]) {
      case '':
        query = new URLSearchParams(location.search)
        if (query.has('q')) {
          presenceData.details = searchTypeMap[query.get('t') ?? '']
          presenceData.state = query.get('q')
        }
        else {
          presenceData.details = 'Home'
        }
        break
      case 'music':
        presenceData.smallImageKey = ActivityAssets.Music
        presenceData.smallImageText = 'Qwant Music'
        if (location.pathname === '/music/search') {
          query = new URLSearchParams(location.search)
          if (query.has('q')) {
            presenceData.details = searchMusicTypeMap[query.get('t') ?? '']
            presenceData.state = query.get('q')
          }
        }
        else {
          presenceData.details = 'Music Home'
        }
        break
      case 'maps':
        presenceData.smallImageKey = ActivityAssets.Maps
        presenceData.smallImageText = 'Qwant Maps'
        presenceData.details = 'Looking at maps'
        break
    }
  }
  else if (location.hostname === 'www.qwantjunior.com') {
    presenceData.largeImageKey = ActivityAssets.Qwantjunior
    query = new URLSearchParams(location.search)
    switch (location.pathname) {
      case '/':
        if (query.has('q')) {
          presenceData.details = `${
            searchJuniorTypeMap[query.get('type') ?? '']
          } in Qwant Junior`
          presenceData.state = query.get('q')
        }
        else {
          presenceData.details = 'Junior Home'
        }
        break
      case '/news':
        presenceData.smallImageKey = ActivityAssets.News
        presenceData.smallImageText = 'Qwant Junior News'
        if (query.has('q')) {
          presenceData.details = 'Searching the news on Qwant Junior'
          presenceData.state = query.get('q')
        }
        else {
          presenceData.details = 'Junior News Home'
        }
        break
    }
  }

  // If data doesn't exist clear else set activity to the presence data
  if (!presenceData.details) {
    // Clear tray
    presence.setActivity() // Clear activity
  }
  else {
    presence.setActivity(presenceData)
  }
})
