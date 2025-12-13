import { Assets } from 'premid'

const presence = new Presence({
  clientId: '895232122892214313',
})
const path: string = document.location.pathname
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})
const details = { view: 'Viewing anime:', stream: 'Watching anime:' }

let video = {
  duration: 0,
  currentTime: 0,
  paused: true,
  isPlaying: false,
}
let everPlaying = false

presence.on(
  'iFrameData',
  (data: unknown) => {
    video = data as typeof video
    if (video.isPlaying)
      everPlaying = true
  },
)
presence.on('UpdateData', async () => {

  const fetch_img =document.querySelector<HTMLMetaElement>('meta[property="og:image"]')
    ?.content

  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/K/Kayoanime/assets/logo.png',
    startTimestamp: Date.now(),
  }

  switch (path) {
    case '/':
      presenceData.details = 'Viewing home page'
      break
    case '/anime-series/':
      presenceData.details = 'Viewing Anime series'
      break
    case '/ongoing-anime/':
      presenceData.details = 'Viewing Ongoing anime'
      break
    case '/anime-movie/':
      presenceData.details = 'Viewing Anime movie'
      break
    case '/request-anime/':
      presenceData.details = 'Viewing Anime request'
      break
    case '/report-dead-links/':
      presenceData.details = 'Viewing report dead links'
      break

    default:
      if (document.querySelector('.entry-header-outer > .entry-header > h1 ')) {

        if (fetch_img) presenceData.largeImageKey = fetch_img

        if (
          document.querySelector('.tie-fluid-width-video-wrapper')
          && everPlaying
        ) {
          if (video && !Number.isNaN(video.duration)) {
            presenceData.smallImageKey = video.paused
              ? Assets.Pause
              : Assets.Play
            presenceData.smallImageText = video.paused
              ? (await strings).pause
              : (await strings).play;
            [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video.currentTime, video.duration)
            presenceData.details = details.stream
            presenceData.state = document.querySelector(
              '.entry-header-outer > .entry-header > h1 ',
            )?.textContent
            if (video.paused) {
              delete presenceData.startTimestamp
              delete presenceData.endTimestamp
            }
          }
        }
        else {
          presenceData.details = details.view
          presenceData.state = document.querySelector(
            '.entry-header-outer > .entry-header > h1 ',
          )?.textContent
        }
        break
      }
      presenceData.details = 'Viewing genre:'
      presenceData.state = document.querySelector('.page-title')?.textContent
      break
  }
  if (document.location.search.startsWith('?s')) {
    presenceData.smallImageKey = Assets.Search
    presenceData.details = 'Searching for:'
    presenceData.state = document
      .querySelector('label input')
      ?.attributes
      .getNamedItem('value')
      ?.value
  }
  return presence.setActivity(presenceData, true)
})
