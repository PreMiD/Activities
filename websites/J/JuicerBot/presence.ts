import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1459583460858531952',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.discordapp.com/avatars/1459583460858531952/da166fa0d60fe899244a4765071e0eb4.png?size=512',
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  // 1. STARTSEITE
  if (pathname === '/' || pathname === '/index') {
    presenceData.details = '🧃 Auf der Startseite'
    presenceData.state = 'Checkt das Juicer-Universum aus'
  } 
  // 2. LEADERBOARD
  else if (pathname.startsWith('/leaderboard')) {
    presenceData.details = '📊 Checkt die Rangliste'
    const activeTab = document.querySelector('.nav-link.active')?.textContent?.trim()
    presenceData.state = activeTab ? activeTab : 'Sucht den #1 Juicer'
  } 
  // 3. PROFILE
  else if (pathname.startsWith('/profile/')) {
    presenceData.details = '👀 Betrachtet ein Profil'
    const profileName = document.querySelector('h2.fw-bold')?.textContent?.trim()
    presenceData.state = profileName ? profileName : 'Stalkt Statistiken'
  } 
  // 4. TURNIER SYSTEM
  else if (pathname.startsWith('/turnier')) {
    if (pathname.includes('/admin')) {
      presenceData.details = '⚙️ Turnier-Admin'
      presenceData.state = 'Steuert das Bonus Battle'
    } else if (pathname.includes('/overlay')) {
      presenceData.details = '🎥 OBS Overlay'
      presenceData.state = 'Streamt das Bonus Battle'
    } else {
      presenceData.details = '🏆 Schaut das Bonus Battle'
      const tourneyTitle = document.querySelector('.text-uppercase.fw-bold[style*="letter-spacing: 4px"]')?.textContent
      presenceData.state = tourneyTitle ? `Turnier: ${tourneyTitle.trim()}` : 'Fiebert live mit'
    }
  } 
  // 5. BONUS HUNT TRACKER
  else if (pathname.startsWith('/bonushunt') || pathname.startsWith('/BonusHuntLive')) {
    presenceData.details = '🎯 Bonus Hunt Tracker'
    presenceData.state = pathname.toLowerCase().includes('live') ? 'In der Master-Tabelle (Live)' : 'Analysiert die Hunts'
  } 
  // 6. DASHBOARD & LOGS (ADMINS)
  else if (pathname.startsWith('/dashboard')) {
    presenceData.details = '⚙️ Server Dashboard'
    presenceData.state = 'Konfiguriert den Bot'
  } 
  else if (pathname.startsWith('/logs')) {
    presenceData.details = '👁️ Big Sister Board'
    const filter = document.querySelector('.tab-btn.active')?.textContent?.trim()
    presenceData.state = filter ? `Überwacht: ${filter}` : 'Absolute Server Kontrolle'
  } 
  // 7. FEATURES & EVENTS
  else if (pathname.startsWith('/wheel') || pathname.startsWith('/wheel-overlay')) {
    presenceData.details = '🎰 Am Glücksrad'
    presenceData.state = 'Hofft auf den dicken Win'
  } 
  else if (pathname.startsWith('/quests')) {
    presenceData.details = '📜 Quests & Prestige'
    presenceData.state = 'Sammelt fleißig Punkte'
  } 
  else if (pathname.startsWith('/poll')) {
    presenceData.details = '📊 Community Umfragen'
    presenceData.state = 'Stimmt ab & diskutiert'
  } 
  else if (pathname.startsWith('/generator')) {
    presenceData.details = '🎰 Slot Generator'
    presenceData.state = 'Kann sich nicht entscheiden!'
  } 
  else if (pathname.startsWith('/xmas')) {
    presenceData.details = '🎄 Weihnachts-Event'
    presenceData.state = 'Öffnet den Juicer-Adventskalender'
  } 
  // 8. INFOS & LOGIN
  else if (pathname.startsWith('/roadmap')) {
    presenceData.details = '🗺️ Checkt die Roadmap'
    presenceData.state = 'Schaut in die Zukunft'
  } 
  else if (pathname.startsWith('/faq') || pathname.startsWith('/commands')) {
    presenceData.details = '📚 Dokumentation'
    presenceData.state = 'Liest das FAQ & die Serverregeln'
  } 
  else if (pathname.startsWith('/login')) {
    presenceData.details = '🔐 Login-Bereich'
    presenceData.state = 'Meldet sich an...'
  } 
  // 9. DEFAULT (Alles andere)
  else {
    presenceData.details = '🧃 Surft auf JuicerBot.de'
    presenceData.state = 'Im Juicer-Universum'
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  } else {
    presence.clearActivity()
  }
})