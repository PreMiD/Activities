const presence = new Presence({
  clientId: '1486144929213321357',
})

const GLOBAL_START_KEY = 'vitamine_global_start_timestamp'

function getGlobalStartTimestamp(): number {
  const saved = sessionStorage.getItem(GLOBAL_START_KEY)

  if (saved && !Number.isNaN(Number(saved))) {
    return Number(saved)
  }

  const now = Math.floor(Date.now() / 1000)
  sessionStorage.setItem(GLOBAL_START_KEY, String(now))
  return now
}

let browsingTimestamp = getGlobalStartTimestamp()
let lastSignature = ''

function getText(selector: string): string {
  return document.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() || ''
}

function getCourseInfo(): string {
  const courseInfo
    = document.querySelector('.card .text-muted.text-end u')?.parentElement?.textContent?.trim()
      || getText('.text-muted.px-2.fst-italic.py-1.text-end')
      || getText('#courses-nav .nav-link.active')
      || ''

  return courseInfo.replace(/\s+/g, ' ').trim()
}

function buildPresenceData(): PresenceData {
  const { pathname } = document.location
  const pageText = document.body.textContent || ''
  const pageTitle = document.title?.replace(/^Vitamine\s*·\s*/i, '').trim() || 'Vitamine'

  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/Vitamine/assets/logo.png',
    details: 'Vitamine',
    startTimestamp: browsingTimestamp,
  }

  switch (true) {
    case pathname === '/':
      presenceData.details = 'Menu principal'
      presenceData.state = 'Page d’accueil'
      break

    case pathname === '/anchoring/' || pathname.startsWith('/anchoring'):
      presenceData.details = 'Ancrage'
      presenceData.state = 'Mode Ancrage'
      break

    case pathname === '/bank/' || pathname.startsWith('/bank'):
      presenceData.details = 'Banque'
      presenceData.state = 'Banque de QCM'
      break

    case pathname === '/test/' || pathname.startsWith('/test'):
      presenceData.details = 'Épreuves'
      presenceData.state = 'Consultation des épreuves'
      break

    case pathname === '/annal/' || pathname.startsWith('/annal'):
      presenceData.details = 'Annales'
      presenceData.state = 'Consultation des annales'
      break

    case pathname === '/course/' || pathname.startsWith('/course'): {
      const ueTitle
        = getText('h1.h3')
          || pageTitle
          || 'Cours'

      const activeCourse
        = getText('#courses-nav .nav-link.active')
          || getText('.pdf-file:not(.d-none) h4')
          || 'Consultation du cours'

      presenceData.details = ueTitle
      presenceData.state = activeCourse
      break
    }

    case pathname === '/comment/list' || pathname.startsWith('/comment/list'):
      presenceData.details = 'Commentaires'
      presenceData.state = 'Liste des commentaires'
      break

    case pathname.startsWith('/comment/'): {
      const commentId = pathname.match(/\/comment\/(\d+)/)?.[1]
      const commentTitle
        = getText('h1')
          || getText('.card h4')
          || getText('.card-title')

      presenceData.details = 'Commentaires'
      presenceData.state = commentTitle || (commentId ? `Commentaire #${commentId}` : 'Lecture des commentaires')
      break
    }

    case pathname === '/results/' || pathname.startsWith('/results'):
      presenceData.details = 'Résultats'
      presenceData.state = 'Consultation des résultats'
      break

    case pathname === '/settings/card' || pathname.startsWith('/settings/card'):
      presenceData.details = 'Carte d’adhérent'
      presenceData.state = 'Consultation de la carte'
      break

    case pathname === '/settings/' || pathname.startsWith('/settings'):
      presenceData.details = 'Paramètres'
      presenceData.state = 'Modification des paramètres'
      break

    case pathname === '/logout' || pathname.startsWith('/logout'):
      presenceData.details = 'Déconnexion'
      presenceData.state = 'Quitte la plateforme'
      break

    case pathname === '/cgu' || pathname.startsWith('/cgu'):
      presenceData.details = 'CGU'
      presenceData.state = 'Lecture des conditions d’utilisation'
      break

    case pathname.startsWith('/session/'): {
      const sessionTitle
        = getText('h1')
          || getText('.anchoring-title')
          || pageTitle
          || 'Session'

      const cleanedCourseInfo = getCourseInfo()

      const looksLikeExamTitle
        = /séance|seance|épreuve|epreuve|qcm n°|qcm n|pass\s*-|ue\d+/i.test(sessionTitle)

      const isAnchoring = /ancrage/i.test(sessionTitle) || /questions?\s+restantes/i.test(pageText)
      const isBank = /banque/i.test(sessionTitle)
      const isExam = looksLikeExamTitle

      switch (true) {
        case isExam:
          presenceData.details = cleanedCourseInfo || sessionTitle || 'Épreuve'
          presenceData.state = 'Épreuve en cours'
          break

        case isAnchoring:
          presenceData.details = cleanedCourseInfo || 'Ancrage'
          presenceData.state = 'Session ancrage'
          break

        case isBank:
          presenceData.details = cleanedCourseInfo || 'Banque'
          presenceData.state = 'Session banque'
          break

        default:
          presenceData.details = cleanedCourseInfo || sessionTitle || 'Session'
          presenceData.state = 'Session en cours'
          break
      }
      break
    }

    case pathname.startsWith('/files/course/'): {
      const filename = pathname.split('/').pop() || 'Fichier'
      presenceData.details = 'Fichier de cours'
      presenceData.state = decodeURIComponent(filename)
      break
    }

    default: {
      const h1 = getText('h1')
      presenceData.details = pageTitle || 'Vitamine'
      presenceData.state = h1 || pathname
      break
    }
  }

  return presenceData
}

function updatePresence(force = false): void {
  const data = buildPresenceData()

  const signature = JSON.stringify({
    path: location.pathname,
    title: document.title,
    details: data.details,
    state: data.state,
  })

  if (!force && signature === lastSignature) {
    return
  }

  lastSignature = signature

  if (data.state || data.details) {
    presence.setActivity(data)
  }
  else {
    presence.clearActivity()
  }
}

presence.on('UpdateData', async () => {
  updatePresence()
})

const originalPushState = history.pushState
history.pushState = function (...args) {
  originalPushState.apply(this, args)
  setTimeout(() => updatePresence(true), 50)
}

const originalReplaceState = history.replaceState
history.replaceState = function (this: History, ...args: Parameters<History['replaceState']>) {
  originalReplaceState.apply(this, args)
  setTimeout(() => updatePresence(true), 50)
}

window.addEventListener('popstate', () => {
  setTimeout(() => updatePresence(true), 50)
})

window.addEventListener('hashchange', () => {
  setTimeout(() => updatePresence(true), 50)
})

const observer = new MutationObserver(() => {
  updatePresence()
})

observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
})

setInterval(() => {
  updatePresence()
}, 1000)