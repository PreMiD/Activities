import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1452924221742387362',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/0-9/1Flex/assets/logo.png',
}

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: 'Unsupported Page',
  }

  const { pathname } = document.location

  const privacy = await presence.getSetting<boolean>('privacy')

  if (privacy) {
    presenceData.details = 'Watching 1Flex'
    presence.setActivity(presenceData)
    return
  }

  const pages: Record<string, PresenceData> = {
    '/': {
      details: 'Viewing HomePage',
      smallImageKey: Assets.Viewing,
    },
    '/tv-shows': {
      details: 'Browsing TV Shows',
      smallImageKey: Assets.Viewing,
    },
    '/movies': {
      details: 'Browsing Movies',
      smallImageKey: Assets.Viewing,
    },
    '/manga-read': {
      details: 'Reading Manga',
      smallImageKey: Assets.Viewing,
    },
    '/live-tv': {
      details: 'Browsing Live TV',
      smallImageKey: Assets.Viewing,
    },
    '/sports': {
      details: 'Watching Live Sports',
      smallImageKey: Assets.Viewing,
    },
    '/torrent': {
      details: 'Browsing Torrents',
      smallImageKey: Assets.Viewing,
    },
    '/my-list': {
      details: 'Checking My List',
      smallImageKey: Assets.Viewing,
    },
    '/browse-by-languages': {
      details: 'Browsing Content By Language',
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

  if (pathname === '/play') {
    const params = new URLSearchParams(location.search)
    const type = params.get('type')
    if (type === 'movie') {
      presenceData.type = ActivityType.Watching
      presenceData.details = '1Flex'
      const title = document.querySelector('h3.text-white.font-bold')?.textContent?.trim() || 'Unknown Movie'
      const year = document.querySelector('.text-zinc-400 span')?.textContent?.trim() || 'N/A'
      const runtime = document.querySelectorAll('.text-zinc-400 span')[1]?.textContent?.replace('min', '')?.trim() || 'N/A'
      const rating = document.querySelector('.text-yellow-500 + span')?.textContent?.trim() || 'N/A'
      const poster = document.querySelector('img.object-cover.rounded-lg')?.getAttribute('src')
      presenceData.name = title
      presenceData.state = `⭐ ${rating} 🕒 ${runtime} mins 🗓️ ${year}`
      if (poster)
        presenceData.largeImageKey = poster
      presenceData.smallImageKey = ActivityAssets.Logo
    }
    if (type === 'tv') {
      presenceData.type = ActivityType.Watching
      const params = new URLSearchParams(location.search)
      const season = params.get('season') || '?'
      const episode = params.get('episode') || '?'
      const activeEpisode = document.querySelector('[data-episode].bg-gradient-to-r') || document.querySelector(`[data-episode="${episode}"]`)
      const episodeTitle = activeEpisode?.querySelector('.font-semibold')?.textContent?.trim() || `Episode ${episode}`
      let runtime = 'N/A'
      const metaElements = activeEpisode?.querySelectorAll('.text-xs, .text-sm')
      metaElements?.forEach((el) => {
        const text = el.textContent || ''
        if (text.includes('min')) {
          runtime = text.match(/(\d+)\s*min/i)?.[1] || 'N/A'
        }
      })
      const episodeImage = activeEpisode?.querySelector('img')?.getAttribute('src')
      const showPoster = document.querySelector('img.object-cover.rounded-lg')?.getAttribute('src')
      presenceData.details = 'Watching TV Show'
      presenceData.name = episodeTitle
      presenceData.state = `S${season} • E${episode} — ${episodeTitle} (${runtime}m)`
      presenceData.largeImageKey = episodeImage || showPoster
      presenceData.smallImageKey = ActivityAssets.Logo
    }
  }

  if (pathname.includes('/search')) {
    presenceData.details = `Searching for Content`
    const query = document.querySelector('input')?.getAttribute('value')
    if (query) {
      presenceData.state = `Query: ${query}`
    }
    presenceData.smallImageKey = Assets.Search
  }

  if (location.pathname === '/manga' && location.search.includes('q=')) {
    presenceData.details = 'Searching for Manga'

    const query = document.querySelector('input')?.value
    if (query) {
      presenceData.state = `Query: ${query}`
    }

    presenceData.smallImageKey = Assets.Search
  }
  else if (location.pathname === '/manga') {
    presenceData.details = 'Browsing Manga'
    presenceData.smallImageKey = Assets.Viewing
  }

  if (location.pathname === '/games' && location.search.includes('q=')) {
    presenceData.details = 'Searching for Game'

    const query = document.querySelector('input')?.value
    if (query) {
      presenceData.state = `Query: ${query}`
    }

    presenceData.smallImageKey = Assets.Search
  }
  else if (location.pathname === '/games') {
    presenceData.details = 'Browsing Games'
    presenceData.smallImageKey = Assets.Viewing
  }

  if (location.pathname === '/torrent' && location.search.includes('q=')) {
    presenceData.details = 'Searching for Torrents'

    const query = document.querySelector('input')?.value
    if (query) {
      presenceData.state = `Query: ${query}`
    }

    presenceData.smallImageKey = Assets.Search
  }
  else if (location.pathname === '/torrent') {
    presenceData.details = 'Browsing Torrents'
    presenceData.smallImageKey = Assets.Viewing
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
