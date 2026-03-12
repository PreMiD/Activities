const presence = new Presence({
  clientId: '568254611354419211',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/Discord%20Extreme%20List/assets/logo.png',
  }

  if ((await presence.getSetting<boolean>('incognito')) === false) {
    presenceData.details = document.querySelector('#premidPageInfo')?.textContent
    if ((await presence.getSetting<boolean>('showTimestamp')) === true)
      presenceData.startTimestamp = Math.floor(Date.now() / 1000)
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
