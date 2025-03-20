// functions
interface DexTokenInfo {
  name: string
  symbol: string
  price: number
  chainId: string
  thumbnail: string
  chainSymbol: string
}

const tokenCache: Map<string, DexTokenInfo> = new Map()

async function getTokenInfo(
  tokenAddress: string,
  chainId: string,
): Promise<DexTokenInfo | null> {
  const cacheKey = `${chainId}-${tokenAddress}`
  if (tokenCache.has(cacheKey))
    return tokenCache.get(cacheKey) || null

  const fetchTokenInfo = async () => {
    let response = await fetch(
      `https://api.dexscreener.com/latest/dex/pairs/${chainId}/${tokenAddress}`,
    )
    let data = await response.json()

    if (!data.pairs || data.pairs.length === 0) {
      response = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
      )
      data = await response.json()
    }

    if (data && data.pairs && data.pairs.length > 0) {
      const pair = data.pairs[0]
      const getTitlePrice = () => {
        const priceMatch = document.title.match(/\$([0-9.]+)/)
        return priceMatch?.[1] ? Number.parseFloat(priceMatch[1]) : 0
      }
      let price = getTitlePrice()
      // price get from title instead of API, for efficiency
      const tokenInfo = {
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        price,
        chainId: pair.chainId,
        thumbnail: pair.info.imageUrl,
        chainSymbol: pair.quoteToken.symbol,
      }
      tokenCache.set(cacheKey, tokenInfo)

      // Update price periodically based on title changes
      setInterval(() => {
        const newPrice = getTitlePrice()
        if (newPrice !== price) {
          tokenInfo.price = newPrice
          price = newPrice
        }
      }, 10000)
      return tokenInfo
    }
    return null
  }
  return await fetchTokenInfo()
}

function capitalize(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const presence = new Presence({
  clientId: '1326168769403289683',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/D/DEX%20Screener/assets/logo.jpeg',
}

const chainLogo = {
  ethereum: 'https://cdn.rcd.gg/PreMiD/websites/D/DEX%20Screener/assets/0.png',
  bsc: 'https://cdn.rcd.gg/PreMiD/websites/D/DEX%20Screener/assets/1.png',
  solana: 'https://cdn.rcd.gg/PreMiD/websites/D/DEX%20Screener/assets/2.png',
  base: 'https://cdn.rcd.gg/PreMiD/websites/D/DEX%20Screener/assets/3.png',
  sui: 'https://cdn.rcd.gg/PreMiD/websites/D/DEX%20Screener/assets/4.png',
  aptos: 'https://cdn.rcd.gg/PreMiD/websites/D/DEX%20Screener/assets/5.png',
  arbitrum: 'https://cdn.rcd.gg/PreMiD/websites/D/DEX%20Screener/assets/6.png',
  avalanche: 'https://cdn.rcd.gg/PreMiD/websites/D/DEX%20Screener/assets/7.png',
  cronos: 'https://cdn.rcd.gg/PreMiD/websites/D/DEX%20Screener/assets/8.png',
  fantom: 'https://cdn.rcd.gg/PreMiD/websites/D/DEX%20Screener/assets/9.png',
  hyperliquid: 'https://cdn.rcd.gg/PreMiD/websites/D/DEX%20Screener/assets/10.png',
  ink: 'https://cdn.rcd.gg/PreMiD/websites/D/DEX%20Screener/assets/11.png',
  linea: 'https://cdn.rcd.gg/PreMiD/websites/D/DEX%20Screener/assets/12.png',
  optimism: 'https://cdn.rcd.gg/PreMiD/websites/D/DEX%20Screener/assets/13.png',
  osmosis: 'https://cdn.rcd.gg/PreMiD/websites/D/DEX%20Screener/assets/14.png',
  polygon: 'https://cdn.rcd.gg/PreMiD/websites/D/DEX%20Screener/assets/15.png',
  zksync: 'https://cdn.rcd.gg/PreMiD/websites/D/DEX%20Screener/assets/16.png',
}

presence.on('UpdateData', async () => {
  let details: string | undefined
  let state: string | undefined
  let presenceData: PresenceData
  let tokenInfo: DexTokenInfo | null = null
  let urlToken: string | undefined
  let query
  const path = document.location.pathname
  switch (true) {
    case path === '/':
      details = 'Home Page'
      state = 'Browsing'
      break
    case path.startsWith('/watchlist'):
      details = 'Watchlist'
      break
    case path.startsWith('/multicharts'):
      details = 'Looking at Multi Charts'
      break
    case path.startsWith('/new-pairs'):
      details = 'New Pairs'
      state = 'Browsing'
      break
    case path.startsWith('/gainers'):
      details = 'Gainers and Losers'
      state = 'Browsing'
      break
    case path.startsWith('/portfolio'):
      details = 'Looking at Portfolio'
      break
    case path.startsWith('/moonshot'):
      details = 'Moonshot'
      state = 'Browsing'
      break
    case path.startsWith('/search'):
      query = new URLSearchParams(document.location.search).get('q') || '-'
      if (query !== '-') {
        details = 'Searching for:'
        state = `${query}`
      }
      else {
        details = 'Searching tokens'
      }
      break
    default: {
      const pathParts = path.split('/')
      if (pathParts.length === 2) {
        details = `Browsing ${capitalize(pathParts[1]!)} tokens`
        const smallImageKey = new Map(Object.entries(chainLogo)).get(pathParts[1]!)
          || `https://dd.dexscreener.com/ds-data/chains/${pathParts[1]}.png`
        presenceData = {
          details,
          largeImageKey: ActivityAssets.Logo,
          smallImageKey,
          startTimestamp: browsingTimestamp,
        }
        presence.setActivity(presenceData)
        return
      }
      else if (pathParts.length >= 3) {
        const chainId = pathParts[1]!
        const tokenAddress = pathParts[2]!
        tokenInfo = await getTokenInfo(
          decodeURIComponent(tokenAddress),
          chainId,
        )

        if (tokenInfo) {
          urlToken = `https://dexscreener.com/${chainId}/${tokenAddress}`
          details = `(${tokenInfo.symbol}/${tokenInfo.chainSymbol}) ${tokenInfo.name}`
          state = `$${tokenInfo.price}`
          presenceData = {
            details,
            state,
            largeImageKey: tokenInfo.thumbnail,
            smallImageKey: ActivityAssets.Logo,
            startTimestamp: browsingTimestamp,
            buttons: [
              {
                label: 'View Token',
                url: urlToken,
              },
            ],
          }
          presence.setActivity(presenceData)
          return
        }
      }
    }
  }

  if (details) {
    presenceData = {
      details,
      state,
      largeImageKey: ActivityAssets.Logo,
      startTimestamp: browsingTimestamp,
    }
    presence.setActivity(presenceData)
  }
})
