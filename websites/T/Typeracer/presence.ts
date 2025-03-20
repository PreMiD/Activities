const presence = new Presence({
  clientId: '655247212728811530',
})

let currentURL = new URL(document.location.href)
let currentPath = currentURL.pathname.replace(/^\/|\/$/g, '').split('/')
const browsingTimestamp = Math.floor(Date.now() / 1000)
let presenceData: PresenceData = {
  details: 'Viewing an unsupported page',
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Typeracer/assets/logo.png',
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
function resetData(defaultData: PresenceData = {
  details: 'Viewing an unsupported page',
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Typeracer/assets/logo.png',
  startTimestamp: browsingTimestamp,
}): void {
  currentURL = new URL(document.location.href)
  currentPath = currentURL.pathname.replace(/^\/|\/$/g, '').split('/')
  presenceData = { ...defaultData }
}

((): void => {
  let raceStamp: number | null = null

  if (currentURL.hostname === 'play.typeracer.com') {
    updateCallback.function = (): void => {
      if (document.querySelector('.gameView')) {
        presenceData.details = 'Playing a race'
        const gameStatusLabel = document.querySelector('.gameStatusLabel')?.textContent

        switch (gameStatusLabel) {
          case 'Waiting for more people...': {
            presenceData.state = 'Waiting for more people...'
            if (raceStamp === null)
              raceStamp = Math.floor(Date.now() / 1000)
            presenceData.startTimestamp = raceStamp

            break
          }
          case 'The race is about to start!': {
            presenceData.state = 'Counting down...'
            presenceData.endTimestamp = Math.floor(Date.now() / 1000)
              + Number(
                document
                  .querySelector('.countdownPopup .time')
                  ?.textContent
                  ?.slice(1) ?? 0,
              )
            raceStamp = null

            break
          }
          case 'The race is on! Type the text below:':
          case 'Go!': {
            const textBox = document.querySelector(
              'table.gameView > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(1) > td > div > div',
            )
            let lettersTyped = 0
            for (const i in textBox?.children ?? []) {
              if (
                typeof textBox?.children[i] !== 'number'
                && typeof textBox?.children[i] !== 'function'
                && getComputedStyle(textBox!.children[i]!).color
                === 'rgb(153, 204, 0)'
              ) {
                lettersTyped += textBox!.children[i]!.textContent!.length
              }
            }
            presenceData.state = `${
              Math.round((lettersTyped / (textBox?.textContent?.length ?? 0)) * 10000)
              / 100
            }%, ${document
              .querySelector('.rankPanelWpm-self')
              ?.textContent
              ?.toUpperCase() ?? ''}`
            if (raceStamp === null)
              raceStamp = Math.floor(Date.now() / 1000)
            presenceData.startTimestamp = raceStamp

            break
          }
          default:
            if (
              gameStatusLabel === 'The race has ended.'
              || gameStatusLabel?.startsWith('You finished')
            ) {
              presenceData.details = 'Just finished with a race'
              presenceData.state = `${document
                .querySelector('.rankPanelWpm-self')
                ?.textContent
                ?.toUpperCase()}, ${
                document.querySelector(
                  '.tblOwnStats > tbody:nth-child(2) > tr:nth-child(3) > td:nth-child(2)',
                )?.textContent
              } acc., ${
                document.querySelector(
                  '.tblOwnStats > tbody:nth-child(2) > tr:nth-child(2) > td:nth-child(2)',
                )?.textContent
              }`
              presenceData.startTimestamp = browsingTimestamp
            }
        }
      }
      else {
        presenceData.details = 'Viewing the home page'
      }
    }
  }
  else if (currentURL.hostname === 'data.typeracer.com') {
    /*

    Part 2
    data.typeracer.com (pit stop and misc. pages)

    */

    switch (currentPath[0]) {
      case 'pit': {
        switch (currentPath[1]) {
          case 'profile': {
            presenceData.details = 'Viewing a racer profile'
            presenceData.state = document.querySelector('#profileUsername')?.textContent || null

            break
          }
          case 'text_info': {
            presenceData.details = 'Viewing a text'
            presenceData.state = currentURL.searchParams.get('id')

            break
          }
          case 'result': {
            presenceData.details = 'Viewing a race result'
            presenceData.state = `Race ${
              currentURL.searchParams.get('id')?.split('|')[2]
            } of ${currentURL.searchParams.get('id')?.split('|')[1]?.slice(3)}`

            break
          }
          case 'race_history': {
            presenceData.details = 'Viewing someone\'s race history'
            presenceData.state = currentURL.searchParams.get('user') || null

            break
          }
          case 'home': {
            presenceData.details = 'Viewing the pit stop'
            break
          }
          case 'competitions': {
            presenceData.details = 'Viewing the competition result'
            const strong = document
              .querySelector('div.themeContent > div:nth-child(5) > strong')
              ?.textContent
              ?.trim()
              .slice(0, -1)
              .split(' ')
            switch (
              document.querySelector('option[selected]')?.textContent?.trim()
            ) {
              case 'day': {
                presenceData.state = strong?.join(' ')
                break
              }
              case 'week': {
                presenceData.state = `${strong?.[1]} ${strong?.[2]}, ${strong?.[4]}`
                break
              }
              case 'month': {
                presenceData.state = `${strong?.[3]} ${strong?.[4]}`
                break
              }
              case 'year': {
                [, presenceData.state] = strong ?? []
                break
              }
            }

            break
          }
          case 'login': {
            presenceData.details = 'Logging in'
            break
          }
          default: {
            const pageNames: { [index: string]: string } = {
              upgrade_account: 'Upgrade your account',
              tos: 'Terms of Service',
              privacy_poicy: 'Privacy Policy',
            }
            presenceData.details = 'Viewing a page'
            presenceData.state = pageNames[currentPath[1]!]
          }
        }
        break
      }
      case 'misc': {
        if (currentPath[1] === 'about') {
          presenceData.details = 'Viewing a page'
          presenceData.state = 'About'
        }

        break
      }
      case 'admin': {
        presenceData.details = 'Viewing school admin pages'
        break
      }
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
