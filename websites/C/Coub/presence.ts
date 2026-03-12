import { Assets } from 'premid'

type LocalizedStrings = typeof localizedStrings
interface PageContext {
  middleware: (ref: Window, ...args: unknown[]) => boolean
  exec: (
    context: Presence,
    presenceData: PresenceData,
    options?: any,
  ) => Promise<PresenceData | null> | PresenceData | null
}
interface ExecutionArguments {
  showWatch?: boolean
  showExternalImages?: boolean
  strings: LocalizedStrings
  images: { [key: string]: string }
  [key: string]: unknown
}
function getQuery() {
  const queryString = location.search.split('?', 2)
  const query = queryString && queryString.length > 0 && queryString[1]
    ? queryString[1].split('&').reduce((l, r) => {
        const entry = r ? r.split('=', 2) : null
        if (entry === null)
          return l
        return Object.assign(l, { [entry[0]!]: entry[1] })
      }, {})
    : {}
  return query
}
function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
const pages: PageContext[] = [
  {
    middleware: ref =>
      /^\/(?:hot|tags|rising|fresh|feed|stories|random|bookmarks|likes|weekly|best|royal\.coubs|\/)/i.test(
        ref.location.pathname,
      ) || location.pathname === '/',
    exec: (
      context,
      data,
      { showWatch, strings, images }: ExecutionArguments,
    ) => {
      if (!context)
        return null
      const activeMedia = document.querySelector<HTMLElement>(
        '.coub[coub-block].active',
      )
      if (!activeMedia)
        return null
      const title = activeMedia
        .querySelector('.description__title')
        ?.textContent
        ?.trim()
      const activeTab = document.querySelector<HTMLElement>(
        '.page__content .page-menu > .page-menu__inner > .page-menu__item.-active',
      )
      || document.querySelector<HTMLElement>(
        '.best2020__container .page-menu > .page-menu__inner > .page-menu__item.-active',
      )
      || document.querySelector<HTMLElement>(
        '.page__content .story__header',
      )
      const isCoubPicks = location.pathname.startsWith('/royal.coubs')
      const activeTabTitle = activeTab?.textContent?.trim()
        || activeTab?.dataset?.title
        || 'Feed'
      if (!title)
        return null
      const pageType = document
        .querySelector('.page__content')
        ?.getAttributeNames()
        ?.map(x => x.match(/^pages-(\w+)-page/i))
        .filter(x => !!x && x.length > 1 && x[1])
        .map(x => capitalizeFirstLetter(x![1]!))
      data.state = `Browsing ${
        isCoubPicks && activeTabTitle.match(/^(\w+)/g)
          ? activeTabTitle.match(/^(\w+)/g)?.[0]
          : activeTabTitle
      }${
        (pageType?.length ?? 0) > 0
        && activeTabTitle.toLowerCase() !== pageType![0]?.toLowerCase()
          ? ` in ${pageType![0]}`
          : document.querySelector('.page__content .page-menu.weekly__menu')
            ? ' in Weekly'
            : location.pathname.startsWith('/best')
              ? ' in Best of the Year'
              : isCoubPicks
                ? ' in Coub Picks'
                : ''
      }`
      data.details = `${title}${
        activeMedia.querySelector(
          '.coub__like-button[widget-like-button].-on',
        )
          ? ' (❤)'
          : ''
      }`
      data.smallImageKey = activeMedia.querySelector('video')?.paused === false
        ? images.PLAY
        : images.PAUSE
      if (showWatch) {
        data.buttons = [
          {
            label: strings.watchVideo,
            url: `${document.location.origin}/view/${activeMedia.dataset.permalink}`,
          },
        ]
      }
      return data
    },
  },
  {
    middleware: ref =>
      !!ref.document.querySelector('.hero-cover[channel-id]'),
    exec: (
      context,
      data,
      { showWatch, showExternalImages, strings, images }: ExecutionArguments,
    ) => {
      if (!context)
        return null
      const activeMedia = document.querySelector<HTMLElement>(
        '.coub[coub-block].active',
      )
      if (!activeMedia)
        return null
      const title = activeMedia
        .querySelector('.description__title')
        ?.textContent
        ?.trim()
      const channelParent = document.querySelector<HTMLDivElement>('.channel')
      const userName = channelParent?.querySelector<HTMLHeadingElement>(
        '.channel__description > h1[title]',
      )?.title
      const userImage = channelParent?.querySelector<HTMLImageElement>(
        '.avatar-upload img[src*="coub_storage/channel"]',
      )?.src
      const activeTab = document.querySelector<HTMLElement>(
        '.page__content .page-menu > .page-menu__inner > .page-menu__item.-active',
      )
      || document.querySelector<HTMLElement>(
        '.best2020__container .page-menu > .page-menu__inner > .page-menu__item.-active',
      )
      || document.querySelector<HTMLElement>(
        '.page__content .story__header',
      )

      if (!title || !userName)
        return null
      data.state = `Browsing ${
        activeTab?.textContent?.trimStart().split('\n')[0]?.trim()
        || activeTab?.dataset?.title
        || 'Feed'
      } from ${userName}`
      data.details = `${title}${
        activeMedia.querySelector(
          '.coub__like-button[widget-like-button].-on',
        )
          ? ' (❤)'
          : ''
      }`
      if (showExternalImages && userImage?.startsWith('https://'))
        data.largeImageKey = userImage
      data.smallImageKey = activeMedia.querySelector('video')?.paused === false
        ? images.PLAY
        : images.PAUSE
      if (showWatch) {
        data.buttons = [
          {
            label: strings.watchVideo,
            url: `${document.location.origin}/view/${activeMedia.dataset.permalink}`,
          },
          {
            label: strings.viewProfile,
            url: `${document.location.origin}/${
              document.location.pathname.split('/')[1]
            }`,
          },
        ]
      }
      return data
    },
  },
  {
    middleware: ref => /^\/view\/.*/i.test(ref.location.pathname),
    exec: (
      context,
      data,
      { strings, showWatch, images }: ExecutionArguments,
    ) => {
      if (!context)
        return null
      const activeMedia = document.querySelector<HTMLElement>('.coub[coub-block]')
      if (!activeMedia)
        return null
      const title = activeMedia
        .querySelector('.coub__description h5.description__title')
        ?.textContent
        ?.trim()

      if (!title)
        return null
      data.state = strings.watching
      data.details = `${title}${
        activeMedia.querySelector(
          '.coub__like-button[widget-like-button].-on',
        )
          ? ' (❤)'
          : ''
      }`
      data.smallImageKey = activeMedia.querySelector('video')?.paused === false
        ? images.PLAY
        : images.PAUSE

      if (showWatch) {
        data.buttons = [
          {
            label: strings.watchVideo,
            url: document.location.href,
          },
        ]
      }
      return data
    },
  },
  {
    middleware: ref => /^\/community/i.test(ref.location.pathname),
    exec: (
      context,
      data,
      { showWatch, showExternalImages, strings, images }: ExecutionArguments,
    ) => {
      if (!context)
        return null
      const communityParent = document.querySelector(
        '.hot__community[data-community-id]',
      )
      if (!communityParent)
        return null
      const activeMedia = document.querySelector<HTMLElement>('.coub.active')
      if (!activeMedia)
        return null
      const communityTitle = communityParent
        .querySelector('.description > .title > h2')
        ?.textContent
        ?.trim()
      const communityImage = communityParent.querySelector<HTMLImageElement>(
        'img[src*="coub_storage/category"]',
      )?.src
      const title = activeMedia
        .querySelector('.description__title')
        ?.textContent
        ?.trim()

      if (!communityTitle || !title)
        return null
      data.state = `Browsing ${communityTitle} in ${
        communityParent.parentElement?.querySelector<HTMLElement>(
          '.page-menu.hot__menu > .page-menu__inner > .page-menu__item.-active',
        )?.dataset?.title || 'Hot'
      }`
      if (showExternalImages && communityImage?.startsWith('https://'))
        data.largeImageKey = communityImage
      data.smallImageKey = activeMedia.querySelector('video')?.paused === false
        ? images.PLAY
        : images.PAUSE
      data.details = `${title}`
      if (showWatch) {
        data.buttons = [
          {
            label: strings.watchVideo,
            url: `${document.location.origin}/view/${activeMedia.dataset.permalink}`,
          },
        ]
      }

      return data
    },
  },
  {
    middleware: ref => !!ref.window,
    exec: (context, data, { strings }: { strings: { browsing: string } }) => {
      if (!context)
        return null
      data.state = strings.browsing
      data.details = ''
      if (data.smallImageKey)
        delete data.smallImageKey
      return data
    },
  },
]
const presence = new Presence({
  clientId: '818598086984728576',
})
const presenceImageKeys = {
  PLAY: Assets.Play,
  PAUSE: Assets.Pause,
}
function getStrings(newLang?: string) {
  return presence.getStrings(
    {
      browsing: 'general.browsing',
      watching: 'general.playing',
      watchVideo: 'general.buttonWatchVideo',
      viewProfile: 'general.buttonViewProfile',
    },
    newLang,
  )
}
let currentLang: string,
  localizedStrings: Awaited<ReturnType<typeof getStrings>>
