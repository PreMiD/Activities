import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

// Discord application ID (distinct from the author's user snowflake).
const presence = new Presence({
  clientId: '1575173375473614958',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.postimg.cc/zGHptPYD/image.png',
}

const musicSections: Record<string, string> = {
  '/library': 'Library',
  '/search': 'Search',
  '/settings': 'Settings',
  '/changelog': 'Changelog',
  '/privacy': 'Privacy',
  '/room': 'Rooms',
}

function musicSection(pathname: string): string {
  if (pathname.startsWith('/player/'))
    return 'Player'
  if (pathname.startsWith('/playlist/'))
    return 'Playlist'
  if (pathname.startsWith('/collection/'))
    return 'Collection'
  return musicSections[pathname] ?? 'Home'
}

presence.on('UpdateData', () => {
  const { hostname, pathname } = document.location

  if (hostname === 'music.vishaljadhav.me') {
    // Dapple Music renders a mini player with a button labelled "Open <track>".
    // The player also publishes Media Session metadata and appends an <audio> element.
    const trackButton = document.querySelector<HTMLButtonElement>(
      'button[aria-label^="Open "]',
    )
    const metaSpans = trackButton?.querySelectorAll<HTMLSpanElement>(
      ':scope > span > span',
    )
    const metadata = navigator.mediaSession?.metadata
    // The h1 fallback is only valid on the full-screen /player/:id page; on the
    // home screen the h1 is a section heading like "Trending in English".
    const title
      = metaSpans?.[1]?.textContent?.trim()
        || metadata?.title
        || (pathname.startsWith('/player/')
          ? document.querySelector('h1')?.textContent?.trim()
          : null)
    const artist
      = metaSpans?.[0]?.textContent?.trim()
        || metadata?.artist
        || null
    const artwork
      = trackButton?.querySelector('img')?.getAttribute('src')
        || metadata?.artwork?.[0]?.src
        || ActivityAssets.Logo
    const audio = document.querySelector<HTMLAudioElement>(
      'audio[data-sonora-audio]',
    )
    const playing
      = document
        .querySelector('[aria-label="Playback controls"] button')
        ?.getAttribute('aria-label') === 'Pause'

    // Listening on every page of the music app, including the home screen.
    const data: PresenceData = {
      name: 'Dapple Music',
      type: ActivityType.Listening,
      details: title
        ? title.slice(0, 128)
        : 'Browsing Dapple Music',
      state: title
        ? (artist
            ? `by ${artist}`.slice(0, 128)
            : null)
        : musicSection(pathname),
      largeImageKey: title ? artwork : ActivityAssets.Logo,
      largeImageText: title
        ? (metadata?.album ?? 'Dapple Music')
        : 'Dapple Music',
      startTimestamp: browsingTimestamp,
    }

    if (title) {
      data.smallImageKey = playing ? Assets.Play : Assets.Pause
      data.smallImageText = playing ? 'Playing' : 'Paused'

      if (playing && audio && Number.isFinite(audio.duration) && audio.duration > 0) {
        [data.startTimestamp, data.endTimestamp]
          = getTimestampsFromMedia(audio)
      }
    }

    presence.setActivity(data)
    return
  }

  // Everything else is a "Watching" activity and shows its own hostname as the name.
  const data: PresenceData = {
    name: hostname,
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: hostname,
    startTimestamp: browsingTimestamp,
  }

  if (hostname === 'toolbox.vishaljadhav.me') {
    const tool = document.title
      .replace(/\s*[—-]\s*Toolbox\s*$/i, '')
      .trim()

    if (pathname === '/') {
      data.details = 'Browsing Toolbox'
      data.state = '38 free tools, one tab'
    }
    else {
      data.details = `Using ${tool || 'a tool'}`.slice(0, 128)
      data.state = `toolbox.vishaljadhav.me${pathname}`.slice(0, 128)
    }
  }
  else {
    // Root site and the vishy.dino.icu alias serve the same portfolio.
    const pageTitle = document.title
      .replace(/\s*[|—-]\s*Avyukt\s*$/i, '')
      .trim()
      .slice(0, 128)

    if (pathname === '/') {
      data.details = 'On Avyukt’s site'
      data.state = 'Homepage'
    }
    else if (pathname.startsWith('/blog/')) {
      data.details = 'Reading a blog post'
      data.state = pageTitle || null
    }
    else if (pathname.startsWith('/projects')) {
      data.details = 'Viewing a project'
      data.state = pageTitle || null
    }
    else {
      data.details = 'Browsing Avyukt’s site'
      data.state = pageTitle || pathname.slice(1) || null
    }
  }

  presence.setActivity(data)
})
