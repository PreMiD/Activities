import { ActivityType, Assets, getTimestamps } from 'premid'

const ready_to_use_posters = true

const presence = new Presence({
  clientId: '1255462235958939689',
})

let currentId = ''
let currentTimestamp = Math.floor(Date.now() / 1000)

function updateTimestamp(id: string): void {
  if (currentId !== id) {
    currentId = id
    currentTimestamp = Math.floor(Date.now() / 1000)
  }
}

enum ActivityAssets {
  Logo = 'https://api.lunaranime.ru/static/rpc/icon.png?v=3',
}

interface LunarActivity {
  type: 'anime' | 'manga' | 'novel'
  id: string
  title: string
  meta?: string
  cover?: string
}

function readBridge(): LunarActivity | null {
  try {
    const raw = document.documentElement.getAttribute('data-premid-activity')
    if (!raw)
      return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed.title !== 'string' || !parsed.title)
      return null
    return parsed
  }
  catch {
    return null
  }
}

function pageTitle(): string | null {
  const og = document
    .querySelector<HTMLMetaElement>('meta[property="og:title"]')
    ?.content
  let title = og || document.title
  if (!title)
    return null
  title = (title.split(' | ')[0] ?? '')
    .replace(/\s*-\s*(?:S\d+\s*E|Ch\.\s*)\d.*$/i, '')
    .trim()
  if (
    !title
    || /^lunar(?:anime|\s+realms)?$/i.test(title)
    || /gateway to anime/i.test(title)
  ) {
    return null
  }
  return title
}

function pageCover(): string | null {
  return (
    document.querySelector<HTMLMetaElement>('meta[property="og:image"]')
      ?.content || null
  )
}

