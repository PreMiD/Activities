const presence = new Presence({
  clientId: '618212337895079996',
})
const elapsed = Math.floor(Date.now() / 1000)
let text

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/D/Dueling%20Nexus/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: elapsed,
  }

  if (document.location.pathname === '/home') {
    if (document.querySelectorAll('p')[1]?.textContent?.includes('Welcome back'))
      text = document.querySelectorAll('p')[1]?.textContent
    else text = document.querySelectorAll('p')[3]?.textContent

    if (localStorage.getItem('name'))
      localStorage.setItem('name', text?.split(',')[1] ?? '')

    presenceData.details = `Online as ${text?.split(',')[1] ?? ''}`
    presenceData.state = 'waiting in lobby'
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.smallImageText = 'in game'
  }
  else if (document.location.pathname === '/decks') {
    presenceData.details = `Online as ${localStorage.getItem('name')}`
    presenceData.state = 'Looking at decklists'
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.smallImageText = 'in game'
  }
  else if (document.location.pathname.includes('/editor')) {
    presenceData.details = 'Building Decks'
    presenceData.state = `Editing: ${
      document.querySelectorAll('strong')[0]?.textContent
    }`
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.smallImageText = 'in game'
  }
  else if (document.location.pathname.includes('/game')) {
    let opponent = document.querySelector('#game-opponent-name')?.textContent
    const mylife = document.querySelector('#game-life-player')!.textContent!
    const opplife = document.querySelector('#game-life-opponent')!.textContent!
    let myname = document.querySelector('#game-player-name')?.textContent
    let state
    let status

    if (myname === 'Player' || myname === 'Opponent') {
      myname = document.querySelector('#game-room-player1-username')?.textContent
    }
    if (opponent === 'Opponent' || opponent === 'Player') {
      if (
        document.querySelector('#game-room-player2-username')?.textContent === '---'
      ) {
        opponent = 'waiting..'
      }
      else {
        opponent = document.querySelector('#game-room-player2-username')?.textContent
      }
    }
    state = `Current lp: ${mylife}, Opponent LP: ${opplife}`
    status = `Game: ${myname}(me) vs ${opponent}`
    if (Number.parseInt(mylife) === 0 && Number.parseInt(opplife) === 0) {
      state = 'Game not started'
      status = `Game: ${myname} vs ${opponent}`
    }
    /* if(localStorage.getItem("name").replace(" ",'')==myname){
          var  status = `Dueling ${opponent}`
        }
        else {
          var   status = `Spectating: ${myname} vs ${opponent}`
        }
*/
    presenceData.details = status
    presenceData.state = state
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.smallImageText = document.location.href
  }
  else if (document.location.pathname.includes('/hostgame')) {
    presenceData.details = 'Hosting Game '
    presenceData.state = `as ${localStorage.getItem('name')}`
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.smallImageText = 'in game'
  }
  else if (document.location.pathname.includes('/gamelist')) {
    presenceData.details = 'Looking for Game'
    presenceData.state = 'at All game list'
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.smallImageText = 'in game'
  }
  else if (document.location.pathname.includes('/profile')) {
    presenceData.details = 'Editing Profile'
    presenceData.state = 'changing stuffs'
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.smallImageText = 'in game'
  }
  else if (document.location.pathname.includes('/duel')) {
    presenceData.details = 'Searching for Duels'
    presenceData.state = 'Choosing game mode'
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.smallImageText = 'in game'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
