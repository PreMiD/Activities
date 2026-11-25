import type { PomodoroState } from '../config/types.js'
import { ActivityType } from 'premid'
import { ActivityAssets } from '../config/constants.js'
import { buildButtons } from '../util/activity.js'

const STORAGE_KEY = 'st_pomodoro'
const LENGTHS = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 }

/** Reads the study timer the site keeps for the tab, while it is running on a Studysto or Plansto page that is not a lecture. */
export function getPomodoroState(): PomodoroState | undefined {
  const path = document.location.pathname
  const area = path.split('/').filter(Boolean)[0]?.toLowerCase()

  if (
    (area !== 'studysto' && area !== 'plansto')
    || /^\/studysto\/watch\//i.test(path)
  ) {
    return undefined
  }

  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null') as {
      phase?: string
      endsAt?: number | null
      round?: number
    } | null
    const phase = saved?.phase

    if (
      !saved?.endsAt
      || saved.endsAt <= Date.now()
      || (phase !== 'focus' && phase !== 'short' && phase !== 'long')
    ) {
      return undefined
    }

    return {
      phase,
      session: phase === 'focus' ? (saved.round ?? 0) + 1 : undefined,
      area: area === 'plansto' ? 'Plansto' : 'Studysto',
      endsAt: saved.endsAt,
      length: LENGTHS[phase],
      url: document.location.href,
    }
  }
  catch {
    return undefined
  }
}

/** Builds the presence shown while the study timer runs, with its time left as a progress bar. */
export function buildPomodoroActivity(pomodoro: PomodoroState, privacy: boolean): PresenceData {
  const details = pomodoro.phase === 'focus'
    ? privacy || !pomodoro.session ? 'Focusing' : `Focusing • Session ${pomodoro.session} of 4`
    : pomodoro.phase === 'short' ? 'On a break' : 'On a long break'

  return {
    type: ActivityType.Watching,
    details,
    state: pomodoro.area,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: Math.floor((pomodoro.endsAt - pomodoro.length * 1000) / 1000),
    endTimestamp: Math.floor(pomodoro.endsAt / 1000),
    buttons: privacy
      ? buildButtons()
      : buildButtons({ label: 'Open Timer', url: pomodoro.url }),
  }
}
