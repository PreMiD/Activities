const presences: Record<string, PresenceData> = {
  '/challenges/retired': {
    details: 'Challenges',
    state: 'Browsing retired challenges',
  },
  '/challenges/todo': {
    details: 'Challenges',
    state: 'Browsing to-do list',
  },
  '/challenges': {
    details: 'Challenges',
    state: 'Browsing active challenges',
  },
  '/login': {
    details: 'Login',
    state: 'Logging in',
  },
  '/fortresses': {
    details: 'Fortresses',
    state: 'Browsing fortresses',
  },
  '/endgames': {
    details: 'Endgames',
    state: 'Browsing endgames',
  },
  '/starting-point': {
    details: 'Starting Point',
    state: 'Browsing starting points',
  },
  '/rankings': {
    details: 'Rankings',
    state: 'Browsing rankings',
  },
  '/register': {
    details: 'Register',
    state: 'Creating new account',
  },
  '/machines/list/unreleased': {
    details: 'Machines',
    state: 'Browsing scheduled machines',
  },
  '/machines/list/active': {
    details: 'Machines',
    state: 'Browsing active machines',
  },
  '/machines/list/retired': {
    details: 'Machines',
    state: 'Browsing retired machines',
  },
  '/machines/list/todo': {
    details: 'Machines',
    state: 'Browsing machines to-do list',
  },
  '/home': {
    details: 'Homepage',
  },
  '/machines/{}': {
    details: 'Playing machine',
  },
  '/challenges/{}': {
    details: 'Playing challenge',
  },
  '/profile/overview': {
    details: 'Profile',
    state: 'Browsing profile overview',
  },
  '/profile/settings': {
    details: 'Profile',
    state: 'Changing profile settings',
  },
  '/profile/subscriptions/plans': {
    details: 'Profile',
    state: 'Browsing subscriptions',
  },
  '/users/{}': {
    details: 'Looking at profile',
  },
  '/tracks': {
    details: 'Tracks',
    state: 'Browsing tracks',
  },
}
const presence = new Presence({
  clientId: '1042105891681472595',
})

function getHomePageDetails() {
  return `${
    document
      .querySelectorAll('.text-left.font-size15.col')[0]
      ?.querySelectorAll('.color-green')[0]
      ?.textContent
  }, Rank: ${
    document.querySelectorAll('.htb-text2.font-size15.text-left.mb-0')[0]
      ?.textContent
  }`
}

function getPersonalProfileDetails() {
  return document.querySelectorAll('.htb-subtitle.greenOnHover')[0]?.textContent ?? null
}

function getMachineDetails() {
  const container = document.querySelector('.text-left.pl-8.pt-3')
  const status = document
    .querySelectorAll('.htb-label2.offline-text.text-left.pl-3')[0]
    ?.textContent
    ?.includes('offline')
    ? 'offline'
    : 'online'

  return `${container?.querySelectorAll('.d-inline-block')[0]?.textContent} (${
    container?.querySelectorAll('.d-inline-block')[1]?.textContent
  }) - ${status}`
}

function getChallengeDetails() {
  const name = document
    .querySelectorAll('.text-left.pl-8.pt-4')[0]
    ?.querySelector('.d-inline-block')
    ?.textContent

  return `${name} - ${
    document.querySelectorAll('.htb-label2.offline-text.text-left.pl-3')[0]
      ?.textContent
  }`
}

function getUserId() {
  return document.cookie
    .split(';')
    .find(item => item.includes('ajs_user_id'))
    ?.split('=')[1]
}

function executeMethod(path: string): string | null {
  switch (path) {
    case '/home':
      return getHomePageDetails()
    case '/profile/overview':
      return getPersonalProfileDetails()
    case '/machines/{}':
      return getMachineDetails()
    case '/challenges/{}':
      return getChallengeDetails()
    default:
      return null
  }
}

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {}

  for (const [path, data] of Object.entries(presences)) {
    presenceData = {
      ...presenceData,
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/HackTheBox/assets/logo.png',
      buttons: [
        {
          label: 'View Profile',
          url: `https://app.hackthebox.com/users/${getUserId()}`,
        },
      ],
    }

    if (
      document.location.pathname.includes(path)
      || new RegExp(path.replace(/\{\}/g, '.*'), 'g').test(
        document.location.pathname,
      )
    ) {
      presenceData = {
        ...presenceData,
        ...data,
        ...(!data.state
          && (path.includes('{}') || path === '/home') && {
          state: executeMethod(path),
        }),
      }

      break
    }
  }

  presence.setActivity(presenceData)
})
