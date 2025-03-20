import { Assets } from 'premid'

const presence = new Presence({
  clientId: '639131130703904808',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})
const pages: { [k: string]: string } = {
  '/': 'Homepage',
  '/user/view-notifications': 'Notifications',
  '/message': 'Messages',
  '/dashboard/purchase-history/': 'Purchase History',
  '/instructor/account/notifications/': 'Account',
  '/instructor/account/api': 'API',
  '/instructor/account/close': 'Close Account',
  '/instructor/account/security': 'Account Security',
  '/instructor/courses': 'Create a Course',
  '/course/create': 'Create a Course',
  '/instructor/communication/qa': 'Q&A',
  '/instructor/communication/assignments': 'Assignments',
  '/instructor/communication/announcements': 'Announcements',
  '/instructor/communication/messages': 'Messages',
  '/instructor/performance/overview': 'Performance Overview',
  '/instructor/performance/students': 'Student Performance',
  '/instructor/performance/reviews': 'Reviews',
  '/instructor/performance/engagement': 'Engagement',
  '/instructor/performance/conversion/visitors': 'Visitors',
  '/instructor/tools': 'Tools',
  '/home/teaching/test-video': 'Test Video',
  '/instructor/marketplace-insights/': 'Marketplace Insights',
  '/instructor/help': 'Resources',
  '/support': 'Support',
  '/cart': 'Cart',
  '/affiliate': 'Udemy Affiliate',
  '/mobile': 'Udemy Mobile',
  '/teaching': 'Teaching',
  '/user/edit-credit-cards': 'Payment Methods',
  '/dashboard/credit-history': 'Udemy Credits',
  '/home/my-courses/learning': 'My Courses',
  '/home/my-courses': 'My Courses',
  '/home/my-courses/search': 'My Courses',
  '/home/my-courses/collections': 'My Courses (Collections)',
  '/home/my-courses/wishlist': 'My Courses (Wishlist)',
  '/home/my-courses/archived': 'My Courses (Archived)',
}

presence.on('UpdateData', async () => {
  const page = document.location.pathname
  const video = document.querySelector('video')
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/U/Udemy/assets/logo.png',
    startTimestamp: Math.floor(Date.now() / 1000),
  }

  if (page.includes('/courses/search')) {
    presenceData.details = 'Searching for:'
    presenceData.smallImageKey = Assets.Search
    presenceData.state = new URLSearchParams(location.search).get('q')?.split('+')?.join(' ')
      || 'Something'
  }
  else if (page.includes('/courses/')) {
    presenceData.smallImageKey = Assets.Search
    presenceData.state = document.querySelector('div h1[class*=category--heading-primary] a')
      ?.textContent || 'Unknown Category'
  }
  else if (page.includes('/course/') && video && video.currentTime) {
    presenceData.details = document.querySelector('header h1[data-purpose=course-header-title] a')
      ?.textContent || 'Unknown Course'
    presenceData.state = document.querySelector(
      'li[class*=curriculum-item-link--is-current] span > span',
    )?.textContent
    || document.querySelector('#bookmark-portal ~ div:not(:empty)')
      ?.textContent
      || 'Unknown Episode'

    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused
      ? (await strings).pause
      : (await strings).play

    if (!Number.isNaN(video.currentTime)) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
    }

    if (video.paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
  }
  else if (page.includes('/course/') && !video) {
    presenceData.details = 'Viewing a course:'
    presenceData.state = document.querySelector('.clp-component-render h1.clp-lead__title')
      ?.textContent || 'Unknown Course'
  }
  else if (pages[page] || pages[page.slice(0, -1)]) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = pages[page] || pages[page.slice(0, -1)]
  }
  else {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Homepage'
  }

  presence.setActivity(presenceData)
})
