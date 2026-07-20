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
function getServerStatus(): string | null {
  return (
    document.querySelector<HTMLElement>('div[role="img"][aria-label]')
      ?.getAttribute('aria-label') ?? null
  )
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
    return 'Verwaltet Konsole'
  if (subPath.startsWith('/files/edit') || subPath.startsWith('/files/new'))
    return 'Bearbeitet Dateien'
  if (subPath.startsWith('/files'))
    return 'Verwaltet Dateien'
  if (subPath.startsWith('/databases'))
    return 'Verwaltet Datenbanken'
  if (subPath.startsWith('/backups'))
    return 'Verwaltet Backups'
  if (subPath.startsWith('/minecraft-plugins'))
    return 'Installiert Plugins'
  if (subPath.startsWith('/modpacks'))
    return 'Durchsucht Modpacks'
  if (subPath.startsWith('/players'))
    return 'Verwaltet Spieler'
  if (subPath.startsWith('/minecraft/bedrock-addons'))
    return 'Verwaltet Bedrock-Addons'
  if (subPath.startsWith('/minecraft/properties'))
    return 'Bearbeitet Server-Einstellungen'
  if (subPath.startsWith('/minecraft/versions'))
    return 'Wechselt Server-Version'
  if (subPath.startsWith('/bedrock-support'))
    return 'Konfiguriert Bedrock'
  if (subPath.startsWith('/network'))
    return 'Verwaltet Port-Freigaben'
  if (subPath.startsWith('/proxy'))
    return 'Konfiguriert Proxy'
  if (subPath.startsWith('/subdomain'))
    return 'Konfiguriert Subdomains'
  if (subPath.startsWith('/schedules/') && subPath.length > '/schedules/'.length)
    return 'Bearbeitet Automatisierung'
  if (subPath.startsWith('/schedules'))
    return 'Verwaltet Automatisierungen'
  if (subPath.startsWith('/users'))
    return 'Verwaltet Zugänge'
  if (subPath.startsWith('/startup'))
    return 'Konfiguriert Startup'
  if (subPath.startsWith('/settings'))
    return 'Verwaltet Einstellungen'
  if (subPath.startsWith('/Statistics'))
    return 'Analysiert Statistiken'
  if (subPath.startsWith('/activity'))
    return 'Prüft Aktivitätslogs'
  if (subPath.startsWith('/picoclaw'))
    return 'Verwaltet PicoClaw'
  return 'Im Panel'
}

function getNodeAction(subPath: string): string {
  if (subPath === '/' || subPath === '') {
    const count = getNodeServerCount()
    return count > 0 ? `Verwaltet ${count} Server` : 'Verwaltet Node'
  }
  if (subPath.startsWith('/firewall'))
    return 'Konfiguriert Firewall'
  if (subPath.startsWith('/system-logs'))
    return 'Liest System-Logs'
  if (subPath.startsWith('/node-users'))
    return 'Verwaltet Node-Nutzer'
  if (subPath.startsWith('/api-control'))
    return 'Verwaltet API-Keys'
  return 'Verwaltet Node'
}

function getBotAction(subPath: string): string {
  if (subPath === '/' || subPath === '')
    return 'Bot-Übersicht'
  if (subPath.startsWith('/knowledge'))
    return 'Trainiert Wissensdatenbank'
  if (subPath.startsWith('/blacklist'))
    return 'Verwaltet Blacklist'
  if (subPath.startsWith('/channels'))
    return 'Konfiguriert Kanäle'
  if (subPath.startsWith('/profile'))
    return 'Bearbeitet Bot-Profil'
  if (subPath.startsWith('/logs'))
    return 'Liest Bot-Logs'
  if (subPath.startsWith('/access'))
    return 'Verwaltet Bot-Zugang'
  if (subPath.startsWith('/activity'))
    return 'Prüft Bot-Aktivität'
  if (subPath.startsWith('/memory'))
    return 'Verwaltet Bot-Memory'
  if (subPath.startsWith('/settings'))
    return 'Bot-Einstellungen'
  return 'Verwaltet Bot'
}

function getAccountAction(pathname: string): string {
  if (pathname.includes('/activity'))
    return 'Account-Aktivität'
  if (pathname.includes('/snippets'))
    return 'Command Snippets'
  if (pathname.includes('/data-export'))
    return 'DSGVO-Datenauskunft'
  return 'Account-Einstellungen'
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    buttons: [{ label: 'PVQ Panel öffnen', url: 'https://pv-q.de/auth/login' }],
  }

  const showServerName = await presence.getSetting<boolean>('showServerName')
  const showStatus = await presence.getSetting<boolean>('showStatus')
  const showElapsedTime = await presence.getSetting<boolean>('showElapsedTime')

  if (showElapsedTime) {
    presenceData.startTimestamp = startTimestamp
  }

  const { pathname } = document.location

  const serverMatch = pathname.match(/^\/server\/([a-f0-9-]+)(\/.*)?$/i)

  if (serverMatch) {
    const subPath = serverMatch[2] || '/'
    const serverName = getServerName()

    if (isBotPath(subPath)) {
      presenceData.details = showServerName && serverName
        ? `Discord Bot: ${serverName}`
        : 'Discord Bot'
      presenceData.state = getBotAction(subPath)
    }
    else if (isNodeManagerPath(subPath) || (serverName !== null && isNodeServer(serverName))) {
      presenceData.details = showServerName && serverName
        ? `Node Manager: ${serverName}`
        : 'Node Manager'
      presenceData.state = getNodeAction(subPath)
    }
    else {
      let details = showServerName && serverName
        ? `Server: ${serverName}`
        : 'Server verwalten'

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
