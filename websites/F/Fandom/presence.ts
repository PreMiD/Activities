import { Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '644400074008297512',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/F/Fandom/assets/logo.png',
}

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    name: 'Fandom',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { href, pathname, hostname } = document.location
  let currentURL = new URL(href)
  let currentPath = pathname.replace(/^\/|\/$/g, '').split('/')
  /**
   * Search for URL parameters.
   * @param urlParam The parameter that you want to know about the value.
   */
  const getURLParam = (urlParam: string): string => {
    return currentURL.searchParams.get(urlParam)!
  }
  const updateCallback = {
    _function: null as unknown as () => void,
    get function(): () => void {
      return this._function
    },
    set function(parameter) {
      this._function = parameter
    },
    get present(): boolean {
      return this._function !== null
    },
  }
  /**
   * Initialize/reset presenceData.
   */
  const resetData = (
    defaultData: PresenceData = {
      details: 'Viewing an unsupported page',
      largeImageKey: ActivityAssets.Logo,
      startTimestamp: browsingTimestamp,
    },
  ): void => {
    currentURL = new URL(href)
    currentPath = pathname.replace(/^\/|\/$/g, '').split('/')
    presenceData = { ...defaultData }
  }
  if (hostname === 'www.fandom.com') {
    /*
    Chapter 1
    This one is for the editorial part of Fandom.
    */
    switch (currentPath[0]) {
      case '': {
        presenceData.details = 'On the index page'
        break
      }
      case 'signin': {
        presenceData.details = 'Signing in'
        break
      }
      case 'register': {
        presenceData.details = 'Registering an account'
        break
      }
      case 'articles': {
        presenceData.details = 'Reading an article'
        presenceData.state = document.querySelector(
          '.article-header__title',
        )?.textContent

        break
      }
      case 'topics': {
        presenceData.details = 'Viewing a topic'
        presenceData.state = document.querySelector(
          '.topic-header__title',
        )?.firstElementChild?.textContent

        break
      }
      case 'video': {
        presenceData.details = 'Watching a video'
        delete presenceData.startTimestamp
        updateCallback.function = (): void => {
          presenceData.state = document.querySelector(
            '.video-page-featured-player__title',
          )?.textContent
          try {
            if (
              document
                .querySelector('.jw-icon-playback')
                ?.getAttribute('aria-label') === 'Pause'
            ) {
              [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(
                document.querySelector('.jw-video')!,
              )
            }
            else {
              delete presenceData.endTimestamp
            }
          }
          catch {
            delete presenceData.endTimestamp
          }
        }

        break
      }
      case 'curated': {
        presenceData.details = 'Viewing a curation'
        presenceData.state = document.querySelector('.card__title')?.textContent

        break
      }
      case 'u': {
        presenceData.details = 'Viewing a profile page'
        presenceData.state = `${
          document.querySelector('.profile-info-card__name')?.textContent
        } (${
          document.querySelector('.profile-info-card__username')?.textContent
        })`

        break
      }
      default: {
        presenceData.details = 'Viewing a page'
        switch (currentPath[0]) {
          case 'explore': {
            presenceData.state = 'Explore'
            break
          }
          case 'about': {
            presenceData.state = 'About'
            break
          }
          case 'carriers': {
            presenceData.state = 'Carriers'
            break
          }
          case 'terms-of-use': {
            presenceData.state = 'Terms of Use'
            break
          }
          case 'privacy-policy': {
            presenceData.state = 'Privacy Policy'
            break
          }
          case 'mediakit': {
            presenceData.state = 'Media Kit'
            break
          }
          case 'local-sitemap': {
            presenceData.state = 'Local Sitemap'
            break
          }
        }
      }
    }
  }
  else if (pathname.startsWith('/wiki/')) {
    /*
    Chapter 2
    This one is for the wiki part on the Fandom, which was Wikia a while ago
    */
    const actionResult = (): string =>
      getURLParam('action') || getURLParam('veaction')
    const lang = currentPath[0] === 'wiki' ? 'en' : currentPath[0]
    const titleFromURL = (): string => {
      return decodeURIComponent(
        currentPath[0] === 'index.php'
          ? getURLParam('title')
          : currentPath[0] === 'wiki'
            ? currentPath.slice(1).join('/')
            : currentPath.slice(2).join('/').replaceAll('_', ' '),
      )
    }
    const title = document.querySelector('h1')?.textContent?.trim() || titleFromURL()
    let sitename: string | undefined | null
      = document.querySelector<HTMLMetaElement>('meta[property=\'og:site_name\']')?.content
        || (
          document.querySelector('.wds-community-header__sitename')
          || document.querySelector('.fandom-community-header__community-name')
          || document.querySelector('.wds-community-bar__sitename')
        )?.textContent?.trim()

    /**
     * Returns details based on the namespace.
     * @link https://en.wikipedia.org/wiki/Wikipedia:Namespace
     */
    const namespaceDetails = (): string => {
      return (
        {
          '-2': 'Viewing a media',
          '-1': 'Viewing a special page',
          '0': 'Reading an article',
          '1': 'Viewing a talk page',
          '2': 'Viewing a user page',
          '3': 'Viewing a user talk page',
          '4': 'Viewing a project page',
          '5': 'Viewing a project talk page',
          '6': 'Viewing a file',
          '7': 'Viewing a file talk page',
          '8': 'Viewing an interface page',
          '9': 'Viewing an interface talk page',
          '10': 'Viewing a template',
          '11': 'Viewing a template talk page',
          '12': 'Viewing a help page',
          '13': 'Viewing a help talk page',
          '14': 'Viewing a category',
          '15': 'Viewing a category talk page',
          '100': 'Viewing a portal',
          '101': 'Viewing a portal talk page',
          '110': 'Viewing a forum page',
          '111': 'Viewing a forum talk page',
          '420': 'Viewing a GeoJson page',
          '421': 'Viewing a GeoJson talk page',
          '500': 'Viewing a user blog', // handled again by function below
          '501': 'Viewing a user blog comment', // deprecated, redirected
          '502': 'Viewing a blog',
          '503': 'Viewing a blog talk page',
          '710': 'Viewing a media\'s subtitles',
          '711': 'Viewing a media\'s subtitles talk page',
          '828': 'Viewing a module',
          '829': 'Viewing a module talk page',
          '1200': 'Viewing a message wall',
          '1201': 'Viewing a thread',
          '1202': 'Viewing a message wall greeting',
          '2000': 'Viewing a forum board', // deprecated, redirected
          '2001': 'Viewing a forum board thread', // deprecated, redirected
          '2002': 'Viewing a forum topic', // deprecated, redirected
        }[
          [...document.querySelector('body')!.classList]
            .find(v => /ns--?\d/.test(v))!
            .slice(3)
        ] || 'Viewing a wiki page'
      )
    }

    if (title === 'Home') {
      sitename = document.querySelector<HTMLMetaElement>(
        'meta[property=\'og:title\']',
      )?.content
      presenceData.details = 'On the home page'
    }
    else if (document.querySelector('.unified-search__form')) {
      presenceData.details = 'Searching for a page'
      presenceData.state = document.querySelector<HTMLInputElement>(
        '.unified-search__input__query',
      )?.value
    }
    else if (actionResult() === 'history') {
      presenceData.details = 'Viewing revision history'
      presenceData.state = titleFromURL()
    }
    else if (getURLParam('diff')) {
      presenceData.details = 'Viewing difference between revisions'
      presenceData.state = titleFromURL()
    }
    else if (getURLParam('oldid')) {
      presenceData.details = 'Viewing an old revision of a page'
      presenceData.state = titleFromURL()
    }
    else if (namespaceDetails() === 'Viewing a user blog') {
      if (title) {
        presenceData.details = 'Reading a user blog post'
        presenceData.state = `${title} by ${
          document.querySelector('.page-header__blog-post-details')
            ?.firstElementChild
            ?.textContent
        }`
      }
      else {
        presenceData.details = namespaceDetails()
        presenceData.state = titleFromURL()
      }
    }
    else if (
      document.querySelector('#ca-ve-edit') || getURLParam('veaction')
    ) {
      presenceData.state = `${
        title?.toLowerCase() === titleFromURL().toLowerCase()
          ? `${title}`
          : `${title} (${titleFromURL()})`
      }`
      updateCallback.function = (): void => {
        if (actionResult() === 'edit' || actionResult() === 'editsource') {
          presenceData.details = 'Editing a page'
          presenceData.smallImageKey = Assets.Writing
        }
        else {
          presenceData.details = namespaceDetails()
        }
      }
    }
    else if (actionResult() === 'edit') {
      presenceData.details = document.querySelector('#ca-edit')
        ? 'Editing a page'
        : 'Viewing source'
      presenceData.state = titleFromURL()
    }
    else {
      presenceData.details = namespaceDetails()
      presenceData.state = `${
        title?.toLowerCase() === titleFromURL().toLowerCase()
          ? `${title}`
          : `${title} (${titleFromURL()})`
      }`
    }

    if (presenceData.state)
      presenceData.state += ` | ${sitename}`
    else presenceData.state = sitename

    if (lang !== 'en') {
      if (presenceData.state)
        presenceData.state += ` (${lang})`
      else presenceData.details += ` (${lang})`
    }
  }
  else if (currentPath[0] === 'f') {
    /*
    Chapter 3
    This one is for the discussion parts on each wikis.
    */
    const sitename: string | undefined | null
      = document.querySelector<HTMLMetaElement>('meta[property=\'og:site_name\']')?.content
        || document.querySelector('.wds-community-header__sitename')?.textContent
        || document.querySelector('.fandom-community-header__community-name')?.textContent

    updateCallback.function = (): void => {
      if (!currentPath[1]) {
        const category = document.querySelector(
          '.category-filter__dropdown-toggle',
        )?.textContent
        if (category === 'Categories') {
          presenceData.details = 'Viewing the discussion page'
        }
        else {
          presenceData.details = 'Viewing a discussion category'
          presenceData.state = category
        }
      }
      else if (currentPath[1] === 'p') {
        presenceData.details = 'Reading a discussion post'
        presenceData.state = `${
          document.querySelector('.post-info__title')?.textContent
        } | ${sitename}`
      }
      else if (currentPath[1] === 'u') {
        presenceData.details = 'Viewing a discussion user page'
        presenceData.state = `${
          document.querySelector('.user-overview__username')?.textContent
        } | ${sitename}`
      }

      if (presenceData.state)
        presenceData.state += ` | ${sitename}`
      else presenceData.state = sitename
    }
  }

  if (updateCallback.present) {
    const defaultData = { ...presenceData }
    resetData(defaultData)
    updateCallback.function()
  }
  presence.setActivity(presenceData)
})
