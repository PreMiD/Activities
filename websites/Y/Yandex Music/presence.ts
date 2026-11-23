import { ActivityType, Assets, getTimestamps, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '745261937092198532',
})

const logo = 'https://cdn.rcd.gg/PreMiD/websites/Y/Yandex%20Music/assets/logo.png'

const timecodeSelectors = {
  current: [
    '[class*="TimecodeGroup_timecode_current"]',
    '[class*="ProgressTimecode_timecodeGroupCurrent"]',
    '[class*="Timecode_root_start"]',
  ],
  total: [
    '[class*="TimecodeGroup_timecode_end"]',
    '[class*="Timecode_root_end"]',
  ],
}

// The player icon changes with the player layout, so prefer the media session
// state and only fall back to the control that is shown while music plays.
function isPlaying(): boolean {
  const { playbackState } = navigator.mediaSession

  if (playbackState !== 'none')
    return playbackState === 'playing'

  if (document.querySelector('[data-test-id="PAUSE_BUTTON"], [data-test-id="MY_VIBE_PAUSE_BUTTON"]'))
    return true

  return [...document.querySelectorAll('use')].some((icon) => {
    const href = icon.getAttribute('href') ?? icon.getAttribute('xlink:href')
    return href?.includes('pause') ?? false
  })
}

function getTimecode(selectors: string[]): number | undefined {
  for (const selector of selectors) {
    const timecode = document.querySelector(selector)?.textContent?.trim()

    // Mirrors the format accepted by timestampFromFormat, so an actual 0:00
    // position stays distinguishable from a missing or invalid timecode.
    if (!timecode || !/^\d+(?::\d{1,2}(?::\d{1,2})?)?$/.test(timecode))
      continue

    return timestampFromFormat(timecode)
  }
}

function getArtwork(): string {
  const artwork = navigator.mediaSession.metadata?.artwork ?? []

  // The artwork list is ordered from the smallest size to the largest one.
  for (let i = artwork.length - 1; i >= 0; i--) {
    const src = artwork[i]?.src

    if (src?.startsWith('https://'))
      return src
  }

  return logo
}

presence.on('UpdateData', async () => {
  const metadata = navigator.mediaSession.metadata

  if (!metadata?.title || !isPlaying())
    return presence.clearActivity()

  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    smallImageKey: Assets.Play,
    largeImageKey: getArtwork(),
    details: metadata.title,
    state: metadata.artist || metadata.album || undefined,
  }

  const currentTime = getTimecode(timecodeSelectors.current)
  const duration = getTimecode(timecodeSelectors.total)

  // Only show a progress bar when the page exposes both values; a missing
  // position must not be treated as the start of the track.
  if (currentTime !== undefined && duration) {
    const [startTimestamp, endTimestamp] = getTimestamps(
      currentTime,
      duration,
    )

    presenceData.startTimestamp = startTimestamp
    presenceData.endTimestamp = endTimestamp
  }

  presence.setActivity(presenceData)
})
