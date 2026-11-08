import { ActivityType, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1527271319954001940',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/N/NextToppers/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const pathname = document.location.pathname

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'Next Toppers',
  }

  // Target the lecture title (h3.mt-2) or fallback heading elements
  const pageHeading = document.querySelector('h3.mt-2, h3, h1, h2')?.textContent?.trim()

  if (pathname.includes('/product/our-courses') || pathname.includes('/courses')) {
    presenceData.details = 'Browsing Courses'
    presenceData.state = pageHeading || 'Exploring study material'
  }
  else if (pathname.includes('/play') || pathname.includes('/live')) {
    presenceData.details = 'Attending Class'
    presenceData.state = pageHeading || 'Watching lecture'

    // Look for active video element for live timestamps
    const video = document.querySelector<HTMLVideoElement>('video')
    if (video && !video.paused) {
      delete presenceData.startTimestamp
      if (video.duration && !Number.isNaN(video.duration)) {
        const [start, end] = getTimestamps(
          Math.floor(video.currentTime),
          Math.floor(video.duration),
        )
        presenceData.startTimestamp = start
        presenceData.endTimestamp = end
      }
      else {
        presenceData.startTimestamp = Math.floor(Date.now() / 1000 - video.currentTime)
      }
    }
  }
  else if (pathname.includes('/my-profile') || pathname.includes('/profile')) {
    presenceData.details = 'Viewing Profile'
    presenceData.state = 'Account Settings'
  }
  else if (pathname.includes('/blogs') || pathname.includes('/blog')) {
    presenceData.details = 'Reading Blogs'
    presenceData.state = pageHeading || 'Articles & Updates'
  }
  else {
    presenceData.details = 'Browsing Next Toppers'
    presenceData.state = pageHeading || 'Exploring site'
  }

  presence.setActivity(presenceData)
})
