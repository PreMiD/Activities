import { Assets } from 'premid'

enum ActivityAssets {
  Logo = 'https://i.imgur.com/VARG8gC.png',
}

const presence = new Presence({
  clientId: '1504598494147514459',
})

// Function for getting text from the HTML of the website
function getText(selector: string): string {
  return document.querySelector(selector)?.textContent?.trim() || ''
}

// Function for getting the name/creator of a marketplace item
function getItemData(): string | null {
  const itemName = getText('h1[class*="text-3xl"][class*="md:text-4xl"][class*="xl:text-6xl"][class*="font-bold"][class*="break-words"]')
  if (!itemName)
    return null
  const itemCreator = getText('a[class*="text-muted-foreground"][class*="mb-3"][class*="md:mb-4"]').replace('by ', '')
  const itemCategory = getCategory()

  return `Item (${itemCategory}): ${itemName}${itemCreator ? ` by ${itemCreator}` : ''}`
}

// Function for getting the category of a marketplace item
function getCategory(): string {
  const labels = document.querySelectorAll('span[class*="font-semibold"]')
  for (let i = 0; i < labels.length; i++) {
    if (labels[i]?.textContent?.trim() === 'Category') {
      return labels[i]?.nextElementSibling?.textContent?.trim() || 'Item'
    }
  }
  return 'Item'
}

// Function for getting the name/creator of a game
function getGameData(): string | null {
  const gameName = getText('h1[class*="text-6xl"][class*="font-bold"][class*="mb-2"]')
  if (!gameName)
    return null
  const gameCreator = getText('p[class*="text-muted-foreground"]').replace('by ', '')
  return `Game: ${gameName}${gameCreator ? ` by ${gameCreator}` : ''}`
}

