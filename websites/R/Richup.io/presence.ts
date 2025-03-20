const presence = new Presence({
  clientId: '1067910906912194590',
})
const pages: { [k: string]: string } = {
  '/settings': 'Settings',
  '/store/player-appearance': 'Player Appearance',
  '/store/board-maps': 'Board Maps',
  '/store/upgrades': 'Upgrades',
  '/store/avatars': 'Profile Pictures',
  '/store/coins': 'Coins',
}

let startTimestamp: number | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/Richup.io/assets/0.png',
  }
  const { pathname, href } = location
  const [showJoinRoomButton, showProfileButton] = await Promise.all([
    presence.getSetting('join-room-button'),
    presence.getSetting('profile-button'),
  ])

  if (pathname.includes('/store')) {
    presenceData.details = 'Store'
    if (pages[pathname])
      presenceData.state = pages[pathname]
  }
  else if (pathname.includes('/room')) {
    let latestInfo = document.querySelector(
      '#app > div:nth-child(4) > div > div:nth-child(2) > div > div > :first-child > :first-child > :last-child > :first-child',
    )?.children?.[0]?.textContent
    let players = []

    presenceData.details = '🎮 In a room'

    if (latestInfo) {
      const playerList = document.querySelectorAll(
        '#app > div:nth-child(4) > div > div:nth-child(3) > div > :first-child > div > div > :not(:first-child) > div:nth-child(2) > div:first-child',
      )

      for (const element of playerList) players.push(element.textContent ?? '')

      players = [...players]
        .sort((a, b) => a.length - b.length)
        .filter(Boolean)

      /* Replace room ID */
      latestInfo = latestInfo.replace(pathname.split('/')[2]!, '')

      /* Replace player names */
      for (const player of players)
        latestInfo = latestInfo.replace(new RegExp(player, 'g'), 'A player')

      presenceData.state = latestInfo ? `🎲 ${latestInfo}` : ''
    }

    if (!startTimestamp)
      startTimestamp = Date.now() / 1000
    presenceData.startTimestamp = startTimestamp

    const gameSettings = document
      .querySelector('#app > div > div > div:nth-child(3)')
      ?.textContent
      ?.includes('Game settings')

    if (showJoinRoomButton && gameSettings) {
      presenceData.buttons = [
        {
          label: 'Join Room',
          url: href,
        },
      ]
    }
  }
  else if (pathname.includes('/profile/')) {
    presenceData.details = 'Viewing a profile'
    presenceData.state = document.querySelector(
      'header > div > :last-child > span',
    )?.textContent

    if (showProfileButton) {
      presenceData.buttons = [
        {
          label: 'View Profile',
          url: href,
        },
      ]
    }
  }
  else if (pages[pathname]) {
    presenceData.details = 'Viewing a page'
    presenceData.state = pages[pathname]
  }
  else {
    presence.setActivity()
    return
  }

  /* Reset timestamp */
  if (!pathname.includes('/room'))
    startTimestamp = null

  presence.setActivity(presenceData)
})
