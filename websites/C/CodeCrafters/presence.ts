import { Assets } from 'premid'

// Setup

const presence = new Presence({
  clientId: '1575345735249961142',
})

enum ActivityAssets {
  Logo = 'https://raw.githubusercontent.com/dizzi1222/premid-activities/premid-assets/CodeCrafters/logo.png',
}

const SITE_URL = 'https://app.codecrafters.io'

/** Official challenge names by course slug (`/courses/<slug>/...`): the page itself may be machine-translated. */
const COURSES: Readonly<Record<string, string>> = {
  'bittorrent': 'Build your own BitTorrent',
  'claude-code': 'Build your own Claude Code',
  'dns-server': 'Build your own DNS server',
  'docker': 'Build your own Docker',
  'firewall': 'Build your own Firewall',
  'git': 'Build your own Git',
  'grep': 'Build your own grep',
  'http-server': 'Build your own HTTP server',
  'inference-engine': 'Build your own Inference Engine',
  'interpreter': 'Build your own Interpreter',
  'kafka': 'Build your own Kafka',
  'redis': 'Build your own Redis',
  'shell': 'Build your own Shell',
  'sqlite': 'Build your own SQLite',
  'tokenizer': 'Build your own Tokenizer',
}

/** A language of the language tracks. */
interface ILanguage {
  name: string
  /** Hash of its color logo, which the site serves as `/assets/<hash>.svg`. */
  logo?: string
}

/** Languages by slug (`/tracks/<slug>`, `/leaderboards/<slug>`). */
const LANGUAGES: Readonly<Record<string, ILanguage>> = {
  ada: { name: 'Ada' },
  c: { name: 'C', logo: '1291b2aaec6fcc63f4e7' },
  clojure: { name: 'Clojure', logo: '557d017292b8df305f25' },
  commonlisp: { name: 'Common Lisp' },
  cpp: { name: 'C++', logo: '89dc6a45bc1a19baf887' },
  crystal: { name: 'Crystal', logo: '751fed758474dc533c32' },
  csharp: { name: 'C#', logo: '24c882fe3d995b5b155d' },
  dart: { name: 'Dart', logo: '51a4068d0ed6b786029c' },
  elixir: { name: 'Elixir', logo: '67798d0c0566c0645e9f' },
  fsharp: { name: 'F#' },
  gleam: { name: 'Gleam', logo: 'b08d2d6e06799e2cbe8a' },
  go: { name: 'Go', logo: '6798000a04bf2feddac1' },
  haskell: { name: 'Haskell', logo: '799bf43d1ee2f2c4156c' },
  java: { name: 'Java', logo: '9d36f32a0580b5442374' },
  javascript: { name: 'JavaScript', logo: 'f1790719e061ba55dd56' },
  kotlin: { name: 'Kotlin', logo: '9dd103f4f5637ee1087e' },
  mojo: { name: 'Mojo' },
  nim: { name: 'Nim', logo: '1decd846cccedc85e829' },
  ocaml: { name: 'OCaml', logo: '7c9fe6248a01f3d56fde' },
  odin: { name: 'Odin', logo: 'c2c9e0b96fa26ce5f694' },
  php: { name: 'PHP', logo: 'a5c58613732f41f3b906' },
  python: { name: 'Python', logo: '5fdb90721e8698717dd5' },
  racket: { name: 'Racket' },
  reasonml: { name: 'ReasonML', logo: '6ffc2500b7c869585711' },
  ruby: { name: 'Ruby', logo: 'fa6702f1e8503cbeea10' },
  rust: { name: 'Rust', logo: '1c2176f0b8e5a92443a5' },
  scala: { name: 'Scala', logo: '0346c013a531b5c692ee' },
  swift: { name: 'Swift', logo: 'fa78c7c620b117800d4a' },
  typescript: { name: 'TypeScript', logo: 'b113a6488a85dd63c1d7' },
  zig: { name: 'Zig', logo: 'eb663d442c2bc099bbbf' },
}

// Strings

/**
 * Fetches the texts in the language chosen in the activity settings
 * (common `general.*` strings plus this activity's `codecrafters.*` strings).
 * @returns Translated texts, keyed like the object below.
 */
