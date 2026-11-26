import { Assets } from 'premid'

// Setup

const presence = new Presence({
  clientId: '1575345922563510392',
})

enum ActivityAssets {
  Logo = 'https://raw.githubusercontent.com/dizzi1222/premid-activities/premid-assets/Speedrun%20Ethereum/logo.png',
}

const SITE_URL = 'https://speedrunethereum.com'

// Strings

/**
 * Fetches the texts in the language chosen in the activity settings
 * (common `general.*` strings plus this activity's `speedrunethereum.*` strings).
 * @returns Translated texts, keyed like the object below.
 */
async function getStrings() {
  return presence.getStrings({
    browsing: 'general.browsing',
    home: 'general.viewHome',
    readingArticle: 'general.readingAnArticle',
    viewProfile: 'general.viewProfile',
    buttonReadArticle: 'general.buttonReadArticle',
    buttonViewProfile: 'general.buttonViewProfile',
    challenge: 'speedrunethereum.challenge',
    doingChallenge: 'speedrunethereum.doingChallenge',
    gettingStarted: 'speedrunethereum.gettingStarted',
    builders: 'speedrunethereum.builders',
    builds: 'speedrunethereum.builds',
    build: 'speedrunethereum.build',
    guides: 'speedrunethereum.guides',
    learnSolidity: 'speedrunethereum.learnSolidity',
    buildPrompts: 'speedrunethereum.buildPrompts',
    blockExplorer: 'speedrunethereum.blockExplorer',
    buttonViewChallenge: 'speedrunethereum.buttonViewChallenge',
    buttonViewBuild: 'speedrunethereum.buttonViewBuild',
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
  /** Bottom line with names (checkpoint, guide...); hidden in privacy mode. */
  state?: string
  /** Small image (reading, writing...). */
  icon: Assets
  buttons?: IButton[]
  /** Pages sharing a key share the elapsed timer (e.g. the checkpoints of one challenge). */
  timerKey: string
}

/** Input of every route matcher. */
interface IRouteContext {
  /** Path segments, e.g. `['challenge', 'tokenization']`. */
  segments: string[]
  t: Translator
}

/** Returns the route when it recognizes the page, `null` otherwise. */
type RouteMatcher = (ctx: IRouteContext) => IRoute | null

// Helpers

/**
 * Converts a kebab-case slug into Title Case.
 * @param slug e.g. `token-vendor`.
 * @returns e.g. `Token Vendor`.
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
 * Checkpoint of the challenge guide the user has scrolled to: the last
 * "Checkpoint N" heading above the upper 40 % of the window.
 * @returns e.g. `Checkpoint 2: 🖨 Minting`, or `undefined` before the first one.
 */
function currentCheckpoint(): string | undefined {
  const limit = window.innerHeight * 0.4
  let current: string | undefined
  for (const heading of document.querySelectorAll('h2')) {
    const text = heading.textContent?.replace(/\s+/g, ' ').trim()
    if (!text || !/^Checkpoint\s+\d+/i.test(text))
      continue
    if (heading.getBoundingClientRect().top > limit)
      break
    current = text
  }
  return current
}

/**
 * Short form of a wallet address (`0x1234…abcd`); ENS names stay as they are.
 * @param address Address or ENS name from the URL.
 * @returns Display name of the builder.
 */
function shortAddress(address: string): string {
  return /^0x[\da-f]{40}$/i.test(address)
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : decodeURIComponent(address)
}

// Routes

/** Pages that only depend on the first segment: [details key, icon]. */
const SECTIONS: Readonly<Record<string, readonly [StringKey, Assets]>> = {
  '': ['home', Assets.Viewing],
  'start': ['gettingStarted', Assets.Reading],
  'builders': ['builders', Assets.Search],
  'builds': ['builds', Assets.Search],
  'guides': ['guides', Assets.Search],
  'learn-solidity': ['learnSolidity', Assets.Reading],
  'build-prompts': ['buildPrompts', Assets.Search],
  'blockexplorer': ['blockExplorer', Assets.Search],
}

/** A challenge guide: `/challenge/:id`; the state follows the checkpoint being read. */
const matchChallenge: RouteMatcher = ({ segments: [section, id], t }) => {
  if (section !== 'challenge' || !id)
    return null
  const name = textOf('h1')?.replace(/^Challenge:\s*/i, '') || titleCase(id)
  return {
    details: t('challenge').replace('{0}', name),
    privateDetails: t('doingChallenge'),
    state: currentCheckpoint(),
    icon: Assets.Writing,
    buttons: [
      {
        label: t('buttonViewChallenge'),
        url: `${SITE_URL}/challenge/${id}`,
      },
    ],
    timerKey: `challenge:${id}`,
  }
}

/** Builder portfolio: `/builders/:address`. */
const matchBuilder: RouteMatcher = ({ segments: [section, address], t }) => {
  if (section !== 'builders' || !address)
    return null
  return {
    details: t('viewProfile'),
    state: shortAddress(address),
    icon: Assets.Viewing,
    buttons: [
      {
        label: t('buttonViewProfile'),
        url: `${SITE_URL}/builders/${address}`,
      },
    ],
    timerKey: 'site',
  }
}

/** A build (`/builds/:id`) or a guide (`/guides/:slug`): the title is the page heading. */
const matchArticle: RouteMatcher = ({ segments: [section, slug], t }) => {
  if (!slug)
    return null
  if (section === 'builds') {
    return {
      details: t('build'),
      state: textOf('h1'),
      icon: Assets.Viewing,
      buttons: [
        {
          label: t('buttonViewBuild'),
          url: `${SITE_URL}/builds/${slug}`,
        },
      ],
      timerKey: 'site',
    }
  }
  if (section === 'guides') {
    return {
      details: t('readingArticle'),
      state: textOf('h1'),
      icon: Assets.Reading,
      buttons: [
        {
          label: t('buttonReadArticle'),
          url: `${SITE_URL}/guides/${slug}`,
        },
      ],
      timerKey: `guide:${slug}`,
    }
  }
  return null
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
  matchChallenge,
  matchBuilder,
  matchArticle,
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
