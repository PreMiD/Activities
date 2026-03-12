const presence = new Presence({
  clientId: '1036066765735727144',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/Fly.io/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, hostname } = window.location
  const pathSplit = pathname.split('/').slice(1)
  const privacyMode = await presence.getSetting<boolean>('privacyMode')

  function useBlogPostState(namespace: string): void {
    if (pathSplit[1] === 'page' || pathSplit[1] === '') {
      presenceData.details = `Browsing ${namespace} posts`
    }
    else {
      presenceData.details = `Reading a ${namespace} post`
      presenceData.state = document.querySelector('h1')?.textContent
      presenceData.buttons = [{ label: 'Read Post', url: href }]
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.post-cover')?.src
    }
  }

  switch (hostname) {
    case 'fly.io':
    case 'www.fly.io': {
      switch (pathSplit[0]) {
        case '': {
          presenceData.details = 'Browsing the homepage'
          break
        }
        case 'blog': {
          useBlogPostState('blog')
          break
        }
        case 'phoenix-files': {
          useBlogPostState('Phoenix Files')
          break
        }
        case 'laravel-bytes': {
          useBlogPostState('Laravel Bytes')
          break
        }
        case 'ruby-dispatch': {
          useBlogPostState('Ruby Dispatch')
          break
        }
        case 'docs': {
          presenceData.details = 'Reading the documentation'
          presenceData.state = document.querySelector('h1')?.textContent
          break
        }
        case 'jobs': {
          if (pathSplit[1]) {
            presenceData.details = 'Viewing a job posting'
            presenceData.state = document.querySelector('h1')?.textContent
          }
          else {
            presenceData.details = 'Browsing jobs'
          }
          break
        }
        case 'dashboard': {
          presenceData.details = 'Using the dashboard'
          switch (pathSplit[2]) {
            case 'billing': {
              presenceData.state = 'Viewing billing information'
              break
            }
            case 'team': {
              presenceData.state = 'Viewing team members'
              break
            }
            case 'documents': {
              presenceData.state = 'Viewing documents'
              break
            }
            case 'settings': {
              presenceData.state = 'Viewing settings'
              break
            }
            case 'launch': {
              presenceData.state = 'Launching an app'
              break
            }
          }
          break
        }
        case 'apps': {
          const details: Record<string, string> = {
            '': 'Viewing app dashboard',
            'monitoring': 'Viewing app logs',
            'metrics': 'Viewing app metrics',
            'certificates': 'Viewing app certificates',
            'scale': 'Viewing app scaling',
            'activity': 'Viewing app activity',
            'secrets': 'Viewing app secrets',
            'volumes': 'Viewing app volumes',
            'machines': 'Viewing app machines',
            'settings': 'Viewing app settings',
          }
          presenceData.details = details[pathSplit[2] ?? '']
          if (!privacyMode) {
            presenceData.state = document
              .querySelector('[aria-label="Breadcrumb"] li:nth-child(3)')
              ?.textContent
              ?.trim()
          }
          break
        }
        case 'organizations': {
          if (pathSplit[1] === 'new')
            presenceData.details = 'Creating an organization'
          else presenceData.details = 'Browsing their organizations'
          break
        }
        case 'launch': {
          if (pathSplit[1]) {
            presenceData.details = `Launching a ${
              document.querySelector('h1 > strong')?.textContent
            }`
          }
          else {
            presenceData.details = 'Reading the documentation'
            presenceData.state = document.querySelector('h1')?.textContent
          }
          break
        }
        case 'user': {
          presenceData.details = 'Managing their account'
          break
        }
        default: {
          presenceData.details = 'Browsing'
          // eslint-disable-next-line regexp/optimal-quantifier-concatenation
          presenceData.state = document.title.match(/^(.*)( · .*)?$/)?.[1]
          break
        }
      }
      break
    }
    case 'community.fly.io': {
      presenceData.details = 'Browsing community forums'
      switch (pathSplit[0]) {
        case 'top': {
          presenceData.state = 'Top posts'
          break
        }
        case 'categories': {
          presenceData.state = 'Categories'
          break
        }
        case 'c': {
          presenceData.details = 'Browsing forum category'
          presenceData.state = document.querySelector<HTMLSpanElement>(
            '.category-name',
          )?.textContent
          break
        }
        case 'u': {
          presenceData.details = `Viewing ${document
            .querySelector<HTMLHeadingElement>('.username')
            ?.textContent
            ?.trim()}'s profile`
          presenceData.state = document.querySelector<HTMLAnchorElement>(
            '.user-nav > li > a.active',
          )?.textContent
          presenceData.smallImageKey = document.querySelector<HTMLImageElement>(
            '.user-profile-avatar .avatar',
          )?.src
          break
        }
        case 'badges': {
          presenceData.details = 'Viewing forum badges'
          if (pathSplit[1]) {
            presenceData.state = document.querySelector<HTMLAnchorElement>(
              '.badge-link',
            )?.textContent
          }
          break
        }
        case 't': {
          presenceData.details = 'Viewing a forum topic'
          presenceData.state = document
            .querySelector<HTMLAnchorElement>('.fancy-title')
            ?.textContent
            ?.trim()
          presenceData.buttons = [{ label: 'View Topic', url: href }]
          break
        }
        case 'tag': {
          if (pathSplit[1]) {
            presenceData.details = 'Viewing forum posts by tag'
            presenceData.state = document
              .querySelector('.tag-drop-header')
              ?.textContent
              ?.trim()
          }
          else {
            presenceData.details = 'Browsing forum tags'
          }
          break
        }
        default: {
          // eslint-disable-next-line regexp/optimal-quantifier-concatenation
          presenceData.state = document.title.match(/^(.*)( - Fly\.io)?$/)?.[1]
        }
      }
      break
    }
  }

  presence.setActivity(presenceData)
})
