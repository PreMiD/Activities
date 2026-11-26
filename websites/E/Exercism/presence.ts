import { Assets } from 'premid'

// Setup

const presence = new Presence({
  clientId: '1574465540955701381',
})

enum ActivityAssets {
  Logo = 'https://raw.githubusercontent.com/dizzi1222/premid-activities/premid-assets/Exercism/logo.png',
}

const SITE_URL = 'https://exercism.org'

/** Locale prefix of translated pages, e.g. `/es-ES/tracks` or `/pt-BR`. */
const LOCALE_PREFIX = /^\/[a-z]{2}(?:-[a-z]{2,4})?(?=\/|$)/i

/** Track slugs whose title is not just the slug in Title Case. */
const TRACK_NAMES: Readonly<Record<string, string>> = {
  'abap': 'ABAP',
  'arm64-assembly': 'ARM64 Assembly',
  'awk': 'AWK',
  'batch': 'Batch Script',
  'cfml': 'CFML',
  'cobol': 'COBOL',
  'coffeescript': 'CoffeeScript',
  'cpp': 'C++',
  'csharp': 'C#',
  'delphi': 'Delphi Pascal',
  'fsharp': 'F#',
  'gdscript': 'GDScript',
  'javascript': 'JavaScript',
  'jq': 'jq',
  'lfe': 'Lisp Flavoured Erlang',
  'mips': 'MIPS Assembly',
  'moonscript': 'MoonScript',
  'objective-c': 'Objective-C',
  'ocaml': 'OCaml',
  'perl5': 'Perl',
  'pharo-smalltalk': 'Pharo',
  'php': 'PHP',
  'powershell': 'PowerShell',
  'purescript': 'PureScript',
  'reasonml': 'ReasonML',
  'rescript': 'ReScript',
  'sml': 'Standard ML',
  'sqlite': 'SQLite',
  'typescript': 'TypeScript',
  'vbnet': 'Visual Basic',
  'vimscript': 'Vim script',
  'vlang': 'V',
  'wasm': 'WebAssembly',
  'x86-64-assembly': 'x86-64 Assembly',
  'yamlscript': 'YAMLScript',
}

// Strings

/**
 * Fetches the texts in the language chosen in the activity settings
 * (common `general.*` strings plus this activity's `exercism.*` strings).
 * @returns Translated texts, keyed like the object below.
 */
async function getStrings() {
  return presence.getStrings({
    browsing: 'general.browsing',
    home: 'general.viewHome',
    profile: 'general.viewAProfile',
    blogPost: 'general.readingAnArticle',
    settings: 'general.viewAccount',
    buttonProfile: 'general.buttonViewProfile',
    buttonPost: 'general.buttonReadArticle',
    dashboard: 'exercism.dashboard',
    tracks: 'exercism.tracks',
    chooseLanguage: 'exercism.chooseLanguage',
    track: 'exercism.track',
    trackOf: 'exercism.trackOf',
    exercises: 'exercism.exercises',
    viewExercise: 'exercism.viewExercise',
    viewAnExercise: 'exercism.viewAnExercise',
    solving: 'exercism.solving',
    solvingAnExercise: 'exercism.solvingAnExercise',
    iterations: 'exercism.iterations',
    iterationsPrivate: 'exercism.iterationsPrivate',
    solutions: 'exercism.solutions',
    solutionsPrivate: 'exercism.solutionsPrivate',
    digDeeper: 'exercism.digDeeper',
    digDeeperPrivate: 'exercism.digDeeperPrivate',
    mentored: 'exercism.mentored',
    mentoredPrivate: 'exercism.mentoredPrivate',
    concepts: 'exercism.concepts',
    learning: 'exercism.learning',
    learningAConcept: 'exercism.learningAConcept',
    mentoring: 'exercism.mentoring',
    mentoringInbox: 'exercism.mentoringInbox',
    mentoringQueue: 'exercism.mentoringQueue',
    mentoringStudent: 'exercism.mentoringStudent',
    mentoringRequest: 'exercism.mentoringRequest',
    journey: 'exercism.journey',
    community: 'exercism.community',
    blog: 'exercism.blog',
    docs: 'exercism.docs',
    contributing: 'exercism.contributing',
    maintaining: 'exercism.maintaining',
    notifications: 'exercism.notifications',
    challenge: 'exercism.challenge',
    insiders: 'exercism.insiders',
    donate: 'exercism.donate',
    about: 'exercism.about',
    buttonExercise: 'exercism.buttonViewExercise',
    buttonTrack: 'exercism.buttonViewTrack',
  })
}

