const presence = new Presence({
  clientId: '650492842615242765',
})
const pages: {
  [name: string]: string
} = {
  '/trending': 'Trending ',
  '/lol': 'Lol ',
  '/win': 'Win ',
  '/quizzes': 'Quiz ',
  '/giftguide': 'Gift Guide ',
  '/shopping': 'Shopping ',
  '/tvandmovies': 'Tv & Movies ',
  '/celebrity': 'Celebrity ',
  '/newsletters': 'Newsletter ',
}

presence.on('UpdateData', async () => {
  const page = document.location.pathname
  const posttitle = document.querySelector(
    '#mod-buzz-header-1 > div.buzz-header__hgroup.xs-my2.md-mt0 > h1',
  )
  const user = document.querySelector(
    'body > main > div > div > div > div.user-info.xs-px2.sm-p0.xs-mb3.md-mb4 > div > div.xs-ml2.xs-flex.xs-flex-column > div > h1',
  )
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/BuzzFeed/assets/logo.png',
    startTimestamp: Math.floor(Date.now() / 1000),
  }

  if (posttitle && posttitle.textContent !== '') {
    presenceData.details = 'Reads a Post:'
    presenceData.state = `${posttitle.textContent}`
  }
  else if (pages[page] || pages[page.slice(0, -1)]) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = pages[page] || pages[page.slice(0, -1)]
  }
  else if (page.includes('/search')) {
    presenceData.details = 'Searching:'
    presenceData.state = document.title
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/B/BuzzFeed/assets/logo.png'
  }
  else if (user && user.textContent !== '') {
    presenceData.details = 'Viewing User Profile:'
    presenceData.state = user.textContent
  }
  else {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Homepage'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
