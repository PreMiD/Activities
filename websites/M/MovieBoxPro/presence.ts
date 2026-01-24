import { ActivityType, Assets, getTimestamps, timestampFromFormat } from 'premid'

declare const Presence: any

const presence = new Presence({ clientId: '1453728381903306814' })

function extractSeasonEpisode(text: string | null | undefined): string | null {
  if (!text)
    return null
  const match = text.match(/S(\d+)\s*E(\d+)/i)
  return (match && match[1] && match[2]) ? `Season ${Number.parseInt(match[1])}, Episode ${Number.parseInt(match[2])}` : null
}

presence.on('UpdateData', async () => {
  const video = document.querySelector('video')
  const rawTitle = document.querySelector('span.name')?.textContent ?? null

  const presenceData: any = {
    type: ActivityType.Watching,
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/MovieBoxPro/assets/logo.jpg',
    details: 'Browsing Library',
    state: 'Choosing a movie...',
  }

  if (video && rawTitle) {
    presenceData.details = rawTitle

    const coverImg = document.querySelector<HTMLImageElement>('img.cover')
    if (coverImg)
      presenceData.largeImageKey = coverImg.src

    const params = new URLSearchParams(document.location.search)
    let episodeInfo = (params.get('season') && params.get('episode'))
      ? `Season ${params.get('season')}, Episode ${params.get('episode')}`
      : null

    if (!episodeInfo) {
      const jwTitle = document.querySelector('.jw-title-primary')?.textContent ?? document.querySelector('.jw-title-secondary')?.textContent
      episodeInfo = extractSeasonEpisode(jwTitle)
    }

    if (!episodeInfo) {
      const videoContainer = document.querySelector('.video-js')
      if (videoContainer)
        episodeInfo = extractSeasonEpisode(videoContainer.textContent)
    }

    if (!episodeInfo) {
      const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content')
      episodeInfo = extractSeasonEpisode(metaDesc) || extractSeasonEpisode(document.title)
    }

    presenceData.state = episodeInfo || (document.location.href.match(/tvshow|season/) ? 'Watching TV Show' : 'Watching Movie')

    if (video.paused) {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Paused'
      presenceData.state += ' (Paused)'
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
    else {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playing'

      let rawCurrent = document.querySelector('.vjs-current-time-display')?.textContent ?? ''
      let rawDuration = document.querySelector('.vjs-duration-display')?.textContent ?? ''
      const rawRemaining = document.querySelector('.vjs-remaining-time-display')?.textContent ?? ''

      if (!rawCurrent.trim()) {
        rawCurrent = document.querySelector('.jw-text-elapsed')?.textContent ?? ''
        rawDuration = document.querySelector('.jw-text-duration')?.textContent ?? ''
      }

      const currentSeconds = timestampFromFormat(rawCurrent.replace(/[^\d:]/g, ''))
      const durationSeconds = timestampFromFormat(rawDuration.replace(/[^\d:]/g, ''))
      const remainingSeconds = timestampFromFormat(rawRemaining.replace(/[^\d:]/g, ''))

      if (durationSeconds > 0) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(currentSeconds, durationSeconds)
      }
      else if (remainingSeconds > 0) {
        presenceData.startTimestamp = Date.now() - (currentSeconds * 1000)
        presenceData.endTimestamp = Date.now() + (remainingSeconds * 1000)
      }
      else {
        presenceData.startTimestamp = Date.now() - (currentSeconds * 1000)
        delete presenceData.endTimestamp
      }
    }
  }

  presence.setActivity(presenceData)
})
