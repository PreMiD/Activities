import type { WorkInfo } from './activity.js'
import { Assets, supports } from 'premid'
import { applyDisplayType, buildBrowsingPresence, buildContentPresence, getViewerWorkId, resolveDisplayType, shouldApplyPrivacy, WorkSession } from './activity.js'
import { stringKeys, TranslationCache } from './i18n.js'
import { DlsiteReader, normalizeSnapshot } from './site.js'

// Development reloads replace Presence but do not remove our DOM listeners.
const cleanupKey = Symbol.for('premid.dlsite-play.cleanup')
const activityScope = globalThis as typeof globalThis & { [cleanupKey]?: () => void }
activityScope[cleanupKey]?.()

const presence = new Presence({
  clientId: '1565258674836996106',
})
const session = new WorkSession()
const reader = new DlsiteReader()
let update = 0
let warned = false
let lastIssue: string | null = null
let currentWork: WorkInfo | null = null
let currentContext: string | null = null
let lastPrivacyMode = true
let lastTimelineDiagnostic = ''
let currentData: PresenceData | null = null
let retryTimer: ReturnType<typeof setTimeout> | null = null
let active = true
let lastDisplaySetting = 2
let activityHidden = false
let runningUpdate: { key: string, promise: Promise<void> } | null = null
let disposed = false
let stopRequests: (() => void) | undefined
const translations = new TranslationCache(() => presence.getStrings(stringKeys), () => {
  void updatePresence(true)
})

function rememberDisplaySetting(value: unknown) {
  // getSetting can resolve undefined as well as reject. Neither is a new choice.
  if (value === 0 || value === 1 || value === 2)
    lastDisplaySetting = value
  return resolveDisplayType(lastDisplaySetting)
}

function withdrawActivity(reason: string) {
  if (!active)
    return
  currentData = null
  if (!activityHidden) {
    console.warn(`DLsite Play: lifecycle clear; reason=${reason}; ${reader.getLifecycleDiagnostic()}`)
    presence.clearActivity()
  }
  activityHidden = true
}

function publish(data: PresenceData | null, skipUnchanged = false) {
  if (!active)
    return
  // Rebuild from an allowlist if newer restriction evidence arrived. Never
  // forward the earlier public payload, including its playback timestamps.
  if (data && currentWork && reader.isR18(currentWork.id))
    data = buildContentPresence({ ...currentWork, rating: 'r18' }, null, true, session.update(currentWork.id), '')
  if (!data) {
    withdrawActivity('blocked-content')
    return
  }
  if (skipUnchanged && JSON.stringify(currentData) === JSON.stringify(data))
    return
  currentData = data
  if (activityHidden)
    console.warn(`DLsite Play: lifecycle restored; ${reader.getLifecycleDiagnostic()}`)
  activityHidden = false
  presence.setActivity(data)
}

reader.onIdentityChange = () => {
  if (!canRetainActivity())
    withdrawActivity('identity-change')
  void updatePresence()
}

reader.onPlaybackChange = () => {
  void updatePresence()
}
reader.onTimelineChange = () => {
  void updatePresence(true)
}

// Passive observation works under the site's CSP; function-form execInPage does not.
if (supports(presence, 'onRequest')) {
  stopRequests = presence.onRequest({
    url: /^https:\/\/play\.dlsite\.com\/api\/(?:v4\/download\/sign\/url(?:\?|$)|(?:v4\/work|viewer\/work)\/)/,
    method: 'GET',
  }, (request) => {
    if (!active)
      return
    if (reader.observeRequest(request)) {
      if (!canRetainActivity())
        withdrawActivity('request')
      void updatePresence(true)
    }
  })
}

function canKeepCurrentWork() {
  return currentWork && (reader.canKeepAudioPresence(currentWork.id) || getViewerWorkId(document.location.pathname) === currentWork.id)
}

function canRetainActivity() {
  // Generic browsing has no work to validate. Folder URLs alone must not
  // withdraw it; a mounted player or viewer still requires classification.
  if (!currentWork)
    return currentData !== null && reader.isBrowsing()
  if (currentWork.rating === 'r18' && currentData)
    return currentContext === reader.getContextKey()
  return !reader.isR18(currentWork.id)
    && (canKeepCurrentWork() || reader.audioContinuity(currentWork.id) === 'transient')
}

function refreshAfter(delay: number) {
  if (retryTimer !== null)
    clearTimeout(retryTimer)
  retryTimer = setTimeout(() => {
    retryTimer = null
    void updatePresence(true)
  }, delay)
}

function clearNavigation() {
  if (!active)
    return
  console.warn(`DLsite Play: lifecycle navigation; ${reader.getLifecycleDiagnostic()}`)
  // Folder navigation does not change the background player's identity.
  if (currentData && currentWork && reader.canKeepAudioPresence(currentWork.id))
    return
  if (!canRetainActivity())
    withdrawActivity('navigation')
  void updatePresence(true)
}

function suspend() {
  active = false
  runningUpdate = null
  ++update
  session.update(null)
  currentWork = null
  currentContext = null
  currentData = null
  reader.disconnectPlaybackObserver()
  reader.invalidate()
  if (retryTimer !== null)
    clearTimeout(retryTimer)
  retryTimer = null
}

function hidePage() {
  if (disposed)
    return
  suspend()
  console.warn(`DLsite Play: lifecycle clear; reason=pagehide; ${reader.getLifecycleDiagnostic()}`)
  presence.clearActivity()
  activityHidden = true
}

function showPage() {
  if (disposed)
    return
  active = true
  void updatePresence()
}

