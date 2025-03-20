import { Assets } from 'premid'

const presence = new Presence({
  clientId: '630874255990587402',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Gfycat/assets/logo.png',
  }

  if (document.location.pathname.startsWith('/discover')) {
    const section = document.querySelector('.multiple-view__title')?.textContent
    if (section)
      presenceData.state = section

    presenceData.details = 'Browsing...'
    presenceData.startTimestamp = Date.now()

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname.startsWith('/gifs/search')) {
    const searchText = document.querySelector(
      '.feed-with-player__title',
    )?.textContent

    presenceData.details = 'Searching...'
    if (searchText)
      presenceData.state = searchText

    presenceData.startTimestamp = Date.now()
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Searching'

    presence.setActivity(presenceData)
  }
  else if (
    document.location.pathname.startsWith('/upload')
    || document.location.pathname.startsWith('/create')
  ) {
    presenceData.details = 'Uploading...'
    presenceData.startTimestamp = Date.now()

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname.startsWith('/@')) {
    presenceData.details = 'Viewing profile'
    presenceData.state = document.querySelector(
      '.profile-container .profile-info-container .name',
    )?.textContent
    presenceData.startTimestamp = Date.now()

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname.startsWith('/jobs')) {
    presenceData.details = 'Browsing jobs'
    presenceData.startTimestamp = Date.now()

    presence.setActivity(presenceData)
  }
  else {
    const player = document.querySelector<HTMLVideoElement>(
      '.video-player-wrapper video',
    )

    if (player) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
        Math.floor(player.currentTime),
        Math.floor(player.duration),
      )

      presenceData.details = document.querySelector('.gif-info .title')?.textContent
      presenceData.state = document.querySelector(
        '.gif-info .gif-views',
      )?.textContent
      presenceData.smallImageKey = player.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = player.paused
        ? (await strings).pause
        : (await strings).play

      if (player.paused) {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }

      presence.setActivity(presenceData)
    }
    else {
      presenceData.details = 'Browsing...'
      presenceData.startTimestamp = Date.now()

      presence.setActivity(presenceData)
    }
  }
})
