const STORAGE_KEY = 'stormTempestBrowsingStart'
const MAX_AGE_SECONDS = 6 * 60 * 60

let start: number | undefined

/** Returns when browsing began, in seconds: set on first use, kept across pages and reloads of the tab. */
export function getBrowsingTimestamp(): number {
  if (start) {
    return start
  }

  const now = Math.floor(Date.now() / 1000)

  try {
    const saved = Number(sessionStorage.getItem(STORAGE_KEY))

    if (saved > 0 && now - saved < MAX_AGE_SECONDS) {
      start = saved

      return start
    }

    sessionStorage.setItem(STORAGE_KEY, String(now))
  }
  catch {
    start = now
  }

  start ??= now

  return start
}

let channel: { key: string, start: number } | undefined

/** Returns when the current live channel was opened, in seconds, so its timer counts normally and restarts on another channel. */
export function getChannelTimestamp(): number {
  const key = document.location.pathname

  if (channel?.key !== key) {
    channel = { key, start: Math.floor(Date.now() / 1000) }
  }

  return channel.start
}

/** Forgets when browsing began, so the next browsing page starts a fresh timer after watching. */
export function resetBrowsingTimestamp(): void {
  start = undefined

  try {
    sessionStorage.removeItem(STORAGE_KEY)
  }
  catch {
    start = undefined
  }
}
