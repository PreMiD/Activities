import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1492583578142380193',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://yumezone.live/brand/logo-512.png',
}

async function getStrings() {
  return presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    browse: 'general.browsing',
    viewHome: 'general.viewHome',
    searchFor: 'general.searchFor',
    buttonViewEpisode: 'general.buttonViewEpisode',
    buttonViewSeries: 'general.buttonViewSeries',
    buttonViewProfile: 'general.buttonViewProfile',
    watchingAnime: 'general.watchingAnime',
  })
}

function cleanAnimeTitle(raw: string): string {
  return raw
    .replace(/^Watch\s+/i, '')
    .replace(/\s+-\s+YumeZone$/i, '')
    .replace(/\s+Episode\s+\d.*$/i, '')
    .trim()
}

function getPosterImage(): string | null {
  // 1. Check OpenGraph and Twitter meta tags (prioritize dynamic episode screencaps / covers)
  for (const sel of [
    'meta[property="og:image"]',
    'meta[property="og:image:url"]',
    'meta[property="og:image:secure_url"]',
    'meta[name="twitter:image"]',
  ]) {
    const content = document.querySelector<HTMLMetaElement>(sel)?.getAttribute('content')?.trim()
    if (content && !content.includes('og-home.png') && !content.includes('hero.webp')) {
      if (content.startsWith('http')) {
        return content
      }
      if (content.startsWith('/')) {
        return `${document.location.origin}${content}`
      }
    }
  }

  // 2. Check HTML5 Video poster attribute
  const videoPoster = document.querySelector<HTMLVideoElement>('video')?.getAttribute('poster')?.trim()
  if (videoPoster && /^https?:\/\//i.test(videoPoster)) {
    return videoPoster
  }

  // 3. Check Anime/Manga poster & cover elements in DOM
  const posterImg = document.querySelector<HTMLImageElement>(
    '[data-anime-poster], .aspect-\[2\/3\] img, img[alt*="Poster" i], img[alt*="Cover" i], .poster-image',
  )
  const posterSrc = posterImg?.getAttribute('data-anime-poster') || posterImg?.src
  if (posterSrc && /^https?:\/\//i.test(posterSrc) && !posterSrc.includes('data:')) {
    return posterSrc
  }

  return null
}

function getUserAvatar(): string | null {
  const avatarImg = document.querySelector<HTMLImageElement>(
    'img[src*="/avatar/"], img[src*="cdn.discordapp.com/avatars"], .rounded-full img[src], img[alt*="avatar" i]',
  )?.src
  if (avatarImg && /^https?:\/\//i.test(avatarImg) && !avatarImg.includes('data:')) {
    return avatarImg
  }
  return null
}

