import { ActivityType, Assets, getTimestamps, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1495463888920117410',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/T/Terousd/assets/logo.png',
}

interface VideoInfo {
  currTime: number
  duration: number
  paused: boolean
}

let iframeVideo: VideoInfo | undefined

presence.on('iFrameData', (data) => {
  iframeVideo = data as VideoInfo
})

function getTitle() {
  return document
    .querySelector('.details-title, .detail-title, h1')
    ?.textContent
    ?.trim()
    || document.title.replace(/\s[-\u2014]\sTerousd$/, '').trim()
}

function getPoster() {
  return document
    .querySelector<HTMLImageElement>('#details-poster, #detail-poster, .detail-poster-img')
    ?.src
}

function getEpisodeInfo() {
  return document
    .querySelector('.episode-name')
    ?.textContent
    ?.trim()
    || [
      document.querySelector<HTMLSelectElement>('.watch-season-select')?.selectedOptions[0]?.textContent,
      document.querySelector<HTMLSelectElement>('.watch-episode-select')?.selectedOptions[0]?.textContent,
    ].filter(Boolean).join(', ')
}

presence.on('UpdateData', async () => {
  const [privacy, thumbnail, browsingStatus, hideWhenPaused] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('thumbnail'),
    presence.getSetting<boolean>('browsingStatus'),
    presence.getSetting<boolean>('hideWhenPaused'),
  ])

  const { href, pathname, search } = document.location
  const searchParams = new URLSearchParams(search)
  const title = getTitle()
  const poster = getPoster()
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp,
  }

  if (pathname.startsWith('/watch')) {
    presenceData.details = 'Watching'
    presenceData.state = privacy ? 'A title' : title

    const episodeInfo = getEpisodeInfo()
    if (!privacy && episodeInfo)
      presenceData.largeImageText = episodeInfo

    const video = document.querySelector<HTMLVideoElement>('video')
    if (video && !Number.isNaN(video.duration)) {
      if (!video.paused)
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
      else if (hideWhenPaused)
        return presence.clearActivity()

      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused ? 'Paused' : 'Playing'
    }
    else if (iframeVideo && !Number.isNaN(iframeVideo.duration)) {
      if (!iframeVideo.paused && iframeVideo.duration) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
          Math.floor(iframeVideo.currTime),
          Math.floor(iframeVideo.duration),
        )
      }
      else if (hideWhenPaused) {
        return presence.clearActivity()
      }

      presenceData.smallImageKey = iframeVideo.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = iframeVideo.paused ? 'Paused' : 'Playing'
    }
    else {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Watching'
    }
  }
  else if (browsingStatus) {
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Browsing'

    if (pathname === '/' || pathname.startsWith('/home')) {
      presenceData.details = 'Browsing'
      presenceData.state = 'Home'
    }
    else if (pathname.startsWith('/movies')) {
      presenceData.details = 'Browsing'
      presenceData.state = 'Movies'
    }
    else if (pathname.startsWith('/tvshows')) {
      presenceData.details = 'Browsing'
      presenceData.state = 'TV Shows'
    }
    else if (pathname.startsWith('/search')) {
      presenceData.details = 'Searching'
      presenceData.state = privacy ? 'Titles' : searchParams.get('q') || 'Titles'
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Searching'
    }
    else if (pathname.startsWith('/title')) {
      presenceData.details = 'Viewing a title'
      presenceData.state = privacy ? 'Details' : title
      presenceData.buttons = [{ label: 'View Title', url: href }]
    }
  }
  else {
    return presence.clearActivity()
  }

  if (thumbnail && poster && !privacy)
    presenceData.largeImageKey = poster

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
