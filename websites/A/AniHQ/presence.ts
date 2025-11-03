import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1380971258384089180',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

let iframePlayback = false
let currTime = 0
let durTime = 0
let isPaused = true

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AniHQ/assets/logo.png',
}

function getAnimeNameFromTitle(raw: string | null): string {
  if (!raw)
    return ''
  return raw
    .replace(/episode\s*\d+/gi, '')
    .replace(/\b(?:english|hindi|telugu|tamil)\b/gi, '')
    .replace(/\b(?:subbed|dubbed)\b/gi, '')
    .replace(/\b\d{4}\b/g, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase())
}

function getGenreFromPath(path: string): string {
  const genre = path.split('/')[2] || ''
  return genre.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

presence.on('iFrameData', (inc) => {
  const data = (inc as any).iFrameVideoData
  iframePlayback = !!data?.iFrameVideo
  if (iframePlayback) {
    currTime = data.currTime
    durTime = data.dur
    isPaused = data.paused
  }
})

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  const presenceData: PresenceData = {
    details: 'Browsing AniHQ',
    state: 'Home Page',
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'AniHQ',
    smallImageKey: Assets.Search,
    smallImageText: 'AniHQ',
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp,
  }
  if (pathname === '/home/') {
    presenceData.details = 'Home Page'
    presenceData.state = 'Browsing...'
  }
  else if (pathname.startsWith('/search')) {
    presenceData.details = 'Searching...'
    presenceData.state = 'Finding Anime'
  }
  else if (pathname.startsWith('/genre/')) {
    const genreName = getGenreFromPath(pathname)
    presenceData.details = 'Browsing Genre'
    presenceData.state = genreName
  }
  else if (pathname.startsWith('/anime/')) {
    const raw = pathname.split('/')[2] || ''
    const animeName = getAnimeNameFromTitle(raw)
    presenceData.details = 'Browsing Anime'
    presenceData.state = animeName
  }
  else if (pathname.startsWith('/watch/')) {
    const titleEl = document.querySelector(
      '.episode-head .anime-data h4 a span',
    )
    const epEl = document.querySelector(
      '.episode-player-info .episode-information span:nth-child(2)',
    )
    const bigImg = document.querySelector(
      '.anime-featured img',
    )?.getAttribute('src')

    const animeTitle = titleEl?.textContent?.trim()
    const episodeNum = epEl?.textContent?.trim()

    if (!animeTitle) {
      presence.setActivity(presenceData)
      return
    }

    presenceData.name = animeTitle
    presenceData.details = episodeNum || ''
    delete presenceData.state
    presenceData.largeImageKey = bigImg || presenceData.largeImageKey

    const playing = iframePlayback ? !isPaused : undefined
    if (playing !== undefined) {
      presenceData.smallImageKey = playing ? Assets.Play : Assets.Pause
      presenceData.smallImageText = playing ? 'Playing' : 'Paused'
    }
    let curr: number | undefined, dur: number | undefined
    if (iframePlayback) {
      curr = Math.floor(currTime)
      dur = Math.floor(durTime)
    }
    else {
      const videoEl = document.querySelector<HTMLVideoElement>(
        '#media-player .jw-media video',
      )
      if (videoEl) {
        curr = Math.floor(videoEl.currentTime)
        dur = Math.floor(videoEl.duration)
      }
    }

    if (playing && curr != null && dur != null) {
      const [startTs, endTs] = getTimestamps(curr, dur)
      presenceData.startTimestamp = startTs
      presenceData.endTimestamp = endTs
    }
    else {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    presence.setActivity(presenceData)
    return
  }
  presence.setActivity(presenceData)
})
