import { ActivityType, getTimestamps, supports } from 'premid'
import { readGameStatus } from './game.js'
import { getIdolPageDetails, getRouteDisplay, pageLabels } from './routes.js'

const presence = new Presence({
  clientId: '1103931016525127792',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

let logo: Blob | null = null
let iframeState: { pathname: string, hash: string } | null = null

presence.on('iFrameData', (data: unknown) => {
  if (data && typeof data === 'object'
    && 'pathname' in data && typeof data.pathname === 'string'
    && 'hash' in data && typeof data.hash === 'string') {
    iframeState = { pathname: data.pathname, hash: data.hash }
  }
})

presence.on('UpdateData', async () => {
  if (!logo) {
    try {
      const response = await fetch('https://i.imgur.com/FZIYZxz.png')
      if (!response.ok)
        throw new Error(`HTTP ${response.status}`)

      logo = await response.blob()
    }
    catch (error) {
      presence.error(`Failed to load the activity logo: ${error}`)
    }
  }

  const { pathname: parentPath, hash: parentHash } = document.location

  const currentPath = iframeState?.pathname ?? parentPath
  const currentHash = iframeState?.hash ?? parentHash

  const cleanHash = currentHash.startsWith('#/') ? currentHash.split('?')[0] : ''
  const currentRoute = (cleanHash && cleanHash.length > 1) ? cleanHash.substring(1) : currentPath
  const idolPage = getIdolPageDetails(currentRoute)
  const routeDisplay = getRouteDisplay(currentRoute)

  let { details, state } = routeDisplay

  const status = supports(presence, 'execInPage')
    ? await presence.execInPage(readGameStatus, currentRoute, !!idolPage).catch(() => null)
    : null
  if (status)
    state = undefined

  if (status && 'home' in status) {
    details = pageLabels.home
  }
  else if (status && 'album' in status) {
    details = pageLabels.album
    state = status.album
  }
  else if (status && 'page' in status) {
    let section = idolPage && status.page.startsWith(idolPage) ? status.page.slice(idolPage.length).trim() : status.page
    if (idolPage && status.state && section === 'アイドル選択')
      section = ''
    const isRoutePage = routeDisplay.state && !status.state
      && (status.page === routeDisplay.details || status.page === routeDisplay.state
        || routeDisplay.details === pageLabels.fes || routeDisplay.details === pageLabels.matchLive)
    if (idolPage) {
      details = status.state && section ? `${idolPage} ／ ${section}` : idolPage
      state = status.state || section || undefined
    }
    else {
      details = isRoutePage ? routeDisplay.details : status.page
      state = isRoutePage ? routeDisplay.state : status.state
    }
  }
  else if (status && 'miniGame' in status) {
    const miniGame = getRouteDisplay(status.miniGame.route)
    details = miniGame.details
    state = [miniGame.state, status.miniGame.section].filter(Boolean).join(' ／ ')
  }
  else if (status && 'fesUnit' in status) {
    details = pageLabels.fes
    state = pageLabels.fesUnit
  }
  else if (status && 'profilePage' in status) {
    details = pageLabels.profile
    state = status.profilePage
  }
  else if (status && 'stagePage' in status) {
    details = status.stagePage.mode ? `${pageLabels.stage} ／ ${status.stagePage.mode}` : pageLabels.stage
    state = status.stagePage.section === pageLabels.stage ? undefined : status.stagePage.section
  }
  else if (status && 'preparation' in status) {
    details = `${pageLabels.preparation} ／ ${status.preparation.mode}`
    state = status.preparation.stage
  }
  else if (status && 'communication' in status) {
    details = status.communication.name
    state = status.communication.title
  }
  else if (status && 'event' in status) {
    details = status.episode ? status.event : pageLabels.event
    state = status.episode
      ? `${status.episode.chapter} ／ ${status.episode.title}`
      : status.event
  }
  else if (status) {
    details = status.scenario
    state = `${status.idol} ／ ${status.stage}`
  }

  const playback = status && 'page' in status ? status.playback : undefined
  const presenceData: PresenceData = {
    name: 'シャニマス',
    type: playback ? (playback.type === 'video' ? ActivityType.Watching : ActivityType.Listening) : undefined,
    details,
    state,
    largeImageKey: logo,
    largeImageUrl: 'https://shinycolors.idolmaster-official.jp/',
    startTimestamp: browsingTimestamp,
  }

  if (playback) {
    delete presenceData.startTimestamp
    if (!playback.paused) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(playback.position, playback.duration)
    }
  }

  await presence.setActivity(presenceData)
})
