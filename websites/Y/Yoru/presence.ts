import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1526166989419315270',
})
const browsingTimestamp = Math.floor(Date.now() / 1_000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/Y/Yoru/assets/logo.png',
}

// Yoru serves every episode as Hard Sub, Soft Sub or Dub. The chosen track is
// in the "type" query parameter, and mirrored by the active pill in the player.
function audioLabel(type: string | null | undefined): string {
  switch (type?.toLowerCase()) {
    case 'sub':
      return 'Hard Sub'
    case 'softsub':
      return 'Soft Sub'
    case 'dub':
      return 'Dub'
    default:
      return ''
  }
}

// Discord caps the details and state rows at 128 characters.
function clamp(text: string): string {
  return text.length > 128 ? `${text.slice(0, 127)}…` : text
}

function textOf(selector: string): string {
  const text = document.querySelector(selector)?.textContent?.trim() ?? ''
  // Empty fields on Yoru render as an em dash placeholder until data arrives.
  return text === '—' ? '' : text
}

function coverOf(selector: string): string | null {
  const source = document.querySelector<HTMLImageElement>(selector)?.src
  return source?.startsWith('https://') ? source : null
}

// "/watch/one-piece-episode-12" and "/watch/one-piece/" both point at the
// "/anime/one-piece" detail page.
function animeSlug(pathname: string): string {
  const slug = pathname.slice('/watch/'.length).replace(/\/+$/, '')
  return slug.replace(/(?:-episode-|\/episode\/)\d+$/i, '')
}

presence.on('UpdateData', async () => {
  const [privacy, showCover, showTimestamps, showButtons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('showTimestamps'),
    presence.getSetting<boolean>('showButtons'),
  ])
  const { pathname, href, origin, search } = document.location
  const searchParams = new URLSearchParams(search)
  const presenceData: PresenceData = {
    name: 'Yoru',
    type: ActivityType.Watching,
    details: 'Browsing Yoru',
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'Yoru',
    startTimestamp: browsingTimestamp,
  }

  if (pathname.startsWith('/watch/')) {
    const video = document.querySelector<HTMLVideoElement>('#vid')
    const title = textOf('#watch-info-title')
    const episode = textOf('#watch-ep-title')
    const audio = audioLabel(
      searchParams.get('type')
      ?? document.querySelector<HTMLElement>('#type-pills .type-pill.active')?.dataset.type,
    )

    presenceData.details = privacy || !title ? 'Watching an anime' : clamp(title)

    if (!privacy) {
      const state = [episode, audio].filter(Boolean).join(' • ')

      if (state)
        presenceData.state = clamp(state)

      const cover = showCover ? coverOf('#watch-info-cover') : null

      if (cover) {
        presenceData.largeImageKey = cover
        // The title already occupies the details row, so name the site here
        // instead of repeating it.
        presenceData.largeImageText = 'Watching on Yoru'
      }

      presenceData.detailsUrl = href
    }

    if (video) {
      const paused = video.paused || video.ended

      presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = paused ? 'Paused' : 'Playing'

      if (showTimestamps && !paused && video.duration > 0) {
        [presenceData.startTimestamp, presenceData.endTimestamp]
          = getTimestampsFromMedia(video)
      }
      else {
        // Leaving startTimestamp in place would make Discord count up from the
        // moment the page loaded, which has nothing to do with playback.
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }

    if (showButtons && !privacy) {
      const slug = animeSlug(pathname)

      presenceData.buttons = slug
        ? [
            { label: 'Watch Episode', url: href },
            { label: 'View Anime', url: `${origin}/anime/${slug}` },
          ]
        : [{ label: 'Watch Episode', url: href }]
    }
  }
  else if (pathname.startsWith('/anime/')) {
    const title = textOf('#detail-title')

    presenceData.details = 'Looking at an anime'

    if (!privacy && title) {
      presenceData.state = clamp(title)
      presenceData.detailsUrl = href

      const cover = showCover ? coverOf('#detail-cover') : null

      if (cover) {
        presenceData.largeImageKey = cover
        presenceData.largeImageText = title
        // Nothing is competing for the badge on this page, unlike the player
        // where it carries the playing/paused state.
        presenceData.smallImageKey = ActivityAssets.Logo
        presenceData.smallImageText = 'Yoru'
      }

      if (showButtons)
        presenceData.buttons = [{ label: 'View Anime', url: href }]
    }
  }
  else if (pathname.startsWith('/user/')) {
    const username = decodeURIComponent(pathname.slice('/user/'.length))

    presenceData.details = 'Looking at a profile'

    if (!privacy && username) {
      presenceData.state = clamp(username)
      presenceData.detailsUrl = href
    }
  }
  else {
    switch (pathname) {
      case '/search': {
        const query = searchParams.get('q')?.trim()

        presenceData.details = 'Searching for an anime'

        if (!privacy && query)
          presenceData.state = clamp(query)

        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = 'Searching'
        break
      }
      case '/latest':
        presenceData.details = 'Browsing the latest episodes'
        break
      case '/schedule':
        presenceData.details = 'Browsing the airing schedule'
        break
      case '/changelog':
        presenceData.details = 'Reading the changelog'
        break
      case '/profile':
        presenceData.details = 'Looking at their profile'
        break
      case '/':
      case '/index.html':
        presenceData.details = 'Browsing the homepage'
        break
      default:
        break
    }
  }

  presence.setActivity(presenceData)
})
