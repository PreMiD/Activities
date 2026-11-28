const presence = new Presence({
  // Applicazione Discord del sito: il suo nome compare come «Sta giocando a …»
  clientId: '1329118940110127204',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  // 512×512 obbligatorio per pmd; il GIF animato resta solo in metadata (logo negozio)
  Logo = 'https://files.catbox.moe/adu4lq.png',
}

/** Stato scritto dal sito stesso (Music Quiz: quiz, domanda, punti) in <html data-vc-presence="…"> */
interface SitePresence {
  details: string
  state?: string
  image?: string
  imageText?: string
  startedAt?: number
}

function readSitePresence(): SitePresence | null {
  const raw = document.documentElement.dataset.vcPresence
  if (!raw)
    return null
  try {
    const parsed = JSON.parse(raw) as SitePresence
    return parsed && typeof parsed.details === 'string' ? parsed : null
  }
  catch {
    return null
  }
}

/** Nome della pagina quando il sito non dice niente di preciso (le pagine hanno anche nomi tradotti) */
const PAGES: Record<string, string> = {
  'wiki': 'Legge la Wiki',
  'wordle': 'Gioca a Wordle',
  'music-quiz': 'Music Quiz',
  'bacheca': 'Guarda la bacheca',
  'classifiche': 'Guarda le classifiche',
  'regole': 'Legge le regole',
  'faq': 'Legge le domande frequenti',
  'chi-siamo': 'Scopre la community',
  'sponsor': 'Guarda gli sponsor',
  'vote': 'Vota il server',
  'recensioni': 'Legge le recensioni',
  'donazioni': 'Sostiene il server',
  'perks': 'Guarda i vantaggi',
  'ruoli': 'Guarda i ruoli',
  'feedback': 'Manda un suggerimento',
  'tickets': 'Apre un ticket',
  'candidature': 'Si candida allo staff',
  'appelli': 'Scrive un appello',
  'dashboard': 'Nella dashboard',
  'confessionale': 'Nel confessionale',
  'albero': 'Decora l’albero',
  'wrapped': 'Guarda il suo Wrapped',
  'evento': 'All’evento',
}

function pageTitle(): string {
  const title = document.title || ''
  const sep = title.includes('ǀ') ? 'ǀ' : title.includes('|') ? '|' : ''
  const tail = sep ? title.split(sep).pop()!.trim() : ''
  return tail || 'Home'
}

presence.on('UpdateData', async () => {
  const [showButtons, showQuiz] = await Promise.all([
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showQuiz'),
  ])

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  // /it/music-quiz/… → music-quiz (il primo pezzo è la lingua)
  const parts = document.location.pathname.split('/').filter(Boolean)
  if (parts[0] && /^[a-z]{2}$/.test(parts[0]))
    parts.shift()
  const section = parts[0] || ''

  const site = readSitePresence()
  if (site && (showQuiz || section !== 'music-quiz')) {
    presenceData.details = site.details
    if (site.state)
      presenceData.state = site.state
    if (site.image && /^https:\/\//.test(site.image)) {
      presenceData.largeImageKey = site.image
      presenceData.smallImageKey = ActivityAssets.Logo
      presenceData.smallImageText = 'Vinili & Caffè'
    }
    if (site.startedAt)
      presenceData.startTimestamp = Math.floor(site.startedAt / 1000)
  }
  else {
    presenceData.details = section ? PAGES[section] || 'Sul sito' : 'Nella home'
    if (section)
      presenceData.state = pageTitle()
  }

  // regole di PreMiD: niente pulsante verso la pagina principale
  if (showButtons && section) {
    presenceData.buttons = [{ label: 'Apri la pagina', url: document.location.href }]
  }

  presence.setActivity(presenceData)
})
