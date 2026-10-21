import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({ clientId: '1557183181655121960' })
const browsingTimestamp = Math.floor(Date.now() / 1000)
const LOGO = 'https://kurono.nl/anime-icon-512.png'

// The player shows the series title directly above "S01 · EP 3 · Episode title".
function episodeInfo(): { series: string, label: string } | null {
  const label = [...document.querySelectorAll('p')].find(p => /^S\d+ · EP \d+/.test(p.textContent?.trim() ?? ''))
  const series = label?.previousElementSibling?.textContent?.trim()
  return label && series ? { series, label: label.textContent!.trim() } : null
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const data: PresenceData = { type: ActivityType.Watching, largeImageKey: LOGO, startTimestamp: browsingTimestamp }

  if (pathname.startsWith('/watch/')) {
    const info = episodeInfo()
    const video = document.querySelector<HTMLVideoElement>('video')
    if (info) {
      const [season, episode] = info.label.match(/^S(\d+) · EP (\d+)/)!.slice(1).map(Number)
      data.details = info.series
      data.state = `Season ${season} · Episode ${episode}`
      if (video?.poster) data.largeImageKey = new URL(video.poster, document.location.href).href
    }
    else {
      data.details = 'Watching an anime'
    }
    if (video && Number.isFinite(video.duration) && !video.paused) {
      [data.startTimestamp, data.endTimestamp] = getTimestampsFromMedia(video)
    }
    else {
      delete data.startTimestamp
      data.smallImageKey = Assets.Pause
      data.smallImageText = 'Paused'
    }
  }
  else if (pathname.startsWith('/series/') || pathname.startsWith('/movies/')) {
    data.details = 'Viewing an anime'
    data.state = document.querySelector('h1')?.textContent?.trim()
  }
  else if (pathname.startsWith('/manga') || pathname.startsWith('/read-online')) {
    data.details = 'Reading manga'
  }
  else if (pathname.startsWith('/novel')) {
    data.details = 'Reading a light novel'
  }
  else if (pathname.startsWith('/search') || pathname.startsWith('/browse') || pathname.startsWith('/genre')) {
    data.details = 'Browsing anime'
  }
  else {
    data.details = 'Browsing Kurono'
  }

  presence.setActivity(data)
})