// Types

/** Texts returned by {@link getStrings}. */
type Strings = Awaited<ReturnType<typeof getStrings>>

/** Key of a text in {@link Strings}. */
type StringKey = keyof Strings

/** Translates a key, replacing `{0}`, `{1}`... with the extra arguments. */
type Translator = (key: StringKey, ...args: string[]) => string

/** A track or an exercise: URL slug plus display title. */
interface INamedSlug {
  slug: string
  title: string
}

/** A presence button (Discord shows at most two). */
interface IButton {
  label: string
  url: string
}

/** What the current page means for the presence. */
interface IRoute {
  /** Top line with specific info (exercise, concept...). */
  details: string
  /** Top line for privacy mode: no names at all. */
  privateDetails: string
  /** Bottom line; hidden in privacy mode. */
  state?: string
  /** Small image when no track icon applies. */
  icon: Assets
  /** Track of the page, if any (drives the small track icon). */
  track?: INamedSlug
  buttons?: IButton[]
  /** Pages sharing a key share the elapsed timer (exercise page + editor). */
  timerKey: string
}

/** Input of every route matcher. */
interface IRouteContext {
  /** Path segments without locale, e.g. `['tracks', 'rust', 'exercises', 'hello-world', 'edit']`. */
  segments: string[]
  t: Translator
}

/** Returns the route when it recognizes the page, `null` otherwise. */
type RouteMatcher = (ctx: IRouteContext) => IRoute | null

/** Input of {@link matchExercise}. */
interface IExerciseContext {
  t: Translator
  track: INamedSlug
  trackButton: IButton
  exercise: INamedSlug
  /** Sub-page after the exercise slug: `edit`, `iterations`, `solutions`... */
  action?: string
}

// Helpers

/**
 * Builds a translator over the fetched texts.
 * @param strings Texts from {@link getStrings}.
 * @returns Function that resolves a key and fills its `{n}` placeholders.
 */
function createTranslator(strings: Strings): Translator {
  return (key, ...args) => strings[key].replace(/\{(\d+)\}/g, (_, index: string) => args[Number(index)] ?? '')
}

/**
 * Converts a kebab/snake-case slug into Title Case.
 * @param slug e.g. `hello-world`.
 * @returns e.g. `Hello World`.
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
 * Text of an element's own text nodes, skipping nested tags (concept headings
 * render as `Strings <small>in</small> <img>`).
 * @param selector CSS selector.
 * @returns Trimmed text, or `undefined` when missing/empty.
 */