async function getStrings() {
  return presence.getStrings({
    browsing: 'general.browsing',
    readingAbout: 'general.readingAbout',
    viewProfile: 'general.viewProfile',
    account: 'general.viewAccount',
    buttonReadArticle: 'general.buttonReadArticle',
    buttonViewProfile: 'general.buttonViewProfile',
    catalog: 'codecrafters.catalog',
    challenge: 'codecrafters.challenge',
    solvingChallenge: 'codecrafters.solvingChallenge',
    solvingStage: 'codecrafters.solvingStage',
    settingUp: 'codecrafters.settingUp',
    completed: 'codecrafters.completed',
    tracks: 'codecrafters.tracks',
    track: 'codecrafters.track',
    leaderboard: 'codecrafters.leaderboard',
    concepts: 'codecrafters.concepts',
    walkthrough: 'codecrafters.walkthrough',
    contests: 'codecrafters.contests',
    roadmap: 'codecrafters.roadmap',
    membership: 'codecrafters.membership',
    badges: 'codecrafters.badges',
    buttonViewChallenge: 'codecrafters.buttonViewChallenge',
    buttonViewTrack: 'codecrafters.buttonViewTrack',
  })
}

// Types

/** Texts returned by {@link getStrings}. */
type Strings = Awaited<ReturnType<typeof getStrings>>

/** Key of a text in {@link Strings}. */
type StringKey = keyof Strings

/** Resolves a text key in the chosen language. */
type Translator = (key: StringKey) => string

/** A presence button (Discord shows at most two). */
interface IButton {
  label: string
  url: string
}

/** What the current page means for the presence. */
interface IRoute {
  /** Top line: what the user is doing. */
  details: string
  /** Replaces `details` in privacy mode when it contains a name (e.g. the challenge). */
  privateDetails?: string
  /** Bottom line with names (stage, language...); hidden in privacy mode. */
  state?: string
  /** Small image (reading, writing...). */
  icon: Assets
  /** Language of the page; its logo replaces the small image outside privacy mode. */
  language?: ILanguage
  buttons?: IButton[]
  /** Pages sharing a key share the elapsed timer (e.g. every stage of one challenge). */
  timerKey: string
}

/** Input of every route matcher. */
interface IRouteContext {
  /** Path segments, e.g. `['courses', 'redis', 'stages', 'jm1']`. */
  segments: string[]
  t: Translator
}

/** Returns the route when it recognizes the page, `null` otherwise. */
type RouteMatcher = (ctx: IRouteContext) => IRoute | null

// Helpers

/**
 * Converts a kebab-case slug into Title Case.
 * @param slug e.g. `dns-server`.
 * @returns e.g. `Dns Server`.
 */
