const presence = new Presence({
  clientId: '1315433043590250526',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const gameIcon = Array.from(document.styleSheets)
  .flatMap(sheet => Array.from(sheet.cssRules || []))
  .filter(
    (rule): rule is CSSStyleRule =>
      rule instanceof CSSStyleRule
      && rule.selectorText === '.playbutton::before',
  )
  .map((rule: CSSStyleRule) => rule.style.backgroundImage)
  .join('')
  .replace(/^url\(["']?|["']?\)$/g, '')

presence.on('UpdateData', async () => {
  const { href, search, pathname } = document.location
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/K/KBHGames/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  if (pathname.startsWith('/new')) {
    presenceData.details = 'Viewing new games'
  }
  else if (pathname.startsWith('/best-new-games')) {
    presenceData.details = 'Viewing Best of New Games'
  }
  else if (pathname.startsWith('/best-games')) {
    presenceData.details = 'Viewing Top Games'
  }
  else if (pathname.startsWith('/about')) {
    presenceData.details = 'Viewing about KBHGames'
  }
  else if (pathname.startsWith('/terms-of-use')) {
    presenceData.details = 'Viewing the Terms of Use'
  }
  else if (pathname.startsWith('/privacy')) {
    presenceData.details = 'Viewing the Privacy Policy'
  }
  else if (pathname.startsWith('/favorite')) {
    presenceData.details = 'Viewing favorited games'
  }
  else if (search.startsWith('?s=')) {
    presenceData.details = 'Searching'
    presenceData.state = document.querySelector('#taginfo h1')?.textContent
  }
  else if (pathname.startsWith('/tag/')) {
    presenceData.details = 'Viewing category:'
    presenceData.state = document.querySelector('#taginfo h1')?.textContent
  }
  else if (pathname.startsWith('/engine/')) {
    presenceData.details = 'Viewing engine:'
    presenceData.state = document.querySelector('#taginfo h1')?.textContent
  }
  else if (pathname.startsWith('/game/')) {
    presenceData.details = 'Playing game:'
    presenceData.state = document.querySelector('#info-box h1')?.textContent
    presenceData.largeImageKey = gameIcon
    presenceData.buttons = [
      {
        label: 'View Game',
        url: href,
      },
    ]
  }
  else {
    presenceData.details = 'Viewing KBHGames'
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
