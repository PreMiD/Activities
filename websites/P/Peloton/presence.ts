import { Assets } from 'premid'

const presence = new Presence({
  clientId: '712294190339588209',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let path, strings

presence.on('UpdateData', async () => {
  strings = await presence.getStrings({
    live: 'general.live',
    play: 'general.playing',
    pause: 'general.paused',
  })
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/Peloton/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (window.location.hostname.includes('www.onepeloton')) {
    switch (window.location.pathname) {
      case '/':
        presenceData.details = 'Browsing the Home Page'
        break
      case '/bike':
        presenceData.details = 'Browsing the bikes'
        break
      case '/app':
        presenceData.details = 'Browsing the app'
        break
      case '/membership':
        presenceData.details = 'Browsing memberships'
        break
      case '/terms':
        presenceData.details = 'Browsing the terms of service'
        break
      case '/company':
        presenceData.details = 'Browsing Peloton\'s Mission'
        break
      case '/showrooms':
        presenceData.details = 'Browsing the showrooms'
        break
      case '/membership-terms':
        presenceData.details = 'Browsing the membership terms'
        break
    }
  }
  else if (window.location.hostname.includes('support.onepeloton')) {
    presenceData.details = 'Browsing the support pages'
  }
  else if (window.location.hostname.includes('blog.onepeloton')) {
    switch (window.location.pathname) {
      case '/':
        presenceData.details = 'Browsing the blogs'
        break
      case '/category/community/':
        presenceData.details = 'Browsing the community blogs'
        break
      case '/category/lifestyle/':
        presenceData.details = 'Browsing the lifestyle blogs'
        break
      case '/category/news/':
        presenceData.details = 'Browsing the news blogs'
        break
      case '/category/tech/':
        presenceData.details = 'Browsing the tech blogs'
        break
      case '/category/wellness/':
        presenceData.details = 'Browsing the wellness blogs'
        break
    }
  }
  else if (window.location.hostname.includes('members.onepeloton')) {
    // Class categories
    if (window.location.pathname === '/classes') {
      presenceData.details = 'Browsing classes'
    }
    else if (window.location.pathname.includes('/classes/')) {
      // Class category
      path = window.location.pathname.replace('/classes/', '')
      switch (path) {
        case 'strength':
          presenceData.details = 'Browsing strength classes'
          break
        case 'yoga':
          presenceData.details = 'Browsing yoga classes'
          break
        case 'meditation':
          presenceData.details = 'Browsing meditation classes'
          break
        case 'cardio':
          presenceData.details = 'Browsing cardio classes'
          break
        case 'stretching':
          presenceData.details = 'Browsing stretching classes'
          break
        case 'cycling':
          presenceData.details = 'Browsing cycling classes'
          break
        case 'outdoor':
          presenceData.details = 'Browsing outdoor classes'
          break
        case 'running':
          presenceData.details = 'Browsing running classes'
          break
        case 'walking':
          presenceData.details = 'Browsing walking classes'
          break
        case 'bootcamp':
          presenceData.details = 'Browsing bootcamp classes'
          break
        default:
          presenceData.details = 'Browsing classes'
      }

      // Video
      if (path.includes('player/')) {
        const video = document.querySelector<HTMLVideoElement>('.jw-video')!
        const clipTitle = document.querySelector(
          '.jw-controlbar > div:nth-child(3) > div > div > div > h1',
        )?.textContent
        const clipAuthor = document.querySelector(
          '.jw-controlbar > div:nth-child(3) > div > div > div > p',
        )?.textContent

        switch (!video.paused) {
          case true:
            presenceData.smallImageKey = Assets.Play
            presenceData.smallImageText = strings.play;
            [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
            break
          case false:
            presenceData.smallImageKey = Assets.Pause
            presenceData.smallImageText = strings.pause;
            [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
            break
        }
        presenceData.details = clipTitle?.replace('&amp;', '&')
        presenceData.state = clipAuthor
      }
    }

    // Live
    if (window.location.pathname.includes('/player/live')) {
      const clipTitle = document.querySelector(
        '.jw-controlbar > div:nth-child(3) > div > div > div > h1',
      )?.textContent
      const clipAuthor = document.querySelector(
        '.jw-controlbar > div:nth-child(3) > div > div > div > p',
      )?.textContent
      const clipTimeLeft = document
        .querySelector(
          '.player-overlay-wrapper > div:nth-child(3) > button > div:nth-child(2) > div > div > p',
        )
        ?.textContent
        ?.split(':')
        .map(Number) ?? []

      switch (
        !(document.querySelector('.jw-video') as HTMLVideoElement).paused
      ) {
        case true:
          presenceData.smallImageKey = Assets.Live
          presenceData.smallImageText = strings.live
          presenceData.endTimestamp = new Date(
            Date.now() + (clipTimeLeft[0]! * 1 + clipTimeLeft[1]! * 1) * 10,
          ).getTime()
          break
        case false:
          presenceData.smallImageKey = Assets.Live
          presenceData.smallImageText = strings.live
          break
      }
      presenceData.details = clipTitle?.replace('&amp;', '&')
      presenceData.state = clipAuthor
    }

    // schedule
    if (window.location.pathname.includes('/schedule/')) {
      path = window.location.pathname.replace('/schedule/', '')
      switch (path) {
        case 'strength':
          presenceData.details = 'Browsing strength schedule'
          break
        case 'yoga':
          presenceData.details = 'Browsing yoga schedule'
          break
        case 'meditation':
          presenceData.details = 'Browsing meditation schedule'
          break
        case 'cardio':
          presenceData.details = 'Browsing cardio schedule'
          break
        case 'stretching':
          presenceData.details = 'Browsing stretching schedule'
          break
        case 'cycling':
          presenceData.details = 'Browsing cycling schedule'
          break
        case 'running':
          presenceData.details = 'Browsing running schedule'
          break
        case 'walking':
          presenceData.details = 'Browsing walking schedule'
          break
        case 'bootcamp':
          presenceData.details = 'Browsing bootcamp schedule'
          break
        default:
          presenceData.details = 'Browsing schedule'
          break
      }
    }

    // Challenges
    if (window.location.pathname.includes('/challenges/')) {
      path = window.location.pathname.replace('/challenges/', '')
      switch (path) {
        case 'active':
          presenceData.details = 'Browsing active challenges'
          break
        case 'upcoming':
          presenceData.details = 'Browsing upcoming challenges'
          break
        case 'completed':
          presenceData.details = 'Browsing completed challenges'
          break
        default:
          presenceData.details = 'Browsing challenges'
          break
      }
    }

    // Profile
    if (window.location.pathname.includes('/profile/')) {
      path = window.location.pathname.replace('/profile/', '')
      switch (path) {
        case 'overview':
          presenceData.details = 'Browsing their profile'
          break
        case 'workouts':
          presenceData.details = 'Browsing their workouts'
          break
        case 'completed':
          presenceData.details = 'Browsing their achievements'
          break
        default:
          presenceData.details = 'Browsing their profile'
          break
      }
    }

    // Profile
    if (window.location.pathname.includes('/preferences/'))
      presenceData.details = 'Browsing their profile'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
