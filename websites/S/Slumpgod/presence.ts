import { ActivityType, Assets, StatusDisplayType } from 'premid'

// The Discord application for this activity: its name is what Discord shows ("Listening to ...")
const presence = new Presence({
  clientId: '1563769553132200017',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/lTYRclu.png',
}

/**
 * The site writes what's playing into a hidden <script id="riot-presence"> (JSON), already shaped by
 * each person's Discord Status settings on the site (Settings > Discord Status), so this only copies it.
 */
interface SiteData {
  v: number
  active: boolean
  playing?: boolean
  details?: string
  state?: string
  image?: string
  imageText?: string
  start?: number | null
  end?: number | null
  button?: { label: string, url: string } | null
}

// "Playing" / "Paused" in the listener's language (PreMiD's shared strings)
let strings: { play: string, pause: string } | null = null

function readSite(): SiteData | null {
  const node = document.querySelector<HTMLScriptElement>('#riot-presence')
  if (!node?.textContent)
    return null
  try {
    return JSON.parse(node.textContent) as SiteData
  }
  catch {
    return null
  }
}

presence.on('UpdateData', async () => {
  const data = readSite()
  if (!data?.active)
    return presence.clearActivity()

  strings ??= await presence.getStrings({ play: 'general.playing', pause: 'general.paused' })

  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    // "Listening to <song>" instead of "Listening to slumpgod"
    statusDisplayType: StatusDisplayType.Details,
    details: data.details,
    state: data.state,
    largeImageKey: data.image || ActivityAssets.Logo,
    largeImageText: data.imageText || 'on slumpgod.org',
    smallImageKey: data.playing ? Assets.Play : Assets.Pause,
    smallImageText: data.playing ? strings.play : strings.pause,
  }
  // Seconds: when the song started (and ends, for the progress bar)
  if (data.playing && data.start) {
    presenceData.startTimestamp = data.start
    if (data.end)
      presenceData.endTimestamp = data.end
  }
  // Opens the song that's playing (not the front page)
  if (data.button?.url)
    presenceData.buttons = [{ label: 'Listen to Song', url: data.button.url }]

  presence.setActivity(presenceData)
})
