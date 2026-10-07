import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({ clientId: '1453728381903306814' })

const RATING_REGEX = /^\d+(?:\.\d+)?$/

interface SeasonEpisode { season: number, episode: number }

function extractSeasonEpisode(text: string | null | undefined): SeasonEpisode | null {
  if (!text)
    return null
  const match = text.match(/S(\d+)\s*E(\d+)/i)
  return (match && match[1] && match[2]) ? { season: Number.parseInt(match[1]), episode: Number.parseInt(match[2]) } : null
}

function formatSeasonEpisode({ season, episode }: SeasonEpisode): string {
  return `Season ${season}, Episode ${episode}`
}

function formatSeasonEpisodeCompact({ season, episode }: SeasonEpisode, format: number): string {
  return format === 1
    ? `${season}x${String(episode).padStart(2, '0')}`
    : `S${String(season).padStart(2, '0')} E${String(episode).padStart(2, '0')}`
}

function getHeaderName(rawTitle: string, isTvShow: boolean, seasonEpisode: SeasonEpisode | null, movieHeaderFormat: number, showHeaderFormat: number, episodeFormat: number): string | undefined {
  if (!isTvShow)
    return movieHeaderFormat === 1 ? rawTitle : undefined

  if (showHeaderFormat === 0)
    return undefined

  if (showHeaderFormat === 2 && seasonEpisode)
    return `${rawTitle} ${formatSeasonEpisodeCompact(seasonEpisode, episodeFormat)}`

  return rawTitle
}

interface ImdbInfo { label: string, url: string, tconst: string | null, rating: string | null }

function getImdbInfo(title: string): ImdbInfo {
  const imdbLink = document.querySelector<HTMLAnchorElement>('a[href*="imdb.com/title"]')
  if (!imdbLink?.href)
    return { label: 'View on IMDb', url: `https://www.imdb.com/find/?q=${encodeURIComponent(title)}&s=tt`, tconst: null, rating: null }

  const rating = [...imdbLink.querySelectorAll('p')]
    .map(p => p.textContent?.trim())
    .find(text => text && RATING_REGEX.test(text)) ?? null

  const tconst = imdbLink.href.match(/title\/(tt\d+)/)?.[1] ?? null

  return { label: rating ? `IMDb: ${rating} ★` : 'View on IMDb', url: imdbLink.href, tconst, rating }
}

function getEpisodeRating(season: number, episode: number): string | null {
  const episodeLink = [...document.querySelectorAll<HTMLAnchorElement>('.tv_episode a[season][episode]')]
    .find(a => Number(a.getAttribute('season')) === season && Number(a.getAttribute('episode')) === episode)

  const scoreText = episodeLink?.closest('.tv_episode')?.querySelector('.score span')?.textContent?.trim()
  return (scoreText && RATING_REGEX.test(scoreText)) ? scoreText : null
}

function getImdbEpisodeButton(imdbInfo: ImdbInfo, seasonEpisode: SeasonEpisode): { label: string, url: string } | null {
  if (!imdbInfo.tconst)
    return null

  const rating = getEpisodeRating(seasonEpisode.season, seasonEpisode.episode)

  return {
    label: rating ? `Episode Rating: ${rating} ★` : 'View Episode on IMDb',
    url: `https://www.imdb.com/title/${imdbInfo.tconst}/episodes?season=${seasonEpisode.season}`,
  }
}

function isTvShowUrl(href: string): boolean {
  return /tvshow|season/i.test(href)
}

function getBrowsingStatus(): { details: string, state: string } {
  const { pathname } = document.location

  if (pathname === '/' || /^\/home\/?$/i.test(pathname))
    return { details: 'Browsing Library', state: 'Viewing Homepage' }

  if (/search/i.test(pathname))
    return { details: 'Browsing Library', state: 'Searching...' }

  if (/tv[-_]?show|\bseries\b/i.test(pathname))
    return { details: 'Browsing Library', state: 'Choosing a TV show...' }

  return { details: 'Browsing Library', state: 'Choosing a movie...' }
}

