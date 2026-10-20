import { ActivityType, Assets, StatusDisplayType } from 'premid'
import source from './Leitstellenspiel.json' with { type: 'json' }

const presence = new Presence({
  clientId: '1524027844320301286',
})
const slideshow = presence.createSlideshow()
const browsingTimestamp = Math.floor(Date.now() / 1000)

const GAME = 'https://www.leitstellenspiel.de'
const LOGO = 'https://lss.trophynetwork.de/premid/leitstellenspiel-logo.png'

type Strings = Record<
  | 'dispatch' | 'mission' | 'building' | 'vehicle' | 'build' | 'alliance' | 'allianceForum' | 'allianceChat'
  | 'schooling' | 'missions' | 'toplist' | 'overview' | 'credits' | 'coins' | 'messages' | 'tasks'
  | 'aao' | 'settings' | 'openMissions' | 'allianceMissions' | 'credit'
  | 'browsing' | 'viewProfile' | 'buttonViewGame' | 'buttonViewProfile' | 'readingThread' | 'readingDm',
  string
>

let strings: Strings | null = null
let oldLang: string | null = null

const STRING_KEYS = {
  dispatch: 'leitstellenspiel.dispatch',
  mission: 'leitstellenspiel.mission',
  building: 'leitstellenspiel.building',
  vehicle: 'leitstellenspiel.vehicle',
  build: 'leitstellenspiel.build',
  alliance: 'leitstellenspiel.alliance',
  allianceForum: 'leitstellenspiel.allianceForum',
  allianceChat: 'leitstellenspiel.allianceChat',
  schooling: 'leitstellenspiel.schooling',
  missions: 'leitstellenspiel.missions',
  toplist: 'leitstellenspiel.toplist',
  overview: 'leitstellenspiel.overview',
  credits: 'leitstellenspiel.credits',
  coins: 'leitstellenspiel.coins',
  messages: 'leitstellenspiel.messages',
  tasks: 'leitstellenspiel.tasks',
  aao: 'leitstellenspiel.aao',
  settings: 'leitstellenspiel.settings',
  openMissions: 'leitstellenspiel.openMissions',
  allianceMissions: 'leitstellenspiel.allianceMissions',
  credit: 'leitstellenspiel.credit',
  browsing: 'general.browsing',
  viewProfile: 'general.viewAProfile',
  buttonViewGame: 'general.buttonViewGame',
  buttonViewProfile: 'general.buttonViewProfile',
  readingThread: 'general.readingAThread',
  readingDm: 'general.readingADM',
} as const

const FALLBACK: Record<string, string> = {
  'general.browsing': 'Browsing...',
  'general.viewAProfile': 'Viewing a profile',
  'general.buttonViewGame': 'View Game',
  'general.buttonViewProfile': 'View Profile',
  'general.readingAThread': 'Reading a thread',
  'general.readingADM': 'Reading a DM',
}
for (const [key, value] of Object.entries(source as Record<string, { message: string }>))
  FALLBACK[key] = value.message

/** Translations that are not available yet in the selected language fall back to the English source. */
async function getStrings(): Promise<Strings> {
  const keys = STRING_KEYS
  const translated = await presence.getStrings(keys).catch(() => ({} as Record<string, string | undefined>)) as Record<string, string | undefined>
  const out = {} as Strings
  for (const [name, key] of Object.entries(keys) as [keyof Strings, string][])
    out[name] = translated[name] || FALLBACK[key] || key
  return out
}

function text(sel: string, root: Document = document): string {
  return root.querySelector(sel)?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
}

/** Missions and stations open in the game's lightbox (same-origin iframe) – use the topmost one if present. */
function activeDocument(): { doc: Document, path: string } {
  const frames = [...document.querySelectorAll<HTMLIFrameElement>('#lightbox_box iframe, iframe[id^="lightbox_iframe"]')]
  for (const frame of frames.reverse()) {
    try {
      const doc = frame.contentDocument
      const path = frame.contentWindow?.location.pathname
      if (doc && path && path !== 'blank' && path !== '/')
        return { doc, path }
    }
    catch {}
  }
  return { doc: document, path: document.location.pathname }
}

let userId: number | null = null

