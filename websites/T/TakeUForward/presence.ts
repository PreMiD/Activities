const presence = new Presence({
  clientId: '1396110010123030669',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = 'https://pbs.twimg.com/profile_images/2100916656579207168/KVz7IWL4_400x400.jpg',
}

const routes = [
  { path: '/dashboard', state: 'Viewing Dashboard' },
  { path: '/planly', state: 'Viewing Plans' },
  { path: '/goodies', state: 'Viewing Goodies' },
  { path: '/leaderboard', state: 'Viewing Leaderboard' },
  { path: '/ide', state: 'Using IDE' },
  { path: '/notes', state: 'Viewing Notes' },
  { path: '/lists', state: 'Viewing Lists' },
  { path: '/codespace', state: 'Viewing Codespace' },
]

const practiceRoutes = [
  { path: '/practice/dsa', state: 'Practicing DSA Problems', label: 'DSA' },
  { path: '/practice/sql', state: 'Practicing SQL Problems', label: 'SQL' },
  { path: '/practice/quantitative', state: 'Practicing Quantitative Aptitude', label: 'Quantitative Aptitude' },
  { path: '/practice/logical', state: 'Practicing Logical Reasoning', label: 'Logical Reasoning' },
  { path: '/practice/verbal', state: 'Practicing Verbal Ability', label: 'Verbal Ability' },
]

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  if (pathname.startsWith('/practice')) {
    const practiceRoute = practiceRoutes.find(({ path }) => pathname.startsWith(path))

    if (practiceRoute) {
      const h1 = document.querySelector('h1')?.textContent?.trim()
      const questionMatch = h1?.match(/^\d+\.\s*(.+)$/)

      if (questionMatch) {
        presenceData.details = `Solving ${practiceRoute.label} Problem`
        presenceData.state = questionMatch[1]
      } else {
        presenceData.state = practiceRoute.state
      }
      presenceData.stateUrl = window.location.href
    }
  } else if (pathname.startsWith('/blogs')) {
    const h1 = document.querySelector('h1')?.textContent?.trim()
    const isArticle = pathname.split('/').filter(Boolean).length > 1

    if (h1 && isArticle) {
      presenceData.details = 'Reading Blog'
      presenceData.state = h1
    } else {
      presenceData.state = 'Viewing Blogs'
    }
    presenceData.stateUrl = window.location.href
  } else if (pathname.startsWith('/prep-hub')) {
    const h1 = document.querySelector('h1')?.textContent?.trim()
    const isSheet = pathname.split('/').filter(Boolean).length > 1

    if (h1 && isSheet) {
      presenceData.details = 'Viewing Prep Hub'
      presenceData.state = `Browsing ${h1}`
    } else {
      presenceData.state = 'Viewing Prephub'
    }
    presenceData.stateUrl = window.location.href
  } else if (pathname.startsWith('/learning')) {
    const subject = document.querySelector('[class*="subject_name"]')?.getAttribute('title')
    const lesson = document.querySelector('[aria-current="page"] [class*="problem_title"]')?.textContent?.trim()

    if (subject) presenceData.details = `Learning ${subject}`
    if (lesson) presenceData.state = lesson
    presenceData.stateUrl = window.location.href
  } else if (pathname.startsWith('/community/interview-experiences')) {
    const title = document.title.replace(/\s*\|\s*takeUforward$/i, '').trim()

    presenceData.details = 'Reading Interview Experience'
    if (title) presenceData.state = title
    presenceData.stateUrl = window.location.href
  } else if (pathname.startsWith('/community')) {
    presenceData.state = 'Viewing Community Posts'
    presenceData.stateUrl = 'https://takeuforward.org/community'
  } else {
    const route = routes.find(({ path }) => pathname.startsWith(path))

    if (route) {
      presenceData.state = route.state
      presenceData.stateUrl = `https://takeuforward.org${route.path}`
    }
  }

  presence.setActivity(presenceData)
})
