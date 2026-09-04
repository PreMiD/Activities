import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1250551199862624349',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AMLL%20TTML%20Tool/assets/logo.png',
}

interface PresenceSnapshot {
  version: 1
  mode: 'edit' | 'sync' | 'preview'
  title: string
  artist: string
  currentLine: number | null
  totalLines: number
  playing: boolean
  positionSeconds: number
  durationSeconds: number
  playbackRate: number
  projectElapsedSeconds?: number
}

const strings = presence.getStrings({
  playing: 'general.playing',
  paused: 'general.paused',
})

const modeLabels: Record<PresenceSnapshot['mode'], string> = {
  edit: 'Editing',
  sync: 'Syncing',
  preview: 'Previewing',
}

const truncateDiscordText = (value: string) => [...value].slice(0, 128).join('')

function readSnapshot(): PresenceSnapshot | null {
  const content = document.querySelector<HTMLMetaElement>(
    'meta[name="amll-discord-presence"]',
  )?.content
  if (!content)
    return null

  try {
    const snapshot = JSON.parse(content) as PresenceSnapshot
    if (snapshot.version !== 1 || !(snapshot.mode in modeLabels))
      return null
    return snapshot
  }
  catch {
    return null
  }
}

function parseDisplayedTime(value: string): number {
  return value.split(':').reduce((total, part) => total * 60 + (Number.parseFloat(part) || 0), 0)
}

function readLegacySnapshot(): PresenceSnapshot {
  const modeControl = [...document.querySelectorAll('.rt-SegmentedControlRoot')]
    .find(control => control.querySelectorAll('.rt-SegmentedControlItem').length === 3)
  const modeItems = [...(modeControl?.querySelectorAll('.rt-SegmentedControlItem') ?? [])]
  const activeModeIndex = modeItems.findIndex(item =>
    item.getAttribute('aria-checked') === 'true'
    || item.getAttribute('data-state') === 'on',
  )
  const mode: PresenceSnapshot['mode'] = activeModeIndex === 1
    ? 'sync'
    : activeModeIndex === 2
      ? 'preview'
      : 'edit'

  const projectButton = [...document.querySelectorAll<HTMLButtonElement>('button')]
    .find(button => /\.(?:ttml|lrc|txt)\b/i.test(button.textContent ?? ''))
  const title = (projectButton?.textContent ?? '')
    .trim()
    .replace(/\.(?:ttml|lrc|txt)\s*$/i, '')

  const renderedLines = [...document.querySelectorAll<HTMLElement>('[data-lyric-line-id]')]
  const uniqueLineIds = new Set(renderedLines.map(line => line.dataset.lyricLineId).filter(Boolean))
  const selectedLine = document.querySelector<HTMLElement>(
    '[class*="_selected_"] [data-lyric-line-id], [class*="_selected_"][data-lyric-line-id]',
  )
  const selectedId = selectedLine?.dataset.lyricLineId
  const selectedIndex = selectedId ? [...uniqueLineIds].indexOf(selectedId) : -1
  const legacySelectedIndex = Number.parseInt(
    document.querySelector('div[class*="_selected_"]')?.firstChild?.textContent ?? '',
  )
  const totalLines = uniqueLineIds.size || document.querySelectorAll(
    'div[class*="lyricLine_"], div[class*="lyricLineContainer"]',
  ).length

  const timeLabels = [...document.querySelectorAll<HTMLElement>('.rt-Text')]
    .map(element => element.textContent?.trim() ?? '')
    .filter(value => /^(?:\d+:)?\d+:\d+(?:\.\d+)?$/.test(value))
  const positionSeconds = parseDisplayedTime(timeLabels[0] ?? '0:00')
  const durationSeconds = parseDisplayedTime(timeLabels.at(-1) ?? '0:00')
  const playPauseButton = [...document.querySelectorAll<HTMLButtonElement>('button.rt-IconButton')]
    .find((button) => {
      const path = button.querySelector('svg path')?.getAttribute('d')
      return path?.startsWith('M17.22') || path?.startsWith('M5 2')
    })
  const playing = playPauseButton
    ?.querySelector('svg path')
    ?.getAttribute('d')
    ?.startsWith('M5 2') ?? false

  return {
    version: 1,
    mode,
    title,
    artist: '',
    currentLine: selectedIndex >= 0
      ? selectedIndex + 1
      : Number.isNaN(legacySelectedIndex) ? null : legacySelectedIndex,
    totalLines,
    playing,
    positionSeconds,
    durationSeconds,
    playbackRate: 1,
  }
}

presence.on('UpdateData', async () => {
  // The fork publishes a stable contract. The upstream/base editor does not,
  // so only it falls back to the isolated DOM compatibility adapter.
  const bridgeSnapshot = readSnapshot()
  const snapshot = bridgeSnapshot ?? readLegacySnapshot()
  const currentStrings = await strings
  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'AMLL TTML Tool',
  }

  const subject = snapshot.title || 'Untitled lyrics'
  const progress = snapshot.currentLine
    ? `Line ${snapshot.currentLine} of ${snapshot.totalLines}`
    : snapshot.totalLines > 0
      ? `${snapshot.totalLines} lines`
      : 'No lyrics yet'

  presenceData.details = truncateDiscordText(`${modeLabels[snapshot.mode]} ${subject}`)
  presenceData.state = truncateDiscordText(snapshot.artist
    ? `${snapshot.artist} • ${progress}`
    : progress)

  if (snapshot.playing && snapshot.durationSeconds > snapshot.positionSeconds) {
    presenceData.smallImageKey = Assets.Play
    presenceData.smallImageText = currentStrings.playing
    const rate = Math.max(0.01, snapshot.playbackRate)
    const [start, end] = getTimestamps(
      snapshot.positionSeconds / rate,
      snapshot.durationSeconds / rate,
    )
    presenceData.startTimestamp = start
    presenceData.endTimestamp = end
  }
  else if (snapshot.durationSeconds > 0) {
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = currentStrings.paused
    if (snapshot.projectElapsedSeconds)
      presenceData.startTimestamp = Math.floor(Date.now() / 1000 - snapshot.projectElapsedSeconds)
  }
  else if (snapshot.projectElapsedSeconds) {
    presenceData.startTimestamp = Math.floor(Date.now() / 1000 - snapshot.projectElapsedSeconds)
  }

  presence.setActivity(presenceData)
})
