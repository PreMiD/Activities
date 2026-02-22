import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1473745467081756703',
})

interface ChallengeData {
  active: boolean
  title?: string
  points?: number
  category?: string
}

interface PageInfo {
  details: string
  state: string
  largeImageKey: string
  challenge_id: string | null
  category?: string
  pageType?: string
}

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

const startTimestamp = Math.floor(Date.now() / 1000)

let lastUrl = window.location.href
let lastDetails = ''
let lastState = ''

function cleanTitle(raw: string | null | undefined): string | null {
  if (!raw) return null
  return raw.trim().replace(/\(\d+\s*points?\)/i, '').trim() || null
}

function getPageContext(): PageInfo {
  const path = window.location.pathname
  const params = new URLSearchParams(window.location.search)

  const info: PageInfo = {
    details: 'Parcourt les challenges',
    state: '💻 Cyber-Learning.fr',
    largeImageKey: 'https://cyber-learning.fr/wp-content/uploads/avatars/cropped-user-1-1728625950.png',
    challenge_id: null,
    pageType: 'home'
  }

  if (path.includes('/test-cybersecurite/')) {
    const id = params.get('id_sujet')
    const mat = params.get('matiere') || ''
    const cat = categoriesById[mat] || 'Challenge'

    info.details = '⚔️ Se prépare...'
    info.state = `💻 ${cat}`
    info.challenge_id = id
    info.category = cat
    info.pageType = 'challenge'
  }
  else if (path.includes('/exercices-cybersecurite/')) {
    const mat = params.get('a') || ''
    const cat = categoriesBySlug[mat] || 'les challenges'
    info.details = `📋 Liste : ${cat}`
    info.state = '🔍 Cherche un exercice'
    info.category = cat
    info.pageType = 'list'
  }
  else if (path.includes('/qcm-cyber-securite/')) {
    const quiz = params.get('quiz')
    info.details = quiz ? `📚 QCM : ${quiz}` : '📚 Fait un QCM'
    info.state = '🎓 En formation'
    info.pageType = quiz ? 'qcm' : 'qcm-list'
  }
  else if (path.includes('/hacker-stats/')) {
    const nom = document.querySelector('h1')?.textContent?.trim()
    const scoreEl = Array.from(document.querySelectorAll('strong, b')).find(e => e.textContent?.includes('pts'))

    info.details = nom ? `🏆 Profil : ${nom}` : '🏆 Regarde un profil'
    info.state = scoreEl?.textContent?.trim() || '📊 Statistiques'
    info.pageType = 'profile'
  }
  else if (path.includes('/profile/')) {
    info.details = '👤 Mon profil'
    info.state = '⚙️ Gestion du compte'
    info.pageType = 'myprofile'
  }

  return info
}

async function updatePresence() {
  const info = getPageContext()

  if (info.challenge_id) {
    try {
      const apiUrl = `https://cyber-learning.fr/wp-content/plugins/bts-cyber/discord-presence.php?challenge_id=${info.challenge_id}`
      const res = await fetch(apiUrl)
      const data: ChallengeData = await res.json()

      if (data.active && data.title) {
        info.details = `⚔️ ${data.title}`
        if (typeof data.points === 'number') {
          info.state = `💻 ${data.points} pts - ${info.category}`
        }
      }
      else {
        const domTitle = cleanTitle(document.querySelector('h2')?.textContent)
        if (domTitle) info.details = `⚔️ ${domTitle}`
      }
    }
    catch {
      const domTitle = cleanTitle(document.querySelector('h2')?.textContent)
      if (domTitle) info.details = `⚔️ ${domTitle}`
    }
  }

  const finalDetails = `${info.details}`
  const finalState = `${info.state}`

  const activity: PresenceData = {
    type: ActivityType.Playing,
    startTimestamp,
    largeImageKey: info.largeImageKey,
    details: finalDetails,
    state: finalState,
  }

  
  switch (info.pageType) {
    case 'challenge':
      activity.buttons = [{ label: '⚔️ Faire ce challenge', url: window.location.href }]
      break
    case 'qcm':
      activity.buttons = [{ label: '📚 Faire ce QCM', url: window.location.href }]
      break
    case 'profile':
      activity.buttons = [{ label: '👤 Voir le profil', url: window.location.href }]
      break
    case 'list':
      if (info.category && info.category !== 'les challenges') {
        activity.buttons = [{ label: `📋 Voir ${info.category}`, url: window.location.href }]
      }
      break
  }

  if (finalDetails === lastDetails && finalState === lastState && window.location.href === lastUrl) {
    return
  }

  lastDetails = finalDetails
  lastState = finalState
  lastUrl = window.location.href

  presence.setActivity(activity)
}

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
