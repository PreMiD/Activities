const presence = new Presence({
  clientId: '1486144929213321357',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

let lastSignature = ''

function getText(selector: string): string {
  return document.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() || ''
}

function extractCountdown(): string {
  const raw = getText('#countdown')
  const match = raw.match(/(\d+:\d{2}:\d{2})/)
  return match?.[1] || ''
}

function buildPresenceData(): PresenceData {
  const { pathname } = document.location
  const pageText = document.body.textContent || ''
  const pageTitle = document.title?.replace(/^Vitamine\s*·\s*/i, '').trim() || 'Vitamine'

  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/A6FNvRr.png',
    details: 'Vitamine',
    startTimestamp: browsingTimestamp,
  }

  switch (true) {
    case pathname === '/':
      presenceData.details = 'Menu principal'
      presenceData.state = 'Page d\'accueil'
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

      presenceData.details = ueTitle
      presenceData.state = activeCourse || 'Consultation du cours'
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
      presenceData.details = 'Carte d\'adhérent'
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
      presenceData.state = 'Lecture des conditions d\'utilisation'
      break

    case pathname.startsWith('/session/'): {
      const sessionTitle
        = getText('h1')
          || getText('.anchoring-title')
          || pageTitle
          || 'Session'

      const courseInfo
        = document.querySelector('.card .text-muted.text-end u')?.parentElement?.textContent?.trim()
          || getText('.text-muted.px-2.fst-italic.py-1.text-end')
          || ''

      const cleanedCourseInfo = courseInfo.replace(/\s+/g, ' ').trim()

      const remainingMatch = pageText.match(/(\d+)\s+questions?\s+restantes/i)
      const cleanCountdown = extractCountdown()
      const questionNumber = getText('.card-header strong')

      const questionCards = Array.from(document.querySelectorAll('[id^="mcq-"], .card[id^="mcq-"]'))
      const visibleQuestionCards = questionCards.filter((el) => {
        const htmlEl = el as HTMLElement
        return htmlEl.offsetParent !== null
      })

      const questionCount = visibleQuestionCards.length

      const hasSubmitButton
        = Array.from(document.querySelectorAll('button, input[type="submit"]')).some((el) => {
          return /valider la réponse|valider|terminer/i.test(el.textContent || '')
        })

      const looksLikeExamTitle
        = /séance|seance|épreuve|epreuve|qcm n°|qcm n|pass\s*-|ue\d+/i.test(sessionTitle)

      const looksLikeExamByPage
        = !!cleanCountdown
          && (questionCount >= 2 || looksLikeExamTitle || hasSubmitButton)

      const isExam = looksLikeExamTitle || looksLikeExamByPage
      const isAnchoring = /ancrage/i.test(sessionTitle) || /questions?\s+restantes/i.test(pageText)
      const isBank = /banque/i.test(sessionTitle)

      switch (true) {
        case isExam: {
          presenceData.details = sessionTitle

          if (questionCount >= 2) {
            presenceData.state = cleanCountdown
              ? `${questionCount} questions • ${cleanCountdown}`
              : `${questionCount} questions en cours`
          }
          else if (questionNumber) {
            presenceData.state = cleanCountdown
              ? `${questionNumber} • ${cleanCountdown}`
              : questionNumber
          }
          else {
            presenceData.state = cleanCountdown
              ? `Temps restant : ${cleanCountdown}`
              : 'Épreuve en cours'
          }
          break
        }

        case isAnchoring:
          presenceData.details = cleanedCourseInfo || 'Ancrage'
          presenceData.state = remainingMatch
            ? (
                cleanCountdown
                  ? `${remainingMatch[1]} QCM restants • ${cleanCountdown}`
                  : `${remainingMatch[1]} QCM restants`
              )
            : (
                cleanCountdown
                  ? `${questionNumber || 'Session ancrage'} • ${cleanCountdown}`
                  : questionNumber || 'Session ancrage en cours'
              )
          break

        case isBank:
          presenceData.details = cleanedCourseInfo || 'Banque'
          presenceData.state = cleanCountdown
            ? `${questionNumber || 'Session banque'} • ${cleanCountdown}`
            : questionNumber || 'Session banque en cours'
          break

        default:
          presenceData.details = cleanedCourseInfo || sessionTitle || 'Session'
          presenceData.state = cleanCountdown
            ? `${questionNumber || 'Session en cours'} • ${cleanCountdown}`
            : questionNumber || 'Session en cours'
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
