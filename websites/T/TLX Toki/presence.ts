import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '878193925427449917',
})

const presenceData: PresenceData = {
  largeImageKey: 'https://i.imgur.com/7K6Wwke.png',
  startTimestamp: Math.floor(Date.now() / 1000),
  type: ActivityType.Playing,
  name: 'TLX Toki',
}

const endpointRegexes = {
  profileRegexp: /\/profiles\/([a-z0-9]+)/gi,
  contestsRegexp: /\/contests\/(.+)/gi,
  courseRegexp: /\/courses\/([a-z0-9]+)/gi,
}

presence.on('UpdateData', async () => {
  const { pathname, origin: baseOrigin } = document.location
  const username = document.querySelector('span[data-key="username"]')?.textContent?.trim()
  const avatar = document.querySelector('img.widget-user__avatar')?.getAttribute('src')?.trim()

  if (username && avatar) {
    presenceData.buttons = [
      {
        label: 'View My Profile',
        url: new URL(`./profiles/${username}`, baseOrigin).href,
      },
      {
        label: 'View Page',
        url: document.location.href,
      },
    ]
  }

  // Detect homepage
  if (pathname === '/') {
    presenceData.details = 'Homepage'
    presenceData.state = 'Homepage'
  }

  // Detect profile page
  const profileUsernameRegex = endpointRegexes.profileRegexp.exec(pathname)?.at(-1)?.trim()
  if (profileUsernameRegex) {
    // Detect submission history
    if (pathname.endsWith('submission-history')) {
      presenceData.details = `TLX Submission History: ${profileUsernameRegex}`
    }
    else if (pathname.endsWith('contest-history')) {
      presenceData.details = `TLX Contest History: ${profileUsernameRegex}`
    }
    else {
      const name = document.querySelector('.basic-profile-card__details-keys')?.nextSibling?.textContent?.trim()
      const userAvatar = document.querySelector('.basic-profile-card__avatar')?.getAttribute('src')

      presenceData.details = `TLX Profile: ${profileUsernameRegex}${name ? ` (${name})` : ''}`

      // Set user avatar as small image if exists
      if (userAvatar) {
        presenceData.smallImageKey = userAvatar
      }

      const userCountry = document.querySelector('span.basic-profile-card__country')?.textContent?.trim() ?? 'N/A'
      const userRating = document.querySelector('td.rating-unrated')?.textContent?.trim() ?? 'N/A'

      presenceData.state = `Country: ${userCountry}  •  Rating: ${userRating}`

      const problemStatsCardElement = document.querySelectorAll('[class="card__content bp5-card bp5-elevation-0"]')?.[2]

      // Get problem statistics if available
      if (problemStatsCardElement) {
        const problemScoresPts = problemStatsCardElement.querySelector('li b')?.textContent?.trim() ?? '0'
        const problemsAttempted = problemStatsCardElement.querySelector('li:nth-child(2) b')?.textContent?.trim() ?? '0'

        presenceData.state = `Country: ${userCountry}\nRating: ${userRating}\nPS: ${problemScoresPts} pts\nPA: ${problemsAttempted} attempts`
      }
    }
  }

  // Detect account info page
  if (pathname.startsWith('/account')) {
    presenceData.details = 'Account Settings'
    presenceData.state = 'Viewing account settings page'
  }

  // Detect contests page
  if (pathname === '/contests') {
    const paginatedText = document.querySelector('.pagination small')?.textContent?.trim() ?? ''
    const currentPage = document.querySelector('a[aria-current]')?.textContent?.trim() ?? ''
    const totalPage = document.querySelector('.pagination ul li:last-child')?.previousSibling?.textContent?.trim() ?? ''

    presenceData.details = 'Contests'
    presenceData.state = `${paginatedText} [Page: ${currentPage}/${totalPage}]`
  }

  // Detect contest page
  if (endpointRegexes.contestsRegexp.test(pathname)) {
    const contestName = document.querySelector('.single-contest-routes__heading')?.textContent?.trim()
    if (contestName) {
      const registrantMatch = document.querySelector('[class="bp5-button contest-registration-card__item"]')?.textContent?.trim().match(/\d+/g)?.at(-1)

      presenceData.details = `Contest: ${contestName}`
      if (registrantMatch) {
        presenceData.state = `Registrants: ${registrantMatch ?? 'Unknown'}`
      }

      if (pathname.endsWith('problems')) {
        const problemCount = document.querySelectorAll('.contest-problem-card').length
        presenceData.state = `Problems: ${problemCount}`
      }

      if (pathname.endsWith('announcements')) {
        const announcementCount = document.querySelectorAll('.content-card__section').length
        presenceData.state = `Announcements: ${announcementCount}`
      }

      if (pathname.endsWith('scoreboard')) {
        const contestantCount = document.querySelector('.pagination__helper-text')?.textContent?.trim().match(/(\d+) results/)?.at(-1)
        presenceData.state = `Contestants: ${contestantCount ?? 'Unknown'} contestants `
      }
    }
  }

  // Detect courses list page
  if (pathname === '/courses') {
    presenceData.details = 'Courses'
    presenceData.state = 'Viewing courses list'
  }

  // Detect course page
  const courseMatch = endpointRegexes.courseRegexp.exec(pathname)?.at(-1)?.trim()
  if (courseMatch) {
    if (pathname.includes('/problems/')) {
      const problemName = document.querySelector('.chapter-problem-page__title h3')?.textContent?.trim()
      const state = document.querySelector('.statement-header__limits')?.textContent?.trim()

      presenceData.details = `Solving ${problemName}`

      // There's coding page and submission page
      if (state) {
        presenceData.state = state
      }
      else if (!state && pathname.endsWith('/submissions')) {
        presenceData.state = 'Working on submissions'
      }
    }
    else {
      const chapterPageTitle = document.querySelector('.chapter-resources-page__title')
      const courseChapterTitleNode = chapterPageTitle?.querySelector('a')

      const courseName = document.querySelector('.course-overview h2')?.textContent?.trim()
        ?? courseChapterTitleNode?.textContent?.trim()

      if (courseChapterTitleNode && chapterPageTitle) {
        const prevHTML = chapterPageTitle.innerHTML
        chapterPageTitle?.removeChild(courseChapterTitleNode)

        presenceData.state = `Viewing ${chapterPageTitle.textContent?.trim()}`
        chapterPageTitle.innerHTML = prevHTML
      }

      presenceData.details = `Course: ${courseName ?? courseMatch}`

      if (!chapterPageTitle) {
        presenceData.state = document.querySelector('.html-text')?.textContent?.trim() ?? '-'
      }
    }
  }

  // Detect submissions page
  if (pathname.startsWith('/submissions')) {
    const verdict = document.querySelector('.verdict-tag')?.textContent?.trim()

    // If verdict exists (it's submission detail page)
    if (verdict) {
      const submissionTitle = document.querySelector('h3')?.textContent?.trim()
      const problemName = document.querySelector('.general-info h4')?.textContent?.trim()
      const user = document.querySelector('.user-ref__username')?.textContent?.trim()
      const submitTime = document.querySelector('.general-info__time')?.textContent?.trim()

      presenceData.details = `[${verdict}] ${submissionTitle}`
      presenceData.state = `Problem: ${problemName}, User: ${user}, Time: ${submitTime}`
    }
    else {
      // It's submission list page

      const paginatedText = document.querySelector('.pagination small')?.textContent?.trim() ?? ''
      const currentPage = document.querySelector('a[aria-current]')?.textContent?.trim() ?? ''
      const totalPage = document.querySelector('.pagination ul li:last-child')?.previousSibling?.textContent?.trim() ?? ''

      presenceData.details = pathname.endsWith('/mine') ? 'My Submissions' : 'Submissions'
      presenceData.state = `${paginatedText} [Page: ${currentPage}/${totalPage}]`
    }
  }

  // Detect ranking pages
  if (pathname === '/ranking/scores' || pathname === '/ranking') {
    const paginatedText = document.querySelector('.pagination small')?.textContent?.trim() ?? ''
    const currentPage = document.querySelector('a[aria-current]')?.textContent?.trim() ?? ''
    const totalPage = document.querySelector('.pagination ul li:last-child')?.previousSibling?.textContent?.trim() ?? ''

    presenceData.details = pathname === '/ranking/scores' ? 'Ranking Scores' : 'Ranking'
    presenceData.state = `${paginatedText} [Page: ${currentPage}/${totalPage}]`
  }

  // Detect login page
  if (pathname === '/login') {
    presenceData.details = 'Login'
    presenceData.state = 'Logging in...'
  }

  // Detect register pages
  if (pathname === '/register') {
    presenceData.details = 'Signup'
    presenceData.state = 'Signing up...'
  }

  if (presenceData.details && presenceData.state) {
    presence.setActivity(presenceData)
  }
  else {
    presence.setActivity()
  }
})
