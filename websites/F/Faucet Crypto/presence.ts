const presence = new Presence({
  clientId: '1502609457807364203', // You must enter this yourself
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/37tBbHi.jpeg',
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

    // Check main status
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
  // Main site
  if (hostname !== 'faucetcrypto.com') {
    presenceData.details = 'Browsing FaucetCrypto'
    return presence.setActivity(presenceData)
  }

  if (pathname === '/dashboard' || pathname.includes('/faucet-claim')) {
    presenceData.details = 'Faucet Claim'

    // Targets the button inside the mt-2 div
    const claimButton = document.querySelector(
      'div.mt-2 button[data-slot="base"], button[data-slot="base"]',
    ) as HTMLButtonElement | null

    if (claimButton) {
      const rawText = claimButton.textContent || ''
      const buttonText = rawText
      const isDisabled = claimButton.disabled === true

      if (isDisabled && (buttonText.includes('m') || buttonText.includes('s'))) {
      // Cooldown active => shows timer like "00m 00s"
        presenceData.state = `⏳ Next claim in: ${buttonText}`
      }
      else if (!isDisabled) {
      // Button is enabled
        presenceData.state = '✅ Ready to Claim!'
      }
    }
  }
  // Home
  if (pathname === '/') {
    presenceData.details = 'Viewing Homepage'
    presenceData.state = 'Discovering ways to earn crypto'
  }
  // PTC
  else if (pathname.includes('/ptc')) {
    presenceData.details = 'Viewing PTC Ads'
  }
  // Shortlinks
  else if (pathname.includes('/shortlinks')) {
    presenceData.details = 'Solving Shortlinks'
  }
  // Offerwalls
  else if (pathname.includes('/offerwall')) {
    presenceData.details = 'Viewing Offerwalls'
  }
  // Challenge
  else if (pathname.includes('/challenge')) {
    presenceData.details = 'Viewing Challenge'
  }
  // Contests
  else if (pathname.includes('/contest')) {
    presenceData.details = 'Viewing Contests'
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
