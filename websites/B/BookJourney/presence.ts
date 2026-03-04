type PremidStateKind
  = | 'join_screen'
    | 'loading'
    | 'not_found'
    | 'active'
    | 'ended'

type PremidPrivacyMode = 'public' | 'private_hidden'

type PremidViewerRole
  = | 'host'
    | 'moderator'
    | 'reader'
    | 'guest'
    | 'anonymous'
    | 'unknown'

type PremidQueueStatus = 'reading' | 'waiting' | 'done' | 'not_in_queue'

interface PremidSessionState {
  stateVersion: 1
  routePath: string
  sessionId: string
  stateKind: PremidStateKind
  privacyMode: PremidPrivacyMode
  generatedAt: number
  sessionStatus?: 'active' | 'ended'
  sessionStartedAt?: number
  sessionEndedAt?: number
  isPrivateSession: boolean
  isPasscodeProtected: boolean
  memberCount: number
  bookTitle?: string
  authorName?: string
  sessionTitle?: string
  currentReaderName?: string
  viewer: {
    role: PremidViewerRole
    isParticipant: boolean
    queueStatus: PremidQueueStatus
    queuePosition?: number
  }
}

const presence = new Presence({
  clientId: '1476980926025044010',
})

const sessionPrefix = '/s/'
const stateScriptId = 'bookjourney-premid-state'
const logoUrl = 'https://raw.githubusercontent.com/quetrea/Activities/add-bookjourney-activity/websites/B/BookJourney/assets/logo.png'

function readState(): PremidSessionState | null {
  const node = document.getElementById(stateScriptId)
  if (!node?.textContent)
    return null

  try {
    const parsed = JSON.parse(node.textContent) as Partial<PremidSessionState>
    if (
      !parsed
      || typeof parsed !== 'object'
      || typeof parsed.stateKind !== 'string'
      || typeof parsed.routePath !== 'string'
    ) {
      return null
    }
    return parsed as PremidSessionState
  }
  catch {
    return null
  }
}

function toUnixSeconds(timestampMs: number | undefined): number | undefined {
  if (!timestampMs || Number.isNaN(timestampMs))
    return undefined

  return Math.floor(timestampMs / 1000)
}

function buildActivity(state: PremidSessionState): PresenceData | null {
  const startedAt = toUnixSeconds(state.sessionStartedAt)

  if (state.privacyMode === 'private_hidden') {
    return {
      details: 'In a private reading session',
      state: 'BookJourney',
      startTimestamp: startedAt,
      largeImageKey: logoUrl,
    }
  }

  if (state.stateKind === 'join_screen') {
    return {
      details: 'Joining a reading session',
      state: 'BookJourney',
      largeImageKey: logoUrl,
    }
  }

  if (state.stateKind === 'loading') {
    return {
      details: 'Loading session',
      state: 'BookJourney',
      largeImageKey: logoUrl,
    }
  }

  if (state.stateKind === 'not_found')
    return null

  if (state.stateKind === 'ended') {
    return {
      details: 'Viewing an ended session',
      state: state.bookTitle ? `Book: ${state.bookTitle}` : 'BookJourney',
      startTimestamp: startedAt,
      largeImageKey: logoUrl,
    }
  }

  const details = state.viewer.role === 'host' || state.viewer.role === 'moderator'
    ? 'Hosting a reading session'
    : 'In a reading session'

  let queueState = 'Live now'
  if (state.viewer.queueStatus === 'reading') {
    queueState = 'Currently reading'
  }
  else if (
    state.viewer.queueStatus === 'waiting'
    && typeof state.viewer.queuePosition === 'number'
  ) {
    queueState = `In queue (#${state.viewer.queuePosition})`
  }
  else if (state.currentReaderName) {
    queueState = `Current reader: ${state.currentReaderName}`
  }

  const stateLine = state.bookTitle ? `${queueState} | ${state.bookTitle}` : queueState

  return {
    details,
    state: stateLine,
    startTimestamp: startedAt,
    largeImageKey: logoUrl,
  }
}

presence.on('UpdateData', () => {
  if (!document.location.pathname.startsWith(sessionPrefix)) {
    presence.setActivity()
    return
  }

  const state = readState()
  if (!state) {
    presence.setActivity()
    return
  }

  const activity = buildActivity(state)
  if (!activity) {
    presence.setActivity()
    return
  }

  presence.setActivity(activity)
})
