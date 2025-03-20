const presence = new Presence({
  clientId: '1088185685682430002',
})
const logoURL = 'https://cdn.rcd.gg/PreMiD/websites/P/PaperMC/assets/logo.png'
const browsingTimestamp = Math.floor(Date.now() / 1000)
// https://stackoverflow.com/a/7224605
// to always return type string event when s may be falsy other than empty-string
const capitalize = (s: string) => (s && s[0]!.toUpperCase() + s.slice(1)) || ''

// Many thanks to the Modrinth Presence for the inspiration and the code for the Hangar Presence.

// Only relevant for Hangar - Because Hangar is a different beast than the rest of PaperMC's websites.
enum PageType {
  Project = 'project',
  User = 'user',
  Unknown = 'unknown',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: logoURL,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, hostname, href } = document.location
  const { title } = document
  const pathSplit = pathname.split('/').filter(x => x)
  let attributes
  if (hostname.includes('hangar')) {
    attributes = [...document.querySelector('main')?.attributes ?? []].map(
      x => x.value,
    )
  }

  switch (hostname) {
    case 'hangar.papermc.io':
    case 'hangar.papermc.dev': {
      let pageType: PageType | undefined
      if (
        pathSplit[0]
        && pathSplit[1]
        && attributes?.toString().includes(PageType.Project)
      ) {
        presenceData.details = `Viewing ${pathSplit[0]}'s plugin ${pathSplit[1]}`
        pageType = PageType.Project
      }
      else if (attributes?.toString().includes(PageType.User)) {
        presenceData.details = `Viewing ${pathSplit[0]}'s profile`
        pageType = PageType.User
      }
      else {
        presenceData.details = 'Browsing Hangar'
      }
      const variable = title.replace('| Hangar', '')
      if (pageType === PageType.Project) {
        presenceData.state = !pathSplit[2]
          ? 'Viewing Project Overview'
          : `Viewing Project ${variable.split('|')[0]?.trim()}`
        // Project Image URL has no special class, so we're using the alt attribute of the image.
        // I doubt this will change anytime soon.
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
          `[alt=${pathSplit[0]}]`,
        )?.src
        presenceData.smallImageKey = logoURL
      }
      else if (pageType === PageType.User) {
        const memberSince = new Date(
          [...document.querySelectorAll('span')]
            .find(span => span.textContent?.includes('Member'))
            ?.textContent
            ?.replace(/Member since /i, '')
            .trim() ?? '',
        )
        // I expect HangarMC's devs to eventually fix the capitalization on this span
        const projectCount = Number(
          [...document.querySelectorAll('span')]
            .find(x => x.textContent?.toLowerCase().includes('projects'))
            ?.textContent
            ?.replace(/\D/g, '')
            .trim(),
        )
        const downloads = [...document.querySelectorAll('span')]
          .filter(span => span.textContent?.includes('Downloads'))
          .map(x => x.textContent?.replace(/\D/g, '').trim())
          .map(x => Number(x))
          .reduce((partialSum, a) => partialSum + a, 0)
        presenceData.state = `${memberSince.toLocaleDateString()} | ${downloads} plugin downloads | ${projectCount} projects`
      }
      else {
        presenceData.state = variable
      }
      pageType = pageType || PageType.Unknown
      // We cannot add an "Download" button for Hangar, because the download button is only visible after multiple clicks.
      // This is the best you're gonna get.
      presenceData.buttons = [
        {
          label: `View ${
            pageType === PageType.Unknown
              ? 'Page'
              : capitalize(pageType.toString())
          }`,
          url: href,
        },
      ]
      break
    }
    case 'papermc.io': {
      switch (pathSplit[0]) {
        case 'downloads': {
          switch (pathSplit[1]) {
            case 'paper': {
              presenceData.details = 'Browsing Paper downloads'
              break
            }
            case 'velocity': {
              presenceData.details = 'Browsing Velocity downloads'
              break
            }
            case 'waterfall': {
              presenceData.details = 'Browsing Waterfall downloads'
              break
            }
            default: {
              presenceData.details = 'Browsing download portal'
              break
            }
          }
          break
        }
        case 'community': {
          presenceData.details = 'Viewing Community page'
          break
        }
        case 'contribute': {
          presenceData.details = 'Viewing Contribute page'
          break
        }
        case 'sponsors': {
          presenceData.details = 'Viewing Sponsors page'
          break
        }
        case 'javadocs': {
          presenceData.details = 'Viewing Javadocs portal'
          break
        }
        case 'software': {
          switch (pathSplit[1]) {
            case 'paper': {
              presenceData.details = 'Viewing Paper\'s homepage'
              break
            }
            case 'velocity': {
              presenceData.details = 'Viewing Velocity\'s homepage'
              break
            }
            case 'waterfall': {
              presenceData.details = 'Viewing Waterfall\'s homepage'
              break
            }
            default: {
              presenceData.details = 'Browsing software'
              break
            }
          }
          break
        }
        default: {
          presenceData.details = location.pathname === '/' ? 'Viewing homepage' : 'Browsing website'
          presenceData.state = document.querySelector('h1')?.textContent
          break
        }
      }
      break
    }
    case 'docs.papermc.io': {
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
        case 'misc': {
          presenceData.details = 'Browsing docs misc information'
          presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
          break
        }
        case 'waterfall': {
          presenceData.details = 'Browsing Waterfall docs'
          presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
          break
        }
        case 'velocity': {
          presenceData.details = 'Browsing Velocity docs'
          presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
          break
        }
        case 'paper': {
          switch (pathSplit[1]) {
            case 'admin': {
              presenceData.details = 'Reading Paper\'s Docs for Server Admins'
              presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
              break
            }
            case 'dev': {
              presenceData.details = 'Reading Paper\'s Docs for Developers'
              presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
              break
            }
            default: {
              if (pathSplit[3]) {
                presenceData.details = 'Reading Paper\'s Docs'
                presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
              }
              else {
                presenceData.details = 'Reading Paper\'s Docs'
              }

              break
            }
          }
          break
        }
        default: {
          presenceData.details = 'Browsing docs'
        }
      }
      break
    }
    case 'jd.papermc.io': {
      presenceData.details = 'Browsing Javadocs'
      presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
      break
    }
    case 'forums.papermc.io': {
      switch (pathSplit[0]) {
        case 'threads': {
          presenceData.details = 'Reading a thread on the forums'
          presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
          break
        }
        case 'members': {
          const username = document.querySelector('.username')?.textContent
          presenceData.details = `Viewing ${username}'s profile on the forums`
          presenceData.state = document.querySelector(
            '.memberHeader-blurb',
          )?.textContent
          presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
            `[alt=${username}]`,
          )?.src
          presenceData.smallImageKey = logoURL
          break
        }
        default: {
          presenceData.details = 'Browsing Forums'
          presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
            || document.querySelector<HTMLHeadingElement>('h2')?.textContent
          break
        }
      }
      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
