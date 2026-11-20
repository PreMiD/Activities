import type { Options, Playback } from './config/types.js'
import { buildFallbackActivity, buildPageActivity, getPageState } from './pages/browsing.js'
import { buildCodestoActivity, getCodestoState, isCodestoWorkspace } from './pages/codesto.js'
import { buildPomodoroActivity, getPomodoroState } from './pages/pomodoro.js'
import { buildReadActivity, getReadState, parseReadPath } from './pages/reader.js'
import { buildRoomActivity, getRoomState, isRoomPage } from './pages/rooms.js'
import { buildSectionActivity, getSectionState } from './pages/section.js'
import { buildWatchActivity, getWatchState, isWatchPage } from './pages/watch.js'
import { applyOptions, samePresence } from './util/activity.js'
import { safely } from './util/dom.js'
import { fetchCover, fetchTeacherPhoto, fetchTitleCover } from './util/images.js'
import { setIframePlayback } from './util/playback.js'
import { resetBrowsingTimestamp } from './util/session.js'

const presence = new Presence({
  clientId: '1233213267053248633',
})

/** Stores the playback state sent by the embedded player. */
presence.on('iFrameData', (data: Playback) => {
  setIframePlayback(data)
})

/** Reads a boolean setting, using `fallback` when it is missing. */
async function readSetting(id: string, fallback: boolean): Promise<boolean> {
  return presence.getSetting<boolean>(id).catch(() => fallback)
}

/** Reads the privacy and display settings. */
async function readSettings(): Promise<{ privacy: boolean, options: Options }> {
  return {
    privacy: await readSetting('privacy', false),
    options: {
      buttons: await readSetting('showButtons', true),
      cover: await readSetting('showCover', true),
      time: await readSetting('showTime', true),
    },
  }
}

/** Picks the page's activity, fetching a missing cover only when `covers` is true, and returns how to build it for a privacy setting. */
async function pickActivity(covers: boolean): Promise<{ build: (privacy: boolean) => PresenceData, watching: boolean }> {
  if (isCodestoWorkspace()) {
    const code = safely(getCodestoState)

    if (code) {
      return { build: privacy => buildCodestoActivity(code, privacy), watching: false }
    }
  }

  if (isRoomPage()) {
    const room = safely(getRoomState)

    if (room) {
      if (covers && !room.image && room.titleHref) {
        room.image = await fetchCover(room.titleHref)
      }

      return { build: privacy => buildRoomActivity(room, privacy), watching: false }
    }
  }

  const readPath = safely(parseReadPath)
  const read = readPath ? safely(() => getReadState(readPath)) : undefined

  if (read) {
    if (covers) {
      read.image ??= await fetchTitleCover()
    }

    return { build: privacy => buildReadActivity(read, privacy), watching: false }
  }

  const pomodoro = safely(getPomodoroState)

  if (pomodoro) {
    return { build: privacy => buildPomodoroActivity(pomodoro, privacy), watching: false }
  }

  const section = safely(getSectionState)

  if (section) {
    if (covers && section.teacher) {
      section.image = await fetchTeacherPhoto(section.teacher)
    }

    return { build: privacy => buildSectionActivity(section, privacy), watching: false }
  }

  const watch = safely(isWatchPage) ? safely(getWatchState) : undefined

  if (watch) {
    if (covers) {
      watch.image ??= await fetchTitleCover()
    }

    return { build: privacy => buildWatchActivity(watch, privacy), watching: true }
  }

  const page = safely(getPageState)

  return {
    build: privacy => page ? buildPageActivity(page, privacy) : buildFallbackActivity(),
    watching: false,
  }
}

const HEARTBEAT_MS = 15_000
let lastData: PresenceData | undefined
let lastSentAt = 0
let wasWatching = false

/** Starts a fresh browsing timer once the user stops watching. */
function trackWatching(watching: boolean): void {
  if (wasWatching && !watching) {
    resetBrowsingTimestamp()
  }

  wasWatching = watching
}

/** Updates the presence with coding, reading, watching, tool, game or browsing activity on every refresh. */
presence.on('UpdateData', async () => {
  const href = document.location.href
  const before = await readSettings()
  const { build, watching } = await pickActivity(!before.privacy && before.options.cover)
  const { privacy, options } = await readSettings()

  if (document.location.href !== href) {
    return
  }

  trackWatching(watching)

  const data = applyOptions(
    safely(() => build(privacy)) ?? buildFallbackActivity(),
    options,
  )

  if (lastData && Date.now() - lastSentAt < HEARTBEAT_MS && samePresence(lastData, data)) {
    return
  }

  lastData = data
  lastSentAt = Date.now()
  presence.setActivity(data)
})
