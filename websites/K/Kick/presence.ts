import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({ clientId: '1125405319594512404' })
let browsingTimestamp = Math.floor(Date.now() / 1000)
let prevUrl = ''

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/K/Kick/assets/logo.png',
}

interface PageData {
  details?: string
  state?: string
  largeImageKey?: string
  largeImageText?: string
  smallImageKey?: string
  smallImageText?: string
  buttons?: [ButtonData, ButtonData?]
  isLive?: boolean
  isMedia?: boolean
}

presence.on('UpdateData', async () => {
  const { pathname, hostname, href, search } = document.location
  if (prevUrl !== href) {
    prevUrl = href
    browsingTimestamp = Math.floor(Date.now() / 1000)
  }

  const videoEl = document.querySelector<HTMLVideoElement>('video')
  const pathArr = pathname.split('/')
  const pageData = getPageData(
    pathArr[1] ?? '',
    pathArr[2] ?? '',
    pathArr[3] ?? '',
    hostname,
    href,
    search,
    videoEl,
  )

  if (!pageData)
    return

  const {
    details,
    smallImageKey,
    smallImageText,
    largeImageKey,
    largeImageText,
    state,
    buttons,
    isLive,
    isMedia,
  } = pageData

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: largeImageKey || ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: truncate(details),
  }

  if (largeImageText)
    presenceData.largeImageText = truncate(largeImageText)
  if (buttons)
    presenceData.buttons = buttons
  if (smallImageKey)
    presenceData.smallImageKey = smallImageKey
  if (smallImageText)
    presenceData.smallImageText = truncate(smallImageText)
  if (state)
    presenceData.state = truncate(state)

  // Media timestamp handling: ONLY for VODs / recorded videos with a finite duration
  if (isMedia && videoEl && Number.isFinite(videoEl.duration) && videoEl.duration > 0) {
    presenceData.smallImageKey = videoEl.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = videoEl.paused ? 'Paused' : 'Playing'
    if (!videoEl.paused) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(videoEl)
    }
    else {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
  }
  else if (isLive) {
    // For live streams: elapsed time only, never set endTimestamp
    delete presenceData.endTimestamp
    if (videoEl?.paused) {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Paused'
    }
    else {
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = 'Live'
    }
  }

  if (!(await presence.getSetting<boolean>('details'))) {
    presenceData.details = 'Browsing Kick...'
    delete presenceData.state
    presenceData.largeImageKey = ActivityAssets.Logo
    delete presenceData.largeImageText
    delete presenceData.smallImageKey
    delete presenceData.smallImageText
    delete presenceData.buttons
    delete presenceData.endTimestamp
  }

  if (await presence.getSetting<boolean>('logo')) {
    presenceData.largeImageKey = ActivityAssets.Logo
    delete presenceData.largeImageText
  }

  if (
    presenceData.smallImageKey === Assets.Play
    || presenceData.smallImageKey === Assets.Pause
    || presenceData.smallImageKey === Assets.Viewing
    || presenceData.smallImageKey === Assets.Live
    || isLive
    || isMedia
  ) {
    presenceData.type = ActivityType.Watching
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
})

