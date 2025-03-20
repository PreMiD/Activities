const presence = new Presence({
  clientId: '807591728759570453',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/Binance/assets/logo.png',
    startTimestamp: browsingTimestamp,
    details: 'Viewing Page:',
  }

  if (window.location.hostname === 'www.binance.com') {
    if (window.location.pathname.includes('/markets')) {
      presenceData.state = 'Markets'
    }
    else if (window.location.pathname.includes('/my/dashboard')) {
      presenceData.state = 'Dashboard'
    }
    else if (window.location.pathname.includes('/my/payment')) {
      presenceData.state = 'Payment'
    }
    else if (window.location.pathname.includes('/my/security')) {
      presenceData.state = 'Security'
    }
    else if (window.location.pathname.includes('/my/coupon')) {
      presenceData.state = 'Reward Center'
    }
    else if (window.location.pathname.includes('/my/task')) {
      presenceData.state = 'Task Center'
    }
    else if (window.location.pathname.includes('/my/settings')) {
      presenceData.state = 'Settings'
    }
    else if (window.location.pathname.includes('/activity/referral')) {
      presenceData.state = 'Referral'
    }
    else if (window.location.pathname.includes('/my/wallet/account/main')) {
      presenceData.state = 'Main Wallet'
    }
    else if (window.location.pathname.includes('/my/wallet/account/margin')) {
      presenceData.state = 'Margin Wallet'
    }
    else if (window.location.pathname.includes('/my/wallet/account/futures')) {
      presenceData.state = 'Futures Wallet'
    }
    else if (window.location.pathname.includes('/my/wallet/account/c2c')) {
      presenceData.state = 'P2P Wallet'
    }
    else if (window.location.pathname.includes('/my/wallet/account/saving')) {
      presenceData.state = 'Earn Wallet'
    }
    else if (window.location.pathname.includes('/my/wallet/account/mining')) {
      presenceData.state = 'Pool Wallet'
    }
    else if (window.location.pathname.includes('/my/wallet')) {
      presenceData.state = 'Wallet'
    }
    else if (window.location.pathname.includes('/pos')) {
      presenceData.state = 'Locked Staking'
    }
    else if (window.location.pathname.includes('/defi-staking')) {
      presenceData.state = 'DeFi Staking'
    }
    else if (window.location.pathname.includes('/broker')) {
      presenceData.state = 'Broker'
    }
    else if (window.location.pathname.includes('/about')) {
      presenceData.state = 'About'
    }
    else if (window.location.pathname.includes('/career')) {
      presenceData.state = 'Binance Careers'
    }
    else if (window.location.pathname.includes('/press')) {
      presenceData.state = 'Binance Press Center'
    }
    else if (window.location.pathname.includes('/community')) {
      presenceData.state = 'Binance Community'
    }
    else if (window.location.pathname.includes('/earn')) {
      presenceData.state = 'Binance Earn'
    }
    else if (window.location.pathname.includes('/blog')) {
      presenceData.state = 'Binance Blog'
    }
    else if (window.location.pathname.includes('/support')) {
      presenceData.state = 'Binance Support'
    }
    else if (window.location.pathname.includes('/terms')) {
      presenceData.state = 'Terms of Use'
    }
    else if (window.location.pathname.includes('/privacy')) {
      presenceData.state = 'Privacy Policy'
    }
    else if (window.location.pathname.includes('/leveraged-tokens')) {
      presenceData.state = 'Leveraged Tokens'
    }
    else if (window.location.pathname.includes('/loan')) {
      presenceData.state = 'Crypto Loans'
    }
    else if (window.location.pathname.includes('/stock-token/trade')) {
      presenceData.details = 'Trading Stock Tokens:'
      presenceData.state = document
        .querySelector('div.css-vurnku > h1')
        ?.textContent
        ?.trim()
    }
    else if (window.location.pathname.includes('/stock-token')) {
      presenceData.state = 'Stock Tokens'
    }
    else if (window.location.pathname.includes('/swap/liquidity')) {
      presenceData.state = 'Liquid Swap'
    }
    else if (window.location.pathname.includes('/futuresng-activity/battle')) {
      presenceData.state = 'Futures Battle'
    }
    else if (
      window.location.pathname.includes('/futuresng-activity/leaderboard')
    ) {
      presenceData.state = 'Futures Leaderboard'
    }
    else if (window.location.pathname.includes('/multipleChart')) {
      presenceData.details = 'Viewing Charts...'
    }
    else if (window.location.pathname.includes('/convert')) {
      presenceData.details = 'Converting Crypto:'
      presenceData.state = `${document
        .querySelectorAll('div.css-9wgib6')[0]
        ?.textContent
        ?.trim()} to ${document
        .querySelectorAll('div.css-9wgib6')[1]
        ?.textContent
        ?.trim()}`
    }
    else if (window.location.pathname.includes('/trade')) {
      const tradeLeverage = document
        .querySelector('div.css-t7ggbb > span')
        ?.textContent
        ?.trim()

      switch (new URLSearchParams(window.location.search).get('type')) {
        case 'spot':
          presenceData.details = 'Trading on Spot:'
          break
        case 'isolated':
          presenceData.details = `Trading on Isolated ${tradeLeverage}:`
          break
        case 'cross':
          presenceData.details = `Trading on Cross ${tradeLeverage}:`
          break
        default:
          presenceData.details = 'Trading:'
          break
      }

      presenceData.state = document
        .querySelector('div.css-t7ggbb > div.css-mzoqhr > h1')
        ?.textContent
        ?.trim()
    }
    else if (
      window.location.pathname.includes('/futures')
      || window.location.pathname.includes('/delivery')
    ) {
      presenceData.details = `Futures Trading on ${document
        .querySelector('div.css-1kk0gzs > a:nth-child(2)')
        ?.textContent
        ?.trim()}:`
      presenceData.state = `${document
        .querySelector('div.css-1wd9czp > h1')
        ?.textContent
        ?.trim()} ${document
        .querySelector('div.css-1wd9czp > div > h1')
        ?.textContent
        ?.trim()}`
    }
    else {
      presenceData.details = 'Browsing...'
    }
  }
  else if (window.location.hostname.startsWith('voptions')) {
    presenceData.state = 'Vanilla Options'
  }
  else if (window.location.hostname.startsWith('cloud')) {
    presenceData.state = 'Binance Cloud'
  }
  else if (window.location.hostname.startsWith('pool')) {
    presenceData.state = 'Binance Pool'
  }
  else if (window.location.hostname.startsWith('academy')) {
    presenceData.state = 'Binance Academy'
  }
  else if (window.location.hostname.startsWith('launchpad')) {
    presenceData.state = 'Binance Launchpad'
  }
  else if (window.location.hostname.startsWith('research')) {
    presenceData.state = 'Binance Research'
  }
  else {
    presenceData.details = 'Browsing...'
  }

  presence.setActivity(presenceData)
})
