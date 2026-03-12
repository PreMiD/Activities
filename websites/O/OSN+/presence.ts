import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1383007206399676476',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Animated = 'https://cdn.rcd.gg/PreMiD/websites/O/OSN%2B/assets/0.gif',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/O/OSN%2B/assets/logo.png',
}

function isVideoActive() {
  return !!document.querySelector('[id^="apollo-video-"]')
}

let videoCache = {
  nameVideo: '',
  descVideo: '',
  idVideo: '',
}

async function getVideoInformation(videoId: string) {
  if (videoCache.idVideo === videoId && videoCache.descVideo !== '' && videoCache.nameVideo !== '') {
    return videoCache
  }
  const videoName = document.querySelector('[class*="player-overlay-top_text_title"]')!.textContent || ''
  const videoDesc = document.querySelector('[class*="player-media-info_text"]')?.textContent || ''
  const movieId = document.location.href.match(/movie\/([^/]+)\/watch/)?.[1] || ''
  if (videoName && videoDesc) {
    videoCache = {
      nameVideo: videoName,
      descVideo: videoDesc,
      idVideo: movieId,
    }
  }
  return videoCache
}

let serieCache = {
  nameSerie: '',
  episodeSerie: '',
  numberSerie: '',
  idSerie: '',
}

async function getSeriesInformation(serieId: string) {
  if (serieCache.idSerie === serieId && serieCache.nameSerie !== '' && serieCache.episodeSerie !== '') {
    return serieCache
  }
  const nameEpisode = document.querySelector('[class*="player-overlay-top_text_description"]')?.textContent || ''
  const rawTitle = document.querySelector('[class*="player-overlay-top_text_title"]')?.textContent || ''
  const match = rawTitle.match(/^(\S+)\s+(S\d+\s+E\d+)$/i)
  const titleSerie = match?.[1]?.trim() || rawTitle
  const numberSerie = match?.[2] || ''
  if (nameEpisode && titleSerie) {
    serieCache = {
      nameSerie: titleSerie,
      episodeSerie: nameEpisode,
      numberSerie,
      idSerie: serieId,
    }
  }
  return serieCache
}

