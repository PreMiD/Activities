import { ActivityType, Assets, getTimestamps, getTimestampsFromMedia, StatusDisplayType } from 'premid'

const presence = new Presence({
  clientId: '1484133460527415410',
})

presence.info('Tome presence initialized')

const SITE_URL = 'https://www.tome.qzz.io'
const defaultLogo = 'https://i.imgur.com/IgwRllE.png'
let browsingTimestamp = Math.floor(Date.now() / 1000)
let lastUrl = ''

let iframeVideoData: {
  duration: number
  currentTime: number
  paused: boolean
  ended?: boolean
} | null = null

presence.on('iFrameData', (data: any) => {
  if (data && typeof data.duration === 'number') {
    iframeVideoData = data
  }
})

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location

  if (lastUrl !== href) {
    lastUrl = href
    browsingTimestamp = Math.floor(Date.now() / 1000)
    iframeVideoData = null
  }

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    statusDisplayType: StatusDisplayType.Details,
  }

  if (pathname.startsWith('/watch')) {
    const video = document.querySelector<HTMLVideoElement>('video.art-video')
      ?? document.querySelector<HTMLVideoElement>('.artplayer-host video')
      ?? document.querySelector<HTMLVideoElement>('video')

    const overviewTitle = document.querySelector('.watch-overview-title')?.textContent?.trim()
    const breadcrumbTitles = document.querySelectorAll('.watch-breadcrumbs .watch-bc-title')
    const breadcrumbTitle = breadcrumbTitles.length > 1 ? breadcrumbTitles[1]?.textContent?.trim() : null
    const docTitle = document.title.replace(/\s*[—–-]\s*Tome.*$/i, '').trim()
    const animeTitle = overviewTitle || breadcrumbTitle || (docTitle !== 'Tomes' && docTitle !== 'Tome' ? docTitle : '') || 'Anime'

    const bcEp = document.querySelector('.watch-bc-ep')?.textContent?.trim()
    const currentCardTitle = document.querySelector('.watch-ep-card.current .watch-ep-card-title, .watch-ep-row.current .watch-ep-row-title')?.textContent?.trim()
    const urlParts = pathname.split('/').filter(Boolean)
    const epNumber = urlParts[2] || '1'

    let episodeText = bcEp || `Episode ${epNumber}`
    if (currentCardTitle && !currentCardTitle.toLowerCase().startsWith('episode') && currentCardTitle !== episodeText) {
      episodeText = `${episodeText} - ${currentCardTitle}`
    }

    const coverImage = document.querySelector<HTMLImageElement>('.watch-overview-cover, .watch-ep-card.current img, .watch-ep-row.current img')?.src

    presenceData.name = animeTitle.slice(0, 128)
    presenceData.details = animeTitle.slice(0, 128)
    presenceData.state = `${episodeText} • Tome`.slice(0, 128)

    if (coverImage && (coverImage.startsWith('http://') || coverImage.startsWith('https://')) && !/\.svg(?:\$|\?)/i.test(coverImage)) {
      presenceData.largeImageKey = coverImage
      presenceData.largeImageText = `${animeTitle} • Watching on Tome`.slice(0, 128)
    }
    else {
      presenceData.largeImageKey = defaultLogo
      presenceData.largeImageText = 'Watching on Tome'
    }

    let isPlaying = false

    if (video && !Number.isNaN(video.duration) && video.duration > 0) {
      isPlaying = !video.paused && !video.ended

      if (isPlaying) {
        const [start, end] = getTimestampsFromMedia(video)
        presenceData.startTimestamp = start
        presenceData.endTimestamp = end
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Playing on Tome'
      }
      else {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = 'Paused'
      }
    }
    else if (iframeVideoData && !Number.isNaN(iframeVideoData.duration) && iframeVideoData.duration > 0) {
      isPlaying = !iframeVideoData.paused && !iframeVideoData.ended

      if (isPlaying) {
        const [start, end] = getTimestamps(iframeVideoData.currentTime, iframeVideoData.duration)
        presenceData.startTimestamp = start
        presenceData.endTimestamp = end
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Playing on Tome'
      }
      else {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = 'Paused'
      }
    }
    else {
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Watching on Tome'
    }

    presenceData.buttons = [
      {
        label: 'Watch on Tome',
        url: href,
      },
    ]

    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/browse')) {
    presenceData.details = 'Browsing Anime & Manga'
    presenceData.state = 'Exploring Tome Library'
    presenceData.largeImageKey = defaultLogo
    presenceData.largeImageText = 'Tome — The Grand Anime Library'
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Browsing'
    presenceData.startTimestamp = browsingTimestamp
    presenceData.buttons = [
      {
        label: 'Explore Library',
        url: href,
      },
    ]
    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/shelf')) {
    presenceData.details = 'Viewing Shelf'
    presenceData.state = 'Managing Collection • Tome'
    presenceData.largeImageKey = defaultLogo
    presenceData.largeImageText = 'Tome Library'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Shelf'
    presenceData.startTimestamp = browsingTimestamp
    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/read')) {
    const title = document.querySelector('h1, .read-title, .reader-title')?.textContent?.trim() || 'Manga'
    const urlParts = pathname.split('/').filter(Boolean)
    const chapNumber = urlParts[2] || '1'

    presenceData.name = title.slice(0, 128)
    presenceData.details = title.slice(0, 128)
    presenceData.state = `Reading Chapter ${chapNumber} • Tome`.slice(0, 128)
    presenceData.largeImageKey = defaultLogo
    presenceData.largeImageText = `${title} • Reading on Tome`.slice(0, 128)
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Reading on Tome'
    presenceData.startTimestamp = browsingTimestamp
    presenceData.buttons = [
      {
        label: 'Read on Tome',
        url: href,
      },
    ]
    presence.setActivity(presenceData)
    return
  }

  presenceData.details = 'Exploring Tome'
  presenceData.state = 'The Grand Anime Library'
  presenceData.largeImageKey = defaultLogo
  presenceData.largeImageText = 'Tome — The Grand Anime Library'
  presenceData.smallImageKey = Assets.Viewing
  presenceData.smallImageText = 'Home'
  presenceData.startTimestamp = browsingTimestamp
  presence.setActivity(presenceData)
})
