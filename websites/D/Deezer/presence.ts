import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '607651992567021580',
})

let oldLang: string | null = null

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/D/Deezer/assets/logo.png',
}

function fullURL(originalURL: string | null | undefined, hostname: string) {
  if (!originalURL)
    return ''
  else if (originalURL?.includes('https'))
    return originalURL
  else if (originalURL.startsWith('/'))
    return `https://${hostname}${originalURL}`
  else return ''
}

async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      viewAlbum: 'general.buttonViewAlbum',
      viewArtist: 'general.buttonViewArtist',
      viewPodcast: 'general.buttonViewPodcast',
    },

  )
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    largeImageKey: ActivityAssets.Logo,
  }
  let strings = await getStrings()

  const [buttons, newLang, cover, browseInfo, artistAsTitle, showBrowsing, hidePaused] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('browseInfo'),
    presence.getSetting<boolean>('artistAsTitle'),
    presence.getSetting<boolean>('showBrowsing'),
    presence.getSetting<boolean>('hidePaused'),
  ])
  const { pathname, hostname } = document.location

  if (oldLang !== newLang || !oldLang) {
    oldLang = newLang
    strings = await getStrings()
  }

  // Only look inside the player bar so page content can never be mistaken for the current track
  const player = document.querySelector('[data-testid="miniplayer_container"]') ?? document
  const getPlayerElement = <T extends Element = Element>(testId: string) =>
    player.querySelector<T>(`[data-testid="${testId}"]`)

  const progressBar = getPlayerElement<HTMLInputElement>('progress_bar')
  const duration = Number(progressBar?.getAttribute('aria-valuemax') ?? 0)
  const elapsed = Number(progressBar?.getAttribute('aria-valuenow') ?? 0)
  const hasTrack = !!getPlayerElement('item_title')?.textContent?.trim() && duration > 0
  const paused = !getPlayerElement('play_button_pause')

  const pages: Record<string, PresenceData> = {
    shows: {
      details: 'Browsing shows',
    },
    channels: {
      details: 'Browsing channels',
    },
    loved: {
      details: 'Browsing user\'s loved',
    },
    playlists: {
      details: 'Browsing user\'s playlists',
    },
    albums: {
      details: 'Browsing user\'s albums',
    },
    artists: {
      details: 'Browsing user\'s artists',
    },
    podcasts: {
      details: 'Browsing user\'s podcasts',
    },
    show: {
      details: 'Viewing a podcast',
    },
    playlist: {
      details: 'Looking at a playlist',
    },
    album: {
      details: 'Looking at an album',
    },
    artist: {
      details: 'Looking at an artist',
    },
  }
  const page = pathname
    .split('/')
    .reverse()
    .map(segment => pages[segment])
    .find(Boolean)

  // Browsing info is only shown when nothing is actively playing, unless the user asked for browsing info only
  if (showBrowsing && page && (browseInfo || !hasTrack || paused))
    return presence.setActivity({ ...presenceData, ...page } as PresenceData)

  if (!hasTrack || (hidePaused && paused))
    return presence.clearActivity()

  const albumLink = getPlayerElement('item_title')
    ?.querySelector('a')
    ?.getAttribute('href')
  const artistLink = getPlayerElement('item_subtitle')
    ?.querySelector('a')
    ?.getAttribute('href')

  presenceData.details = getPlayerElement('item_title')?.textContent

  const artistElements = [
    ...player.querySelectorAll<HTMLAnchorElement>(
      '[data-testid="item_subtitle"] a',
    ),
  ]
  const joinedArtists = artistElements
    .map(a => a.textContent?.trim())
    .filter((t): t is string => Boolean(t))
    .join(', ')

  if (!artistAsTitle) {
    presenceData.state = joinedArtists
      || getPlayerElement('item_subtitle')?.textContent
  }

  if (artistAsTitle && joinedArtists)
    presenceData.name = joinedArtists

  presenceData.largeImageKey = cover
    ? getPlayerElement('item_cover')
      ?.querySelector('img')
      ?.getAttribute('src')
      ?.replace(/264x264|48x48/g, '512x512') ?? ActivityAssets.Logo
    : ActivityAssets.Logo
  presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
  presenceData.smallImageText = paused ? strings.pause : strings.play;
  [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(elapsed, duration)

  if (paused) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  if (buttons) {
    if (albumLink?.includes('/')) {
      presenceData.buttons = [
        {
          label: strings.viewArtist,
          url: fullURL(artistLink, hostname),
        },
        {
          label: strings.viewAlbum,
          url: fullURL(albumLink, hostname),
        },
      ]
    }
    else {
      presenceData.buttons = [
        {
          label: strings.viewPodcast,
          url: fullURL(artistLink, hostname),
        },
      ]
    }
  }

  presence.setActivity(presenceData)
})
