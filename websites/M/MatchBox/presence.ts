const presence = new Presence({
  clientId: '1176410975063261205',
})
presence.on('UpdateData', async () => {
  const { pathname, href } = document.location
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/MatchBox/assets/logo.png',
  }
  if (pathname === '/matchmaking') {
    const opponent = document.querySelectorAll(
      'div.v-list-item__content div.v-list-item-title',
    )[1]?.textContent
    if (document.querySelector('circle.v-progress-circular__overlay') !== null) {
      presenceData.details = 'Searching for match...'
    }
    else if (opponent) {
      const scoreParts = document.querySelectorAll('div.text-h5')
      presenceData.details = `In match against ${opponent}`
      presenceData.state = `Score: ${scoreParts[0]?.textContent} - ${scoreParts[1]?.textContent}`
    }
    else {
      presenceData.details = 'Viewing Matchmaking'
      presenceData.state = `${
        document.querySelector('div.v-card-subtitle span.text-green-lighten-2')
          ?.textContent
      } MMR`
    }
  }
  else if (pathname === '/leaderboards') {
    presenceData.details = 'Viewing MMR leaderboard'
    presenceData.state = `Page ${
      document.querySelector(
        'li.v-pagination__item--is-active span.v-btn__content',
      )?.textContent
    }`
  }
  else if (pathname.startsWith('/leaderboards/character')) {
    if (pathname === '/leaderboards/character/all') {
      presenceData.details = 'Selecting character leaderboard...'
    }
    else {
      presenceData.details = `Viewing ${
        document.querySelector('div.text-h3')?.textContent
      } leaderboard`
    }
  }
  else if (pathname.startsWith('/user')) {
    const pageURL = href.split('/')
    presenceData.details = 'Viewing profile'
    presenceData.state = `${pageURL[pageURL.length - 1]} | ${
      document
        .querySelector('div.v-list-item-subtitle')
        ?.textContent
        ?.split(' ')[0]
    } MMR`
    presenceData.buttons = [{ label: 'View Profile', url: href }]
  }
  else if (pathname === '/settings') {
    presenceData.details = 'Viewing settings'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  presence.setActivity(presenceData)
})
