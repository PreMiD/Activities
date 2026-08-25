const presence = new Presence({
  clientId: "1541863227976060999",
})

const NOTEBOOK_LM_ICON = "https://i.imgur.com/C1Nq0Zf.jpeg"

let studyStartedAt: number | undefined
let activeNotebookKey: string | undefined

function cleanText(value?: string | null): string | undefined {
  const text = value?.replace(/\s+/g, " ").trim()
  return text || undefined
}

function getNotebookTitle(): string | undefined {
  const selectors = [
    '[data-testid="notebook-title"]',
    '[data-test-id="notebook-title"]',
    '[aria-label*="Notebook title" i]',
    'input[aria-label*="Notebook" i]',
    'textarea[aria-label*="Notebook" i]',
    "h1",
  ]

  for (const selector of selectors) {
    const element = document.querySelector<HTMLElement>(selector)
    const title = cleanText(
      element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
        ? element.value
        : element?.textContent,
    )

    if (title && !/^(notebooklm|google notebooklm)$/i.test(title)) return title
  }

  const pageTitle = cleanText(document.title)
  if (!pageTitle) return undefined

  return cleanText(
    pageTitle
      .replace(/\s*[|·–—-]\s*(google\s*)?notebooklm\s*$/i, "")
      .replace(/^(google\s*)?notebooklm\s*[|·–—-]\s*/i, ""),
  )
}

function isNotebookOpen(): boolean {
  const path = location.pathname
  return /\/notebook\//i.test(path) || /\/notebooks?\//i.test(path)
}

presence.on("UpdateData", () => {
  const presenceData: PresenceData = {
    type: 0,
    largeImageKey: NOTEBOOK_LM_ICON,
    details: "Studying in NotebookLM",
  }

  if (isNotebookOpen()) {
    const notebookKey = location.pathname
    if (activeNotebookKey !== notebookKey) {
      activeNotebookKey = notebookKey
      studyStartedAt = Date.now()
    }

    const notebookTitle = getNotebookTitle()
    presenceData.state = notebookTitle
      ? `Notebook: ${notebookTitle}`
      : "Notebook open"
    presenceData.startTimestamp = studyStartedAt
    presenceData.buttons = [
      {
        label: "Open NotebookLM",
        url: location.href,
      },
    ]
  } else {
    activeNotebookKey = undefined
    studyStartedAt = undefined
    presenceData.state = "Browsing notebooks"
    presenceData.buttons = [
      {
        label: "Open NotebookLM",
        url: "https://notebook.google.com/",
      },
    ]
  }

  presence.setActivity(presenceData)
})
