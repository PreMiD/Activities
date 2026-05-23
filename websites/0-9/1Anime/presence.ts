import { ActivityType, Assets } from 'premid'
import { getEpisode, getId, getImage, getTitle } from './utils.js'

const presence = new Presence({
  clientId: '1314062632419852309',
})

let lastPlaybackState = false
let playback = false
let startTimestamp = Math.floor(Date.now() / 1000)
let lastHref: string
let lastUpdate = 0

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    startTimestamp,
  }
  const video = document.querySelector('video')
  const { pathname, href } = document.location

  if (video) {
    (presenceData as PresenceData).type = ActivityType.Watching
    playback = !video.paused && !video.ended

    if (lastPlaybackState !== playback)
      startTimestamp = Math.floor(Date.now() / 1000)

    presenceData.smallImageKey = playback ? Assets.Play : Assets.Pause
    presenceData.smallImageText = playback ? 'Playing' : 'Paused'
  }

  if (video && lastPlaybackState === playback)
    return
  lastPlaybackState = playback

  if (pathname.startsWith('/schedule')) {
    presenceData.details = 'Viewing Schedule...'

    presenceData.buttons = [
      {
        label: 'View Schedule',
        url: href,
      },
    ]
  }
  if (pathname.includes('/settings'))
    presenceData.details = 'Viewing Settings...'
  if (pathname.includes('/search/anime'))
    presenceData.details = 'Searching Anime...'
  if (href.includes('/search/anime?season='))
    presenceData.details = 'Viewing Season...'
  if (
    pathname.startsWith('/anime/')
    && !pathname.startsWith('/anime/watch')
  ) {
    presenceData.details = getTitle()
    presenceData.state = 'Viewing Anime...'

    const animeId = pathname.split('/')[2]
    presenceData.buttons = [
      {
        label: 'View Anime',
        url: `https://1anime.app/anime/${animeId}`,
      },
    ]
  }
  else if (pathname.startsWith('/manga/')) {
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

  if (pathname.startsWith('/anime/watch')) {
    const episode = getEpisode()

    presenceData.details = getTitle()
    presenceData.state = !Number.isNaN(episode)
      ? `Episode ${episode}`
      : 'Unable to retrieve episode';
    (presenceData as PresenceData).type = ActivityType.Watching

    presenceData.buttons = [
      {
        label: 'Watch Anime',
        url: `https://1anime.app/watch?id=${getId()}&n=${episode}`,
      },
    ]
  }

  if (pathname.startsWith('/profile/')) {
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
