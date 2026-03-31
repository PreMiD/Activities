const presence = new Presence({
  clientId: '1488391185008427130',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://images2.imgbox.com/6e/77/ycpeme8m_o.png',
}

let elapsed = browsingTimestamp
let prevPath = ''

presence.on('UpdateData', async () => {
  const [privacy, buttons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
  ])

  const { pathname, hostname } = document.location
  const isDocs = hostname === 'docs.railway.com'
  const isStation = hostname === 'station.railway.com'
  const title = (document.title.split(' | ')[0] ?? document.title).trim()

  if (pathname !== prevPath) {
    prevPath = pathname
    elapsed = Math.floor(Date.now() / 1000)
  }

  const data: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  data.startTimestamp = elapsed

  if (isDocs) {
    data.details = privacy ? 'Reading Railway docs' : `Docs: ${title}`
    if (buttons && !privacy)
      data.buttons = [{ label: 'View Docs', url: document.location.href }]
    presence.setActivity(data)
    return
  }

  if (isStation) {
    if (pathname.startsWith('/questions/')) {
      data.details = privacy ? 'Reading a question' : `Question: ${title}`
      if (buttons && !privacy)
        data.buttons = [{ label: 'View Question', url: document.location.href }]
    }
    else if (pathname.startsWith('/feedback/')) {
      data.details = privacy ? 'Reading feedback' : `Feedback: ${title}`
      if (buttons && !privacy)
        data.buttons = [{ label: 'View Feedback', url: document.location.href }]
    }
    else {
      data.details = 'Browsing Railway Station'
    }
    presence.setActivity(data)
    return
  }

  switch (true) {
    case pathname === '/': {
      data.details = 'Viewing the homepage'
      break
    }
    case pathname === '/dashboard': {
      data.details = 'Browsing their dashboard'
      break
    }
    case pathname === '/new': {
      data.details = 'Creating a new project'
      break
    }
    case pathname === '/pricing': {
      data.details = 'Viewing pricing'
      break
    }
    case pathname.startsWith('/workspace/'): {
      const workspaceTabs: Record<string, string> = {
        'usage': 'Viewing usage & billing',
        'templates': 'Browsing workspace templates',
        'members': 'Viewing team members',
        'settings': 'Viewing workspace settings',
        'general': 'Viewing workspace settings',
        'environments': 'Viewing environments',
        'integrations': 'Viewing integrations',
        'billing': 'Viewing billing',
        'audit-logs': 'Viewing audit logs',
        'referrals': 'Viewing referrals',
      }
      const parts = pathname.split('/').filter(Boolean)
      const tab = workspaceTabs[parts[1] ?? ''] ? parts[1] : parts[2]
      if (tab && workspaceTabs[tab]) {
        data.details = privacy ? 'Browsing workspace' : workspaceTabs[tab]
        const isDeepTemplate = tab === 'templates' && parts.length > (workspaceTabs[parts[1] ?? ''] ? 2 : 3)
        if (isDeepTemplate) {
          data.details = privacy ? 'Viewing a template' : `Viewing template: ${title}`
          if (buttons && !privacy)
            data.buttons = [{ label: 'View Template', url: document.location.href }]
        }
      }
      else {
        data.details = 'Browsing workspace'
      }
      break
    }
    case pathname.startsWith('/account'): {
      data.details = 'Viewing account settings'
      break
    }
    case pathname.startsWith('/project/') && pathname.includes('/service/'): {
      data.details = privacy ? 'Managing a service' : `Service: ${title}`
      if (buttons && !privacy)
        data.buttons = [{ label: 'View Service', url: document.location.href }]
      break
    }
    case pathname.startsWith('/project/'): {
      data.details = privacy ? 'Working on a project' : `Project: ${title}`
      if (buttons && !privacy)
        data.buttons = [{ label: 'View Project', url: document.location.href }]
      break
    }
    default: {
      data.details = 'Browsing Railway'
    }
  }

  presence.setActivity(data)
})
