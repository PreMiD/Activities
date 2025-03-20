const presence = new Presence({
  clientId: '1030599970551771266',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const [showBal, showTimestamp, showCurrentGame] = await Promise.all([
    presence.getSetting<boolean>('showBal'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showCurrentGame'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Stake/assets/logo.png',
  }
  const { pathname, search } = window.location

  if (showTimestamp)
    presenceData.startTimestamp = browsingTimestamp

  if (pathname.includes('casino') && !pathname.includes('games')) {
    if (pathname.includes('group')) {
      presenceData.state = `Browsing ${pathname
        .split('/group/')
        .pop()
        ?.replaceAll('-', ' ')
        .replace(/(^\w)|(\s+\w)/g, letter => letter.toUpperCase())}...`
    }
    else {
      presenceData.state = 'Browsing Casino...'
    }
  }
  else if (pathname.includes('games')) {
    if (showCurrentGame) {
      presenceData.state = `Playing ${document
        .querySelector('div.title-wrap > h1')
        ?.textContent
        ?.trim()}`
    }
  }
  else if (pathname.includes('sports')) {
    presenceData.state = 'Browsing Sports...'
  }
  else {
    presenceData.state = 'Browsing...'
  }

  if (showBal) {
    const balance = document
      .querySelector('div.currency > span.content > span > span')
      ?.textContent
      ?.trim()
      .replace('&nbsp;', ' ')
    const currency = document
      .querySelector('div.currency > span.variant-subtle')
      ?.getAttribute('title')
      ?.toUpperCase()

    if (pathname.includes('games'))
      presenceData.details = 'Balance: (In Game)'
    else if (!pathname.includes('games') && balance?.includes(','))
      presenceData.details = `Balance: ${balance} (${currency})`
    else presenceData.details = `Balance: ${balance} ${currency}`

    if (search.includes('modal=wallet'))
      presenceData.state = 'Checking Wallet...'
    else if (search.includes('modal=vault'))
      presenceData.state = 'Checking Vault...'
    else if (search.includes('modal=vip'))
      presenceData.state = 'Checking VIP Progress...'
    else if (search.includes('modal=user'))
      presenceData.state = 'Checking Statistics...'
    else if (pathname.includes('/transactions/'))
      presenceData.state = 'Viewing Transactions...'
    else if (pathname.includes('/settings/'))
      presenceData.state = 'Adjusting Settings...'
  }

  presence.setActivity(presenceData)
})
