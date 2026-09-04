const presence = new Presence({ clientId: '1509262800776728726' })
const startTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://pv-q.de/favicons/pvq-icon-maskable-512x512.png',
}

// Liest Server-Namen aus PVQ Panel Sidebar DOM.
// Regulärer Server: <span class="font-semibold text-lg text-gray-50 truncate" title="ServerName">
// Node-Server: zwei Spans — "Node 555" + "Germany 1" → "Node 555 - Germany 1"
function getServerName(): string | null {
  const regularSpan = document.querySelector<HTMLSpanElement>(
    'span.font-semibold.text-lg.text-gray-50.truncate[title]',
  )
  if (regularSpan) {
    const name = regularSpan.getAttribute('title')?.trim()
    if (name)
      return name
  }

  const nodeLabel = document.querySelector<HTMLSpanElement>(
    'span.text-2xl.font-extrabold.text-gray-50',
  )?.textContent?.trim()
  const nodeDesc = document.querySelector<HTMLSpanElement>(
    'span.text-md.text-gray-300',
  )?.textContent?.trim()

  if (nodeLabel && nodeDesc)
    return `${nodeLabel} - ${nodeDesc}`
  if (nodeLabel)
    return nodeLabel

  return null
}

function isNodeServer(name: string): boolean {
  return /^Node \d+ - .+$/.test(name)
}

// Kürzt lange Server-/Node-Namen für die kompakte Discord-Anzeige.
function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}

function isBotPath(subPath: string): boolean {
  return ['/knowledge', '/blacklist', '/channels', '/profile', '/access', '/memory'].some(
    p => subPath.startsWith(p),
  )
}

function isNodeManagerPath(subPath: string): boolean {
  return ['/firewall', '/system-logs', '/node-users', '/api-control'].some(
    p => subPath.startsWith(p),
  )
}

// Liest Server-Status aus aria-label des ServerStatusBadge DOM-Elements.
// ServerStatusBadge rendert: <div role="img" aria-label="Online|Offline|...">
// Panel-Texte sind z.B. "Server läuft" — "Server "-Präfix entfernt, da details
// bereits mit "Server: <Name>" beginnt (sonst "Server: X · Server läuft").
function getServerStatus(): string | null {
  const label = document.querySelector<HTMLElement>('div[role="img"][aria-label]')
    ?.getAttribute('aria-label')
  if (!label)
    return null
  return label.replace(/^Server\s+/i, '')
}

// Zählt Server-Rows im Node-Manager-Dashboard.
// ServerSplitterContainer: <div class="server-list-container"> → Kinder sind motion.div je Server
function getNodeServerCount(): number {
  const container = document.querySelector('.server-list-container')
  if (!container)
    return 0
  return container.children.length
}

function getServerAction(subPath: string): string {
  if (subPath === '/' || subPath === '')
    return 'Viewing Console'
  if (subPath.startsWith('/files/edit') || subPath.startsWith('/files/new'))
    return 'Editing Files'
  if (subPath.startsWith('/files'))
    return 'Managing Files'
  if (subPath.startsWith('/databases'))
    return 'Managing Databases'
  if (subPath.startsWith('/backups'))
    return 'Managing Backups'
  if (subPath.startsWith('/minecraft-plugins'))
    return 'Installing Plugins'
  if (subPath.startsWith('/modpacks'))
    return 'Browsing Modpacks'
  if (subPath.startsWith('/players'))
    return 'Managing Players'
  if (subPath.startsWith('/minecraft/bedrock-addons'))
    return 'Managing Bedrock Addons'
  if (subPath.startsWith('/minecraft/properties'))
    return 'Configuring Server'
  if (subPath.startsWith('/minecraft/versions'))
    return 'Changing Server Version'
  if (subPath.startsWith('/bedrock-support'))
    return 'Configuring Bedrock'
  if (subPath.startsWith('/network'))
    return 'Managing Ports'
  if (subPath.startsWith('/proxy'))
    return 'Configuring Proxy'
  if (subPath.startsWith('/subdomain'))
    return 'Configuring Subdomains'
  if (subPath.startsWith('/schedules/') && subPath.length > '/schedules/'.length)
    return 'Editing Schedules'
  if (subPath.startsWith('/schedules'))
    return 'Managing Schedules'
  if (subPath.startsWith('/users'))
    return 'Managing Users'
  if (subPath.startsWith('/startup'))
    return 'Configuring Startup'
  if (subPath.startsWith('/settings'))
    return 'Managing Settings'
  if (subPath.startsWith('/Statistics'))
    return 'Viewing Statistics'
  if (subPath.startsWith('/activity'))
    return 'Viewing Activity Logs'
  if (subPath.startsWith('/picoclaw'))
    return 'Managing PicoClaw'
  return 'In Panel'
}

