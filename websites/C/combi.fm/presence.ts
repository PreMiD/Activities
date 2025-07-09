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

let timerId: ReturnType<typeof setTimeout> | null = null
let bPausedLongTime = false

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: 'combi.fm',
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: ActivityAssets.Logo,
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

  if (!trackTitle) {
    return presence.clearActivity()
  }

  // console.log("Track title: ", trackTitle);
  const trackImgEl = document.querySelector('#footer-track-img') as HTMLImageElement
  const artistsContent = document.querySelector<HTMLElement>('#footer-track-artists')?.textContent
  const currentTime = document.querySelector<HTMLElement>('#footer-time-elapsed')?.textContent
  const totalDuration = document.querySelector<HTMLElement>('#footer-duration')?.textContent
  const paused = document.querySelector<HTMLElement>('#footer-paused')
  const playing = document.querySelector<HTMLElement>('#footer-playing')
  const sp_platform = document.querySelector<HTMLElement>('#footer-platform-spotify')
  const sc_platform = document.querySelector<HTMLElement>('#footer-platform-soundcloud')

  if (paused) {
    if (timerId)
      return

    const result = await new Promise<boolean>((resolve) => {
      timerId = setTimeout(() => {
        bPausedLongTime = Boolean(paused) // bPausedLongTime is whatever `paused` is 5 second later
        resolve(bPausedLongTime)
        timerId = null
      }, 5000)
    })

    // If still paused after 1 second:
    if (result) {
      // If presence doesn't clear properly
      // await presence.setActivity({
      //   type: ActivityType.Playing,
      //   largeImageKey: ActivityAssets.Logo,
      //   details: null,
      //   state: "Paused",
      // });

      return presence.clearActivity()
    }
  }
  if (timerId) {
    clearTimeout(timerId)
    timerId = null
  }

  [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(timestampFromFormat(currentTime ?? ''), timestampFromFormat(totalDuration ?? ''))

  // Settings
  const [titleSetting, artistsSetting, clearSetting] = await Promise.all([
    presence.getSetting<boolean>('title'),
    presence.getSetting<boolean>('artists'),
    presence.getSetting<boolean>('clear'),
  ])
  // Clear setting
  if (clearSetting) {
    return presence.clearActivity()
  }
  // Title setting
  if (titleSetting || artistsSetting) {
    if (artistsSetting) {
      presenceData.details = `${trackTitle} via combi.fm`
      if (artistsContent) {
        presenceData.name = artistsContent
        presenceData.state = artistsContent
      }
      else {
        presenceData.name = `${trackTitle} via combi.fm`
        presenceData.state = 'Listening on combi.fm'
      }
    }
    else {
      presenceData.name = trackTitle
      presenceData.details = `${trackTitle} via combi.fm`
      if (artistsContent) {
        presenceData.state = artistsContent
      }
      else {
        presenceData.state = 'Listening on combi.fm'
      }
    }
  }
  else {
    presenceData.name = 'combi.fm'
    presenceData.details = trackTitle
    if (artistsContent) {
      presenceData.state = artistsContent
    }
  }

  if (sc_platform) {
    presenceData.smallImageKey = ActivityAssets.SC_Logo
    presenceData.smallImageText = 'SoundCloud'
  }
  if (sp_platform) {
    presenceData.smallImageKey = ActivityAssets.SP_Logo
    presenceData.smallImageText = 'Spotify'
  }

  presenceData.largeImageKey = trackImgEl.src

  presence.setActivity(presenceData)
})
