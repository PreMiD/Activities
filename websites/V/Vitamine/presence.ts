const presence = new Presence({
  clientId: "1486144929213321357",
})

const GLOBAL_START_KEY = "vitamine_global_start_timestamp"

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
let lastSignature = ""

function getText(selector: string): string {
  return document.querySelector(selector)?.textContent?.replace(/\s+/g, " ").trim() || ""
}

function extractCountdown(): string {
  const raw = getText("#countdown")
  const match = raw.match(/(\d+:\d{2}:\d{2})/)
  return match?.[1] || ""
}

function getCourseInfo(): string {
  const courseInfo
    = document.querySelector(".card .text-muted.text-end u")?.parentElement?.textContent?.trim()
      || getText(".text-muted.px-2.fst-italic.py-1.text-end")
      || getText("#courses-nav .nav-link.active")
      || ""

  return courseInfo.replace(/\s+/g, " ").trim()
}

function joinStateParts(parts: Array<string | false | null | undefined>): string | undefined {
  const filtered = parts.filter(Boolean) as string[]
  return filtered.length > 0 ? filtered.join(" • ") : undefined
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
  const showQcmCountdown = await presence.getSetting<boolean>("showQcmCountdown")
  const showCourseName = await presence.getSetting<boolean>("showCourseName")
  const showSessionType = await presence.getSetting<boolean>("showSessionType")
  const showQuestionNumber = await presence.getSetting<boolean>("showQuestionNumber")

  const hasVisibleInfo = hasVisibleSessionInfo(
    showCourseName,
    showSessionType,
    showQuestionNumber,
    showQcmCountdown,
  )

  const { pathname } = document.location
  const pageText = document.body.textContent || ""
  const pageTitle = document.title?.replace(/^Vitamine\s*·\s*/i, "").trim() || "Vitamine"

  const presenceData: PresenceData = {
    largeImageKey: "https://cdn.rcd.gg/PreMiD/websites/V/Vitamine/assets/logo.png",
    details: "Vitamine",
    startTimestamp: browsingTimestamp,
  }

  switch (true) {
    case pathname === "/":
      presenceData.details = withEmoji("Menu principal", "🏠")
      presenceData.state = "Page d’accueil"
      break

    case pathname === "/anchoring/" || pathname.startsWith("/anchoring"):
      presenceData.details = withEmoji("Ancrage", "🧠")
      if (showSessionType) {
        presenceData.state = "Mode ancrage"
      }
      break

    case pathname === "/bank/" || pathname.startsWith("/bank"):
      presenceData.details = withEmoji("Banque de QCM", "📚")
      if (showSessionType) {
        presenceData.state = "Banque"
      }
      break

    case pathname === "/test/" || pathname.startsWith("/test"):
      presenceData.details = withEmoji("Épreuves", "📝")
      if (showSessionType) {
        presenceData.state = "Consultation des épreuves"
      }
      break

    case pathname === "/annal/" || pathname.startsWith("/annal"):
      presenceData.details = withEmoji("Annales", "📖")
      if (showSessionType) {
        presenceData.state = "Consultation des annales"
      }
      break

    case pathname === "/course/" || pathname.startsWith("/course"): {
      const ueTitle
        = getText("h1.h3")
          || pageTitle
          || "Cours"

      const activeCourse
        = getText("#courses-nav .nav-link.active")
          || getText(".pdf-file:not(.d-none) h4")
          || "Consultation du cours"

      presenceData.details = showCourseName
        ? withEmoji(ueTitle, "📘")
        : withEmoji("Cours", "📘")

      presenceData.state = showSessionType ? activeCourse : undefined
      break
    }

    case pathname === "/comment/list" || pathname.startsWith("/comment/list"):
      presenceData.details = withEmoji("Commentaires", "💬")
      if (showSessionType) {
        presenceData.state = "Liste des commentaires"
      }
      break

    case pathname.startsWith("/comment/"): {
      const commentId = pathname.match(/\/comment\/(\d+)/)?.[1]
      const commentTitle
        = getText("h1")
          || getText(".card h4")
          || getText(".card-title")

      presenceData.details = withEmoji("Commentaires", "💬")
      presenceData.state = showSessionType
        ? (commentTitle || (commentId ? `Commentaire #${commentId}` : "Lecture des commentaires"))
        : undefined
      break
    }

    case pathname === "/results/" || pathname.startsWith("/results"):
      presenceData.details = withEmoji("Résultats", "📊")
      if (showSessionType) {
        presenceData.state = "Consultation des résultats"
      }
      break

    case pathname === "/settings/card" || pathname.startsWith("/settings/card"):
      presenceData.details = withEmoji("Carte d’adhérent", "🪪")
      if (showSessionType) {
        presenceData.state = "Consultation de la carte"
      }
      break

    case pathname === "/settings/" || pathname.startsWith("/settings"):
      presenceData.details = withEmoji("Paramètres", "⚙️")
      if (showSessionType) {
        presenceData.state = "Modification des paramètres"
      }
      break

    case pathname === "/logout" || pathname.startsWith("/logout"):
      presenceData.details = withEmoji("Déconnexion", "🚪")
      if (showSessionType) {
        presenceData.state = "Quitte la plateforme"
      }
      break

    case pathname === "/cgu" || pathname.startsWith("/cgu"):
      presenceData.details = withEmoji("CGU", "📜")
      if (showSessionType) {
        presenceData.state = "Lecture des conditions d’utilisation"
      }
      break

    case pathname.startsWith("/session/"): {
      const sessionTitle
        = getText("h1")
          || getText(".anchoring-title")
          || pageTitle
          || "Session"

      const courseInfo = getCourseInfo()
      const cleanCountdown = extractCountdown()
      const questionNumber = getText(".card-header strong")

      const questionCards = Array.from(document.querySelectorAll('[id^="mcq-"], .card[id^="mcq-"]'))
      const visibleQuestionCards = questionCards.filter((el) => {
        const htmlEl = el as HTMLElement
        return htmlEl.offsetParent !== null
      })

      const questionCount = visibleQuestionCards.length

      const hasSubmitButton = Array.from(document.querySelectorAll("button, input[type='submit']")).some((el) => {
        return /valider la réponse|valider|terminer/i.test(el.textContent || "")
      })

      const looksLikeExamTitle
        = /séance|seance|épreuve|epreuve|qcm n°|qcm n|pass\s*-|ue\d+/i.test(sessionTitle)

      const looksLikeExamByPage
        = !!cleanCountdown && (questionCount >= 2 || looksLikeExamTitle || hasSubmitButton)

      const isExam = looksLikeExamTitle || looksLikeExamByPage
      const isAnchoring = /ancrage/i.test(sessionTitle) || /questions?\s+restantes/i.test(pageText)
      const isBank = /banque/i.test(sessionTitle)

      if (!hasVisibleInfo) {
        if (isExam) {
          presenceData.details = withEmoji("Épreuve en cours", "📝")
        }
        else if (isAnchoring) {
          presenceData.details = withEmoji("Ancrage", "🧠")
        }
        else if (isBank) {
          presenceData.details = withEmoji("Banque de QCM", "📚")
        }
        else {
          presenceData.details = withEmoji("Révision sur Vitamine", "📖")
        }

        delete presenceData.state
        break
      }

      presenceData.details = showCourseName
        ? withEmoji(courseInfo || sessionTitle || "Session", "📘")
        : withEmoji("Vitamine", "💜")

      if (isExam) {
        presenceData.state = joinStateParts([
          showSessionType && "Épreuve en cours",
          showQuestionNumber && questionNumber,
          showQcmCountdown && cleanCountdown,
        ])
      }
      else if (isAnchoring) {
        presenceData.state = joinStateParts([
          showSessionType && "Session ancrage",
          showQuestionNumber && questionNumber,
          showQcmCountdown && cleanCountdown,
        ])
      }
      else if (isBank) {
        presenceData.state = joinStateParts([
          showSessionType && "Session banque",
          showQuestionNumber && questionNumber,
          showQcmCountdown && cleanCountdown,
        ])
      }
      else {
        presenceData.state = joinStateParts([
          showSessionType && "Session en cours",
          showQuestionNumber && questionNumber,
          showQcmCountdown && cleanCountdown,
        ])
      }

      break
    }

    case pathname.startsWith("/files/course/"): {
      const filename = pathname.split("/").pop() || "Fichier"
      presenceData.details = withEmoji("Fichier de cours", "📄")
      presenceData.state = showSessionType ? decodeURIComponent(filename) : undefined
      break
    }

    default: {
      const h1 = getText("h1")
      presenceData.details = withEmoji(pageTitle || "Vitamine", "💜")
      presenceData.state = showSessionType ? (h1 || pathname) : undefined
      break
    }
  }

  if (!presenceData.state) {
    delete presenceData.state
  }

  const signature = JSON.stringify({
    path: location.pathname,
    title: document.title,
    details: presenceData.details,
    state: presenceData.state ?? null,
    startTimestamp: presenceData.startTimestamp ?? null,
    showQcmCountdown,
    showCourseName,
    showSessionType,
    showQuestionNumber,
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

presence.on("UpdateData", async () => {
  await updatePresence()
})

const originalPushState = history.pushState
history.pushState = function (...args) {
  originalPushState.apply(this, args)
  setTimeout(() => {
    void updatePresence()
  }, 50)
}

const originalReplaceState = history.replaceState
history.replaceState = function (this: History, ...args: Parameters<History["replaceState"]>) {
  originalReplaceState.apply(this, args)
  setTimeout(() => {
    void updatePresence()
  }, 50)
}

window.addEventListener("popstate", () => {
  setTimeout(() => {
    void updatePresence()
  }, 50)
})

window.addEventListener("hashchange", () => {
  setTimeout(() => {
    void updatePresence()
  }, 50)
})

const observer = new MutationObserver(() => {
  void updatePresence()
})

observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
})

setInterval(() => {
  void updatePresence()
}, 1000)