presence.on('UpdateData', async () => {
  const { pathname, href, search } = document.location
  const [buttons, cover, hidePaused, browsing, privacyMode] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('hidePaused'),
    presence.getSetting<boolean>('browsing'),
    presence.getSetting<boolean>('privacyMode'),
  ])

  const strings = await getStrings()

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'YumeZone',
    startTimestamp: browsingTimestamp,
    details: strings.browse,
  }

  // 1. WATCHING ANIME: /watch/:id/:episode or /watch/:id
  if (pathname.startsWith('/watch/')) {
    const video = document.querySelector<HTMLVideoElement>('video')

    if (hidePaused && video?.paused) {
      return presence.clearActivity()
    }

    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.getAttribute('content') || ''
    const domTitle = document.querySelector<HTMLElement>('.anime-title, [data-anime-title], h1')?.textContent?.trim()
    const animeTitle = domTitle || (ogTitle ? cleanAnimeTitle(ogTitle) : 'Anime')

    const pathParts = pathname.split('/').filter(Boolean)
    const animeId = pathParts[1] ?? ''
    const epNumber = pathParts[2] ?? (pathname.match(/\/watch\/[^/]+\/(\d+)/)?.[1] ?? null)

    presenceData.type = ActivityType.Watching
    presenceData.details = animeTitle
    presenceData.state = epNumber ? `Episode ${epNumber}` : 'Streaming'

    // Show dynamic episode screencap or anime poster if cover setting is enabled
    if (cover) {
      presenceData.largeImageKey = getPosterImage() ?? ActivityAssets.Logo
    }
    presenceData.largeImageText = animeTitle

    if (video && !Number.isNaN(video.duration) && video.duration > 0) {
      if (!video.paused) {
        ;[presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = strings.play
      }
      else {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = strings.pause
      }
    }

    if (buttons) {
      presenceData.buttons = [
        {
          label: strings.buttonViewEpisode || 'Watch Episode',
          url: href,
        },
      ]

      if (animeId) {
        presenceData.buttons.push({
          label: strings.buttonViewSeries || 'Anime Details',
          url: `https://yumezone.live/anime/${animeId}`,
        })
      }
    }

    if (privacyMode) {
      presenceData.details = strings.watchingAnime || 'Watching Anime'
      presenceData.state = 'Streaming'
      presenceData.largeImageKey = ActivityAssets.Logo
      delete presenceData.buttons
    }

    presence.setActivity(presenceData)
    return
  }

  // 2. READING MANGA: /manga/:provider/:slug/:chapter or OVERVIEW /manga/:provider/:slug
  if (pathname.startsWith('/manga/')) {
    const pathParts = pathname.split('/').filter(Boolean)

    if (pathParts.length >= 3) {
      const heading = document.querySelector<HTMLElement>('h1, h2, .manga-title')?.textContent?.trim()
      const title = heading || (pathParts[2] ? pathParts[2].replace(/-/g, ' ') : 'Manga')
      const isChapter = pathParts.length >= 4
      const chapterSlug = isChapter && pathParts[3] ? pathParts[3] : ''
      const mangaOverviewUrl = `https://yumezone.live/manga/${pathParts[1]}/${pathParts[2]}`

      presenceData.type = ActivityType.Watching
      presenceData.details = title
      presenceData.state = isChapter && chapterSlug
        ? chapterSlug.replace(/-/g, ' ').toUpperCase()
        : 'Manga Overview'

      // Show dynamic manga cover art
      if (cover) {
        presenceData.largeImageKey = getPosterImage() ?? ActivityAssets.Logo
      }
      presenceData.largeImageText = title
      presenceData.smallImageKey = isChapter ? Assets.Reading : Assets.Viewing
      presenceData.smallImageText = isChapter ? 'Reading' : 'Viewing'

      if (buttons) {
        presenceData.buttons = isChapter
          ? [
              {
                label: 'Read Chapter',
                url: href,
              },
              {
                label: 'Manga Overview',
                url: mangaOverviewUrl,
              },
            ]
          : [
              {
                label: 'View Manga',
                url: href,
              },
            ]
      }

      if (privacyMode) {
        presenceData.details = 'Reading Manga'
        presenceData.state = 'Online Reader'
        presenceData.largeImageKey = ActivityAssets.Logo
        delete presenceData.buttons
      }

      presence.setActivity(presenceData)
      return
    }
  }

  // 3. ANIME DETAILS / INFO: /anime/:id
  if (pathname.startsWith('/anime/')) {
    const title = document.querySelector<HTMLElement>('h1, .anime-title')?.textContent?.trim() || 'Anime'
    const animeId = pathname.split('/').filter(Boolean)[1] ?? ''

    presenceData.type = ActivityType.Watching
    presenceData.details = title
    presenceData.state = 'Anime Overview'
    if (cover) {
      presenceData.largeImageKey = getPosterImage() ?? ActivityAssets.Logo
    }
    presenceData.largeImageText = title
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Viewing'

    if (buttons) {
      presenceData.buttons = [
        {
          label: 'View Anime',
          url: href,
        },
        {
          label: 'Watch Anime',
          url: animeId ? `https://yumezone.live/watch/${animeId}/1` : href,
        },
      ]
    }

    if (privacyMode) {
      presenceData.details = strings.watchingAnime || 'Watching Anime'
      presenceData.state = 'Browsing'
      presenceData.largeImageKey = ActivityAssets.Logo
      delete presenceData.buttons
    }

    presence.setActivity(presenceData)
    return
  }

  // 4. USER PROFILE: /profile or /profile/:username
  if (pathname.startsWith('/profile')) {
    const rawUsername = pathname.split('/').filter(Boolean)[1]
    const domUsername = document.querySelector<HTMLElement>('h1')?.textContent?.trim()
    const username = domUsername || rawUsername || 'User'

    presenceData.type = ActivityType.Watching
    presenceData.details = `${username}'s Profile`
    presenceData.state = 'Viewing Profile'

    const avatar = getUserAvatar()
    presenceData.largeImageKey = avatar ?? ActivityAssets.Logo
    presenceData.largeImageText = `${username}'s Profile`
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Profile'

    if (buttons) {
      presenceData.buttons = [
        {
          label: strings.buttonViewProfile || 'View Profile',
          url: href,
        },
        {
          label: 'View Community',
          url: 'https://yumezone.live/community',
        },
      ]
    }

    if (privacyMode) {
      presenceData.details = 'Profile'
      presenceData.state = 'Viewing Profile'
      presenceData.largeImageKey = ActivityAssets.Logo
      delete presenceData.buttons
    }

    presence.setActivity(presenceData)
    return
  }

  // 5. COMMUNITY: /community or /community/:id
  if (pathname.startsWith('/community')) {
    const pathParts = pathname.split('/').filter(Boolean)
    const isPost = pathParts.length >= 2

    presenceData.type = ActivityType.Watching
    presenceData.details = 'Community Hub'
    presenceData.state = isPost ? 'Reading Discussion' : 'Browsing Discussions'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Discussions'

    if (buttons) {
      presenceData.buttons = [
        {
          label: isPost ? 'View Discussion' : 'Join Community',
          url: href,
        },
      ]
    }

    presence.setActivity(presenceData)
    return
  }

  // 6. SEARCH / CATALOG SEARCH
  const searchParams = new URLSearchParams(search)
  const query = searchParams.get('q') || searchParams.get('search')
  if (query) {
    presenceData.type = ActivityType.Watching
    presenceData.details = strings.searchFor
    presenceData.state = query
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Searching'

    if (buttons) {
      presenceData.buttons = [
        {
          label: 'Search Results',
          url: href,
        },
      ]
    }

    presence.setActivity(presenceData)
    return
  }

  // 7. DEFAULT BROWSING / HOME
  if (!browsing) {
    return presence.clearActivity()
  }

  presenceData.type = ActivityType.Watching
  presenceData.details = strings.viewHome || 'Home'
  presenceData.state = 'Browsing Catalog'

  presence.setActivity(presenceData)
})
