import { Assets } from 'premid'

const presence = new Presence({
  clientId: '668173626775830529',
})
const strings = presence.getStrings({
  browsing: 'general.browsing',
})
function getElement(query: string): string | undefined {
  return document.querySelector(query)?.textContent?.trimStart().trimEnd()
}
function stripCourse(course: string | undefined): string | undefined {
  return course?.replace('Tutorial', '').replace('Fundamentals', '').trimEnd()
}

let elapsed = Math.floor(Date.now() / 1000)
let prevUrl = document.location.href

const statics = {
  '/User/Login': {
    details: 'Logging In...',
  },
  '/User/Register': {
    details: 'Registering...',
  },
  '/User/Logout': {
    details: 'Logging Out...',
  },
  '/User/Edit': {
    details: 'Editing Profile...',
  },
  '/Courses/': {
    details: 'Browsing...',
    state: 'Courses',
  },
  '/Features/': {
    details: 'Viewing...',
    state: 'Features',
  },
  '/Contact/': {
    details: 'Viewing...',
    state: 'Contact',
  },
  '/Terms-of-Use/': {
    details: 'Viewing...',
    state: 'Terms of Use',
  },
  '/faq/': {
    details: 'Viewing...',
    state: 'FAQ',
  },
}

presence.on('UpdateData', async () => {
  const { host, pathname, href } = document.location
  const path = pathname.replace(/\/?$/, '/')
  const showBrowsing = await presence.getSetting<boolean>('browse')
  const showCourses = await presence.getSetting<boolean>('course')
  const showCodes = await presence.getSetting<boolean>('code')
  const showTimestamps = await presence.getSetting<boolean>('timestamp')

  let presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/SoloLearn/assets/logo.png',
    startTimestamp: elapsed,
  }

  if (href !== prevUrl) {
    prevUrl = href
    elapsed = Math.floor(Date.now() / 1000)
  }

  if (showBrowsing && host === 'www.sololearn.com') {
    for (const [k, v] of Object.entries(statics)) {
      if (path.match(k))
        presenceData = { ...presenceData, ...v }
    }

    if (path === '/') {
      presenceData.details = 'Browsing...'
      presenceData.state = 'Home'
    }

    if (path.includes('/Codes/')) {
      presenceData.details = 'Browsing Code Playground...'
      presenceData.state = getElement('.tab.active')
    }

    if (path.includes('/Discuss/')) {
      presenceData.details = 'Browsing Discussions...'
      presenceData.state = getElement('.tab.active')

      if (document.querySelector('.post')) {
        presenceData.details = 'Browsing Discussion...'
        presenceData.state = getElement('.detailsWrapper > .header')
      }
    }

    if (path.includes('/Leaderboard/')) {
      presenceData.details = 'Browsing Leaderboard...'
      presenceData.state = stripCourse(getElement('.nameTitle'))
    }

    if (path.includes('/Blog/')) {
      presenceData.details = 'Browsing Blogs...'

      if (document.querySelector('.post')) {
        presenceData.details = 'Browsing Blog...'
        presenceData.state = getElement('.articleTitle')
      }
    }

    if (path.includes('/Course/')) {
      presenceData.details = 'Browsing Course...'
      presenceData.state = getElement('.courseDescription > h1')
    }

    if (path.includes('/Profile/')) {
      presenceData.details = 'Browsing Profile...'

      const course = getElement('.course .name')
      presenceData.state = getElement('.user .name')
      presenceData.state += course ? ` (${stripCourse(course)})` : ''
    }
  }

  if (showCourses && path.includes('/Play/')) {
    presenceData.details = `Learning ${stripCourse(
      document.querySelector<HTMLImageElement>('.content > .icon')?.alt,
    )}`
    presenceData.state = getElement('.title')
  }

  if (showCodes && host === 'code.sololearn.com') {
    presenceData.details = 'Viewing Code...'
    presenceData.state = `${getElement('.codeName')} (${getElement(
      '.tab-box.active',
    )})`
  }

  if (presenceData.details) {
    if ((presenceData.details as string).match('(Browsing|Viewing)')) {
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = (await strings).browsing
    }
    if (!showTimestamps) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    presence.setActivity(presenceData)
  }
  else {
    presence.setActivity()
  }
})
