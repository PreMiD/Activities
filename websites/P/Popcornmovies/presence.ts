import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1465383098437992448',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/MofAknO.png',
}

enum IconAssets {
  House = 'https://i.imgur.com/d0u9KBC.png',
  UpDown = 'https://i.imgur.com/JAbwLgh.png',
  Crown = 'https://i.imgur.com/46F79PQ.png',
  Person = 'https://i.imgur.com/ZSiPGqT.png',
  Network = 'https://i.imgur.com/he4qHAL.png',
  Sparkle = 'https://i.imgur.com/DBNSiFh.png',
  Cart = 'https://i.imgur.com/Pdhm2Ja.png',
}

function getText(selector: string): string | undefined {
  const element = document.querySelector<HTMLElement>(selector)
  const text = element?.textContent?.replace(/\s+/g, ' ').trim()
  return text || undefined
}

function getImageUrl(selector: string): string | undefined {
  const image = document.querySelector<HTMLImageElement>(selector)
  return image?.currentSrc || image?.src || undefined
}

function isVisible(element: HTMLElement): boolean {
  return element.getClientRects().length > 0
}

function getPageTitle(): string | undefined {
  return getText('main h1, h1')
}

function getPageImage(): string | undefined {
  return getImageUrl('main img[alt]:not([alt=""])')
    || getImageUrl('main img[src*="image.tmdb.org"]')
}

function getMediaPageInfo(): {
  title?: string
  year?: string
  duration?: string
  rating?: string
  genres?: string
} {
  const heading = document.querySelector<HTMLHeadingElement>('main h1, h1')
  const content = heading?.parentElement
  const metadataRow = content?.querySelector<HTMLElement>('div.flex.flex-wrap')
  const metadata = metadataRow
    ? Array.from(metadataRow.children)
        .map(element => element.textContent?.replace(/\s+/g, ' ').trim())
        .filter((value): value is string => Boolean(value))
    : []
  const genres = content
    ? Array.from(content.querySelectorAll<HTMLAnchorElement>('a[href^="/genre/"]'))
        .map(link => link.textContent?.trim())
        .filter((value): value is string => Boolean(value))
        .join(', ')
    : undefined

  return {
    title: heading?.textContent?.replace(/\s+/g, ' ').trim() || undefined,
    rating: metadata[0],
    year: metadata[1],
    duration: metadata[2],
    genres: genres || undefined,
  }
}

function getSelectedSeason(): string | undefined {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('button[aria-pressed="true"]'))
    .map(button => button.textContent?.replace(/\s+/g, ' ').trim())
    .find(text => text && /^Season \d+$/.test(text))
}

function getStructuredDataImage(): string | undefined {
  for (const script of document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')) {
    try {
      const data = JSON.parse(script.textContent || '') as { image?: string | string[] }
      const image = Array.isArray(data.image) ? data.image[0] : data.image

      if (typeof image === 'string' && image.includes('image.tmdb.org/t/p/w500/')) {
        return `https://images.weserv.nl/?url=${encodeURIComponent(image)}&w=92&h=92&fit=cover&output=jpg`
      }
    }
    catch {
    }
  }
}

