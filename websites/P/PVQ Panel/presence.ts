const presence = new Presence({
  clientId: '1509262800776728726',
})

const startTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://pv-q.de/favicons/pvq-icon-maskable-512x512.png',
}

async function getStrings() {
  return presence.getStrings({
    viewingConsole: 'pvqpanel.viewing_console',
    editingFiles: 'pvqpanel.editing_files',
    managingFiles: 'pvqpanel.managing_files',
    managingDatabases: 'pvqpanel.managing_databases',
    managingBackups: 'pvqpanel.managing_backups',
    installingPlugins: 'pvqpanel.installing_plugins',
    browsingModpacks: 'pvqpanel.browsing_modpacks',
    managingPlayers: 'pvqpanel.managing_players',
    managingBedrockAddons: 'pvqpanel.managing_bedrock_addons',
    configuringServer: 'pvqpanel.configuring_server',
    changingServerVersion: 'pvqpanel.changing_server_version',
    configuringBedrock: 'pvqpanel.configuring_bedrock',
    managingPorts: 'pvqpanel.managing_ports',
    configuringProxy: 'pvqpanel.configuring_proxy',
    configuringSubdomains: 'pvqpanel.configuring_subdomains',
    editingSchedules: 'pvqpanel.editing_schedules',
    managingSchedules: 'pvqpanel.managing_schedules',
    managingUsers: 'pvqpanel.managing_users',
    configuringStartup: 'pvqpanel.configuring_startup',
    managingSettings: 'pvqpanel.managing_settings',
    viewingStatistics: 'pvqpanel.viewing_statistics',
    viewingActivityLogs: 'pvqpanel.viewing_activity_logs',
    managingPicoClaw: 'pvqpanel.managing_picoclaw',
    inPanel: 'pvqpanel.in_panel',
    managingNode: 'pvqpanel.managing_node',
    configuringFirewall: 'pvqpanel.configuring_firewall',
    viewingSystemLogs: 'pvqpanel.viewing_system_logs',
    managingNodeUsers: 'pvqpanel.managing_node_users',
    managingApiKeys: 'pvqpanel.managing_api_keys',
    inBotOverview: 'pvqpanel.in_bot_overview',
    trainingKnowledgebase: 'pvqpanel.training_knowledgebase',
    managingBlacklist: 'pvqpanel.managing_blacklist',
    configuringChannels: 'pvqpanel.configuring_channels',
    editingBotProfile: 'pvqpanel.editing_bot_profile',
    viewingBotLogs: 'pvqpanel.viewing_bot_logs',
    managingBotAccess: 'pvqpanel.managing_bot_access',
    viewingBotActivity: 'pvqpanel.viewing_bot_activity',
    managingBotMemory: 'pvqpanel.managing_bot_memory',
    configuringBot: 'pvqpanel.configuring_bot',
    managingBot: 'pvqpanel.managing_bot',
    viewingAccountLogs: 'pvqpanel.viewing_account_logs',
    managingSnippets: 'pvqpanel.managing_snippets',
    inGdprExport: 'pvqpanel.in_gdpr_export',
    managingAccount: 'pvqpanel.managing_account',
    dashboard: 'pvqpanel.dashboard',
    discordBot: 'pvqpanel.discord_bot',
    nodeManager: 'pvqpanel.node_manager',
    server: 'pvqpanel.server',
    buttonOpenPanel: 'pvqpanel.button_open_panel',
    managingServers: 'pvqpanel.managing_servers',
  })
}

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

function getServerStatus(): string | null {
  const label = document.querySelector<HTMLElement>('div[role="img"][aria-label]')
    ?.getAttribute('aria-label')
  if (!label)
    return null
  return label.replace(/^Server\s+/i, '')
}

function getNodeServerCount(): number {
  const container = document.querySelector('.server-list-container')
  if (!container)
    return 0
  return container.children.length
}

