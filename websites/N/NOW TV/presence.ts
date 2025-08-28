import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1408037363665338519',
})

enum ActivityAssets {
  Logo = 'https://m.media-amazon.com/images/I/61sDr8btlTL.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname: path } = document.location
  const privacyMode = await presence.getSetting<boolean>('privacy')
  const video = document.querySelector<HTMLVideoElement>('video')
  const { href, pathname } = document.location
  const search = document.querySelector<HTMLInputElement>('[data-testid="search-input"]')
  if (privacyMode) {
    presenceData.details = 'Watching NOW TV'
  }
  else if (search) {
    presenceData.details = 'Searching for'
    presenceData.state = search.value
    presenceData.smallImageKey = Assets.Search
  }
  else if (video?.duration) {
    const title = document.querySelector<HTMLMetaElement>(
      '[class="item playback-metadata__container-title"]',
    )
    const episodeDetails = document.querySelector<HTMLMetaElement>(
      '[class="item playback-metadata__container-episode-metadata-info"]',
    )
    const largePhoto = document.querySelector<HTMLMetaElement>(
      '[class="aspect-ratio-image__img"]',
    )

    presenceData.details = title
    presenceData.state = episodeDetails
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play;
    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)

    if (path.startsWith('/watch/playback/live/')) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = 'Live'
    }

    if (video.paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Paused'
    }
  }
  else if (path.startsWith('/')) {
    presenceData.details = 'Browsing NOW TV'
  }
  else if (path.startsWith('/watch/home')) {
    presenceData.details = 'Browsing NOW TV'
    presenceData.state = 'Home'
  }
  else if (path.startsWith('/watch/tv/highlights')) {
    presenceData.details = 'Browsing Sky Entertainment'
    presenceData.state = 'Looking at TV shows'
  }
  else if (path.startsWith('/watch/movies/highlights')) {
    presenceData.details = 'Browsing Sky Cinema'
    presenceData.state = 'Looking at movies'
  }
  else if (path.startsWith('/watch/sports/highlights')) {
    presenceData.details = 'Browsing Sky Sports'
    presenceData.state = 'Looking at sports'
  }
  else if (path.startsWith('/watch/hayu')) {
    presenceData.details = 'Browsing Hayu'
    presenceData.state = 'Looking at TV shows'
  }
  else if (path.startsWith('/watch/my-stuff')) {
    presenceData.details = 'Browsing NOW TV'
    presenceData.state = 'Looking at watchlist'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
