const presence = new Presence({
  clientId: '1422033396233932900',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/zKibaZa.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  const title = document.title
  presenceData.details = title
  presenceData.state = 'Composing a song'
  // Add a timestamp to show how long the user has been on the page
  presenceData.startTimestamp = browsingTimestamp

  // Set the activity
  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