presence.on('UpdateData', async () => {
  const [strings, privacyMode, showJoinPartyButton] = await Promise.all([
    presence.getStrings({
      browse: 'general.browsing',
      home: 'general.viewHome',
      paused: 'general.paused',
      playing: 'general.playing',
      profile: 'general.viewProfile',
      search: 'general.search',
      searchFor: 'general.searchFor',
      viewGenre: 'general.viewGenre',
      viewPage: 'general.viewPage',
    }),
    presence.getSetting<boolean>('privacyMode'),
    presence.getSetting<boolean>('showJoinPartyButton'),
  ])

  const { pathname } = document.location
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Playing,
  }

  const globalSearch = document.querySelector<HTMLInputElement>(
    'input[aria-label="Search the catalog"]',
  )
  if (globalSearch && isVisible(globalSearch) && globalSearch.value.trim()) {
    presenceData.details = strings.searchFor
    presenceData.state = globalSearch.value.trim()
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = strings.search
    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/watch/')) {
    const player = document.querySelector<HTMLElement>('[data-media-player]')
    const video = player?.querySelector<HTMLVideoElement>('video')
    const partyId = new URLSearchParams(document.location.search).get('party')?.trim()
    const partyHeader = Array.from(document.querySelectorAll<HTMLElement>('span'))
      .find(element => element.textContent?.trim() === 'Watch Party' && element.querySelector('svg.lucide-users'))
      ?.parentElement
    const watchingText = partyHeader?.querySelector<HTMLElement>(':scope > span:last-child')?.textContent?.trim()
    const partyStatus = partyId
      ? `Watch Party${watchingText && /^\d+ watching$/.test(watchingText) ? ` • ${watchingText}` : ''}`
      : undefined
    const title = player?.getAttribute('aria-label')?.replace(/^Video Player - /, '').trim()
      || player?.querySelector<HTMLElement>('h2')?.textContent?.trim()
      || player?.querySelector<HTMLImageElement>('img[alt]')?.alt

    if (video) {
      const isPlaying = !video.paused && !video.ended && video.readyState > 2

      presenceData = {
        ...presenceData,
        type: ActivityType.Watching,
      }
      if (privacyMode) {
        presenceData.name = 'a movie'
        delete presenceData.details
        delete presenceData.state
        delete presenceData.smallImageKey
        delete presenceData.smallImageText
        delete presenceData.largeImageText
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
      else {
        if (!title)
          return

        const mediaMetadata = player?.querySelector<HTMLElement>('h2 + div')
        const metadataValues = mediaMetadata
          ? Array.from(mediaMetadata.querySelectorAll<HTMLElement>('.tabular-nums'))
              .map(element => element.textContent?.trim())
              .filter((value): value is string => Boolean(value))
          : []
        const year = metadataValues[0]
        const rating = metadataValues[1]
        const metadataText = [year, rating && `${rating} Stars`]
          .filter(Boolean)
          .join(' • ')

        presenceData.name = title
        presenceData.details = title
        if (metadataText || partyStatus)
          presenceData.state = [metadataText, partyStatus].filter(Boolean).join(' • ')
        else
          delete presenceData.state
        presenceData.smallImageKey = isPlaying ? Assets.Play : Assets.Pause
        presenceData.smallImageText = isPlaying ? strings.playing : strings.paused

        const poster = player?.querySelector<HTMLImageElement>('img[alt]')
        if (poster?.currentSrc || poster?.src) {
          presenceData.largeImageKey = poster.currentSrc || poster.src
          presenceData.largeImageText = title
        }

        if (isPlaying && Number.isFinite(video.duration) && video.duration > 0) {
          [presenceData.startTimestamp, presenceData.endTimestamp]
            = getTimestamps(video.currentTime, video.duration)
        }
        else {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }

        if (partyId && showJoinPartyButton) {
          const partyUrl = new URL(pathname, document.location.origin)
          partyUrl.searchParams.set('party', partyId)
          presenceData.buttons = [{ label: 'Join Party', url: partyUrl.href }]
        }
      }

      presence.setActivity(presenceData)
      return
    }
  }

  if (pathname === '/search') {
    const query = new URLSearchParams(document.location.search).get('q')?.trim()
      || document.querySelector<HTMLInputElement>('input[aria-label="Search the catalogue"]')?.value.trim()

    presenceData.details = strings.searchFor
    presenceData.state = query || strings.search
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = strings.search
    presence.setActivity(presenceData)
    return
  }

  if (/^\/(?:movie|tv)\/[^/]+/.test(pathname)) {
    const mediaInfo = getMediaPageInfo()
    const isMovie = pathname.startsWith('/movie/')
    const selectedSeason = isMovie ? undefined : getSelectedSeason()
    const title = mediaInfo.title || (isMovie ? 'Movie' : 'Series')
    const titleWithYear = mediaInfo.year ? `${title} (${mediaInfo.year})` : title
    const metadataText = [
      selectedSeason,
      mediaInfo.duration,
      mediaInfo.rating && `${mediaInfo.rating} Stars`,
      mediaInfo.genres,
    ]
      .filter(Boolean)
      .join(' • ')

    presenceData.details = titleWithYear
    if (metadataText)
      presenceData.state = metadataText
    else
      delete presenceData.state
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = strings.browse

    const image = getStructuredDataImage() || getPageImage()
    if (image) {
      presenceData.smallImageKey = image
    }

    presence.setActivity(presenceData)
    return
  }

  const title = getPageTitle()
  let details: string = strings.viewPage
  let state: string = title || strings.browse

  if (pathname === '/' || pathname === '') {
    details = strings.home
    state = strings.browse
    presenceData.smallImageKey = IconAssets.House
  }
  else if (pathname === '/browse') {
    details = strings.viewPage
    state = 'Browse'
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname === '/store') {
    details = 'Viewing Store'
    state = strings.browse
    presenceData.smallImageKey = IconAssets.Cart
  }
  else if (pathname === '/movies') {
    details = strings.viewPage
    state = 'Movies'
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname === '/tv') {
    details = strings.viewPage
    state = 'TV Shows'
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname === '/anime') {
    details = strings.viewPage
    state = 'Anime'
    presenceData.smallImageKey = IconAssets.Sparkle
  }
  else if (pathname === '/trending') {
    details = strings.viewPage
    state = 'Trending'
    presenceData.smallImageKey = IconAssets.UpDown
  }
  else if (pathname === '/moods') {
    details = strings.viewPage
    state = 'Moods'
    presenceData.smallImageKey = IconAssets.Sparkle
  }
  else if (pathname.startsWith('/moods/')) {
    details = strings.viewGenre
    presenceData.smallImageKey = IconAssets.Sparkle
  }
  else if (pathname.startsWith('/genre/')) {
    details = strings.viewGenre
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname === '/networks') {
    details = strings.viewPage
    state = 'Networks'
    presenceData.smallImageKey = IconAssets.Network
  }
  else if (pathname.startsWith('/network/')) {
    details = 'Viewing Network'
    state = getText('section .eyebrow + h1') || title || strings.browse
    presenceData.smallImageKey = IconAssets.Network
  }
  else if (pathname === '/people') {
    details = strings.viewPage
    state = 'People'
    presenceData.smallImageKey = IconAssets.Person
  }
  else if (pathname.startsWith('/person/')) {
    details = strings.profile
    presenceData.smallImageKey = IconAssets.Person
  }
  else if (pathname === '/leaderboard') {
    details = strings.viewPage
    state = 'Leaderboard'
    presenceData.smallImageKey = IconAssets.Crown
  }

  presenceData.details = details
  presenceData.state = state
  if (presenceData.smallImageKey)
    presenceData.smallImageText = strings.browse
  presence.setActivity(presenceData)
})