function getPageData(
  page: string,
  pageDetail: string,
  title: string,
  hostname: string,
  url: string,
  search: string,
  videoEl: HTMLVideoElement | null,
): PageData | undefined {
  switch (hostname) {
    case 'kick.com': {
      switch (page) {
        case '':
          return {
            details: 'Viewing home...',
            smallImageKey: Assets.Search,
            smallImageText: 'Browsing',
          }

        case 'browse':
        case 'categories': {
          const activeMainCategory = document.querySelector(
            'a.category-tile-active, [data-testid="category-tile-active"]',
          )?.textContent?.trim()
          let state = activeMainCategory ?? ''
          let largeImageKey = ''

          if (activeMainCategory) {
            const imageElement = document.querySelector<HTMLImageElement>(
              'a.category-tile-active img, [data-testid="category-tile-active"] img',
            )
            if (imageElement?.src)
              largeImageKey = imageElement.src
          }

          if (pageDetail && title) {
            state += ` > ${formatText(pageDetail)} > ${formatText(title)}`
            const subCategoryImg = document.querySelector<HTMLImageElement>('div.h-full > img')?.src
            if (subCategoryImg)
              largeImageKey = subCategoryImg
          }

          return {
            details: 'Browsing categories...',
            state: state || undefined,
            largeImageKey: largeImageKey || ActivityAssets.Logo,
            smallImageKey: Assets.Search,
            smallImageText: 'Browsing',
          }
        }

        case 'category': {
          const categoryName = document.querySelector('h1')?.textContent?.trim()
            || (pageDetail ? formatText(pageDetail) : 'Category')
          const categoryImg = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content?.trim()
            || document.querySelector<HTMLImageElement>('img[src*="subcategories"]')?.src

          return {
            details: 'Browsing category...',
            state: categoryName,
            largeImageKey: categoryImg || ActivityAssets.Logo,
            smallImageKey: Assets.Search,
            smallImageText: 'Browsing',
          }
        }

        case 'following': {
          return {
            details: 'Viewing following...',
            state: document.querySelector('.\\!border-primary\\/100, [aria-selected="true"]')?.textContent?.trim() || undefined,
            smallImageKey: Assets.Search,
            smallImageText: 'Following',
          }
        }

        case 'dashboard': {
          const activeItem = document.querySelector(
            '.router-link-active .item-title, [aria-current="page"]',
          )?.textContent?.trim()

          return {
            details: 'Viewing dashboard...',
            state: activeItem || undefined,
            smallImageKey: Assets.Viewing,
            smallImageText: 'Dashboard',
          }
        }

        case 'search': {
          const query = document.querySelector<HTMLInputElement>('input[type="search"], [data-testid="search-input"]')?.value?.trim()
          return {
            details: 'Searching on Kick...',
            state: query ? `Searching: ${query}` : undefined,
            smallImageKey: Assets.Search,
            smallImageText: 'Searching',
          }
        }

        case 'transactions': {
          return {
            details: `Viewing ${formatText(page)}...`,
            state: pageDetail ? formatText(pageDetail) : undefined,
          }
        }

        case 'advertising-policy':
        case 'community-guidelines':
        case 'cookie-policy':
        case 'dmca-policy':
        case 'kicks-usage-policy':
        case 'privacy-policy':
        case 'terms-of-service':
          return {
            details: `Reading ${formatText(page)}...`,
            smallImageKey: Assets.Reading,
            smallImageText: 'Reading',
          }

        default: {
          // Channel page (live stream, VOD, clip, or offline)
          const streamer = getStreamerName(page)
          if (!streamer) {
            return {
              details: 'Browsing Kick...',
            }
          }

          const avatar = getStreamerAvatar()
          const livestreamTitle = getLivestreamTitle()
          const category = getStreamCategory()
          const searchParams = new URLSearchParams(search)
          const isVOD = searchParams.has('video')
          const isClip = new URL(url).pathname.includes('/clips/') || searchParams.has('clip')
          const isMedia = isVOD || isClip || (Boolean(videoEl) && Number.isFinite(videoEl?.duration) && (videoEl?.duration ?? 0) > 0 && !isChannelLive(videoEl))

          if (isMedia) {
            const details = livestreamTitle || (isClip ? 'Watching Clip' : 'Watching Stream VOD')
            const state = category ? `${streamer} • ${category}` : streamer

            return {
              details,
              state,
              largeImageKey: avatar || ActivityAssets.Logo,
              largeImageText: streamer,
              smallImageKey: videoEl ? (videoEl.paused ? Assets.Pause : Assets.Play) : undefined,
              smallImageText: videoEl ? (videoEl.paused ? 'Paused' : 'Playing') : undefined,
              buttons: [
                {
                  label: isClip ? 'Watch Clip' : 'Watch Stream VOD',
                  url,
                },
              ],
              isMedia: true,
            }
          }

          const isLive = isChannelLive(videoEl)
          if (isLive) {
            const details = livestreamTitle || 'Live Stream'
            const state = category ? `Watching: ${streamer} • ${category}` : `Watching: ${streamer}`

            return {
              details,
              state,
              largeImageKey: avatar || ActivityAssets.Logo,
              largeImageText: streamer,
              smallImageKey: videoEl?.paused ? Assets.Pause : Assets.Live,
              smallImageText: videoEl?.paused ? 'Paused' : 'Live',
              buttons: [
                {
                  label: 'Watch Stream',
                  url,
                },
              ],
              isLive: true,
            }
          }

          // Offline channel
          return {
            details: `Viewing ${streamer}`,
            state: 'Offline',
            largeImageKey: avatar || ActivityAssets.Logo,
            largeImageText: streamer,
            smallImageKey: Assets.Viewing,
            smallImageText: 'Offline',
            buttons: [
              {
                label: 'View Channel',
                url,
              },
            ],
          }
        }
      }
    }

    case 'help.kick.com': {
      const topic = document.querySelector('header.text-2xl')?.textContent?.trim()
      switch (pageDetail) {
        case 'collections': {
          return {
            details: topic ?? 'Unknown title',
            state: 'Searching resource category...',
            smallImageKey: Assets.Search,
            smallImageText: 'Searching',
          }
        }
        case 'articles': {
          return {
            details: topic ?? 'Unknown title',
            state: 'Reading article...',
            smallImageKey: Assets.Reading,
            smallImageText: 'Reading',
          }
        }
        default: {
          return { details: 'Browsing Kick Help...' }
        }
      }
    }
  }
}

