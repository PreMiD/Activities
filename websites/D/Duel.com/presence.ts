const presence = new Presence({
  clientId: '1492950461186314472',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const [showBal, showTimestamp, showCurrentGame, showGameProvider] = await Promise.all([
    presence.getSetting<boolean>('showBal'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showCurrentGame'),
    presence.getSetting<boolean>('showGameProvider'),
  ])

  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/vc9ErETg.png',
    details: 'duel.com',
  }

  presenceData.name = 'Duel.com | Crypto Casino'

  const { pathname, search } = document.location
  let gameProvider = 'unknown provider'
  let gameName = 'unknown game'

 const originals = ['blackjack', 'dice', 'crash', 'plinko', 'mines', 'beef', 'keno', 'castle-roulette', 'video-poker']
  const toTitleCase = (str: string) => str.replace(/\b\w/g, l => l.toUpperCase())
  const currentOriginal = originals.find(game => pathname === `/${game}`)

  if (showTimestamp) {
    presenceData.startTimestamp = browsingTimestamp
  }
if (currentOriginal || pathname.includes('/casino/provably-fair/')) {
    const name = currentOriginal
      ? toTitleCase(currentOriginal)
      : toTitleCase(pathname.split('/casino/provably-fair/').pop()?.replaceAll('-', ' ') ?? 'unknown game')
    presenceData.state = `Playing "${name}" by Duel`
  }
  else if (pathname.includes('/casino/games/')) {
    if (showCurrentGame) {
      const gameSlug = pathname.split('/casino/games/').pop() ?? ''
      const parts = gameSlug.split('_')
      const gameProvider = toTitleCase(parts.slice(0, 2).join(' '))
      const gameName = toTitleCase(parts.slice(2).join(' '))
      presenceData.state = `Playing "${gameName}"${showGameProvider ? ` by ${gameProvider}` : ''}`
    }
  }
  else if (pathname.includes('/casino')) {
    if (pathname.includes('/category/')) {
      presenceData.state = `Browsing ${pathname
        .split('/category/')
        .pop()
        ?.replaceAll('-', ' ')
        .replace(/\b\w/g, l => l.toUpperCase())}...`
    }
    else {
      presenceData.state = 'Browsing Casino...'
    }
  }
  else if (pathname.includes('sports')) {
    presenceData.state = 'Browsing Sports...'
  }


  
   if (showBal) {
    const currencyContainer = document.querySelector('[data-testid="currency-value"]')
    const balanceText = Array.from(currencyContainer?.querySelectorAll('span') ?? [])
      .map(s => s.textContent?.trim())
      .filter(Boolean)
      .join('') ?? 'Unknown'

    const isCrypto = /^[0-9.]+$/.test(balanceText)
    const isUSD = balanceText.includes('$')

    if (pathname.includes('/casino/games/') || pathname.includes('/casino/provably-fair/'))
      presenceData.details = `Balance: (In Play)`
    else if (isCrypto)
      presenceData.details = `Balance: ${balanceText} (Crypto)`
    else if (isUSD)
      presenceData.details = `Balance: ${balanceText} USD`
    else
      presenceData.details = `Balance: ${balanceText}`
  }
  else {
    presenceData.details = 'Balance: Hidden'
  }

 

  presenceData.stateUrl = document.location.href
  presence.setActivity(presenceData)
})