function formatTitle(rawId: string): string {
  const slug = rawId.replace(/-\d+$/, '')

  return slug
    .split('-')
    .map((word) => {
      if (/^(?:[a-z]\.){2,}[a-z]?$/i.test(word.replace(/-/g, '.'))) {
        return word.toUpperCase().replace(/-/g, '.')
      }

      if (/^[A-Z0-9\-]+$/.test(word))
        return word

      if (/\d/.test(word))
        return word.toUpperCase()

      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

presence.on('UpdateData', async () => {
  const { pathname, href, search } = document.location

  const presenceData: PresenceData = {
    details: 'Browsing',
    state: 'Viewing OSN+',
    largeImageKey: ActivityAssets.Animated,
    largeImageText: 'OSN+',
    smallImageKey: Assets.Reading,
    smallImageText: 'OSN+',
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp,
  }
  if (pathname.includes('/series') && !pathname.includes('/category')) {
    const yearSince = document.querySelector('[class*="header_badges"] span')?.textContent?.trim() || ''
    const seasonNumber = document.querySelectorAll('[class*="header_badges"] span')?.[1]?.textContent?.trim() || ''
    const idSerie = href.match(/series\/([^/?#]+)$/)?.[1] || ''
    const nameSerie = formatTitle(idSerie)
    if (nameSerie) {
      presenceData.details = `Viewing Serie: ${nameSerie}`
      presenceData.state = `${yearSince}  •  ${seasonNumber}`
    }
    presence.setActivity(presenceData)
    return
  }
  else if (pathname.includes('/category')) {
    const categoryId = pathname.split('/').pop()?.replace(/[-_]/g, ' ') || 'Unknown'
    const formattedCategory = categoryId
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')

    presenceData.details = 'Browsing'
    presenceData.state = `Viewing Category: ${formattedCategory}`
    presence.setActivity(presenceData)
    return
  }
  else if (pathname.includes('/movie') && !pathname.includes('/watch')) {
    const yearSince = document.querySelector('[class*="header_badges"] span')?.textContent?.trim() || ''
    const durationMovie = document.querySelectorAll('[class*="header_badges"] span')?.[1]?.textContent?.trim() || ''
    const idMovie = href.match(/movie\/([^/?#]+)$/)?.[1] || ''
    const nameMovie = formatTitle(idMovie)
    if (nameMovie) {
      presenceData.details = `Viewing Movie: ${nameMovie}`
      presenceData.state = `${yearSince}  •  ${durationMovie}`
    }
    presence.setActivity(presenceData)
    return
  }
  else if (pathname.includes('/home')) {
    presenceData.details = 'Browsing'
    presenceData.state = 'Viewing Home Page'
    presence.setActivity(presenceData)
    return
  }
  else if (pathname.includes('/my-list')) {
    presenceData.details = 'Browsing'
    presenceData.state = 'Viewing: My List!'
    presence.setActivity(presenceData)
    return
  }
  else if (pathname.includes('/search')) {
    const urlParams = new URLSearchParams(search)
    const findQuery = urlParams.get('query') || ''
    if (findQuery) {
      presenceData.details = 'Browsing'
      presenceData.state = `Searching: ${findQuery}`
    }
    presence.setActivity(presenceData)
    return
  }
  else if (pathname.includes('/settings')) {
    presenceData.details = 'Browsing'
    presenceData.state = 'Viewing Account Settings'
    presence.setActivity(presenceData)
    return
  }
  else if (pathname.includes('/movie') && pathname.includes('/watch')) {
    const videoActive = isVideoActive()
    if (videoActive) {
      const idMovie = href.match(/movie\/([^/]+)\/watch/)?.[1] || ''
      const movieData = await getVideoInformation(idMovie)
      if (movieData) {
        presenceData.name = movieData.nameVideo
        presenceData.details = 'OSN+'
        presenceData.state = movieData.nameVideo

        const videoEl = document.querySelector<HTMLVideoElement>('[id^="apollo-video-"]')
        if (videoEl && !Number.isNaN(videoEl.duration)) {
          if (!videoEl.paused && !videoEl.ended) {
            const [startTimestamp, endTimestamp] = getTimestampsFromMedia(videoEl)
            presenceData.smallImageKey = Assets.Play
            presenceData.smallImageText = 'Playing'
            presenceData.startTimestamp = startTimestamp
            presenceData.endTimestamp = endTimestamp
          }
          else {
            presenceData.smallImageKey = Assets.Pause
            presenceData.smallImageText = 'Paused'
            delete presenceData.startTimestamp
            delete presenceData.endTimestamp
          }
        }
        presence.setActivity(presenceData)
        return
      }
    }
  }
  else if (pathname.includes('/episode') && pathname.includes('/watch')) {
    const videoActive = isVideoActive()
    if (videoActive) {
      const idSerie = href.match(/episode\/([^/]+)\/watch/)?.[1] || ''
      const serieData = await getSeriesInformation(idSerie)
      if (serieData) {
        presenceData.name = serieData.nameSerie
        presenceData.details = serieData.episodeSerie
        presenceData.state = serieData.numberSerie

        const videoEl = document.querySelector<HTMLVideoElement>('[id^="apollo-video-"]')
        if (videoEl && !Number.isNaN(videoEl.duration)) {
          if (!videoEl.paused && !videoEl.ended) {
            const [startTimestamp, endTimestamp] = getTimestampsFromMedia(videoEl)
            presenceData.smallImageKey = Assets.Play
            presenceData.smallImageText = 'Playing'
            presenceData.startTimestamp = startTimestamp
            presenceData.endTimestamp = endTimestamp
          }
          else {
            presenceData.smallImageKey = Assets.Pause
            presenceData.smallImageText = 'Paused'
            delete presenceData.startTimestamp
            delete presenceData.endTimestamp
          }
        }
        presence.setActivity(presenceData)
        return
      }
    }
  }
  presence.setActivity(presenceData)
})
