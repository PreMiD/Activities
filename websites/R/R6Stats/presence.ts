const presence = new Presence({
  clientId: '812646634663837706',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/R6Stats/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (window.location.pathname.includes('/leaderboards')) {
    presenceData.details = 'Viewing Leaderboard:'

    const selects = document.querySelectorAll('select')
    const labels = []

    if (selects[0]?.selectedIndex === 0) {
      labels.push('General')
      labels.push(selects[2]!.options[selects[2]!.selectedIndex]!.label) // Stat Type
      labels.push(selects[1]!.options[selects[1]!.selectedIndex]!.label) // Platform
    }
    else {
      labels.push('Seasonal')
      labels.push(selects[4]!.options[selects[4]!.selectedIndex]!.label) // Stat Type
      labels.push(selects[2]!.options[selects[2]!.selectedIndex]!.label) // Platform
    }

    presenceData.state = labels.join(' | ')
    presenceData.buttons = [
      {
        label: 'View Leaderboard',
        url: document.location.href,
      },
    ]
  }
  else if (window.location.pathname.includes('/search')) {
    presenceData.details = 'Searching Player:'
    presenceData.state = document
      .querySelector(
        '#__layout > div > div.layout-default__content > div.container__wrapper--content > div > main > div > div.page-search__wrapper > div > div > div.page-search__results__header--left > span.page-search__results__header--light',
      )
      ?.textContent
      ?.trim()
      .slice(1, -1)
  }
  else if (window.location.pathname.includes('/stats')) {
    presenceData.details = 'Viewing Player:'
    presenceData.state = document
      .querySelector(
        '#__layout > div > div.layout-default__content > div.container__wrapper--content > div > main > div > div.player-header > div.player-header__about > div.player-header__about__meta > div.player-header__about__meta--player > div > span.player-info__player__username',
      )
      ?.textContent
      ?.trim()
    presenceData.buttons = [
      {
        label: 'View Stats',
        url: document.URL.replace('/operators', '')
          .replace('/seasons', '')
          .replace('/weapons', ''),
      },
    ]
  }
  else if (window.location.pathname.includes('/compare')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Compare Players'
  }
  else if (window.location.pathname.includes('/account')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Personal Account'
  }
  else if (window.location.pathname.includes('/privacy-policy')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Privacy Policy'
  }
  else {
    presenceData.details = 'Browsing...'
  }

  presence.setActivity(presenceData)
})
