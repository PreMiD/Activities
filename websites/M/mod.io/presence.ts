const presence = new Presence({
  clientId: '1023277091392868372',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/mod.io/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, hostname, search } = window.location
  const pathSplit = pathname.split('/').filter(x => x)

  switch (hostname) {
    case 'mod.io': {
      switch (pathSplit[0] ?? '') {
        case '': {
          presenceData.details = 'Browsing homepage'
          break
        }
        case 'g': {
          if (pathSplit[1] === 'add') {
            presenceData.details = 'Adding a game'
            presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
          }
          else if ((pathSplit[1] ?? '') === '') {
            presenceData.details = 'Browsing games'
            break
          }
          else {
            const gameImageURL = getComputedStyle(
              document.querySelector<HTMLDivElement>('#container [role=img]')!,
            ).backgroundImage.match(/url\("(.+)"\)/)?.[1]
            const gameName = document.querySelector<HTMLAnchorElement>(
              '#container li > a[href*=\'/g/\']',
            )?.textContent
            switch (pathSplit[2] ?? '') {
              case '': {
                presenceData.details = `Browsing mods for ${gameName}`
                presenceData.largeImageKey = gameImageURL
                presenceData.buttons = [
                  {
                    label: 'View game mods',
                    url: href,
                  },
                ]
                break
              }
              case 'm': {
                if (pathSplit[4] === 'admin') {
                  presenceData.details = 'Managing a mod'
                  presenceData.state = document.querySelector<HTMLHeadingElement>(
                    'h1',
                  )?.textContent
                }
                else {
                  presenceData.details = `Viewing a mod for ${gameName}`
                  presenceData.state = document.querySelector<HTMLHeadingElement>(
                    'h1',
                  )?.textContent
                  presenceData.smallImageKey = gameImageURL
                  presenceData.smallImageText = gameName
                  presenceData.largeImageKey = getComputedStyle(
                    document.querySelector<HTMLDivElement>(
                      'a[href*=\'/m/\'] > div[role=img]',
                    )!,
                  ).backgroundImage.match(/url\("(.+)"\)/)?.[1]
                  presenceData.buttons = [
                    {
                      label: 'View mod',
                      url: href,
                    },
                  ]
                }
                break
              }
              case 'r': {
                if (pathSplit[3]) {
                  presenceData.details = `Reading a guide for ${gameName}`
                  presenceData.state = document.querySelector<HTMLHeadingElement>(
                    'h1',
                  )?.textContent
                  presenceData.smallImageKey = gameImageURL
                  presenceData.smallImageText = gameName
                  presenceData.largeImageKey = getComputedStyle(
                    document.querySelector<HTMLDivElement>(
                      'a[href*=\'/r/\'] > div[role=img]',
                    )!,
                  ).backgroundImage.match(/url\("(.+)"\)/)?.[1]
                  presenceData.buttons = [
                    {
                      label: 'View guide',
                      url: href,
                    },
                  ]
                }
                else {
                  presenceData.details = `Browsing guides for ${gameName}`
                  presenceData.largeImageKey = gameImageURL
                }
                break
              }
              case 'u': {
                presenceData.details = 'Viewing a user\'s profile'
                presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
                presenceData.smallImageKey = document.querySelector<HTMLImageElement>(
                  '#container img[src*=\'/members/\']',
                )?.src
                break
              }
            }
          }
          break
        }
        case 'me': {
          switch (pathSplit[1]) {
            case 'account': {
              presenceData.details = 'Managing account settings'
              break
            }
            case 'library': {
              presenceData.details = 'Browsing their library'
              break
            }
            case 'comments': {
              presenceData.details = 'Browsing their comments'
              break
            }
            case 'followers': {
              presenceData.details = 'Browsing their followers'
              break
            }
            case 'access': {
              presenceData.details = 'Managing their API keys'
              break
            }
            case 'privacy': {
              presenceData.details = 'Managing their privacy settings'
              break
            }
          }
          break
        }
        case 'u': {
          presenceData.details = 'Viewing a user\'s profile'
          presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
          presenceData.smallImageKey = document.querySelector<HTMLImageElement>(
            '#container img[src*=\'/members/\']',
          )?.src
          break
        }
        default: {
          presenceData.details = 'Browsing'
          presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
            ?? document.title.match(/(.*) - mod\.io/)?.[1]
        }
      }
      break
    }
    case 'blog.mod.io': {
      switch (pathSplit[0] ?? '') {
        case '': {
          presenceData.details = 'Browsing the blog'
          presenceData.state = 'Home page'
          break
        }
        case 'search': {
          presenceData.details = 'Searching the blog'
          presenceData.state = new URLSearchParams(search).get('q')
          break
        }
        case 'tagged': {
          presenceData.details = 'Browsing articles by tag'
          presenceData.state = pathSplit[1]
          break
        }
        default: {
          presenceData.details = 'Reading an article'
          presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
          presenceData.buttons = [
            {
              label: 'Read article',
              url: href,
            },
          ]
        }
      }
      break
    }
    case 'docs.mod.io': {
      presenceData.details = 'Browsing documentation'
      presenceData.state = document.querySelector<HTMLAnchorElement>(
        '.active.toc-link',
      )?.textContent
      break
    }
    case 'old.mod.io': {
      switch (pathSplit[0] ?? '') {
        case '': {
          presenceData.details = 'Browsing'
          presenceData.state = 'Home page'
          break
        }
        case 'games': {
          if (pathSplit[1] === 'add') {
            presenceData.details = 'Adding a game'
            presenceData.state = document.querySelector<HTMLInputElement>('#gamesname')?.value
          }
          else {
            presenceData.details = 'Browsing games'
          }
          break
        }
        case 'guides': {
          presenceData.details = 'Browsing guides'
          break
        }
        case 'members': {
          presenceData.details = 'Viewing a user\'s profile'
          presenceData.state = document.querySelector<HTMLHeadingElement>('h2.title')?.textContent
          const profileImage = document.querySelector<HTMLImageElement>(
            '.container img[src*=\'/members/\']',
          )
          if (profileImage)
            presenceData.smallImageKey = profileImage.src
          break
        }
        case 'messages': {
          presenceData.details = 'Viewing their direct messages'
          break
        }
        default: {
          presenceData.details = 'Browsing'
          presenceData.state = document.title.match(/(.*) - mod\.io/)?.[1]
        }
      }
      break
    }
    // Old subdomains
    default: {
      const gameName = document.querySelector<HTMLAnchorElement>(
        '.navbar-start .navbar-item[href*=\'.old.mod.io\']',
      )?.textContent
      const gameImage = document.querySelector<HTMLImageElement>('[src*=\'/games/\']')?.src
      switch (pathSplit[0] ?? '') {
        case '':
        case 'page': {
          presenceData.details = `Browsing mods for ${gameName}`
          presenceData.largeImageKey = gameImage
          break
        }
        case 'guides': {
          presenceData.largeImageKey = gameImage
          switch (pathSplit[1] ?? '') {
            case '': {
              presenceData.details = `Browsing guides for ${gameName}`
              break
            }
            case 'add': {
              presenceData.details = `Creating a guide for ${gameName}`
              presenceData.state = document.querySelector<HTMLInputElement>('#articlesname')?.value
              break
            }
            default: {
              presenceData.details = `Viewing a guide for ${gameName}`
              presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
              presenceData.buttons = [
                {
                  label: 'Read guide',
                  url: href,
                },
              ]
              break
            }
          }
          break
        }
        default: {
          presenceData.state = document.querySelector<HTMLAnchorElement>(
            '.navbar-start > .navbar-item:nth-of-type(4)',
          )?.textContent
          presenceData.largeImageKey = gameImage
          switch (pathSplit[1] ?? '') {
            case '': {
              presenceData.details = `Viewing a mod for ${gameName}`
              presenceData.smallImageKey = gameImage
              presenceData.smallImageText = gameName
              presenceData.largeImageKey = document.querySelector<HTMLImageElement>('[src*=\'/mods/\']')?.src
              presenceData.buttons = [
                {
                  label: 'View mod',
                  url: href,
                },
              ]
              break
            }
            case 'edit': {
              presenceData.details = `Editing a mod for ${gameName}`
              presenceData.state = document.querySelector<HTMLInputElement>('#modsname')?.value
              break
            }
            case 'history': {
              presenceData.details = `Viewing the history of a mod for ${gameName}`
              break
            }
            case 'contact': {
              presenceData.details = 'Contacting a mod developer'
              break
            }
            case 'stats': {
              presenceData.details = `Viewing the stats of a mod for ${gameName}`
              break
            }
          }
        }
      }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
