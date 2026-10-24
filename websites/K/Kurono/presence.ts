import { ActivityType, getTimestampsFromMedia, StatusDisplayType } from 'premid'

const presence = new Presence({ clientId: '1557183181655121960' })
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://kurono.nl/brand/premid-logo.png',
  Play = 'https://kurono.nl/brand/premid-play.png',
  Pause = 'https://kurono.nl/brand/premid-pause.png',
  Search = 'https://kurono.nl/brand/premid-search.png',
  Read = 'https://kurono.nl/brand/premid-read.png',
}

// Season names as shown in the site's season menu, cached per show.
const seasonLabels = new Map<string, Record<string, string>>()
async function seasonLabel(slug: string, folder: string): Promise<string | undefined> {
  if (!seasonLabels.has(slug)) {
    seasonLabels.set(slug, {})
    try {
      const res = await fetch(`/api/anikoto-episodes?slug=${encodeURIComponent(slug)}`)
      const { seasons } = await res.json() as { seasons: { seasonFolder: string, label: string }[] }
      seasonLabels.set(slug, Object.fromEntries(seasons.map(s => [s.seasonFolder, s.label])))
    }
    catch {}
  }
  return seasonLabels.get(slug)![folder]
}

// The player shows the series title directly above "S01 · EP 3 · Episode title".
function episodeInfo(): { series: string, season: number, episode: number, title?: string } | null {
  const label = [...document.querySelectorAll('p')].find(p => /^S\d+ · EP \d+/.test(p.textContent?.trim() ?? ''))
  const series = label?.previousElementSibling?.textContent?.trim()
  const match = label?.textContent?.trim().match(/^S(\d+) · EP (\d+)(?: · (.+))?/)
  if (!match || !series)
    return null
  return { series, season: Number(match[1]), episode: Number(match[2]), title: match[3] }
}

presence.on('UpdateData', async () => {
  const { pathname, href, search } = document.location
  const data: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  if (pathname.startsWith('/watch/')) {
    const slug = pathname.split('/')[2] ?? ''
    const info = episodeInfo()
    const video = document.querySelector<HTMLVideoElement>('video')
    if (info) {
      const folder = new URLSearchParams(search).get('season') ?? `Season ${String(info.season).padStart(2, '0')}`
      const season = await seasonLabel(slug, folder) ?? `Season ${info.season}`
      data.details = info.series
      data.state = `${season} · Episode ${info.episode}`
      data.largeImageKey = `https://kurono.nl/api/poster?slug=${encodeURIComponent(slug)}`
      data.largeImageText = info.title ?? info.series
      data.detailsUrl = `https://kurono.nl/series/${slug}`
      data.statusDisplayType = StatusDisplayType.Details
      data.buttons = [{ label: 'Watch Episode', url: href }]
    }
    else {
      data.details = 'Watching an anime'
    }
    if (video && Number.isFinite(video.duration) && !video.paused) {
      [data.startTimestamp, data.endTimestamp] = getTimestampsFromMedia(video)
      data.smallImageKey = ActivityAssets.Play
      data.smallImageText = 'Playing'
    }
    else {
      delete data.startTimestamp
      data.smallImageKey = ActivityAssets.Pause
      data.smallImageText = 'Paused'
    }
  }
  else if (pathname.startsWith('/series/') || pathname.startsWith('/movies/')) {
    data.details = 'Viewing an anime'
    data.state = document.querySelector('h1')?.textContent?.trim()
    data.smallImageKey = ActivityAssets.Search
    data.smallImageText = 'Browsing'
  }
  else if (pathname.startsWith('/manga') || pathname.startsWith('/read-online')) {
    data.details = 'Reading manga'
    data.smallImageKey = ActivityAssets.Read
    data.smallImageText = 'Reading'
  }
  else if (pathname.startsWith('/novel')) {
    data.details = 'Reading a light novel'
    data.smallImageKey = ActivityAssets.Read
    data.smallImageText = 'Reading'
  }
  else {
    data.details = pathname.startsWith('/search') || pathname.startsWith('/browse') || pathname.startsWith('/genre')
      ? 'Browsing anime'
      : 'Browsing Kurono'
    data.smallImageKey = ActivityAssets.Search
    data.smallImageText = 'Browsing'
  }

  presence.setActivity(data)
})
