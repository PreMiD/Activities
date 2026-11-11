import type { Options, Playback } from './config/types.js'
import { buildPageActivity, getPageState } from './pages/browsing.js'
import { buildCodestoActivity, getCodestoState, isCodestoWorkspace } from './pages/codesto.js'
import { buildReadActivity, getReadState, parseReadPath } from './pages/reader.js'
import { buildRoomActivity, getRoomState, isRoomPage } from './pages/rooms.js'
import { buildSectionActivity, getSectionState } from './pages/section.js'
import { buildWatchActivity, getWatchState, isWatchPage } from './pages/watch.js'
import { applyOptions } from './util/activity.js'
import { fetchCover, fetchTeacherPhoto, fetchTitleCover } from './util/images.js'
import { setIframePlayback } from './util/playback.js'

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
async function pickActivity(covers: boolean): Promise<(privacy: boolean) => PresenceData> {
  if (isCodestoWorkspace()) {
    const code = getCodestoState()

    return privacy => buildCodestoActivity(code, privacy)
  }

  if (isRoomPage()) {
    const room = getRoomState()

    if (room) {
      if (covers && !room.image && room.titleHref) {
        room.image = await fetchCover(room.titleHref)
      }

      return privacy => buildRoomActivity(room, privacy)
    }
  }

  const readPath = parseReadPath()

  if (readPath) {
    const read = getReadState(readPath)

    if (covers) {
      read.image ??= await fetchTitleCover()
    }

    return privacy => buildReadActivity(read, privacy)
  }

  const section = getSectionState()

  if (section) {
    if (covers && section.teacher) {
      section.image = await fetchTeacherPhoto(section.teacher)
    }

    return privacy => buildSectionActivity(section, privacy)
  }

  if (isWatchPage()) {
    const watch = getWatchState()

    if (covers) {
      watch.image ??= await fetchTitleCover()
    }

    return privacy => buildWatchActivity(watch, privacy)
  }

  const page = getPageState()

  return privacy => buildPageActivity(page, privacy)
}

/** Updates the presence with coding, reading, watching, tool, game or browsing activity on every refresh. */
presence.on('UpdateData', async () => {
  const before = await readSettings()
  const build = await pickActivity(!before.privacy && before.options.cover)
  const { privacy, options } = await readSettings()

  presence.setActivity(applyOptions(build(privacy), options))
})