const startedBrowsingAt = new Date()
presence.on('UpdateData', async () => {
  const newLang = await presence.getSetting<string>('lang').catch(() => 'en')
  if (!localizedStrings || newLang !== currentLang) {
    currentLang = newLang
    localizedStrings = await getStrings(newLang)
  }
  const query: { [key: string]: unknown } = getQuery()
  const context = pages.find(x => x.middleware(window, [query]))
  if (!context)
    return
  const data: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/Coub/assets/logo.png',
  }
  const showStartedBrowsing = await presence
    .getSetting<boolean>('show_startedBrowsing')
    .catch(() => true)

  if (showStartedBrowsing && !data.startTimestamp)
    data.startTimestamp = startedBrowsingAt.getTime()

  const result = await Promise.resolve(
    context.exec(presence, data, {
      strings: localizedStrings,
      query,
      images: presenceImageKeys,
      showWatch: await presence
        .getSetting<boolean>('show_button_watching')
        .catch(() => true),
      showExternalImages: await presence
        .getSetting<boolean>('show_externalLargeImage')
        .catch(() => true),
      showStartedBrowsing,
    }),
  )
  if (!result) {
    presence.setActivity({
      ...data,
      state: localizedStrings.browsing,
    })
  }
  else if (result.details) {
    presence.setActivity(result)
  }
})
