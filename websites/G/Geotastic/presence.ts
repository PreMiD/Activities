const presence = new Presence({
  clientId: '978557181911773214',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Geotastic/assets/logo.png',
    details: 'Viewing an unsupported page',
    startTimestamp: browsingTimestamp,
  }
  const pages: Record<string, PresenceData> = {
    '/home': { details: 'Viewing the home page' },
    '/local-lobby': { details: 'Creating a local lobby' },
    '/user-challenges/find': { details: 'Browsing unplayed user challenges' },
    '/user-challenges/played': { details: 'Browsing played user challenges' },
    '/user-challenges/own': { details: 'Browsing created user challenges' },
    '/user-challenges/create': { details: 'Creating a challenge' },
    '/matchmaking-lobby': { details: 'In a matchmaking lobby' },
    '/community-map': { details: 'Viewing the community map' },
    '/squad/list': { details: 'Browsing the list of squads' },
    '/squad/management': { details: 'Viewing the squad management page' },
    '/map-editor/maps': { details: 'Creating a map' },
    '/map-editor/drop-groups': { details: 'Viewing their drop groups' },
    '/events': { details: 'Browsing past and future events' },
    '/account/profile': { details: 'Viewing their profile settings' },
    '/account/statistics': { details: 'Viewing their statistics' },
    '/account/trophies': { details: 'Viewing their trophies' },
    '/account/friends': { details: 'Viewing their friends' },
    '/account/supporter-status': {
      details: 'Viewing their supporter status',
    },
    '/account/quota-consumption': {
      details: 'Viewing their quota consumption',
    },
    '/account/account-settings': { details: 'Viewing their account settings' },
  }

  for (const [path, data] of Object.entries(pages)) {
    if (document.location.pathname.includes(path))
      presenceData = { ...presenceData, ...data } as PresenceData
  }

  switch (true) {
    case document.location.pathname.includes('/challenge-details/'):
      presenceData.details = 'Viewing a challenge'
      break
    case document.location.pathname.includes('/online-lobby/'):
      presenceData.details = 'In an online lobby'
      break
    case document.location.pathname.includes('/events/'):
      presenceData.details = 'Viewing an event'
      presenceData.state = document.querySelector('h1')?.textContent
      break
    case document.location.pathname.includes('/help-out/'):
      presenceData.details = 'Viewing ways to support Geotastic'
      break
  }

  if (
    document.location.pathname === '/play'
    || document.location.pathname.includes('/play-online/')
  ) {
    if (document.querySelector('.active-component-prepare')) {
      presenceData.details = 'Preparing for a round'
    }
    else if (document.querySelector('.active-component-play')) {
      if (document.querySelector('.side-bar')) {
        presenceData.details = 'In an online battle'
        presenceData.state = `Playing map ${
          document.querySelector('.meta-infos')?.querySelectorAll('span')[1]?.textContent
        }`
      }
      else {
        const info = document
          .querySelector('.meta-infos')
          ?.querySelectorAll('span') ?? []
        presenceData.details = `Playing map ${info[1]?.textContent}`
        presenceData.state = `${info[2]?.textContent} ${info[3]?.textContent}`
      }
    }
    else if (document.querySelector('.active-component-result')) {
      presenceData.details = document
        .querySelector('.round-info')
        ?.querySelector('span')
        ?.textContent
      presenceData.state = `Score ${
        document.querySelector('.own-score')?.textContent
      }`
    }
    else if (document.querySelector('.active-component-finished')) {
      presenceData.details = 'Round finished'
      presenceData.state = `Final score ${
        document.querySelector('.score')?.textContent
      }`
    }
    else {
      presenceData.details = 'Playing a game'
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
