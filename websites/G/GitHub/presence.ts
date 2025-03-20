/* eslint-disable no-case-declarations */
const presence = new Presence({
  clientId: '607587875122446359',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/GitHub/assets/logo.png',
  }
  const pages: Record<string, PresenceData> = {
    'login': {
      details: 'Logging in',
    },
    'settings': {
      details: 'Viewing settings',
    },
    'explore': {
      details: 'Browsing repositories',
    },
    'discover': {
      details: 'Browsing repositories',
    },
    'marketplace': {
      details: 'Browsing marketplace',
    },
    'pulls': { details: 'Viewing pull requests' },
    'issues': { details: 'Viewing issues' },
    'notifications': {
      details: 'Viewing notifications',
    },
    'watching': { details: 'Browsing interested repositories' },
    'new': { details: 'Creating a repository' },
    'topics': { details: 'Browsing topics' },
    'trending': { details: 'Browsing trending repositories' },
    'collections': { details: 'Browsing collections' },
    'events': { details: 'Browsing events' },
    'codespaces': { details: 'Browsing codespaces' },
    'search': {
      details: 'Searching for',
      state: new URLSearchParams(document.location.search).get('q'),
    },
    'trending/developers': {
      details: 'Browsing trending developers',
    },
    'new/import': { details: 'Importing a repository' },
    'new/project': { details: 'Creating a project' },
    'organization/new': { details: 'Creating an organization' },
    'notifications/subscriptions': {
      details: 'Viewing subscriptions',
    },
  }
  const { pathname, search, href, hostname } = document.location
  const [cover, timestamp, privacy] = await Promise.all([
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('privacy'),
  ])

  for (const [path, data] of Object.entries(pages)) {
    if (pathname.includes(`/${path}`))
      presenceData = { ...presenceData, ...data } as PresenceData
  }
  if (hostname === 'github.com') {
    switch (true) {
      // * For Profiles
      case !!document.querySelector<HTMLBodyElement>('body.page-profile'):
        if (privacy) {
          presenceData.details = 'Viewing a profile'
          break
        }
        const searchParam = new URLSearchParams(search).get('tab')
        const profileName = document
          .querySelector('span.p-nickname')
          ?.textContent
          ?.split('·')[0]
          ?.trim()
        presenceData.buttons = [{ label: 'View Profile', url: href }]
        if (cover) {
          presenceData.largeImageKey = `${
            document.querySelector<HTMLImageElement>('img.avatar-user')?.src
          }.png`
        }
        if (searchParam)
          presenceData.details = `Viewing ${profileName}'s ${searchParam}`
        else presenceData.details = `Viewing ${profileName}'s profile`
        break
        // * For repositories
      case !!document.querySelector<HTMLDivElement>(
        'div#repository-container-header',
      ):
        const repository = {
          owner: pathname.split('/')[1],
          name: pathname.split('/')[2],
          target: pathname.split('/')[4],
          id: pathname.split('/')[4],
        }
        presenceData.buttons = [{ label: 'View Repository', url: href }]
        if (cover && !privacy) {
          presenceData.largeImageKey = `https://avatars.githubusercontent.com/u/${
            document.querySelector<HTMLMetaElement>(
              'meta[name~="octolytics-dimension-user_id"]',
            )?.content
          }`
        }

        if (pathname.includes('/tree/')) {
          if (privacy) {
            presenceData.details = 'Viewing a repository'
            presenceData.state = 'In a folder'
            delete presenceData.buttons
            break
          }
          presenceData.details = `Browsing repository ${repository.owner}/${repository.name}`

          presenceData.state = `In folder ${pathname
            .split('/')
            .slice(4)
            .join('/')}`
        }
        else if (pathname.includes('/blob/')) {
          if (privacy) {
            presenceData.details = 'Browsing a repository'
            presenceData.state = 'Viewing a file'
            delete presenceData.buttons
            break
          }
          const pathFolder = document
            .querySelector('#repos-header-breadcrumb-wide > ol')
            ?.textContent
            ?.trim()
            .split('/')
            .slice(1)
            .join('/')
          const fileName = document.querySelector('#file-name-id-wide')?.textContent
          presenceData.details = `Browsing repository ${repository.owner}/${repository.name}`
          presenceData.state = `Viewing file ${(pathFolder
            ? `${pathFolder}/${fileName}`
            : fileName
          )?.trim()} at ${repository.target}`
        }
        else if (pathname.includes('/issues')) {
          if (pathname.includes('/issues/')) {
            if (pathname.includes('new')) {
              if (privacy) {
                presenceData.details = 'Creating an issue'
                delete presenceData.state
                delete presenceData.buttons
                break
              }
              presenceData.details = `Creating an issue in ${repository.owner}/${repository.name}`
            }
            else {
              if (privacy) {
                presenceData.details = 'Looking at an issue'
                delete presenceData.state
                delete presenceData.buttons
                break
              }
              presenceData.details = `Looking at issue #${repository.id}`
              presenceData.state = `${
                document
                  .querySelector<HTMLAnchorElement>('a.author')
                  ?.textContent
                  ?.trim()
                  ?? document.querySelector('[href="#top"]')?.textContent?.trim()
              } - ${
                document.querySelector<HTMLHeadingElement>('h1.gh-header-title')
                  ?.textContent
              }`
              presenceData.buttons = [{ label: 'View Issue', url: href }]
            }
          }
          else {
            if (privacy) {
              presenceData.details = 'Browsing issues'
              delete presenceData.state
              delete presenceData.buttons
              break
            }
            presenceData.details = 'Browsing issues'
            presenceData.state = `${repository.owner}/${repository.name}`
          }
        }
        else if (pathname.includes('/pulls')) {
          if (privacy) {
            presenceData.details = 'Browsing pull requests'
            delete presenceData.state
            delete presenceData.buttons
            break
          }
          presenceData.details = 'Browsing pull requests'
          presenceData.state = `${repository.owner}/${repository.name}`
        }
        else if (pathname.includes('/pull')) {
          if (privacy) {
            presenceData.details = 'Looking at a pull request'
            delete presenceData.state
            delete presenceData.buttons
            break
          }
          presenceData.details = `Looking at pull request #${repository.id}`
          presenceData.state = `${
            document.querySelector<HTMLAnchorElement>('a.author.Link--primary')
              ?.textContent
              ?? document.querySelector('[class*="author Link"]')?.textContent
          } - ${
            document.querySelector<HTMLHeadingElement>('h1.gh-header-title')
              ?.textContent
          }`
          presenceData.buttons = [{ label: 'View Pull Request', url: href }]
        }
        else if (pathname.endsWith('/discussions')) {
          if (privacy) {
            presenceData.details = 'Browsing discussions'
            delete presenceData.state
            delete presenceData.buttons
            break
          }
          presenceData.details = 'Browsing discussions in'
          presenceData.state = `${repository.owner}/${repository.name}`
        }
        else if (pathname.includes('/discussions/')) {
          if (privacy) {
            presenceData.details = 'Looking at a discussion'
            delete presenceData.state
            delete presenceData.buttons
            break
          }
          presenceData.details = `Looking at discussion #${repository.id}`
          presenceData.state = `${
            document.querySelectorAll<HTMLAnchorElement>('a.author')[0]
              ?.textContent
          } - ${
            document.querySelector<HTMLHeadingElement>('h1.gh-header-title')
              ?.textContent
          }`
          presenceData.buttons = [{ label: 'View Discussion', url: href }]
        }
        else if (
          pathname.includes('/pulse')
          || pathname.includes('/graphs/contributors')
          || pathname.includes('/community')
          || pathname.includes('/graphs/commit-activity')
          || pathname.includes('/graphs/code-frequency')
          || pathname.includes('/network/dependencies')
          || pathname.includes('/graphs/commit-activity')
          || pathname.includes('/network')
          || pathname.includes('/network/members')
        ) {
          if (privacy) {
            presenceData.details = 'Browsing insights'
            delete presenceData.state
            delete presenceData.buttons
            break
          }
          presenceData.details = `Browsing insights of ${repository.owner} / ${repository.name}`

          presenceData.state = document.querySelector<HTMLAnchorElement>(
            'nav a.js-selected-navigation-item.selected.menu-item',
          )?.textContent
        }
        else {
          if (privacy) {
            presenceData.details = 'Browsing a repository'
            delete presenceData.state
            delete presenceData.buttons
            break
          }
          presenceData.details = 'Browsing repository'
          presenceData.state = `${repository.owner}/${repository.name}`
        }
        break
      case pathname.includes('/orgs/'):
        if (privacy) {
          presenceData.details = 'Viewing the people in an organization'
          delete presenceData.state
          delete presenceData.buttons
          break
        }
        presenceData.details = `Viewing ${pathname.split('/')[2]}'s ${
          pathname.split('/')[3]
        }`

        break
      case !!document.querySelector<HTMLMetaElement>(
        'meta[name="hovercard-subject-tag"]',
      ):
        presenceData.details = 'Viewing an organization'

        if (privacy) {
          delete presenceData.state
          delete presenceData.buttons
          break
        }

        presenceData.state = document.title
        if (cover) {
          presenceData.largeImageKey = `${
            document.querySelector<HTMLMetaElement>(
              'meta[property~="og:image"]',
            )?.content
            ?? document.querySelector<HTMLImageElement>(
              'img[itemprop=\'image\'].avatar',
            )?.src
            ?? presenceData.largeImageKey
          }`
        }
        break
      case pathname.includes('/features'):
        presenceData.details = 'Browsing features'
        if (pathname.includes('copilot'))
          presenceData.state = 'Looking at Github Copilot'

        break

      case pathname === '/' || !pathname:
        presenceData.details = 'Viewing the home page'
        break
    }
  }
  else if (pathname === '/') {
    presenceData.details = 'Creating a GitHub gist'
  }
  else if (pathname.includes('/discover')) {
    presenceData.details = 'Browsing GitHub gists'
  }
  else if (pathname.includes('/forked')) {
    presenceData.details = 'Browsing forked GitHub gists'
  }
  else if (pathname.includes('/starred')) {
    presenceData.details = 'Browsing starred GitHub gists'
  }
  else {
    switch (true) {
      // * For Profiles
      case !!document.querySelector('div.js-profile-editable-replace'):
        if (privacy) {
          presenceData.details = 'Viewing a profile'
          break
        }
        const searchParam = new URLSearchParams(search).get('tab')
        const profileName = document
          .querySelector('span.p-nickname')
          ?.textContent
          ?.trim()
        presenceData.buttons = [{ label: 'View Profile', url: href }]
        if (cover) {
          presenceData.largeImageKey = `${
            document.querySelector<HTMLImageElement>(
              'img.avatar.avatar-user.width-full',
            )?.src
          }.png`
        }
        if (searchParam)
          presenceData.details = `Viewing ${profileName}'s ${searchParam}`
        else presenceData.details = `Viewing ${profileName}'s profile`
        break
        // * For gists
      case !!document.querySelector('div.repository-content.gist-content'):
        if (privacy) {
          presenceData.details = 'Viewing a gist'
          break
        }
        const gist = {
          owner: pathname.split('/')[1],
          name: document.querySelector('[itemprop = \'name\'] > a')?.innerHTML,
        }
        presenceData.buttons = [{ label: 'View Gist', url: href }]
        presenceData.details = `Browsing gist ${gist.name} by ${gist.owner}`
    }
  }
  if (timestamp)
    presenceData.startTimestamp = browsingTimestamp
  presence.setActivity(presenceData)
})
