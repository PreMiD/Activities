import { ActivityType, Assets, getTimestamps } from 'premid'
import { getNumCoursesCheckout, getOrderTotal } from './utils/cart_page.js'
import { getCourseThumbnail, getCourseTitle, getCreatorName } from './utils/course_page.js'
import { getWatchingChapter, getWatchingCourseTitle } from './utils/course_video_page.js'
import { getNumOwnedCourses } from './utils/my_course_page.js'

const presence = new Presence({
  clientId: '1506835574345039996',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/AZjrJho.jpeg',
}

let iFrameData: {
  video?: {
    paused?: boolean
    currentTime?: number
    duration?: number
  }
} = {}

presence.on('iFrameData', (data) => {
  iFrameData = data
})

presence.on('UpdateData', async () => {
  const showButtons = await presence.getSetting<boolean>('showButtons')
  const showTimestamp = await presence.getSetting<boolean>('showTimestamp')
  const showFavorite = await presence.getSetting<boolean>('showFavorite')
  const favoriteCourseURL = await presence.getSetting<string>('favoriteCourseURL')
  const privacyMode = await presence.getSetting<boolean>('privacyMode')

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: 'Browsing different courses',
    smallImageKey: Assets.Search,
  }

  const { pathname } = document.location

  if (pathname.includes('/products')) {
    presenceData.details = !privacyMode ? getCourseTitle() : 'Viewing a course details'
    presenceData.state = !privacyMode ? getCreatorName() : ''
    presenceData.largeImageKey = !privacyMode ? await getCourseThumbnail() : ''
    delete presenceData.smallImageKey
  }
  else if (pathname.includes('/cart')) {
    presenceData.details = 'Buying some courses'

    if (!privacyMode)
      presenceData.state = `Total Courses: ${getNumCoursesCheckout()} | Total Price: ${getOrderTotal()}`
  }
  else if (pathname.includes('/account')) {
    presenceData.details = 'Browsing owned courses'
    if (pathname.includes('/classroom') && !privacyMode)
      presenceData.state = `Total Courses: ${getNumOwnedCourses()}`
    else
      delete presenceData.state
  }
  else if (pathname.includes('/classroom')) {
    presenceData.details = !privacyMode ? getWatchingCourseTitle() : 'Watching a course'
    presenceData.state = !privacyMode ? getWatchingChapter() : ''
    presenceData.smallImageKey = Assets.Viewing

    if (iFrameData.video && !privacyMode) {
      const { paused, currentTime, duration } = iFrameData.video

      presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play

      if (currentTime && duration && showTimestamp)
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(currentTime, duration)
    }
    else {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
  }

  if (showFavorite) {
    if (pathname.includes('/products') && !privacyMode) {
      presenceData.buttons = [
        {
          label: 'View Course Details',
          url: window.location.href,
        },
        {
          label: 'Favorite',
          url: favoriteCourseURL,
        },
      ]
    }
    else {
      presenceData.buttons = [{
        label: 'Favorite',
        url: favoriteCourseURL,
      }]
    }
  }

  if (!showButtons)
    delete presenceData.buttons

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
