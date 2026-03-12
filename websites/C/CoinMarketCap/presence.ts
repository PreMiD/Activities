const presence = new Presence({
  clientId: '907692817604833281',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/CoinMarketCap/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const path = document.location.pathname
  if (path === '/') {
    presenceData.details = 'Browsing...'
  }
  else if (path.includes('/portfolio-tracker/')) {
    presenceData.details = 'Looking at Portfolio'
  }
  else if (path.includes('/settings/')) {
    presenceData.details = 'Checking account settings'
  }
  else if (path.includes('/currencies/')) {
    presenceData.details = 'Checking prices for:'

    presenceData.state = document.querySelector(
      '#__next > div.bywovg-1.kkDbhJ > div > div.sc-57oli2-0.comDeo.cmc-body-wrapper > div > div.sc-16r8icm-0.eMxKgr.container > div.n78udj-0.jskEGI > div > div.sc-16r8icm-0.kDzKwW.nameSection > div.sc-16r8icm-0.gpRPnR.nameHeader > h2',
    )?.textContent
  }
  else if (path.includes('/rankings/exchanges/')) {
    presenceData.details = 'Looking at top cryptocurrency spot exchanges'
  }
  else if (path.includes('/rankings/exchanges/derivatives/')) {
    presenceData.details = 'Looking at top cryptocurrency derivatives exchanges'
  }
  else if (path.includes('/rankings/exchanges/dex/')) {
    presenceData.details = 'Looking at top cryptocurrency decentralized exchanges'
  }
  else if (path.includes('/how-to-buy-bitcoin/')) {
    presenceData.details = 'Checking out how to buy bitcoin'
  }
  else if (path.includes('/nft/collections/')) {
    presenceData.details = 'Looking at NFT top collections'
  }
  else if (path.includes('/nft/upcoming/')) {
    presenceData.details = 'Looking at upcoming NFT sales'
  }
  else if (path.includes('/ico-calendar/')) {
    presenceData.details = 'Checking the ICO calendar'
  }
  else if (path.includes('/polkadot-parachains/kusama/')) {
    presenceData.details = 'Checking all Kusama PLO Parachain slot auctions'
  }
  else if (path.includes('/events/')) {
    presenceData.details = 'Browsing in crypto events calendar'
  }
  else if (path.includes('/account/my-diamonds/')) {
    presenceData.details = 'Checking diamonds:'

    presenceData.state = document.querySelector(
      '#__next > div > div > div.sc-57oli2-0.comDeo.cmc-body-wrapper > div > div > div > div:nth-child(2) > div > div.sc-1snuar3-1.hyjDAL > div.sc-1snuar3-2.gqljHA > h1 > span',
    )?.textContent
  }
  else if (path.includes('/nft/')) {
    presenceData.details = 'Browsing NFTs...'
  }
  else if (path.includes('/watchlist/')) {
    presenceData.details = 'Browsing watchlist...'
  }
  else if (path.includes('/airdrop/')) {
    presenceData.details = 'Looking at Airdrop'
  }
  else if (path.includes('/referral/')) {
    presenceData.details = 'Checking out the referral program'
  }
  else if (path.includes('/api/')) {
    presenceData.details = 'Browsing API page...'
  }
  else if (path.includes('/indices/')) {
    presenceData.details = 'Checking indices...'
  }
  else if (path.includes('/sitemap/cryptocurrencies/')) {
    presenceData.details = 'Browsing sitemap...'
  }
  else if (path.includes('/new/')) {
    presenceData.details = 'Checking out new Cryptocurrencies'
  }
  else if (path.includes('/charts/')) {
    presenceData.details = 'Viewing global cryptocurrency charts'
  }
  else if (path.includes('/best-cryptos/')) {
    presenceData.details = 'Looking at the best cryptos based on the latest data'
  }
  else if (path.includes('/gainers-losers/')) {
    presenceData.details = 'Checking top crypto gainers and losers today'
  }
  else if (path.includes('/historical/')) {
    presenceData.details = 'Browsing cryptocurrency historical data snapshots'
  }
  else if (path.includes('/swap/')) {
    presenceData.details = 'Browsing on the swap page'
  }
  else if (path.includes('/converter/')) {
    presenceData.details = 'Using the converter...'
  }
  else if (path.includes('/widget/ticker/')) {
    presenceData.details = 'Checking out the widget creator'
  }
  else if (path.includes('/newsletter/')) {
    presenceData.details = 'Signing up for the newsletter'
  }
  else if (path.includes('/about/')) {
    presenceData.details = 'Browsing about page'
  }
  else if (path.includes('/terms/')) {
    presenceData.details = 'Checking the terms of use'
  }
  else if (path.includes('/privacy/')) {
    presenceData.details = 'Reading the privacy and cookie policy'
  }
  else if (path.includes('/disclaimer/')) {
    presenceData.details = 'Reading the disclaimer'
  }
  else if (path.includes('/faq/')) {
    presenceData.details = 'Reading the FAQ'
  }
  else if (path.includes('/alexandria/glossary')) {
    presenceData.details = 'Reading the glossary'
  }
  else if (path.includes('/trending-cryptocurrencies/')) {
    presenceData.details = 'Browsing the trending cryptocurrencies'
  }

  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})