window.addEventListener('popstate', clearNavigation)
window.addEventListener('hashchange', clearNavigation)
window.navigation?.addEventListener('navigatesuccess', clearNavigation)
window.addEventListener('pagehide', hidePage)
window.addEventListener('pageshow', showPage)
activityScope[cleanupKey] = () => {
  disposed = true
  translations.dispose()
  suspend()
  stopRequests?.()
  window.removeEventListener('popstate', clearNavigation)
  window.removeEventListener('hashchange', clearNavigation)
  window.navigation?.removeEventListener('navigatesuccess', clearNavigation)
  window.removeEventListener('pagehide', hidePage)
  window.removeEventListener('pageshow', showPage)
}

function updatePresence(skipUnchanged = false): Promise<void> {
  if (!active)
    return Promise.resolve()
  const key = reader.getReadKey()
  if (runningUpdate?.key === key)
    return runningUpdate.promise
  const pending = { key, promise: Promise.resolve() }
  runningUpdate = pending
  pending.promise = performUpdate(skipUnchanged).finally(() => {
    if (runningUpdate === pending)
      runningUpdate = null
  })
  return pending.promise
}

async function performUpdate(skipUnchanged: boolean) {
  if (!active)
    return
  const generation = ++update
  if (retryTimer !== null) {
    clearTimeout(retryTimer)
    retryTimer = null
  }
  if (currentWork && !canRetainActivity())
    withdrawActivity('before-read')

  const [privacy, languageSetting, display] = await Promise.all([
    presence.getSetting<boolean>('privacyMode').catch(() => true),
    presence.getSetting<string>('lang').catch(() => undefined),
    presence.getSetting<number>('displayType').catch(() => undefined),
  ])
  if (generation !== update)
    return
  const privacyMode = privacy !== false
  rememberDisplaySetting(display)
  translations.refresh(languageSetting)
  if (privacyMode && !lastPrivacyMode && currentWork) {
    lastPrivacyMode = true
    publish(buildContentPresence(currentWork, null, true, session.update(currentWork.id), ''))
  }
  // A display-only change needs no new work metadata. Update only a payload
  // already authorized for the unchanged player; never restore hidden fields.
  if (currentData && currentWork && canKeepCurrentWork()) {
    const data = applyDisplayType(currentData, resolveDisplayType(lastDisplaySetting))
    if (['audio', 'music', 'video'].includes(currentWork.category)
      && !shouldApplyPrivacy(currentWork, privacyMode) && reader.getPlaybackPaused()) {
      // Freeze the clock before waiting for IndexedDB, but after reading the
      // latest settings so a pause cannot resend the previous Display choice.
      data.smallImageKey = Assets.Pause
      data.smallImageText = translations.messages.paused
      delete data.startTimestamp
      delete data.endTimestamp
    }
    publish(data, true)
  }
  try {
    const rawSnapshot = await reader.read(privacyMode)
    if (generation !== update)
      return
    if (rawSnapshot.stale) {
      if (!canRetainActivity())
        withdrawActivity('stale-read')
      refreshAfter(200)
      return
    }
    if (rawSnapshot.retryAfter !== undefined) {
      if (!canRetainActivity())
        withdrawActivity('retry')
      refreshAfter(rawSnapshot.retryAfter)
      return
    }
    // Settings may change while IndexedDB is pending without another UpdateData
    // event. Read the current choice immediately before publishing its result.
    const context = reader.getContextKey()
    const [latestDisplay, latestPrivacy] = await Promise.all([
      presence.getSetting<number>('displayType').catch(() => undefined),
      presence.getSetting<boolean>('privacyMode').catch(() => true),
    ])
    if (generation !== update)
      return
    if ((latestPrivacy !== false) !== privacyMode) {
      if (latestPrivacy !== false)
        withdrawActivity('privacy-change')
      refreshAfter(0)
      return
    }
    if (context !== reader.getContextKey()) {
      if (!canRetainActivity())
        withdrawActivity('context-after-read')
      refreshAfter(200)
      return
    }
    const displayType = rememberDisplaySetting(latestDisplay)
    const snapshot = normalizeSnapshot(rawSnapshot, privacyMode)
    const startedAt = session.update(snapshot.work?.id ?? null)
    const data = snapshot.work
      ? buildContentPresence(snapshot.work, snapshot.playback, privacyMode, startedAt, translations.messages.viewWork, displayType, translations.messages)
      : buildBrowsingPresence()
    currentWork = snapshot.work
    currentContext = context
    lastPrivacyMode = privacyMode
    publish(data, skipUnchanged)
    if (rawSnapshot.refreshAfter !== undefined)
      refreshAfter(rawSnapshot.refreshAfter)
    if (data && snapshot.work && ['audio', 'music'].includes(snapshot.work.category)
      && !shouldApplyPrivacy(snapshot.work, privacyMode)) {
      const diagnostic = `${reader.progressState}; start=${Boolean(data.startTimestamp)}; end=${Boolean(data.endTimestamp)}; paused=${snapshot.playback?.paused ?? 'unknown'}; artwork=${Boolean(data.largeImageKey)}`
      if (lastTimelineDiagnostic !== diagnostic) {
        lastTimelineDiagnostic = diagnostic
        console.warn(`DLsite Play: timeline ${diagnostic}`)
      }
    }
    if (reader.issue !== lastIssue) {
      lastIssue = reader.issue
      if (lastIssue)
        console.warn(`DLsite Play: ${lastIssue}. No work information is being shared.`)
    }
  }
  catch {
    if (generation !== update)
      return
    withdrawActivity('read-error')
    if (!warned) {
      warned = true
      console.warn('DLsite Play: page state unavailable; activity hidden.')
    }
  }
}

presence.on('UpdateData', updatePresence)