function titleFromSlug(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function fallbackFromPath(pathname: string): LunarActivity | null {
  const [section, slug, second, third] = pathname.split('/').filter(Boolean)
  if (!section || !slug)
    return null
  const title = pageTitle() ?? titleFromSlug(slug)
  const cover = pageCover() ?? undefined
  if (section === 'anime' && second && third) {
    return {
      type: 'anime',
      id: slug,
      title,
      meta: `Season ${second} · Episode ${third}`,
      cover,
    }
  }
  if (section === 'manga' && second) {
    return { type: 'manga', id: slug, title, meta: `Ch. ${second}`, cover }
  }
  if (section === 'novel' && second) {
    return { type: 'novel', id: slug, title, cover }
  }
  return null
}

const detailSections: Record<string, string> = {
  anime: 'Viewing anime',
  animes: 'Viewing anime',
  manga: 'Viewing manga',
  novel: 'Viewing a novel',
  novels: 'Viewing a novel',
}

const searchSections: Record<string, string> = {
  anime: 'Searching anime',
  animes: 'Searching anime',
  manga: 'Searching manga',
  novel: 'Searching novels',
  novels: 'Searching novels',
}

const sectionDetails: Record<string, string> = {
  'animes': 'Browsing anime',
  'manga': 'Browsing manga',
  'novels': 'Browsing novels',
  'home': 'Browsing the home page',
  'releases': 'Checking new releases',
  'genres': 'Browsing genres',
  'events': 'Checking events',
  'gacha': 'Rolling gacha',
  'casino': 'In the casino',
  'marketplace': 'Browsing the marketplace',
  'shop': 'Browsing the shop',
  'trade': 'Trading',
  'chat': 'Chatting',
  'rooms': 'In a room',
  'community': 'Browsing the community',
  'guilds': 'Browsing guilds',
  'leaderboard': 'Viewing the leaderboard',
  'achievements': 'Viewing achievements',
  'playlist': 'Browsing playlists',
  'manga-playlist': 'Browsing playlists',
  'novel-playlist': 'Browsing playlists',
  'video-playlist': 'Browsing playlists',
  'videos': 'Watching videos',
  'donate': 'Supporting Lunar',
  'rewards': 'Claiming rewards',
  'settings': 'Adjusting settings',
}

presence.on('UpdateData', async () => {
  const [privacy, browsingActivity, cover, timestamps, buttons, hideWhenPaused]
    = await Promise.all([
      presence.getSetting<boolean>('privacy'),
      presence.getSetting<boolean>('browsingActivity'),
      presence.getSetting<boolean>('cover'),
      presence.getSetting<boolean>('timestamps'),
      presence.getSetting<boolean>('buttons'),
      presence.getSetting<boolean>('hideWhenPaused'),
    ])

  if (privacy) {
    updateTimestamp('privacy')
    presence.setActivity({
      largeImageKey: ActivityAssets.Logo,
      details: 'Browsing Lunar',
      startTimestamp: currentTimestamp,
    })
    return
  }

  const { pathname, href } = document.location
  const activity = readBridge() ?? fallbackFromPath(pathname)

  if (activity) {
    updateTimestamp(`${activity.type}:${activity.id}`)
    const artwork = activity.cover || pageCover()
    const largeImageKey
      = ready_to_use_posters && cover && artwork
        ? artwork
        : ActivityAssets.Logo

    if (activity.type === 'anime') {
      const presenceData: PresenceData = {
        type: ActivityType.Watching,
        details: activity.title,
        state: activity.meta,
        largeImageKey,
        largeImageText: activity.title,
        smallImageKey: Assets.Play,
        smallImageText: 'Watching',
        startTimestamp: currentTimestamp,
      }

      const video = document.querySelector<HTMLVideoElement>('video')
      if (video && !Number.isNaN(video.duration) && video.duration > 0) {
        if (video.paused) {
          if (hideWhenPaused) {
            presence.clearActivity()
            return
          }
          delete presenceData.startTimestamp
          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = 'Paused'
        }
        else {
          if (video.readyState < 3) {
            presenceData.smallImageKey = Assets.Downloading
            presenceData.smallImageText = 'Buffering'
          }
          if (timestamps) {
            const [start, end] = getTimestamps(
              Math.floor(video.currentTime),
              Math.floor(video.duration),
            )
            presenceData.startTimestamp = start
            presenceData.endTimestamp = end
          }
        }
      }

      if (buttons) {
        presenceData.buttons = [
          { label: 'Watch on Lunar', url: href },
          {
            label: 'View Anime',
            url: `https://lunaranime.ru/anime/${activity.id}`,
          },
        ]
      }

      presence.setActivity(presenceData)
      return
    }

    const presenceData: PresenceData = {
      details: activity.title,
      state: activity.meta,
      largeImageKey,
      smallImageKey: Assets.Reading,
      smallImageText:
        activity.type === 'manga' ? 'Reading Manga' : 'Reading Novel',
      startTimestamp: currentTimestamp,
    }

    if (buttons) {
      presenceData.buttons = [
        { label: 'Read on Lunar', url: href },
        {
          label: activity.type === 'manga' ? 'View Series' : 'View Novel',
          url: `https://lunaranime.ru/${activity.type}/${activity.id}`,
        },
      ]
    }

    presence.setActivity(presenceData)
    return
  }

  if (!browsingActivity) {
    presence.clearActivity()
    return
  }

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'Browsing Lunar',
  }

  const [section, slug] = pathname.split('/').filter(Boolean)

  const searchParams = new URLSearchParams(document.location.search)
  const searchQuery = (
    searchParams.get('query') ?? searchParams.get('q') ?? ''
  ).trim()

  const titleSearch = document.querySelector<HTMLInputElement>(
    'input[placeholder^="Search anime"]',
  )
  const userSearch = document.querySelector<HTMLInputElement>(
    'input[placeholder^="Search by username"]',
  )

  if (section && slug === 'search' && searchSections[section]) {
    updateTimestamp(`search:${section}`)
    presenceData.details = searchSections[section]
    if (searchQuery)
      presenceData.state = searchQuery
    presenceData.smallImageKey = Assets.Search
    if (buttons) {
      presenceData.buttons = [
        { label: 'View on Lunar', url: href },
      ]
    }
  }
  else if (titleSearch?.value) {
    updateTimestamp('search:titles')
    presenceData.details = 'Searching titles'
    presenceData.state = titleSearch.value
    presenceData.smallImageKey = Assets.Search
  }
  else if (section === 'search' || userSearch?.value) {
    updateTimestamp('search:users')
    presenceData.details = 'Searching users'
    const query = userSearch?.value || searchQuery
    if (query)
      presenceData.state = query
    presenceData.smallImageKey = Assets.Search
  }
  else if (section === 'profile' && slug) {
    updateTimestamp(`profile:${slug}`)
    presenceData.details = 'Viewing a profile'
    presenceData.state = decodeURIComponent(slug)
    presenceData.smallImageKey = Assets.Viewing
  }
  else if (section && slug && detailSections[section]) {
    updateTimestamp(`detail:${section}:${slug}`)
    presenceData.details = detailSections[section]
    presenceData.state = pageTitle() ?? titleFromSlug(slug)
    presenceData.smallImageKey = Assets.Viewing
    const detailCover = pageCover()
    if (ready_to_use_posters && cover && detailCover)
      presenceData.largeImageKey = detailCover
    if (buttons) {
      presenceData.buttons = [
        { label: 'View on Lunar', url: href },
      ]
    }
  }
  else if (section && sectionDetails[section]) {
    updateTimestamp(`browse:${section}`)
    presenceData.details = sectionDetails[section]
    presenceData.smallImageKey = Assets.Viewing
  }
  else {
    updateTimestamp('browse:home')
  }

  presenceData.startTimestamp = currentTimestamp
  presence.setActivity(presenceData)
})
