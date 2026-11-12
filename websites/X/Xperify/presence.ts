// Xperify (xperify.in) — the site writes what the tab is doing to <html data-xp-presence>, so this file only reads it.
const presence = new Presence({
  clientId: '1569667784130961408',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const LOGO = 'https://xperify.in/icon-512.png'

interface XpState {
  status?: 'menu' | 'starting' | 'playing' | 'paused' | 'results' | 'reaction' | 'reaction-done'
  page?: string
  drill?: string
  id?: string
  diff?: string
  workshop?: boolean
  score?: number | string
  rank?: number
  ends?: number
}

// pages without the app (game pages, drill pages, the sens converter...)
function staticPage(path: string): { details: string, state?: string } {
  const h1 = document.querySelector('h1')?.textContent?.trim() ?? ''
  if (path.startsWith('/drills/') && path.split('/').filter(Boolean).length === 2)
    return { details: 'Looking at a drill', state: h1 }
  if (path.startsWith('/drills'))
    return { details: 'Browsing all drills' }
  if (path.startsWith('/sensitivity-converter'))
    return { details: 'Converting their sensitivity', state: h1 }
  if (path.startsWith('/reaction-time-test'))
    return { details: 'Reading about reaction time' }
  if (path.startsWith('/tracker'))
    return { details: 'Checking out XPR Tracker' }
  if (path.startsWith('/studio-guide'))
    return { details: 'Reading the Studio guide' }
  if (/-aim-trainer/.test(path))
    return { details: 'Picking drills for their game', state: h1 }
  return { details: 'Browsing Xperify' }
}

presence.on('UpdateData', async () => {
  const [showScore, showButtons] = await Promise.all([
    presence.getSetting<boolean>('score'),
    presence.getSetting<boolean>('buttons'),
  ])
  const path = document.location.pathname.replace(/^\/(?:es|pt|tr|de|ru)(?=\/)/, '')
  const presenceData: PresenceData = {
    name: 'xperify.in',
    largeImageKey: LOGO,
    startTimestamp: browsingTimestamp,
  }
  let play: { label: string, url: string } | null = null

  let s: XpState = {}
  try {
    s = JSON.parse(document.documentElement.dataset.xpPresence || '{}')
  }
  catch {}

  const drill = s.drill ? `${s.drill}${s.diff === 'Hard' ? ' (Hard)' : ''}` : ''
  const score = s.score !== undefined && s.score !== '' ? Number(String(s.score).replace(/[^\d.]/g, '')).toLocaleString('en-US') : ''
  if (s.id && !s.workshop)
    play = { label: (s.status === 'results' ? 'Beat my score' : `Play ${s.drill}`).slice(0, 32), url: `https://xperify.in/drills/${s.id}/` }

  switch (s.status) {
    case 'playing':
      presenceData.details = `Playing ${drill}`
      if (showScore && score)
        presenceData.state = `Score ${score}`
      if (s.ends) {
        delete presenceData.startTimestamp
        presenceData.endTimestamp = s.ends
      }
      break
    case 'starting':
      presenceData.details = `Getting ready: ${drill}`
      break
    case 'paused':
      presenceData.details = `Paused: ${drill}`
      if (showScore && score)
        presenceData.state = `Score ${score}`
      break
    case 'results':
      presenceData.details = `Finished ${drill}`
      if (showScore && score)
        presenceData.state = s.rank ? `Scored ${score} · rank #${s.rank}` : `Scored ${score}`
      break
    case 'reaction':
      presenceData.details = 'Taking the reaction time test'
      play = { label: 'Test your reaction time', url: 'https://xperify.in/reaction-time-test/' }
      break
    case 'reaction-done':
      presenceData.details = 'Took the reaction time test'
      if (showScore && s.score)
        presenceData.state = `Average ${s.score}`
      play = { label: 'Beat my reaction time', url: 'https://xperify.in/reaction-time-test/' }
      break
    case 'menu':
      presenceData.details = s.page || 'Browsing drills'
      break
    default: {
      const p = staticPage(path)
      presenceData.details = p.details
      if (p.state)
        presenceData.state = p.state
    }
  }

  // one button, only when there is a drill or test to open (PreMiD does not allow buttons to the home page)
  if (showButtons && play)
    presenceData.buttons = [play]

  presence.setActivity(presenceData)
})
