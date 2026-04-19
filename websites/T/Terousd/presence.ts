import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1495463888920117410',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)
const logo = 'https://stream.terousd.online/favicon.png'

function cleanTitle(title: string | undefined) {
  return title?.replace(/\s*-\s*Terousd$/i, '').trim()
}

function getCurrentTitle() {
  return cleanTitle(
    document.querySelector<HTMLElement>('#details-title, .details-title, h1.details-title')
      ?.textContent
      || document.title,
  )
}

function getTitleArtwork() {
  const poster = document.querySelector<HTMLImageElement>(
    [
      '#details-poster',
      '.movie-details-poster img',
      '.details-poster img',
      'img[src*="image.tmdb.org"]',
      'img[alt][src^="https://image.tmdb.org/"]',
    ].join(', '),
  )?.src

  if (poster)
    return poster

  const backdropElement = document.querySelector<HTMLElement>(
    [
      '#player-backdrop',
      '.player-backdrop',
      '.detail-backdrop',
      '[style*="background-image"]',
    ].join(', '),
  )
  const backgroundImage = backdropElement ? window.getComputedStyle(backdropElement).backgroundImage : ''
  const backdropMatch = /url\((["']?)(.*?)\1\)/.exec(backgroundImage)

  return backdropMatch?.[2] || undefined
}

presence.on('UpdateData', async () => {
  const showButtons = await presence.getSetting<boolean>('showButtons')
  const path = document.location.pathname
  const params = new URLSearchParams(document.location.search)
  const pageTitle = getCurrentTitle()
  const artwork = getTitleArtwork()
  const player = document.querySelector<HTMLVideoElement>('video.player-iframe')

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: artwork || logo,
    largeImageText: 'Terousd',
    startTimestamp: browsingTimestamp,
  }

  if (path === '/') {
    presenceData.details = 'Browsing the homepage'
  }
  else if (path === '/movies') {
    presenceData.details = 'Browsing movies'
  }
  else if (path === '/tvshows') {
    presenceData.details = 'Browsing TV shows'
  }
  else if (path === '/search') {
    const query = params.get('q')
    presenceData.details = query ? 'Searching titles' : 'Browsing search'
    if (query)
      presenceData.state = query
  }
  else if (path === '/title') {
    presenceData.type = ActivityType.Watching
    presenceData.details = pageTitle && pageTitle !== 'Terousd'
      ? `Viewing details of ${pageTitle}`
      : 'Viewing title details'
    if (pageTitle && pageTitle !== 'Terousd')
      presenceData.state = pageTitle
    if (artwork)
      presenceData.largeImageKey = artwork

    if (showButtons && params.get('id')) {
      presenceData.buttons = [{
        label: 'Open Title',
        url: document.location.href,
      }]
    }
  }
  else if (path === '/watch') {
    presenceData.type = ActivityType.Watching
    presenceData.details = pageTitle && pageTitle !== 'Watch' && pageTitle !== 'Terousd'
      ? `Watching ${pageTitle}`
      : 'Watching on Terousd'
    if (pageTitle && pageTitle !== 'Watch' && pageTitle !== 'Terousd')
      presenceData.state = pageTitle
    if (artwork)
      presenceData.largeImageKey = artwork

    if (player && Number.isFinite(player.duration)) {
      const [startTimestamp, endTimestamp] = getTimestampsFromMedia(player)
      presenceData.smallImageKey = player.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = player.paused ? 'Paused' : 'Playing'

      if (!player.paused) {
        presenceData.startTimestamp = startTimestamp
        presenceData.endTimestamp = endTimestamp
      }
      else {
        delete presenceData.endTimestamp
      }
    }

    if (showButtons && params.get('id')) {
      presenceData.buttons = [{
        label: 'Open Stream',
        url: document.location.href,
      }]
    }
  }
  else {
    presenceData.details = 'Browsing Terousd'
    if (pageTitle && pageTitle !== 'Terousd')
      presenceData.state = pageTitle
  }

  presence.setActivity(presenceData)
})
