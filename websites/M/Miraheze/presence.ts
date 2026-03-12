const presence = new Presence({
  clientId: '900002010156400670',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Donate = 'https://cdn.rcd.gg/PreMiD/websites/M/Miraheze/assets/0.png',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/Miraheze/assets/logo.png',
  Phabricator = 'https://cdn.rcd.gg/PreMiD/websites/M/Miraheze/assets/1.png',
}

let currentURL = new URL(document.location.href)
let currentPath = currentURL.pathname.replace(/^\/|\/$/g, '').split('/')
let presenceData: PresenceData = {
  details: 'Viewing an unsupported page',
  largeImageKey: ActivityAssets.Logo,
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
  largeImageKey: ActivityAssets.Logo,
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
  return currentURL.searchParams.get(urlParam) ?? ''
}
async function prepare(): Promise<void> {
  presence.info('Running...')

  if (
    currentURL.host === 'miraheze.org'
    || currentURL.host === 'www.miraheze.org'
  ) {
    /*

    Chapter 1
    This one is for the front page of Wikia.org.

    */

    if (currentPath[0] === '')
      presenceData.details = 'On the index page'
  }
  else {
    switch (currentURL.hostname) {
      case 'phabricator.miraheze.org': {
        presenceData.smallImageKey = ActivityAssets.Phabricator
        presenceData.smallImageText = 'Phabricator'

        if (currentPath[0] === '') {
          presenceData.details = 'On the home page'
        }
        else if (
          document
            .querySelector(
              '.phui-crumbs-view.phui-crumbs-border .phui-crumb-name',
            )
            ?.textContent
            ?.trim() === 'Auth'
        ) {
          presenceData.details = 'Logging in'
        }
        else if (/^T\d+$/.test(currentPath[0]!)) {
          presenceData.details = 'Viewing a task'
          presenceData.state = document.title.replace(/^[^\w\s] /, '')
        }
        else {
          switch (currentPath[0]) {
            case 'maniphest': {
              if (currentPath[1] === 'task' && currentPath[2] === 'edit') {
                presenceData.details = 'Creating a task'
              }
              else {
                presenceData.details = 'Viewing tasks (Maniphest)'
                presenceData.state = document.querySelector(
                  'h1 .phui-header-header',
                )?.textContent
              }

              break
            }
            case 'project': {
              if (!currentPath[1] || currentPath[1] === 'query') {
                presenceData.details = 'Viewing projects'
                presenceData.state = document.querySelector(
                  'h1 .phui-header-header',
                )?.textContent
              }
              else if (currentPath[1] === 'view') {
                presenceData.details = 'Viewing a project'
                presenceData.state = [
                  ...document.querySelectorAll(
                    '.phui-crumbs-view.phui-crumbs-border .phui-crumb-name',
                  ),
                ]
                  .slice(1)
                  .map(element => element.textContent?.trim())
                  .join(' > ')
              }
              else {
                presenceData.details = 'Viewing a project'
                const crumbs = [
                  ...document.querySelectorAll(
                    '.phui-crumbs-view.phui-crumbs-border .phui-crumb-name',
                  ),
                ]
                presenceData.state = crumbs
                  .slice(1, crumbs.length - 1)
                  .map(element => element.textContent?.trim())
                  .join(' > ')
              }

              break
            }
            case 'diffusion': {
              presenceData.details = 'Viewing repositories (Diffusion)'
              presenceData.state = document.querySelector(
                'h1 .phui-header-header',
              )?.textContent

              break
            }
            case 'source': {
              presenceData.details = 'Viewing a repository'
              presenceData.state = document.querySelector(
                '.phui-crumbs-view.phui-crumbs-border .phui-crumb-name:nth-of-type(1)',
              )?.textContent

              break
            }
            case 'phame': {
              if (!currentPath[1]) {
                presenceData.details = 'Viewing recent posts (Phame)'
              }
              else if (currentPath[1] === 'post') {
                if (currentPath[2] === 'view') {
                  presenceData.details = 'Viewing a post'
                  presenceData.state = document.querySelector(
                    '.phame-header-title',
                  )?.textContent
                }
                else {
                  presenceData.details = 'Viewing posts'
                  presenceData.state = document.querySelector(
                    'h1 .phui-header-header',
                  )?.textContent
                }
              }
              else if (currentPath[1] === 'blog') {
                if (currentPath[2] === 'view') {
                  presenceData.details = 'Viewing a blog'
                  presenceData.state = document.querySelector(
                    '.phame-header-title',
                  )?.textContent
                }
                else {
                  presenceData.details = 'Viewing blogs'
                  presenceData.state = document.querySelector(
                    'h1 .phui-header-header',
                  )?.textContent
                }
              }

              break
            }
            default:
              if (/^P\d+$/.test(currentPath[0]!)) {
                presenceData.details = 'Viewing a paste'
                presenceData.state = document.title.replace(
                  /^[^\w\s] /,
                  '',
                )
              }
              else if (currentPath[0] === 'paste') {
                if (currentPath[1] === 'task' && currentPath[2] === 'edit') {
                  presenceData.details = 'Creating a paste'
                }
                else {
                  presenceData.details = 'Viewing pastes'
                  presenceData.state = document.querySelector(
                    'h1 .phui-header-header',
                  )?.textContent
                }
              }
              else if (/^M\d+$/.test(currentPath[0]!)) {
                presenceData.details = 'Viewing a mock'
                presenceData.state = document.title.replace(
                  /^[^\w\s] /,
                  '',
                )
              }
              else if (currentPath[0] === 'pholio') {
                if (currentPath[1] === 'task' && currentPath[2] === 'edit') {
                  presenceData.details = 'Creating a mock'
                }
                else {
                  presenceData.details = 'Viewing mocks (Pholio)'
                  presenceData.state = document.querySelector(
                    'h1 .phui-header-header',
                  )?.textContent
                }
              }
              else if (/^U\d+$/.test(currentPath[0]!)) {
                presenceData.details = 'Viewing a short URL'
                presenceData.state = document.title.replace(
                  /^[^\w\s] /,
                  '',
                )
              }
              else if (currentPath[0] === 'phurl') {
                if (currentPath[1] === 'task' && currentPath[2] === 'edit') {
                  presenceData.details = 'Creating a short URL'
                }
                else {
                  presenceData.details = 'Viewing short URLs (Phurl)'
                  presenceData.state = document.querySelector(
                    'h1 .phui-header-header',
                  )?.textContent
                }
              }
              else {
                presenceData.details = `Viewing ${document
                  .querySelector(
                    '.phui-crumbs-view.phui-crumbs-border .phui-crumb-name',
                  )
                  ?.textContent
                  ?.trim()}`
                presenceData.state = [
                  ...document.querySelectorAll(
                    '.phui-crumbs-view.phui-crumbs-border .phui-crumb-name',
                  ),
                ]
                  .slice(1)
                  .map(element => element.textContent?.trim())
                  .join(' > ')
              }
          }
        }
        break
      }
      case 'blog.miraheze.org': {
        presenceData.smallImageKey = ActivityAssets.Phabricator
        presenceData.smallImageText = 'Phabricator (blog)'

        if (!currentPath[1]) {
          presenceData.details = 'Viewing a blog'
          presenceData.state = document.querySelector(
            '.phame-header-title',
          )?.textContent
        }
        else if (currentPath[0] === 'post') {
          presenceData.details = 'Viewing a post'
          presenceData.state = document.querySelector(
            '.phame-header-title',
          )?.textContent
        }

        break
      }
      case 'donate.miraheze.org': {
        presenceData.smallImageKey = ActivityAssets.Donate
        presenceData.smallImageText = 'Donation Gateway'

        presenceData.details = 'Donating to Miraheze'

        break
      }
      case 'status.miraheze.wiki': {
        presenceData.details = 'Viewing the status page'
        if (document.title !== 'Status Page - Miraheze') {
          presenceData.state = document.title.replace(
            ' - Status Page - Miraheze',
            '',
          )
        }

        break
      }
      default: {
        /*

        Chapter 2
        This one is for the wiki part on the Wikia.org.

        */

        const mwConfig = await presence.getPageletiable<{
          wgSiteName: string
          wgAction: string
          wgPageName: string
          wgCanonicalNamespace: string
          wgNamespaceNumber: number
          wgIsMainPage: boolean
        }>('mw"]["config"]["values')
        const siteName = mwConfig.wgSiteName
        const actionResult = (): string =>
          getURLParam('action')
          || getURLParam('veaction')
          || mwConfig.wgAction
        const titleFromURL = (): string => {
          return decodeURIComponent(
            mwConfig.wgPageName.replaceAll('_', ' '),
          )
        }
        const title = document.querySelector('h1')
          ? document.querySelector('h1')?.textContent
          : titleFromURL()
        /**
         * Returns details based on the namespace.
         * @link https://en.wikipedia.org/wiki/Wikipedia:Namespace
         */
        const namespaceDetails = (): string => {
          // Hardcoded IDs are used for namespaces that are usually consistent.
          // For others, use the canonical names as the keys. They will always be English.

          const details: { [index: string]: string } = {
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
            '828': 'Viewing a module',
            '829': 'Viewing a module talk page',
            '2300': 'Viewing a gadget',
            '2301': 'Viewing a gadget talk page',
            '2302': 'Viewing a gadget definition page',
            '2303': 'Viewing a gadget definition talk page',
            'GeoJson': 'Viewing a GeoJson page',
            'GeoJson talk': 'Viewing a GeoJson talk page',
            'TimedText': 'Viewing a media\'s subtitles',
            'TimedText talk': 'Viewing a media\'s subtitles talk page',
            'CNBanners': 'Viewing a CNBanners page',
            'CNBanners talk': 'Viewing a CNBanners talk page',
            'Schema': 'Viewing a schema page',
            'Schema talk': 'Viewing a schema talk page',
            'Translations': 'Viewing a translations page',
            'Translations talk': 'Viewing a translations talk page',
          }
          const canonicalNamespace = mwConfig.wgCanonicalNamespace.replaceAll(
            '_',
            ' ',
          )
          return (
            details[mwConfig.wgNamespaceNumber]
            || details[canonicalNamespace]
            || `Viewing a/an ${canonicalNamespace} page`
          )
        }

        if (mwConfig.wgIsMainPage && actionResult() === 'view') {
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
            title?.toLowerCase() === titleFromURL().toLowerCase()
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
            title?.toLowerCase() === titleFromURL().toLowerCase()
              ? `${title}`
              : `${title} (${titleFromURL()})`
          }`
        }

        if (presenceData.state)
          presenceData.state += ` | ${siteName}`
        else presenceData.state = siteName
      }
    }
  }
}

(async (): Promise<void> => {
  await prepare()

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
})()
