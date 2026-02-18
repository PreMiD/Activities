import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1473745467081756703',
})

// ─────────────────────────────────────────────────────────────
// 1. Interfaces & Types
// ─────────────────────────────────────────────────────────────

interface ChallengeData {
  active: boolean
  title?: string
  points?: number
  category?: string
}

interface PresenceButton {
  label: string
  url: string
}

interface PageInfo {
  details: string
  state: string
  largeImageKey: string
  // On a supprimé smallImageKey pour éviter le "?"
  challenge_id: string | null
  category?: string
}

// ─────────────────────────────────────────────────────────────
// 2. Données de Mapping
// ─────────────────────────────────────────────────────────────

const categoriesById: Record<string, string> = {
  1: 'Cryptanalyse',
  2: 'Stéganographie',
  3: 'Codage & Numération',
  5: 'Hacking Web',
  6: 'Programmation',
  7: 'Réseaux & com',
  9: 'Cracking & Forensic',
}

const categoriesBySlug: Record<string, string> = {
  'numeration-base': 'Codage & Numération',
  'crack-hack-programme': 'Cracking & Forensic',
  'chiffrer-dechiffrer-decrypter': 'Cryptanalyse',
  'html-http': 'Hacking Web',
  'Php-Python-Perl': 'Programmation',
  'Telnet-FTP-HTTP': 'Réseaux & com',
  'steganographie': 'Stéganographie',
}

// ─────────────────────────────────────────────────────────────
// 3. Gestion de l'état (Global)
// ─────────────────────────────────────────────────────────────

const startTimestamp = Math.floor(Date.now() / 1000)

let lastUrl = window.location.href
let lastDetails = ''
let lastState = ''

// ─────────────────────────────────────────────────────────────
// 4. Fonctions Utilitaires
// ─────────────────────────────────────────────────────────────

function cleanTitle(raw: string | null | undefined): string | null {
  if (!raw)
    return null
  return raw.trim().replace(/\(\d+\s*points?\)/i, '').trim() || null
}

function getPageContext(): PageInfo {
  const path = window.location.pathname
  const params = new URLSearchParams(window.location.search)

  // Valeurs par défaut
  const info: PageInfo = {
    details: 'Parcourt les challenges',
    state: '💻 Cyber-Learning.fr', // Emoji par défaut
    largeImageKey: 'logo',
    challenge_id: null,
  }

  // --- A. PAGE CHALLENGE ---
  if (path.includes('/test-cybersecurite/')) {
    const id = params.get('id_sujet')
    const mat = params.get('matiere') || ''
    const cat = categoriesById[mat] || 'Challenge'

    info.details = '⚔️ Se prépare...'
    // ICI : On met l'emoji ordi au lieu du cadenas
    info.state = `💻 ${cat}`
    info.challenge_id = id
    info.category = cat
  }

  // --- B. LISTE DES CHALLENGES ---
  else if (path.includes('/exercices-cybersecurite/')) {
    const mat = params.get('a') || ''
    const cat = categoriesBySlug[mat] || 'les challenges'
    info.details = `📋 Liste : ${cat}`
    info.state = '🔍 Cherche un exercice'
  }

  // --- C. QCM ---
  else if (path.includes('/qcm-cyber-securite/')) {
    const quiz = params.get('quiz')
    info.details = quiz ? `📚 QCM : ${quiz}` : '📚 Fait un QCM'
    info.state = '🎓 En formation'
  }

  // --- D. PROFILS ---
  else if (path.includes('/hacker-stats/')) {
    const nom = document.querySelector('h1')?.textContent?.trim()
    const scoreEl = Array.from(document.querySelectorAll('strong, b')).find(e => e.textContent?.includes('pts'))

    info.details = nom ? `🏆 Profil : ${nom}` : '🏆 Regarde un profil'
    info.state = scoreEl?.textContent?.trim() || '📊 Statistiques'
  }

  // --- E. MON PROFIL ---
  else if (path.includes('/profile/')) {
    info.details = '👤 Mon profil'
    info.state = '⚙️ Gestion du compte'
  }

  return info
}

// ─────────────────────────────────────────────────────────────
// 5. Boucle Principale
// ─────────────────────────────────────────────────────────────

async function updatePresence() {
  const info = getPageContext()

  // Appel API si on est sur un challenge
  if (info.challenge_id) {
    try {
      const apiUrl = `https://cyber-learning.fr/wp-content/plugins/bts-cyber/discord-presence.php?challenge_id=${info.challenge_id}`
      const res = await fetch(apiUrl)
      const data: ChallengeData = await res.json()

      if (data.active && data.title) {
        info.details = `⚔️ ${data.title}`
        if (typeof data.points === 'number') {
          // ICI : On garde l'emoji ordi même quand on a les points
          info.state = `💻 ${data.points} pts - ${info.category}`
        }
      }
      else {
        const domTitle = cleanTitle(document.querySelector('h2')?.textContent)
        if (domTitle)
          info.details = `⚔️ ${domTitle}`
      }

    // ✅ APRÈS (Correction)
    }
    catch {
      const domTitle = cleanTitle(document.querySelector('h2')?.textContent)
      if (domTitle)
        info.details = `⚔️ ${domTitle}`
    }
  }

  const finalDetails = `${info.details}`
  const finalState = `${info.state}`

  const buttons: [PresenceButton, PresenceButton?] = [
    { label: '🌐 Cyber-Learning.fr', url: 'https://cyber-learning.fr' },
    { label: '🔗 Ouvrir la page', url: window.location.href },
  ]

  // Construction de l'objet Presence
  const activity: any = {
    type: ActivityType.Playing,
    startTimestamp,
    largeImageKey: info.largeImageKey,
    largeImageText: 'Cyber-Learning.fr',
    details: finalDetails,
    state: finalState,
    buttons,
    // Note : On a SUPPRIMÉ 'smallImageKey' ici.
    // C'est ça qui enlève le point d'interrogation.
  }

  if (finalDetails === lastDetails && finalState === lastState && window.location.href === lastUrl) {
    return
  }

  lastDetails = finalDetails
  lastState = finalState
  lastUrl = window.location.href

  presence.setActivity(activity)
}

// ─────────────────────────────────────────────────────────────
// 6. Initialisation
// ─────────────────────────────────────────────────────────────

updatePresence()
setInterval(updatePresence, 5000)

window.addEventListener('popstate', updatePresence)
window.addEventListener('pushstate', updatePresence)

new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    updatePresence()
  }
}).observe(document.querySelector('title') || document.body, {
  subtree: true,
  characterData: true,
  childList: true,
})
