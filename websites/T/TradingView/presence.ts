const presence = new Presence({
  clientId: '1370119629132795914',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  White = 'https://cdn.rcd.gg/PreMiD/websites/T/TradingView/assets/logo.png',
  WhiteBG = 'https://cdn.rcd.gg/PreMiD/websites/T/TradingView/assets/0.png',
  Black = 'https://cdn.rcd.gg/PreMiD/websites/T/TradingView/assets/1.png',
  BlackBG = 'https://cdn.rcd.gg/PreMiD/websites/T/TradingView/assets/2.png',
}

presence.on('UpdateData', async () => {
  const logo = await presence.getSetting<number>('logo')
  const presenceData: PresenceData = {
    largeImageKey: [ActivityAssets.White, ActivityAssets.WhiteBG, ActivityAssets.Black, ActivityAssets.BlackBG][logo] || ActivityAssets.White,
    startTimestamp: browsingTimestamp,
  }

  if (window.location.hostname.startsWith('status')) {
    presenceData.details = 'Status Page'
  }
  else if (window.location.pathname === '/') {
    presenceData.details = 'Home Page'
  }
  else if (window.location.pathname.startsWith('/markets/cryptocurrencies')) {
    presenceData.details = 'Cryptocurrency Market'
    if (window.location.pathname.includes('/ideas')) {
      presenceData.state = 'Ideas'
    }
    else if (window.location.pathname.includes('/prices-all')) {
      presenceData.state = 'Prices'
    }
    else if (window.location.pathname.includes('/prices')) {
      presenceData.state = `Prices: ${document
        .querySelector(
          '#js-category-content > header > div > div.tv-category-header__title-line > div > h1',
        )
        ?.textContent
        ?.trim()}`
    }
    else if (window.location.pathname.includes('/global-charts')) {
      presenceData.state = 'Market Cap'
    }
    else {
      presenceData.state = 'Overview'
    }
  }
  else if (window.location.pathname.startsWith('/markets/currencies')) {
    presenceData.details = 'Forex Market'
    if (window.location.pathname.includes('/ideas'))
      presenceData.state = 'Ideas'
    else if (window.location.pathname.includes('/rates-all'))
      presenceData.state = 'Rates'
    else if (window.location.pathname.includes('/rates-major'))
      presenceData.state = 'Rates: Major'
    else if (window.location.pathname.includes('/rates-minor'))
      presenceData.state = 'Rates: Minor'
    else if (window.location.pathname.includes('/rates-exotic'))
      presenceData.state = 'Rates: Exotic'
    else if (window.location.pathname.includes('/rates-americas'))
      presenceData.state = 'Rates: Americas'
    else if (window.location.pathname.includes('/rates-europe'))
      presenceData.state = 'Rates: Europe'
    else if (window.location.pathname.includes('/rates-asia'))
      presenceData.state = 'Rates: Asia'
    else if (window.location.pathname.includes('/rates-pacific'))
      presenceData.state = 'Rates: Pacific'
    else if (window.location.pathname.includes('/rates-middle-east'))
      presenceData.state = 'Rates: Middle East'
    else if (window.location.pathname.includes('/rates-africa'))
      presenceData.state = 'Rates: Africa'
    else if (window.location.pathname.includes('/cross-rates'))
      presenceData.state = 'Cross Rates'
    else if (window.location.pathname.includes('/indices'))
      presenceData.state = 'Currency Indices'
    else if (window.location.pathname.includes('/economic-calendar'))
      presenceData.state = 'Economic Calendar'
    else presenceData.state = 'Overview'
  }
  else if (window.location.pathname.startsWith('/markets/stocks')) {
    presenceData.details = document
      .querySelector(
        '#js-category-content > header > div > div.tv-category-header__title-line > div > span > span > h1',
      )
      ?.textContent
      ?.trim()
    if (window.location.pathname.includes('/ideas'))
      presenceData.state = 'Ideas'
    else if (window.location.pathname.includes('/market-movers'))
      presenceData.state = 'Market Movers'
    else if (window.location.pathname.includes('/highs-and-lows'))
      presenceData.state = 'Highs & Lows'
    else if (window.location.pathname.includes('/earnings'))
      presenceData.state = 'Earnings Calendar'
    else if (window.location.pathname.includes('/sectorandindustry'))
      presenceData.state = 'Sector & Industry'
    else presenceData.state = 'Overview'
  }
  else if (window.location.pathname.startsWith('/markets/indices')) {
    presenceData.details = 'Market Indices'
    if (window.location.pathname.includes('/ideas'))
      presenceData.state = 'Ideas'
    else if (window.location.pathname.includes('/quotes'))
      presenceData.state = 'Quotes'
    else presenceData.state = 'Overview'
  }
  else if (window.location.pathname.startsWith('/markets/futures')) {
    presenceData.details = 'Futures Market'
    if (window.location.pathname.includes('/ideas'))
      presenceData.state = 'Ideas'
    else if (window.location.pathname.includes('/quotes'))
      presenceData.state = 'Quotes'
    else presenceData.state = 'Overview'
  }
  else if (window.location.pathname.startsWith('/markets/bonds')) {
    presenceData.details = 'Bond Market'
    if (window.location.pathname.includes('/ideas'))
      presenceData.state = 'Ideas'
    else if (window.location.pathname.includes('/rates'))
      presenceData.state = 'Rates'
    else presenceData.state = 'Overview'
  }
  else if (window.location.pathname.startsWith('/markets')) {
    presenceData.details = 'Markets'
  }
  else if (window.location.pathname.startsWith('/symbols')) {
    presenceData.details = 'Viewing Market...'
    presenceData.state = document
      .querySelector(
        '#anchor-page-1 > div > div.tv-category-header__title-line > div.tv-category-header__title > h1 > div > div',
      )
      ?.textContent
      ?.trim()
  }
  else if (window.location.pathname.startsWith('/chart')) {
    presenceData.details = 'Viewing Chart...'

    // Full Interactive Chart
    const title = document
      .querySelector(
        'body > div.js-rootresizer__contents > div.layout__area--right > div > div.widgetbar-pages > div.widgetbar-pagescontent > div.widgetbar-page.active > div.widget-1UXejvkz.widgetbar-widget.widgetbar-widget-detail > div.widgetbar-widgetbody > div > div.wrapper-1CeUhfBr > div:nth-child(1) > div:nth-child(1) > span > a > span.text-H5Jbe1VB',
      )
      ?.textContent
      ?.trim()
    // Popup Chart Idea
      || document
        .querySelector(
          '#overlap-manager-root > div > div.tv-dialog__modal-wrap > div > div > div > div:nth-child(1) > div > div > div > div:nth-child(1) > div.tv-chart-view__header > div.tv-chart-view__title.selectable > div > div.tv-chart-view__title-row.tv-chart-view__title-row--symbol.tv-chart-view__symbol.js-chart-view__symbol.js-chart-view__ticker.quote-ticker-inited > a:nth-child(1)',
        )
        ?.textContent
        ?.trim()
    // Full Chart Idea Page
        || document
          .querySelector(
            'body > div.tv-main > div.tv-content > div > div > div:nth-child(1) > div.tv-chart-view__header > div.tv-chart-view__title.selectable > div > div.tv-chart-view__title-row.tv-chart-view__title-row--symbol.tv-chart-view__symbol.js-chart-view__symbol.js-chart-view__ticker.quote-ticker-inited > a:nth-child(1)',
          )
          ?.textContent
          ?.trim()

    if (title)
      presenceData.state = title
  }
  else if (window.location.pathname.startsWith('/script')) {
    presenceData.details = 'Viewing Script...'
  }
  else if (window.location.pathname.startsWith('/ideas')) {
    presenceData.details = 'Trading Ideas'
  }
  else if (window.location.pathname.startsWith('/education')) {
    presenceData.details = 'Educational Ideas'
  }
  else if (window.location.pathname.startsWith('/scripts')) {
    presenceData.details = 'Scripts'
  }
  else if (window.location.pathname.startsWith('/screener')) {
    presenceData.details = 'Stock Screener'
  }
  else if (window.location.pathname.startsWith('/forex-screener')) {
    presenceData.details = 'Forex Screener'
  }
  else if (window.location.pathname.startsWith('/crypto-screener')) {
    presenceData.details = 'Crypto Screener'
  }
  else if (window.location.pathname.startsWith('/streams')) {
    presenceData.details = 'Streams'
  }
  else if (window.location.pathname.startsWith('/broker-awards')) {
    presenceData.details = 'Broker Awards'
  }
  else if (window.location.pathname.startsWith('/brokers')) {
    presenceData.details = 'Brokers'
  }
  else if (window.location.pathname.startsWith('/broker/')) {
    presenceData.details = 'Broker Profile'
    presenceData.state = document
      .querySelector(
        '#anchor-page-1 > div > div.tv-category-header__title-line > div.tv-category-header__title > div > h1',
      )
      ?.textContent
      ?.trim()
  }
  else if (window.location.pathname.startsWith('/u/')) {
    presenceData.details = 'User Profile'
    presenceData.state = document
      .querySelector(
        '#tv-profile > div > div > div.tv-profile__name-block > span > h1',
      )
      ?.textContent
      ?.trim()
  }
  else if (window.location.pathname.startsWith('/chat')) {
    presenceData.details = 'Chatting...'
  }
  else if (window.location.pathname.startsWith('/contacts')) {
    presenceData.details = 'About'
  }
  else if (window.location.pathname.startsWith('/policies')) {
    presenceData.details = 'Terms of Use'
  }
  else if (window.location.pathname.startsWith('/privacy-policy')) {
    presenceData.details = 'Privacy Policy'
  }
  else if (window.location.pathname.startsWith('/cookies-policy')) {
    presenceData.details = 'Cookies Policy'
  }
  else if (window.location.pathname.startsWith('/disclaimer')) {
    presenceData.details = 'Disclaimer'
  }
  else if (window.location.pathname.startsWith('/moderators')) {
    presenceData.details = 'Moderators'
  }
  else if (window.location.pathname.startsWith('/people')) {
    presenceData.details = 'Top Authors'
  }
  else if (window.location.pathname.startsWith('/house-rules')) {
    presenceData.details = 'TradingView House Rules'
  }
  else if (window.location.pathname.startsWith('/blog')) {
    presenceData.details = 'TradingView Blog'
  }

  presenceData.details ??= 'Browsing...'

  presence.setActivity(presenceData)
})
