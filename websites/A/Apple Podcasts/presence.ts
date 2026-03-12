import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1281538997235224596',
  injectOnComplete: true,
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/Apple%20Podcasts/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  } as PresenceData
  const strings = await presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    browsing: 'general.browsing',
  })
  const [privacy, useEpisodeAsTitle] = await Promise.all([
    presence.getSetting('privacy'),
    presence.getSetting('useEpisodeAsTitle'),
  ])
  const shadowRootDir = document.querySelector('.lcd')?.shadowRoot

  if (shadowRootDir?.querySelector('.lcd__active')?.ariaHidden !== 'true') {
    presenceData.type = ActivityType.Listening
    const episodeImage = shadowRootDir
      ?.querySelector<HTMLImageElement>('.lcd__artwork > picture > img')
      ?.src
      .replace('88x88', '450x450')
    const playingShadow = document.querySelector('.chrome-player')?.shadowRoot
    const episodeTitle = shadowRootDir?.querySelector(
      '.lcd-meta-line__fragment',
    )?.textContent
    const podcastName = shadowRootDir?.querySelectorAll(
      '.lcd-meta-line__fragment',
    )[2]?.textContent

    presenceData.largeImageKey = episodeImage

    if (useEpisodeAsTitle) {
      presenceData.name = episodeTitle ?? ''
      presenceData.details = podcastName
    }
    else {
      presenceData.name = podcastName ?? ''
      presenceData.details = episodeTitle
    }
    presenceData.state = 'on Apple Podcasts'

    const progress = shadowRootDir?.querySelector('#playback-progress')
    const elapsedSeconds = Number(progress?.ariaValueNow)

    if (
      playingShadow?.querySelector('.playback-play__pause')?.ariaHidden !== 'true'
    ) {
      const ts = Date.now() / 1000
      presenceData.startTimestamp = ts - elapsedSeconds
      presenceData.endTimestamp = ts + Number(progress?.ariaValueMax) - elapsedSeconds

      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = strings.play
    }
    else if (
      playingShadow?.querySelector('.playback-play__play')?.ariaHidden !== 'true'
    ) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = strings.pause
    }
  }
  else if (document.location.pathname.includes('/podcast')) {
    presenceData.details = document.querySelector(
      '.headings > .headings__title',
    )?.textContent
    presenceData.state = document.querySelector(
      '.headings > .headings__subtitles',
    )?.textContent
    presenceData.largeImageKey = document.querySelector<HTMLImageElement>('picture > img')?.currentSrc
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = strings.browsing
  }
  else if (document.location.pathname.includes('/home')) {
    presenceData.details = 'On the home page'
  }
  else if (document.location.pathname.includes('/charts')) {
    presenceData.details = 'Viewing top charts'
  }
  else if (document.location.pathname.includes('/library')) {
    presenceData.details = 'Viewing library'
  }
  else if (document.location.pathname.includes('/settings')) {
    presenceData.details = 'Viewing settings'
  }
  else if (document.location.pathname.includes('/search')) {
    presenceData.details = 'Searching for podcasts'
    if (document.location.search.includes('?term=')) {
      presenceData.details = `Searched for ${decodeURIComponent(
        document.location.search.split('?term=')[1]!,
      )}`
    }
    else {
      presenceData.smallImageKey = Assets.Search
      presenceData.details = 'Searching...'
    }
  }
  else {
    presenceData.details = 'Browsing...'
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = strings.browsing
  }

  if (presenceData.state && privacy)
    delete presenceData.state

  if (presenceData.details && privacy)
    delete presenceData.details

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presenceData.type = ActivityType.Listening
    presence.setActivity()
  }
})
