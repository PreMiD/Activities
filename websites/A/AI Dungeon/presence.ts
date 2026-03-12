import { Assets } from 'premid'

const presence = new Presence({
  clientId: '713563682722021436',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let login,
  register,
  target: string,
  bullsEye: string,
  playing,
  action,
  textArray
const path = document.location.pathname
window.addEventListener('click', (event) => {
  target = (event.target as HTMLTextAreaElement).textContent ?? ''
  if (target) {
    if (target.includes('Home')) {
      bullsEye = target
      return bullsEye
    }
    else if (target.includes('Explore')) {
      bullsEye = target
      return bullsEye
    }
    else if (target.includes('My Stuff')) {
      bullsEye = target
      return bullsEye
    }
    else if (target.includes('Premium')) {
      bullsEye = target
      return bullsEye
    }
    else if (target.includes('Contribute')) {
      bullsEye = target
      return bullsEye
    }
    else if (target.includes('Settings')) {
      bullsEye = target
      return bullsEye
    }
    else if (target.includes('About')) {
      bullsEye = target
      return bullsEye
    }
    else if (target.includes('New Updates')) {
      bullsEye = target
      return bullsEye
    }
    else if (
      target.includes('NEW SINGLEPLAYER GAME')
      || target.includes('CONTINUE GAME')
      || target.includes('NEW MULTIPLAYER GAME')
    ) {
      bullsEye = target
      return bullsEye
    }
    else if (target.includes('')) {
      return (bullsEye = 'NEW SINGLEPLAYER GAME')
    }
    else {
      return bullsEye
    }
  }
  else {
    return (bullsEye = 'Home')
  }
})
presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AI%20Dungeon/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  if (window.location.hostname === 'aidungeon.io') {
    presence.info('Online')
    switch (path) {
      case '/':
      case '': {
        presenceData.details = 'Home'
        textArray = document.querySelectorAll(
          '.elementor-headline-dynamic-letter.elementor-headline-animation-in',
        )
        if (textArray) {
          switch (textArray[0]?.textContent) {
            case 's': {
              presenceData.state = 'Create your own Story'
              break
            }
            case 'a': {
              presenceData.state = 'Create your own Adventure'
              break
            }
            case 'f': {
              presenceData.state = 'Create your own Fantasy'
              break
            }
            case 'm': {
              presenceData.state = 'Create your own Mystery'
              break
            }
            case 'r': {
              presenceData.state = 'Create your own Romance'
              break
            }
            case 'd': {
              presenceData.state = 'Create your own Dream'
              break
            }
            case 'w':{
              presenceData.state = 'Create your own World'
              break
            }
          }
        }

        break
      }
      case '/play-ai-dungeon/': {
        presenceData.details = 'Selecting Platform to play on'
        break
      }
      case '/terms-of-service/': {
        presenceData.details = 'Reading Terms of Service'
        break
      }
      case '/privacy-policy/': {
        presenceData.details = 'Reading Privacy Policy'
        break
      }
    }
  }
  if (window.location.hostname === 'play.aidungeon.io') {
    login = document.querySelector(
      '#root > div > div > div > div > div:nth-child(2) > div > div.css-1dbjc4n.r-13awgt0 > div > div > div > div.css-1dbjc4n.r-18u37iz.r-1wtj0ep.r-15d164r.r-156q2ks.r-13qz1uu > div:nth-child(1)',
    )
    register = document.querySelector(
      '#root > div > div > div > div > div:nth-child(2) > div > div.css-1dbjc4n.r-13awgt0 > div > div > div > div.css-1dbjc4n.r-18u37iz.r-1wtj0ep.r-15d164r.r-156q2ks.r-13qz1uu > div:nth-child(2)',
    )
    playing = document.querySelector(
      '#root > div > div > div > div > div:nth-child(2) > div > div.css-1dbjc4n.r-13awgt0 > div > div:nth-child(2) > div.css-1dbjc4n.r-18u37iz.r-13qz1uu > div.css-1dbjc4n.r-13awgt0.r-18u37iz > textarea',
    )
    action = document.querySelector(
      '#root > div > div > div > div > div:nth-child(2) > div > div.css-1dbjc4n.r-13awgt0 > div > div:nth-child(2) > div.css-1dbjc4n.r-18u37iz.r-13qz1uu > div.css-1dbjc4n.r-13awgt0.r-18u37iz > div > div',
    )

    if (login) {
      if (login.getAttribute('aria-label') === 'Login (selected)')
        presenceData.details = 'Logging in'
      else if (register?.getAttribute('aria-label') === 'Register (selected)')
        presenceData.details = 'Registering'
      else presenceData.details = 'Loading ...'
    }
    else {
      presence.info(bullsEye)
      switch (bullsEye) {
        case 'Home':
        case 'home': {
          presenceData.details = 'Viewing Home'
          break
        }
        case 'Explore':
        case 'explore': {
          presenceData.details = 'Exploring Scenarios and Adventures'
          break
        }
        case 'My Stuff':
        case 'my stuff': {
          presenceData.details = 'Browsing my stuff'
          break
        }
        case 'Premium':
        case 'premium': {
          presenceData.details = 'Considering Premium'
          break
        }
        case 'Contribute':
        case 'contribute': {
          presenceData.details = 'Reading the Contribute Message'
          break
        }
        case 'Settings':
        case 'settings': {
          presenceData.details = 'Changing Settings'
          break
        }
        case 'About':
        case 'about': {
          presenceData.details = 'Looking at the about'
          break
        }
        case 'Profile': {
          presenceData.details = 'Viewing Profile'
          break
        }
        case '': {
          presenceData.details = 'Viewing Menu'
          break
        }
        case 'NEW SINGLEPLAYER GAME':
        case 'CONTINUE GAME':
        case 'NEW MULTIPLAYER GAME': {
          if (playing) {
            if (playing.textContent === '' || playing.textContent === null) {
              presenceData.details = 'Playing'
              presenceData.state = 'Reading'
              presenceData.smallImageKey = Assets.Reading
              presenceData.smallImageText = 'Reading Current Message'
            }
            else {
              presenceData.details = 'Playing'
              presenceData.smallImageKey = Assets.Play
              presenceData.smallImageText = 'Playing a Game'
              if (action?.getAttribute('aria-label') === 'Do') {
                presenceData.state = `Doing: ${playing.textContent}`
                delete presenceData.startTimestamp
              }
              else if (action?.getAttribute('aria-label') === 'Say') {
                presenceData.state = `Saying: ${playing.textContent}`
                delete presenceData.startTimestamp
              }
              else if (action?.getAttribute('aria-label') === 'Story') {
                presenceData.state = `Story is: ${playing.textContent}`
                delete presenceData.startTimestamp
              }
            }
          }
          else if (!playing) {
            playing = document.querySelector(
              '#root > div > div > div > div > div:nth-child(4) > div > div.css-1dbjc4n.r-13awgt0 > div > div:nth-child(2) > div.css-1dbjc4n.r-18u37iz.r-13qz1uu > div.css-1dbjc4n.r-13awgt0.r-18u37iz > textarea',
            )
            if (playing) {
              if (playing.textContent === '' || playing.textContent === null) {
                presenceData.details = 'Playing'
                presenceData.state = 'Reading'
                presenceData.smallImageKey = Assets.Reading
                presenceData.smallImageText = 'Reading Current Message'
              }
              else {
                presenceData.details = 'Playing'
                presenceData.smallImageKey = Assets.Play
                presenceData.smallImageText = 'Playing a Game'
                action = document.querySelector(
                  '#root > div > div > div > div > div:nth-child(4) > div > div.css-1dbjc4n.r-13awgt0 > div > div:nth-child(2) > div.css-1dbjc4n.r-18u37iz.r-13qz1uu > div.css-1dbjc4n.r-13awgt0.r-18u37iz > div > div',
                )
                if (action?.getAttribute('aria-label') === 'Do') {
                  presenceData.state = `Doing: ${playing.textContent}`
                  delete presenceData.startTimestamp
                }
                else if (action?.getAttribute('aria-label') === 'Say') {
                  presenceData.state = `Saying: ${playing.textContent}`
                  delete presenceData.startTimestamp
                }
                else if (action?.getAttribute('aria-label') === 'Story') {
                  presenceData.state = `Story is: ${playing.textContent}`
                  delete presenceData.startTimestamp
                }
              }
            }
            else {
              presenceData.details = 'Viewing Home'
            }
          }

          break
        }
        default:
          presenceData.details = 'Viewing Home'
      }
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
