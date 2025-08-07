import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1403128057753112617',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://tinday.app.tc/assets/twinday/TinDay-Logo.png',
}

presence.on('UpdateData', async () => {
  let username = 'Anonymous'
  let age = 'Unknown'
  let roomName = 'Main Page'

  const userData = localStorage.getItem('tinday_user_data')
  if (userData) {
    try {
      const decodedData = JSON.parse(atob(userData))
      username = decodedData.username || 'Anonymous'
      const birthdate = decodedData.birthdate
      if (birthdate) {
        const birthDate = new Date(birthdate)
        const today = new Date()
        let calculatedAge = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--
        }
        age = calculatedAge.toString()
      }
    } catch (error) {
      console.error('LocalStorage Error ', error)
    }
  }

  const chatRoomHeaderElement = document.getElementById('header-title')
  if (chatRoomHeaderElement) {
    roomName = chatRoomHeaderElement.textContent || 'Main Page'
  }

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: `${username} · ${age}`,
    state: roomName,
    smallImageKey: Assets.Play,
    smallImageText: `on TinDay`,
  }

  presence.setActivity(presenceData)
})