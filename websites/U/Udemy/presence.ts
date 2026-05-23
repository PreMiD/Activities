import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'
import { ActivityAssets, BROWSING_TIMESTAMP, PATHNAMES } from './utils/constants.js'
import { getCourseInfo, getVideoInfo, normalizePath } from './utils/helpers.js'

const presence = new Presence({
  clientId: '639131130703904808',
})

presence.on('UpdateData', async () => {
  const { pathname, search } = document.location
  const normalizedPath = normalizePath(pathname)

  const strings = presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    browse: 'general.browsing',
  })

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Watching,
  }

  const videoInfo = getVideoInfo()

  // Watching a video
  if (videoInfo) {
    presenceData.details = videoInfo.title
    presenceData.state = videoInfo.lecture
    presenceData.smallImageKey = videoInfo.isPlaying ? Assets.Play : Assets.Pause
    presenceData.smallImageText = videoInfo.isPlaying ? (await strings).play : (await strings).pause

    if (videoInfo.isPlaying) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(videoInfo.video)
    }
    else {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
  }

  // Viewing a course page
  else if (pathname.includes('/course/')) {
    presenceData.details = 'Viewing a course:'
    presenceData.state = getCourseInfo()
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = (await strings).browse
  }

  // Searching for a course
  else if (pathname.includes('/courses/search/')) {
    presenceData.details = 'Searching for:'
    presenceData.state = new URLSearchParams(search).get('q')?.split('+')?.join(' ') || 'Something'
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = (await strings).browse
  }

  // Viewing a pathname that is mapped
  else if (PATHNAMES[normalizedPath]) {
    presenceData.details = 'Browsing:'
    presenceData.state = PATHNAMES[normalizedPath]
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = (await strings).browse
    presenceData.startTimestamp = BROWSING_TIMESTAMP
  }

  // Other edge cases
  else {
    presenceData.details = (await strings).browse
    presenceData.state = 'Browsing Udemy'
    presenceData.startTimestamp = BROWSING_TIMESTAMP
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = (await strings).browse
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
