const presence = new Presence({
  clientId: '819122551435296818',
})
const botBrowsing = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/Discord%20BotList/assets/logo.jpg',
    startTimestamp: botBrowsing,
  }
  const botPage = document.location.pathname
  const botHost = document.location.hostname
  const buttons = await presence.getSetting<boolean>('buttons')
  const sSubmit = await presence.getSetting<boolean>('submitP')

  if (botHost === 'discord-botlist.eu') {
    switch (botPage) {
      case '/': {
        presenceData.details = 'Browsing'
        break
      }
      case '/search': {
        presenceData.details = 'Searching Bot:'
        presenceData.state = document
          .querySelector('[name=\'search\']')
          ?.getAttribute('value')
        presenceData.buttons = [
          {
            label: 'View Search',
            url: document.URL,
          },
        ]

        break
      }
      case '/bots/tag': {
        presenceData.details = 'Searching Tag:'
        presenceData.state = new URLSearchParams(window.location.search).get(
          'tag',
        )
        presenceData.buttons = [
          {
            label: 'View Tag',
            url: document.URL,
          },
        ]

        break
      }
      case '/login_err/': {
        presenceData.details = 'Login In Page'
        break
      }
      default:
        if (botPage.includes('/users/')) {
          presenceData.details = 'Viewing Profile:'
          presenceData.state = document.querySelector('#Username')?.textContent
          presenceData.buttons = [
            {
              label: 'View Profile',
              url: document.URL,
            },
          ]
        }
        else if (botPage.includes('/bots/')) {
          if (botPage.includes('/new')) {
            presenceData.details = 'Adding a Bot'
          }
          else if (botPage.includes('/vote')) {
            const voteBotName = document
              .querySelector('#vote1 > h1')
              ?.textContent
              ?.replace('Vote for ', '')
            presenceData.details = 'Voting for:'
            presenceData.state = voteBotName
            presenceData.buttons = [
              {
                label: `Vote for ${voteBotName}`,
                url: document.URL,
              },
            ]
          }
          else if (botPage.includes('/edit')) {
            presenceData.details = 'Editing a Bot'
          }
          else if (botPage.includes('/all')) {
            presenceData.details = 'Viewing all Bots'
            presenceData.buttons = [
              {
                label: 'View Bots',
                url: document.URL,
              },
            ]
          }
          else {
            presenceData.details = 'Viewing Bot:'
            presenceData.state = document.querySelector('#botname')?.textContent
            presenceData.buttons = [
              {
                label: 'View Bot',
                url: document.URL,
              },
            ]
          }
        }
        else {
          switch (botPage) {
            case '/apply/certification/': {
              presenceData.details = 'Viewing Certification Page'
              break
            }
            case '/apply/certification/application': {
              presenceData.details = 'Applying for Certification'
              break
            }
            case '/tos/': {
              presenceData.details = 'Viewing ToS'
              break
            }
            case '/privacypolicy/': {
              presenceData.details = 'Viewing Privacy Policy'
              break
            }
            case '/Imprint/': {
              presenceData.details = 'Viewing Imprint'
              break
            }
          }
        }
    }
  }
  else if (botHost === 'docs.discord-botlist.eu') {
    presenceData.details = 'Viewing Docs'
    presenceData.state = `Page: ${
      document.querySelector(
        '#__GITBOOK__ROOT__CLIENT__ > div.reset-3c756112--body-68cac36c > div.reset-3c756112--bodyContent-2f98451b > div > div.reset-3c756112--wholeContentBody-554be184 > div.reset-3c756112--wholeContentPage-6c3f1fc5 > div > div.reset-3c756112--pageContainer-544d6e9c > div.reset-3c756112 > div.reset-3c756112--pageHeader-15724735 > div > div > div.reset-3c756112--horizontalFlex-5a0077e0 > div.reset-3c756112--pageHeaderIntro-0c1463da > h1 > span',
      )?.textContent
    }`
  }

  if (!sSubmit && presenceData.details === 'Adding a Bot')
    delete presenceData.details

  if (!buttons)
    delete presenceData.buttons

  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})
