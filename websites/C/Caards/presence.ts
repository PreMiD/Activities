import { Assets } from 'premid'

const presence = new Presence({
  clientId: '887975742812590120',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/Caards/assets/logo.png',
    details: 'Viewing unsupported page',
  }
  const { pathname, href, host } = document.location
  const [showTimestamp, showButtons] = await Promise.all([
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('buttons'),
  ])
  const pages: Record<string, PresenceData> = {
    '/popular': {
      details: 'Viewing',
      state: 'Popular caards',
      buttons: [{ label: 'View Popular Caards', url: href }],
    },
    '/feed': { details: 'Viewing feed' },
    '/partners': {
      details: 'Viewing page',
      state: 'Partners',
      buttons: [{ label: 'View Partners', url: href }],
    },
    '/privacy': { details: 'Viewing', state: 'Privacy Policy' },
    '/tos': { details: 'Viewing', state: 'Terms of Service' },
    '/signup': { details: 'Signing up' },
  }

  for (const [path, data] of Object.entries(pages)) {
    if (pathname.includes(path))
      presenceData = { ...presenceData, ...data } as PresenceData
  }

  switch (host) {
    case 'www.caards.me': {
      if (pathname === '/') {
        presenceData.details = 'Viewing home page'
      }
      else if (pathname.includes('/u/')) {
        presenceData.smallImageKey = Assets.Reading
        presenceData.details = 'Viewing profile'
        presenceData.state = `${
          document.querySelector('span.Name.text-3xl')?.textContent ?? 'Unknown'
        }`
        presenceData.buttons = [
          {
            label: 'View Profile',
            url: href,
          },
        ]
      }
      else if (pathname === '/me/settings') {
        presenceData.details = 'Editing Profile'
        presenceData.state = `${
          'Tab:'
          + ` ${document.querySelector('button.B01')?.textContent ?? 'User'}`
        }`
      }
      else if (pathname === '/themes') {
        presenceData.details = 'Viewing page'
        presenceData.state = 'Themes'
        presenceData.buttons = [
          {
            label: 'View Themes',
            url: href,
          },
        ]
      }
      else if (pathname.includes('/t/')) {
        const [, theme] = href.split('/t/')
        presenceData.details = 'Viewing theme'
        presenceData.state = `${theme}`
        presenceData.buttons = [
          {
            label: `View ${theme}`,
            url: href,
          },
        ]
      }
      else {
        switch (pathname) {
          case '/signin': {
            const username = document.querySelector('input')?.value
            presenceData.details = 'Signing In'
            username
              ? (presenceData.state = `To ${username}`)
              : (presenceData.state = 'To Unknown')

            break
          }
        }
      }
      break
    }
    case 'help.caards.me': {
      if (pathname === '/') {
        presenceData.details = 'Viewing help page'
      }
      else if (pathname.includes('/widgets/')) {
        presenceData.details = 'Viewing help info...'
        presenceData.state = `Widget: ${href.split('/widgets/')[1]}`
      }

      break
    }
    case 'status.caards.me': {
      if (pathname === '/')
        presenceData.details = 'Viewing status page'

      break
    }
  }

  if (!showButtons)
    delete presenceData.buttons
  if (showTimestamp)
    presenceData.startTimestamp = browsingTimestamp

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
