const presence = new Presence({
  clientId: '845360129715994685',
})
const timeElapsed: number = ~~(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AtCoder/assets/logo.png',
    startTimestamp: timeElapsed,
  }

  if (!location.pathname.split('/')[1]) {
    presenceData.details = 'Viewing Home Page'
  }
  else {
    switch (location.pathname.split('/')[1]) {
      case 'home': {
        presenceData.details = 'Viewing Home Page'
        break
      }

      case 'register': {
        presenceData.details = 'Creating an account'
        break
      }

      case 'login': {
        presenceData.details = 'Logging in'
        break
      }

      case 'contests': {
        presenceData.details = 'Viewing Contest'
        presenceData.state = `${document.title.split('-')[0]}`

        switch (location.pathname.split('/')[3]) {
          case 'tasks': {
            presenceData.details = 'Viewing Contest Tasks'
            presenceData.state = `${document.title.split('-')[1]}`

            if (location.pathname.split('/').length === 5) {
              presenceData.details = document.querySelector('.contest-title')?.textContent
              presenceData.state = document.title
            }
            break
          }

          case 'clarifications': {
            presenceData.details = 'Viewing Clarifications'
            presenceData.state = `Contest: ${location.pathname
              .split('/')[2]
              ?.toUpperCase()}`
            break
          }

          case 'submit': {
            presenceData.details = `Submitting Solution: ${location.pathname
              .split('/')[2]
              ?.toUpperCase()}`
            presenceData.state = `${
              document.querySelectorAll('.select2-selection__rendered').item(0).textContent
            } [${
              document.querySelectorAll('.select2-selection__rendered').item(1).textContent
            }]`
            break
          }

          case 'submissions': {
            if (location.pathname.split('/')[4] === 'me')
              presenceData.details = 'Viewing my Submissions'
            else presenceData.details = 'Viewing All Submissions'

            presenceData.state = document.querySelector('.contest-title')?.textContent
            break
          }

          case 'score': {
            presenceData.details = 'Viewing my Score'
            presenceData.state = document.querySelector('.contest-title')?.textContent
            break
          }

          case 'standings': {
            if (location.pathname.split('/')[4] === 'virtual')
              presenceData.details = 'Viewing Virtual Standings'
            else presenceData.details = 'Viewing Standings'

            presenceData.state = `Contest: ${location.pathname
              .split('/')[2]
              ?.toUpperCase()}`
            break
          }

          case 'results': {
            presenceData.details = 'Viewing Result'
            presenceData.state = `Contest: ${location.pathname
              .split('/')[2]
              ?.toUpperCase()}`
            break
          }

          case 'editorial': {
            presenceData.details = 'Viewing Editorial'
            presenceData.state = `Contest: ${location.pathname
              .split('/')[2]
              ?.toUpperCase()}`

            if (location.pathname.split('/').length === 5) {
              presenceData.details = 'Reading Editorial'
              presenceData.state = `${location.pathname
                .split('/')[2]
                ?.toUpperCase()}: ${
                document
                  ?.querySelector('#main-container')
                  ?.querySelector('h2')
                  ?.querySelector('a')
                  ?.textContent
              }`
            }
            break
          }

          case 'custom_test': {
            presenceData.details = 'Performing Custom Test'
            presenceData.state = `Contest: ${location.pathname
              .split('/')[2]
              ?.toUpperCase()}`
            break
          }
        }
        break
      }

      case 'ranking': {
        presenceData.details = 'Viewing Ranks'
        presenceData.state = `Page no. ${location.search.split('=')[1] || 1}`
        break
      }

      case 'users': {
        const username = document.querySelector('.username')?.textContent
        presenceData.details = 'Viewing Profile'
        if (location.pathname.split('/')[3] === 'history')
          presenceData.state = `${username}'s Competition History`
        else presenceData.state = username
        break
      }

      case 'settings': {
        presenceData.details = 'Editing their Settings'
        break
      }

      case 'posts': {
        if (!location.pathname.split('/')[2]) {
          presenceData.details = 'Browsing Post Archive...'
        }
        else {
          presenceData.details = 'Reading Post'
          presenceData.state = document.querySelector('.panel-title')?.childNodes[0]?.textContent
          break
        }
      }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
