const presence = new Presence({
  clientId: '719127768868061246',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const staticPages: Record<string, PresenceData> = {
  '/': { details: 'Viewing homepage' },
  '/home': { details: 'Viewing homepage' },
  '/achievements': { details: 'Viewing achievements' },
  '/appeals': { details: 'Viewing Appeals' },
  '/anime': { details: 'Viewing Anime' },
  '/bank': { details: 'Viewing the Bank' },
  '/bump': { details: 'Bumping' },
  '/card-abilities': { details: 'Viewing Card Abilities' },
  '/cardmakers/leaderboard': { details: 'Viewing CardMaker Leaderboards' },
  '/copyright': { details: 'Viewing Copyright Policy' },
  '/creators': { details: 'Viewing Creators' },
  '/dashboard': { details: 'Viewing the Dashboard' },
  '/events': { details: 'Viewing Events' },
  '/friends': { details: 'Viewing Friends' },
  '/fusion': { details: 'Fusing Cards' },
  '/giveaway': { details: 'Viewing Giveaways' },
  '/keysgiveaways': { details: 'Viewing Key Giveaways' },
  '/leaderboards': { details: 'Viewing Leaderboards' },
  '/market': { details: 'Viewing the Market' },
  '/medals': { details: 'Viewing Medals' },
  '/messages': { details: 'Viewing Private Messages' },
  '/notifications': { details: 'Viewing Notifications' },
  '/premium': { details: 'Viewing Premium' },
  '/privacy-policy': { details: 'Viewing Privacy Policy' },
  '/rules': { details: 'Reading the Rules' },
  '/settings': { details: 'Managing Settings' },
  '/stacks': { details: 'Viewing Stacks' },
  '/staff': { details: 'Viewing Staff Pages' },
  '/staff-list': { details: 'Viewing Staff List' },
  '/submit': { details: 'Submitting a Card' },
  '/tasks': { details: 'Viewing Statistics & Tasks' },
  '/this-or-that': { details: 'Playing This or That' },
  '/trades': { details: 'Viewing Trades' },
  '/updates': { details: 'Viewing Updates' },
}

function convertSuffixedToNumber(amount: string): number {
  const [, number, suffix] = amount.match(/([\d.]+)\s*([A-Z])?/) ?? []
  return (
    Number.parseFloat(number ?? '0')
    * ({
      K: 1e3,
      M: 1e6,
      B: 1e9,
      T: 1e12,
    }[suffix ?? ''] ?? 1)
  )
}

function convertNumberToSuffixed(amount: number): string {
  const amounts: Record<string, number> = {
    K: 1e3,
    M: 1e6,
    B: 1e9,
    T: 1e12,
  }
  const suffixes = Object.keys(amounts).reverse()
  for (const suffix of suffixes) {
    if (amount >= amounts[suffix]!)
      return `${(amount / amounts[suffix]!).toFixed(1)}${suffix}`
  }
  return `${amount}`
}

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Shoob/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = window.location
  const pathSplit = pathname.split('/').slice(1)
  const pageTitle = document.querySelector<HTMLLIElement>(
    '[itemprop=\'breadcrumb\'] > li:last-child',
  )?.textContent
  const profileImage = document.querySelector<HTMLAnchorElement>('.header-avatar')
  const currencyFormat = await presence.getSetting<number>('currencyFormat')

  if (profileImage) {
    presenceData.smallImageKey = getComputedStyle(profileImage).backgroundImage.match(/url\("(.*)"\)/)?.[1]
    if (currencyFormat === 0) {
      presenceData.smallImageText = `💴 ${
        document.querySelector<HTMLSpanElement>('.header-wallet')?.textContent
      }`
    }
    else {
      presenceData.smallImageText = `💴 ${
        document.querySelector<HTMLSpanElement>('.header-wallet')?.textContent
      } 💱 ${convertNumberToSuffixed(
        convertSuffixedToNumber(
          document.querySelector<HTMLSpanElement>('.header-wallet')?.textContent ?? '',
        )
        + convertSuffixedToNumber(
          document.querySelector<HTMLSpanElement>('.header-bank:not(.orange)')
            ?.textContent ?? '',
        )
        + 4.2
        * convertSuffixedToNumber(
          document.querySelector<HTMLSpanElement>('.header-bank.orange')
            ?.textContent ?? '',
        ),
      )}`
    }
  }

  for (const [path, data] of Object.entries(staticPages)) {
    if (pathname.startsWith(path))
      presenceData = { ...presenceData, ...data } as PresenceData
  }

  switch (pathSplit[0]) {
    case 'articles':
      if (pathSplit[1]) {
        presenceData.details = 'Reading an Article'
        presenceData.state = pageTitle
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.articleimg-img')?.src
        presenceData.buttons = [{ label: 'Read Article', url: href }]
      }
      else {
        presenceData.details = 'Viewing Articles'
      }
      break
    case 'auction':
      if (pathSplit[1]) {
        presenceData.details = 'Viewing an Auction'
        presenceData.state = pageTitle
        presenceData.buttons = [{ label: 'View Auction', url: href }]
      }
      else {
        presenceData.details = 'Viewing the Auction HQ'
      }
      break
    case 'cards':
      if (pathSplit[1] === 'info') {
        presenceData.details = 'Viewing a Card'
        presenceData.state = pageTitle
        presenceData.buttons = [{ label: 'View Card', url: href }]
      }
      else {
        presenceData.details = 'Viewing the Cards'
      }
      break
    case 'card-events':
      presenceData.details = 'Viewing Card Events'
      if (pathSplit[1]) {
        if (pathSplit[2]) {
          presenceData.details = 'Viewing an Event Card'
          presenceData.state = pageTitle
          presenceData.buttons = [{ label: 'View Card', url: href }]
        }
        else {
          presenceData.state = `${
            document.querySelector(
              '[itemprop=\'breadcrumb\'] [href*=\'/card-events/\']',
            )?.textContent
          } Cards`
        }
      }
      break
    case 'inventory':
      if (pathSplit[1]) {
        presenceData.details = 'Viewing a card in their inventory'
        presenceData.state = `${pageTitle}#${
          document.querySelector('.user_purchased + div + div b:nth-child(2)')
            ?.textContent
        }`
      }
      else {
        presenceData.details = 'Viewing Inventory'
        presenceData.state = `${
          document.querySelector<HTMLSpanElement>('.inventory-percent + span')
            ?.textContent
        } cards collected`
      }
      break
    case 'market':
      presenceData.details = 'Viewing the Market'
      presenceData.buttons = [{ label: 'View Market', url: href }]
      break
    case 'mini-games':
      if (pathSplit[1]) {
        presenceData.details = 'Playing a Mini Game'
        presenceData.buttons = [{ label: 'View Mini-Game', url: href }]
      }
      else {
        presenceData.details = 'Viewing Mini-Games'
        presenceData.buttons = [{ label: 'View Mini-Games', url: href }]
      }
      break
    case 'servers':
      if (pathSplit[1]) {
        presenceData.details = 'Viewing a Server'
        presenceData.state = pageTitle
        presenceData.buttons = [{ label: 'View Server', url: href }]
      }
      else {
        presenceData.details = 'Viewing Servers'
      }
      break
    case 'shop':
      if (pathSplit[1] === 'category') {
        presenceData.details = 'Browsing a Shop Category'
        presenceData.state = pageTitle
      }
      else if (pathSplit[1] === 'item') {
        presenceData.details = 'Viewing a Shop Item'
        presenceData.state = pageTitle
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.item-pic-img')?.src
        presenceData.buttons = [{ label: 'View Item', url: href }]
      }
      else {
        presenceData.details = 'Browsing the Shop'
      }
      break
    case 'support':
      switch (pathSplit[1]) {
        case 'category': {
          presenceData.details = 'Browsing a Support Category'
          presenceData.state = pageTitle
          break
        }
        case 'thread': {
          presenceData.details = 'Viewing a Support Thread'
          presenceData.state = pageTitle
          presenceData.buttons = [{ label: 'View Thread', url: href }]
          break
        }
        default: {
          presenceData.details = 'Browsing Support'
        }
      }
      break
    case 'user': {
      const tab = document.querySelector<HTMLButtonElement>(
        'button.Mui-selected',
      )?.textContent
      presenceData.details = `Viewing ${pageTitle}'s Profile`
      if (tab === 'Info') {
        const [, level, xp] = document
          .querySelector<HTMLSpanElement>('.detailedStats > span')
          ?.textContent
          ?.match(/(\d+)\s*level\s*\((\d+)\s*XP\)/) ?? []
        presenceData.state = `🎚 Level ${level} ⚡${xp} XP`
      }
      else if (tab === 'Cards') {
        presenceData.state = `Their Cards (Total: ${
          document
            .querySelector<HTMLSpanElement>(
              '.tabpanel-content > div > div:nth-child(2) .MuiTypography-root',
            )
            ?.textContent
            ?.match(/\d+/)?.[0]
        })`
      }
      else {
        presenceData.state = `Their ${tab}`
      }
      presenceData.buttons = [{ label: 'View Profile', url: href }]
      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
