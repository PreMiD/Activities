const presence = new Presence({
  clientId: '1031628776209141892',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/G/Game8/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, search } = document.location
  const searchParams = new URLSearchParams(search)
  const pathList = pathname.split('/').filter(Boolean)

  switch (pathList[0] ?? '/') {
    case '/': {
      presenceData.details = 'Browsing home page'
      break
    }
    case 'articles': {
      if (pathList[1]) {
        if (pathList[2]) {
          if (pathList[1] === 'author') {
            presenceData.details = 'Browsing articles by an author'
            presenceData.state = document.querySelector<HTMLDivElement>(
              '.p-authorListItem__lead',
            )
            presenceData.smallImageKey = document.querySelector<HTMLImageElement>(
              '.p-authorListItem__img',
            )
          }
          else {
            presenceData.details = 'Reading an article'
            presenceData.state = document.querySelector('h1')
            presenceData.buttons = [{ label: 'Read Article', url: href }]
          }
        }
        else if (pathList[1] === 'author') {
          presenceData.details = 'Browsing authors'
        }
        else {
          presenceData.details = 'Browsing articles by category'
          presenceData.state = document.querySelector('h1')
        }
      }
      else {
        presenceData.details = 'Browsing articles'
      }
      break
    }
    case 'archives': {
      if (pathList[1] === 'search') {
        presenceData.details = 'Searching for articles'
        presenceData.state = searchParams.get('query')
      }
      else {
        presenceData.details = 'Browsing game walkthroughs'
      }
      break
    }
    case 'games': {
      if (pathList[1]) {
        const gameTitle = document
          .querySelector<HTMLParagraphElement>('.p-gameHeader__game_title')
          ?.textContent
          ?.replace(/Walkthrough & Guides Wiki$/, '')
        presenceData.smallImageKey = document.querySelector<HTMLImageElement>(
          '.p-gameHeader__game_logo img',
        )
        presenceData.smallImageText = gameTitle
        if (pathList[2] === 'archives') {
          const breadcrumbs = [
            ...document.querySelector('.l-breadcrumb__list')?.children ?? [],
          ].slice(2, -1)
          presenceData.details = 'Reading a game walkthrough'
          presenceData.state = breadcrumbs.length
            ? `${breadcrumbs.map(a => a.textContent).join('/')}: ${
              document.querySelector('h1')?.textContent
            }`
            : document.querySelector('h1')
          presenceData.buttons = [{ label: 'Read Walkthrough', url: href }]
        }
        else if (pathList[2] === 'search') {
          presenceData.details = 'Searching for articles'
          presenceData.state = searchParams.get('q')
        }
        else {
          presenceData.details = 'Viewing a game'
          presenceData.state = gameTitle
          presenceData.buttons = [{ label: 'View Game', url: href }]
        }
      }
      else {
        presenceData.details = 'Browsing games'
      }
      break
    }
  }

  presence.setActivity(presenceData)
})
