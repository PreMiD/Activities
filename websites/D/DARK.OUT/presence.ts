const presence = new Presence({
  clientId: '1478388131903570197',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/D/DARK.OUT/assets/logo.png',
}

interface StatusData {
  details: string
  state: string
  largeImage: string
  startTimestamp: number
}

presence.on('UpdateData', async () => {
  const statusData = await presence.getPageVariable<StatusData>(
    'details',
    'state',
    'largeImage',
    'startTimestamp',
  )

  const presenceData: PresenceData = {
    details: 'Browsing...',
    largeImageKey: ActivityAssets.Logo,
  }

  if (statusData.details)
    presenceData.details = statusData.details
  if (statusData.state)
    presenceData.state = statusData.state
  if (statusData.startTimestamp)
    presenceData.startTimestamp = statusData.startTimestamp
  if (statusData.largeImage)
    presenceData.largeImageKey = statusData.largeImage

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
