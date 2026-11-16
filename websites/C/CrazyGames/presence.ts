const presence = new Presence({
  clientId: '1548823877592031292',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/CrazyGames/assets/logo.png',
}

function checkImageExists(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

presence.on('UpdateData', async () => {
  const strings = await presence.getStrings({
    browsing: 'general.browsing',
    viewHome: 'general.viewHome',
    buttonViewGame: 'general.buttonViewGame',
    searchFor: 'general.searchFor',
    searchSomething: 'general.searchSomething',
    viewPage: 'general.viewPage',
    viewCategory: 'general.viewCategory',
    viewProfile: 'general.viewProfile',
    buttonViewProfile: 'general.buttonViewProfile',
    viewAProfile: 'general.viewAProfile',
    playAGame: 'crazygames.playAGame',
    viewAllTags: 'crazygames.viewAllTags',
    viewGameTag: 'crazygames.viewGameTag',
  })

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, search } = document.location
  const searchParams = new URLSearchParams(search)
  const isHomePage = document.querySelector('[class*="HomePage"]')

  const [privacy, usePresenceName, showCover, buttons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('usePresenceName'),
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('buttons'),
  ])

  if (isHomePage) {
    presenceData.details = strings.browsing
    presenceData.state = strings.viewHome
  }
  else if (pathname.includes('/game/')) {
    const gameTitle = document.querySelector<HTMLMetaElement>('meta[name=apple-mobile-web-app-title]')?.getAttribute('content') || document.querySelector('h1')?.textContent?.trim()
    const gameImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.getAttribute('content')

    if (gameTitle && !privacy) {
      presenceData.name = usePresenceName ? gameTitle : 'CrazyGames'
      presenceData.details = gameTitle
      presenceData.buttons = [
        {
          label: strings.buttonViewGame,
          url: document.location.href,
        },
      ]

      if (gameImage) {
        const squareThumbnailUrl = gameImage.replaceAll('16x9', '1x1')
        const squareThumbnailResponse = await checkImageExists(new URL('?width=1', squareThumbnailUrl).toString())
        const mobileThumbnailAvailable = squareThumbnailResponse

        const thumbnailUrl = mobileThumbnailAvailable
          ? new URL('?width=512&', squareThumbnailUrl)
          : new URL('?width=512&height=512&fit=crop', gameImage)
        presenceData.largeImageKey = thumbnailUrl.toString()
      }
    }
    else {
      presenceData.details = strings.playAGame
    }
  }
  else if (pathname.includes('/recent') || pathname.includes('/new') || pathname.includes('/hot') || pathname.includes('/updated') || pathname.includes('/originals') || pathname.includes('/multiplayer') || pathname.includes('/leaderboards')) {
    presenceData.details = strings.viewPage
    if (pathname.includes('/multiplayer')) {
      const multiplayerActiveMode = document.querySelector('a[class*="MultiplayerHeader"][class*="MultiplayerHeader_active"]')
      const modeSelectionOverlay = document.querySelector('[class*="ModeSelectionOverlay"]')
      presenceData.state = multiplayerActiveMode && !modeSelectionOverlay ? `${document.querySelector('[class*="MultiplayerHeader"] h1')?.textContent?.trim()} - ${multiplayerActiveMode?.textContent?.trim()}` : document.querySelector('[class*="MultiplayerHeader"] h1')?.textContent?.trim() || ''
    }
    else {
      presenceData.state = document.querySelector('h1[class*="PageTitle"]')?.textContent?.trim() || ''
    }
  }
  else if (pathname.includes('/c/')) {
    presenceData.details = strings.viewCategory
    presenceData.state = document.querySelector('h1[class*="PageTitle"]')?.textContent?.trim() || ''
  }
  else if (pathname.includes('/tags')) {
    presenceData.details = strings.browsing
    presenceData.state = strings.viewAllTags
  }
  else if (pathname.includes('/t/')) {
    presenceData.details = strings.viewGameTag
    presenceData.state = document.querySelector('h1[class*="PageTitle"]')?.textContent?.trim() || ''
  }
  else if (pathname.includes('/u/')) {
    presenceData.details = privacy ? strings.viewAProfile : strings.viewProfile
    if (!privacy) {
      presenceData.state = document.querySelector('h2[class*="UserProfileTitle"]')?.textContent?.trim() || ''
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>('img[class*="UserProfileAvatar"]')?.src || ActivityAssets.Logo
      presenceData.buttons = [
        {
          label: strings.buttonViewProfile,
          url: document.location.href,
        },
      ]
    }
  }
  else if (pathname.includes('/search') && searchParams.has('q')) {
    const searchQuery = searchParams.get('q')
    if (searchQuery && !privacy) {
      presenceData.details = strings.searchFor
      presenceData.state = searchQuery
    }
    else {
      presenceData.details = strings.searchSomething
    }
  }
  else {
    presenceData.details = strings.viewPage
    presenceData.state = document.title
  }

  if (!buttons) {
    delete presenceData.buttons
  }
  if (!showCover) {
    presenceData.largeImageKey = ActivityAssets.Logo
  }
  if (presenceData.largeImageKey !== ActivityAssets.Logo) {
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.smallImageText = 'CrazyGames'
  }

  presence.setActivity(presenceData)
})
