import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1491449312368922776',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/j6iIk22.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const showButtons = await presence.getSetting('buttons')
  const path = document.location.pathname

  if (path === '/') {
    presenceData.details = 'Viewing the homepage'
  }
  else if (path === '/game') {
    const isLobby = document.querySelector('[class*=PlasmicLobby]')
    const isEndScreen = document.querySelector('[class*=PlasmicEndScreen]')
    const lobbyCode = document.querySelector('[class*=LobbyCode]')?.textContent

    if (isLobby) {
      presenceData.details = 'In the lobby'
      presenceData.state = 'Waiting for players'
      if (showButtons && lobbyCode) {
        presenceData.buttons = [
          {
            label: 'Join Lobby',
            url: `https://wiki-race.com/?lobbyCode=${lobbyCode}`,
          },
        ]
      }
    }
    else if (isEndScreen) {
      const pathLength = document.querySelectorAll('[class*=PlasmicEndScreen_pathContainer] [class*=PlasmicPathElement_root]')?.length
      presenceData.details = 'Finishing a game'
      presenceData.state = pathLength > 0 ? `Destination found in ${pathLength} steps` : 'Nobody found the destination'
    }
    else {
      const currentPage = document.querySelector('.wiki-wrapper h1')?.textContent
      const targetDestination = document.querySelector('[class*=PlasmicWiki] > [class*=TargetDestination]')?.textContent
      presenceData.details = 'Playing a game'
      presenceData.state = currentPage
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = `Searching for the "${targetDestination}" wiki page`
    }
  }
  else {
    presenceData.details = 'Browsing the website'
    presenceData.state = document.title
  }

  presence.setActivity(presenceData)
})
