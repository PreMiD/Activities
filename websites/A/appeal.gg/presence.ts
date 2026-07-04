const presence = new Presence({
  clientId: '1522240668653846630',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/afTdjN2.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

function getServerId(url: string): string | null {
  const match = url.match(/\/(\d{17,19})(?:[/?#]|$)/)
  return match ? (match[1] ?? null) : null
}

function getServerInfo(): { name: string, icon: string } | null {
  let nameEl = document.querySelector<HTMLElement>('div.content[style*="max-width"]')
  let iconEl = nameEl?.parentElement?.querySelector<HTMLImageElement>('img.icon')

  if (!nameEl || !iconEl) {
    const icons = document.querySelectorAll<HTMLImageElement>('img.icon')
    for (const icon of icons) {
      const possibleName = icon.parentElement?.querySelector<HTMLElement>('.content')
      if (possibleName?.textContent?.trim()) {
        iconEl = icon
        nameEl = possibleName
        break
      }
    }
  }

  const icon = iconEl?.src || ''
  const name = nameEl?.textContent?.trim() || ''

  if (name || icon) {
    return { name: name || 'Unknown Server', icon }
  }

  return null
}

presence.on('UpdateData', async () => {
  const rawUrl = document.location.href
  const hostname = document.location.hostname
  const isDashboard = hostname === 'dashboard.appeal.gg'
  const fullUrl = rawUrl

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  const [showServerInfo, enablePrivacyMode] = await Promise.all([
    presence.getSetting<boolean>('showServerInfo'),
    presence.getSetting<boolean>('enablePrivacyMode'),
  ])
  const serverId = getServerId(rawUrl)

  if (isDashboard && showServerInfo && serverId) {
    const serverInfo = getServerInfo()
    if (serverInfo) {
      if (serverInfo.icon) {
        presenceData.smallImageKey = serverInfo.icon
      }
      presenceData.smallImageText = serverInfo.name
    }
  }

  // 1. SPECIFIC SUB-PATHS
  if (fullUrl.includes('/subscription/plans')) {
    presenceData.details = 'Viewing dashboard'
    presenceData.state = 'Subscription Plans'
  }
  else if (fullUrl.includes('/messages/submission-info')) {
    presenceData.details = 'Viewing dashboard'
    presenceData.state = 'Messages: Submission Info'
  }
  else if (fullUrl.includes('/messages/log-submission-accepted')) {
    presenceData.details = 'Viewing dashboard'
    presenceData.state = 'Messages: Log Submission Accept'
  }
  else if (fullUrl.includes('/messages/log-submission-info')) {
    presenceData.details = 'Viewing dashboard'
    presenceData.state = 'Messages: Log Submission Create'
  }
  else if (fullUrl.includes('/messages/log-submission-rejected')) {
    presenceData.details = 'Viewing dashboard'
    presenceData.state = 'Messages: Log Submission Reject'
  }
  else if (fullUrl.includes('/messages/submission-reply-received')) {
    presenceData.details = 'Viewing dashboard'
    presenceData.state = 'Messages: Reply Received'
  }
  else if (fullUrl.includes('/messages/submission-reply-send-success')) {
    presenceData.details = 'Viewing dashboard'
    presenceData.state = 'Messages: Reply Send Success'
  }
  else if (fullUrl.includes('/messages/submission-reply-sent')) {
    presenceData.details = 'Viewing dashboard'
    presenceData.state = 'Messages: Reply Sent'
  }
  else if (fullUrl.includes('/messages/submission-accepted')) {
    presenceData.details = 'Viewing dashboard'
    presenceData.state = 'Messages: Submission Accepted'
  }
  else if (fullUrl.includes('/messages/submission-rejected')) {
    presenceData.details = 'Viewing dashboard'
    presenceData.state = 'Messages: Submission Rejected'
  }

  // 2. STANDARD MODULES & TABS
  else if (fullUrl.includes('/home')) {
    presenceData.details = 'Viewing dashboard'
    presenceData.state = 'Home'
  }
  else if (fullUrl.includes('/subscription')) {
    presenceData.details = 'Viewing dashboard'
    presenceData.state = 'Plus Subscription'
  }
  else if (fullUrl.includes('/settings')) {
    presenceData.details = 'Viewing dashboard'
    presenceData.state = 'Settings'
  }
  else if (fullUrl.includes('/forms')) {
    presenceData.details = 'Viewing dashboard'
    presenceData.state = 'Forms'
  }
  else if (fullUrl.includes('/messages')) {
    presenceData.details = 'Viewing dashboard'
    presenceData.state = 'Messages'
  }
  else if (fullUrl.includes('/permissions')) {
    presenceData.details = 'Viewing dashboard'
    presenceData.state = 'Permissions'
  }
  else if (fullUrl.includes('/submissions')) {
    presenceData.details = 'Viewing dashboard'
    presenceData.state = 'Submissions'
  }
  else if (fullUrl.includes('/blocked-users')) {
    presenceData.details = 'Viewing dashboard'
    presenceData.state = 'Blocked Users'
  }

  // 3. STATIC PAGES
  else if (fullUrl.includes('/i/pricing')) {
    presenceData.details = 'Viewing page'
    presenceData.state = 'Pricing'
  }
  else if (fullUrl.includes('/i/terms')) {
    presenceData.details = 'Viewing page'
    presenceData.state = 'Terms of Service'
  }
  else if (fullUrl.includes('/i/privacy')) {
    presenceData.details = 'Viewing page'
    presenceData.state = 'Privacy Policy'
  }
  else if (fullUrl.includes('/i/legal-notice')) {
    presenceData.details = 'Viewing page'
    presenceData.state = 'Legal Notice'
  }

  // 4. HOME/ROOT FALLBACKS
  else if (isDashboard) {
    if (serverId) {
      presenceData.details = 'Viewing dashboard'
      presenceData.state = 'Server dashboard'
    }
    else {
      presenceData.details = 'Viewing page'
      presenceData.state = 'Server Selection'
    }
  }
  else if (hostname === 'appeal.gg' && (document.location.pathname === '/' || document.location.pathname.split('/').length === 2)) {
    presenceData.details = 'Viewing page'
    presenceData.state = 'Home'
  }
  else {
    presenceData.details = 'Browsing'
    presenceData.state = 'Unknown page'
  }

  // Privacy Mode Override
  if (enablePrivacyMode) {
    presenceData.details = hostname === 'dashboard.appeal.gg' ? 'Browsing dashboard' : 'Browsing page'
    delete presenceData.state
    delete presenceData.smallImageKey
    delete presenceData.smallImageText
  }

  // Add a timestamp
  presenceData.startTimestamp = browsingTimestamp

  // Set or clear the activity
  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
