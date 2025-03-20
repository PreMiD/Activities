import { Assets } from 'premid'

const presence = new Presence({
  clientId: '614583717951963137', // CLIENT ID FOR YOUR PRESENCE
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Trello/assets/logo.png',
  }
  const displayPrivateBoards = await presence.getSetting<boolean>(
    'displayPrivateBoards',
  )

  presenceData.startTimestamp = browsingTimestamp

  switch (document.location.hostname) {
    case 'trello.com': {
      if (document.location.pathname.includes('/b/')) {
        if (
          document.querySelector(
            '[data-testid="workspace-navigation-nav"] a > p',
          )
        ) {
          if (
            document.querySelector(
              '.board-main-content [data-testid="PrivateIcon"]',
            )
            && !displayPrivateBoards
          ) {
            presenceData.details = 'Viewing private board'
          }
          else {
            presenceData.details = `Viewing board: ${document.querySelector(
              '[data-testid="board-name-display"]',
            )?.textContent}`
            presenceData.state = `In workspace: ${
              document.querySelector(
                '[data-testid="workspace-navigation-nav"] a > p',
              )?.textContent
            }`
          }
        }
        else {
          presenceData.details = 'Viewing board:'
          if (
            document.querySelector(
              '.board-main-content [data-testid="PrivateIcon"]',
            )
            && !displayPrivateBoards
          ) {
            presenceData.details = 'Viewing private board'
          }
          else {
            presenceData.state = document.querySelector(
              '[data-testid="board-name-display"]',
            )?.textContent
          }
        }
        presenceData.smallImageKey = Assets.Reading
      }
      else if (document.location.pathname.includes('/c/')) {
        if (
          document.querySelector(
            '.board-main-content [data-testid="PrivateIcon"]',
          )
          && !displayPrivateBoards
        ) {
          presenceData.details = 'Viewing private card'
          presenceData.state = 'Private Board'
        }
        else {
          presenceData.details = `Viewing card: ${
            document.querySelector('.window-title')?.textContent
          }`
          presenceData.state = `Board: ${
            document.querySelector('[data-testid="board-name-display"]')
              ?.textContent
          }`
          presenceData.smallImageKey = Assets.Reading
        }
      }
      else if (document.location.pathname.includes('/activity')) {
        const [profile] = document.location.pathname.split('/', 3).slice(2)
        presenceData.details = `Viewing @${profile}'s`
        presenceData.state = 'recent activites'
      }
      else if (document.location.pathname.includes('/cards')) {
        const [profile] = document.location.pathname.split('/', 3).slice(2)
        presenceData.details = `Viewing @${profile}'s`
        presenceData.state = 'recent cards'
      }
      else if (document.location.pathname.includes('/boards')) {
        const [profile] = document.location.pathname.split('/', 3).slice(2)
        presenceData.details = `Viewing @${profile}'s boards`
      }
      else if (document.location.pathname.includes('/home')) {
        presenceData.details = `Viewing Workspace: ${
          document.querySelector('.all-boards  h2')?.textContent
        }`
      }
      else if (
        document.location.pathname.includes('/account')
        || document.location.pathname.includes('/billing')
      ) {
        presenceData.details = 'Changing account settings'
      }
      else if (document.location.pathname.includes('/u/')) {
        const [profile] = document.location.pathname.split('/', 3).slice(2)
        presenceData.details = `Viewing @${profile}'s profile`
      }
      else if (document.location.pathname.includes('/shortcuts')) {
        presenceData.details = 'Viewing shortcut settings'
      }
      else if (document.location.pathname.includes('/tour')) {
        presenceData.details = 'Viewing Trello\'s Tour'
      }
      else if (document.location.pathname.includes('/pricing')) {
        presenceData.details = 'Viewing Trello\'s Pricing'
      }
      else if (document.location.pathname.includes('/platforms')) {
        presenceData.details = 'Viewing Trello\'s Platforms'
      }
      else if (document.location.pathname.includes('/about')) {
        presenceData.details = 'Viewing Trello\'s'
        presenceData.state = 'About page'
      }
      else {
        presenceData.details = 'Viewing home page'
      }

      break
    }
    case 'blog.trello.com': {
      if (document.location.pathname.includes('/topic/')) {
        const board = document.querySelector(
          'body > div.body-container-wrapper > div > div > div > div > div > div.row-fluid > div > div.row-fluid-wrapper.row-depth-1.row-number-3 > div > div > div > h2',
        )
        presenceData.details = 'Blog, topic:'
        presenceData.state = board?.textContent
      }
      else if (document.location.pathname.includes('/author/')) {
        const profile = document.querySelector(
          'body > div.body-container-wrapper > div > div > div > div > div > div.row-fluid > div > div.row-fluid-wrapper.row-depth-1.row-number-6 > div > div > div > div > div > div:nth-child(1) > div > h2',
        )?.textContent
        presenceData.details = 'Blog, viewing profile:'
        presenceData.state = profile
      }
      else if (document.location.pathname.includes('/search')) {
        const profile = document.querySelector<HTMLInputElement>('#gsc-i-id1')?.value
        presenceData.details = 'Blog, searching for:'
        presenceData.state = profile
        presenceData.smallImageKey = Assets.Search
      }
      else if (document.location.pathname.includes('/')) {
        const board = document.querySelector('#hs_cos_wrapper_name')
        if (board) {
          presenceData.details = 'Blog, article:'
          presenceData.state = board.textContent
          presenceData.smallImageKey = Assets.Reading
        }
        else {
          presenceData.details = 'Viewing Trello\'s'
          presenceData.state = 'Blog page'
        }
      }

      break
    }
    case 'developers.trello.com': {
      if (document.location.pathname.includes('/reference')) {
        const [, profile] = document.URL.split('#', 2)
        presenceData.details = 'Developers, API Docs:'
        presenceData.state = profile
        presenceData.smallImageKey = Assets.Reading
      }
      else if (document.location.pathname.includes('/docs')) {
        presenceData.details = 'Developers, Reading guide'
        presenceData.smallImageKey = Assets.Reading
      }

      break
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
