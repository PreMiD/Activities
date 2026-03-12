import { Assets } from 'premid'

const presence = new Presence({
  clientId: '889524311566725161',
})
const browsingTimestamp = Date.now()

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/padlet/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const pathnames = location.pathname.split('/')

  if (pathnames[1] === 'dashboard') {
    // Dashboard
    let type, count

    switch (pathnames[2]) {
      case 'drive':
        presenceData.details = 'Viewing'
        presenceData.state = 'Padlet Drive'
        break
      case null:
        type = document
          .querySelector(
            'body > div > div > div > div > nav > a[data-selected="true"]',
          )
          ?.textContent
          ?.replace('edit', '')
        count = document.querySelector('.padlet-cards-list')?.children.length

        presenceData.details = `Viewing ${type}`
        presenceData.state = `Padlets - ${count ?? '0'}`
        break

      default:
        presenceData.details = 'Viewing their'
        presenceData.state = 'Dashboard'
        break
    }

    if (document.querySelector('.universal-search[data-status="expanded"]')) {
      presenceData.details = `Searching: ${
        (document.querySelector('.universal-search-input') as HTMLInputElement)
          .value
      }`
      presenceData.state = `${
        document.querySelector('.padlet-cards-list')?.children.length
      } Results`
    }
  }
  else if (pathnames[1] === 'create') {
    // Creating a Padlet

    presenceData.details = 'Creating a Padlet'
    presenceData.state = 'Choosing a template'

    presenceData.smallImageKey = Assets.Writing
    presenceData.smallImageText = 'Creating'
  }
  else if (document.querySelector('#wall-container')) {
    // Padlet
    const padletData = JSON.parse(
      document.querySelector('head > script[type="application/ld+json"]')
        ?.textContent ?? '{}',
    )

    presenceData.details = padletData.name
    presenceData.state = `By: ${padletData.author.name}`
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Reading'

    presenceData.buttons = [
      { label: 'View Padlet', url: padletData.url },
      { label: 'View Author', url: padletData.author.url },
    ]
  }
  else if (document.querySelector('.header-user-info')) {
    // Author
    const padletData = JSON.parse(
      document.querySelector('head > script[type="application/ld+json"]')
        ?.textContent ?? '{}',
    )

    presenceData.details = `Viewing ${padletData.name}`

    presenceData.state = document.querySelector('.header-user-bio')?.textContent

    presenceData.buttons = [
      { label: 'View Author', url: `https://padlet.com/${padletData.url}` },
    ]
  }

  const showButtons = await presence.getSetting<boolean>('buttons')

  if (!showButtons)
    delete presenceData.buttons

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
