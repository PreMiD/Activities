const presence = new Presence({
  clientId: '1426515515223965846',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://futdle.tr/logo.png',
  }

  const path = document.location.pathname

  if (path === '/' || path === '') {
    presenceData.details = 'Ana sayfada'
  }
  else if (path.includes('/game') || path.includes('/play')) {
    presenceData.details = 'Soru çözüyor'
  }
  else if (path.includes('/leaderboard') || path.includes('/sıralama')) {
    presenceData.details = 'Liderlik tablosuna bakıyor'
  }
  else if (path.includes('/tutorial') || path.includes('/tutorial')) {
    presenceData.details = 'Kılavuzda'
  }
  else {
    presenceData.details = 'Göz atıyor'
  }

  presenceData.startTimestamp = Date.now()

  presence.setActivity(presenceData)
})
