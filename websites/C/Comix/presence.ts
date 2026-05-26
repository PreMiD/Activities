import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1460511327771426848',
})

enum ActivityAssets {
  Settings = 'https://cdn.rcd.gg/PreMiD/websites/C/Comix/assets/0.png',
  Notification = 'https://cdn.rcd.gg/PreMiD/websites/C/Comix/assets/1.png',
}

let sessionStartTime: number | null = null

presence.on('UpdateData', async () => {
  if (sessionStartTime === null)
    sessionStartTime = Math.floor(Date.now() / 1000)

  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/Comix/assets/thumbnail.png',
    startTimestamp: sessionStartTime,
  }

  const { pathname, search } = document.location
  const searchParams = new URLSearchParams(search)
  const tab = searchParams.get('tab')?.toLowerCase()
  const sort = searchParams.get('sort')?.toLowerCase()
  const scope = searchParams.get('scope')?.toLowerCase()
  const sub = searchParams.get('sub')?.toLowerCase()
  const filter = searchParams.get('filter')?.toLowerCase()
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/'

  const dataEl = document.getElementById('initial-data')
  const data = dataEl ? JSON.parse(dataEl.textContent) : null

  const mangaKey = data ? Object.keys(data.queries).find(k => k.includes('manga') && k.includes('detail')) : null
  const manga = mangaKey && data ? data.queries[mangaKey] : null

  const mangaName = manga?.title || 'Manga'
  const mangaPoster = manga?.poster?.large || manga?.poster?.medium

  const chapterNum = data?.read?.chapterNumber
  const isChapterPage = data?.page === 'read'

  if (pathname === '/') {
    presenceData.state = 'Browsing homepage...'
  }
  else if (pathname === '/home') {
    presenceData.state = 'Browsing homepage...'
    presenceData.smallImageKey = Assets.Search
  }
  else if (normalizedPathname === '/genres') {
    presenceData.details = 'Browsing genres...'
    presenceData.smallImageKey = Assets.Search
  }
  else if (normalizedPathname === '/groups') {
    presenceData.details = 'Browsing scanlation groups...'
    presenceData.smallImageKey = Assets.Search
  }
  else if (normalizedPathname === '/groups/popular') {
    presenceData.details = 'Browsing popular scanlation groups...'
    presenceData.smallImageKey = Assets.Search
  }
  else if (/\/groups\/\w+/.test(pathname)) {
    const gpName = document.querySelector('.gp__name')?.textContent?.trim()
    const gpMetaItems = document.querySelectorAll('.gp__meta-item')
    const gpReleases = gpMetaItems[1]?.querySelector('strong')?.textContent?.trim()
    const gpTitles = gpMetaItems[2]?.querySelector('strong')?.textContent?.trim()

    presenceData.details = `Viewing "${gpName || 'Unknown'}" group`

    const stateParts = [
      gpReleases !== undefined ? `${gpReleases} releases` : null,
      gpTitles !== undefined ? `${gpTitles} titles` : null,
    ].filter(Boolean)

    if (stateParts.length > 0)
      presenceData.state = stateParts.join(' · ')

    presenceData.smallImageKey = Assets.Viewing
  }
  else if (normalizedPathname === '/browse') {
    presenceData.details = 'Browsing comix...'
    presenceData.smallImageKey = Assets.Search
  }
  else if (normalizedPathname === '/user') {
    if (!tab || tab === 'edit') {
      presenceData.details = 'Editing profile...'
      presenceData.smallImageKey = Assets.Writing
    }
    else if (tab === 'groups') {
      if (sort === 'az') {
        presenceData.details = 'Viewing followed groups (A-Z)...'
      }
      else if (sort === 'members') {
        presenceData.details = 'Viewing followed groups by members...'
      }
      else {
        presenceData.details = 'Viewing followed groups...'
      }
      presenceData.smallImageKey = Assets.Viewing
    }
    else if (tab === 'titles') {
      presenceData.details = 'Viewing followed titles...'
      presenceData.smallImageKey = Assets.Viewing
    }
    else if (tab === 'history') {
      presenceData.details = 'Viewing read history...'
      presenceData.smallImageKey = Assets.Viewing
    }
    else if (tab === 'collections') {
      if (sub === 'liked') {
        presenceData.details = 'Browsing liked collections...'
      }
      else {
        presenceData.details = 'Browsing owned collections...'
      }
      presenceData.smallImageKey = Assets.Viewing
    }
    else if (tab === 'feed') {
      if (scope === 'groups') {
        presenceData.details = 'Viewing groups feed...'
      }
      else {
        presenceData.details = 'Viewing titles feed...'
      }
      presenceData.smallImageKey = Assets.Viewing
    }
    else if (tab === 'notifs') {
      if (scope === 'community') {
        presenceData.details = 'Viewing community notifications...'
      }
      else {
        presenceData.details = 'Viewing notifications...'
      }
      presenceData.smallImageKey = ActivityAssets.Notification
    }
    else if (tab === 'comments') {
      if (sort === 'liked') {
        presenceData.details = 'Viewing comments sorted by likes...'
      }
      else if (sort === 'replies') {
        presenceData.details = 'Viewing comments sorted by replies...'
      }
      else {
        presenceData.details = 'Viewing comments...'
      }
      presenceData.smallImageKey = Assets.Viewing
    }
    else if (tab === 'uploads') {
      if (filter === 'visible') {
        presenceData.details = 'Managing visible uploads...'
      }
      else if (filter === 'accepted') {
        presenceData.details = 'Managing accepted uploads...'
      }
      else if (filter === 'pending') {
        presenceData.details = 'Viewing pending uploads...'
      }
      else if (filter === 'rejected') {
        presenceData.details = 'Viewing rejected uploads...'
      }
      else {
        presenceData.details = 'Managing uploads...'
      }
      presenceData.smallImageKey = Assets.Uploading
    }
    else if (tab === 'backup') {
      presenceData.details = 'Managing Import / Export...'
      presenceData.smallImageKey = Assets.Downloading
    }
    else if (tab === 'settings') {
      presenceData.details = 'Managing account settings...'
      presenceData.smallImageKey = ActivityAssets.Settings
    }
  }
  else if (normalizedPathname === '/collections') {
    presenceData.details = 'Browsing Public Collections...'
    presenceData.smallImageKey = Assets.Search
  }
  else if (/\/collections\/\w+/.test(pathname)) {
    const collectionTitle = document.querySelector('.cdp__head .cdp__title')?.textContent?.trim()
    const ownerName = document.querySelector('.cdp__owner-name')?.textContent?.trim()
    const titlesItem = document.querySelectorAll('.cdp__meta-item')[1]
    const totalTitles = titlesItem?.textContent?.trim().replace(/\s+/g, ' ')

    presenceData.details = collectionTitle
      ? `Viewing collection: ${collectionTitle}`
      : 'Viewing a collection...'

    if (ownerName) {
      presenceData.state = `By ${ownerName}${totalTitles ? ` · ${totalTitles}` : ''}`
    }

    presenceData.smallImageKey = Assets.Viewing
  }
  else if (/\/u\/\w+/.test(pathname)) {
    presenceData.details = 'Viewing a User\'s Profile'
    presenceData.smallImageKey = Assets.Viewing
  }
  if (pathname.includes('/title')) {
    if (!isChapterPage) {
      presenceData.details = `Viewing "${mangaName}" mainpage`
      presenceData.largeImageKey = mangaPoster || presenceData.largeImageKey
      presenceData.smallImageKey = Assets.Viewing
    }
    else {
      presenceData.details = mangaName
      presenceData.state = `Chapter: ${chapterNum ?? 'Unknown'}`
      presenceData.largeImageKey = mangaPoster || presenceData.largeImageKey
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = `Chapter: ${chapterNum}`
    }
  }

  presence.setActivity(presenceData)
})
