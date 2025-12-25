import { Assets } from 'premid'

const presence = new Presence({
  clientId: '785263902321541181', // Presence Application ID on Discord Developers.
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

function unEscapeHTML(text: string): string {
  const textarea = document.createElement('textarea')
  textarea.textContent = text
  return textarea.textContent
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/LinkedIn/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, search } = document.location
  const pathList = pathname.split('/').filter(Boolean)
  const params = new URLSearchParams(search)
  const privacyMode = await presence.getSetting<boolean>('privacyMode')

  // Feed section
  if (pathname.startsWith('/feed/')) {
    presenceData.details = 'Browsing Feed'
  }
  // My Network section
  else if (pathname.startsWith('/mynetwork/')) {
    presenceData.details = 'Managing Network'
    if (pathname.includes('/invitation-manager/')) {
      presenceData.state = 'Viewing Invitations'
    }
    else {
      switch (pathList[1]) {
        case 'grow': {
          presenceData.state = 'Viewing Network Recommendations'
          break
        }
        case 'catch-up': {
          presenceData.state = 'Viewing Network Updates'
          break
        }
        case 'invite-connect': {
          presenceData.state = 'Viewing Connections List'
          break
        }
        case 'network-manager': {
          const networkStates: Record<string, string> = {
            following: 'Viewing Following',
            followers: 'Viewing Followers',
            company: 'Viewing Followed Company/Organization List',
            newsletters: 'Viewing Subscribed Newsletters',
          }
          presenceData.state = networkStates[pathList.at(-1) as string] ?? 'Managing Network'
          break
        }
      }
    }
  }
  // Jobs section
  else if (pathname.startsWith('/jobs/')) {
    presenceData.details = 'Browsing Jobs'
    if (pathList[1] === 'collections') {
      const collectionName = document.querySelector(
        '.jobs-search-discovery-tabs__tablist a[aria-current="true"]',
      )?.textContent || ''
      presenceData.state = collectionName
    }
    else if (pathList[1] === 'view') {
      presenceData.details = 'Viewing a job'
      if (!privacyMode) {
        presenceData.state = document.querySelector('.jobs-details h1')?.textContent || ''
        presenceData.smallImageKey = document.querySelector<HTMLImageElement>(
          '.jobs-details .p5 img',
        )?.src || Assets.Question
        presenceData.smallImageText = document.querySelector(
          '.job-details-jobs-unified-top-card__company-name',
        )?.textContent || ''
      }
    }
    else if (pathList[1] === 'search') {
      presenceData.details = 'Searching for a job'
    }
  }
  // Events section
  else if (pathname.startsWith('/events/')) {
    presenceData.details = 'Browsing Events'
    if (pathList.length > 1) {
      presenceData.details = 'Viewing an Event'
      if (!privacyMode) {
        presenceData.state = document.querySelector(
          'h1.events-live-top-card__title',
        )?.textContent || ''
      }
    }
  }
  // Groups section
  else if (pathname.startsWith('/groups/')) {
    presenceData.details = 'Viewing Joined Groups'
    if (pathList.length > 1) {
      if (pathList[1] === 'requests') {
        presenceData.details = 'Viewing Requested Groups'
      }
      else if (pathList[1]?.match(/^\d+$/)) {
        const GroupLogoSrc = document.querySelector<HTMLImageElement>(
          '.groups-header__logo',
        )?.src
        presenceData.details = 'Viewing a Group'
        if (!privacyMode) {
          presenceData.state = document.querySelector('section h1')?.textContent || ''
          presenceData.smallImageKey = GroupLogoSrc?.startsWith('data:')
            ? null
            : GroupLogoSrc
              || null
        }
      }
    }
  }
  // Learning section
  else if (pathname.startsWith('/learning/')) {
    if (pathname.endsWith('/learning/')) {
      presenceData.details = 'Browsing learning courses'
    }
    else if (pathname.startsWith('/learning/search')) {
      presenceData.details = 'Searching learning materials'
      presenceData.smallImageKey = Assets.Search
    }
    else if (pathname.startsWith('/learning/paths/')) {
      presenceData.details = 'Viewing a learning path'
      if (!privacyMode)
        presenceData.state = document.querySelector('.layout-container h1')?.textContent || ''
    }
    else if (pathname.endsWith('/career-journey')) {
      presenceData.details = 'Viewing Career Journey'
    }
    else if (pathname.includes('/my-library/')) {
      presenceData.details = 'Viewing learning library'
    }
    else if (pathname.includes('/browse/')) {
      presenceData.details = 'Browsing learning materials'
      if (pathname.endsWith('/certifications'))
        presenceData.details = 'Browsing certifications'
    }
    else if (pathname.includes('/roles/')) {
      presenceData.details = 'Learning a role'
      if (!privacyMode)
        presenceData.state = document.querySelector('main h2')?.textContent || ''
    }
    else if (pathname.includes('/topics/')) {
      presenceData.details = 'Viewing a learning topic'
      if (!privacyMode)
        presenceData.state = document.querySelector('header h1')?.textContent || ''
    }
    else if (pathname.includes('/showcase/')) {
      presenceData.details = 'Viewing a showcase'
      if (!privacyMode)
        presenceData.state = document.querySelector('main h2')?.textContent || ''
    }
    else {
      presenceData.details = 'Viewing a course'
      presenceData.smallImageKey = Assets.Viewing
      if (!privacyMode) {
        presenceData.state = document.querySelector<HTMLTitleElement>('title')
          ?.textContent
          ?.replace(' | LinkedIn Learning', '') || ''
      }
    }
  }
  else if (pathname.startsWith('/search/results/')) {
    const keyword = params.get('keywords') || 'something'
    presenceData.details = privacyMode ? 'Searching...' : `Searching for ${keyword}`
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.startsWith('/messaging/')) {
    presenceData.details = 'Checking Messages'
  }
  else if (pathname.startsWith('/notifications/')) {
    presenceData.details = 'Checking Notifications'
  }
  // Recent Activity section
  else if (pathname.includes('/recent-activity/')) {
    presenceData.details = 'Viewing recent activity'
  }
  // Profile page section
  else if (pathname.match(/\/in\/[A-Za-z0-9-]+\//)) {
    presenceData.details = 'Viewing a profile'
    const profileName = document.querySelector('span h1')?.textContent?.trim()
      || document.querySelector('.artdeco-entity-lockup__title')?.textContent?.trim()
      || ''
    if (!privacyMode)
      presenceData.state = profileName

    // Profile detail subsection
    if (pathname.includes('/edit/')) {
      presenceData.details = 'Editing profile'
    }
    else if (pathname.includes('/details/')) {
      presenceData.details = 'Viewing a profile details'
    }
  }
  // Company page section
  else if (pathname.match(/\/company\/[A-Za-z0-9-]+\//)) {
    presenceData.details = 'Viewing a company'
    if (!privacyMode) {
      presenceData.state = unEscapeHTML(
        document.querySelector('section h1')?.textContent?.trim() || '',
      )
      presenceData.smallImageKey = document.querySelector<HTMLImageElement>(
        '.org-top-card-primary-content__logo-container img',
      )?.src || Assets.Question
    }
  }
  // School page section
  else if (pathname.match(/\/school\/[A-Za-z0-9-]+\//)) {
    presenceData.details = 'Viewing a school'
    if (!privacyMode) {
      presenceData.state = unEscapeHTML(
        document.querySelector('section h1')?.textContent?.trim() || '',
      )
      presenceData.smallImageKey = document.querySelector<HTMLImageElement>(
        '.org-top-card-primary-content__logo-container img',
      )?.src || Assets.Question
    }
  }
  // Games section
  else if (pathname.startsWith('/games/')) {
    presenceData.details = 'Playing a game'
    switch (pathList[1]) {
      case 'mini-sudoku':
        presenceData.state = 'Mini Sudoku'
        break
      case 'zip':
        presenceData.state = 'Zip'
        break
      case 'tango':
        presenceData.state = 'Tango'
        break
      case 'queens':
        presenceData.state = 'Queens'
        break
      case 'pinpoint':
        presenceData.state = 'Pinpoint'
        break
      case 'crossclimb':
        presenceData.state = 'Crossclimb'
        break
    }
  }
  // Settings section
  else if (pathname.startsWith('/mypreferences/')) {
    presenceData.details = 'Editing settings'
  }
  // My Items section
  else if (pathname.startsWith('/my-items/')) {
    presenceData.details = 'Viewing My items'
  }
  else if (pathname.startsWith('/posts/')) {
    presenceData.details = 'Reading a post'
    const authorName = document.querySelector(
      '.update-components-actor__title .visually-hidden',
    )?.textContent || 'someone'
    presenceData.state = privacyMode ? 'from someone' : `from ${authorName}`
    presenceData.smallImageKey = Assets.Reading
  }

  if (!presenceData.details) {
    presenceData.details = 'Doing something...'
  }
  presence.setActivity(presenceData)
})
