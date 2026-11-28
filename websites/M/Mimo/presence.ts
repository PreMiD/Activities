import { Assets } from 'premid'

// Setup

const presence = new Presence({
  clientId: '1575302343379918969',
})

enum ActivityAssets {
  Logo = 'https://raw.githubusercontent.com/dizzi1222/premid-activities/premid-assets/Mimo/logo.png',
}

const SITE_URL = 'https://mimo.org'

/** Locale prefix of translated pages, e.g. `/de/blog`. */
const LOCALE_PREFIX = /^\/(?:en|de)(?=\/|$)/i

/** A Mimo course ("track" in the web app). */
interface ICourse {
  name: string
  /** Slug of its public page: `https://mimo.org/courses/<slug>`. */
  slug: string
}

/** Web app track ids (`/web/<trackId>/...`), as linked from the public course pages. */
const COURSES: Readonly<Record<string, ICourse>> = {
  50: { name: 'Full-Stack Development', slug: 'full-stack-development' },
  125: { name: 'Python', slug: 'learn-python' },
  145: { name: 'SQL', slug: 'learn-sql' },
  194: { name: 'HTML', slug: 'learn-html' },
  197: { name: 'JavaScript', slug: 'learn-javascript' },
  214: { name: 'Swift', slug: 'learn-swift-programming' },
  219: { name: 'Front-End Development', slug: 'front-end-development' },
  225: { name: 'CSS', slug: 'learn-css' },
  226: { name: 'Python Development', slug: 'python-development' },
  228: { name: 'TypeScript', slug: 'learn-typescript' },
  236: { name: 'Back-End Development', slug: 'back-end-development' },
  243: { name: 'React', slug: 'learn-react' },
  273: { name: 'How AI Works', slug: 'how-ai-works' },
  274: { name: 'AI Agents', slug: 'ai-agents' },
  277: { name: 'Machine Learning with Python', slug: 'machine-learning-with-python' },
}

/** Topic slugs (glossary, tutorials, compilers) whose name isn't the slug in Title Case. */
const TOPIC_NAMES: Readonly<Record<string, string>> = {
  css: 'CSS',
  html: 'HTML',
  javascript: 'JavaScript',
  sql: 'SQL',
  typescript: 'TypeScript',
}

// Strings

/**
 * Fetches the texts in the language chosen in the activity settings
 * (common `general.*` strings plus this activity's `mimo.*` strings).
 * @returns Translated texts, keyed like the object below.
 */
