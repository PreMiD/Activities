import { Assets } from 'premid'

const presence = new Presence({
  clientId: '843711390539841577',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/Dsc.gg/assets/logo.jpeg',
    details: 'Viewing 📰 page:',
    state: '🛑 Unsupported',
  }
  const { pathname, href, host } = document.location
  const [showTimestamp, showButtons] = await Promise.all([
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('buttons'),
  ])
  const pages: Record<string, PresenceData> = {
    '/about': {
      details: '📚 About',
      buttons: [{ label: 'View Page', url: href }],
    },
    '/premium': {
      details: '💎 Premium',
      buttons: [{ label: 'View Page', url: href }],
    },
  }

  for (const [path, data] of Object.entries(pages)) {
    if (pathname.includes(path))
      presenceData = { ...presenceData, ...data } as PresenceData
  }

  if (host === 'dsc.gg') {
    if (pathname === '/') {
      presenceData.state = '🏡 Home'
      if (
        document.querySelector('h1.text-5xl')?.textContent === 'Search Results'
      ) {
        presenceData.details = `🔎 Searching for: ${document
          .querySelector('input.py-4')
          ?.getAttribute('searching')}`
        presenceData.state = `${
          document.querySelector('h2.text-lg')?.textContent
        }`
        presenceData.smallImageKey = Assets.Search
      }
    }
    else {
      switch (pathname) {
        case '/dashboard': {
          presenceData.details = 'Viewing ⚙️ dashboard'
          presenceData.state = '🔗 Links'
          if (
            document.querySelector('h1.text-2xl')?.textContent
            === 'Create a new link'
          ) {
            presenceData.details = 'New link creation'
            presenceData.state = `${
              document.querySelector('input.p-2')?.getAttribute('value')
              || 'Loading...'
            }`
          }
          break
        }
        default:
          if (pathname.includes('/dashboard/l/')) {
            const [, link] = pathname.split('/dashboard/l/')
            presenceData.details = `Editing 🔗 ${link?.split('/')[0]} link`
            presenceData.state = `🏓 Tab: ${link?.split('/')[1]}`
            presenceData.buttons = [
              {
                label: 'Visit Link',
                url: `https://dsc.gg/${link?.split('/')[0]}`,
              },
            ]
          }
      }
    }
  }
  else if (host === 'docs.dsc.gg') {
    switch (pathname) {
      case '/': {
        presenceData.details = 'Viewing 📑 Documentation'
        presenceData.state = `🌐 Content: ${
          location.href.includes('#')
            ? location.href.replace('https://docs.dsc.gg/#', ' ')
            : '📧 Introduction'
        }`

        break
      }
      case '/endpoints': {
        presenceData.details = 'Viewing 🔗 endpoints'
        presenceData.state = `🌐 Content: ${
          location.href.includes('#')
            ? location.href.replace('https://docs.dsc.gg/endpoints#', ' ')
            : 'None'
        }`

        break
      }
      case '/widgets': {
        presenceData.details = 'Viewing 🖼️ widgets'
        presenceData.state = `🌐 Content: ${
          location.href.includes('#')
            ? location.href.replace('https://docs.dsc.gg/widgets#', ' ')
            : 'None'
        }`

        break
      }
    }
  }

  if (!showButtons)
    delete presenceData.buttons
  if (showTimestamp)
    presenceData.startTimestamp = browsingTimestamp

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
