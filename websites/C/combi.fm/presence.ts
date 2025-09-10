import { ActivityType, getTimestamps, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '1390080838925811784',
})

enum ActivityAssets {
  Logo = 'https://combi.fm/logos/combi.png',
  SP_Logo = 'https://combi.fm/logos/512/Spotify_Primary_Logo_RGB_Green_512.png',
  SC_Logo = 'https://combi.fm/logos/512/SoundCloudLogo_BW_512.png',
  TI_Logo = 'https://combi.fm/logos/512/Tidal_icon_white_rgb_512.png',
}

interface Settings {
  title: boolean
  artists: boolean
  constant: boolean
  friends: boolean
  clear: boolean
}

interface HandleSettingsParams {
  settings: Settings
  trackTitle: string
  artistsContent?: string | null
}

interface HandleSettingsResult {
  name: string | null
  details: string | null
  state: string | null
  clear: boolean
  bHidden: boolean
}

function handleSettings({
  settings,
  trackTitle,
  artistsContent,
}: HandleSettingsParams): HandleSettingsResult {
  let { title, artists, clear } = settings

  let name: string | null = null
  let details: string | null = null
  let state: string | null = null
  let bHidden: boolean = false

  if (clear) {
    return { name, details, state, clear, bHidden }
  }

  // Title setting
  if (title || artists) {
    bHidden = true
    if (artists) {
      details = `${trackTitle} | combi.fm`
      if (artistsContent) {
        name = artistsContent
        state = artistsContent
      }
      else {
        name = `${trackTitle} | combi.fm`
        state = 'Listening on combi.fm'
      }
    }
    else {
      name = trackTitle
      details = `${trackTitle} | combi.fm`
      if (artistsContent) {
        state = artistsContent
      }
      else {
        state = 'Listening on combi.fm'
      }
    }
  }
  else {
    name = 'combi.fm'
    details = trackTitle
    if (artistsContent) {
      state = artistsContent
    }
  }
  bHidden = bHidden ?? false
  clear = clear ?? false

  return { name, details, state, bHidden, clear }
}

let timerId: ReturnType<typeof setTimeout> | null = null
let bPausedLongTime: boolean = false
let oldTitle: string | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: 'combi.fm',
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: ActivityAssets.Logo,
    smallImageText: 'combi.fm',
    type: ActivityType.Listening,
  }

  const trackTitle = document.querySelector<HTMLDivElement>('#footer-track-title')?.textContent
  const trackImgEl = document.querySelector<HTMLImageElement>('#footer-track-img')
  const artistsContent = document.querySelector<HTMLDivElement>('#footer-track-artists')?.textContent
  const currentTime = document.querySelector<HTMLElement>('#footer-time-elapsed')?.textContent
  const totalDuration = document.querySelector<HTMLElement>('#footer-duration')?.textContent
  const paused = document.querySelector<HTMLElement>('#footer-paused')
  const sp_platform = document.querySelector<HTMLElement>('#footer-platform-spotify')
  const sc_platform = document.querySelector<HTMLElement>('#footer-platform-soundcloud')
  const ti_platform = document.querySelector<HTMLElement>('#footer-platform-tidal')

  // Settings
  const [titleSetting, artistsSetting, clearSetting, constantSetting, friendsSetting] = await Promise.all([
    presence.getSetting<boolean>('title'),
    presence.getSetting<boolean>('artists'),
    presence.getSetting<boolean>('clear'),
    presence.getSetting<boolean>('constant'),
    presence.getSetting<boolean>('friends'),
  ])

  if (!trackTitle) {
    if (constantSetting) {
      return await presence.setActivity({
        type: ActivityType.Playing,
        largeImageKey: ActivityAssets.Logo,
        state: 'Paused',
      })
    }
    return presence.clearActivity()
  }

  if (paused) {
    if (timerId)
      return

    const result = await new Promise<boolean>((resolve) => {
      timerId = setTimeout(() => {
        bPausedLongTime = Boolean(paused) // bPausedLongTime is whatever `paused` is 2 second later
        resolve(bPausedLongTime)
        timerId = null
      }, 2000)
    })

    // If still paused:
    if (result) {
      if (constantSetting) {
        const detailsMsg = oldTitle ? `Last listened to: \n ${oldTitle}` : null
        if (!(oldTitle || oldTitle === trackTitle) && trackTitle) {
          oldTitle = trackTitle
        }
        return await presence.setActivity({
          type: ActivityType.Playing,
          largeImageKey: ActivityAssets.Logo,
          details: detailsMsg,
          state: 'Paused',
        })
      }
      // If presence doesn't clear properly
      return presence.clearActivity()
    }
  }
  if (timerId) {
    clearTimeout(timerId)
    timerId = null
  }

  [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(timestampFromFormat(currentTime ?? ''), timestampFromFormat(totalDuration ?? ''))

  // Settings
  const { name, details, state, bHidden, clear } = handleSettings({
    settings: {
      title: titleSetting,
      artists: artistsSetting,
      friends: friendsSetting,
      constant: constantSetting,
      clear: clearSetting,
    },
    trackTitle,
    artistsContent,
  })
  if (clear) {
    return presence.clearActivity()
  }

  if (name && details) {
    presenceData.name = name
    presenceData.details = details
  }
  if (state) {
    presenceData.state = state
  }

  if (bHidden) {
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.smallImageText = 'combi.fm'
  }
  else if (sc_platform) {
    presenceData.smallImageKey = ActivityAssets.SC_Logo
    presenceData.smallImageText = 'SoundCloud'
  }
  else if (sp_platform) {
    presenceData.smallImageKey = ActivityAssets.SP_Logo
    presenceData.smallImageText = 'Spotify'
  }
  else if (ti_platform) {
    presenceData.smallImageKey = ActivityAssets.TI_Logo
    presenceData.smallImageText = 'Tidal'
  }

  if (trackImgEl?.src) {
    presenceData.largeImageKey = trackImgEl.src
  }

  presence.setActivity(presenceData)
})