function getNodeAction(subPath: string): string {
  if (subPath === '/' || subPath === '') {
    const count = getNodeServerCount()
    return count > 0 ? `Managing ${count} Servers` : 'Managing Node'
  }
  if (subPath.startsWith('/firewall'))
    return 'Configuring Firewall'
  if (subPath.startsWith('/system-logs'))
    return 'Viewing System Logs'
  if (subPath.startsWith('/node-users'))
    return 'Managing Node Users'
  if (subPath.startsWith('/api-control'))
    return 'Managing API Keys'
  return 'Managing Node'
}

function getBotAction(subPath: string): string {
  if (subPath === '/' || subPath === '')
    return 'In Bot Overview'
  if (subPath.startsWith('/knowledge'))
    return 'Training Knowledgebase'
  if (subPath.startsWith('/blacklist'))
    return 'Managing Blacklist'
  if (subPath.startsWith('/channels'))
    return 'Configuring Channels'
  if (subPath.startsWith('/profile'))
    return 'Editing Bot Profile'
  if (subPath.startsWith('/logs'))
    return 'Viewing Bot Logs'
  if (subPath.startsWith('/access'))
    return 'Managing Bot Access'
  if (subPath.startsWith('/activity'))
    return 'Viewing Bot Activity'
  if (subPath.startsWith('/memory'))
    return 'Managing Bot Memory'
  if (subPath.startsWith('/settings'))
    return 'Configuring Bot'
  return 'Managing Bot'
}

function getAccountAction(pathname: string): string {
  if (pathname.includes('/activity'))
    return 'Viewing Account Logs'
  if (pathname.includes('/snippets'))
    return 'Managing Snippets'
  if (pathname.includes('/data-export'))
    return 'In GDPR Export'
  return 'Managing Account'
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    buttons: [{ label: 'PVQ Panel öffnen', url: 'https://pv-q.de/auth/login' }],
  }

  const [showServerName, showStatus, showElapsedTime] = await Promise.all([
    presence.getSetting<boolean>('showServerName'),
    presence.getSetting<boolean>('showStatus'),
    presence.getSetting<boolean>('showElapsedTime'),
  ])

  if (showElapsedTime) {
    presenceData.startTimestamp = startTimestamp
  }

  const { pathname } = document.location

  const serverMatch = pathname.match(/^\/server\/[a-f0-9-]+(\/.*)?$/i)

  if (serverMatch) {
    const subPath = serverMatch[1] || '/'
    const serverName = getServerName()

    if (isBotPath(subPath)) {
      presenceData.details = showServerName && serverName
        ? `Discord Bot: ${truncate(serverName, 40)}`
        : 'Discord Bot'
      presenceData.state = getBotAction(subPath)
    }
    else if (isNodeManagerPath(subPath) || (serverName !== null && isNodeServer(serverName))) {
      presenceData.details = showServerName && serverName
        ? `Node Manager: ${truncate(serverName, 40)}`
        : 'Node Manager'
      presenceData.state = getNodeAction(subPath)
    }
    else {
      let details = showServerName && serverName
        ? `Server: ${truncate(serverName, 40)}`
        : 'Server'

      if (showStatus && showServerName) {
        const status = getServerStatus()
        if (status)
          details += ` · ${status}`
      }

      presenceData.details = details
      presenceData.state = getServerAction(subPath)
    }
  }
  else if (pathname.startsWith('/account')) {
    presenceData.details = 'PVQ Panel'
    presenceData.state = getAccountAction(pathname)
  }
  else {
    presenceData.details = 'PVQ Panel'
    presenceData.state = 'Dashboard'
  }

  presence.setActivity(presenceData)
})
