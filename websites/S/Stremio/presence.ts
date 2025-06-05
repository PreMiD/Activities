import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum AppVersion {
  Website = -1,
  V4 = 4,
  V5 = 5,
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/Stremio/assets/0.png',
}

function getAppVersion(hostname: string) {
  switch (hostname) {
    case 'www.stremio.com':
      return AppVersion.Website
    case 'app.strem.io':
      return AppVersion.V4
    default:
      return AppVersion.V5
  }
}

function _eval(js: string): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const eventName = 'PreMiD_Stremio'
      const script = document.createElement('script')

      window.addEventListener(
        eventName,
        (data) => {
          script.remove()
          resolve((data as CustomEvent).detail)
        },
        { once: true },
      )
      script.id = eventName
      script.appendChild(
        document.createTextNode(`
        var core = window.services.core;
        var result = ${js};

        if (result instanceof Promise) {
          result.then((awaitedResult) => {
            window.dispatchEvent(new CustomEvent("${eventName}", { detail: awaitedResult }));
          });
        } else {
          window.dispatchEvent(new CustomEvent("${eventName}", { detail: result }));
        }
      `),
      )

      document.head.appendChild(script)
    }
    catch (err) {
      reject(err)
    }
  })
}

interface Video {
  isEmbed: boolean
  isPaused: boolean
  startTimestamp?: number
  endTimestamp?: number
}