function ownTextOf(selector: string): string | undefined {
  const text = Array.from(document.querySelector(selector)?.childNodes ?? [])
    .filter(node => node.nodeType === Node.TEXT_NODE)
    .map(node => node.textContent ?? '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text || undefined
}

/**
 * Track slug to display name: editor header, known names, then Title Case.
 * @param slug e.g. `cpp`.
 * @returns e.g. `{ slug: 'cpp', title: 'C++' }`.
 */
function resolveTrack(slug: string): INamedSlug {
  return {
    slug,
    title: textOf('.c-react-wrapper-editor .title .track') ?? TRACK_NAMES[slug] ?? titleCase(slug),
  }
}

/**
 * Exercise slug to display title: editor header, exercise page heading, then Title Case.
 * @param slug e.g. `hello-world`.
 * @param isExercisePage Whether the page is the exercise itself (its `<h1>` is the title).
 * @returns Slug plus title as shown by the site (it may be translated).
 */
function resolveExercise(slug: string, isExercisePage: boolean): INamedSlug {
  return {
    slug,
    title: textOf('.c-react-wrapper-editor .title .exercise')
      ?? (isExercisePage
        ? textOf('h1')
        : undefined)
      ?? titleCase(slug),
  }
}

/**
 * PNG version of a track icon. Exercism serves SVG, which Discord can't render,
 * so it goes through the wsrv.nl image proxy (512×512, transparent).
 * @param slug Track slug.
 * @returns Image URL usable as `smallImageKey`.
 */
function trackIconUrl(slug: string): string {
  return `https://wsrv.nl/?url=assets.exercism.org/tracks/${encodeURIComponent(slug)}.svg&w=512&h=512&fit=contain&output=png`
}

// Routes

/** Exercise sub-pages: [details key, privacy key, icon]. Unknown ones count as the exercise page. */
const EXERCISE_ACTIONS: Readonly<Record<string, readonly [StringKey, StringKey, Assets]>> = {
  edit: ['solving', 'solvingAnExercise', Assets.Writing],
  iterations: ['iterations', 'iterationsPrivate', Assets.Viewing],
  solutions: ['solutions', 'solutionsPrivate', Assets.Reading],
  dig_deeper: ['digDeeper', 'digDeeperPrivate', Assets.Reading],
  approaches: ['digDeeper', 'digDeeperPrivate', Assets.Reading],
  articles: ['digDeeper', 'digDeeperPrivate', Assets.Reading],
  mentor_discussions: ['mentored', 'mentoredPrivate', Assets.Reading],
  mentor_request: ['mentored', 'mentoredPrivate', Assets.Reading],
}

const EXERCISE_PAGE: readonly [StringKey, StringKey, Assets] = ['viewExercise', 'viewAnExercise', Assets.Viewing]

/** Mentoring sub-pages: state key. Student names are never shown. */
const MENTORING_STATES: Readonly<Record<string, StringKey>> = {
  inbox: 'mentoringInbox',
  queue: 'mentoringQueue',
  discussions: 'mentoringStudent',
  requests: 'mentoringRequest',
}

/** Sections that only depend on the first segment: [details key, icon, show `<h1>` on sub-pages]. */
const SECTIONS: Readonly<Record<string, readonly [StringKey, Assets, boolean]>> = {
  '': ['home', Assets.Viewing, false],
  'dashboard': ['dashboard', Assets.Viewing, false],
  'journey': ['journey', Assets.Viewing, false],
  'community': ['community', Assets.Viewing, false],
  'docs': ['docs', Assets.Reading, true],
  'contributing': ['contributing', Assets.Viewing, false],
  'maintaining': ['maintaining', Assets.Viewing, false],
  'settings': ['settings', Assets.Viewing, false],
  'notifications': ['notifications', Assets.Viewing, false],
  'challenges': ['challenge', Assets.Viewing, true],
  'insiders': ['insiders', Assets.Viewing, false],
  'donate': ['donate', Assets.Viewing, false],
  'about': ['about', Assets.Reading, false],
}

/**
 * Exercise page and its sub-pages (editor, iterations, community solutions...).
 * @param ctx Resolved track/exercise plus the sub-page.
 * @param ctx.t Translator for the chosen language.
 * @param ctx.track Track of the exercise.
 * @param ctx.trackButton "View Track" button, reused as second button.
 * @param ctx.exercise Exercise slug and title.
 * @param ctx.action Sub-page after the exercise slug (`edit`, `iterations`...).
 * @returns Route with exercise + track buttons and a per-exercise timer.
 */
function matchExercise({ t, track, trackButton, exercise, action }: IExerciseContext): IRoute {
  const [detailsKey, privateKey, icon] = (action && EXERCISE_ACTIONS[action]) || EXERCISE_PAGE
  return {
    details: t(detailsKey, exercise.title),
    privateDetails: t(privateKey),
    state: t('trackOf', track.title),
    icon,
    track,
    buttons: [
      {
        label: t('buttonExercise'),
        url: `${SITE_URL}/tracks/${track.slug}/exercises/${exercise.slug}`,
      },
      trackButton,
    ],
    timerKey: `exercise:${track.slug}/${exercise.slug}`,
  }
}

/** Everything under /tracks: track list, track, exercises, editor, concepts. */
const matchTracks: RouteMatcher = ({ segments, t }) => {
  const [section, trackSlug, area, itemSlug, action] = segments
  if (section !== 'tracks')
    return null
  if (!trackSlug) {
    return {
      details: t('tracks'),
      privateDetails: t('tracks'),
      state: t('chooseLanguage'),
      icon: Assets.Search,
      timerKey: 'tracks',
    }
  }

  const track = resolveTrack(trackSlug)
  const trackButton: IButton = {
    label: t('buttonTrack'),
    url: `${SITE_URL}/tracks/${track.slug}`,
  }
  const inTrack = {
    track,
    state: t('trackOf', track.title),
    buttons: [trackButton],
    timerKey: `track:${track.slug}`,
  }

  if (area === 'exercises' && itemSlug) {
    return matchExercise({
      t,
      track,
      trackButton,
      exercise: resolveExercise(itemSlug, !action),
      action,
    })
  }
  if (area === 'exercises') {
    return {
      ...inTrack,
      details: t('exercises'),
      privateDetails: t('exercises'),
      icon: Assets.Search,
    }
  }
  if (area === 'concepts' && itemSlug) {
    return {
      ...inTrack,
      details: t('learning', ownTextOf('h1') ?? titleCase(itemSlug)),
      privateDetails: t('learningAConcept'),
      icon: Assets.Reading,
    }
  }
  if (area === 'concepts') {
    return {
      ...inTrack,
      details: t('concepts'),
      privateDetails: t('concepts'),
      icon: Assets.Search,
    }
  }
  return {
    ...inTrack,
    details: t('track'),
    privateDetails: t('track'),
    icon: Assets.Viewing,
  }
}

/** Mentoring area: inbox, queue, discussions, requests. */
const matchMentoring: RouteMatcher = ({ segments: [section, area], t }) => {
  if (section !== 'mentoring')
    return null
  const stateKey = area ? MENTORING_STATES[area] : undefined
  return {
    details: t('mentoring'),
    privateDetails: t('mentoring'),
    state: stateKey && t(stateKey),
    icon: Assets.Reading,
    timerKey: 'mentoring',
  }
}

/** Public profiles: /profiles/:handle. */
const matchProfile: RouteMatcher = ({ segments: [section, handle], t }) => {
  if (section !== 'profiles' || !handle)
    return null
  return {
    details: t('profile'),
    privateDetails: t('profile'),
    state: `@${handle}`,
    icon: Assets.Viewing,
    buttons: [
      {
        label: t('buttonProfile'),
        url: `${SITE_URL}/profiles/${handle}`,
      },
    ],
    timerKey: 'site',
  }
}

/** Blog index and posts. */
const matchBlog: RouteMatcher = ({ segments: [section, post], t }) => {
  if (section !== 'blog')
    return null
  if (!post) {
    return {
      details: t('blog'),
      privateDetails: t('blog'),
      icon: Assets.Search,
      timerKey: 'site',
    }
  }
  return {
    details: t('blogPost'),
    privateDetails: t('blogPost'),
    state: textOf('h1'),
    icon: Assets.Reading,
    buttons: [
      {
        label: t('buttonPost'),
        url: `${SITE_URL}/blog/${post}`,
      },
    ],
    timerKey: 'site',
  }
}

/** Static sections from {@link SECTIONS}; sub-pages may show their heading. */
const matchSection: RouteMatcher = ({ segments, t }) => {
  const entry = SECTIONS[segments[0] ?? '']
  if (!entry)
    return null
  const [key, icon, headingAsState] = entry
  return {
    details: t(key),
    privateDetails: t(key),
    state: headingAsState && segments.length > 1
      ? textOf('h1')
      : undefined,
    icon,
    timerKey: 'site',
  }
}

const ROUTES: readonly RouteMatcher[] = [
  matchTracks,
  matchMentoring,
  matchProfile,
  matchBlog,
  matchSection,
]

/**
 * Resolves the current page. Strips the locale first (`/es-ES/tracks` → `/tracks`)
 * so it works whatever the site language is.
 * @param pathname `location.pathname`.
 * @param t Translator for the chosen language.
 * @returns First matching route, or a generic "browsing" one.
 */
function resolveRoute(pathname: string, t: Translator): IRoute {
  const segments = pathname.replace(LOCALE_PREFIX, '').split('/').filter(Boolean)
  return ROUTES.reduce<IRoute | null>((found, match) => found ?? match({ segments, t }), null)
    ?? {
      details: t('browsing'),
      privateDetails: t('browsing'),
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
  const [lang, privacy, showTrackIcon, showTimestamp, showButtons] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('trackIcon'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('buttons'),
  ])
  if (!strings || lang !== oldLang) {
    oldLang = lang
    strings = await getStrings()
  }

  const route = resolveRoute(document.location.pathname, createTranslator(strings))
  const track = !privacy && showTrackIcon
    ? route.track
    : undefined
  const [firstButton, secondButton] = !privacy && showButtons
    ? route.buttons ?? []
    : []

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: privacy ? route.privateDetails : route.details,
    smallImageKey: track
      ? trackIconUrl(track.slug)
      : route.icon,
  }
  if (track)
    presenceData.smallImageText = track.title
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
