import { Assets } from 'premid'

const presence = new Presence({
  clientId: '858308969998974987',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AntiRaid/assets/logo.png',
}

function formatNumber(num: number | string): string {
  const n = typeof num === 'string' ? Number.parseInt(num.replace(/\D/g, ''), 10) : num
  if (Number.isNaN(n))
    return '0'

  return new Intl.NumberFormat('en', { notation: 'compact' }).format(n)
}

function getPageName(pathname: string): string {
  const pageNames: Record<string, string> = {
    '/': 'Home Page',
    '/about': 'About Page',
    '/script/shop': 'Script Shop',
    '/commands': 'Commands Page',
    '/dashboard': 'Dashboard',
    '/dashboard/developers': 'Developer Portal',
    '/dashboard/guilds': 'Server Settings',
    '/blogs': 'Blog',
    '/status': 'System Status',
    '/invite': 'Bot Invite',
  }

  return pageNames[pathname] || pathname
}

presence.on('UpdateData', async () => {
  const { pathname, hostname } = document.location

  const pageName = getPageName(pathname)

  const presenceData: PresenceData = {
    name: 'AntiRaid',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Viewing,
    smallImageText: pageName,
    smallImageUrl: `https://${hostname}${pathname}`,
    state: `👀 Viewing: ${pathname}`,
  }

  switch (true) {
    case pathname === '/script/shop': {
      presenceData.details = 'Shopping for script templates!'
      presenceData.smallImageKey = Assets.Search

      const scriptCards = document.querySelectorAll('[class*="grid"] > div[class*="card"], [class*="grid"] > a[class*="card"]')
      const noScriptsMessage = document.querySelector('h3')?.textContent?.includes('No scripts found')

      if (noScriptsMessage || scriptCards.length === 0) {
        presenceData.state = '📦 No scripts available'
      }
      else {
        presenceData.state = `📦 ${formatNumber(scriptCards.length)} scripts available`
      }
      break
    }

    case pathname === '/commands': {
      presenceData.details = 'Exploring Commands'
      presenceData.smallImageKey = Assets.Search

      const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="command"]')
      const searchQuery = searchInput?.value?.trim()

      const selectedModule = document.querySelector('aside button.bg-primary span')?.textContent?.trim()

      const commandCountText = document.querySelector('p[class*="tracking"]')?.textContent
      const commandCount = commandCountText?.match(/\d+/)?.[0]

      if (searchQuery) {
        presenceData.state = `🔍 Searching: "${searchQuery}"`
      }
      else if (selectedModule) {
        presenceData.state = `📂 ${selectedModule}${commandCount ? ` • ${formatNumber(commandCount)} commands` : ''}`
      }
      else if (commandCount) {
        presenceData.state = `📋 Browsing ${formatNumber(commandCount)} commands`
      }
      else {
        presenceData.state = '📋 Browsing commands'
      }
      break
    }

    case pathname === '/dashboard': {
      presenceData.name = 'AntiRaid Dashboard'
      presenceData.details = 'Managing Servers'
      presenceData.smallImageKey = Assets.Viewing

      const tabButtons = document.querySelectorAll('button.text-primary, button.text-muted-foreground')
      let managedCount = '0'
      let yourCount = '0'
      let activeTab = 'Managed Servers'

      tabButtons.forEach((btn) => {
        const text = btn.textContent || ''
        const match = /^[^()]+\((\d+)\)$/.exec(text.trim())
        if (match?.[1]) {
          if (text.includes('Managed')) {
            managedCount = match[1]
            if (btn.classList.contains('text-primary'))
              activeTab = 'Managed Servers'
          }
          else if (text.includes('Your')) {
            yourCount = match[1]
            if (btn.classList.contains('text-primary'))
              activeTab = 'Your Servers'
          }
        }
      })

      const serverSearchInput = document.querySelector<HTMLInputElement>('input[placeholder*="server"]')
      const serverSearchQuery = serverSearchInput?.value?.trim()

      if (serverSearchQuery) {
        presenceData.state = `🔍 Searching: "${serverSearchQuery}"`
      }
      else {
        presenceData.state = `📂 ${activeTab} • ${formatNumber(activeTab === 'Managed Servers' ? managedCount : yourCount)} servers`
      }
      break
    }

    case pathname === '/dashboard/developers': {
      presenceData.name = 'AntiRaid Dashboard'
      presenceData.details = 'Managing Sessions & API Keys'
      presenceData.smallImageKey = Assets.Writing

      const statCards = document.querySelectorAll('[class*="bg-card"] p.text-2xl')
      const sessionCount = statCards[0]?.textContent?.trim() || '0'
      const tokenCount = statCards[1]?.textContent?.trim() || '0'

      presenceData.state = `🔑 ${formatNumber(sessionCount)} sessions • 🎫 ${formatNumber(tokenCount)} tokens`
      break
    }

    case pathname === '/dashboard/guilds': {
      presenceData.name = 'AntiRaid Dashboard'
      presenceData.smallImageKey = Assets.Writing

      const serverName = document.querySelector('.sticky span.text-base.font-bold')?.textContent?.trim()

      if (serverName) {
        presenceData.details = `Managing: ${serverName}`
      }
      else {
        presenceData.details = 'Managing Server Settings'
      }

      const expandedSection = document.querySelector('button[aria-expanded="true"] h2')?.textContent?.trim()

      if (expandedSection) {
        presenceData.state = `⚙️ Configuring: ${expandedSection}`
      }
      else {
        presenceData.state = '⚙️ Viewing settings'
      }
      break
    }

    case pathname === '/blogs': {
      presenceData.details = 'Reading the Blog'
      presenceData.smallImageKey = Assets.Reading

      const blogSearchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Search articles"]')
      const blogSearchQuery = blogSearchInput?.value?.trim()

      const articleCards = document.querySelectorAll('a[href^="/blogs/"]')
      const articleCount = articleCards.length

      if (blogSearchQuery) {
        presenceData.state = `🔍 Searching: "${blogSearchQuery}"`
      }
      else if (articleCount > 0) {
        presenceData.state = `📰 Browsing ${formatNumber(articleCount)} articles`
      }
      else {
        presenceData.state = '📰 Browsing articles'
      }
      break
    }

    case pathname.startsWith('/blogs/'): {
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Reading Article'

      const articleTitle = document.querySelector('h1.font-monster span')?.textContent?.trim()

      if (articleTitle) {
        presenceData.details = articleTitle.length > 50
          ? `${articleTitle.substring(0, 47)}...`
          : articleTitle
      }
      else {
        presenceData.details = 'Reading an Article'
      }

      const authorName = document.querySelector('header .text-foreground.font-bold')?.textContent?.trim()

      const readTimeText = document.querySelector('header .lucide-clock')?.parentElement?.textContent?.trim()

      if (authorName && readTimeText) {
        presenceData.state = `✍️ By ${authorName} • ${readTimeText}`
      }
      else if (authorName) {
        presenceData.state = `✍️ By ${authorName}`
      }
      else {
        presenceData.state = '📖 Reading...'
      }
      break
    }

    case pathname === '/status': {
      presenceData.details = 'Checking System Status'
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'System Status'

      const statusCards = document.querySelectorAll('.grid > div.group .font-monster')
      let guildCount = ''
      let userCount = ''
      let pingMs = ''

      statusCards.forEach((card) => {
        const text = card.textContent?.trim() || ''
        const label = card.parentElement?.querySelector('p.text-\\[10px\\]')?.textContent?.trim() || ''

        if (label.includes('Network Reach')) {
          guildCount = text.replace(/\D/g, '')
        }
        else if (label.includes('Total Users')) {
          userCount = text.replace(/\D/g, '')
        }
        else if (label.includes('Core Ping')) {
          pingMs = text.replace(/\D/g, '')
        }
      })

      if (guildCount && userCount) {
        presenceData.state = `🌐 ${formatNumber(guildCount)} guilds • 👥 ${formatNumber(userCount)} users`
      }
      else if (pingMs) {
        presenceData.state = `📡 Ping: ${pingMs}ms`
      }
      else {
        presenceData.state = '📊 Viewing system health'
      }
      break
    }

    case pathname === '/invite': {
      presenceData.details = 'Inviting AntiRaid'
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Bot Invite'
      presenceData.state = '🤖 Adding bot to server'
      break
    }

    default: {
      presenceData.details = 'Exploring AntiRaid'
      presenceData.smallImageKey = Assets.Viewing
      const pageTitle = document.querySelector('h1')?.textContent?.trim()
        || document.title?.replace(' | AntiRaid', '').replace(' - AntiRaid', '').trim()

      if (pageTitle && pageTitle.length > 0 && pageTitle !== 'AntiRaid') {
        presenceData.state = `📄 ${pageTitle.length > 40 ? `${pageTitle.substring(0, 37)}...` : pageTitle}`
      }
      else {
        presenceData.state = `👀 Viewing: ${pathname}`
      }
      break
    }
  }

  presence.setActivity(presenceData)
})
