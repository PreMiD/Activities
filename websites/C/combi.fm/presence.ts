/* eslint-disable unused-imports/no-unused-vars */
import { ActivityType, Assets, getTimestamps, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '1390080838925811784',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = 'https://i.imgur.com/9mLtpOG.png',
  SP_Logo = 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png',
  SC_Logo = 'https://d21buns5ku92am.cloudfront.net/26628/images/419679-1x1_SoundCloudLogo_cloudmark-f5912b-original-1645807040.jpg',
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
  bHidden?: boolean
  trackTitle: string
  artistsContent?: string | null
}

interface HandleSettingsResult {
  name: string | null
  details: string | null
  state: string | null
  bHidden: boolean
}

function parseToSeconds(time?: string | undefined | null): number | undefined {
  if (!time)
    return undefined

  const parts = time.split(':')

  if (parts.some(p => !/^\d+$/.test(p))) {
    return undefined
  }

  const nums: number[] = parts.map(p => Number.parseInt(p, 10))

  const [mins, secs] = nums
  if (!mins || !secs) {
    return undefined
  }

  return mins * 60 + secs
}

function handleSettings({
  settings,
  bHidden,
  trackTitle,
  artistsContent,
}: HandleSettingsParams) {
  const { title, artists } = settings

  let name: string | null
  let details: string | null
  let state: string | null

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
    state = null
    if (artistsContent) {
      state = artistsContent
    }
  }

  return { name, details, state, bHidden }
}

let timerId: ReturnType<typeof setTimeout> | null = null
let bPausedLongTime: boolean = false
let oldTitle: string | null = null

presence.on('UpdateData', async () => {
  const logo = document.querySelector('#header-logo') as HTMLImageElement ?? ActivityAssets.Logo
  const presenceData: PresenceData = {
    name: 'combi.fm',
    largeImageKey: logo,
    smallImageKey: logo,
    smallImageText: 'combi.fm',
    type: ActivityType.Listening,
    buttons: [
      {
        label: 'Visit combi.fm',
        url: 'https://combi.fm',
      },
    ],
  }

  const trackTitle = document.querySelector('#footer-track-title')?.textContent
  // console.log("Track title: ", trackTitle);
  const trackImgEl = document.querySelector('#footer-track-img') as HTMLImageElement
  const artistsContent = document.querySelector<HTMLElement>('#footer-track-artists')?.textContent
  const currentTime = document.querySelector<HTMLElement>('#footer-time-elapsed')?.textContent
  const totalDuration = document.querySelector<HTMLElement>('#footer-duration')?.textContent
  const paused = document.querySelector<HTMLElement>('#footer-paused')
  const playing = document.querySelector<HTMLElement>('#footer-playing')
  const sp_platform = document.querySelector<HTMLElement>('#footer-platform-spotify')
  const sc_platform = document.querySelector<HTMLElement>('#footer-platform-soundcloud')

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
        largeImageKey: logo,
        details: null,
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
      // If presence doesn't clear properly
      if (constantSetting) {
        const detailsMsg = oldTitle ? `Last listened to: \n ${oldTitle}` : null
        if (!(oldTitle || oldTitle === trackTitle) && trackTitle) {
          oldTitle = trackTitle
        }
        return await presence.setActivity({
          type: ActivityType.Playing,
          largeImageKey: logo,
          details: detailsMsg,
          state: 'Paused',
        })
      }

      return presence.clearActivity()
    }
  }
  if (timerId) {
    clearTimeout(timerId)
    timerId = null
  }

  [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(timestampFromFormat(currentTime ?? ''), timestampFromFormat(totalDuration ?? ''))

  // Clear setting
  if (clearSetting) {
    return presence.clearActivity()
  }

  const { name, details, state, bHidden } = handleSettings({
    settings: {
      title: titleSetting,
      artists: artistsSetting,
      friends: friendsSetting,
      constant: constantSetting,
      clear: clearSetting,
    },
    trackTitle,
    artistsContent,
    bHidden: false,
  })

  presenceData.name = name
  presenceData.details = details
  presenceData.state = state

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

  presenceData.largeImageKey = trackImgEl.src

  presence.setActivity(presenceData)
})
