const presence = new Presence({
  clientId: '1047217921685991462',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/Modrinth/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, hostname, href } = document.location
  const pathSplit = pathname.split('/').filter(x => x)
  const active = document.querySelector('[class*="is-active"]')

  switch (hostname) {
    case 'modrinth.com': {
      switch (pathSplit[0]) {
        case 'user': {
          presenceData.details = `Browsing ${pathSplit[1]}'s profile`
          presenceData.buttons = [
            {
              label: 'View Profile',
              url: href,
            },
          ]
          break
        }
        case 'settings': {
          presenceData.details = 'Browsing profile settings'
          break
        }
        case 'mods': {
          presenceData.details = 'Looking for mods'
          break
        }
        case 'mod': {
          presenceData.state = `${
            document.querySelector<HTMLHeadingElement>('h1.title')?.textContent
          }`
          presenceData.buttons = [
            {
              label: 'View Mod',
              url: href,
            },
          ]
          if (active?.textContent) {
            presenceData.details = `Browsing ${
              pathSplit[0]
            } ${active?.textContent.toLowerCase()}`
            return
          }
          break
        }
        case 'plugins': {
          presenceData.details = 'Looking for plugins'
          break
        }
        case 'plugin': {
          presenceData.state = `${
            document.querySelector<HTMLHeadingElement>('h1.title')?.textContent
          }`
          presenceData.buttons = [
            {
              label: 'View Plugin',
              url: href,
            },
          ]
          if (active?.textContent) {
            presenceData.details = `Browsing ${
              pathSplit[0]
            } ${active?.textContent.toLowerCase()}`
            return
          }
          break
        }
        case 'resourcepacks': {
          presenceData.details = 'Looking for resourcepack'
          break
        }
        case 'resourcepack': {
          presenceData.state = `${
            document.querySelector<HTMLHeadingElement>('h1.title')?.textContent
          }`
          presenceData.buttons = [
            {
              label: 'View Resourcepack',
              url: href,
            },
          ]
          if (active?.textContent) {
            presenceData.details = `Browsing ${
              pathSplit[0]
            } ${active?.textContent.toLowerCase()}`
            return
          }
          break
        }
        case 'modpacks': {
          presenceData.details = 'Looking for a modpack'
          break
        }
        case 'modpack': {
          presenceData.state = `${
            document.querySelector<HTMLHeadingElement>('h1.title')?.textContent
          }`
          presenceData.buttons = [
            {
              label: 'View Modpack',
              url: href,
            },
          ]
          if (active?.textContent) {
            presenceData.details = `Browsing ${
              pathSplit[0]
            } ${active?.textContent.toLowerCase()}`
            return
          }
          break
        }
        case 'notifications': {
          presenceData.details = 'Checking notifications'
          break
        }
        case 'dashboard': {
          presenceData.details = 'View Dashboard'
          break
        }
        case 'legal': {
          switch (pathSplit[1]) {
            case 'terms': {
              presenceData.details = 'Reading Terms and Conditions'
              break
            }
            case 'privacy': {
              presenceData.details = 'Reading Privacy Policy'
              break
            }
            case 'rules': {
              presenceData.details = 'Reading Content Rules'
              break
            }
            case 'security': {
              presenceData.details = 'Security Notice'
              break
            }
          }
          break
        }
        default: {
          presenceData.details = 'Browsing home page'
        }
      }
      break
    }
    case 'docs.modrinth.com': {
      switch (pathSplit[0]) {
        case 'docs': {
          switch (pathSplit[1]) {
            case 'tutorials': {
              presenceData.details = 'Browsing docs tutorials'
              break
            }
            case 'details': {
              presenceData.details = 'Reading about the API'
              break
            }
            case 'modpacks': {
              presenceData.details = 'Reading about modpacks'
              break
            }
            default: {
              presenceData.details = 'Browsing API information'
              break
            }
          }
          break
        }
        case 'api-spec': {
          presenceData.details = 'Browsing API documentation'
          break
        }
        default: {
          presenceData.details = 'Browsing docs'
        }
      }
      break
    }
    case 'blog.modrinth.com': {
      if (document.querySelector<HTMLHeadingElement>('h1.post-title__text')) {
        presenceData.buttons = [
          {
            label: 'View Blog Post',
            url: href,
          },
        ]
        presenceData.details = 'Reading blog post'
        presenceData.state = document.querySelector<HTMLHeadingElement>(
          'h1.post-title__text',
        )?.textContent
      }
      else {
        presenceData.details = 'Browsing blog'
      }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
