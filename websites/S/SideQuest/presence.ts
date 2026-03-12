const presence = new Presence({
  clientId: '1146519848906653727',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/SideQuest/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const pathList = pathname.split('/').filter(Boolean)

  switch (pathList[0] ?? '') {
    case '': {
      presenceData.details = 'Browsing home page'
      break
    }
    case 'app': {
      presenceData.details = 'Viewing an app'
      presenceData.state = document.querySelector<HTMLDivElement>(
        '.right-section .large-font',
      )?.textContent
      presenceData.buttons = [{ label: 'View App', url: href }]
      break
    }
    case 'apps': {
      presenceData.details = 'Browsing apps by category'
      presenceData.state = document
        .querySelector('div > a[class*=active]')
        ?.textContent
        ?.split(' ')
        .slice(1)
        .join('')
      break
    }
    case 'all-apps': {
      presenceData.details = 'Browsing all apps'
      presenceData.state = document
        .querySelector<HTMLAnchorElement>('sq-button > a[class*=active]')
        ?.textContent
        ?.substring(5)
        .trim()
      break
    }
    case 'giveaways': {
      if (pathList[1]) {
        presenceData.details = 'Viewing a giveaway'
        presenceData.state = document.querySelector('h4')?.textContent
        presenceData.buttons = [{ label: 'View Giveaway', url: href }]
      }
      else {
        presenceData.details = 'Browsing giveaways'
      }
      break
    }
    case 'news': {
      presenceData.details = 'Reading a news post'
      presenceData.state = document
        .querySelector<HTMLDivElement>('.top-title-text')
        ?.textContent
        ?.trim()
      presenceData.buttons = [{ label: 'View Post', url: href }]
      break
    }
    case 'space': {
      const spaceTitle = document
        .querySelector<HTMLDivElement>('.community-title')
        ?.textContent
        ?.trim()
      presenceData.smallImageKey = document
        .querySelector<HTMLDivElement>('.user-image')
        ?.style
        .backgroundImage
        .match(/url\("(.+)"\)/)?.[1]
      presenceData.smallImageText = document
        .querySelector('.community-title + div > div')
        ?.textContent
        ?.trim()
      if (pathList[2] === 'p') {
        presenceData.details = 'Viewing a space post'
        presenceData.state = `${spaceTitle} - ${document
          .querySelector<HTMLDivElement>('.post-title-name')
          ?.textContent
          ?.trim()}`
        presenceData.buttons = [{ label: 'View Post', url: href }]
      }
      else {
        presenceData.details = 'Browsing a space'
        presenceData.state = spaceTitle
        presenceData.buttons = [{ label: 'View Space', url: href }]
      }
      break
    }
    case 'spaces': {
      presenceData.details = 'Browsing spaces'
      break
    }
    case 'user': {
      presenceData.details = 'Viewing a user\'s profile'
      presenceData.state = document
        .querySelector<HTMLDivElement>('.large-font')
        ?.childNodes[1]
        ?.textContent
        ?.trim()
      presenceData.smallImageKey = document
        .querySelector<HTMLDivElement>('.user-image')
        ?.style
        .backgroundImage
        .match(/url\("(.+)"\)/)?.[1]
      presenceData.buttons = [{ label: 'View Profile', url: href }]
      break
    }
    default: {
      presenceData.details = 'Browsing...'
    }
  }

  presence.setActivity(presenceData)
})