function getServerAction(subPath: string, strings: any): string {
  if (subPath === '/' || subPath === '')
    return strings.viewingConsole
  if (subPath.startsWith('/files/edit') || subPath.startsWith('/files/new'))
    return strings.editingFiles
  if (subPath.startsWith('/files'))
    return strings.managingFiles
  if (subPath.startsWith('/databases'))
    return strings.managingDatabases
  if (subPath.startsWith('/backups'))
    return strings.managingBackups
  if (subPath.startsWith('/minecraft-plugins'))
    return strings.installingPlugins
  if (subPath.startsWith('/modpacks'))
    return strings.browsingModpacks
  if (subPath.startsWith('/players'))
    return strings.managingPlayers
  if (subPath.startsWith('/minecraft/bedrock-addons'))
    return strings.managingBedrockAddons
  if (subPath.startsWith('/minecraft/properties'))
    return strings.configuringServer
  if (subPath.startsWith('/minecraft/versions'))
    return strings.changingServerVersion
  if (subPath.startsWith('/bedrock-support'))
    return strings.configuringBedrock
  if (subPath.startsWith('/network'))
    return strings.managingPorts
  if (subPath.startsWith('/proxy'))
    return strings.configuringProxy
  if (subPath.startsWith('/subdomain'))
    return strings.configuringSubdomains
  if (subPath.startsWith('/schedules/') && subPath.length > '/schedules/'.length)
    return strings.editingSchedules
  if (subPath.startsWith('/schedules'))
    return strings.managingSchedules
  if (subPath.startsWith('/users'))
    return strings.managingUsers
  if (subPath.startsWith('/startup'))
    return strings.configuringStartup
  if (subPath.startsWith('/settings'))
    return strings.managingSettings
  if (subPath.startsWith('/Statistics'))
    return strings.viewingStatistics
  if (subPath.startsWith('/activity'))
    return strings.viewingActivityLogs
  if (subPath.startsWith('/picoclaw'))
    return strings.managingPicoClaw
  return strings.inPanel
}

function getNodeAction(subPath: string, strings: any): string {
  if (subPath === '/' || subPath === '') {
    const count = getNodeServerCount()
    return count > 0 ? `${strings.managingServers} (${count})` : strings.managingNode
  }
  if (subPath.startsWith('/firewall'))
    return strings.configuringFirewall
  if (subPath.startsWith('/system-logs'))
    return strings.viewingSystemLogs
  if (subPath.startsWith('/node-users'))
    return strings.managingNodeUsers
  if (subPath.startsWith('/api-control'))
    return strings.managingApiKeys
  return strings.managingNode
}

function getBotAction(subPath: string, strings: any): string {
  if (subPath === '/' || subPath === '')
    return strings.inBotOverview
  if (subPath.startsWith('/knowledge'))
    return strings.trainingKnowledgebase
  if (subPath.startsWith('/blacklist'))
    return strings.managingBlacklist
  if (subPath.startsWith('/channels'))
    return strings.configuringChannels
  if (subPath.startsWith('/profile'))
    return strings.editingBotProfile
  if (subPath.startsWith('/logs'))
    return strings.viewingBotLogs
  if (subPath.startsWith('/access'))
    return strings.managingBotAccess
  if (subPath.startsWith('/activity'))
    return strings.viewingBotActivity
  if (subPath.startsWith('/memory'))
    return strings.managingBotMemory
  if (subPath.startsWith('/settings'))
    return strings.configuringBot
  return strings.managingBot
}

function getAccountAction(pathname: string, strings: any): string {
  if (pathname.includes('/activity'))
    return strings.viewingAccountLogs
  if (pathname.includes('/snippets'))
    return strings.managingSnippets
  if (pathname.includes('/data-export'))
    return strings.inGdprExport
  return strings.managingAccount
}

