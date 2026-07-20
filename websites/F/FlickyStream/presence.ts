import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1453062828033577203',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/F/FlickyStream/assets/logo.png',
}

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: 'Unsupported Page',
  }

  const { pathname, search } = document.location

  const privacy = await presence.getSetting<boolean>('privacy')

  if (privacy) {
    presenceData.details = 'Watching FlickyStream'
    presence.setActivity(presenceData)
    return
  }

  const pages: Record<string, PresenceData> = {
    '/': {
      details: 'Viewing HomePage',
      smallImageKey: Assets.Viewing,
    },
    '/tv': {
      details: 'Browsing TV Shows',
      smallImageKey: Assets.Viewing,
    },
    '/movie': {
      details: 'Browsing Movies',
      smallImageKey: Assets.Viewing,
    },
    '/sports': {
      details: 'Watching Live Sports',
      smallImageKey: Assets.Viewing,
    },
    '/watch-history': {
      details: 'Browsing Watch History',
      smallImageKey: Assets.Viewing,
    },
    '/trending': {
      details: 'Browsing Trending Content',
      smallImageKey: Assets.Viewing,
    },
    '/profile': {
      details: 'Browsing Profile',
      smallImageKey: Assets.Viewing,
    },
    '/login': {
      details: 'Signing In',
      smallImageKey: Assets.Viewing,
    },
    '/signup': {
      details: 'Signing Up',
      smallImageKey: Assets.Viewing,
    },
  }

  for (const [path, data] of Object.entries(pages)) {
    if (pathname === path) {
      presenceData = {
        ...presenceData,
        ...data,
        type: ActivityType.Watching,
      }
    }
  }

  if (pathname.startsWith('/movie/') || pathname.startsWith('/tv/')) {
    const title = document.querySelector('img[alt][src*="tmdb.org"]')?.getAttribute('alt') || document.title.replace(' | FlickyStream', '') || 'Viewing Movie'
    const image = document.querySelector('div.hidden.md\\:block img')?.getAttribute('src') || document.querySelector('img[src*="tmdb.org"]')?.getAttribute('src')
    const rating = (() => {
      const el = document.querySelector('div.text-amber-400')
      return el?.childNodes[el.childNodes.length - 1]?.textContent?.trim()
    })()
    presenceData.details = 'FlickyStream'
    presenceData.state = [
      title,
      rating && `⭐ ${rating}`,
    ]
      .filter(Boolean)
      .join(' • ')
    if (image) {
      presenceData.type = ActivityType.Watching
      presenceData.name = title
      presenceData.largeImageKey = image
      presenceData.largeImageText = title
      presenceData.smallImageKey = ActivityAssets.Logo
    }
  }

  if (pathname.startsWith('/player/movie/')) {
    const title = document.querySelector('h1.text-xl.md\\:text-2xl.font-semibold')?.textContent?.trim() || document.title.replace(' | FlickyStream', '') || 'Viewing Movie'
    presenceData.details = 'FlickyStream'
    if (title) {
      presenceData.type = ActivityType.Watching
      presenceData.name = title
      presenceData.largeImageKey = ActivityAssets.Logo
      presenceData.largeImageText = title
    }
  }

  if (pathname.startsWith('/player/tv/')) {
    const title = document.querySelector('h1.text-xl.md\\:text-2xl.font-semibold')?.textContent?.trim() || document.title.replace(' | FlickyStream', '') || 'Viewing Movie'
    const rawTitle = document.querySelector('h1.text-xl.md\\:text-2xl.font-semibold')?.textContent?.trim() || ''
    const [showPart, episodePart] = rawTitle.split(' - ')
    const showTitle = showPart || 'Unknown Show'
    const [, seasonNo, episodeNo] = episodePart?.match(/Season\s+(\d+)\s+Episode\s+(\d+)/) || []
    presenceData.details = 'FlickyStream'
    if (title) {
      presenceData.type = ActivityType.Watching
      presenceData.name = `${showTitle} S${seasonNo}E${episodeNo}`
      presenceData.largeImageKey = ActivityAssets.Logo
      presenceData.largeImageText = showTitle
    }
  }
  if (pathname.includes('/search')) {
    presenceData.type = ActivityType.Watching
    presenceData.details = `Searching...`
    presenceData.state = `Query: ${decodeURIComponent(new URLSearchParams(search).get('q') || '').replace(/\b\w/g, c => c.toUpperCase())}`
    presenceData.smallImageKey = Assets.Search
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
