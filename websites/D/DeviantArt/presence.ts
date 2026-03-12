const presence = new Presence({
  clientId: '664057766809436161',
})

let currentURL = new URL(document.location.href)
let currentPath = currentURL.pathname.replace(/^\/|\/$/g, '').split('/')
const browsingTimestamp = Math.floor(Date.now() / 1000)
let presenceData: PresenceData = {
  details: 'Viewing an unsupported page',
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/DeviantArt/assets/logo.png',
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
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/DeviantArt/assets/logo.png',
  startTimestamp: browsingTimestamp,
}): void {
  currentURL = new URL(document.location.href)
  currentPath = currentURL.pathname.replace(/^\/|\/$/g, '').split('/')
  presenceData = { ...defaultData }
}
/**
 * Function definitions for logging-related things.
 */
const logHandler = {
  /**
   * Handles not supported pages.
   * @param isCritical If the URL is essential to the operation, this should be true, so it will output an error, not a warning.
   */
  pageNotSupported(isCritical = false): void {
    if (isCritical) {
      presence.error(
        'Whoops. It seems that this page is not supported. \nPlease report this to Hans5958#0969 on Discord.',
      )
    }
    else {
      presence.error(
        'It seems that this page is not fully supported. \nPlease report this to Hans5958#0969 on Discord.',
      )
    }
    presence.info(currentURL.href)
  },
  /**
   * Handles fatal errors.
   * @param error The error that it threw.
   */
  fatalError(error: string): void {
    presence.error(
      'Fatal error! Terminating.\nPlease report this to Hans5958#0969 on Discord.',
    )
    presence.info(currentURL.href)
    presence.info(error)
  },
}
/**
 * Search for URL parameters.
 * @param urlParam The parameter that you want to know about the value.
 */
