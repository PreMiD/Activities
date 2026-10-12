import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1524027844320301286',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

const LOGO = 'https://lss.trophynetwork.de/premid/leitstellenspiel-logo.png'

type Strings = Record<
  | 'dispatch' | 'mission' | 'building' | 'vehicle' | 'build' | 'alliance' | 'allianceForum' | 'allianceChat'
  | 'schooling' | 'missions' | 'toplist' | 'overview' | 'profile' | 'credits' | 'coins' | 'messages' | 'tasks'
  | 'aao' | 'settings' | 'browsing' | 'openMissions' | 'credit',
  string
>

let strings: Strings | null = null
let oldLang: string | null = null

async function getStrings(): Promise<Strings> {
  return presence.getStrings({
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
    profile: 'leitstellenspiel.profile',
    credits: 'leitstellenspiel.credits',
    coins: 'leitstellenspiel.coins',
    messages: 'leitstellenspiel.messages',
    tasks: 'leitstellenspiel.tasks',
    aao: 'leitstellenspiel.aao',
    settings: 'leitstellenspiel.settings',
    browsing: 'leitstellenspiel.browsing',
    openMissions: 'leitstellenspiel.openMissions',
    credit: 'leitstellenspiel.credit',
  }) as Promise<Strings>
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

presence.on('UpdateData', async () => {
  const [lang, showMission, showAddress, showNames, showStats, showTimestamp] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('showMission'),
    presence.getSetting<boolean>('showAddress'),
    presence.getSetting<boolean>('showNames'),
    presence.getSetting<boolean>('showStats'),
    presence.getSetting<boolean>('showTimestamp'),
  ])

  if (!strings || oldLang !== lang) {
    oldLang = lang
    strings = await getStrings()
  }
  const t = strings

  const presenceData: PresenceData = {
    name: 'Leitstellenspiel',
    type: ActivityType.Playing,
    largeImageKey: LOGO,
    startTimestamp: browsingTimestamp,
  }

  const { doc, path } = activeDocument()
  const stats = (): string | undefined => {
    if (!showStats)
      return undefined
    const open = document.querySelectorAll('#mission_list .missionSideBarEntry').length
    const credits = text('.credits-value')
    const parts: string[] = []
    if (document.querySelector('#mission_list'))
      parts.push(t.openMissions.replace('{0}', `${open}`))
    if (credits)
      parts.push(t.credit.replace('{0}', credits))
    return parts.join(' · ') || undefined
  }

  if (/^\/missions\/\d+/.test(path)) {
    presenceData.details = t.mission
    if (showMission) {
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
    presenceData.state = stats()
  }
  else if (/^\/buildings\/\d+/.test(path)) {
    presenceData.details = t.building
    const name = text('h1', doc)
    if (showNames && name)
      presenceData.state = name.slice(0, 128)
  }
  else if (/^\/vehicles\/\d+/.test(path)) {
    presenceData.details = t.vehicle
    const name = text('h1.vehicle_caption', doc)
    if (showNames && name)
      presenceData.state = name.slice(0, 128)
  }
  else if (/^\/(?:alliance_threads|alliance_posts)/.test(path)) {
    presenceData.details = t.allianceForum
  }
  else if (/^\/alliance_messages/.test(path)) {
    presenceData.details = t.allianceChat
  }
  else if (/^\/(?:verband|alliances)/.test(path)) {
    presenceData.details = t.alliance
  }
  else if (/^\/(?:schoolings|alliance_schoolings)/.test(path)) {
    presenceData.details = t.schooling
  }
  else if (/^\/einsaetze/.test(path)) {
    presenceData.details = t.missions
  }
  else if (/^\/toplist/.test(path)) {
    presenceData.details = t.toplist
  }
  else if (/^\/leitstellenansicht/.test(path)) {
    presenceData.details = t.overview
    presenceData.state = stats()
  }
  else if (/^\/profile/.test(path)) {
    presenceData.details = t.profile
  }
  else if (/^\/credits/.test(path)) {
    presenceData.details = t.credits
  }
  else if (/^\/coins/.test(path)) {
    presenceData.details = t.coins
  }
  else if (/^\/messages/.test(path)) {
    presenceData.details = t.messages
  }
  else if (/^\/tasks/.test(path)) {
    presenceData.details = t.tasks
  }
  else if (/^\/aaos/.test(path)) {
    presenceData.details = t.aao
  }
  else if (/^\/(?:settings|users\/edit)/.test(path)) {
    presenceData.details = t.settings
  }
  else if (path === '/') {
    presenceData.details = t.dispatch
    presenceData.state = stats()
  }
  else {
    presenceData.details = t.browsing
  }

  if (!presenceData.state)
    delete presenceData.state
  if (!showTimestamp)
    delete presenceData.startTimestamp

  presence.setActivity(presenceData)
})
