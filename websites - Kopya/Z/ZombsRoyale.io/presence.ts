const presence = new Presence({
  clientId: '845354103118364672',
})

let matchStart: number | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Z/ZombsRoyale.io/assets/logo.png',
  }
  const currentGameState = await getPageletiable('game.currentGameState')

  switch (currentGameState) {
    case 'loading':
    case 'UiLoadingOverlay': {
      presenceData.details = 'Loading...'
      break
    }
    case 'MainMenu': {
      presenceData.details = 'Lurking in main menu'
      break
    }
    case 'Cosmetics':
    case 'UiCosmeticSelectorOverlay': {
      presenceData.details = 'Viewing cosmetics'
      break
    }
    case 'Profile': {
      presenceData.details = 'Viewing their profile'
      break
    }
    case 'Shop':
    case 'UiPreviewPackOverlay': {
      presenceData.details = 'Browsing Shop'
      break
    }
    case 'Friends':
    case 'UiFriendAddOverlay': {
      presenceData.details = 'Viewing their friends'
      break
    }
    case 'Leaderboards': {
      presenceData.details = 'Browsing leaderboards'
      break
    }
    case 'UiLoginOverlay': {
      presenceData.details = 'Loging in'
      break
    }
    case 'UiSettingsOverlay': {
      presenceData.details = 'Changing settings'
      break
    }
    case 'UiSeasonPurchaseOverlay': {
      presenceData.details = 'Buying a Battle Pass'
      break
    }
    default:
      if (
        currentGameState.startsWith('UiSeason')
        || currentGameState === 'UiPreviewItemOverlay'
      ) {
        presenceData.details = 'Viewing Battle Pass'
      }
      else {
        switch (currentGameState) {
          case 'UiChallengesOverlay': {
            presenceData.details = 'Viewing challenges'
            break
          }
          case 'UiBuyGemsOverlay': {
            presenceData.details = 'Buying gems'
            break
          }
          case 'VideoAd': {
            presenceData.details = 'Watching video ad'
            break
          }
          case 'Countdown':
          case 'Lobby': {
            presenceData.details = 'In Lobby'
            presenceData.state = 'Waiting for game to start'

            break
          }
          case 'Game':
          case 'UiReportPlayerOverlay':
          case 'UiLeaveOverlay': {
            presenceData.details = 'In Game'
            break
          }
          case 'Plane': {
            presenceData.details = 'In Game'
            presenceData.state = 'Flying plane'

            break
          }
          case 'Parachute': {
            presenceData.details = 'In Game'
            presenceData.state = 'Parachuting'

            break
          }
          case 'Dead':
          case 'UiGameOver':
          case 'UiSpectator':
          case 'UiFeedbackOverlay': {
            presenceData.details = 'In Game'
            presenceData.state = 'Dead'

            break
          }
          case 'UiMapOverlay': {
            presenceData.details = 'In Game'
            presenceData.state = 'Viewing map'

            break
          }
          default:
            presence.error(`Unknown state: ${currentGameState}`)
        }
      }
  }

  const playing = presenceData.details === 'In Game' || presenceData.details === 'In Lobby'

  if (playing && !matchStart)
    matchStart = Math.floor(Date.now() / 1000)
  else if (!playing && matchStart)
    matchStart = null

  presenceData.startTimestamp = matchStart

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

function getPageletiable(js: string): Promise<string> {
  const eventName = 'PreMiD_ZombsRoyale_Pageletiable'

  return new Promise<string>((resolve) => {
    const script = document.createElement('script')
    const _listener = (data: Event) => {
      script.remove()
      resolve(JSON.parse((data as CustomEvent).detail))
      window.removeEventListener(eventName, _listener, true)
    }

    window.addEventListener(eventName, _listener)
    script.id = eventName
    script.appendChild(
      document.createTextNode(`
        var pmdPL = new CustomEvent("${eventName}", {detail: JSON.stringify(${js})});
        window.dispatchEvent(pmdPL);
      `),
    );

    (document.body || document.head || document.documentElement).appendChild(
      script,
    )
  })
}