function getResources(): string | null {
  try {
    const spans = Array.from(document.querySelectorAll('span'))
    const cpuSpan = spans.find(s => s.textContent?.match(/CPU.+(usage|auslastung)/i))
    const ramSpan = spans.find(s => s.textContent?.match(/RAM.+(usage|auslastung)/i))

    if (cpuSpan && ramSpan) {
      const c = cpuSpan.parentElement?.textContent?.replace(cpuSpan.textContent || '', '')?.trim() || ''
      const r = ramSpan.parentElement?.textContent?.replace(ramSpan.textContent || '', '')?.trim() || ''

      const cpu = c.split('/')[0]?.trim()
      const ram = r.split('/')[0]?.trim()

      if (cpu && ram) {
        if (cpu.toLowerCase() === 'offline')
          return 'Offline'
        return `CPU: ${cpu} | RAM: ${ram}`
      }
    }
  }
  catch (e) {
    console.error(e)
  }
  return null
}

function getAccountName(): string | null {
  try {
    const w = (window as any).wrappedJSObject || window
    if (w.PterodactylUser && w.PterodactylUser.username) {
      return w.PterodactylUser.username
    }
  }
  catch (e) {}
  return null
}

presence.on('UpdateData', async () => {
  try {
    const strings = await getStrings()
    const presenceData: any = {
      largeImageKey: ActivityAssets.Logo,
      buttons: [{ label: strings.buttonOpenPanel, url: 'https://pv-q.de/auth/login' }],
    }

    const [showServerName, showStatus, showElapsedTime, showAccountName, showResources] = await Promise.all([
      presence.getSetting<boolean>('showServerName'),
      presence.getSetting<boolean>('showStatus'),
      presence.getSetting<boolean>('showElapsedTime'),
      presence.getSetting<boolean>('showAccountName'),
      presence.getSetting<boolean>('showResources'),
    ])

    if (showElapsedTime) {
      presenceData.startTimestamp = startTimestamp
    }

    const accountName = showAccountName ? getAccountName() : null;
    const usernamePrefix = accountName ? `[${accountName}] ` : '';

    const { pathname } = document.location

    const serverMatch = pathname.match(/^\/server\/[a-f0-9-]+(\/.*)?$/i)

    if (serverMatch) {
      const subPath = serverMatch[1] || '/'
      const serverName = getServerName()

      if (isBotPath(subPath)) {
        presenceData.details = showServerName && serverName
          ? `${usernamePrefix}${strings.discordBot}: ${truncate(serverName, 40)}`
          : `${usernamePrefix}${strings.discordBot}`
        presenceData.state = getBotAction(subPath, strings)
      }
      else if (isNodeManagerPath(subPath) || (serverName !== null && isNodeServer(serverName))) {
        presenceData.details = showServerName && serverName
          ? `${usernamePrefix}${strings.nodeManager}: ${truncate(serverName, 40)}`
          : `${usernamePrefix}${strings.nodeManager}`
        presenceData.state = getNodeAction(subPath, strings)
      }
      else {
        let details = showServerName && serverName
          ? `${usernamePrefix}${strings.server}: ${truncate(serverName, 40)}`
          : `${usernamePrefix}${strings.server}`

        if (showStatus && showServerName) {
          const status = getServerStatus()
          if (status)
            details += ` · ${status}`
        }

        presenceData.details = details
        
        const resources = showResources ? getResources() : null;
        if (resources) {
          presenceData.state = `${getServerAction(subPath, strings)} (${resources})`
        } else {
          presenceData.state = getServerAction(subPath, strings)
        }
      }
    }
    else if (pathname.startsWith('/account')) {
      if (accountName) {
        presenceData.details = `Account: ${accountName}`
      } else {
        delete presenceData.details
      }
      presenceData.state = getAccountAction(pathname, strings)
    }
    else {
      if (accountName) {
        presenceData.details = `Account: ${accountName}`
      } else {
        delete presenceData.details
      }
      presenceData.state = strings.dashboard
    }

    presence.setActivity(presenceData)
  } catch (error) {
    console.error('PreMiD PVQ Panel Error:', error)
  }
})