async function getStrings() {
  return presence.getStrings({
    browsing: 'general.browsing',
    home: 'general.viewHome',
    readingArticle: 'general.readingAnArticle',
    account: 'general.viewAccount',
    buttonReadArticle: 'general.buttonReadArticle',
    courses: 'mimo.courses',
    course: 'mimo.course',
    path: 'mimo.path',
    lesson: 'mimo.lesson',
    challenge: 'mimo.challenge',
    aiTutor: 'mimo.aiTutor',
    projects: 'mimo.projects',
    project: 'mimo.project',
    sharedProject: 'mimo.sharedProject',
    practice: 'mimo.practice',
    library: 'mimo.library',
    leaderboard: 'mimo.leaderboard',
    streak: 'mimo.streak',
    dailyGoal: 'mimo.dailyGoal',
    gettingStarted: 'mimo.gettingStarted',
    pro: 'mimo.pro',
    glossary: 'mimo.glossary',
    glossaryTerm: 'mimo.glossaryTerm',
    tutorials: 'mimo.tutorials',
    tutorial: 'mimo.tutorial',
    blog: 'mimo.blog',
    compilers: 'mimo.compilers',
    compiler: 'mimo.compiler',
    certifications: 'mimo.certifications',
    learnerStories: 'mimo.learnerStories',
    buttonViewCourse: 'mimo.buttonViewCourse',
    buttonViewProject: 'mimo.buttonViewProject',
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
  /** Bottom line with names (course, article...); hidden in privacy mode. */
  state?: string
  /** Small image (reading, writing...). */
  icon: Assets
  buttons?: IButton[]
  /** Pages sharing a key share the elapsed timer (e.g. the chapters of one tutorial). */
  timerKey: string
}

/** Input of every route matcher. */
interface IRouteContext {
  /** Path segments without locale, e.g. `['web', 'track', '125', 'tutorial', '1', 'chapter', '2', 'learn']`. */
  segments: string[]
  t: Translator
}

/** Returns the route when it recognizes the page, `null` otherwise. */
type RouteMatcher = (ctx: IRouteContext) => IRoute | null

// Helpers

/**
 * Converts a kebab-case slug into Title Case.
 * @param slug e.g. `programming-concepts`.
 * @returns e.g. `Programming Concepts`.
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
 * Display name of a topic slug.
 * @param slug e.g. `javascript`.
 * @returns e.g. `JavaScript`.
 */
function topicName(slug: string): string {
  return TOPIC_NAMES[slug] ?? titleCase(slug)
}

/**
 * Course whose public page has this slug.
 * @param slug e.g. `learn-python`.
 * @returns The course, or `undefined` when unknown.
 */
function courseBySlug(slug: string): ICourse | undefined {
  return Object.values(COURSES).find(course => course.slug === slug)
}

/**
 * "View Course" button pointing to the public page of a course.
 * @param course Course of the page, if known.
 * @param t Translator for the chosen language.
 * @returns A one-button list, or `undefined` for unknown courses.
 */
function courseButton(course: ICourse | undefined, t: Translator): IButton[] | undefined {
  return course
    ? [
        {
          label: t('buttonViewCourse'),
          url: `${SITE_URL}/courses/${course.slug}`,
        },
      ]
    : undefined
}

/**
 * Glossary entry title without its SEO suffix
 * (`Python List Comprehension: Syntax, Usage, and Examples` → `Python List Comprehension`).
 * @returns The term, or `undefined` when the page has no heading.
 */
function glossaryTerm(): string | undefined {
  return textOf('h1')?.split(':')[0]?.trim() || undefined
}

// Routes

/** Lesson modes (`/web/track/:trackId/tutorial/:tutorialId/chapter/:chapterId/<mode>`): [details key, icon]. */
const LESSON_MODES: Readonly<Record<string, readonly [StringKey, Assets]>> = {
  learn: ['lesson', Assets.Reading],
  challenge: ['challenge', Assets.Writing],
  tutor: ['aiTutor', Assets.Question],
  teach: ['aiTutor', Assets.Question],
}

const LESSON_PAGE: readonly [StringKey, Assets] = ['lesson', Assets.Reading]

/** Other web app pages, by the segment after `/web`: [details key, icon]. */
const APP_PAGES: Readonly<Record<string, readonly [StringKey, Assets]>> = {
  'build': ['projects', Assets.Viewing],
  'practice': ['practice', Assets.Writing],
  'library': ['library', Assets.Search],
  'leaderboard': ['leaderboard', Assets.Viewing],
  'streak': ['streak', Assets.Viewing],
  'daily-goal': ['dailyGoal', Assets.Viewing],
  'settings': ['account', Assets.Viewing],
  'store': ['pro', Assets.Viewing],
  'subscribe': ['pro', Assets.Viewing],
  'onboarding': ['gettingStarted', Assets.Viewing],
}

/** Public sections that only depend on the first segment: [details key, icon, show `<h1>` on sub-pages]. */
const SECTIONS: Readonly<Record<string, readonly [StringKey, Assets, boolean]>> = {
  '': ['home', Assets.Viewing, false],
  'certifications': ['certifications', Assets.Viewing, true],
  'learner-stories': ['learnerStories', Assets.Reading, true],
  'pro': ['pro', Assets.Viewing, false],
}

/** Web app lessons: learn, challenge and AI tutor modes; the timer is kept per tutorial. */
const matchLesson: RouteMatcher = ({ segments, t }) => {
  const [web, track, trackId, tutorial, tutorialId, chapter, , mode] = segments
  if (web !== 'web' || track !== 'track' || tutorial !== 'tutorial' || chapter !== 'chapter' || !trackId || !tutorialId)
    return null
  const [key, icon] = (mode && LESSON_MODES[mode]) || LESSON_PAGE
  const course = COURSES[trackId]
  return {
    details: t(key),
    state: course?.name,
    icon,
    buttons: courseButton(course, t),
    timerKey: `lesson:${trackId}/${tutorialId}`,
  }
}

/** Web app learning path: `/web/:trackId/section/:sectionId` (also `active`, `start-learning`). */
const matchPath: RouteMatcher = ({ segments: [web, trackId, section], t }) => {
  if (web !== 'web' || section !== 'section' || !trackId || !/^\d+$/.test(trackId))
    return null
  const course = COURSES[trackId]
  return {
    details: t('path'),
    state: course?.name,
    icon: Assets.Viewing,
    buttons: courseButton(course, t),
    timerKey: `path:${trackId}`,
  }
}

/** Web app projects: `/web/build/:projectId` (own) and `/web/shared/:projectId` (shared link). */
const matchProject: RouteMatcher = ({ segments: [web, area, projectId], t }) => {
  if (web !== 'web' || !projectId || (area !== 'build' && area !== 'shared'))
    return null
  if (area === 'build') {
    return {
      details: t('project'),
      icon: Assets.Writing,
      timerKey: `project:${projectId}`,
    }
  }
  return {
    details: t('sharedProject'),
    icon: Assets.Viewing,
    buttons: [
      {
        label: t('buttonViewProject'),
        url: `${SITE_URL}/web/shared/${projectId}`,
      },
    ],
    timerKey: `project:${projectId}`,
  }
}

/** Other web app pages from {@link APP_PAGES} (practice, leaderboard, streak...). */
const matchAppPage: RouteMatcher = ({ segments: [web, page], t }) => {
  const entry = web === 'web' && page
    ? APP_PAGES[page]
    : undefined
  if (!entry)
    return null
  const [key, icon] = entry
  return {
    details: t(key),
    icon,
    timerKey: 'site',
  }
}

/** Courses list and course pages (named after the course, not the marketing headline). */
const matchCourses: RouteMatcher = ({ segments: [section, slug], t }) => {
  if (section !== 'courses')
    return null
  if (!slug) {
    return {
      details: t('courses'),
      icon: Assets.Search,
      timerKey: 'site',
    }
  }
  return {
    details: t('course'),
    state: courseBySlug(slug)?.name ?? textOf('h1') ?? titleCase(slug),
    icon: Assets.Viewing,
    buttons: [
      {
        label: t('buttonViewCourse'),
        url: `${SITE_URL}/courses/${slug}`,
      },
    ],
    timerKey: 'site',
  }
}

/** Glossary and tutorials: `/<section>/:topic` lists, `/<section>/:topic/:slug` articles. */
const matchArticles: RouteMatcher = ({ segments: [section, topic, slug], t }) => {
  if ((section !== 'glossary' && section !== 'tutorials') || !topic)
    return null
  const isGlossary = section === 'glossary'
  if (!slug) {
    return {
      details: t(isGlossary ? 'glossary' : 'tutorials'),
      state: topicName(topic),
      icon: Assets.Search,
      timerKey: 'site',
    }
  }
  return {
    details: t(isGlossary ? 'glossaryTerm' : 'tutorial'),
    state: (isGlossary
      ? glossaryTerm()
      : textOf('h1')) ?? titleCase(slug),
    icon: Assets.Reading,
    buttons: [
      {
        label: t('buttonReadArticle'),
        url: `${SITE_URL}/${section}/${topic}/${slug}`,
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
        url: `${SITE_URL}/blog/${post}`,
      },
    ],
    timerKey: 'site',
  }
}

/** Online compilers: `/code-compilers` and `/code-compilers/<topic>-compiler`. */
const matchCompilers: RouteMatcher = ({ segments: [section, slug], t }) => {
  if (section !== 'code-compilers')
    return null
  if (!slug) {
    return {
      details: t('compilers'),
      icon: Assets.Search,
      timerKey: 'site',
    }
  }
  return {
    details: t('compiler'),
    state: topicName(slug.replace(/-compiler$/, '')),
    icon: Assets.Writing,
    timerKey: `compiler:${slug}`,
  }
}

/** Static public sections from {@link SECTIONS}; sub-pages may show their heading. */
const matchSection: RouteMatcher = ({ segments, t }) => {
  const entry = SECTIONS[segments[0] ?? '']
  if (!entry)
    return null
  const [key, icon, headingAsState] = entry
  return {
    details: t(key),
    state: headingAsState && segments.length > 1
      ? textOf('h1')
      : undefined,
    icon,
    timerKey: 'site',
  }
}

const ROUTES: readonly RouteMatcher[] = [
  matchLesson,
  matchPath,
  matchProject,
  matchAppPage,
  matchCourses,
  matchArticles,
  matchBlog,
  matchCompilers,
  matchSection,
]

/**
 * Resolves the current page. Strips the locale first (`/de/blog` → `/blog`).
 * @param pathname `location.pathname`.
 * @param t Translator for the chosen language.
 * @returns First matching route, or a generic "browsing" one.
 */
function resolveRoute(pathname: string, t: Translator): IRoute {
  const segments = pathname.replace(LOCALE_PREFIX, '').split('/').filter(Boolean)
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

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: route.details,
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
