const presence = new Presence({
  clientId: '1449057122469019749',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)
const Logo = 'https://i.imgur.com/4lU3x0V.png'

interface PageInfo {
  animeName: string
  season: number | null
  episode: number | null
  poster: string | null
}

function getPageInfo(): PageInfo {
  const info: PageInfo = {
    animeName: 'Anime',
    season: null,
    episode: null,
    poster: null,
  }

  const path = document.location.pathname
  const withSeason = path.match(/\/.+?-(\d+)-sezon-(\d+)-bolum/i)
  const noSeason = path.match(/\/.+?-(\d+)-bolum/i)

  if (withSeason) {
    info.season = Number.parseInt(withSeason[1]!, 10)
    info.episode = Number.parseInt(withSeason[2]!, 10)
  }
  else if (noSeason) {
    info.episode = Number.parseInt(noSeason[1]!, 10)
  }

  const cleanTitle = (document.title ?? '')
    .replace(/\s*[-\u2013|]\s*Asya Animeleri.*/i, '')
    .replace(/\s+\d+\.?\s*Sezon.*/i, '')
    .replace(/\s+\d+\.?\s*B\u00F6l\u00FCm.*/i, '')
    .replace(/\s+Season\s*\d.*/i, '')
    .replace(/\s+Episode\s*\d.*/i, '')
    .trim()

  if (cleanTitle)
    info.animeName = cleanTitle

  const poster
    = document.querySelector<HTMLImageElement>('img.thumbnel')
      ?? document.querySelector<HTMLImageElement>('img.tb')
      ?? document.querySelector<HTMLImageElement>('img.wp-post-image')

  if (poster?.src)
    info.poster = poster.src

  return info
}

type PageType = 'episode' | 'series' | 'home' | 'other'

function getPageType(): PageType {
  const path = document.location.pathname
  if (path === '/' || path === '')
    return 'home'
  if (/\/series\//.test(path))
    return 'series'
  if (/-bolum/.test(path))
    return 'episode'
  return 'other'
}

presence.on('UpdateData', async () => {
  const [showEpisode, showTimestamp, showBrowsing] = await Promise.all([
    presence.getSetting<boolean>('showEpisode'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showBrowsing'),
  ])

  const pageType = getPageType()

  const presenceData: PresenceData = {
    largeImageKey: Logo,
    largeImageText: 'Asya Animeleri',
    smallImageKey: Logo,
    smallImageText: 'Asya Animeleri',
    type: 3,
  }

  if (pageType === 'episode') {
    const info = getPageInfo()

    presenceData.largeImageKey = info.poster ?? Logo
    presenceData.largeImageText = info.animeName
    presenceData.details = info.animeName

    if (showEpisode && info.season && info.episode)
      presenceData.state = `${info.season}. Sezon \u2022 ${info.episode}. B\u00F6l\u00FCm`
    else if (showEpisode && info.episode)
      presenceData.state = `${info.episode}. B\u00F6l\u00FCm`
    else
      presenceData.state = '\u0130zleniyor'

    if (showTimestamp)
      presenceData.startTimestamp = browsingTimestamp
    else
      delete presenceData.startTimestamp
  }
  else if (pageType === 'series') {
    if (!showBrowsing) {
      presence.clearActivity()
      return
    }

    const title = (document.title ?? '')
      .replace(/\s*[-\u2013|]\s*Asya Animeleri.*/i, '')
      .trim()

    presenceData.largeImageText = title
    presenceData.details = title || 'Anime Sayfas\u0131'
    presenceData.state = 'Seri sayfas\u0131na bak\u0131yor'

    if (showTimestamp)
      presenceData.startTimestamp = browsingTimestamp
    else
      delete presenceData.startTimestamp
  }
  else if (pageType === 'home') {
    if (!showBrowsing) {
      presence.setActivity()
      return
    }

    presenceData.details = 'Asya Animeleri'
    presenceData.state = 'Ana sayfada geziniyor'

    if (showTimestamp)
      presenceData.startTimestamp = browsingTimestamp
    else
      delete presenceData.startTimestamp
  }
  else {
    if (!showBrowsing) {
      presence.setActivity()
      return
    }

    const label = (document.title ?? '')
      .replace(/\s*[-\u2013|]\s*Asya Animeleri.*/i, '')
      .trim()

    presenceData.details = label || 'Asya Animeleri'
    presenceData.state = 'Geziniyor'

    if (showTimestamp)
      presenceData.startTimestamp = browsingTimestamp
    else
      delete presenceData.startTimestamp
  }

  presence.setActivity(presenceData)
})
