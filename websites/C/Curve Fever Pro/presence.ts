const presence = new Presence({
  clientId: '775356824240128021',
})
enum ActivityAssets {
  Index = 'https://cdn.rcd.gg/PreMiD/websites/C/Curve%20Fever%20Pro/assets/0.png',
  Angel = 'https://cdn.rcd.gg/PreMiD/websites/C/Curve%20Fever%20Pro/assets/1.png',
  BlueRacer = 'https://cdn.rcd.gg/PreMiD/websites/C/Curve%20Fever%20Pro/assets/2.png',
  CandyCane = 'https://cdn.rcd.gg/PreMiD/websites/C/Curve%20Fever%20Pro/assets/3.png',
  BumbleBee = 'https://cdn.rcd.gg/PreMiD/websites/C/Curve%20Fever%20Pro/assets/4.png',
  Joker = 'https://cdn.rcd.gg/PreMiD/websites/C/Curve%20Fever%20Pro/assets/5.png',
  JackoLantern = 'https://cdn.rcd.gg/PreMiD/websites/C/Curve%20Fever%20Pro/assets/6.png',
  Poopy = 'https://cdn.rcd.gg/PreMiD/websites/C/Curve%20Fever%20Pro/assets/7.png',
  JungleLeaf = 'https://cdn.rcd.gg/PreMiD/websites/C/Curve%20Fever%20Pro/assets/8.png',
  OChristmasTree = 'https://cdn.rcd.gg/PreMiD/websites/C/Curve%20Fever%20Pro/assets/9.png',
  Robot = 'https://cdn.rcd.gg/PreMiD/websites/C/Curve%20Fever%20Pro/assets/10.png',
  Vampire = 'https://cdn.rcd.gg/PreMiD/websites/C/Curve%20Fever%20Pro/assets/11.png',
  RedYellow = 'https://cdn.rcd.gg/PreMiD/websites/C/Curve%20Fever%20Pro/assets/12.png',
  TheMummy = 'https://cdn.rcd.gg/PreMiD/websites/C/Curve%20Fever%20Pro/assets/13.png',
  ThinkPink = 'https://cdn.rcd.gg/PreMiD/websites/C/Curve%20Fever%20Pro/assets/14.png',
  WitchyCauldron = 'https://cdn.rcd.gg/PreMiD/websites/C/Curve%20Fever%20Pro/assets/15.png',
  VipGold = 'https://cdn.rcd.gg/PreMiD/websites/C/Curve%20Fever%20Pro/assets/16.png',
  ZombieHand = 'https://cdn.rcd.gg/PreMiD/websites/C/Curve%20Fever%20Pro/assets/17.png',
  SpiderCurve = 'https://cdn.rcd.gg/PreMiD/websites/C/Curve%20Fever%20Pro/assets/18.png',
  Starfish = 'https://cdn.rcd.gg/PreMiD/websites/C/Curve%20Fever%20Pro/assets/19.png',
  IceCream = 'https://cdn.rcd.gg/PreMiD/websites/C/Curve%20Fever%20Pro/assets/20.png',
  Rasta = 'https://cdn.rcd.gg/PreMiD/websites/C/Curve%20Fever%20Pro/assets/21.png',
  Pineapple = 'https://cdn.rcd.gg/PreMiD/websites/C/Curve%20Fever%20Pro/assets/22.png',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/Curve%20Fever%20Pro/assets/logo.png',
}
const skinNames = new Map<string, string>()
  .set('Angel', ActivityAssets.Angel)
  .set('Blue Racer', ActivityAssets.BlueRacer)
  .set('Bumble Bee', ActivityAssets.BumbleBee)
  .set('Candy Cane', ActivityAssets.CandyCane)
  .set('Jack-o\'-lantern', ActivityAssets.JackoLantern)
  .set('Joker', ActivityAssets.Joker)
  .set('Jungle Leaf', ActivityAssets.JungleLeaf)
  .set('O Christmas Tree', ActivityAssets.OChristmasTree)
  .set('Poopy', ActivityAssets.Poopy)
  .set('Red&Yellow', ActivityAssets.RedYellow)
  .set('Robot', ActivityAssets.Robot)
  .set('Spider Curve', ActivityAssets.SpiderCurve)
  .set('Starfish', ActivityAssets.Starfish)
  .set('The Mummy', ActivityAssets.TheMummy)
  .set('Think Pink', ActivityAssets.ThinkPink)
  .set('Vampire', ActivityAssets.Vampire)
  .set('VIP Gold', ActivityAssets.VipGold)
  .set('Witchy Cauldron', ActivityAssets.WitchyCauldron)
  .set('Zombie Hand', ActivityAssets.ZombieHand)
  .set('Ice-Cream', ActivityAssets.IceCream)
  .set('Pineapple', ActivityAssets.Pineapple)
  .set('Rasta', ActivityAssets.Rasta)

