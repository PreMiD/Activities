const presence = new Presence({
  clientId: '733216983041966210',
})

let currentURL = new URL(document.location.href)
let currentPath = currentURL.pathname.replace(/^\/|\/$/g, '').split('/')
const browsingTimestamp = Math.floor(Date.now() / 1000)
let presenceData: PresenceData = {
  details: 'Viewing an unsupported page',
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/Wiktionary/assets/logo.png',
  startTimestamp: browsingTimestamp,
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
function resetData(defaultData: PresenceData = {
  details: 'Viewing an unsupported page',
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/Wiktionary/assets/logo.png',
  startTimestamp: browsingTimestamp,
}): void {
  currentURL = new URL(document.location.href)
  currentPath = currentURL.pathname.replace(/^\/|\/$/g, '').split('/')
  presenceData = { ...defaultData }
}
/**
 * Search for URL parameters.
 * @param urlParam The parameter that you want to know about the value.
 */
function getURLParam(urlParam: string): string {
  return currentURL.searchParams.get(urlParam)!
}

((): void => {
  if (currentURL.hostname === 'www.wiktionary.org') {
    presenceData.details = 'On the home page'
  }
  else {
    let title: string
    const actionResult = (): string =>
      getURLParam('action') || getURLParam('veaction')
    const [lang] = currentURL.hostname.split('.')
    const titleFromURL = (): string => {
      return decodeURI(
        (currentPath[1] === 'index.php'
          ? getURLParam('title')
          : currentPath.slice(1).join('/')
        ).replaceAll('_', ' '),
      )
    }

    try {
      title = document.querySelector('h1')?.textContent ?? ''
    }
    catch {
      title = titleFromURL()
    }

    /**
     * Returns details based on the namespace.
     * @link https://en.wiktionary.org/wiki/Wiktionary:Namespace
     */
    const namespaceDetails = (): string => {
      const details: { [index: string]: string } = {
        '-2': 'Viewing a media',
        '-1': 'Viewing a special page',
        '0': 'Reading about a word/term',
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
        '90': 'Viewing a thread',
        '91': 'Viewing a thread talk page',
        '92': 'Viewing a summary',
        '93': 'Viewing a summary talk page',
        '100': 'Viewing an appendix',
        '101': 'Viewing an appendix talk page',
        '102': 'Viewing a concordance',
        '103': 'Viewing a concordance talk page',
        '104': 'Viewing an index',
        '105': 'Viewing an index talk page',
        '106': 'Viewing a list of words that rhymes',
        '107': 'Viewing a rhymes talk page',
        '108': 'Viewing a Transwiki page',
        '109': 'Viewing a Transwiki talk page',
        '110': 'Viewing a thesaurus page',
        '111': 'Viewing a thesaurus talk page',
        '114': 'Viewing citations of a word/term',
        '115': 'Viewing a citations talk page',
        '116': 'Viewing a sign language gloss',
        '117': 'Viewing a sign language gloss talk page',
        '118': 'Viewing a appendix',
        '119': 'Viewing a appendix talk page',
        '828': 'Viewing a reconstructed word/term',
        '829': 'Viewing a reconstructed word/term talk page',
        '2300': 'Viewing a gadget',
        '2301': 'Viewing a gadget talk page',
        '2302': 'Viewing a gadget definition page',
        '2303': 'Viewing a gadget definition talk page',
        '2600': 'Viewing a topic',
      }
      return (
        details[
          [...document.querySelector('body')?.classList ?? []]
            .find(v => /ns--?\d/.test(v))
            ?.slice(3) ?? ''
        ] || 'Viewing a page'
      )
    }

    //
    // Important note:
    //
    // When checking for the current location, avoid using the URL.
    // The URL is going to be different in other languages.
    // Use the elements on the page instead.
    //

    if (
      (
        (document.querySelector('#n-mainpage a')
          || document.querySelector('#p-navigation a')
          || document.querySelector('.mw-wiki-logo')) as HTMLAnchorElement
      ).href === currentURL.href
    ) {
      presenceData.details = 'On the main page'
    }
    else if (document.querySelector('#wpLoginAttempt')) {
      presenceData.details = 'Logging in'
    }
    else if (document.querySelector('#wpCreateaccount')) {
      presenceData.details = 'Creating an account'
    }
    else if (document.querySelector('.searchresults')) {
      presenceData.details = 'Searching for a page'
      presenceData.state = (
        document.querySelector('input[type=search]') as HTMLInputElement
      ).value
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
    else if (
      document.querySelector('#ca-ve-edit')
      || getURLParam('veaction')
    ) {
      presenceData.state = `${
        title.toLowerCase() === titleFromURL().toLowerCase()
          ? `${title}`
          : `${title} (${titleFromURL()})`
      }`
      updateCallback.function = (): void => {
        if (actionResult() === 'edit' || actionResult() === 'editsource')
          presenceData.details = 'Editing a page'
        else presenceData.details = namespaceDetails()
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
        title.toLowerCase() === titleFromURL().toLowerCase()
          ? `${title}`
          : `${title} (${titleFromURL()})`
      }`
    }

    if (lang !== 'en') {
      if (presenceData.state)
        presenceData.state += ` (${lang})`
      else presenceData.details += ` (${lang})`
    }
  }
})()

if (updateCallback.present) {
  const defaultData = { ...presenceData }
  presence.on('UpdateData', async () => {
    resetData(defaultData)
    updateCallback.function()
    presence.setActivity(presenceData)
  })
}
else {
  presence.on('UpdateData', async () => {
    presence.setActivity(presenceData)
  })
}