presence.on('UpdateData', async () => {
  const { pathname, hostname, search } = document.location
  const paths = pathname.split('/').filter(Boolean)
  const params = new URLSearchParams(search)
  const [privacy] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  // API
  if (hostname === 'api.luduvo.com') {
    presenceData.name = 'Luduvo (API)'
    if (pathname.startsWith('/auth/sso/discourse')) {
      presenceData.state = 'Signing In/Up'
    }
    else {
      presenceData.state = 'Viewing an API Endpoint'
    }
  }

  // Alpha Tester Site
  else if (hostname === 'alpha.luduvo.com') {
    presenceData.name = 'Luduvo (Alpha)'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Browsing'
    if (!paths.length) {
      presenceData.state = 'Landing'
    }
    else if (paths[0] === 'auth') {
      presenceData.state = 'Signing In/Up'
    }
    else if (paths[0] === 'dashboard') {
      presenceData.state = 'Dashboard'
    }
    else if (paths[0] === 'profile') {
      if (paths.length === 2) {
        const displayName = getText('h1[class*="text-3xl"][class*="sm:text-5xl"][class*="font-bold"][class*="text-foreground"]')
        const username = getText('h1[class*="text-lg"][class*="sm:text-2xl"][class*="font-bold"][class*="text-muted-foreground"]')
        if (displayName) {
          presenceData.state = `User: ${displayName} (${username})`.trim()
        }
        else {
          presenceData.state = 'Viewing a User\'s profile'
        }
      }
      else if (paths[2] === 'info') {
        const infoTitle = getText('h1[class*="text-5xl"][class*="font-bold"][class*="mb-4"]')
        presenceData.state = infoTitle ? `${infoTitle}` : 'User Info'
      }
      else if (paths[2] === 'inventory') {
        const inventoryUser = getText('h1[class*="text-5xl"][class*="font-bold"][class*="mb-4"][class*="text-center"][class*="sm:text-left"]')
        presenceData.state = inventoryUser ? `Inventory of: ${inventoryUser}` : 'Inventory'
      }
      else if (paths[2] === 'trade') {
        const inventoryTitle = getText('h2[class*="text-lg"][class*="font-semibold"]').replace('\'s Inventory', '')
        presenceData.state = inventoryTitle ? `Requesting a Trade with ${inventoryTitle}` : 'Requesting a Trade'
      }
    }
    else if (paths[0] === 'friends') {
      presenceData.state = 'Friends'
    }
    else if (paths[0] === 'item') {
      const itemStatus = getItemData()
      presenceData.state = itemStatus || 'Item'
    }
    else if (paths[0] === 'customize') {
      presenceData.state = 'Customizing Avatar'
    }
    else if (paths[0] === 'marketplace') {
      const itemStatus = getItemData()
      if (itemStatus) {
        presenceData.state = itemStatus
      }
      else {
        const activeCategory = getText('button[aria-selected="true"][data-state="active"]')
        presenceData.state = activeCategory ? `Marketplace (${activeCategory})` : 'Marketplace'
      }
    }
    else if (paths[0] === 'messages') {
      presenceData.state = 'Messages'
    }
    else if (paths[0] === 'inventory') {
      presenceData.state = 'Inventory'
    }
    else if (paths[0] === 'trades') {
      presenceData.state = 'Trades'
    }
    else if (paths[0] === 'games') {
      const gameStatus = getGameData()
      if (gameStatus) {
        presenceData.state = gameStatus
      }
      else {
        presenceData.state = paths.length === 1 ? 'Games' : 'Game'
      }
    }
    else if (paths[0] === 'groups') {
      if (paths.length === 1) {
        presenceData.state = 'Viewing Groups'
      }
      else {
        const groupName = getText('h1[class*="text-2xl"][class*="sm:text-5xl"][class*="font-bold"][class*="text-foreground"][class*="truncate"]')
        const groupCreator = getText('h2[class*="text-lg"][class*="sm:text-2xl"][class*="font-bold"][class*="text-muted-foreground"] a')
        if (groupName) {
          presenceData.state = `Group: ${groupName}${groupCreator ? ` (by ${groupCreator})` : ''}`
        }
        else {
          presenceData.state = 'Group'
        }
      }
    }
    else if (paths[0] === 'studio') {
      const activeStudioTab = getText('button[class*="bg-primary/10"][class*="text-foreground"]')
      presenceData.state = activeStudioTab ? `Studio: ${activeStudioTab}` : 'Studio'
    }
    else if (paths[0] === 'store') {
      presenceData.state = 'Store'
    }
    else if (paths[0] === 'trust-safety') {
      presenceData.state = 'Support Tickets'
    }
    else if (paths[0] === 'redeem') {
      presenceData.state = 'Redeeming a Code'
    }
    else if (paths[0] === 'settings') {
      presenceData.state = 'Settings'
    }
    else if (paths[0] === 'search') {
      const query = params.get('q')
      if (query && !privacy) {
        presenceData.state = `Searching: "${query}"`
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = 'Searching'
      }
      else {
        presenceData.state = 'Searching for something...'
        if (!privacy) {
          presenceData.smallImageKey = Assets.Search
          presenceData.smallImageText = 'Searching'
        }
      }
    }
    else {
      presenceData.state = 'Exploring...'
    }
  }

  // Forums Site
  else if (hostname === 'forum.luduvo.com') {
    presenceData.name = 'Luduvo (Forums)'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Reading'
    if (!paths.length || paths[0] === 'categories') {
      presenceData.state = 'Home Page/Categories'
    }
    else if (paths[0] === 'latest') {
      presenceData.state = 'Latest Topics'
    }
    else if (paths[0] === 'hot') {
      presenceData.state = 'Hot Topics'
    }
    else if (paths[0] === 'new') {
      presenceData.state = 'New Topics'
    }
    else if (paths[0] === 'unread') {
      presenceData.state = 'Unread Topics'
    }
    else if (paths[0] === 't') {
      // Tries fancy-title first, then topic-link if it reloaded into the longer format
      const topicName = getText('a.fancy-title') || getText('a.topic-link span')
      const topicCreator = getText('article#post_1 .first.full-name a')
      if (topicName) {
        presenceData.state = `Topic: ${topicName}${topicCreator ? ` by ${topicCreator}` : ''}`
      }
      else {
        presenceData.state = 'Viewing a Topic'
      }
    }
    else if (paths[0] === 'c') {
      const categorySpan = document.querySelector('span.badge-category__name')
      const categoryName = categorySpan?.textContent?.trim()
      if (categoryName) {
        presenceData.state = `Category: ${categoryName}`.trim()
      }
      else {
        presenceData.state = 'Viewing a Category'
      }
    }
    else if (paths[0] === 'tag') {
      const tagName = decodeURIComponent(paths[1] || '')
      if (tagName) {
        presenceData.state = `Tag: ${tagName}`
      }
      else {
        presenceData.state = 'Viewing a Tag'
      }
    }
    else if (paths[0] === 'about') {
      presenceData.state = 'About Page'
    }
    else if (paths[0] === 'guidelines') {
      presenceData.state = 'Community Guidelines'
    }
    else if (paths[0] === 'search') {
      const query = params.get('q')
      if (query && !privacy) {
        presenceData.state = `Searching: "${query}"`
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = 'Searching'
      }
      else {
        presenceData.state = 'Searching for something...'
        if (!privacy) {
          presenceData.smallImageKey = Assets.Search
          presenceData.smallImageText = 'Searching'
        }
      }
    }
    else if (paths[0] === 'g') {
      if (paths.length === 1)
        presenceData.state = 'Looking at Groups'
      else if (paths.length === 2)
        presenceData.state = `Group: ${decodeURIComponent(paths[1] || '')}`
      else if (paths[2] === 'activity')
        presenceData.state = `Group Activity: ${decodeURIComponent(paths[1] || '')}`
      else if (paths[2] === 'permissions')
        presenceData.state = `Group Permissions: ${decodeURIComponent(paths[1] || '')}`
    }
    else if (paths[0] === 'u') {
      if (paths.length === 1) {
        presenceData.state = 'Viewing User List'
      }
      else {
        const pageUsername = getText('div.username.user-profile-names__primary')
        const username = pageUsername || decodeURIComponent(paths[1] || '')

        if (paths.length === 2 || paths[2] === 'summary') {
          presenceData.state = `User: ${username}`
        }
        else if (paths[2] === 'activity') {
          const sub = paths[3]
          if (sub === 'topics')
            presenceData.state = `Topics Made By: ${username}`
          else if (sub === 'replies')
            presenceData.state = `Replies Made By: ${username}`
          else if (sub === 'likes-given')
            presenceData.state = `Likes Given By: ${username}`
          else if (sub === 'reactions')
            presenceData.state = `Reactions Given By: ${username}`
          else if (sub === 'solved')
            presenceData.state = `Solved Topics By: ${username}`
          else if (sub === 'votes')
            presenceData.state = `Poll Votes By: ${username}`
          else if (sub === 'bookmarks')
            presenceData.state = `Bookmarks`
          else if (sub === 'drafts')
            presenceData.state = `Drafts`
          else if (sub === 'read')
            presenceData.state = `Topics Read`
          else if (sub === 'pending')
            presenceData.state = `Pending Posts`
          else presenceData.state = `All Activity of User: ${username}`
        }
        else if (paths[2] === 'invited') {
          const status = paths[3]
          if (status === 'pending')
            presenceData.state = `Pending Invites`
          else if (status === 'expired')
            presenceData.state = `Expired Invites`
          else if (status === 'redeemed')
            presenceData.state = `Redeemed Invites Made By: ${username}`
          else presenceData.state = `Invites from: ${username}`
        }
        else if (paths[2] === 'badges') {
          presenceData.state = `Badges of User: ${username}`
        }
        else if (paths[2] === 'preferences') {
          presenceData.state = `Preferences`
        }
        else if (paths[2] === 'notifications') {
          presenceData.state = `Notifications`
        }
      }
    }
    else {
      presenceData.state = 'Exploring...'
    }
  }

  // Main Page (https://luduvo.com)
  else {
    presenceData.name = 'Luduvo (Main)'
    if (!paths.length)
      presenceData.state = 'Landing'
    else if (paths[0] === 'tos')
      presenceData.state = 'Terms of Service'
    else if (paths[0] === 'privacy')
      presenceData.state = 'Privacy Policy'
    else if (paths[0] === 'verify-email')
      presenceData.state = 'Verifying Email'
  }

  if (privacy) {
    delete presenceData.state
  }

  if (presenceData.state) {
    presence.setActivity(presenceData)
  }
  else {
    presenceData.state = 'Browsing Privately'
    presence.setActivity(presenceData)
  }
})
