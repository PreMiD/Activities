import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1107321415243415574',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/Mastodon/assets/logo.png',
  FediverseLogo = 'https://cdn.rcd.gg/PreMiD/websites/M/Mastodon/assets/0.png',
}

// checks if user is logged from textarea
function checkPositionAccountAvatar() {
  if (document.querySelectorAll('.autosuggest-textarea__textarea').length < 1)
    return 1
  return 2
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }
  const [time, privacy] = await Promise.all([
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('privacy'),
  ])
  const { pathname, hostname } = document.location

  if (time)
    presenceData.startTimestamp = browsingTimestamp

  switch (pathname) {
    case '/home': {
      presenceData.details = 'On the homepage'
      break
    }
    case '/notifications': {
      presenceData.details = 'Checking notifications'
      break
    }
    case '/public/local': {
      presenceData.details = 'Looking in local timeline'
      break
    }
    case '/public': {
      presenceData.largeImageKey = ActivityAssets.FediverseLogo
      presenceData.details = 'Looking in fediverse'
      break
    }
    case '/bookmarks':
    case '/favourites':
    case '/lists': {
      presenceData.details = `Looking at their ${pathname.split('/')[1]}`
      break
    }
    case '/search': {
      presenceData.details = !privacy
        ? `Searching ${document
          .querySelector('.search__input')
          ?.getAttribute('value')}`
        : 'Searching up something'
      break
    }
    case '/relationships': {
      presenceData.details = 'Viewing their followers'
      break
    }
    case '/about': {
      presenceData.smallImageKey = document
        .querySelectorAll('.account__avatar')[checkPositionAccountAvatar()]
        ?.querySelector('img')
        ?.getAttribute('src')
      presenceData.largeImageKey = document
        .querySelector('.about__header__hero img')
        ?.getAttribute('src')
      presenceData.smallImageText = `About ${hostname}`
      presenceData.details = `About ${hostname}`
      break
    }
    case '/directory': {
      presenceData.details = 'On the directory'
      break
    }
    case '/privacy-policy': {
      presenceData.details = 'Reading Privacy and Policy'
      break
    }
    case '/follow_requests': {
      presenceData.details = 'Looking at their follow requests'
      break
    }
  }

  if (pathname.startsWith('/explore')) {
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Explore'
    presenceData.details = 'On the explore'
  }
  else if (pathname.startsWith('/@')) {
    if (!privacy) {
      presenceData.smallImageKey = document
        .querySelectorAll('.account__avatar')[checkPositionAccountAvatar()]
        ?.querySelector('img')
        ?.getAttribute('src')
      presenceData.smallImageText = `${document.location}`
    }

    presenceData.details = `Viewing ${
      !privacy ? `${pathname.split(/[@,/]+/)[1]}'s` : 'a'
    } profile`
  }
  else if (pathname.startsWith('/settings')) {
    presenceData.details = 'Viewing their settings'
  }
  else if (pathname.startsWith('/tags')) {
    presenceData.details = !privacy
      ? `Searching ${pathname.split('/')[2]} tag`
      : 'Searching for: tags'
  }

  presence.setActivity(presenceData)
})
