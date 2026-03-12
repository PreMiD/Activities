import { Assets } from 'premid'

const presence = new Presence({
  clientId: '830504223153717311',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let prevURL: string

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/R/Replit/assets/logo.png',
  CodeLine = 'https://cdn.rcd.gg/PreMiD/websites/R/Replit/assets/0.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { href, hash, pathname } = document.location
  const buttons = await presence.getSetting<boolean>('buttons')
  const title = document
    .querySelector('title')
    ?.textContent
    ?.split('- Replit')?.[0]
  const isReplit = !!document.evaluate(
    '//span[text()=\'Made with\']',
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  )?.singleNodeValue
  || hash.includes('.')
  || document
    .querySelector('[id="__NEXT_DATA__"]')
    ?.textContent
    ?.toLowerCase()
    ?.includes('editor')

  if (!prevURL)
    prevURL = href
  else if (prevURL !== href)
    delete presenceData.startTimestamp

  switch (true) {
    case pathname === '/~':
    case pathname === '/': {
      presenceData.details = 'Viewing the homepage'
      break
    }
    case pathname.startsWith('/@'): {
      if (isReplit) {
        const lineNumbers = document
          .querySelector('.cm-lineNumbers')
          ?.querySelectorAll('.cm-gutterElement')
        const activeLine = document
          .querySelector('.cm-lineNumbers')
          ?.querySelector('.cm-activeLineGutter')
          ?.textContent
        presenceData.details = hash.split('#')?.[1]
          ? `Viewing REPL: ${title} | File: ${hash.split('#')?.[1]}`
          : `Viewing REPL: ${title}`
        presenceData.state = `Created by: ${pathname.split('/')[1]}`
        presenceData.buttons = [{ label: 'View REPL', url: href }]
        if (activeLine || lineNumbers) {
          presenceData.smallImageKey = ActivityAssets.CodeLine
          presenceData.smallImageText = !activeLine && lineNumbers
            ? `Total lines ${
              lineNumbers?.[lineNumbers?.length - 1]?.textContent
            }`
            : `Line ${activeLine} / ${
              lineNumbers?.[lineNumbers?.length - 1]?.textContent
            }`
        }
      }
      else {
        presenceData.details = 'Viewing a user\'s profile'
        presenceData.state = title
        presenceData.buttons = [{ label: 'View Profile', url: href }]
      }
      break
    }
    case pathname === '/notifications': {
      presenceData.details = 'Viewing their notifications'
      break
    }
    case pathname === '/repls': {
      presenceData.details = 'Viewing their repls'
      break
    }
    case pathname === '/my-deployments': {
      presenceData.details = 'Viewing deployments'
      break
    }
    case pathname === '/my-teams': {
      presenceData.details = 'Viewing teams'
      break
    }
    case pathname === '/usage': {
      presenceData.details = 'Viewing usage'
      break
    }
    case pathname.includes('/templates'): {
      const templateSearch = document.querySelector<HTMLInputElement>(
        '[aria-label="Search Templates"]',
      )?.value
      if (!templateSearch) {
        presenceData.details = 'Viewing all templates'
      }
      else {
        presenceData.details = 'Searching templates for:'
        presenceData.state = templateSearch
        presenceData.smallImageKey = Assets.Search
      }
      break
    }
    case pathname.includes('/community'): {
      const communitySearch = document.querySelector<HTMLInputElement>('input[data-rac]')?.value

      if (communitySearch) {
        presenceData.details = 'Searching in the community for:'
        presenceData.state = communitySearch
        presenceData.smallImageKey = Assets.Search
      }
      else {
        presenceData.details = 'Browsing through the community'
      }

      break
    }
    default: {
      presenceData.details = 'Viewing an unsupported page'
    }
  }
  if (!buttons && presenceData.buttons)
    delete presenceData.buttons

  presence.setActivity(presenceData)
})
