import { Assets } from 'premid'

const presence = new Presence({
  clientId: '712269360206708766',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/Durarara/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.pathname.includes('/lounge')) {
    presenceData.details = 'Searching for a room'
    presenceData.state = `Username: ${
      document.querySelector('.name')?.textContent
    }`
    presenceData.smallImageKey = Assets.Search
  }
  else if (document.location.pathname.includes('/create_room')) {
    presenceData.details = 'Creating a room'
  }
  else if (document.location.pathname.includes('/room/')) {
    presenceData.details = `In a room: ${
      document.querySelector('.room-title-name')?.textContent
    }`
    presenceData.state = `Members: ${
      document.querySelector('.room-title-capacity')?.textContent
    }`
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/D/Durarara/assets/0.png'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
