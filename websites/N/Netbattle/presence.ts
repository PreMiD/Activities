const presence = new Presence({
  clientId: '1537532267759538186',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/hLiMa6j.png',
}

const MODE_NAMES: Record<string, string> = {
  ranked: 'Ranked',
  casual: 'Casual',
}

const GAME_NAMES: Record<string, string> = {
  speedrun: 'Speed-Run Troubleshooting',
  syntax: 'Syntax Sprint',
  ddos: 'DDoS Defense',
  crimp: 'Opération Câble',
  blackout: 'Blackout',
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const beacon = document.querySelector('[data-nb-state]')

  if (pathname === '/' || pathname === '') {
    const nbState = beacon?.getAttribute('data-nb-state')
    const mode = beacon?.getAttribute('data-nb-mode') ?? ''
    const game = beacon?.getAttribute('data-nb-game') ?? ''

    if (nbState === 'matchmaking') {
      presenceData.details = 'Recherche d\u2019adversaire'
      presenceData.state = `${MODE_NAMES[mode] ?? mode} - ${GAME_NAMES[game] ?? game}`
    }
    else if (nbState === 'match') {
      presenceData.details = GAME_NAMES[game] ?? 'Partie en cours'
      const opponent = document.querySelector('[data-nb-opponent]')?.getAttribute('data-nb-opponent')
      presenceData.state = opponent ? `Adversaire : ${opponent}` : (MODE_NAMES[mode] ?? 'En match')
    }
    else {
      presenceData.details = 'Browsing the main hub'
    }
  }
  else if (pathname === '/practice') {
    presenceData.details = 'Browsing training modes'
  }
  else if (pathname === '/practice/sprint') {
    presenceData.details = 'Practicing Syntax Sprint'
  }
  else if (pathname === '/practice/vlsm') {
    presenceData.details = 'Practicing VLSM addressing'
  }
  else if (pathname.startsWith('/auth/login')) {
    presenceData.details = 'Logging in'
  }
  else if (pathname.startsWith('/auth/register')) {
    presenceData.details = 'Creating an account'
  }
  else if (pathname.startsWith('/auth/reset-password')) {
    presenceData.details = 'Resetting password'
  }
  else if (pathname.startsWith('/auth/update-password')) {
    presenceData.details = 'Updating password'
  }
  else {
    presenceData.details = 'Exploring Netbattle'
  }

  presence.setActivity(presenceData)
})
