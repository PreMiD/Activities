const presence = new Presence({
  clientId: '1502609457807364203', // You must enter this yourself
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/F/Faucet%20Crypto/assets/logo.jpeg',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const { pathname, hostname } = document.location
  // Status page
  if (hostname === 'status.faucetcrypto.com') {
    presenceData.details = 'Viewing Status Page'
    const mainStatus = document.querySelector('h1')?.textContent?.trim()
      || document.querySelector('.status')?.textContent?.trim()

    if (mainStatus?.toLowerCase().includes('all services are online')) {
      presenceData.state = '✅ All services operational'
    }
    else if (mainStatus?.toLowerCase().includes('degraded') || mainStatus?.toLowerCase().includes('outage')) {
      presenceData.state = '⚠️ Some services affected'
    }
    else {
      presenceData.state = 'Checking system status'
    }

    return presence.setActivity(presenceData)
  }

  // Knowledge base page
  if (hostname === 'knowledge-base.faucetcrypto.com') {
    presenceData.details = 'Reading Knowledge base'
    const title = document.querySelector('h1')?.textContent?.trim()
    if (title)
      presenceData.state = title
    return presence.setActivity(presenceData)
  }

  // Main site
  if (hostname !== 'faucetcrypto.com') {
    presenceData.details = 'Browsing FaucetCrypto'
    return presence.setActivity(presenceData)
  }

  // Home
  if (pathname === '/') {
    presenceData.details = 'Viewing Homepage'
    presenceData.state = 'Discovering ways to earn crypto'
  }

  // PTC
  else if (pathname.includes('/ptc')) {
    presenceData.details = 'Viewing PTC'
    const ptcItem = Array.from(document.querySelectorAll('a')).find(
      el => el.textContent?.toLowerCase().includes('ptc')
        || el.getAttribute('aria-label')?.includes('ptc'),
    )
    const query = ptcItem?.textContent?.trim() || ''
    const numberOnly = query.replace(/\D/g, '')
    presenceData.state = `${numberOnly} available`
  }
  // Shortlinks
  else if (pathname.includes('/shortlinks')) {
    presenceData.details = 'Solving Shortlinks'
    const shortlinksItem = Array.from(document.querySelectorAll('a')).find(
      el => el.textContent?.toLowerCase().includes('shortlinks')
        || el.getAttribute('aria-label')?.includes('shortlinks'),
    )
    const query = shortlinksItem?.textContent?.trim() || ''
    const numberOnly = query.replace(/\D/g, '')
    presenceData.state = `${numberOnly} available`
  }
  // Surveys
  else if (pathname.includes('/surveys')) {
    presenceData.details = 'Viewing Surveys'
    const surveysItem = Array.from(document.querySelectorAll('a')).find(
      el => el.textContent?.toLowerCase().includes('surveys')
        || el.getAttribute('aria-label')?.includes('surveys'),
    )
    const query = surveysItem?.textContent?.trim() || ''
    const numberOnly = query.replace(/\D/g, '')
    presenceData.state = `${numberOnly} available`
  }
  // Offers
  else if (pathname.includes('/offers')) {
    presenceData.details = 'Viewing Offers'
    const offersItem = Array.from(document.querySelectorAll('a')).find(
      el => el.textContent?.toLowerCase().includes('offers')
        || el.getAttribute('aria-label')?.includes('offers'),
    )
    const query = offersItem?.textContent?.trim() || ''
    const numberOnly = query.replace(/\D/g, '')
    presenceData.state = `${numberOnly} available`
  }
  // Offerwalls
  else if (pathname.includes('/offerwall')) {
    presenceData.details = 'Viewing Offerwalls'
  }
  // Challenges
  else if (pathname.includes('/challenge')) {
    presenceData.details = 'Viewing Challenges'
    const allH3Elements = document.querySelectorAll('h3')

    // Counter for elements containing "100.00%"
    let completedCount = 0
    allH3Elements.forEach((h3) => {
      const text = h3.textContent?.trim()
      // Check if this h3 contains exactly "100.00%"
      if (text && text.includes('100.00%')) {
        completedCount++
      }
    })
    presenceData.state = `${completedCount} completed`
  }
  // Contests
  else if (pathname.includes('/contest')) {
    presenceData.details = 'Viewing Contests'
    const contestsItem = Array.from(document.querySelectorAll('a')).find(
      el => el.textContent?.toLowerCase().includes('contests')
        || el.getAttribute('aria-label')?.includes('contests'),
    )
    const query = contestsItem?.textContent?.trim() || ''
    const numberOnly = query.replace(/\D/g, '')
    presenceData.state = `${numberOnly} available`
  }
  // Market
  else if (pathname.includes('/market')) {
    presenceData.details = 'Viewing Market'
  }
  // News feed
  else if (pathname.includes('/blog') || pathname.includes('/news-feed')) {
    presenceData.details = 'Reading News feed'
    const title = document.querySelector('h1')?.textContent?.trim()
    if (title)
      presenceData.state = title
  }
  // Withdraw
  else if (pathname.includes('/withdraw')) {
    presenceData.details = 'Making a Withdrawal'
  }
  // Referrals
  else if (pathname.includes('/referral')) {
    presenceData.details = 'Viewing Referrals'
  }
  // Cryptocurrencies list
  else if (pathname.includes('/cryptocurrencies')) {
    presenceData.details = 'Viewing Supported Coins'
    presenceData.state = '24 cryptocurrencies available'
  }
  // Profile
  else if (pathname.includes('/profile')) {
    presenceData.details = 'Viewing Profile'
  }
  // Login
  else if (pathname.includes('/login')) {
    presenceData.details = 'Logging In'
  }
  // Register
  else if (pathname.includes('/register')) {
    presenceData.details = 'Creating an Account'
  }
  // Support
  else if (pathname.includes('/support')) {
    presenceData.details = 'Viewing Support Center'
  }
  // Dashboard
  else if (pathname.includes('/dashboard')) {
    presenceData.details = 'Viewing Dashboard'
  }
  // Default fallback
  else {
    presenceData.details = 'Browsing FaucetCrypto'
  }
  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
