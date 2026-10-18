import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1561263394626076772', // Discord Developer Portal > New Application named "Gaijin Mode"
})

enum ActivityAssets {
  Logo = 'https://www.gaijinmode.com/assets/logos/logo.png',
}

type Section
  = | 'landing'
    | 'auth'
    | 'pricing'
    | 'terms'
    | 'blog'
    | 'invite'
    | 'map'
    | 'study'
    | 'scene'
    | 'other'

/**
 * CONFIRMED routes: /, /auth/*, /pricing, /terms, /blog/*, /i/<code>, /map, /study, /scene/<id>
 * Anything else (cafe, future pages) falls into 'other' and shows the generic
 * "Studying Japanese" placeholder, so new pages never break the presence.
 */
const ROUTES: { section: Section, test: RegExp }[] = [
  { section: 'landing', test: /^\/?$/ },
  { section: 'auth', test: /^\/auth(\/|$)/ },
  { section: 'pricing', test: /^\/pricing(\/|$)/ },
  { section: 'terms', test: /^\/terms(\/|$)/ },
  { section: 'blog', test: /^\/blog(\/|$)/ },
  { section: 'invite', test: /^\/i\// },
  { section: 'map', test: /^\/map(\/|$)/ },
  { section: 'study', test: /^\/study(\/|$)/ },
  { section: 'scene', test: /^\/scene\// },
]

/**
 * Scene ids look like "conv_store_1_lv_1" = <type>_<place>_<number>_lv_<level>.
 * Only "store" is confirmed. The rest are guesses from the site's marketing copy
 * (airport, train station, restaurant). Unknown places get a prettified fallback.
 */
const PLACES: Record<string, { jp: string, en: string }> = {
  store: { jp: 'コンビニ', en: 'Convenience Store' },
  airport: { jp: '空港', en: 'Airport' },
  station: { jp: '駅', en: 'Train Station' },
  restaurant: { jp: 'レストラン', en: 'Restaurant' },
  cafe: { jp: 'カフェ', en: 'Cafe' },
}

const SCENE_TYPE_PREFIXES = new Set(['conv', 'conversation', 'scene', 'story', 'free'])

const BLOG_TITLES: Record<string, string> = {
  'preseed': 'Pre-seed and Gaijin Mode Alpha',
  'language-exchange': 'Language Cafe announcement',
}

interface View {
  jp: string // fancy line 1 (Japanese)
  en: string // fancy line 2 (English)
  plainDetails: string
  plainState?: string
  icon: string
}

let lastKey = ''
let sectionStart = Math.floor(Date.now() / 1000)

function clamp(text: string, max = 128): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function titleCase(slug: string): string {
  return slug.replace(/[-_]+/g, ' ').trim().replace(/\b\w/g, c => c.toUpperCase())
}

function parseScene(id?: string): { place?: { jp?: string, en: string }, level?: number } {
  if (!id)
    return {}
  let clean = id
  try {
    clean = decodeURIComponent(id)
  }
  catch {}
  const tokens = clean.toLowerCase().split('_').filter(Boolean)

  const lvIdx = tokens.findIndex(t => t === 'lv' || t === 'level')
  const levelToken = lvIdx !== -1 ? tokens[lvIdx + 1] : undefined
  const level = levelToken && /^\d+$/.test(levelToken) ? Number(levelToken) : undefined

  const placeKey = tokens.find(
    t => !SCENE_TYPE_PREFIXES.has(t) && !/^\d+$/.test(t) && t !== 'lv' && t !== 'level',
  )
  if (!placeKey)
    return { level }
  return { place: PLACES[placeKey] ?? { en: titleCase(placeKey) }, level }
}

function resolveSection(pathname: string): Section {
  return ROUTES.find(r => r.test.test(pathname))?.section ?? 'other'
}

presence.on('UpdateData', async () => {
  const [privacy, fancy, showTimestamp, showButtons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('fancy'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showButtons'),
  ])

  const { pathname } = document.location
  const segments = pathname.split('/').filter(Boolean)
  const section = resolveSection(pathname)

  let view: View
  let subKey = ''

  switch (section) {
    case 'landing':
      view = { jp: 'ようこそ', en: 'Browsing Gaijin Mode', plainDetails: 'Browsing Gaijin Mode', plainState: 'Homepage', icon: Assets.Viewing }
      break
    case 'auth':
      view = { jp: 'ログイン中', en: 'Signing in', plainDetails: 'Signing in', plainState: 'Joining Gaijin Mode', icon: Assets.Viewing }
      break
    case 'pricing':
      view = { jp: '料金プラン', en: 'Looking at pricing', plainDetails: 'Browsing Gaijin Mode', plainState: 'Looking at pricing', icon: Assets.Viewing }
      break
    case 'terms':
      view = { jp: '利用規約', en: 'Reading the terms', plainDetails: 'Browsing Gaijin Mode', plainState: 'Reading the terms', icon: Assets.Reading }
      break
    case 'blog': {
      const slug = segments[1]
      const title = !privacy && slug ? (BLOG_TITLES[slug] ?? titleCase(slug)) : undefined
      subKey = slug ?? ''
      view = { jp: 'ブログ', en: title ?? 'Reading the blog', plainDetails: 'Reading the blog', plainState: title, icon: Assets.Reading }
      break
    }
    case 'invite':
      view = { jp: 'ご招待', en: 'Opening an invite link', plainDetails: 'Opening an invite link', plainState: 'Joining Gaijin Mode', icon: Assets.Viewing }
      break
    case 'map':
      view = { jp: '東京マップ', en: 'Choosing where to go', plainDetails: 'Exploring Tokyo', plainState: 'Choosing where to go', icon: Assets.Search }
      break
    case 'study':
      view = { jp: '勉強中', en: 'Study Room', plainDetails: 'In the Study Room', plainState: 'Studying Japanese', icon: Assets.Reading }
      break
    case 'scene': {
      subKey = segments[1] ?? ''
      if (privacy) {
        view = { jp: '会話練習', en: 'Practicing a conversation', plainDetails: 'Practicing a conversation', plainState: 'Speaking Japanese', icon: Assets.Call }
        break
      }
      const { place, level } = parseScene(segments[1])
      const levelText = level !== undefined ? `Level ${level}` : undefined
      const en = [place?.en ?? 'Speaking practice', levelText].filter(Boolean).join(' ・ ')
      view = {
        jp: place?.jp ?? '会話練習',
        en,
        plainDetails: place ? `Practicing: ${place.en}` : 'Practicing a conversation',
        plainState: levelText ?? 'Speaking Japanese',
        icon: Assets.Call,
      }
      break
    }
    default:
      // Generic placeholder for any page that is not mapped yet
      view = { jp: '日本語を勉強中', en: 'Studying Japanese', plainDetails: 'Studying Japanese', plainState: 'Gaijin Mode', icon: Assets.Reading }
  }

  // Reset the elapsed timer whenever the section or subject changes
  const key = `${section}|${subKey}`
  if (key !== lastKey) {
    lastKey = key
    sectionStart = Math.floor(Date.now() / 1000)
  }

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'Gaijin Mode',
    smallImageKey: view.icon,
    details: clamp(fancy ? `✦ ${view.jp} ✦` : view.plainDetails),
  }

  const state = fancy ? `〔 ${view.en} 〕` : view.plainState
  if (state)
    presenceData.state = clamp(state)

  if (showTimestamp)
    presenceData.startTimestamp = sectionStart

  if (showButtons && !privacy && section !== 'auth') {
    presenceData.buttons = [
      { label: 'Try Gaijin Mode', url: 'https://www.gaijinmode.com/' },
    ]
  }

  presence.setActivity(presenceData)
})
