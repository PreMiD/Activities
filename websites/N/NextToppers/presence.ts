import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1527271319954001940',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/9YKfQ6M.png',
}

presence.on('UpdateData', async () => {
  const pathname = document.location.pathname

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'Next Toppers',
  }

  if (pathname.includes('/product/our-courses') || pathname.includes('/courses')) {
    presenceData.details = 'Browsing Courses'
    presenceData.state = 'Exploring study material'
  }
  else if (pathname.includes('/play') || pathname.includes('/live')) {
    presenceData.details = 'Attending Class'
    presenceData.state = 'Watching lecture'
  }
  else if (pathname.includes('/my-profile') || pathname.includes('/profile')) {
    presenceData.details = 'Viewing Profile'
    presenceData.state = 'Account Settings'
  }
  else if (pathname.includes('/blogs') || pathname.includes('/blog')) {
    presenceData.details = 'Reading Blogs'
    presenceData.state = 'Articles & Updates'
  }
  else {
    presenceData.details = 'Browsing Next Toppers'
    presenceData.state = document.title || 'Attending class'
  }

  presence.setActivity(presenceData)
})
