const presence = new Presence({
  clientId: '632983924414349333',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const djeetas: Record<string, string> = {}
const gameIcon = 'https://cdn.rcd.gg/PreMiD/websites/G/Granblue%20Fantasy/assets/logo.png'

enum Elements {
  Plain,
  Fire,
  Water,
  Earth,
  Wind,
  Light,
  Dark,
}

const ElementIcons = {
  // Plain element isn't really a thing for characters, but it's here for the sake of completion
  [Elements.Plain]: gameIcon,
  [Elements.Fire]: 'https://cdn.rcd.gg/PreMiD/websites/G/Granblue%20Fantasy/assets/0.png',
  [Elements.Water]: 'https://cdn.rcd.gg/PreMiD/websites/G/Granblue%20Fantasy/assets/1.png',
  [Elements.Earth]: 'https://cdn.rcd.gg/PreMiD/websites/G/Granblue%20Fantasy/assets/2.png',
  [Elements.Wind]: 'https://cdn.rcd.gg/PreMiD/websites/G/Granblue%20Fantasy/assets/3.png',
  [Elements.Light]: 'https://cdn.rcd.gg/PreMiD/websites/G/Granblue%20Fantasy/assets/4.png',
  [Elements.Dark]: 'https://cdn.rcd.gg/PreMiD/websites/G/Granblue%20Fantasy/assets/5.png',
}
const ElementsNames = {
  [Elements.Plain]: 'Plain',
  [Elements.Fire]: 'Fire',
  [Elements.Water]: 'Water',
  [Elements.Earth]: 'Earth',
  [Elements.Wind]: 'Wind',
  [Elements.Light]: 'Light',
  [Elements.Dark]: 'Dark',
}

interface GameStatus {
  turn: number
  battle: {
    count: number
    total: number
  }
  boss: {
    param: {
      hp: string
      hpmax: string
      alive: 1 | 0
      name: {
        ja: string
        en: string
      }
    }[]
  }
  player: {
    param: {
      attr: Elements
      alive: 1 | 0
      leader: 1 | 0
      name: string
      hp: number
      hpmax: number
      pid: string
    }[]
  }
  dungeonInfo: {
    name: string
  }
  stageInfo: {
    serial_floor_no: number
    stage_id: number
  }
  areaInfo: {
    name: string
  }
  [key: string]: unknown
}
interface UserData {
  baseUri: string
  imgUri: string
  userRank: number
  userId: number
  [key: string]: unknown
}

function simplifyKey<T>(obj: T): T {
  // stage.gGameStatus.boss => boss
  const kv = Object.entries(obj as Record<string, unknown>)
  for (const [key, value] of kv) {
    const i = key.lastIndexOf('.')
    if (i === -1)
      continue;
    (obj as Record<string, unknown>)[key.slice(i + 1)] = value
    delete (obj as Record<string, unknown>)[key]
  }

  return obj
}

function getDjeeta(imgUri: string, uri: string): Promise<string> {
  return new Promise((resolve) => {
    if (djeetas[uri])
      return resolve(djeetas[uri])

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = `${imgUri}/sp/assets/leader/raid_normal/${uri}.jpg`

    img.onload = function () {
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = img.width
      tempCanvas.height = img.width

      const tempCtx = tempCanvas.getContext('2d')!

      // Draw the first 3 pixel rows of the image to the canvas (top border)
      tempCtx.drawImage(img, 0, 0, img.width, 3, 0, 0, img.width, 3)

      // Then the rest of the image and leaving 3 pixels at the bottom
      tempCtx.drawImage(
        img,
        0,
        35,
        img.width,
        img.width - 3,
        0,
        3,
        img.width,
        img.width - 3,
      )

      // Then the last 3 pixel rows of the image to the canvas (bottom border)
      tempCtx.drawImage(
        img,
        0,
        img.height - 3,
        img.width,
        3,
        0,
        img.width - 3,
        img.width,
        3,
      )

      djeetas[uri] = tempCanvas.toDataURL('image/png')
      resolve(tempCanvas.toDataURL('image/png'))
    }

    img.onerror = function () {
      resolve(gameIcon)
    }
  })
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: gameIcon,
    startTimestamp: browsingTimestamp,
  }
  const { href } = document.location
  const [health, turn, djeeta, button] = await Promise.all([
    presence.getSetting<number>('health'),
    presence.getSetting<number>('turn'),
    presence.getSetting<boolean>('djeeta'),
    presence.getSetting<boolean>('button'),
  ])
  let userData = await presence.getPageVariable<UserData>(
    'Game.userRank',
    'Game.userId',
    'Game.baseUri',
    'Game.imgUri',
  )
  let gameStatus = await presence.getPageVariable<GameStatus>(
    'stage.gGameStatus.turn',
    'stage.pJsnData.battle',
    'stage.gGameStatus.boss',
    'stage.pJsnData.player',
    'Game.view.dungeonInfo',
    'Game.view.stageInfo',
    'Game.view.areaInfo',
  )

  if (gameStatus)
    gameStatus = simplifyKey(gameStatus)
  if (userData)
    userData = simplifyKey(userData)

  if (href.includes('/#mypage')) {
    presenceData.details = 'Home page'
  }
  else if (href.includes('/#quest')) {
    presenceData.details = 'Selecting a quest'
    if (href.includes('extra'))
      presenceData.state = 'Treasure Quests / Event Quest'
    else if (href.includes('assist'))
      presenceData.state = 'Joining a raid'
    else if (href.includes('supporter'))
      presenceData.state = 'Choosing a summon'
    else if (href.includes('fate'))
      presenceData.state = 'Choosing a fate quest'
    else if (href.includes('scene'))
      presenceData.state = 'In a story scene'
  }
  else if (href.includes('/#result')) {
    presenceData.details = 'In a Quest result screen'
  }
  else if (href.includes('/#raid') || href.includes('/#raid_multi')) {
    const bosses = gameStatus?.boss?.param.sort(
      (a, b) => Number.parseInt(b.hpmax) - Number.parseInt(a.hpmax),
    )
    const boss = bosses?.find(x => x.alive) || bosses?.[0]

    if (boss) {
      if (boss.name.ja !== boss.name.en)
        presenceData.details = `${boss.name.en} (${boss.name.ja})`
      else presenceData.details = boss.name.en

      if (gameStatus.battle?.total && gameStatus.battle?.total > 1)
        presenceData.details += ` (Wave ${gameStatus.battle.count}/${gameStatus.battle.total})`
    }
    else {
      presenceData.details = document.querySelectorAll('.name')[0]?.textContent
        || 'Starting battle...'
    }

    if (boss) {
      const hp = Number.parseInt(boss.hp)
      const percentage = (hp * 100) / Number.parseInt(boss.hpmax)
      if (health === 0) {
        presenceData.state = `At ${Math.ceil(percentage)}%`
      }
      else if (health === 1) {
        presenceData.state = `${hp.toLocaleString()} [${percentage.toFixed(
          2,
        )}%]`
      }
    }

    if (turn && gameStatus?.turn) {
      if (!presenceData.state)
        presenceData.state = `Turn ${gameStatus.turn}`
      else presenceData.state += ` | Turn ${gameStatus.turn}`
    }

    if (djeeta && gameStatus?.player) {
      const charaAlive = gameStatus.player.param.find(x => x.leader)
      if (charaAlive) {
        presenceData.smallImageKey = ElementIcons[charaAlive.attr]
        presenceData.smallImageText = ElementsNames[charaAlive.attr]
        presenceData.largeImageKey = await getDjeeta(
          userData.imgUri,
          charaAlive.pid,
        )
      }
    }
  }
  else if (href.includes('/#party/index/0/npc/0')) {
    presenceData.details = 'Viewing party'
  }
  else if (href.includes('/#enhancement')) {
    presenceData.details = 'Upgrading:'
    if (href.includes('npc'))
      presenceData.state = 'Characters'
    else if (href.includes('weapon'))
      presenceData.state = 'Weapons'
    else if (href.includes('summon'))
      presenceData.state = 'Summons'
  }
  else if (href.includes('/#evolution')) {
    presenceData.details = 'Uncapping:'

    if (href.includes('npc'))
      presenceData.state = 'Characters'
    else if (href.includes('weapon'))
      presenceData.state = 'Weapons'
    else if (href.includes('summon'))
      presenceData.state = 'Summons'
  }
  else if (href.includes('/#coopraid')) {
    presenceData.details = 'Co-op:'

    if (href.includes('offer'))
      presenceData.state = 'Searching a raid co-op room'
    else if (href.includes('room'))
      presenceData.state = 'In a co-op room'
  }
  else if (href.includes('/#lobby/room')) {
    presenceData.details = 'Co-op:'
    presenceData.state = 'In a raid co-op room'
  }
  else if (href.includes('/#casino')) {
    presenceData.details = 'Casino:'
    presenceData.state = 'Main menu'
    if (href.includes('list/poker'))
      presenceData.state = 'Choosing poker bet'
    else if (href.includes('game/poker'))
      presenceData.state = 'Playing poker'
    else if (href.includes('#casino/list/slot'))
      presenceData.state = 'Choosing slots bet'
    else if (href.includes('game/slot'))
      presenceData.state = 'Playing slots'
    else if (href.includes('list/bingo'))
      presenceData.state = 'Choosing bingo bet'
    else if (href.includes('game/bingo'))
      presenceData.state = 'Playing bingo'
    else if (href.includes('exchange'))
      presenceData.state = 'In the casino cage'
    else if (href.includes('rule/casino'))
      presenceData.state = 'Viewing casino rules'
  }
  else if (href.includes('/#gacha')) {
    presenceData.details = 'In the Draw menu'
  }
  else if (href.includes('/#profile')) {
    presenceData.details = 'Viewing profile page'
  }
  else if (href.includes('/#archive')) {
    presenceData.details = 'Viewing journal'
  }
  else if (href.includes('/#title')) {
    presenceData.details = 'Viewing trophies'
  }
  else if (href.includes('/#guild')) {
    presenceData.details = 'Viewing crew'
  }
  else if (href.includes('/#shop')) {
    presenceData.details = 'Shop:'
    presenceData.state = 'Main menu'

    if (href.includes('exchange/points'))
      presenceData.state = 'Pendants shop'
    else if (href.includes('exchange/fp'))
      presenceData.state = 'Trading FP'
    else if (href.includes('exchange/login_point'))
      presenceData.state = 'Trading Daily Points'
    else if (href.includes('exchange/special_ticket'))
      presenceData.state = 'Redeeming Siero\'s Special Pick Ticket'
    else if (href.includes('exchange/moon'))
      presenceData.state = 'Trading moons'
    else if (href.includes('exchange/trajectory'))
      presenceData.state = 'Journey drops'
    else if (href.includes('exchange/ceiling'))
      presenceData.state = 'Trading ceruleans stones'
    else if (href.includes('exchange/job_equipment'))
      presenceData.state = 'Crafting Class-specific equipments'
    else if (href.includes('skin/top'))
      presenceData.state = 'Outfit shop'
    else if (href.includes('skycompass/points'))
      presenceData.state = 'SkyCompass points exchange'
    else if (href.includes('lupi/0'))
      presenceData.state = 'Crystal shop'
    else if (href.includes('exchange/list'))
      presenceData.state = 'Treasure trading'
    else if (href.includes('passport'))
      presenceData.state = 'View Premium Pass'
  }
  else if (href.includes('/#archaic')) {
    presenceData.details = 'Shop:'
    presenceData.state = 'Weapons Crafting'
    if (href.includes('job'))
      presenceData.state = 'Crafting Class Champion weapons'
    else if (href.includes('numbers'))
      presenceData.state = 'Crafting Revenant weapons'
    else if (href.includes('seraphic'))
      presenceData.state = 'Crafting Seraphic weapons'
    else if (href.includes('xeno/list'))
      presenceData.state = 'Crafting Xeno weapons'
    else if (href.includes('bahamut'))
      presenceData.state = 'Crafting Bahamut weapons'
    else if (href.includes('omega'))
      presenceData.state = 'Crafting Ultima weapons'
    else if (href.includes('draconic'))
      presenceData.state = 'Restoring Draconic weapons'
    else if (href.includes('revans'))
      presenceData.state = 'Rebuilding Revans weapons'
  }
  else if (href.includes('#arcarum2')) {
    presenceData.details = 'In Arcarum: The World Beyond'
    if (href.includes('enhancement')) {
      presenceData.details = ' Shop:'
      presenceData.state = 'Crafting Arcarum summons'
    }
    else if (href.includes('stage') && gameStatus?.dungeonInfo) {
      presenceData.state = `${gameStatus.dungeonInfo.name} ${gameStatus.stageInfo.serial_floor_no}-${gameStatus.stageInfo.stage_id}`
    }
    else if (href.includes('supporter')) {
      presenceData.state = 'Starting a battle'
    }
    else if (href.includes('skip')) {
      presenceData.state = 'Undergoing a Fast Expedition'
    }
  }
  else if (href.includes('/#replicard')) {
    presenceData.details = 'In Replicard Sandbox'
    if (gameStatus?.areaInfo)
      presenceData.state = gameStatus.areaInfo.name
  }
  else if (href.includes('/#item')) {
    presenceData.details = 'Viewing supplies'
  }
  else if (href.includes('/#present')) {
    presenceData.details = 'Viewing Crate'
  }
  else if (href.includes('/#list')) {
    presenceData.details = 'Viewing inventory'
  }
  else if (href.includes('/#container')) {
    presenceData.details = 'Viewing stash'
  }
  else if (href.includes('/#friend')) {
    presenceData.details = 'Viewing friends list'
  }
  else if (href.includes('/#event')) {
    presenceData.details = 'In event menu'
    presenceData.state = document.querySelector('#prt-head-current')?.textContent
  }
  else if (href.includes('/#setting')) {
    presenceData.details = 'Changing settings'
  }
  else if (href.includes('/#teaser')) {
    presenceData.details = 'Viewing event preview'
  }
  else if (href.includes('/#sell')) {
    presenceData.details = 'Selling weapons/summons'
  }
  else if (href.includes('/#decompose')) {
    presenceData.details = 'Reducing weapons/summons'
  }
  else if (href.includes('/#recycle')) {
    presenceData.details = 'Reserve weapons/summons'
  }
  else if (href.includes('/#help')) {
    presenceData.details = 'Viewing help'
  }
  else if (href.includes('/#sidestory')) {
    presenceData.details = 'Viewing side stories'
  }
  else if (href.includes('/#trial_battle')) {
    presenceData.details = 'Viewing trial battles'
  }
  else if (href.includes('/#campaign/panel')) {
    presenceData.details = 'Viewing pinboard missions'
  }
  else if (href.includes('/#beginnercomic')) {
    presenceData.details = 'Reading This is Granblue Fantasy'
  }
  else if (href.includes('/#news')) {
    presenceData.details = 'Viewing the news'
  }
  else if (href.includes('/#comic')) {
    presenceData.details = 'Reading Grand Blues'
  }
  else if (href.includes('#frontier/alchemy')) {
    presenceData.details = 'In Alchemy Lab'
  }

  if (userData?.userId && button) {
    presenceData.buttons = [
      {
        label: 'Profile',
        url: `${userData.baseUri}/#profile/${userData.userId}`,
      },
    ]
  }

  presence.setActivity(presenceData)
})
