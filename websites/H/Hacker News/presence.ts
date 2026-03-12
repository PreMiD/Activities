const presence = new Presence({
  clientId: '1089948109225861200',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const staticPages: Record<string, PresenceData> = {
  '/': { details: 'Browsing the main feed' },
  '/news': { details: 'Browsing the main feed' },
  '/newest': { details: 'Browsing the newest discussions' },
  '/newcomments': { details: 'Browsing new comments' },
  '/ask': { details: 'Browsing Ask HN discussions' },
  '/show': { details: 'Browsing Show HN discussions' },
  '/jobs': { details: 'Browsing job discussions' },
  '/pool': { details: 'Browsing second-chance discussions' },
  '/invited': { details: 'Browsing reposted links' },
  '/best': { details: 'Browsing best discussions' },
  '/active': { details: 'Browsing active discussions' },
  '/bestcomments': { details: 'Browsing best comments' },
  '/asknew': { details: 'Browsing new Ask HN discussions' },
  '/shownew': { details: 'Browsing new Show HN discussions' },
  '/noobstories': { details: 'Browsing submissions by new users' },
  '/noobcomments': { details: 'Browsing comments by new users' },
  '/leaders': { details: 'Browsing top users' },
  '/whoishiring': { details: 'Browsing \'Who Is Hiring?\' discussions' },
  '/launches': { details: 'Browsing Launch HN discussions' },
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/Hacker%20News/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, search } = document.location
  const searchParams = new URLSearchParams(search)

  if (staticPages[pathname])
    Object.assign(presenceData, staticPages[pathname])

  switch (pathname) {
    case '/submitted': {
      presenceData.details = 'Browsing submissions by a user'
      presenceData.state = searchParams.get('id')
      break
    }
    case '/threads': {
      presenceData.details = 'Browsing threads by a user'
      presenceData.state = searchParams.get('id')
      break
    }
    case '/front': {
      presenceData.details = 'Browsing top discussions'
      presenceData.state = document.querySelector<HTMLDivElement>(
        '#pagespace + tr div',
      )?.firstChild?.textContent
      break
    }
    case '/submit': {
      presenceData.details = 'Creating a new discussions'
      presenceData.state = document.querySelector<HTMLInputElement>('[name=\'title\']')?.value
      break
    }
    case '/user': {
      presenceData.details = 'Viewing a user\'s profile'
      presenceData.state = searchParams.get('id')
      break
    }
    case '/favorites': {
      presenceData.details = `Browsing a user's favorite ${
        searchParams.get('comments') ? 'threads' : 'discussions'
      }`
      presenceData.state = searchParams.get('id')
      break
    }
    case '/item': {
      const link = document.querySelector<HTMLAnchorElement>('.titleline a')
      presenceData.details = 'Viewing a discussion'
      presenceData.state = link?.textContent
      presenceData.buttons = [{ label: 'View Discussion', url: href }]
      if (document.querySelector<HTMLSpanElement>('.sitebit.comhead'))
        presenceData.buttons.push({ label: 'Read Article', url: link!.href })

      break
    }
    case '/from': {
      presenceData.details = 'Browsing discussions from a website'
      presenceData.state = searchParams.get('site')
      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