function findVideo(presence: Presence): Video | null {
  const videoElement = document.querySelector<HTMLMediaElement>('video')

  if (videoElement) {
    const result: Video = { isEmbed: false, isPaused: videoElement.paused }

    if (!Number.isNaN(videoElement?.duration)) {
      [result.startTimestamp, result.endTimestamp] = presence.getTimestampsfromMedia(videoElement)
    }

    return result
  }
  else if (document.querySelector('div[class*=\'player-container\']')) {
    const result: Video = {
      isEmbed: true,
      isPaused: !!document.querySelector(
        'div[class*=\'control-bar-button\'] > svg[icon=\'ic_play\']',
      ),
    }
    const seekBar = document.querySelector('[class*="seek-bar-container"]');
    [result.startTimestamp, result.endTimestamp] = presence.getTimestamps(
      Number(
        presence.timestampFromFormat(seekBar?.firstElementChild?.textContent ?? ''),
      ),
      Number(
        presence.timestampFromFormat(seekBar?.lastElementChild?.textContent ?? ''),
      ),
    )

    return result
  }
  else {
    return null
  }
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
    details: 'Stremio',
    name: 'Stremio',
  }
  const { hash, hostname, pathname, href } = document.location
  const [privacy, thumbnails, buttons, search] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('thumbnails'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('search'),
  ])
  const appVersion = getAppVersion(hostname)

  if (!privacy && search) {
    let searchInput: HTMLInputElement | null = null

    if (appVersion === AppVersion.V4)
      searchInput = document.querySelector('#global-search-field')
    else searchInput = document.querySelector('input[class*=\'search-input\']')

    const searchValue = searchInput?.value

    if (searchValue) {
      presenceData.details = `Searching for ${searchValue}`
      presenceData.smallImageKey = Assets.Search
      presence.setActivity(presenceData)
      return
    }
  }

  switch (appVersion) {
    case AppVersion.V4:
    case AppVersion.V5: {
      const video = findVideo(presence)

      if (privacy) {
        presenceData.state = video !== null ? 'Watching' : 'Browsing'
        break
      }

      switch (hash.replace('#/', '').split('/').shift()?.split('?').shift()) {
        case '':
          presenceData.state = 'Browsing'
          presenceData.buttons = [
            {
              label: 'View Board',
              url: href,
            },
          ]
          break
        case 'detail': {
          if (appVersion === AppVersion.V4) {
            presenceData.state = document.querySelector(
              '#detail > div:nth-child(3) > div > div.sidebar-info-container > div > div.logo > div',
            )?.textContent
            presenceData.largeImageKey = document
              .querySelector(
                '#detail > div.details-less-info > div.details-top > div:nth-child(1)',
              )
              ?.firstElementChild
              ?.getAttribute('src') ?? ActivityAssets.Logo
          }
          else {
            const imgElement = document.querySelector(
              'div[class*=\'meta-info-container\'] > img[class*=\'logo\']',
            )
            const routeContents = document.querySelectorAll('.route-content')
            presenceData.largeImageKey = (routeContents.length > 1
              ? routeContents[routeContents.length - 1]
              : routeContents[0]
            )?.querySelector('img')?.src
            ?? imgElement?.getAttribute('src')
            ?? ActivityAssets.Logo
            presenceData.state = imgElement?.getAttribute('title')
              ?? document.querySelector(
                'div[class*=\'logo-placeholder\']:last-child',
              )?.textContent
          }

          const type = hash.split('/')[2]
          presenceData.details = `Viewing a ${type}`
          presenceData.buttons = [
            {
              label: `View ${type}`,
              url: href,
            },
          ]

          break
        }
        case 'addons': {
          const title = document.querySelector(
            appVersion === AppVersion.V4
              ? '[class=\'ng-scope selected\']'
              : 'div[class*=\'addons-content\'] > div[class*=\'selectable-inputs-container\'] > div:nth-child(2) > div',
          )?.textContent
          const type = document.querySelector(
            appVersion === AppVersion.V4
              ? '[class=\'ng-binding ng-scope selected\']'
              : 'div[class*=\'addons-content\'] > div[class*=\'selectable-inputs-container\'] > div:nth-child(3) > div',
          )?.textContent

          presenceData.details = `Browsing ${title
            ?.toLowerCase()
            ?.replace(' addons', '')} addons`
          presenceData.state = type ?? 'All'
          presenceData.buttons = [
            {
              label: 'Browse Addons',
              url: href,
            },
          ]
          break
        }
        case 'settings': {
          const section = document.querySelector(
            appVersion === AppVersion.V4
              ? '[class=\'ng-scope ng-binding active\']'
              : 'div[class*=\'settings-content\'] div[class*=\'selected\']',
          )?.textContent ?? 'General'
          presenceData.details = `${section} settings`
          break
        }
        case 'discover': {
          const type = document
            .querySelector(
              appVersion === AppVersion.V4
                ? '[class=\'ng-binding ng-scope selected\']'
                : 'div[class*=\'selectable-inputs-container\'] > div:nth-child(1) > div',
            )
            ?.textContent
            ?.toLowerCase()
          const category = document.querySelector(
            appVersion === AppVersion.V4
              ? 'ul.sort > li.selected'
              : 'div[class*=\'selectable-inputs-container\'] > div:nth-child(2) > div',
          )?.textContent
          const genre = document
            .querySelector(
              appVersion === AppVersion.V4
                ? 'ul.genre-select > li.selected'
                : 'div[class*=\'selectable-inputs-container\'] > div:nth-child(3) > div',
            )
            ?.textContent
            ?.replace('Select genre', '') || null

          presenceData.buttons = [
            {
              label: 'Browse',
              url: href,
            },
          ]
          presenceData.details = `Discovering ${type ?? 'content'}${
            type === 'series' ? '' : 's'
          }`
          presenceData.state = `${category ?? 'All'}${
            genre && !['none', 'genre'].includes(genre.toLowerCase())
              ? ` | ${genre}`
              : ''
          }`

          break
        }
        case 'library': {
          const type = document.querySelector(
            appVersion === AppVersion.V4
              ? '[class=\'ng-binding ng-scope selected\']'
              : 'div[class*=\'selectable-inputs-container\'] > div > div',
          )?.textContent

          presenceData.details = 'Library'
          presenceData.state = type ?? 'All'
          presenceData.buttons = [
            {
              label: 'View Library',
              url: href,
            },
          ]
          break
        }
        case 'calendar':
          presenceData.details = 'Calendar'
          presenceData.buttons = [
            {
              label: 'View Calendar',
              url: href,
            },
          ]
          break
        case 'search':
          presenceData.details = 'Searching'
          break
        case 'player': {
          if (video === null)
            break

          presenceData.endTimestamp = video.endTimestamp
          presenceData.startTimestamp = video.startTimestamp

          if (
            (appVersion === AppVersion.V4
              ? document
                .querySelector('#loading-logo')
                ?.className
                .includes('flashing')
              : !!document.querySelector(
                  'div[class*=\'buffering-loader-container\']',
                ))
                || video.isPaused
          ) {
            presenceData.smallImageKey = Assets.Pause
            presenceData.smallImageText = 'Paused'
            presenceData.state = 'Paused'
          }
          else {
            presenceData.smallImageKey = Assets.Play
            presenceData.smallImageText = 'Playing'
            presenceData.state = 'Watching'
          }

          let metaUrl: string | undefined

          if (appVersion === AppVersion.V4) {
            presenceData.details = document
              .querySelector('head > title')
              ?.textContent
              ?.replace('Stremio -', '')
              ?.trim()
            metaUrl = href
              .substring(0, href.lastIndexOf('/'))
              .replace('player', 'detail')
            presenceData.largeImageKey = document
              .querySelector('#loading-logo')
              ?.getAttribute('data-image') ?? ActivityAssets.Logo
          }
          else {
            const playerState = await _eval(
              'core.transport.getState(\'player\')',
            )
            if (playerState?.metaItem?.type?.toLowerCase() === 'ready') {
              const {
                metaItem: { content },
                seriesInfo,
                title,
              } = playerState
              metaUrl = `${window.location.origin}/#/detail/${content.type}/${content.id}`
              if (content.type === 'series')
                metaUrl += `/${content.id}:${seriesInfo.season}:${seriesInfo.episode}`
              presenceData.largeImageKey = content.poster ?? ActivityAssets.Logo
              presenceData.name = content.name
              presenceData.details = title.replace(`${content.name} -`, '') ?? 'Player'
            }
          }
          if (metaUrl) {
            presenceData.buttons = [
              {
                label: 'Watch',
                url: metaUrl,
              },
            ]
          }
          break
        }
      }
      break
    }
    case AppVersion.Website:
      presenceData.details = 'Visiting stremio.com'

      switch (pathname) {
        case '/addon-sdk':
          presenceData.state = 'Addon SDK'
          break

        case '/contribute':
          presenceData.state = 'Contribute'
          break

        case '/community':
          presenceData.state = 'Community'
          break

        case '/technology':
          presenceData.state = 'Technology'
          break

        case '/competition':
          presenceData.state = 'Competition'
          break

        case '/careers':
          presenceData.state = 'Careers'
          break

        default: {
          const activeTab = document.querySelector('[class=\'nav-link active\']')
          if (
            activeTab === null
            || activeTab.parentElement?.className === 'langs'
          ) {
            break
          }
          presenceData.state = activeTab.textContent
        }
      }

      break
  }

  if (!buttons)
    delete presenceData.buttons
  if (!thumbnails)
    presenceData.largeImageKey = ActivityAssets.Logo
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
