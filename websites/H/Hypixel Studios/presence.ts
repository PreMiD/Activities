import { Assets } from 'premid'

const presence = new Presence({
  clientId: '812069625067077662',
})
const browsingTimestamp = Math.round(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/Hypixel%20Studios/assets/logo.jpg',
    startTimestamp: browsingTimestamp,
  }

  switch (document.location.pathname) {
    case '/': {
      presenceData.details = 'Viewing the main page'
      break
    }
    case '/who-we-are': {
      presenceData.details = 'Learning more about'
      presenceData.state = 'Who they are'
      presenceData.smallImageKey = Assets.Reading

      break
    }
    case '/hytale': {
      presenceData.details = 'Learning more about'
      presenceData.state = 'Hytale'
      presenceData.smallImageKey = Assets.Reading

      break
    }
    case '/our-team': {
      presenceData.details = 'Getting to know'
      presenceData.smallImageKey = Assets.Reading
      if (document.querySelector('.selected-member__container')) {
        presenceData.state = document.querySelector(
          '.hy-heading-4.selected-member__name',
        )?.textContent
      }
      else {
        presenceData.state = 'the team'
      }

      break
    }
    case '/jobs/': {
      presenceData.details = 'Viewing Job Openings'
      presenceData.smallImageKey = Assets.Reading
      switch (document.location.hash) {
        case '#our-process': {
          presenceData.state = 'Our process'
          break
        }
        case '#current-openings': {
          presenceData.state = 'Current job openings'
          break
        }
        case '#from-the-team': {
          presenceData.state = 'Messages from the team'
          break
        }
      }

      break
    }
    case '/jobs/data-protection-statement': {
      presenceData.details = 'Reading the'
      presenceData.state = 'Data protection statement'
      presenceData.smallImageKey = Assets.Reading

      break
    }
    default:
      if (document.location.pathname.includes('/jobs/')) {
        presenceData.details = 'Viewing Job'
        presenceData.state = document
          .querySelector('.hy-title.job__title.hy-pad-t-2.hy-mar-t-6')
          ?.textContent
          ?.trim()
        presenceData.smallImageKey = Assets.Reading
      }
      else if (document.location.pathname === '/contact') {
        presenceData.details = 'Viewing the'
        presenceData.state = 'Contact information'
      }
      else if (document.location.pathname === '/press') {
        presenceData.details = 'Viewing the'
        presenceData.state = 'Press information'
      }
      else if (document.location.pathname.includes('/docs/')) {
        const docName = document.location.pathname
          .split('/')
          .pop()!
          .replace('.pdf', '')
          .replace('press-release-', '')
          .split('-')
        for (let i = 0; i < docName.length; i++)
          docName[i] = docName[i]!.charAt(0).toUpperCase() + docName[i]!.slice(1)
        presenceData.details = 'Reading the document'
        presenceData.state = docName.join(' ')
        presenceData.smallImageKey = Assets.Reading
      }
      else {
        switch (document.location.pathname) {
          case '/cookie-policy': {
            presenceData.details = 'Reading the Cookie Policy'
            presenceData.smallImageKey = Assets.Reading
            switch (document.location.hash) {
              case '#what-is-cookie': {
                presenceData.state = 'What is a Cookie?'
                break
              }
              case '#why-are-cookies-used': {
                presenceData.state = 'Why are Cookies used?'
                break
              }
              case '#who-places-cookies': {
                presenceData.state = 'Who places Cookies'
                break
              }
              case '#how-manage-cookies': {
                presenceData.state = 'How can I manage cookies?'
                break
              }
              case '#do-not-track-signals': {
                presenceData.state = 'Do-not-track signals'
                break
              }
              case '#policy-updates': {
                presenceData.state = 'Policy updates'
                break
              }
              case '#contact-us': {
                presenceData.state = 'Contact us'
                break
              }
            }

            break
          }
          case '/privacy': {
            presenceData.details = 'Viewing the'
            presenceData.state = 'Privacy Policy'
            presenceData.smallImageKey = Assets.Reading

            break
          }
          case '/legal': {
            presenceData.details = 'Viewing the'
            presenceData.state = 'Legal Information'

            break
          }
          case '/corporate-governance': {
            presenceData.details = 'Reading about'
            presenceData.state = 'Corporate Governance'
            presenceData.smallImageKey = Assets.Reading

            break
          }
          default: {
            presenceData.details = 'Viewing an'
            presenceData.state = 'Unknown page'
          }
        }
      }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
