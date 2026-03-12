import { Assets } from 'premid'

const presence = new Presence({
  clientId: '641353660986687508',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/SVT%20Play/assets/logo.png',
  }

  if (document.location.hostname === 'www.svtplay.se') {
    if (document.location.pathname === '/') {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Viewing home page'
      presenceData.details = 'Navigerar landnings sidan'
    }
    else if (document.location.pathname.includes('/program/')) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Viewing program genres'
      presenceData.details = 'Navigerar program kategorier'
    }
    else if (document.location.pathname.includes('/kanaler/')) {
      const title = document.querySelector(
        '#play_main-content > div > div > div > div > div > h2',
      )?.textContent
      const user = document.querySelector(
        '#play_main-content > div > div > div > div > div > p',
      )?.textContent
      if (
        document.querySelector<HTMLVideoElement>(
          '[data-rt="video-player-channels"]',
        )
      ) {
        presenceData.smallImageKey = Assets.Live
        presenceData.smallImageText = `Watching live on channel: ${
          document.querySelector('head > title')?.textContent?.split('|')[0]
        }`
        presenceData.smallImageText = `Kollar live på kanalen: ${
          document.querySelector('head > title')?.textContent?.split('|')[0]
        }`
        presenceData.startTimestamp = browsingTimestamp

        presenceData.details = title
        presenceData.state = user
      }
      else {
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Looing at channel:'
        presenceData.details = 'Kollar på kanalen:';
        [presenceData.state] = document
          .querySelector('head > title')
          ?.textContent
          ?.split('|') ?? []
      }
    }
    else if (document.location.pathname.includes('/kanaler')) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Browsing for channels...'
      presenceData.details = 'Söker efter kanaler...'
    }
    else if (document.location.pathname.includes('/video/')) {
      let currentTime: number
      let duration: number
      let paused: boolean = false
      let time: boolean = false
      let live: boolean
      let timestamps: number[] | undefined
      const video = document.querySelector<HTMLVideoElement>(
        '[data-rt="video-player"]',
      )
      const title = document.querySelector(
        '[data-rt="program-info-title"] > a',
      )?.textContent
      const user = document.querySelector('[data-rt="episode-link"]')?.textContent
      if (video) {
        if (!video.duration) {
          time = false
          live = false
        }
        else if (video.duration === 9007199254740991) {
          live = true
        }
        else {
          time = true
          live = false;
          ({ currentTime, duration, paused } = video)
          timestamps = presence.getTimestamps(
            Math.floor(currentTime),
            Math.floor(duration),
          )
        }
        if (time && !Number.isNaN(duration!) && live === false) {
          presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
          presenceData.smallImageText = paused
            ? (await strings).pause
            : (await strings).play;
          [presenceData.startTimestamp, presenceData.endTimestamp] = timestamps ?? []

          presenceData.details = title
          presenceData.state = user

          if (paused) {
            delete presenceData.startTimestamp
            delete presenceData.endTimestamp
          }
        }
        else if (
          document.querySelector(
            '#js-play_video__fullscreen-container > div > div > div.svp_ui-error.svp_js-error > div > div.svp_ui-error__live-clock.svp_js-error--live-clock',
          )
        ) {
          presenceData.startTimestamp = browsingTimestamp
          presenceData.details = 'Waiting for:'
          presenceData.details = 'Väntar på:'
          presenceData.state = title
        }
        else if (live === true) {
          presenceData.details = title
          presenceData.state = user
          presenceData.smallImageKey = Assets.Live
        }
        else {
          presenceData.startTimestamp = browsingTimestamp
          presenceData.details = 'Looing at:'
          presenceData.details = 'Kollar på:'
          presenceData.state = title
        }
      }
      else {
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Looing at:'
        presenceData.details = 'Kollar på:'
        presenceData.state = title
      }
    }
    else if (document.location.pathname.includes('/sok')) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Searching for:'
      presenceData.details = 'Söker på:'
      presenceData.state = document.querySelector(
        '[data-rt="header-search-result"] > span:nth-child(1)',
      )?.textContent
      presenceData.smallImageKey = Assets.Search
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
