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

const browsingTimestamp = getGlobalStartTimestamp()
let lastSignature = ''

function getText(selector: string): string {
  return document.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() || ''
}

function extractCountdown(): string {
  const raw = getText('#countdown')
  const match = raw.match(/(\d+:\d{2}:\d{2})/)
  return match?.[1] || ''
}

function getCourseInfo(): string {
  const courseInfo
    = document.querySelector('.card .text-muted.text-end u')?.parentElement?.textContent?.trim()
      || getText('.text-muted.px-2.fst-italic.py-1.text-end')
      || getText('#courses-nav .nav-link.active')
      || ''

  return courseInfo.replace(/\s+/g, ' ').trim()
}

function joinStateParts(parts: Array<string | false | null | undefined>): string | undefined {
  const filtered = parts.filter(Boolean) as string[]
  return filtered.length > 0 ? filtered.join(' • ') : undefined
}

function cleanCourseTitle(text: string): string {
  return text
    .replace(/^UE\s*\d*\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function hasVisibleSessionInfo(
  showCourseName: boolean,
  showSessionType: boolean,
  showQuestionNumber: boolean,
  showQcmCountdown: boolean,
): boolean {
  return showCourseName || showSessionType || showQuestionNumber || showQcmCountdown
}

function withEmoji(text: string, emoji: string): string {
  return `${emoji} ${text}`
}

async function updatePresence(): Promise<void> {
  const [
    showQcmCountdown,
    showCourseName,
    showSessionType,
    showQuestionNumber,
  ] = await Promise.all([
    presence.getSetting<boolean>("showQcmCountdown"),
    presence.getSetting<boolean>("showCourseName"),
    presence.getSetting<boolean>("showSessionType"),
    presence.getSetting<boolean>("showQuestionNumber"),
  ])

  const hasVisibleInfo = hasVisibleSessionInfo(
    showCourseName,
    showSessionType,
    showQuestionNumber,
    showQcmCountdown,
  )

  const { pathname } = document.location
  const pageTitle = document.title?.replace(/^Vitamine\s*·\s*/i, '').trim() || 'Vitamine'

  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/Vitamine/assets/logo.png',
    details: 'Vitamine',
    startTimestamp: browsingTimestamp,
  }

  switch (true) {
    case pathname === '/':
      presenceData.details = withEmoji('Menu principal', '🏠')
      presenceData.state = 'Page d’accueil'
      break

    case pathname.startsWith('/anchoring'):
      presenceData.details = withEmoji('Ancrage', '🧠')
      if (showSessionType) {
        presenceData.state = 'Mode ancrage'
      }
      break

    case pathname.startsWith('/bank'):
      presenceData.details = withEmoji('Banque de QCM', '📚')
      if (showSessionType) {
        presenceData.state = 'Banque'
      }
      break

    case pathname.startsWith('/test'):
      presenceData.details = withEmoji('Épreuves', '📝')
      if (showSessionType) {
        presenceData.state = 'Consultation des épreuves'
      }
      break

    case pathname.startsWith('/annal'):
      presenceData.details = withEmoji('Annales', '📖')
      if (showSessionType) {
        presenceData.state = 'Consultation des annales'
      }
      break

    case pathname.startsWith('/course'): {
      const ueTitle = getText('h1.h3') || pageTitle || 'Cours'
      const activeCourse
        = getText('#courses-nav .nav-link.active')
          || getText('.pdf-file:not(.d-none) h4')
          || 'Consultation du cours'

      presenceData.details = showCourseName
        ? withEmoji(cleanCourseTitle(ueTitle), '📘')
        : withEmoji('Cours', '📘')

      presenceData.state = showSessionType ? activeCourse : undefined
      break
    }

    case pathname.startsWith('/session/'): {
      const sessionTitle
        = getText('h1')
          || getText('.anchoring-title')
          || pageTitle
          || 'Session'

      const courseInfo = getCourseInfo()
      const cleanCountdown = extractCountdown()
      const questionNumber = getText('.card-header strong')

      const isExam = /épreuve|qcm|pass|ue\d+/i.test(sessionTitle)
      const isAnchoring = /ancrage/i.test(sessionTitle)
      const isBank = /banque/i.test(sessionTitle)

      if (!hasVisibleInfo) {
        if (isExam) {
          presenceData.details = '📝 Épreuve en cours'
        }
        else if (isAnchoring) {
          presenceData.details = '🧠 Ancrage'
        }
        else if (isBank) {
          presenceData.details = '📚 Banque de QCM'
        }
        else {
          presenceData.details = '📖 Révision'
        }

        delete presenceData.state
        break
      }

      const courseTitle = cleanCourseTitle(courseInfo || sessionTitle)

      presenceData.details = showCourseName
        ? withEmoji(courseTitle, '📘')
        : withEmoji('Vitamine', '💜')

      presenceData.state = joinStateParts([
        showSessionType && (isExam ? 'Épreuve' : isAnchoring ? 'Ancrage' : 'Session'),
        showQuestionNumber && questionNumber,
        showQcmCountdown && cleanCountdown,
      ])

      break
    }

    default:
      presenceData.details = withEmoji(pageTitle || 'Vitamine', '💜')
      if (showSessionType) {
        presenceData.state = getText('h1') || pathname
      }
  }

  if (!presenceData.state) {
    delete presenceData.state
  }

  const signature = JSON.stringify({
    path: location.pathname,
    details: presenceData.details,
    state: presenceData.state ?? null,
  })

  if (signature === lastSignature) {
    return
  }

  lastSignature = signature

  if (presenceData.state || presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
}

presence.on('UpdateData', updatePresence)