function getStreamerName(page?: string): string | undefined {
  return (
    document.querySelector('[data-testid="channel-username"] [data-slot="button-label"]')?.textContent?.trim()
    || document.querySelector('[data-testid="channel-username"]')?.textContent?.trim()
    || document.querySelector('h1[data-testid="channel-username"]')?.textContent?.trim()
    || document.querySelector('.stream-username, #channel-username')?.textContent?.trim()
    || document.querySelector<HTMLMetaElement>('meta[property="og:image:alt"]')?.content?.trim()
    || document.querySelector<HTMLMetaElement>('meta[name="twitter:image:alt"]')?.content?.trim()
    || (page ? formatText(page) : undefined)
  )
}

function getStreamerAvatar(): string | undefined {
  return (
    document.querySelector<HTMLImageElement>('img[data-testid="channel-avatar"]')?.src
    || document.querySelector<HTMLImageElement>('.owner-avatar img')?.src
    || document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content?.trim()
    || document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]')?.content?.trim()
  )
}

function getLivestreamTitle(): string | undefined {
  const elTitle = document.querySelector('[data-testid="livestream-title"]')?.textContent?.trim()
    || document.querySelector('h2[data-testid="livestream-title"]')?.textContent?.trim()
  if (elTitle)
    return elTitle

  const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content?.trim()
  if (ogTitle) {
    const cleaned = ogTitle
      .replace(/\s*Live Stream\s*-\s*Watch Live on KICK/i, '')
      .replace(/\s*-\s*Watch Live on KICK/i, '')
      .replace(/\s*-\s*KICK$/i, '')
      .trim()
    if (cleaned)
      return cleaned
  }

  return undefined
}

function getStreamCategory(): string | undefined {
  return document.querySelector<HTMLAnchorElement>('a[href^="/category/"]')?.textContent?.trim()
}

function isChannelLive(videoEl: HTMLVideoElement | null): boolean {
  const title = document.title.toLowerCase()
  if (title.includes('live stream') || title.includes('watch live'))
    return true

  const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content?.toLowerCase()
  if (ogTitle && (ogTitle.includes('live stream') || ogTitle.includes('watch live')))
    return true

  const liveBadge = document.querySelector('[data-testid="channel-avatar"]')
    ?.closest('button, div')
    ?.parentElement
    ?.querySelector('.bg-kick-voltGreen-150')
  if (liveBadge?.textContent?.trim().toUpperCase() === 'LIVE')
    return true

  if (videoEl && !videoEl.paused && videoEl.duration === Number.POSITIVE_INFINITY)
    return true

  return false
}

function truncate(text: string | undefined, maxLength = 128): string | undefined {
  if (!text)
    return undefined
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text
}

function formatText(text: string) {
  return text
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (match: string) => match.toUpperCase())
    .replace(/%C2%A0$/, '')
}
