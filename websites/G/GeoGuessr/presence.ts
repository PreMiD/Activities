const presence = new Presence({
  clientId: '654906151523057664',
})

let currentURL = new URL(document.location.href)
let currentPath = currentURL.pathname
  .replace(/^\/|\/$|\/index\.html$|.html$/g, '')
  .split('/')
const browsingTimestamp = Math.floor(Date.now() / 1000)
let presenceData: PresenceData = {
  details: 'Viewing an unsupported page',
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/GeoGuessr/assets/logo.png',
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
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/GeoGuessr/assets/logo.png',
  startTimestamp: browsingTimestamp,
}): void {
  currentURL = new URL(document.location.href)
  currentPath = currentURL.pathname
    .replace(/^\/|\/$|\/index\.html$|.html$/g, '')
    .split('/')
  presenceData = { ...defaultData }
}

((): void => {
  let loadedPath: string
  let presenceDataPlaced: PresenceData = {}
  let forceUpdate = false

  updateCallback.function = (): void => {
    if (loadedPath !== currentURL.pathname || forceUpdate) {
      loadedPath = currentURL.pathname

      if (currentPath[0] !== 'game')
        forceUpdate = false

      if (currentPath[0] === '') {
        presenceData.details = 'On the home page'
      }
      else if (currentPath[0] === 'game') {
        forceUpdate = true
        presenceData.details = document.querySelector(
          '.game-status[data-qa=map-name] .game-status__body',
        )?.textContent
        if (document.querySelector('.result')) {
          presenceData.state = `${
            Number(
              document
                .querySelector(
                  '.game-status[data-qa=round-number] .game-status__body',
                )
                ?.textContent
                ?.split(' / ')[0],
            ) + 1
          } of 5, ${
            document.querySelector(
              '.game-status[data-qa=score] .game-status__body',
            )?.textContent
          } points`
          if (
            document
              .querySelector(
                '.game-status[data-qa=round-number] .game-status__body',
              )
              ?.textContent
              ?.split(' / ')[0] === '5'
          ) {
            presenceData.state = `Finished, ${
              document.querySelector(
                '.game-status[data-qa=score] .game-status__body',
              )?.textContent
            } points`
          }
        }
        else {
          presenceData.state = `${
            document
              .querySelector(
                '.game-status[data-qa=round-number] .game-status__body',
              )
              ?.textContent
              ?.split(' / ')[0]
          } of 5, ${
            document.querySelector(
              '.game-status[data-qa=score] .game-status__body',
            )?.textContent
          } points`
        }
      }
      else if (currentPath[0] === 'maps' && !currentPath[1]) {
        presenceData.details = 'Looking for a map'
      }
      else {
        switch (currentPath[0]) {
          case 'maps': {
            if (document.querySelector('.map-block__title')) {
              presenceData.details = 'Viewing a map'
              presenceData.state = document.querySelector('.map-block__title')?.textContent
            }
            else {
              presenceData.details = 'Looking for a map'
            }

            break
          }
          case 'user': {
            presenceData.details = 'Viewing a user profile'
            presenceData.state = document.querySelector(
              '.profile-summary__nick',
            )?.textContent

            break
          }
          case 'me': {
            if (!currentPath[2]) {
              presenceData.details = 'Viewing their own profile'
            }
            else {
              presenceData.details = 'Viewing a personal page'
              presenceData.state = {
                'settings': 'Settings',
                'leagues': 'Leagues',
                'activities': 'Activities',
                'current': 'Ongoing games',
                'likes': 'Favorite maps',
                'badges': 'Badges',
                'maps': 'My maps',
                'map-maker': 'Map Maker',
              }[currentURL.pathname.split('/')[2]!]
            }

            break
          }
          case 'signin': {
            presenceData.details = 'Signing in'
            break
          }
          case 'signup': {
            presenceData.details = 'Registering an account'
            break
          }
          default:
            if (document.title === 'GeoGuessr - Let\'s explore the world!') {
              forceUpdate = true
            }
            else {
              forceUpdate = false
              presenceData.details = 'Viewing a page'
              presenceData.state = document.title.replace(' - GeoGuessr', '')
            }
        }
      }

      presenceDataPlaced = presenceData
    }
    else {
      presenceData = presenceDataPlaced
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
