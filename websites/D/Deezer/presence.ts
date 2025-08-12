import { ActivityType, Assets } from 'premid'

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
  let presenceData: PresenceData = {
    type: ActivityType.Listening,
    largeImageKey: ActivityAssets.Logo,
  }
  let strings = await getStrings()
  let paused = false

  const [buttons, newLang, cover, browseInfo] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('browseInfo'),
  ])
  const { pathname, hostname } = document.location
  const remainingTest = document.querySelector(
    '[data-testid="remaining_time"]',
  )?.textContent

  if (oldLang !== newLang || !oldLang) {
    oldLang = newLang
    strings = await getStrings()
  }

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
  for (const [path, data] of Object.entries(pages)) {
    if (pathname.includes(path)) {
      presenceData = { ...presenceData, ...data } as PresenceData
      if (browseInfo || !remainingTest || remainingTest === '00:00')
        return presence.setActivity(presenceData)
    }
  }

  const albumLink = document
    .querySelector('[data-testid="item_title"] > a')
    ?.getAttribute('href')
  const artistLink = document
    .querySelector('[data-testid="item_subtitle"] > a')
    ?.getAttribute('href')
  const timestamps = presence.getTimestamps(
    presence.timestampFromFormat(
      document.querySelector('[data-testid="elapsed_time"]')?.textContent ?? '',
    ),
    presence.timestampFromFormat(
      document.querySelector('[data-testid="remaining_time"]')?.textContent ?? '',
    ),
  )

  if (document.querySelector('[data-testid="play_button_play"]'))
    paused = true

  presenceData.details = document.querySelector(
    '[data-testid="item_title"]',
  )?.textContent
  presenceData.state = document.querySelector(
    '[data-testid="item_subtitle"]',
  )?.textContent

  const mainArtistName = document
    .querySelector('[data-testid="item_subtitle"] > a')
    ?.textContent?.trim()
  if (mainArtistName)
    presenceData.name = mainArtistName

  presenceData.largeImageKey = cover
    ? document
      .querySelector('[data-testid="item_cover"]')
      ?.querySelector('img')
      ?.getAttribute('src')
      ?.replace(/(264x264)|(48x48)/g, '512x512') ?? ActivityAssets.Logo
    : ActivityAssets.Logo
  presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
  presenceData.smallImageText = paused ? strings.pause : strings.play;
  [presenceData.startTimestamp, presenceData.endTimestamp] = timestamps

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
