import { Assets } from 'premid'

const presence = new Presence({
  clientId: '632924426131996702',
})
const pages: {
  [name: string]: string
} = {
  '/': 'Home',
  '/learn': 'Learn to Play Chess',
  '/practice': 'Practice',
  '/training/coordinate': 'Coordinate',
  '/study': 'Study',
  '/coach': 'Coaches',
  '/tv': 'Lichess TV',
  '/games': 'Current Games',
  '/streamer': 'Streamers',
  '/broadcast': 'Broadcasts',
  '/video': 'Video Library',
  '/player': 'Players',
  '/team/all': 'Teams',
  '/forum': 'Forums',
  '/analysis': 'Analysis Board',
  '/editor': 'Board Editor',
  '/paste': 'Import Game',
  '/games/search': 'Advanced Search',
}

presence.on('UpdateData', async () => {
  const page = document.location.pathname
  const game = document
    .querySelector<HTMLElement>(
      '#main-wrap > main > aside > div > section > div.game__meta__infos > div > div > div',
    )
    ?.textContent
    ?.trim()
  const status = document
    .querySelector<HTMLElement>(
      '#main-wrap > main > aside > div > section.status',
    )
    ?.textContent
    ?.trim()
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/Lichess/assets/logo.png',
    startTimestamp: Math.floor(Date.now() / 1000),
  }

  if ((page && pages[page]) || (page && pages[page.slice(0, -1)])) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = pages[page] || pages[page.slice(0, -1)]
  }
  else if (page.includes('/training/')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Training'
  }
  else if (page.includes('/@/')) {
    presenceData.details = 'Searching for:'
    presenceData.state = document.title.replace(' • lichess.org', '')
    presenceData.smallImageKey = Assets.Search
  }
  else if (status && game) {
    presenceData.details = game
    presenceData.state = status
  }
  else if (!status && game) {
    presenceData.details = 'Playing a game:'
    presenceData.state = game
  }

  if (presenceData.details && presenceData.state)
    presence.setActivity(presenceData)
})
