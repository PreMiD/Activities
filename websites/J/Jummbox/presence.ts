const presence = new Presence({
  clientId: '637737627151368202',
})

presence.on('UpdateData', async () => {
  const presenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/J/Jummbox/assets/logo.png',
    details: 'Using Jummbox',
    state: 'Making a Beep',
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