let lastlobbyName = ''
let lastName = 'Unnamed'

const presenceData: PresenceData = {
  largeImageKey: ActivityAssets.Logo,
  startTimestamp: Date.now(),
  details: 'Main Menu',
  state: 'Just Started Playing',
}

presence.on('UpdateData', async () => {
  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})

function RefreshData() {
  const statePage = getActualGamePage()
  switch (statePage) {
    case 'in_lobby_picking_powers': {
      const [skinSlot] = document.querySelectorAll('.skin-slot.skin-slot--0')
      const [groupTitle] = document.querySelectorAll('.group-name__title')
      const skinName = skinSlot?.children[0]?.getAttribute('title') ?? 'skin_unknown'
      const lobbyName = groupTitle ? groupTitle.textContent! : 'Unknown lobby'

      presenceData.details = 'Picking Powers'
      presenceData.state = `In Lobby, ${lobbyName} (${
        document.querySelectorAll('.c-user.c-user--small').length
      }/6)`

      if (skinNames.has(skinName)) {
        presenceData.smallImageKey = skinNames.get(skinName)
        presenceData.smallImageText = `Playing as ${skinName}`
      }

      lastlobbyName = lobbyName

      break
    }
    case 'in_lobby_ready': {
      const [groupTitle] = document.querySelectorAll('.group-name__title')
      const userRows = document.querySelectorAll('.group-players-list__row')
      const lobbyName = groupTitle ? groupTitle.textContent! : 'Unknown lobby'
      let playerCount = 0
      for (const userRow of userRows) {
        if (!userRow.className.includes('group-players-list__row--empty'))
          playerCount++
      }

      presenceData.details = 'Ready In Lobby'
      presenceData.state = `${lobbyName} (${playerCount}/6)`
      lastlobbyName = lobbyName

      break
    }
    case 'in_game': {
      presenceData.details = 'Playing'
      presenceData.state = lastlobbyName

      break
    }
    case 'in_game_finished': {
      presenceData.details = 'Checking Match Results'
      presenceData.state = lastlobbyName

      break
    }
    default: {
      const [nickElement] = document.querySelectorAll('.c-user__name')
      lastName = nickElement ? nickElement.textContent! : 'Unnamed'
      presenceData.state = lastName
    }
  }

  switch (statePage) {
    case 'in_menu': {
      presenceData.details = 'Main Menu'
      break
    }
    case 'browsing_lobbies': {
      presenceData.details = 'Browsing Lobbies'
      break
    }
    case 'in_shop': {
      presenceData.details = 'In Shop'
      break
    }
    case 'in_leaderboard': {
      presenceData.details = 'In Leaderboards'
      break
    }
    case 'in_locker': {
      presenceData.details = 'In Locker'
      break
    }
    case 'in_battlepass': {
      presenceData.details = 'In Battlepass'
      break
    }
    case 'in_progress': {
      presenceData.details = 'Checking XP Progress'
      break
    }
    case 'opening_crates': {
      presenceData.details = 'Opening Crates'
      break
    }
    case 'creating_match': {
      presenceData.details = 'Creating Match'
      break
    }
  }

  presenceData.largeImageKey = ActivityAssets.Index
}

function getActualGamePage() {
  if (document.querySelectorAll('.game-overlay')[0]) {
    return 'in_game'
  }
  else if (document.querySelectorAll('.post-game-rewards__title')[0]) {
    return 'in_game_finished'
  }
  else if (document.querySelectorAll('.popup-header')[0]) {
    switch (document.querySelectorAll('.popup-header')[0]?.textContent) {
      case 'Room settings':
        return 'creating_match'
      case 'Crates':
        return 'opening_crates'
      case 'XP progression':
        return 'in_progress'
      case 'Battlepass':
        return 'in_battlepass'
      case 'Locker':
        return 'in_locker'
      case 'Leaderboard':
        return 'in_leaderboard'
      case 'Shop':
        return 'in_shop'
    }
  }
  else if (document.querySelectorAll('.menu.side-menu')[0]) {
    return 'in_menu'
  }
  else if (document.querySelectorAll('.lobby')[0]) {
    return 'browsing_lobbies'
  }
  else if (document.querySelectorAll('.module-inventory-top')[0]) {
    return 'in_lobby_picking_powers'
  }
  else if (document.querySelectorAll('.group-ready-state__title')[0]) {
    return 'in_lobby_ready'
  }

  return 'in_menu'
}

setInterval(RefreshData, 1000)
