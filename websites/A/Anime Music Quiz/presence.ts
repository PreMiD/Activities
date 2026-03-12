import { Assets } from 'premid'

const presence = new Presence({
  clientId: '691494438349832227',
})

let lobbyNumber,
  lobbyName,
  timeRemainingBR,
  totalRoundNumber,
  actualRoundNumber,
  animeName,
  timeRemaining

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/Anime%20Music%20Quiz/assets/logo.png',
  Lobby = 'https://cdn.rcd.gg/PreMiD/websites/A/Anime%20Music%20Quiz/assets/0.png',
  Room = 'https://cdn.rcd.gg/PreMiD/websites/A/Anime%20Music%20Quiz/assets/1.png',
  Btr = 'https://cdn.rcd.gg/PreMiD/websites/A/Anime%20Music%20Quiz/assets/2.png',
  Headset = 'https://cdn.rcd.gg/PreMiD/websites/A/Anime%20Music%20Quiz/assets/3.png',
  Gamepad = 'https://cdn.rcd.gg/PreMiD/websites/A/Anime%20Music%20Quiz/assets/4.png',
  Menu = 'https://cdn.rcd.gg/PreMiD/websites/A/Anime%20Music%20Quiz/assets/5.png',
  Info = 'https://cdn.rcd.gg/PreMiD/websites/A/Anime%20Music%20Quiz/assets/6.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }
  if (!navigator.language.includes('it-IT')) {
    // English
    if (document.location.pathname === '/') {
      if (document.querySelector('#gameChatPage')) {
        if (
          document.querySelector('#roomBrowserPage')?.className
          !== 'gamePage text-center hidden'
        ) {
          lobbyNumber = document.querySelector('#rbTotalGameCount')?.textContent
          presenceData.smallImageKey = Assets.Search
          presenceData.smallImageText = `Rooms count: ${lobbyNumber}`
          presenceData.details = 'Browsing the game rooms'
          presence.setActivity(presenceData)
        }
        else if (
          document.querySelector('#gameChatPage')?.className === 'gamePage'
        ) {
          if (
            document.querySelector('#lobbyPage')?.className === 'text-center'
          ) {
            lobbyName = document.querySelector('#lobbyRoomName')?.textContent
            presenceData.smallImageKey = ActivityAssets.Room
            presenceData.smallImageText = `Room: ${lobbyName}`
            presenceData.details = 'In the room:'
            presenceData.state = lobbyName
            presence.setActivity(presenceData)
          }
          else if (
            document.querySelector('#battleRoyalPage')?.className
            === 'text-center'
          ) {
            timeRemainingBR = document.querySelector('#brTimeLeft')?.textContent
            presenceData.smallImageKey = ActivityAssets.Btr
            presenceData.smallImageText = `Time remaining: ${timeRemainingBR}`
            presenceData.details = 'Choosing songs for'
            presenceData.state = 'battle royale mode'
            presence.setActivity(presenceData)
          }
          else {
            totalRoundNumber = document
              .querySelector('#qpCounter')
              ?.textContent
              ?.replace('/', ' of ')
            actualRoundNumber = document
              .querySelector('#qpCounter')
              ?.textContent
              ?.split('/')[0]
              ?.trim()
            if (
              document.querySelector('#qpAnimeNameHider')?.className
              === 'center-text qpAnimeNameContainer hide'
            ) {
              animeName = document.querySelector('#qpAnimeName')?.textContent
              presenceData.smallImageKey = ActivityAssets.Headset
              presenceData.smallImageText = `Song from: ${animeName}`
              presenceData.details = `Round ${actualRoundNumber} ended`
              presenceData.state = `Song from: ${animeName}`
              presence.setActivity(presenceData)
            }
            else if (
              document
                .querySelector('#qpHiderText')
                ?.textContent
                ?.startsWith('Loading')
            ) {
              presenceData.smallImageKey = ActivityAssets.Gamepad
              presenceData.smallImageText = 'Loading...'
              presenceData.details = 'The game is beginning'
              presenceData.state = 'Loading...'
              presence.setActivity(presenceData)
            }
            else if (
              document.querySelector('#qpHiderText')?.textContent === 'Answers'
            ) {
              presenceData.smallImageKey = ActivityAssets.Gamepad
              presenceData.smallImageText = 'Waiting for the results...'
              presenceData.details = `Round ${actualRoundNumber} ended`
              presenceData.state = 'Waiting for the results...'
              presence.setActivity(presenceData)
            }
            else {
              timeRemaining = document.querySelector('#qpHiderText')?.textContent
              presenceData.smallImageKey = ActivityAssets.Gamepad
              presenceData.smallImageText = `Round: ${actualRoundNumber}｜Countdown: ${timeRemaining}`
              presenceData.details = `Round: ${totalRoundNumber}`
              presenceData.state = `Time remaining: ${timeRemaining}`
              presence.setActivity(presenceData)
            }
          }
        }
        else {
          presenceData.smallImageKey = ActivityAssets.Menu
          presenceData.smallImageText = 'In the menu...'
          presenceData.details = 'In the menu...'
          presence.setActivity(presenceData)
        }
      }
      else {
        presenceData.smallImageKey = ActivityAssets.Menu
        presenceData.smallImageText = 'In the homepage...'
        presenceData.details = 'In the homepage...'
        presence.setActivity(presenceData)
      }
    }
    else if (document.location.pathname.startsWith('/legal/tos')) {
      presenceData.smallImageKey = ActivityAssets.Info
      presenceData.smallImageText = 'Terms of Service'
      presenceData.details = 'Reading the terms of'
      presenceData.state = 'service'
      presence.setActivity(presenceData)
    }
    else if (document.location.pathname.startsWith('/legal/privacy')) {
      presenceData.smallImageKey = ActivityAssets.Info
      presenceData.smallImageText = 'Privacy Police'
      presenceData.details = 'Reading the privacy'
      presenceData.state = 'police'
      presence.setActivity(presenceData)
    }
    else {
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Browsing...'
      presenceData.details = 'Browsing...'
      presence.setActivity(presenceData)
    }
  }
  else if (document.location.pathname === '/') {
    if (document.querySelector('#gameChatPage')) {
      if (
        document.querySelector('#roomBrowserPage')?.className
        !== 'gamePage text-center hidden'
      ) {
        lobbyNumber = document.querySelector('#rbTotalGameCount')?.textContent
        presenceData.smallImageKey = ActivityAssets.Lobby
        presenceData.smallImageText = `Numero stanze: ${lobbyNumber}`
        presenceData.details = 'Naviga tra le stanze'
        presenceData.state = 'di gioco'
        presence.setActivity(presenceData)
      }
      else if (
        document.querySelector('#gameChatPage')?.className === 'gamePage'
      ) {
        if (document.querySelector('#lobbyPage')?.className === 'text-center') {
          lobbyName = document.querySelector('#lobbyRoomName')?.textContent
          presenceData.smallImageKey = ActivityAssets.Room
          presenceData.smallImageText = `Stanza: ${lobbyName}`
          presenceData.details = 'Nella stanza:'
          presenceData.state = lobbyName
          presence.setActivity(presenceData)
        }
        else if (
          document.querySelector('#battleRoyalPage')?.className === 'text-center'
        ) {
          timeRemainingBR = document.querySelector('#brTimeLeft')?.textContent
          presenceData.smallImageKey = ActivityAssets.Btr
          presenceData.smallImageText = `Tempo rimanente: ${timeRemainingBR}`
          presenceData.details = 'Sceglie le canzoni per'
          presenceData.state = 'la battle royale'
          presence.setActivity(presenceData)
        }
        else {
          totalRoundNumber = document
            .querySelector('#qpCounter')
            ?.textContent
            ?.replace('/', ' di ')
          actualRoundNumber = document
            .querySelector('#qpCounter')
            ?.textContent
            ?.split('/')[0]
            ?.trim()
          if (
            document.querySelector('#qpAnimeNameHider')?.className
            === 'center-text qpAnimeNameContainer hide'
          ) {
            animeName = document.querySelector('#qpAnimeName')?.textContent
            presenceData.smallImageKey = ActivityAssets.Headset
            presenceData.smallImageText = `Canzone da: ${animeName}`
            presenceData.details = `Round ${actualRoundNumber} terminato`
            presenceData.state = `Canzone da: ${animeName}`
            presence.setActivity(presenceData)
          }
          else if (
            document
              .querySelector('#qpHiderText')
              ?.textContent
              ?.startsWith('Loading')
          ) {
            presenceData.smallImageKey = ActivityAssets.Gamepad
            presenceData.smallImageText = 'Caricamento...'
            presenceData.details = 'La partita sta per iniziare'
            presenceData.state = 'Caricamento...'
            presence.setActivity(presenceData)
          }
          else if (
            document.querySelector('#qpHiderText')?.textContent === 'Answers'
          ) {
            presenceData.smallImageKey = ActivityAssets.Gamepad
            presenceData.smallImageText = 'Aspettando i risultati...'
            presenceData.details = `Round ${actualRoundNumber} terminato`
            presenceData.state = 'Aspettando i risultati...'
            presence.setActivity(presenceData)
          }
          else {
            timeRemaining = document.querySelector('#qpHiderText')?.textContent
            presenceData.smallImageKey = ActivityAssets.Gamepad
            presenceData.smallImageText = `Round: ${actualRoundNumber}｜Tempo rimanente: ${timeRemaining}`
            presenceData.details = `Round: ${totalRoundNumber}`
            presenceData.state = `Tempo rimanente: ${timeRemaining}`
            presence.setActivity(presenceData)
          }
        }
      }
      else {
        presenceData.smallImageKey = ActivityAssets.Menu
        presenceData.smallImageText = 'Nel menù...'
        presenceData.details = 'Nel menù...'
        presence.setActivity(presenceData)
      }
    }
    else {
      presenceData.smallImageKey = ActivityAssets.Menu
      presenceData.smallImageText = 'Nella homepage...'
      presenceData.details = 'Nella homepage'
      presence.setActivity(presenceData)
    }
  }
  else if (document.location.pathname.startsWith('/legal/tos')) {
    presenceData.smallImageKey = ActivityAssets.Info
    presenceData.smallImageText = 'Termini di Servizio'
    presenceData.details = 'Legge i termini'
    presenceData.state = 'di servizio'
    presence.setActivity(presenceData)
  }
  else if (document.location.pathname.startsWith('/legal/privacy')) {
    presenceData.smallImageKey = ActivityAssets.Info
    presenceData.smallImageText = 'Politica della Privacy'
    presenceData.details = 'Legge la politica della'
    presenceData.state = 'privacy'
    presence.setActivity(presenceData)
  }
  else {
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Navigando...'
    presenceData.details = 'Navigando...'
    presence.setActivity(presenceData)
  }
})