presence.on('UpdateData', async () => {
  const [lang, privacy, showMission, showAddress, showNames, showStats, showButtons, showTimestamp, showSlideshow, statusDisplay] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showMission'),
    presence.getSetting<boolean>('showAddress'),
    presence.getSetting<boolean>('showNames'),
    presence.getSetting<boolean>('showStats'),
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showSlideshow'),
    presence.getSetting<number>('statusDisplay'),
  ])

  if (!strings || oldLang !== lang) {
    oldLang = lang
    strings = await getStrings()
  }
  const t = strings

  userId ??= await presence.getPageVariable<{ user_id?: number }>('user_id')
    .then(v => (typeof v?.user_id === 'number' ? v.user_id : null))
    .catch(() => null)

  const presenceData: PresenceData = {
    name: 'Leitstellenspiel',
    type: ActivityType.Playing,
    largeImageKey: LOGO,
    largeImageUrl: GAME,
    detailsUrl: GAME,
    startTimestamp: browsingTimestamp,
    statusDisplayType: [StatusDisplayType.Name, StatusDisplayType.Details, StatusDisplayType.State][statusDisplay ?? 0] ?? StatusDisplayType.Name,
  }

  const { doc, path } = activeDocument()
  const openMissions = document.querySelectorAll('#mission_list .missionSideBarEntry').length
  const allianceMissions = document.querySelectorAll('#mission_list_alliance .missionSideBarEntry').length
  const credits = text('.credits-value')
  const stats = (): string | undefined => {
    if (privacy || !showStats)
      return undefined
    const parts: string[] = []
    if (document.querySelector('#mission_list'))
      parts.push(t.openMissions.replace('{0}', `${openMissions}`))
    if (credits)
      parts.push(t.credit.replace('{0}', credits))
    return parts.join(' · ') || undefined
  }
  let dispatchPage = false

  if (/^\/missions\/\d+/.test(path)) {
    presenceData.details = t.mission
    presenceData.smallImageKey = Assets.Live
    presenceData.smallImageText = t.mission
    if (showMission && !privacy) {
      const caption = text('#missionH1', doc)
      if (caption)
        presenceData.details = `🚨 ${caption}`.slice(0, 128)
      if (showAddress) {
        const address = text('#mission_general_info small', doc).split('|')[0]?.trim()
        if (address)
          presenceData.state = address.slice(0, 128)
      }
    }
    presenceData.state ??= stats()
  }
  else if (/^\/buildings\/new/.test(path)) {
    presenceData.details = t.build
    presenceData.smallImageKey = Assets.Writing
    presenceData.smallImageText = t.build
    presenceData.state = stats()
  }
  else if (/^\/buildings\/\d+/.test(path)) {
    presenceData.details = t.building
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = t.building
    const name = text('h1', doc)
    if (showNames && !privacy && name)
      presenceData.state = name.slice(0, 128)
  }
  else if (/^\/vehicles\/\d+/.test(path)) {
    presenceData.details = t.vehicle
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = t.vehicle
    const name = text('h1.vehicle_caption', doc)
    if (showNames && !privacy && name)
      presenceData.state = name.slice(0, 128)
    // the vehicle's official in-game graphic as large image
    const img = doc.querySelector<HTMLImageElement>('img.vehicle_image_reload')?.src
    if (!privacy && img && /^https:\/\//.test(img)) {
      presenceData.largeImageKey = img
      presenceData.smallImageKey = LOGO
      presenceData.smallImageText = 'Leitstellenspiel'
    }
  }
  else if (/^\/(?:alliance_threads|alliance_posts)/.test(path)) {
    presenceData.details = t.allianceForum
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = t.readingThread
  }
  else if (/^\/alliance_messages/.test(path)) {
    presenceData.details = t.allianceChat
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = t.allianceChat
  }
  else if (/^\/(?:verband|alliances)/.test(path)) {
    presenceData.details = t.alliance
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = t.alliance
  }
  else if (/^\/(?:schoolings|alliance_schoolings)/.test(path)) {
    presenceData.details = t.schooling
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = t.schooling
  }
  else if (/^\/einsaetze/.test(path)) {
    presenceData.details = t.missions
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = t.missions
  }
  else if (/^\/toplist/.test(path)) {
    presenceData.details = t.toplist
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = t.toplist
  }
  else if (/^\/leitstellenansicht/.test(path)) {
    presenceData.details = t.overview
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = t.overview
    presenceData.state = stats()
  }
  else if (/^\/profile/.test(path)) {
    presenceData.details = t.viewProfile
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = t.viewProfile
  }
  else if (/^\/credits/.test(path)) {
    presenceData.details = t.credits
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = t.credits
  }
  else if (/^\/coins/.test(path)) {
    presenceData.details = t.coins
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = t.coins
  }
  else if (/^\/messages/.test(path)) {
    presenceData.details = t.messages
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = t.readingDm
  }
  else if (/^\/tasks/.test(path)) {
    presenceData.details = t.tasks
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = t.tasks
  }
  else if (/^\/aaos/.test(path)) {
    presenceData.details = t.aao
    presenceData.smallImageKey = Assets.Writing
    presenceData.smallImageText = t.aao
  }
  else if (/^\/(?:settings|users\/edit)/.test(path)) {
    presenceData.details = t.settings
    presenceData.smallImageKey = Assets.Writing
    presenceData.smallImageText = t.settings
  }
  else if (path === '/') {
    presenceData.details = t.dispatch
    presenceData.smallImageKey = Assets.Live
    presenceData.smallImageText = t.dispatch
    presenceData.state = stats()
    dispatchPage = true
  }
  else {
    presenceData.details = t.browsing
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = t.browsing
  }

  if (!presenceData.state)
    delete presenceData.state
  if (!showTimestamp)
    delete presenceData.startTimestamp

  if (showButtons && !privacy) {
    presenceData.buttons = [{ label: t.buttonViewGame, url: GAME }]
    if (userId)
      presenceData.buttons.push({ label: t.buttonViewProfile, url: `${GAME}/profile/${userId}` })
  }

  // Dispatch center: rotate open missions · alliance missions · credits
  if (dispatchPage && showSlideshow && showStats && !privacy && document.querySelector('#mission_list')) {
    const slides: [string, string][] = [
      ['open', t.openMissions.replace('{0}', `${openMissions}`)],
      ['alliance', t.allianceMissions.replace('{0}', `${allianceMissions}`)],
    ]
    if (credits)
      slides.push(['credits', t.credit.replace('{0}', credits)])
    else
      slideshow.deleteSlide('credits')
    for (const [id, state] of slides)
      slideshow.addSlide(id, { ...presenceData, state }, 5000)
    presence.setActivity(slideshow)
    return
  }

  slideshow.deleteAllSlides()
  presence.setActivity(presenceData)
})
