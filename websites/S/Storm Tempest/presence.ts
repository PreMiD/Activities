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

/** Updates the presence with coding, reading, watching, tool, game or browsing activity on every refresh. */
presence.on('UpdateData', async () => {
  const privacy = await readSetting('privacy', false)
  const options: Options = {
    buttons: await readSetting('showButtons', true),
    cover: await readSetting('showCover', true),
    time: await readSetting('showTime', true),
  }
  const show = (data: PresenceData): void => {
    presence.setActivity(applyOptions(data, options))
  }

  if (isCodestoWorkspace()) {
    show(buildCodestoActivity(getCodestoState(), privacy))

    return
  }

  if (isRoomPage()) {
    const room = getRoomState()

    if (room) {
      if (!room.image && room.titleHref) {
        room.image = await fetchCover(room.titleHref)
      }

      show(buildRoomActivity(room, privacy))

      return
    }
  }

  const readPath = parseReadPath()

  if (readPath) {
    const read = getReadState(readPath)

    read.image ??= await fetchTitleCover()

    show(buildReadActivity(read, privacy))

    return
  }

  const section = getSectionState()

  if (section) {
    if (section.teacher) {
      section.image = await fetchTeacherPhoto(section.teacher)
    }

    show(buildSectionActivity(section, privacy))

    return
  }

  if (isWatchPage()) {
    const watch = getWatchState()

    watch.image ??= await fetchTitleCover()

    show(buildWatchActivity(watch, privacy))

    return
  }

  show(buildPageActivity(getPageState(), privacy))
})
