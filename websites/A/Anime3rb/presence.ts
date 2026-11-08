import { Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1530277199087931392',
})

let browsingTimestamp = Date.now()
let wasWatching = false

presence.on('UpdateData', () => {
  const { pathname } = document.location
  const presenceData: PresenceData = {
    largeImageKey: document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content
      ?? Assets.Question,
  }

  if (!pathname.startsWith('/episode/')) {
    if (wasWatching) {
      browsingTimestamp = Date.now()
      wasWatching = false
    }

    presenceData.details = 'Browsing Anime3rb'
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Browsing'
    presenceData.startTimestamp = browsingTimestamp
    presence.setActivity(presenceData)
    return
  }

  const pathParts = pathname.split('/').filter(Boolean)
  const episode = pathParts.at(-1)
  const slug = pathParts.at(-2)
  const heading = document.querySelector('h1')?.textContent?.trim()
  const pageTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content
  const animeTitle = slug?.replaceAll('-', ' ').replace(/\b\w/g, character => character.toUpperCase())
    ?? pageTitle?.replace(/\s*[-|]\s*Anime3rb.*$/i, '')
    ?? heading
    ?? 'Anime'
  const videos = [...document.querySelectorAll('video')]
  const video = videos
    .filter(video => !video.paused && Number.isFinite(video.duration) && video.duration > 0)
    .sort((first, second) => second.currentTime - first.currentTime)[0]
    ?? videos[0]

  presenceData.details = animeTitle
  presenceData.state = episode ? `Episode ${episode}` : 'Watching an episode'
  presenceData.buttons = [{
    label: 'Watch Episode',
    url: document.location.href,
  }]

  if (video && Number.isFinite(video.duration) && video.duration > 0) {
    wasWatching = true
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused ? 'Paused' : 'Watching'

    if (!video.paused) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
    }
  }
  else {
    wasWatching = true
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Watching'
  }

  presence.setActivity(presenceData)
})
