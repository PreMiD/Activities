import { ActivityType, Assets } from 'premid'
import { getEpisode, getId, getImage, getTitle } from './utils.js'

const presence = new Presence({
  clientId: '1286500193881161804',
})

let lastPlaybackState = false
let playback = false
let startTimestamp = Math.floor(Date.now() / 1000)
let lastHref: string
let lastUpdate = 0

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    startTimestamp,
  } as PresenceData
  const video = document.querySelector('video')
  const { pathname, href } = document.location

  if (video) {
    presenceData.type = ActivityType.Watching
    playback = !video.paused && !video.ended

    if (lastPlaybackState !== playback)
      startTimestamp = Math.floor(Date.now() / 1000)

    presenceData.smallImageKey = playback ? Assets.Play : Assets.Pause
    presenceData.smallImageText = playback ? 'Playing' : 'Paused'
  }

  if (video && lastPlaybackState === playback)
    return
  lastPlaybackState = playback

  if (pathname.startsWith('/en/schedule')) {
    presenceData.details = 'Viewing Schedule...'

    presenceData.buttons = [
      {
        label: 'View Schedule',
        url: href,
      },
    ]
  }
  if (pathname.includes('/search/manga'))
    presenceData.details = 'Searching Manga...'
  if (pathname.includes('/search/anime'))
    presenceData.details = 'Searching Anime...'
  if (href.includes('/search/anime?season='))
    presenceData.details = 'Viewing Season...'
  if (
    pathname.startsWith('/en/anime/')
    && !pathname.startsWith('/en/anime/watch')
  ) {
    presenceData.details = getTitle()
    presenceData.state = 'Viewing Anime...'

    presenceData.buttons = [
      {
        label: 'View Anime',
        url: href,
      },
    ]
  }
  else if (pathname.startsWith('/en/manga/')) {
    presenceData.details = getTitle()
    presenceData.state = 'Viewing Manga...'

    presenceData.buttons = [
      {
        label: 'View Manga',
        url: href,
      },
    ]
  }
  else if (typeof presenceData.details !== 'string') {
    presenceData.details = 'Viewing Home...'
  }

  if (pathname.startsWith('/en/anime/watch')) {
    const episode = getEpisode()

    presenceData.details = getTitle()
    presenceData.state = !Number.isNaN(episode)
      ? `Episode ${episode}`
      : 'Unable to retrieve episode'
    presenceData.type = ActivityType.Watching

    presenceData.buttons = [
      {
        label: 'Watch Anime',
        url: `https://shiroko.co/en/anime/watch?id=${getId()}&n=${episode}`,
      },
    ]
  }

  if (pathname.startsWith('/en/profile/')) {
    const username = pathname.split('/').pop()
    if (username !== 'profile' && username !== '') {
      presenceData.details = `Viewing ${username}'s Profile`
      presenceData.buttons = [
        {
          label: 'View Profile',
          url: href,
        },
      ]
    }
  }

  const now = Date.now()
  if (lastHref !== href || (now - lastUpdate) / 1000 >= 1) {
    lastHref = href
    lastUpdate = now
  }
  else {
    return
  }

  presenceData.largeImageKey = getImage()

  presence.setActivity(presenceData)
})
