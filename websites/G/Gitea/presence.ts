const presence = new Presence({
  clientId: '682218734391394338',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Gitea/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  switch (document.location.pathname) {
    case '/': {
      presenceData.details = 'Viewing the front page...'
      break
    }
    case '/user/login':
    case '/user/login/openid': {
      presenceData.details = 'Logging in...'
      break
    }
    case '/user/sign_up': {
      presenceData.details = 'Signing up...'
      break
    }
    case '/issues': {
      presenceData.details = 'Viewing their Issues...'
      break
    }
    case '/pulls': {
      presenceData.details = 'Viewing their Pull Requests...'
      break
    }
    case '/milestones': {
      presenceData.details = 'Viewing their Milestones...'
      break
    }
    case '/explore/repos': {
      presenceData.details = 'Exploring Repositories...'
      break
    }
    case '/explore/users': {
      presenceData.details = 'Exploring Users...'
      break
    }
    case '/explore/organizations': {
      presenceData.details = 'Exploring Organizations...'
      break
    }
    default:
      if (document.location.pathname.startsWith('/user/settings')) {
        presenceData.details = 'Changing their Settings...'
      }
      else if (document.location.pathname.startsWith('/notifications')) {
        presenceData.details = 'Checking their Notifications...'
      }
      else if (document.location.pathname.startsWith('/repo/create')) {
        presenceData.details = 'Creating a new Repository...'
      }
      else if (document.location.pathname.startsWith('/repo/migrate')) {
        presenceData.details = 'Creating a new Migration Repository...'
      }
      else if (document.location.pathname.startsWith('/org/create')) {
        presenceData.details = 'Creating a new Organization...'
      }
      else if (document.querySelector('.user.profile')) {
        // Profile Page
        presenceData.details = `Viewing Profile: ${
          document.querySelectorAll('.username')[0]?.textContent
        }`
        if (
          document.querySelectorAll('.username')[0]?.parentElement
            ?.firstElementChild
        ) {
          presenceData.details += ` (${
            document.querySelectorAll('.username')[0]?.parentElement
              ?.firstElementChild
              ?.textContent
          })`
        }
        const tab = new URLSearchParams(window.location.search).get('tab')
        if (tab) {
          switch (tab) {
            case 'activity': {
              presenceData.state = 'Tab: Public Activity'
              break
            }
            case 'stars': {
              presenceData.state = 'Tab: Starred Repositories'
              break
            }
            case 'following': {
              presenceData.state = 'Tab: Following'
              break
            }
            case 'followers': {
              presenceData.state = 'Tab: Followers'
              break
            }
          }
        }
        else {
          presenceData.state = 'Tab: Repositories'
        }
      }
      else if (document.querySelector('#org-info')) {
        // Organization Page
        const displayName = document
          .querySelector('#org-info')
          ?.querySelector('.ui.header')
          ?.textContent
          ?.replace(/\s*(?=(shaare))/g, '')
          .replace(/(?<=(shaare))\s*/g, '')
        const [, orgName] = document.location.pathname.split('/')
        if (displayName === orgName)
          presenceData.details = `Viewing Organization: ${orgName}`
        else
          presenceData.details = `Viewing Organization: ${displayName} (${orgName})`
      }
      else if (document.querySelector('.repository')) {
        // Repository Page
        presenceData.details = `Viewing Repository: ${
          document.location.pathname.split('/')[1]
        }/${document.location.pathname.split('/')[2]}`
        if (document.location.pathname.split('/')[3] === 'issues') {
          if (document.querySelector('#issue-title')) {
            presenceData.state = `Viewing an Issue... (${
              document.querySelector('.index')?.textContent
            })`
          }
          else {
            presenceData.state = 'Viewing Issues...'
          }
        }
        else if (document.location.pathname.split('/')[3] === 'pulls') {
          if (document.querySelector('#issue-title')) {
            presenceData.state = `Viewing a Pull Request... (${
              document.querySelector('.index')?.textContent
            })`
          }
          else {
            presenceData.state = 'Viewing Pull Requests...'
          }
        }
        else if (document.location.pathname.split('/')[3] === 'releases') {
          presenceData.state = 'Viewing Releases...'
        }
        else if (document.location.pathname.split('/')[3] === 'wiki') {
          presenceData.state = 'Viewing Wiki...'
          if (document.querySelector('.basic.small.button')) {
            presenceData.state += ` (${document
              .querySelector('.basic.small.button')
              ?.firstElementChild
              ?.textContent
              ?.match(/<strong>.*<\/strong>/)?.[0]
              ?.replace(/(<strong>|<\/strong>)/g, '')})`
          }
        }
        else if (document.location.pathname.split('/')[3] === 'activity') {
          presenceData.state = 'Viewing Activity...'
        }
        else if (document.location.pathname.split('/')[3] === 'src') {
          presenceData.state = `Viewing Files... (${
            document.querySelectorAll('.octicon-git-branch')[1]?.parentNode
              ?.lastChild
              ?.textContent
          } Branch)`
        }
        else if (document.location.pathname.split('/')[3] === 'commits') {
          presenceData.state = `Viewing Commits... (${
            document.querySelectorAll('.octicon-git-branch')[1]?.parentNode
              ?.lastChild
              ?.textContent
          } Branch)`
        }
        else if (document.location.pathname.split('/')[3] === 'branches') {
          presenceData.state = 'Viewing Branches'
        }
        else if (document.location.pathname.split('/')[3] === 'forks') {
          presenceData.state = 'Viewing Forks'
        }
        else if (document.location.pathname.split('/')[3] === 'stars') {
          presenceData.state = 'Viewing Stargazers'
        }
        else if (document.location.pathname.split('/')[3] === 'watchers') {
          presenceData.state = 'Viewing Watchers'
        }
        else if (document.location.pathname.split('/')[3] === 'labels') {
          presenceData.state = 'Viewing Labels'
        }
        else if (!document.location.pathname.split('/')[3]) {
          presenceData.state = 'Viewing Files... (master Branch)'
        }
      }
  }
  presence.setActivity(presenceData)
})
