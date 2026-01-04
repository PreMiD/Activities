const presence = new Presence({
  clientId: '1426515515223965846',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/WEvX9g6.png',
    startTimestamp: browsingTimestamp,
  }

  const { pathname } = document.location

  if (pathname === '/') {
    presenceData.details = 'Ana sayfada'
    presenceData.state = 'Göz atıyor'
  }
  else if (pathname === '/profile') {
    const usernameElement = document.querySelector('h1.text-white, .text-3xl.font-extrabold, [class*="text-"][class*="font-"]')
    const username = usernameElement?.textContent?.trim()

    const activeTab = document.querySelector('[class*="bg-gradient-to-r"][class*="from-"]')
    const tabText = activeTab?.textContent?.trim()

    presenceData.details = username ? `Profil: ${username}` : 'Profilinde'
    if (tabText) {
      presenceData.state = tabText
    }
  }
  else if (pathname === '/game') {
    const gameModeTitle = document.querySelector('h1.text-5xl, h2.text-3xl')
    const modeText = gameModeTitle?.textContent?.trim()

    if (modeText === 'Oyun Modu') {
      presenceData.details = 'Oyun modu seçiyor'
    } else if (modeText?.includes('Ben Kimim') || pathname.includes('whoami')) {
      presenceData.details = 'Oynuyor: Ben Kimim?'
      presenceData.state = 'Tahmin ediyor'
    } else if (modeText?.includes('Klasik') || pathname.includes('quiz')) {
      presenceData.details = 'Oynuyor: Klasik'
      presenceData.state = 'Sorular çözüyor'
    } else {
      presenceData.details = 'Oyun oynuyor'
    }
  }
  else if (pathname === '/leaderboard') {
    const activeSeasonButton = document.querySelector('button[class*="from-"][class*="to-"]')
    const seasonText = activeSeasonButton?.textContent?.trim()

    presenceData.details = 'Liderlik tablosu'
    if (seasonText) {
      presenceData.state = seasonText
    } else {
      presenceData.state = 'Mevcut sezon'
    }
  }
  else if (pathname === '/tutorial') {
    const tutorialTitle = document.querySelector('h2.text-xl, h2.text-2xl')
    const stepTitle = tutorialTitle?.textContent?.trim()

    presenceData.details = 'Kılavuzda'
    if (stepTitle) {
      presenceData.state = stepTitle
    }
  }
  else if (pathname === '/wrapped') {
    presenceData.details = 'Yıl özeti'
    presenceData.state = 'İstatistiklere göz atıyor'
  }
  else if (pathname === '/banned') {
    presenceData.details = 'Yasaklı'
  }
  else if (pathname === '/privacy-policy') {
    presenceData.details = 'Gizlilik politikası'
  }
  else if (pathname === '/terms-of-service') {
    presenceData.details = 'Kullanım koşulları'
  }
  else {
    presenceData.details = 'Göz atıyor'
  }

  presence.setActivity(presenceData)
})
