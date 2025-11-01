const presence = new Presence({
  clientId: '1231098376741982349',
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
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Stake.us/assets/0.png',
  }
  presenceData.name = 'Stake.us | Online Casino'

  const { pathname, search } = document.location
  let gameProvider = 'unknown provider'
  let gameName = 'unknown game'

  if (showTimestamp) {
    presenceData.startTimestamp = browsingTimestamp
  }

  // Display the current game being played or browsing state/page
  if (pathname.includes('casino') && !pathname.includes('games')) {
    if (pathname.includes('group')) {
      presenceData.state = `Browsing ${pathname
        .split('/group/')
        .pop()
        ?.replaceAll('-', ' ')
        .replace(/\b\w/g, letter => letter.toUpperCase())}...`
    }
    else {
      presenceData.state = 'Browsing Casino...'
    }
  }
  else if (pathname.includes('games')) {
    if (showCurrentGame) {
      // query game name and provider only when on a games page
      gameName = document.querySelector('div.title-wrap > h1')?.textContent?.trim() ?? 'unknown game'
      gameProvider = document.querySelector('div.title-wrap > a')?.textContent?.trim() ?? 'unknown provider'
      presenceData.state = `Playing "${gameName}"${showGameProvider ? ` by ${gameProvider}` : ''}`
    }
  }
  else {
    presenceData.state = 'Browsing...'
  }

  // Attempt to gather wallet balance
  if (showBal) {
    const balanceText = document
      .querySelector('div.wrapper > div > button > div > div > span > span')
      ?.textContent
      ?.trim()
      .replace('&nbsp;', ' ') ?? 'Unknown'
    const isSweeps = document
      .querySelector('div.wrapper > div > button')
      ?.getAttribute('data-active-currency') === 'sweeps'
    const currency = isSweeps ? 'Stake Cash' : 'Gold Coins'

    // Conditionals regarding when to display in-play balance
    if (pathname.includes('games') && gameProvider !== 'Stake Originals') {
      presenceData.details = `Balance: (In Play) (${currency})`
    }
    else {
      presenceData.details = `Balance: ${isSweeps ? `$${balanceText}` : balanceText} (${currency})`
    }
  }

  // Modals and other pages
  if (search.includes('modal=wallet')) {
    presenceData.state = 'Checking Wallet...'
  }
  else if (search.includes('modal=vault')) {
    presenceData.state = 'Checking Vault...'
  }
  else if (search.includes('modal=vip')) {
    presenceData.state = 'Checking VIP Progress...'
  }
  else if (search.includes('modal=user')) {
    presenceData.state = 'Checking Statistics...'
  }
  else if (pathname.includes('/transactions/')) {
    presenceData.state = 'Viewing Transactions...'
  }
  else if (pathname.includes('/settings/')) {
    presenceData.state = 'Adjusting Settings...'
  }

  presenceData.stateUrl = document.location.href
  presence.setActivity(presenceData)
})