function getURLParam(urlParam: string): string {
  return currentURL.searchParams.get(urlParam)!
}
async function prepare(): Promise<void> {
  /*

  For future developers:

  These domains are supported.
  - www.deviantart.com
  - about.deviantart.com
  - chat.deviantart.com
  - forum.deviantart.com
  - groups.deviantart.com
  - portfolio.deviantart.com
  - shop.deviantart.com
  - www.deviantartsupport.com
  - www.eclipsefeedback.com
  - deviantartads.com
  - sta.sh
  - wallpaper.deviantart.com (redirects to https://www.deviantart.com/customization/wallpaper/)

  These domains will be supported in the future.
  - *.daportfolio.com

  */

  const presenceSettings = {
    chatChannelNames: await presence.getSetting<boolean>('chatChannelNames'),
    detailedSettings: await presence.getSetting<boolean>('detailedSettings'),
  }

  switch (currentURL.hostname) {
    case 'www.deviantart.com': {
      let loadedPath: string
      let forceUpdate = false
      let presenceDataPlaced: PresenceData = {}
      let retries = 0
      let profileType: string

      /* This one decides if the current page belongs to an user or a group */
      if (document.querySelector('#group'))
        profileType = 'group'
      else profileType = 'user'

      const lastItem = (array: NodeList | unknown[]): unknown => {
        return array[array.length - 1]
      }
      const getName = (override = false): string | undefined => {
        try {
          if (!override) {
            try {
              return document.querySelector(
                '#content-container > div > div > div > div > div > a.user-link',
              )!.textContent!
            }
            catch {
              return document.querySelector(
                '#root > main > div > div > div > div > div > div > div > div > span > a.user-link',
              )!.textContent!
            }
          }
          else {
            try {
              return (
                lastItem(
                  document.querySelectorAll('h1 .author .u .u'),
                ) as Element
              )!.textContent!
            }
            catch {
              return document.querySelector('h1 .u .u')!.textContent!
            }
          }
        }
        catch {
          if (
            currentPath[0]?.toLowerCase()
            === document
              .querySelector('title')
              ?.textContent
              ?.split(' ')[0]
              ?.toLowerCase()
          ) {
            return document
              .querySelector('title')
              ?.textContent
              ?.split(' ')[0]
          }
          else if (
            currentPath[0]?.toLowerCase()
            === document
              .querySelector('title')
              ?.textContent
              ?.split(' by ')[1]
              ?.split(' ')[0]
              ?.toLowerCase()
          ) {
            [presenceData.state] = document
              .querySelector('title')
              ?.textContent
              ?.split(' by ')[1]
              ?.split(' ') ?? []
          }
        }
      }

      updateCallback.function = (): void => {
        if (loadedPath !== currentURL.pathname || forceUpdate) {
          loadedPath = currentURL.pathname

          try {
            /*

            Section 1
            This section includes the homepage and similar pages.

            */

            if (currentPath[0] === '') {
              presenceData.details = 'Viewing the home page'
            }
            /* This needs to be on the top since the 404 errors has no fixed URL. */ else if (
              document.querySelector('.error-400')
              || document.querySelector('.error-401')
              || document.querySelector('.error-403')
              || document.querySelector('.error-404')
              || document.querySelector('.error-405')
              || document.querySelector('.error-500')
              || document.querySelector('.error-503')
              || document.querySelector('.error-banned')
              || document.querySelector('.error-beta')
              || document.querySelector('.error-blocked')
              || document.querySelector('.error-blockedbyuser')
              || document.querySelector('.error-contentblockedbyuser')
              || document.querySelector('.error-deactivated')
              || document.querySelector('.error-noreferrer')
              || document.querySelector('.error-pageflooder')
              || document.querySelector('.error-suspended')
              || document.querySelector('.error-threadflooder')
              || document.querySelector('#error-400')
              || document.querySelector('#error-401')
              || document.querySelector('#error-403')
              || document.querySelector('#error-404')
              || document.querySelector('#error-405')
              || document.querySelector('#error-500')
              || document.querySelector('#error-503')
              || document.querySelector('#error-banned')
              || document.querySelector('#error-beta')
              || document.querySelector('#error-blocked')
              || document.querySelector('#error-blockedbyuser')
              || document.querySelector('#error-contentblockedbyuser')
              || document.querySelector('#error-deactivated')
              || document.querySelector('#error-noreferrer')
              || document.querySelector('#error-pageflooder')
              || document.querySelector('#error-suspended')
              || document.querySelector('#error-threadflooder')
            ) {
              presenceData.details = 'On a non-existent page'
            }
            /* The functions below is only valid on the Eclipse theme. */ else {
              switch (currentPath[0]) {
                case 'deviations': {
                  presenceData.details = 'Viewing deviations'
                  presenceData.state = currentPath
                    .slice(1)
                    .concat(getURLParam('order') ?? [])
                    .join(' > ')
                    .trim()
                    .replaceAll('-', ' ')
                    .toLowerCase()
                    .split(' ')
                    .map(w => w.replace(w[0]!, w[0]!.toUpperCase()))
                    .join(' ')

                  break
                }
                case 'daily-deviations': {
                  presenceData.details = 'Viewing daily deviations'
                  presenceData.state = document.querySelector<HTMLSelectElement>(
                    '#daily-deviation-picker',
                  )?.textContent

                  break
                }
                case 'journals': {
                  presenceData.details = 'Viewing daily deviations'
                  if (currentPath[1]) {
                    presenceData.state = currentPath[1].replace(
                      currentPath[1],
                      currentPath[1].toUpperCase(),
                    )
                  }
                  else {
                    presenceData.state = 'All'
                  }

                  break
                }
                case 'status-updates': {
                  presenceData.details = 'Viewing status updates'
                  break
                }
                case 'polls': {
                  presenceData.details = 'Viewing polls'
                  break
                }
                case 'commissions': {
                  presenceData.details = 'Viewing commissions'
                  break
                }
                case 'tag': {
                  presenceData.details = 'Viewing a tag'
                  presenceData.state = `#${currentPath[1]}`

                  break
                }
                case 'search': {
                  presenceData.details = 'Searching something'
                  presenceData.state = getURLParam('q')

                  break
                }
                case 'notifications': {
                  /* Detailed infos, such as what section does the user sees, might be implemented but disabled by default. */
                  if (currentPath[1] === 'notes')
                    presenceData.details = 'Reading notes'
                  if (currentPath[1] === 'watch')
                    presenceData.details = 'Viewing the watch list'
                  else presenceData.details = 'Reading notifications'

                  break
                }
                case 'settings': {
                  /* Detailed infos might be disabled by default. */
                  presenceData.details = 'Doing some settings'
                  if (presenceSettings.detailedSettings) {
                    presenceData.state = document.querySelector(
                      'ul.menu_holder li > a.active',
                    )?.textContent
                  }

                  break
                }
                case 'account': {
                  /* This might expose some stuff, because the page shows orders, points, and earnings. Additional infos might be disabled by default. */
                  presenceData.details = 'Viewing the account pages'
                  // presenceSettings.detailedAccount

                  break
                }
                case 'checkout': {
                  /* This might be disabled by default. */
                  presenceData.details = 'On the checkout'

                  break
                }
                case 'wishlist': {
                  presenceData.details = 'Viewing their wishlist'
                  break
                }
                case 'core-membership': {
                  presenceData.details = 'Viewing a page'
                  presenceData.state = 'Core Membership'

                  break
                }
                case 'timeline': {
                  presenceData.details = 'Viewing a page'
                  presenceData.state = 'Timeline'

                  break
                }
                case 'makeagroup': {
                  presenceData.details = 'Making a group'
                  break
                }
                default:
                  if (
                    currentPath[0] === 'users'
                    && currentPath[1] === 'login'
                  ) {
                    presenceData.details = 'Logging in'
                  }
                  else {
                    switch (currentPath[0]) {
                      case 'join': {
                        presenceData.details = 'Registering an account'
                        break
                      }
                      case 'forum': {
                        if (currentPath[2]) {
                          if (currentPath[3]) {
                            presenceData.details = 'Viewing a topic'
                            presenceData.state = document.querySelector('h1')?.textContent
                          }
                          else {
                            presenceData.details = 'Viewing a topic category'
                            presenceData.state = document.querySelector('h1')?.textContent
                          }
                        }
                        else {
                          presenceData.details = 'Viewing the forums'
                        }

                        break
                      }
                      case 'about': {
                        presenceData.details = 'Viewing the about pages'

                        if (currentPath[1] === '') {
                          presenceData.state = 'About'
                        }
                        else if (currentPath[1] === 'policy') {
                          if (currentPath[2] === 'etiquette')
                            presenceData.state = 'Etiquette Policy'
                          if (currentPath[2] === 'privacy')
                            presenceData.state = 'Privacy Policy'
                          if (currentPath[2] === 'service')
                            presenceData.state = 'Terms of Service'
                          if (currentPath[2] === 'copyright')
                            presenceData.state = 'Copyright Policy'
                        }
                        else {
                          logHandler.pageNotSupported(false)
                        }

                        break
                      }
                      case 'watch': {
                        presenceData.details = 'Viewing the watch list'
                        break
                      }
                      default:
                        switch (currentPath[1]) {
                          case 'art': {
                            presenceData.details = document
                              .querySelector('title')
                              ?.textContent
                              ?.split(' by ')
                              ?.slice(0, -1)
                              ?.join(' - ');
                            [presenceData.state] = document
                              .querySelector('title')
                              ?.textContent
                              ?.split(' by ')
                              ?.pop()
                              ?.split(' ') ?? []
                            /* I actually wanted to get it using the visible elements, but well, it's complicated. */
                            if (
                              presenceData.details
                              === presenceDataPlaced.details
                              && presenceData.state === presenceDataPlaced.state
                            ) {
                              throw new Error(
                                'Current status is the same as the previous.',
                              )
                            }
                            if (presenceData.details === '') {
                              throw new Error(
                                'No art title detected and user is from the homepage.',
                              )
                            }

                            /* The functions below are valid for users and groups. */

                            break
                          }
                          case 'gallery':
                          case 'favourites': {
                            if (currentPath[1] === 'gallery')
                              presenceData.details = `Viewing a ${profileType}'s gallery`
                            else
                              presenceData.details = `Viewing a ${profileType}'s favourites`
                            if (profileType === 'user') {
                              presenceData.state = `${getName()}`
                            }
                            else if (
                              profileType === 'group'
                              && !currentPath[2]
                            ) {
                              presenceData.state = getName(true)
                            }
                            else if (
                              !document.querySelector('.gallery .active')
                            ) {
                              presenceData.state = `${document.querySelector('.folder-title')
                                ?.textContent
                              } by ${getName(true)}`
                            }
                            else if (
                              document
                                .querySelector('.gallery .active')
                                ?.textContent
                                ?.slice(1) === 'Featured'
                            ) {
                              presenceData.state = `Featured by ${getName(
                                true,
                              )}`
                            }
                            else if (
                              document
                                .querySelector('.gallery .active')
                                ?.textContent
                                ?.slice(1) === 'All'
                            ) {
                              presenceData.state = `All by ${getName(true)}`
                            }

                            /* The functions below are vaild for users only. */

                            break
                          }
                          case 'print': {
                            presenceData.details = document.querySelector('h1 .title')?.textContent
                            presenceData.state = getName(true)

                            break
                          }
                          case 'prints': {
                            presenceData.details = 'Viewing a user\'s prints'
                            presenceData.state = getName()

                            break
                          }
                          case 'posts': {
                            /* This part is only valid on the Eclipse theme. */
                            presenceData.details = {
                              'All': 'Viewing a user\'s posts',
                              'Journals': 'Viewing a user\'s journals',
                              'Status Updates': 'Viewing a user\'s statuses',
                              'Polls': 'Viewing a user\'s polls',
                            }[
                              document.querySelector(
                                '._3xmU1 div a',
                              )?.textContent ?? ''
                            ]
                            presenceData.state = getName()

                            break
                          }
                          case 'journal': {
                            if (currentPath[2]) {
                              presenceData.details = document.querySelector('._2-k1X')?.textContent
                              presenceData.state = `${getName()} (journal)`
                            }
                            else {
                              /* This part is only valid on the old theme. */
                              presenceData.details = 'Viewing a user\'s journals'
                              presenceData.state = getName()
                            }

                            break
                          }
                          case 'poll': {
                            try {
                              presenceData.details = document.querySelector('._1ddsf')?.textContent
                            }
                            catch {
                              presenceData.details = document.querySelector('.gfMBk')?.textContent
                            }
                            presenceData.state = getName()

                            break
                          }
                          case 'critique': {
                            if (currentPath[2]) {
                              presenceData.details = 'Viewing a critique'
                              presenceData.state = `from ${getName()}, ${document
                                .querySelector('h2')
                                ?.textContent
                                ?.trim()} ${document
                                .querySelector('h4')
                                ?.textContent
                                ?.trim()}`
                            }
                            else {
                              presenceData.details = 'Viewing a user\'s critiques'
                              presenceData.state = getName()
                            }

                            break
                          }
                          case 'wishlist': {
                            presenceData.details = 'Viewing a user\'s wishlist'
                            presenceData.state = getName()

                            break
                          }
                          case 'dds': {
                            presenceData.details = 'Viewing a user\'s daily deviations'
                            presenceData.state = getName()

                            break
                          }
                          case 'badges': {
                            /* This part is only valid on the old theme. (not quite sure) */
                            if (currentPath[2]) {
                              presenceData.details = 'Viewing a badge'
                              presenceData.state = `${document.querySelector('h3')?.textContent
                              } from ${getName()}`
                            }
                            else {
                              presenceData.details = `Viewing a ${profileType}'s badges`
                              presenceData.state = getName(true)
                            }

                            /* The functions below are valid for groups only. */

                            break
                          }
                          case 'aboutus': {
                            presenceData.details = 'Viewing a group\'s about page'
                            presenceData.state = getName(true)

                            break
                          }
                          case 'blog': {
                            presenceData.details = 'Viewing a group\'s blog'
                            presenceData.state = getName(true)

                            /* The function below are valid for users and groups. */

                            break
                          }
                          default:
                            if (
                              currentPath[0]
                              && !currentPath[1]
                              && getName()
                            ) {
                              presenceData.details = `Viewing a ${profileType}'s profile`
                              if (profileType === 'group')
                                presenceData.state = getName(true)
                              else presenceData.state = getName()

                              /* The page is not supported. Whoops. */
                            }
                            else {
                              logHandler.pageNotSupported(true)
                            }
                        }
                    }
                  }
              }
            }

            presence.success('Done!')
            presenceDataPlaced = presenceData
            forceUpdate = false
            retries = 0
          }
          catch (error) {
            forceUpdate = true
            retries++
            resetData()
            presenceData.details = 'Loading...'
            if (retries === 30) {
              updateCallback.function = (): void => void 0
              logHandler.fatalError(error as string)
            }
          }
        }
        else {
          presenceData = presenceDataPlaced
        }
      }

      break
    }
    case 'chat.deviantart.com': {
      if (currentPath[0] === '') {
        presenceData.details = 'Viewing the chat room list'
      }
      else if (currentPath[0] === 'chat') {
        presenceData.details = 'On a chat room'

        if (presenceSettings.chatChannelNames) {
          const channel = (): string =>
            document.querySelector('.damnc-tabbar strong')!.textContent!
          let loadedChannel = ''
          let forceUpdate = false
          let presenceDataPlaced: PresenceData = {}
          let retries = 0

          updateCallback.function = (): void => {
            if (loadedChannel !== channel() || forceUpdate) {
              loadedChannel = channel()
              try {
                presenceData.state = channel()
                presenceDataPlaced = presenceData
                forceUpdate = false
                retries = 0
              }
              catch (error) {
                forceUpdate = true
                retries++
                resetData()
                presenceData.details = 'Loading...'
                if (retries === 30) {
                  updateCallback.function = (): void => void 0
                  logHandler.fatalError(error as string)
                }
              }
            }
            else {
              presenceData = presenceDataPlaced
            }
          }
        }
      }

      break
    }
    case 'groups.deviantart.com': {
      presenceData.details = 'Looking for a group'
      break
    }
    case 'portfolio.deviantart.com': {
      presenceData.details = 'Creating a portfolio'
      break
    }
    case 'shop.deviantart.com': {
      if (getURLParam('q')) {
        presenceData.details = 'Searching something on the shop'
        presenceData.state = getURLParam('q')
      }
      else {
        presenceData.details = 'Viewing deviations on the shop'
        const li = document.querySelectorAll(
          '.browse-facet-product ul li .selected',
        )
        for (const v of li) {
          if (!presenceData.state)
            presenceData.state = v.textContent
          else presenceData.state += ` > ${v.textContent}`
        }
      }

      break
    }
    case 'www.deviantartsupport.com': {
      let currentTitle: string | undefined
      let presenceDataPlaced: PresenceData = {}

      updateCallback.function = (): void => {
        if (currentTitle !== document.title.split(' - ')[0]) {
          [currentTitle] = document.title.split(' - ')
          presenceData.details = 'Viewing the help center/KB'
          presenceData.state = currentTitle
          presenceDataPlaced = presenceData
        }
        else {
          presenceData = presenceDataPlaced
        }
      }

      break
    }
    case 'www.eclipsefeedback.com': {
      presenceData.details = 'Giving feedback about Eclipse'
      break
    }
    case 'deviantartads.com': {
      presenceData.details = 'Viewing the media kit'
      break
    }
    case 'sta.sh': {
      let loadedPath: string
      let forceUpdate = false
      let presenceDataPlaced: PresenceData = {}
      let retries = 0

      updateCallback.function = (): void => {
        if (loadedPath !== currentURL.pathname || forceUpdate) {
          loadedPath = currentURL.pathname

          try {
            switch (currentPath[0]) {
              case '':
                presenceData.details = 'On Sta.sh'
                presenceData.state = 'Index'
                break

              case 'my':
                if (currentPath[1] === 'settings') {
                  presenceData.details = 'On Sta.sh'
                  presenceData.state = 'Settings'
                }
                // else {
                //   logHandler.pageNotSupported(true)
                // }
                break

              case 'writer':
                presenceData.details = 'On Sta.sh'
                presenceData.state = 'Sta.sh Writer'
                break

              case 'muro':
                presenceData.details = 'On Sta.sh'
                presenceData.state = 'DeviantArt muro'
                break

              default:
                presenceData.details = document
                  .querySelector('title')
                  ?.textContent
                  ?.split(' - ')
                  ?.slice(0, -1)
                  ?.join(' - ')
                presenceData.state = `${document
                  .querySelector('title')
                  ?.textContent
                  ?.split(' - ')
                  ?.pop()
                  ?.split('\'s')[0]
                } (sta.sh)`
                if (presenceData.details === '')
                  throw new Error('No title found on Sta.sh')
            }

            presenceDataPlaced = presenceData
            forceUpdate = false
            retries = 0
          }
          catch (error) {
            forceUpdate = true
            retries++
            resetData()
            presenceData.details = 'Loading...'
            if (retries === 30) {
              updateCallback.function = (): void => void 0
              logHandler.fatalError(error as string)
            }
          }
        }
        else {
          presenceData = presenceDataPlaced
        }
      }

      break
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
