import {
  Assets,
  getTimestamps,
  timestampFromFormat,
} from 'premid'

const presence = new Presence({
  clientId: '1546944149364670565',
})

enum ActivityAssets {
  Logo = 'https://raw.githubusercontent.com/STAELH81/premid-assets/main/logo.png',
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const centiseconds = Math.floor((seconds % 1) * 100)

  return `${minutes}:${String(secs).padStart(2, '0')}:${String(centiseconds).padStart(2, '0')}`
}

presence.on('UpdateData', async () => {
  if (!document.location.pathname.startsWith('/studio/'))
    return

  const language = await presence
    .getSetting<number>('language')
    .catch(() => 0)

  const isFrench = language === 1

  const strings = isFrench
    ? {
        playing: 'Lecture',
        paused: 'En pause',
        recording: 'Enregistrement',
      }
    : {
        playing: 'Playing',
        paused: 'Paused',
        recording: 'Recording',
      }

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  const projectName = document.title
    .replace(/ - Soundtrap$/, '')
    .trim()

  const playButton = document.querySelector<HTMLButtonElement>(
    'button.play.transport-controls__button',
  )

  const recordButton = document.querySelector<HTMLButtonElement>(
    'button.rec.transport-controls__button',
  )

  const isPlaying
    = playButton?.classList.contains('selected') ?? false

  const isRecording
    = recordButton?.classList.contains('selected') ?? false

  const playhead = document.querySelector<HTMLElement>(
    '.timelabel',
  )

  const currentTime
    = playhead?.textContent?.trim() ?? '00:00.0'

  const currentSeconds
    = timestampFromFormat(currentTime)

  const bpmText = document
    .querySelector('.tempocontrols__tempo-button')
    ?.textContent ?? ''

  const bpm = Number(
    bpmText
      .match(/\d+(?:[.,]\d+)?/)?.[0]
      ?.replace(',', '.'),
  )

  const key = document
    .querySelector('.tempocontrols__key-button')
    ?.textContent
    ?.trim() ?? '?'

  const timeSignature = document
    .querySelector('.tempocontrols__timesignature-button')
    ?.textContent
    ?.trim() ?? '?'

  const endBeats = [
    ...document.querySelectorAll(
      '.baseregion[data-end-beat]',
    ),
  ]
    .map(el =>
      Number(el.getAttribute('data-end-beat')),
    )
    .filter(Number.isFinite)

  const lastBeat = endBeats.length
    ? Math.max(...endBeats)
    : 0

  const durationSeconds
    = bpm > 0
      ? lastBeat * 60 / bpm
      : 0

  const durationText
    = formatTime(durationSeconds)

  presenceData.details
    = `${projectName} • ${bpm} BPM • ${key} • ${timeSignature}`

  if (isRecording) {
    presenceData.state
      = `${strings.recording} • ${currentTime} / ${durationText}`

    presenceData.smallImageKey = Assets.Live
    presenceData.smallImageText
      = strings.recording

    const [startTimestamp] = getTimestamps(
      currentSeconds,
      durationSeconds,
    )

    presenceData.startTimestamp
      = startTimestamp
  }
  else if (isPlaying) {
    presenceData.state
      = `${strings.playing} • ${currentTime} / ${durationText}`

    presenceData.smallImageKey = Assets.Play
    presenceData.smallImageText
      = strings.playing

    const [startTimestamp] = getTimestamps(
      currentSeconds,
      durationSeconds,
    )

    presenceData.startTimestamp
      = startTimestamp
  }
  else {
    presenceData.state
      = `${strings.paused} • ${currentTime} / ${durationText}`

    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText
      = strings.paused
  }

  presence.setActivity(presenceData)
})
