const presence = new Presence({
  clientId: '1427310874296713279',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/uERHbwA.png',
}

const pageNames: Record<string, string> = {
  'tic-tac-toe': 'Tic-tac-toe',
  'choose-a-username': 'Choose a Username',
  'swear-word-generator': 'Swear Word Generator',
  'guess-the-number': 'Guess The Number',
  'watch-some-youtube': 'Watch Some YouTube',
  'escape-game': 'Escape Game',
  'chat': 'Chat',
  'enter-password': 'Enter Password',
  'sus-link': 'Sus Link',
  'math': 'Math',
  'chaos-clicker': 'Chaos Clicker',
  'rock-paper-scissors': 'Rock Paper Scissors',
  'login': 'Account',
  'privacy-policy': 'Privacy Policy',
  'suggestion': 'Suggestions',
}

function getPathSegment(pathname: string): string {
  return pathname
    .replace(/^\//, '')
    .replace(/\/index\.html$/, '')
    .split('/')[0] ?? ''
}

presence.on('UpdateData', async () => {
  const pathname = document.location.pathname
  const currentSegment = getPathSegment(pathname)
  const currentPageName = pageNames[currentSegment]
  const buttons = await presence.getSetting<boolean>('buttons')

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  if (pathname === '/' || pathname === '/index.html') {
    presenceData.details = 'Browsing games'
    presenceData.state = 'Home'
  }
  else if (pathname.startsWith('/docs')) {
    presenceData.details = 'Reading documentation'
  }
  else if (currentPageName) {
    presenceData.details = currentSegment === 'login' ? 'Managing account' : 'Playing a game'
    presenceData.state = currentPageName
  }
  else {
    const title = document.title
      .replace(/\s*-\s*Szabfun.*$/i, '')
      .replace(/^Szabfun\s*-\s*/i, '')
      .trim()

    presenceData.details = 'Browsing'
    if (title.length > 0)
      presenceData.state = title
  }

  if (buttons) {
    presenceData.buttons = [
      {
        label: 'Visit Szabfun',
        url: document.location.href,
      },
    ]
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
