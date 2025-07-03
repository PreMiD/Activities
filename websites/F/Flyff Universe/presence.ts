const presence = new Presence({
  clientId: '1390190087634944060',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/WTLdzZL.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const path = document.location.pathname

  if (path === '/') {
    presenceData.state = 'Home'
  }
  else if (path.includes('/news')) {
    presenceData.state = 'Posts'
  }
  else if (path.includes('/play')) {
    presenceData.state = 'Flyff Universe'
  }
  else {
    presenceData.state = 'Browsing'
  }

  presence.setActivity(presenceData)
})
