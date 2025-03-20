import { Assets } from 'premid'

const presence = new Presence({
  clientId: '809083630117978123',
})
const browsingTimestamp = Math.round(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/Hytale/assets/logo.jpg',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.pathname === '/') {
    presenceData.details = 'Viewing the main page'
  }
  else if (document.location.pathname === '/news') {
    presenceData.details = 'Browsing Blog Posts'
  }
  else if (document.location.pathname.includes('/news/archive/')) {
    presenceData.details = 'Browsing Blog Archives'
    presenceData.state = `From ${
      document.querySelector('.subHeading')?.textContent
    }`
  }
  else if (document.location.pathname.includes('/news/')) {
    presenceData.details = 'Reading Blog Post'
    presenceData.state = document.querySelector('.post__heading')?.textContent
    presenceData.smallImageKey = Assets.Reading
  }
  else {
    switch (document.location.pathname) {
      case '/media': {
        presenceData.details = 'Browsing Hytale media'
        if (document.location.hash.includes('#screenshots'))
          presenceData.state = 'Screenshot'
        else if (document.location.hash.includes('#desktopWallpapers'))
          presenceData.state = 'Desktop Wallpaper'
        else if (document.location.hash.includes('#mobileWallpapers'))
          presenceData.state = 'Mobile Wallpaper'
        else if (document.location.hash.includes('#conceptArt'))
          presenceData.state = 'Concept Art'
        else if (document.location.hash.includes('#videos'))
          presenceData.state = 'Video'
        else if (document.location.hash.includes('#clips'))
          presenceData.state = 'Clip'

        break
      }
      case '/game': {
        presenceData.details = 'Learning more about'
        presenceData.state = 'the game'

        break
      }
      case '/community': {
        presenceData.details = 'Viewing the'
        presenceData.state = 'Community page'

        break
      }
      case '/jobs': {
        presenceData.details = 'Viewing Job Openings'
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
          presenceData.state = document.querySelector('.pageHeading')?.textContent
        }
        else {
          switch (document.location.pathname) {
            case '/signup': {
              presenceData.details = 'Signing up for the beta'
              presenceData.smallImageKey = Assets.Writing

              break
            }
            case '/about': {
              presenceData.details = 'Learning more about'
              presenceData.state = 'Hypixel Studios'
              if (document.location.hash === '#contact') {
                presenceData.details = 'Viewing the'
                presenceData.state = 'Contact information'
              }
              else if (document.location.hash === '#press') {
                presenceData.details = 'Viewing the'
                presenceData.state = 'Press information'
              }

              break
            }
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
              presenceData.smallImageKey = Assets.Reading

              break
            }
            case '/corporate-governance': {
              presenceData.details = 'Reading about'
              presenceData.state = 'Corporate Governance'
              presenceData.smallImageKey = Assets.Reading

              break
            }
            case '/supersecretpage': {
              presenceData.details = 'Viewing a'
              presenceData.state = 'Super Secret Page'

              break
            }
            default: {
              presenceData.details = 'Viewing an'
              presenceData.state = 'Unknown page'
            }
          }
        }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
