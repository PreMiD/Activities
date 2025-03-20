import { Assets } from 'premid'

const presence = new Presence({
  clientId: '887996093189742612',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/WebProfiles/assets/logo.png',
  }

  const { pathname, href } = document.location
  const [showTimestamp, showButtons] = await Promise.all([
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('buttons'),
  ])
  const pages: Record<string, PresenceData> = {
    '/about/team': { details: 'Viewing page...', state: 'Team' },
    '/about/partners': { details: 'Viewing page...', state: 'Partners' },
    '/discover': { details: 'Viewing page...', state: 'Discover' },
    '/@me/settings': { details: 'Editing my profile...' },
    '/login': { details: 'Logging in...' },
    '/register': { details: 'Registering...' },
  }

  for (const [path, data] of Object.entries(pages)) {
    if (pathname.includes(path))
      presenceData = { ...presenceData, ...data } as PresenceData
  }

  if (pathname === '/') {
    presenceData.details = 'Viewing home page'
  }
  else if (pathname.includes('/u/')) {
    presenceData.details = `Viewing user: ${
      document.querySelector('p.text-5xl.text-white')?.textContent ?? 'Unknown'
    }`
    presenceData.state = `${
      document.querySelector('p.mt-3')?.textContent
    } - ❤️ ${document.querySelector('#likes-count')?.textContent || 0}`
    presenceData.buttons = [
      {
        label: 'View Profile',
        url: href,
      },
    ]
  }
  else if (pathname.includes('/search')) {
    presenceData.details = 'Searching for...'
    presenceData.state = href.split('/search/')[1] ?? 'Unknown'
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname === '/@me') {
    presenceData.details = 'Viewing my profile'
    presenceData.buttons = [
      {
        label: 'View profile',
        url: `https://webprofiles.me/u/${
          document.querySelector('a.text-5xl')?.textContent
        }`,
      },
    ]
  }

  if (!showButtons)
    delete presenceData.buttons
  if (showTimestamp)
    presenceData.startTimestamp = browsingTimestamp

  presence.setActivity(presenceData)
})
