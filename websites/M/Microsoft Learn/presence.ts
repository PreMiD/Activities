import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1367056833675661342',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/Microsoft%20Learn/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const page = document.location.pathname
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const [time, privacy, showLevel, showButton] = await Promise.all([
    presence.getSetting<boolean>('time').catch(() => true),
    presence.getSetting<boolean>('privacy').catch(() => false),
    presence.getSetting<boolean>('show-level').catch(() => true),
    presence.getSetting<boolean>('show-button').catch(() => true),
  ])

  if (!time) {
    delete presenceData.startTimestamp
  }

  const pageTitle = document.title.split(' | ')[0]?.trim() || 'Unknown'

  if (/^\/(?:[a-z]{2}-[a-z]{2}\/|\/)?$/.test(page)) {
    presenceData.details = 'Exploring Microsoft Learn'
    presenceData.state = 'Browsing the homepage'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Viewing'
    delete presenceData.buttons
  }
  else if (page.includes('/training/modules/')) {
    presenceData.details = 'Learning a Module'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Studying'
    if (privacy) {
      presenceData.state = 'A training module'
    }
    else {
      presenceData.state = pageTitle
      if (showLevel) {
        const levelElement = document.querySelector('#level-status-text')
          ?.textContent
          ?.trim()
        const plusXp = document.querySelector('.xp-tag-xp')?.textContent?.trim()
        const nextExp = document.querySelector('#level-status-points')
          ?.textContent
          ?.trim()
          ?.replace('/', ' / ')
        if (levelElement) {
          presenceData.details += ` (${levelElement})`
        }
        if (nextExp) {
          presenceData.details += ` - (${nextExp})`
        }
        if (plusXp) {
          presenceData.details += ` + ${plusXp}`
        }
      }
    }
    delete presenceData.buttons
  }
  else if (page.includes('/training/paths/')) {
    const levelElement = document.querySelector('#level-status-text')
      ?.textContent
      ?.trim() || '0'
    const nextExp = document.querySelector('#level-status-points')
      ?.textContent
      ?.trim()
      ?.replace('/', ' / ')
      || '0'
    presenceData.details = showLevel
      ? `Following a Path - (${levelElement}) - ${nextExp}`
      : 'Following a Learning Path'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Studying'
    presenceData.state = privacy ? 'A learning path' : pageTitle
    if (showButton) {
      presenceData.buttons = [
        {
          label: 'View Path',
          url: document.location.href,
        },
      ]
    }
  }
  else if (page.includes('/credentials/certifications/')) {
    presenceData.details = 'Checking a Certification'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Viewing'
    presenceData.state = privacy ? 'A certification' : pageTitle
    delete presenceData.buttons
  }
  else if (page.includes('/answers/')) {
    presenceData.details = 'Engaging in Q&A'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Browsing'
    presenceData.state = privacy ? 'Q&A section' : 'Technical Questions & Answers'
    delete presenceData.buttons
  }
  else if (page.includes('/training/support/')) {
    presenceData.details = 'Seeking Support'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Browsing'
    presenceData.state = privacy ? 'Support' : pageTitle
    delete presenceData.buttons
  }
  else if (page.includes('/collections/')) {
    presenceData.details = 'Exploring a Collection'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Browsing'
    presenceData.state = privacy
      ? 'A collection'
      : document.querySelector('h1.title')?.textContent?.trim() || 'Collection'
    if (showButton) {
      presenceData.buttons = [
        {
          label: 'View Collection',
          url: document.location.href,
        },
      ]
    }
  }
  else if (page.includes('/challenges/')) {
    const progressDescription = document.querySelector('#progress-description')
      ?.textContent
      ?.trim()
    if (progressDescription) {
      presenceData.details = 'Completing a Challenge' + ` (${progressDescription})`
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Studying'
      presenceData.state = privacy
        ? 'A challenge'
        : document.querySelector('#hero-body-name')?.textContent?.trim() || 'Challange'
    }
    else {
      presenceData.details = 'Exploring a Challenge'
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Browsing'
      presenceData.state = privacy
        ? 'A challenge'
        : document.querySelector('#hero-body-name')?.textContent?.trim() || 'Challange'
    }
    if (showButton) {
      presenceData.buttons = [
        {
          label: 'View Challenge',
          url: document.location.href,
        },
      ]
    }
  }
  else if (page.includes('/plans/')) {
    const resumeButton = document.querySelector('button#resume-plan-button')
      ?.textContent
      ?.trim()
    if (resumeButton) {
      presenceData.details = 'Completing a Plan'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Studying'
      presenceData.state = privacy
        ? 'A plan '
        : document.querySelector('h1.title')?.textContent?.trim() || ' Plan'
    }
    else {
      presenceData.details = 'Exploring a Plan'
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Browsing'
      presenceData.state = privacy
        ? 'A plan '
        : document.querySelector('h1.title')?.textContent?.trim() || ' Plan'
    }
    if (showButton) {
      presenceData.buttons = [
        {
          label: 'View Plan',
          url: document.location.href,
        },
      ]
    }
  }
  else if (page.includes('/courses/')) {
    const titleElement = document.querySelector('h1.title')?.textContent?.trim()
    presenceData.details = 'Checking a Course'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Browsing'
    presenceData.state = privacy ? 'A course' : titleElement || 'Course'
    if (showButton) {
      presenceData.buttons = [
        {
          label: 'View Course',
          url: document.location.href,
        },
      ]
    }
  }
  else if (page.includes('/users/')) {
    const nameElement = document.querySelector('.media-content h1')?.textContent?.trim() || 'User'
    const userName = document.querySelector('.persona-name')?.textContent?.trim() || 'User'
    const achievementElement = document.querySelector('.box .columns')?.querySelectorAll('.column a p')
    const badgeElement = achievementElement?.[0]?.textContent?.trim() || '0'
    const trophyElement = achievementElement?.[1]?.textContent?.trim() || '0'
    const levelElement = document.querySelector('#level-status-text')?.textContent?.trim() || '0'
    const nextExp = document.querySelector('#level-status-points')?.textContent?.trim()?.replace('/', ' / ') || '0'
    if (nameElement === userName) {
      presenceData.details = privacy
        ? 'Checking My Profile'
        : showLevel
          ? `Checking My Profile (${nameElement}) - (${levelElement}) - ${nextExp}`
          : `Checking My Profile (${nameElement})`
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Checking'
      presenceData.state = privacy
        ? 'My Profile'
        : showLevel
          ? `Badge (${badgeElement}) - Trophy (${trophyElement})`
          : 'My Profile'
    }
    else {
      presenceData.details = privacy
        ? 'Checking a User Profile'
        : showLevel
          ? `Checking a ${nameElement} Profile - (${levelElement}) - ${nextExp}`
          : `Checking a ${nameElement} Profile`
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Browsing'
      presenceData.state = privacy
        ? 'A user profile'
        : showLevel
          ? `Badge (${badgeElement}) - Trophy (${trophyElement})`
          : 'A user profile'
    }
    if (showButton) {
      presenceData.buttons = [
        {
          label: 'View Profile',
          url: document.location.href,
        },
      ]
    }
  }
  else if (page.includes('/search')) {
    const query = new URLSearchParams(document.location.search).get('terms')?.trim() || 'Something'
    presenceData.details = 'Searching for Content'
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Searching'
    presenceData.state = privacy ? 'Something' : query
    delete presenceData.buttons
  }
  else if (page.includes('/training/browse/')) {
    const query = new URLSearchParams(document.location.search).get('terms')?.trim() || 'Something'
    presenceData.details = 'Searching for Training'
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Searching'
    presenceData.state = privacy ? 'Something' : query
    delete presenceData.buttons
  }
  else {
    presenceData.details = 'Browsing Microsoft Learn'
    presenceData.state = pageTitle
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Viewing'
    delete presenceData.buttons
  }

  presence.setActivity(presenceData)
})
