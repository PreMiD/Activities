const presence = new Presence({
  clientId: '759926761554313218',
})

// Timestamp
function getTimeStamp() {
  return Math.floor(Date.now() / 1000)
}

// Variables
let Server: string | undefined, Region: string | undefined, Nickname: string | undefined, Mass: string | undefined

presence.on('UpdateData', async () => {
  // Presence Data
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/Vanis.io/assets/0.png',
  }
  const massElement = document.querySelector('#hud .stats div:nth-child(3)')
  const overlay = <HTMLElement>document.querySelector('#overlay')

  if (overlay.style.display !== 'none') {
    // Game not Ready
    const RegionElement = document.querySelector('#tab-menu .tabs .tab.active')
    const ServerElement = document.querySelector(
      '#tab-menu .server-list .active .server-name',
    )
    const NicknameElement = document.querySelector<HTMLInputElement>('#player-data #nickname')

    // Data Update
    Region = RegionElement?.textContent?.trim()
    Server = ServerElement?.textContent?.trim()
    Nickname = NicknameElement?.value
    Mass = massElement?.textContent?.split(':')[1]?.trim()
  }
  else {
    // Game Started
    Mass = massElement?.textContent?.split(':')[1]?.trim()
  }

  if (overlay.style.display !== 'none' && Mass?.startsWith('0')) {
    presenceData.details = 'Main menu'
    presenceData.startTimestamp = getTimeStamp()
  }
  else {
    presenceData.details = `Playing on server: ${Region} | ${Server}`
    presenceData.state = `Player: ${Nickname} | Mass: ${Mass}`
    presenceData.startTimestamp = getTimeStamp()
  }

  presence.setActivity(presenceData, true)
})
