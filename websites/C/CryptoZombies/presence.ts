import { Assets } from 'premid'

// Setup

const presence = new Presence({
  clientId: '1575346253439697026',
})

enum ActivityAssets {
  Logo = 'https://raw.githubusercontent.com/dizzi1222/premid-activities/premid-assets/CryptoZombies/logo.png',
}

const SITE_URL = 'https://cryptozombies.io'

/** Language prefix of the lessons and pages, e.g. `/es/lesson/1/chapter/2`. */
const LOCALE_PREFIX = /^\/([a-z]{2}(?:-[a-z]{2,4})?)(?=\/|$)/i

// Strings

/**
 * Fetches the texts in the language chosen in the activity settings
 * (common `general.*` strings plus this activity's `cryptozombies.*` strings).
 * @returns Translated texts, keyed like the object below.
 */
async function getStrings() {
  return presence.getStrings({
    browsing: 'general.browsing',
    home: 'general.viewHome',
    readingArticle: 'general.readingAnArticle',
    buttonReadArticle: 'general.buttonReadArticle',
    lesson: 'cryptozombies.lesson',
    lessonNumber: 'cryptozombies.lessonNumber',
    takingLesson: 'cryptozombies.takingLesson',
    courses: 'cryptozombies.courses',
    buttonViewLesson: 'cryptozombies.buttonViewLesson',
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
  /** Replaces `details` in privacy mode when it contains a name (e.g. the lesson). */
  privateDetails?: string
  /** Bottom line with names (chapter, article...); hidden in privacy mode. */
  state?: string
  /** Small image (reading, writing...). */
  icon: Assets
  buttons?: IButton[]
  /** Pages sharing a key share the elapsed timer (e.g. the chapters of one lesson). */
  timerKey: string
}

/** Input of every route matcher. */
interface IRouteContext {
  /** Path segments without the language, e.g. `['lesson', '1', 'chapter', '2']`. */
  segments: string[]
  /** Language prefix of the page (`en` when it has none). */
  locale: string
  t: Translator
}

/** Returns the route when it recognizes the page, `null` otherwise. */
type RouteMatcher = (ctx: IRouteContext) => IRoute | null

// Helpers

/**
 * Normalized text of the first element matching a selector.
 * @param selector CSS selector.
 * @returns Trimmed text, or `undefined` when missing/empty.
 */
function textOf(selector: string): string | undefined {
  return document.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() || undefined
}

// Routes

/** A lesson chapter: `/:locale/lesson/:lesson/chapter/:chapter`; the timer is kept per lesson. */
const matchLesson: RouteMatcher = ({ segments: [section, lesson], locale, t }) => {
  if (section !== 'lesson' || !lesson || !/^\d+$/.test(lesson))
    return null
  // The page also holds a hidden list with every lesson title (`.lesson-title-text`).
  const title = textOf('.chapter-list .list-header h4')
  return {
    details: title
      ? t('lesson').replace('{0}', lesson).replace('{1}', title)
      : t('lessonNumber').replace('{0}', lesson),
    privateDetails: t('takingLesson'),
    state: textOf('h1'),
    icon: Assets.Writing,
    buttons: [
      {
        label: t('buttonViewLesson'),
        url: `${SITE_URL}/${locale}/lesson/${lesson}/chapter/1`,
      },
    ],
    timerKey: `lesson:${lesson}`,
  }
}

/** Blog index and posts. */
const matchBlog: RouteMatcher = ({ segments: [section, post], t }) => {
  if (section !== 'blog')
    return null
  if (!post) {
    return {
      details: t('browsing'),
      icon: Assets.Search,
      timerKey: 'site',
    }
  }
  return {
    details: t('readingArticle'),
    state: textOf('h1'),
    icon: Assets.Reading,
    buttons: [
      {
        label: t('buttonReadArticle'),
        url: document.location.href,
      },
    ],
    timerKey: `blog:${post}`,
  }
}

/** Home page and the course map (`/course`, `/:locale/course`). */
const matchSection: RouteMatcher = ({ segments: [section], t }) => {
  if (section === undefined) {
    return {
      details: t('home'),
      icon: Assets.Viewing,
      timerKey: 'site',
    }
  }
  if (section === 'course') {
    return {
      details: t('courses'),
      icon: Assets.Search,
      timerKey: 'site',
    }
  }
  return null
}

const ROUTES: readonly RouteMatcher[] = [
  matchLesson,
  matchBlog,
  matchSection,
]

/**
 * Resolves the current page. Strips the language first (`/es/lesson/1/chapter/2` → `/lesson/1/chapter/2`).
 * @param pathname `location.pathname`.
 * @param t Translator for the chosen language.
 * @returns First matching route, or a generic "browsing" one.
 */
function resolveRoute(pathname: string, t: Translator): IRoute {
  const locale = pathname.match(LOCALE_PREFIX)?.[1]?.toLowerCase() ?? 'en'
  const segments = pathname.replace(LOCALE_PREFIX, '').split('/').filter(Boolean)
  return ROUTES.reduce<IRoute | null>((found, match) => found ?? match({ segments, locale, t }), null)
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

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: privacy && route.privateDetails
      ? route.privateDetails
      : route.details,
    smallImageKey: route.icon,
  }
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