presence.on('UpdateData', async () => {
  const video = [...document.querySelectorAll('video')].find(v => v.src)
  const rawTitle = document.querySelector('.movie_title')?.textContent.trim() ?? null
  const showBrowsingStatus = await presence.getSetting<boolean>('showBrowsingStatus')
  const showLookingAtStatus = await presence.getSetting<boolean>('showLookingAtStatus')
  const episodeFormat = await presence.getSetting<number>('episodeFormat')
  const movieHeaderFormat = await presence.getSetting<number>('movieHeaderFormat')
  const showHeaderFormat = await presence.getSetting<number>('showHeaderFormat')
  const hideWhenPaused = await presence.getSetting<boolean>('hideWhenPaused')
  const showImdbButton = await presence.getSetting<boolean>('showImdbButton')
  const showEpisodeButton = await presence.getSetting<boolean>('showEpisodeButton')
  const isWatching = Boolean(video && rawTitle)
  const isLookingAt = !isWatching && Boolean(rawTitle)
  const isGeneralBrowsing = !isWatching && !rawTitle

  if (isLookingAt && !showLookingAtStatus) {
    presence.clearActivity()
    return
  }

  if (isGeneralBrowsing && !showBrowsingStatus) {
    presence.clearActivity()
    return
  }

  if (isWatching && hideWhenPaused && video!.paused) {
    presence.clearActivity()
    return
  }

  const presenceData: any = {
    type: ActivityType.Watching,
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/MovieBoxPro/assets/logo.jpg',
  }

  if (video && rawTitle) {
    presenceData.details = rawTitle

    const coverImg = document.querySelector<HTMLImageElement>('img.cover')
    if (coverImg)
      presenceData.largeImageKey = coverImg.src

    const params = new URLSearchParams(document.location.search)
    let seasonEpisode: SeasonEpisode | null = (params.get('season') && params.get('episode'))
      ? { season: Number.parseInt(params.get('season')!), episode: Number.parseInt(params.get('episode')!) }
      : null

    if (!seasonEpisode) {
      const jwTitle = document.querySelector('.jw-title-primary')?.textContent ?? document.querySelector('.jw-title-secondary')?.textContent
      seasonEpisode = extractSeasonEpisode(jwTitle)
    }

    if (!seasonEpisode) {
      const videoContainer = document.querySelector('.video-js')
      if (videoContainer)
        seasonEpisode = extractSeasonEpisode(videoContainer.textContent)
    }

    if (!seasonEpisode) {
      const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content')
      seasonEpisode = extractSeasonEpisode(metaDesc) || extractSeasonEpisode(document.title)
    }

    const isTvShow = isTvShowUrl(document.location.href)
    presenceData.name = getHeaderName(rawTitle, isTvShow, seasonEpisode, movieHeaderFormat, showHeaderFormat, episodeFormat)
    presenceData.state = seasonEpisode ? formatSeasonEpisode(seasonEpisode) : (isTvShow ? 'Watching TV Show' : 'Watching Movie')

    const buttons: { label: string, url: string }[] = []
    const imdbInfo = (showImdbButton || showEpisodeButton) ? getImdbInfo(rawTitle) : null

    if (showImdbButton && imdbInfo)
      buttons.push({ label: imdbInfo.label, url: imdbInfo.url })

    if (showEpisodeButton && imdbInfo && seasonEpisode) {
      const episodeButton = getImdbEpisodeButton(imdbInfo, seasonEpisode)
      if (episodeButton)
        buttons.push(episodeButton)
    }

    if (buttons.length > 0)
      presenceData.buttons = buttons

    if (video.paused) {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Paused'
    }
    else {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playing';
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
    }
  }
  else if (rawTitle) {
    const coverImg = document.querySelector<HTMLImageElement>('img.cover')
    if (coverImg)
      presenceData.largeImageKey = coverImg.src

    const isTvShow = isTvShowUrl(document.location.href)
    presenceData.name = getHeaderName(rawTitle, isTvShow, null, movieHeaderFormat, showHeaderFormat, episodeFormat)
    presenceData.details = isTvShow ? 'Looking at a TV Show' : 'Looking at a Movie'
    presenceData.state = rawTitle
    if (showImdbButton) {
      const imdbInfo = getImdbInfo(rawTitle)
      presenceData.buttons = [{ label: imdbInfo.label, url: imdbInfo.url }]
    }
  }
  else {
    Object.assign(presenceData, getBrowsingStatus())
  }

  presence.setActivity(presenceData)
})
