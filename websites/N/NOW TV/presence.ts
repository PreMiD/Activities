import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1408037363665338519',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/N/NOW%20TV/assets/logo.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }
  const setting = {
    privacy: await presence.getSetting<boolean>('privacy'),
  }
  const urlpath = document.location.pathname.split('/')
  const video = document.querySelector<HTMLVideoElement>('video')
  const search = document.querySelector<HTMLInputElement>('[data-testid="search-input"]')

  if (setting.privacy) {
    presenceData.details = 'Watching NOW TV'
  }
  else if (search) {
    presenceData.details = 'Searching for'
    presenceData.state = search.value
    presenceData.smallImageKey = Assets.Search
  }
  else if (video?.duration) { // Display details of a movie or TV show that is currently being watched
    const title = document.querySelector<HTMLMetaElement>(
      '[class="item playback-metadata__container-title"]',
    )
    const episodeDetails = document.querySelector<HTMLMetaElement>(
      '[class="item playback-metadata__container-episode-metadata-info"]',
    )

    presenceData.details = title
    presenceData.state = episodeDetails
    presenceData.name = `${title?.textContent ?? 'NOW TV'}`
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play;
    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)

    presenceData.buttons = [
      {
        label: 'Watch Now',
        url: document.location.href,
      },
    ]

    if (urlpath[3] === 'live') { // Grab details of live TV channel and display them
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
      const channelElement = document.querySelector<HTMLDivElement>(
        '.playback-now-next-item-main-wrapper.main[data-testid]',
      )
      const channelName = channelElement?.getAttribute('data-testid')
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = 'Live'
      presenceData.details = `${title?.textContent ?? ''}: ${episodeDetails?.textContent ?? ''}`
      presenceData.state = `Watching live on ${channelName}`
      if (!episodeDetails) {
        presenceData.details = title
      }
      presenceData.name = `${title?.textContent ?? `${channelName}`}`
      presenceData.buttons = [
        {
          label: 'Watch Live on NOW TV',
          url: document.location.href,
        },
      ]
    }

    if (video.paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Paused'
    }
  }
  else if (!urlpath[1]) {
    presenceData.details = 'Browsing NOW TV'
  }
  else if (urlpath[2] === 'home') {
    presenceData.details = 'Browsing NOW TV'
    presenceData.state = 'Home'
  }
  else if (urlpath[2] === 'tv') {
    presenceData.details = 'Browsing Sky Entertainment'
    presenceData.state = 'Looking at TV shows'
  }
  else if (urlpath[2] === 'movies') {
    presenceData.details = 'Browsing Sky Cinema'
    presenceData.state = 'Looking at movies'
  }
  else if (urlpath[2] === 'sports') {
    presenceData.details = 'Browsing Sky Sports'
    presenceData.state = 'Looking at sports'
  }
  else if (urlpath[2] === 'hayu') {
    presenceData.details = 'Browsing Hayu'
    presenceData.state = 'Looking at TV shows'
  }
  else if (urlpath[2] === 'my-stuff') {
    presenceData.details = 'Browsing NOW TV'
    presenceData.state = 'Looking at watchlist'
  }
  else if (urlpath[2] === 'asset') { // Show that a user is looking at a movie or TV show but not watching it
    const assetTitle = document.querySelector<HTMLMetaElement>(
      'title',
    )
    presenceData.state = assetTitle?.textContent ? assetTitle.textContent.replace(' - NOW', '') : undefined
    presenceData.details = 'Browsing details'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
