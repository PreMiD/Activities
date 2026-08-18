import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '807906479067758632',
})

interface ServerInfo {
  serverName: string
  display: string
}

const INVALID_SERVER_CODES = new Set(['FO', 'TH', 'ME', 'SE', 'AC', 'WH', 'CO'])

function getServerInfo(pathname: string): ServerInfo | null {
  // Must match exact 2-letter segment (e.g. /forum/en/ or /forum/de_2/) and NOT words like /forum/forums/
  const match = pathname.match(/\/forum\/([a-z]{2})(?:_(\d+))?(?=\/|$)/i)
  if (match && match[1]) {
    const code = match[1].toUpperCase()
    if (!INVALID_SERVER_CODES.has(code)) {
      const num = match[2] || '1'
      const serverName = `${code} ${num}`
      const info: ServerInfo = { serverName, display: serverName }

      try {
        localStorage.setItem('gta5grand_server', JSON.stringify(info))
      }
      catch {
        // Ignore storage errors
      }

      return info
    }
  }

  try {
    const cached = localStorage.getItem('gta5grand_server')
    if (cached) {
      return JSON.parse(cached) as ServerInfo
    }
  }
  catch {
    // Ignore storage errors
  }

  return null
}

presence.on('UpdateData', async () => {
  const [privacy, showServer] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showServer'),
  ])

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: 'https://i.ibb.co/rW0b3Dz/512.png',
    name: 'Grand Roleplay Forums',
  }

  const { pathname, search } = document.location

  const serverInfo = getServerInfo(pathname)
  const serverPrefix = (showServer && serverInfo) ? `${serverInfo.display} • ` : ''

  const getPageTitle = (): string | undefined => {
    const el = document.querySelector('.p-title-value') || document.querySelector('h1')
    return el?.textContent?.trim()
  }

  if (privacy) {
    presenceData.details = 'Browsing the forums'
    if (showServer && serverInfo) {
      presenceData.state = `Server: ${serverInfo.display}`
    }
  }
  else if (pathname.includes('/threads/') || search.includes('threads/')) {
    presenceData.details = `${serverPrefix}Viewing a thread`
    const title = getPageTitle()
    if (title)
      presenceData.state = title
  }
  else if (pathname.includes('/forums/') || search.includes('forums/')) {
    presenceData.details = `${serverPrefix}Browsing a forum section`
    const title = getPageTitle()
    if (title)
      presenceData.state = title
  }
  else if (pathname.includes('/members/') || search.includes('members/')) {
    presenceData.details = `${serverPrefix}Viewing a member profile`
    const title = getPageTitle()
    if (title)
      presenceData.state = title
  }
  else if (pathname.includes('/search/') || search.includes('search/')) {
    presenceData.details = `${serverPrefix}Searching the forums`
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Searching'
  }
  else if (pathname.includes('/conversations/') || search.includes('conversations/')) {
    presenceData.details = `${serverPrefix}Viewing direct messages`
  }
  else if (pathname.includes('/whats-new/') || search.includes('whats-new/')) {
    presenceData.details = `${serverPrefix}Viewing latest activity`
  }
  else if (pathname.includes('/account/') || search.includes('account/')) {
    presenceData.details = `${serverPrefix}Managing account settings`
  }
  else {
    presenceData.details = 'Browsing the home page'
    if (showServer && serverInfo) {
      presenceData.state = `Server: ${serverInfo.display}`
    }
  }

  presence.setActivity(presenceData)
})
