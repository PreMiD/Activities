const presence = new Presence({
  clientId: '1167920926076190861',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/Bluesky/assets/logo.png',
  }
  const path = document.location.pathname.split('/')
  const [showUsername, showPost, showFeed] = await Promise.all([
    presence.getSetting<boolean>('show_profile'),
    presence.getSetting<boolean>('show_post'),
    presence.getSetting<boolean>('show_feed'),
  ])

  switch (path[1]) {
    case 'profile':
      switch (path[3]) {
        case 'feed':
          presenceData.details = 'Viewing a feed'
          if (showFeed) {
            presenceData.buttons = [
              {
                label: 'View Feed',
                url: document.location.href,
              },
            ]
          }
          break
        case 'post':
          presenceData.details = 'Viewing a post'
          if (showPost) {
            presenceData.buttons = [
              {
                label: 'View Post',
                url: document.location.href,
              },
            ]
          }
          break
        default:
          presenceData.details = 'Viewing a profile'
          if (showUsername) {
            presenceData.state = document.querySelector(
              'div[data-testid="profileHeaderDisplayName"]',
            )?.textContent
            presenceData.buttons = [
              {
                label: 'View Profile',
                url: document.location.href,
              },
            ]
          }
      }
      break
    case 'feeds':
      presenceData.details = 'Browsing'
      presenceData.state = 'Feeds'
      break
    case 'search':
      presenceData.details = 'Searching'
      break
    case 'notifications':
      presenceData.details = 'Browsing'
      presenceData.state = 'Notifications'
      break
    case 'moderation':
      presenceData.details = 'Managing moderation settings'
      switch (path[2]) {
        case 'mute-lists':
          presenceData.state = 'Mute Lists'
          break
        case 'muted-accounts':
          presenceData.state = 'Muted Accounts'
          break
        case 'blocked-accounts':
          presenceData.state = 'Blocked Accounts'
          break
      }
      break
    case 'settings':
      presenceData.details = 'Managing settings'
      switch (path[2]) {
        case 'home-feed':
          presenceData.state = 'Home Feed Preferences'
          break
        case 'threads':
          presenceData.state = 'Threads Preferences'
          break
        case 'saved-feeds':
          presenceData.state = 'Feeds'
          break
        case 'language':
          presenceData.state = 'Language Settings'
          break
        case 'app-passwords':
          presenceData.state = 'Applications'
          break
      }
      break
    default:
      presenceData.details = 'Browsing'
      presenceData.state = 'Home'
      break
  }

  presence.setActivity(presenceData)
})