function titleCase(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Normalized text of the first element matching a selector.
 * @param selector CSS selector.
 * @returns Trimmed text, or `undefined` when missing/empty.
 */
function textOf(selector: string): string | undefined {
  return document.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() || undefined
}

/**
 * Official name of a challenge.
 * @param slug Course slug, e.g. `redis`.
 * @returns e.g. `Build your own Redis`.
 */
function courseName(slug: string): string {
  return COURSES[slug]
    ?? textOf('[data-test-repository-dropdown-trigger] h1')
    ?? `Build your own ${titleCase(slug)}`
}

/**
 * Language of the repository chosen in the challenge header ("using Rust").
 * @returns The language, or `undefined` before choosing one.
 */
function activeLanguage(): ILanguage | undefined {
  const name = textOf('[data-test-active-repository-name]')
    ?.replace(/\s*(?:\(.*\)|#\d+)$/, '')
    .toLowerCase()
  return name
    ? Object.values(LANGUAGES).find(language => language.name.toLowerCase() === name)
    : undefined
}

/**
 * Language with this slug, keeping unknown ones readable.
 * @param slug e.g. `cpp`.
 * @returns e.g. `{ name: 'C++', logo: '...' }`.
 */
function languageBySlug(slug: string): ILanguage {
  return LANGUAGES[slug] ?? {
    name: titleCase(slug),
  }
}

/**
 * PNG version of a language logo (Discord can't show SVG).
 * @param language Language with a known logo.
 * @returns Image URL, or `undefined` when the logo is unknown.
 */
function languageLogo(language: ILanguage): string | undefined {
  return language.logo
    ? `https://wsrv.nl/?url=app.codecrafters.io/assets/${language.logo}.svg&w=512&h=512&fit=contain&output=png`
    : undefined
}

/**
 * "View Challenge" button pointing to the overview of a challenge.
 * @param slug Course slug.
 * @param t Translator for the chosen language.
 * @returns A one-button list.
 */
function challengeButton(slug: string, t: Translator): IButton[] {
  return [
    {
      label: t('buttonViewChallenge'),
      url: `${SITE_URL}/courses/${slug}/overview`,
    },
  ]
}

// Routes

/** Steps of a challenge after `/courses/:slug/`: the state text, or `null` for the current stage. */
const COURSE_STEPS: Readonly<Record<string, StringKey | null>> = {
  'stages': null,
  'introduction': 'settingUp',
  'setup': 'settingUp',
  'completed': 'completed',
  'base-stages-completed': 'completed',
  'extension-completed': 'completed',
}

/** Pages that only depend on the first segment: [details key, icon]. */
const SECTIONS: Readonly<Record<string, readonly [StringKey, Assets]>> = {
  '': ['catalog', Assets.Search],
  'catalog': ['catalog', Assets.Search],
  'courses': ['catalog', Assets.Search],
  'tracks': ['tracks', Assets.Search],
  'concepts': ['concepts', Assets.Search],
  'roadmap': ['roadmap', Assets.Viewing],
  'pay': ['membership', Assets.Viewing],
  'gifts': ['membership', Assets.Viewing],
  'perks': ['membership', Assets.Viewing],
  'teams': ['membership', Assets.Viewing],
  'badges': ['badges', Assets.Viewing],
  'settings': ['account', Assets.Viewing],
}

/** A challenge: overview, setup, stages (instructions, code examples...) and completion pages. */
const matchCourse: RouteMatcher = ({ segments: [courses, slug, step], t }) => {
  if (courses !== 'courses' || !slug || step === 'admin')
    return null
  const name = courseName(slug)
  const buttons = challengeButton(slug, t)
  const timerKey = `course:${slug}`
  if (step === 'overview') {
    return {
      details: t('challenge'),
      state: name,
      icon: Assets.Viewing,
      buttons,
      timerKey,
    }
  }
  const stateKey = step === undefined
    ? null
    : COURSE_STEPS[step]
  if (stateKey === undefined)
    return null
  return {
    details: name,
    privateDetails: t('solvingChallenge'),
    state: stateKey
      ? t(stateKey)
      : textOf('[data-test-course-page-header] [data-test-step-name]') ?? t('solvingStage'),
    icon: stateKey === 'completed'
      ? Assets.Viewing
      : Assets.Writing,
    language: activeLanguage(),
    buttons,
    timerKey,
  }
}

/** A language track (`/tracks/rust`) or the AI engineering tracks. */
const matchTrack: RouteMatcher = ({ segments: [tracks, slug, aiTrack], t }) => {
  if (tracks !== 'tracks' || !slug)
    return null
  if (slug === 'ai-engineering') {
    return {
      details: t('track'),
      state: aiTrack
        ? textOf('h1') ?? titleCase(aiTrack)
        : 'AI Engineering',
      icon: Assets.Viewing,
      timerKey: 'site',
    }
  }
  const language = languageBySlug(slug)
  return {
    details: t('track'),
    state: language.name,
    icon: Assets.Viewing,
    language,
    buttons: [
      {
        label: t('buttonViewTrack'),
        url: `${SITE_URL}/tracks/${slug}`,
      },
    ],
    timerKey: 'site',
  }
}

/** Leaderboard of a language: `/leaderboards/:language`. */
const matchLeaderboard: RouteMatcher = ({ segments: [leaderboards, slug], t }) => {
  if (leaderboards !== 'leaderboards' || !slug)
    return null
  const language = languageBySlug(slug)
  return {
    details: t('leaderboard'),
    state: language.name,
    icon: Assets.Viewing,
    language,
    timerKey: 'site',
  }
}

/** Concepts, concept collections and code walkthroughs: the title is the page heading. */
const matchReading: RouteMatcher = ({ segments: [section, slug], t }) => {
  if (!slug)
    return null
  if (section === 'concepts') {
    return {
      details: t('readingAbout'),
      state: textOf('h1') ?? titleCase(slug),
      icon: Assets.Reading,
      buttons: [
        {
          label: t('buttonReadArticle'),
          url: `${SITE_URL}/concepts/${slug}`,
        },
      ],
      timerKey: `concept:${slug}`,
    }
  }
  if (section === 'collections') {
    return {
      details: t('concepts'),
      state: textOf('h1'),
      icon: Assets.Search,
      timerKey: 'site',
    }
  }
  if (section === 'walkthroughs') {
    return {
      details: t('walkthrough'),
      state: textOf('h1'),
      icon: Assets.Reading,
      timerKey: `walkthrough:${slug}`,
    }
  }
  return null
}

/** Public profile: `/users/:username`. */
const matchProfile: RouteMatcher = ({ segments: [users, username], t }) => {
  if (users !== 'users' || !username)
    return null
  return {
    details: t('viewProfile'),
    state: username,
    icon: Assets.Viewing,
    buttons: [
      {
        label: t('buttonViewProfile'),
        url: `${SITE_URL}/users/${username}`,
      },
    ],
    timerKey: 'site',
  }
}

/** Contests list and contest pages. */
const matchContests: RouteMatcher = ({ segments: [contests, slug], t }) => {
  if (contests !== 'contests' && contests !== 'contest')
    return null
  return {
    details: t('contests'),
    state: slug
      ? textOf('h1')
      : undefined,
    icon: Assets.Viewing,
    timerKey: 'site',
  }
}

/** Pages from {@link SECTIONS}. */
const matchSection: RouteMatcher = ({ segments, t }) => {
  const entry = SECTIONS[segments[0] ?? '']
  if (!entry)
    return null
  const [key, icon] = entry
  return {
    details: t(key),
    icon,
    timerKey: 'site',
  }
}

const ROUTES: readonly RouteMatcher[] = [
  matchCourse,
  matchTrack,
  matchLeaderboard,
  matchReading,
  matchProfile,
  matchContests,
  matchSection,
]

/**
 * Resolves the current page.
 * @param pathname `location.pathname`.
 * @param t Translator for the chosen language.
 * @returns First matching route, or a generic "browsing" one.
 */
function resolveRoute(pathname: string, t: Translator): IRoute {
  const segments = pathname.split('/').filter(Boolean)
  return ROUTES.reduce<IRoute | null>((found, match) => found ?? match({ segments, t }), null)
    ?? {
      details: t('browsing'),
      icon: Assets.Viewing,
      timerKey: 'site',
    }
}

// Presence

/** Elapsed-time anchor; restarts when the route's timerKey changes. */
let timer = {
  key: '',
  start: Math.floor(Date.now() / 1000),
}

/** Texts for {@link oldLang}; fetched again when the language setting changes. */
let strings: Strings | undefined
let oldLang: string | undefined

/**
 * Start timestamp (seconds) for a timer key, restarting it on key change.
 * @param key Route timer key.
 * @returns Unix seconds when the current key started.
 */
function startTimestampFor(key: string): number {
  if (timer.key !== key) {
    timer = {
      key,
      start: Math.floor(Date.now() / 1000),
    }
  }
  return timer.start
}

presence.on('UpdateData', async () => {
  const [lang, privacy, showTimestamp, showButtons] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('buttons'),
  ])
  if (!strings || lang !== oldLang) {
    oldLang = lang
    strings = await getStrings()
  }

  const texts = strings
  const route = resolveRoute(document.location.pathname, key => texts[key])
  const [firstButton, secondButton] = !privacy && showButtons
    ? route.buttons ?? []
    : []
  const language = privacy ? undefined : route.language
  const logo = language && languageLogo(language)

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: privacy && route.privateDetails
      ? route.privateDetails
      : route.details,
    smallImageKey: logo ?? route.icon,
  }
  if (logo && language)
    presenceData.smallImageText = language.name
  if (!privacy && route.state)
    presenceData.state = route.state
  if (showTimestamp)
    presenceData.startTimestamp = startTimestampFor(route.timerKey)
  if (firstButton) {
    presenceData.buttons = secondButton
      ? [firstButton, secondButton]
      : [firstButton]
  }

  presence.setActivity(presenceData)
})
