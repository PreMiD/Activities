import { Assets } from 'premid'

const presence = new Presence({
  clientId: '731069087031230487',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let currentURL = new URL(document.location.href)
let currentPath = currentURL.pathname.replace(/^\/|\/$/g, '').split('/')
let presenceData: PresenceData = {
  details: 'Viewing an unsupported page',
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/ManiaExchange/assets/logo.png',
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
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/ManiaExchange/assets/logo.png',
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
/**
 * Get timestamps based on the video element.
 * @param {number} videoTime Current video time seconds.
 * @param {number} videoDuration Video duration seconds.
 */
function getTimestamps(videoTime: number, videoDuration: number): number[] {
  const startTime = Date.now()
  return [
    Math.floor(startTime / 1000),
    Math.floor(startTime / 1000) - videoTime + videoDuration,
  ]
}

enum ActivityAssets {
  Sm = 'https://cdn.rcd.gg/PreMiD/websites/M/ManiaExchange/assets/0.png',
  Accounts = 'https://cdn.rcd.gg/PreMiD/websites/M/ManiaExchange/assets/1.png',
  Tm = 'https://cdn.rcd.gg/PreMiD/websites/M/ManiaExchange/assets/2.png',
  Api = 'https://cdn.rcd.gg/PreMiD/websites/M/ManiaExchange/assets/3.png',
  Item = 'https://cdn.rcd.gg/PreMiD/websites/M/ManiaExchange/assets/4.png',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/ManiaExchange/assets/5.png',
  Tmtube = 'https://cdn.rcd.gg/PreMiD/websites/M/ManiaExchange/assets/6.png',
  Tm2020 = 'https://cdn.rcd.gg/PreMiD/websites/M/ManiaExchange/assets/7.png',
  Tmx = 'https://cdn.rcd.gg/PreMiD/websites/M/ManiaExchange/assets/8.png',
}

((): void => {
  if (
    currentURL.hostname.startsWith('mania')
    || currentURL.hostname.startsWith('www')
  ) {
    if (currentPath[0] === '') {
      presenceData.details = 'On the portal'
    }
    else {
      presenceData.details = 'Viewing a page'
      presenceData.state = {
        tac: 'Terms and Conditions',
        privacy: 'Privacy Policy',
        logos: 'Logos & Signpacks',
      }[currentPath[0]!]
    }
  }
  else if (
    currentURL.hostname.startsWith('tm.')
    || currentURL.hostname.startsWith('sm')
    || currentURL.hostname.startsWith('trackmania')
  ) {
    /**
     * Choose between two strings based on the website.
     * @param tm String for TrackMania²
     * @param sm String for ShootMania
     */
    const chooseTwo = (tm: string, sm: string): string => {
      return presenceData.smallImageKey === ActivityAssets.Tm ? tm : sm
    }

    switch (currentURL.hostname.split('.')[0]) {
      case 'tm':
        presenceData.smallImageKey = ActivityAssets.Tm
        presenceData.smallImageText = 'TrackMania²'
        break
      case 'sm':
        presenceData.smallImageKey = ActivityAssets.Sm
        presenceData.smallImageText = 'ShootMania'
        break
      case 'trackmania':
        presenceData.smallImageKey = ActivityAssets.Tm2020
        presenceData.smallImageText = 'Trackmania (2020)'
        presenceData.largeImageKey = ActivityAssets.Tmx
        break
    }

    if (
      currentPath[0] === 'error'
      || currentPath[0] === 'errorhandler'
      || (document.querySelector('.ly-box > span')?.children.length === 3
        && document.querySelector('.ly-box b')?.textContent === 'Error')
    ) {
      presenceData.details = 'On a non-existent page'
    }
    else {
      switch (currentPath[0]) {
        case '':
        case 'home': {
          if (currentPath[1] === 'rules') {
            presenceData.details = 'Viewing a page'
            presenceData.state = 'Rules & Guidelines' // actually "Guildelines" on the page
          }
          else if (currentPath[1] === 'about') {
            presenceData.details = 'Viewing a page'
            presenceData.state = 'About'
          }
          else {
            presenceData.details = 'On the home page'
          }

          break
        }
        case 'auth': {
          presenceData.details = 'Logging in'
          break
        }
        case 'tracks':
        case 'maps': {
          presenceData.details = document
            .querySelector('.panelbox-heading h1')
            ?.textContent
            ?.trim()
          presenceData.state = document
            .querySelector('.panelbox-stats a[data-userid]')
            ?.textContent
            ?.trim()

          break
        }
        case 'tracksearch2':
        case 'mapsearch2':
        case 'ts':
        case 'ms': {
          presenceData.details = chooseTwo(
            'Searching for a track',
            'Searching for a map',
          )
          updateCallback.function = (): void => {
            presenceData.state = getURLParam('trackname')
          }

          break
        }
        case 'tracksearch':
        case 'mapsearch': {
          const searchSummary = document
            .querySelector('td.WindowText:nth-child(2)')
            ?.textContent
            ?.trim()
            .slice(8)
          presenceData.details = chooseTwo(
            'Searching for a track',
            'Searching for a map',
          )
          if (
            (document.querySelector('#TrackName') as HTMLInputElement).value
          ) {
            presenceData.state = `${
              (document.querySelector('#TrackName') as HTMLInputElement).value
            }, ${searchSummary}`
          }
          else {
            presenceData.state = `${searchSummary?.[0]?.toUpperCase()}${searchSummary?.slice(1)}`
          }

          break
        }
        case 'mappacksearch': {
          // Valid on TrackMania² and Trackmania (2020) only
          updateCallback.function = (): void => {
            presenceData.details = 'Searching for a mappack'
            presenceData.state = getURLParam('name')
          }

          break
        }
        case 'mappack': {
          // Valid on TrackMania² and Trackmania (2020) only
          if (currentPath[1] === 'create') {
            presenceData.details = 'Creating a mappack'
          }
          else if (currentPath[1] === 'view') {
            presenceData.details = document
              .querySelector('.WindowText td:nth-of-type(2)')
              ?.textContent
              ?.trim()
            presenceData.state = `${document
              .querySelector('.WindowText:nth-of-type(2) td:nth-of-type(2)')
              ?.textContent
              ?.trim()} (mappack)`
          }

          break
        }
        case 'upload': {
          // Valid on TrackMania² and Trackmania (2020) only
          if (currentPath[1] === 'track')
            presenceData.details = 'Uploading a track'
          else if (currentPath[1] === 'replay')
            presenceData.details = 'Uploading a replay'

          break
        }
        case 'recordsearch': {
          // Valid on TrackMania² and Trackmania (2020) only
          presenceData.details = 'Searching for a record'
          updateCallback.function = (): void => {
            presenceData.state = getURLParam('name')
          }

          break
        }
        case 'leaderboard': {
          // Valid on TrackMania² and Trackmania (2020) only
          presenceData.details = 'Viewing the leaderboards'
          updateCallback.function = (): void => {
            presenceData.state = document
              .querySelector('.select2-choice')
              ?.textContent
              ?.trim()
          }

          break
        }
        case 'reports': {
          if (currentPath[1] === 'compose')
            presenceData.details = 'Reporting something'
          else if (currentPath[1] === 'my-reports')
            presenceData.details = 'Viewing reports'
          else presenceData.details = 'Viewing a report'

          break
        }
        case 'forums': {
          presenceData.details = 'Viewing the forums'
          presenceData.state = document
            .querySelector('.windowv2-header')
            ?.textContent
            ?.trim()
          if (presenceData.state === 'Community forums')
            delete presenceData.state

          break
        }
        case 'threads': {
          if (currentPath[1] === 'new-thread') {
            presenceData.details = 'Writing a new thread'
          }
          else if (currentPath[1] === 'new-post') {
            presenceData.details = 'Replying to a thread'
          }
          else {
            presenceData.details = 'Viewing a thread'
            presenceData.state = document
              .querySelector('.windowv2-header')
              ?.textContent
              ?.trim()
          }

          break
        }
        case 'posts': {
          if (currentPath[1] === 'edit')
            presenceData.details = 'Editing a post'

          break
        }
        case 'blogs': {
          if (currentPath[1] === 'entry') {
            presenceData.details = 'Reading a blog entry'
            presenceData.state = document
              .querySelector('.windowv2-header')
              ?.textContent
              ?.trim()
          }
          else if (currentPath[1] === 'search') {
            presenceData.details = 'Searching for a blog entry'
          }
          else {
            presenceData.details = 'Viewing the blog'
          }

          break
        }
        case 'user': {
          switch (currentPath[1]) {
            case 'search': {
              const searchSummary = document
                .querySelector('.windowv2-textcontainer')
                ?.textContent
                ?.trim()
                .split(' ...')[0]
                ?.slice(15)
              const usernameSearched = (
                document.querySelector('#UserUsername') as HTMLInputElement
              ).value
              presenceData.details = 'Searching for a user'
              if (usernameSearched) {
                presenceData.state = `${usernameSearched}, ${searchSummary?.slice(
                  usernameSearched.length + 30,
                )}`
              }
              else {
                presenceData.state = `${searchSummary?.[0]?.toUpperCase()}${searchSummary?.slice(1)}`
              }

              break
            }
            case 'team': {
              presenceData.details = 'Viewing the team behind the site'
              presenceData.state = '(MX Crew)'

              break
            }
            case 'online': {
              presenceData.details = 'Viewing active users'
              break
            }
            case 'profile': {
              presenceData.details = 'Viewing a user profile'
              presenceData.state = document.querySelector(
                '.WindowText .RowModCell_1:nth-of-type(2) a:nth-of-type(3)',
              )?.textContent

              break
            }
            case 'edit': {
              presenceData.details = 'Editing their account information'
              break
            }
          }

          break
        }
        case 'support': {
          presenceData.details = 'Viewing a page'
          presenceData.state = 'Support'

          break
        }
        case 'messaging': {
          if (currentPath[1] === 'index' || !currentPath[1])
            presenceData.details = 'Viewing thier private messages'
          else if (currentPath[1] === 'compose')
            presenceData.details = 'Writing a private message'
          else if (currentPath[1] === 'reply')
            presenceData.details = 'Replying a private message'
          else presenceData.details = 'Viewing a private message'

          break
        }
        case 'media': {
          presenceData.details = 'Viewing a page'
          presenceData.state = 'Media'

          break
        }
        case 'api': {
          presenceData.details = 'Viewing a page'
          presenceData.state = 'API'

          break
        }
        case 'statistics': {
          presenceData.details = 'Viewing statistics'
          presenceData.state = document
            .querySelector('.windowv2-header')
            ?.textContent
            ?.trim()
          if (presenceData.state === 'Statistics')
            delete presenceData.state

          break
        }
        default:
          if (currentPath[0] === 'news' && currentPath[1] === 'archive')
            presenceData.details = 'Viewing the news archive'
      }
    }
  }
  else if (currentURL.hostname.startsWith('item')) {
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.smallImageText = 'ItemExchange'
    presenceData.largeImageKey = ActivityAssets.Item

    if (currentPath[0] === 'error') {
      presenceData.details = 'On a non-existent page'
    }
    else if (
      (currentPath[0] === '' || currentPath[0] === 'home')
      && currentPath.length === 1
    ) {
      presenceData.details = 'On the home page'
    }
    else if (currentPath[0] === 'auth') {
      presenceData.details = 'Logging in'
    }
    else if (currentPath[0]?.toLowerCase() === 'item') {
      presenceData.details = document.querySelector('h3')?.textContent
      presenceData.state = document
        .querySelector('.panel-body dd:nth-of-type(2)')
        ?.textContent
        ?.trim()
    }
    else if (currentPath[0]?.toLowerCase() === 'set') {
      presenceData.details = document.querySelector('h3')?.textContent
      presenceData.state = `${document
        .querySelector('.panel-body dd:nth-of-type(2)')
        ?.textContent
        ?.trim()} (set)`
    }
    else {
      switch (currentPath[0]) {
        case 'itemsearch': {
          presenceData.details = 'Searching for an item'
          updateCallback.function = (): void => {
            presenceData.state = getURLParam('itemname')
          }

          break
        }
        case 'setsearch': {
          presenceData.details = 'Searching for a set'
          updateCallback.function = (): void => {
            presenceData.state = getURLParam('setname')
          }

          break
        }
        case 'blocks': {
          presenceData.details = 'Searching for a block'
          break
        }
        case 'forum': {
          presenceData.details = 'Viewing the forums'
          presenceData.state = document
            .querySelector('.windowv2-header')
            ?.textContent
            ?.trim()
          if (presenceData.state === 'Community Forums')
            delete presenceData.state

          break
        }
        case 'threads': {
          presenceData.details = 'Viewing a thread'
          presenceData.state = document
            .querySelector('.windowv2-header')
            ?.textContent
            ?.trim()

          break
        }
        case 'usersearch': {
          const details = []
          if ((document.querySelector('#username') as HTMLInputElement).value) {
            details.push(
              (document.querySelector('#username') as HTMLInputElement).value,
            )
          }
          if (document.querySelector('#s2id_mode')?.textContent) {
            details.push(
              document.querySelector('#s2id_mode')!.textContent!.slice(1),
            )
          }
          presenceData.details = 'Searching for a user'
          if (details.length !== 0)
            presenceData.state = details.join(', ')

          break
        }
        case 'user': {
          if (currentPath[1] === 'profile') {
            presenceData.details = 'Viewing a user profile'
            presenceData.state = document.querySelector(
              '.WindowText .RowModCell_1:nth-of-type(2) a:nth-of-type(3)',
            )?.textContent
          }
          else if (currentPath[1] === 'edit') {
            presenceData.details = 'Editing their account information'
          }

          break
        }
        case 'messaging': {
          if (currentPath[1] === 'index' || !currentPath[1])
            presenceData.details = 'Viewing thier private messages'
          else if (currentPath[1] === 'compose')
            presenceData.details = 'Writing a private message'
          else if (currentPath[1] === 'reply')
            presenceData.details = 'Replying a private message'
          else presenceData.details = 'Viewing a private message'

          break
        }
        case 'faq': {
          presenceData.details = 'Viewing a page'
          presenceData.state = 'FAQ'

          break
        }
        case 'rules': {
          presenceData.details = 'Viewing a page'
          presenceData.state = 'Rules'

          break
        }
      }
    }
  }
  else if (currentURL.hostname.startsWith('accounts')) {
    presenceData.smallImageKey = ActivityAssets.Accounts
    presenceData.smallImageText = 'Accounts'

    if (currentPath[0] === 'auth') {
      switch (currentPath[1]) {
        case 'login': {
          presenceData.details = 'Logging in'
          break
        }
        case 'register':
        case 'resend_confirm': {
          presenceData.details = 'Registering an account'
          break
        }
        case 'forgot': {
          presenceData.details = 'Figuring out the password'
          break
        }
      }
    }
    else if (currentPath[0] === 'user') {
      presenceData.details = 'Configuring their account'
    }
  }
  else if (currentURL.hostname.startsWith('tmtube')) {
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.smallImageText = 'TMTube Archive'
    presenceData.largeImageKey = ActivityAssets.Tmtube

    updateCallback.function = (): void => {
      switch (currentPath[0]) {
        case '': {
          presenceData.details = 'On the home page'
          break
        }
        case 'view': {
          presenceData.details = document
            .querySelector('h2')
            ?.textContent
            ?.trim()
          presenceData.state = document
            .querySelector('.box-user h2')
            ?.textContent
            ?.trim()
          delete presenceData.startTimestamp
          try {
            if (
              document
                .querySelector('.mejs__playpause-button button')
                ?.getAttribute('aria-label') === 'Pause'
            ) {
              presenceData.smallImageKey = Assets.Play
              presenceData.smallImageText = 'TMTube Archive — Playing'
              const video = document.querySelector('video')!;
              [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
                Math.floor(video.currentTime),
                Math.floor(video.duration),
              )
            }
            else {
              presenceData.smallImageKey = Assets.Pause
              presenceData.smallImageText = 'TMTube Archive — Paused'
              delete presenceData.endTimestamp
            }
          }
          catch {
            delete presenceData.endTimestamp
          }

          break
        }
        case 'search': {
          presenceData.details = 'Searching for a video'
          presenceData.state = getURLParam('query')

          break
        }
      }
    }
  }
  else if (currentURL.hostname.startsWith('api')) {
    presenceData.smallImageKey = ActivityAssets.Api
    presenceData.smallImageText = 'API Documentation'

    if (currentPath[0] === '') {
      presenceData.details = 'On the home page'
    }
    else if (currentPath[0] === 'documents') {
      presenceData.details = 'Viewing a page'
      switch (currentPath[1]) {
        case 'reference':
          presenceData.state = 'API Reference'
          break
        case 'enum':
          presenceData.state = 'Enumeration values'
          break
        case 'conventions':
          presenceData.state = 'Conventions'
          break
        case 'changes':
          presenceData.state = 'Changes'
          break
      }
    }
  }
  else if (currentURL.hostname.startsWith('blog')) {
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Blog'

    if (currentPath[0] === 'posts' && currentPath[1]) {
      presenceData.details = 'Reading a blog post'
      presenceData.state = document.querySelector('h1')?.textContent
    }
    else {
      presenceData.details = 'Viewing the blog'
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
