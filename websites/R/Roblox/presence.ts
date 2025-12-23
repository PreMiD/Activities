// import { Assets } from 'premid'
import { Presence, PresenceData, Assets } from 'premid'; // TS hates when you dont define it all.

const presence = new Presence({
  clientId: '612416330003382314',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/R/Roblox/assets/logo.png',
  DeveloperLogo = 'https://cdn.rcd.gg/PreMiD/websites/R/Roblox/assets/0.png',
  CreateLogo = 'https://cdn.rcd.gg/PreMiD/websites/R/Roblox/assets/1.png',
}
let devImage = false

presence.on('UpdateData', async () => {
  const [buttons, imagesEnabled, onlyDevForums] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('images'),
    presence.getSetting<boolean>('only-devforum'),
  ])
  const presenceData: PresenceData = {
    details: 'Unknown page',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, hostname, href } = document.location
  const gameName = document.querySelector<HTMLHeadingElement>(
    'div.game-calls-to-action > div.game-title-container > h1',
  )
  const profileName = document.querySelector<HTMLHeadingElement>('.profile-name ')
  const messageTab = document.querySelector('li.menu-option.ng-scope.active')?.textContent
    ?? document.querySelector('li.rbx-tab.ng-scope.active')?.textContent
  const groupTab = document.querySelector<HTMLLIElement>(
    '#configure-group .tab-content-group ul .active',
  )
  ?? document.querySelector<HTMLLIElement>(
    '#horizontal-tabs li.rbx-tab.active',
  )
  const newUrl = new URL(href)
  const searchResult = (newUrl.searchParams.get('keyword') ?? newUrl.searchParams.get('query'))?.toLowerCase() ?? null;
  const item = document.querySelector<HTMLHeadingElement>(
    '.item-name-container h2',
  )?.textContent

  switch (hostname) {
    case 'web.roblox.com':
    case 'www.roblox.com': {
      const pages: {
        [name: string]: PresenceData
      } = {
        '/home': { state: 'Home' },
        '/my/avatar': { state: 'Avatar Editor' },
        '/feeds': { state: 'Feed' },
        '/premium': { state: 'Premium Membership' },
        '/promocodes': { state: 'Promocodes' },
        '/redeem': { state: 'Redeem' },
        '/giftcards': { state: 'Gift Cards' },
        '/robux': { state: 'Robux' },
        '/groups/join': { details: 'Browsing groups...' },
        '/trades': { state: 'Trades' },
        '/support': { state: 'Support' },
        '/translator-portal': { state: 'Translator Portal' },
        '/info/roblox-badges': { state: 'Badges' },
        '/upgrades': { state: 'Buying Product' },
        '/crossdevicelogin': { state: 'Quick Log In' },
        '/abusereport/': { state: 'Reporting Content Abuse' },
        '/user-ads/create': { state: 'Creating Ad' },
        '/login': { state: 'Log In' },
      }

      switch (true) {
        case !!document.querySelector('.notification-stream-container'): {
          presenceData.details = 'Viewing Notifications'
          if (presenceData.state)
            delete presenceData.state
          break
        }
        case pathname.includes('/users') && pathname.includes('/profile'): {
          if (
            document
              .querySelector<HTMLAnchorElement>(
                '#horizontal-tabs li.rbx-tab.active a',
              )
              ?.textContent
              ?.trim() === 'Creations' // Profile tabs
          ) {
            presenceData.details = `Profile: ${profileName?.textContent}`
            presenceData.state = 'Browsing creations...'
          }
          else {
            presenceData.details = 'Looking on a profile: '
            presenceData.state = profileName?.textContent
          }

          const profileImg = document.querySelector<HTMLImageElement>('.avatar-card-link.avatar-image-link img');
          presenceData.largeImageKey = profileImg?.src ?? ActivityAssets.Logo;

          presenceData.buttons = [
            {
              label: 'Visit Profile',
              url: href,
            },
          ]
          break
        }
        case pathname.includes('/my/messages'):
        case pathname.includes('/My/Messages'): {
          presenceData.details = 'Messages'
          presenceData.state = `Tab: ${messageTab}`
          break
        }
        case pathname.includes('/my/account'): {
          presenceData.details = 'Settings'
          presenceData.state = `Tab: ${messageTab}`
          break
        }
        case pathname.includes('/users/friends'): {
          presenceData.details = 'Friends'
          presenceData.state = `Tab: ${
            document.querySelector<HTMLAnchorElement>('.rbx-tab-heading.active')
              ?.textContent // Friends tab
          }`
          break
        }
        case pathname.includes('/users') && pathname.includes('/inventory'): {
          presenceData.details = 'Inventory'
          presenceData.state = document.querySelector<HTMLLIElement>(
            '#vertical-menu > li.menu-option.ng-scope.active',
          )?.textContent // Inventory tab
          break
        }
        case pathname.includes('/groups')
          && !pathname.includes('/search')
          && !pathname.includes('/develop'): {
          presenceData.state = `Tab: ${groupTab?.textContent}`
          if (pathname.includes('/create')) {
            presenceData.details = 'Creating New Group'
          }
          else if (pathname.includes('/configure')) {
            presenceData.details = 'Configuring Group'
          }
          else {
            presenceData.details = document.querySelector<HTMLHeadingElement>(
              '.group-name.text-overflow',
            )?.textContent // Groupname

            presenceData.largeImageKey = document.querySelector<HTMLImageElement>('div.group-image img')
              ?.src ?? ActivityAssets.Logo // Groupimage

            presenceData.buttons = [
              {
                label: 'Visit Group',
                url: href,
              },
            ]
          }
          break
        }
        case pathname.includes('/search/groups'): {
          presenceData.details = 'Searching for a group:'
          presenceData.state = new URL(href).searchParams.get('keyword')
          break
        }
        case (pathname === '/discover/' || pathname === '/discover')
          && gameName === null: {
          presenceData.details = 'Browsing games...'
          if (presenceData.state)
            delete presenceData.state

          if (searchResult) {
            presenceData.details = 'Searching for a game: '
            presenceData.smallImageKey = Assets.Search
            presenceData.state = searchResult
          }
          break
        }
        case pathname.includes('/games/')
          && !pathname.includes('/localization'): {
          presenceData.details = `Game: ${gameName?.textContent}`
          presenceData.state = `Tab: ${
            document.querySelector<HTMLLIElement>(
              '#horizontal-tabs li.rbx-tab.active',
            )?.textContent // Gametab
          }`
          presenceData.largeImageKey = document
            .querySelector('[class*=\'carousel-item\'] > img')
            ?.getAttribute('src') ?? ActivityAssets.Logo

          presenceData.buttons = [
            {
              label: 'Visit Game',
              url: href,
            },
          ]
          break
        }
        case pathname.includes('/catalog'): {
          const itemImage = document.querySelector<HTMLImageElement>(
            'span.thumbnail-span img',
          )

          if (searchResult) {
            presenceData.details = 'Searching for an item: '
            presenceData.smallImageKey = Assets.Search
            presenceData.state = searchResult
          }
          else if (itemImage) {
            presenceData.details = 'Looking at Catalog Item:'
            presenceData.largeImageKey = itemImage?.src ?? ActivityAssets.Logo
            presenceData.state = item

            presenceData.buttons = [
              {
                label: 'View Catalog Item',
                url: href,
              },
            ]
          }
          else {
            presenceData.details = 'Current page:'
            presenceData.state = 'Catalog'
          }
          break
        }
        case pathname.includes('/places/'): {
          presenceData.details = 'Configuring Place'
          presenceData.state = `Tab: ${
            document.querySelector<HTMLDivElement>(
              '#MasterContainer #navbar div.selected a',
            )?.textContent || 'Unknown'
          }`
          break
        }
        case pathname.includes('/universes/configure'): {
          presenceData.details = 'Configuring their experience'
          presenceData.state = `Tab: ${
            document.querySelector<HTMLDivElement>(
              '#MasterContainer #navbar div.selected a',
            )?.textContent || 'Unknown'
          }`
          break
        }
        case pathname.includes('/bundles/'): {
          presenceData.details = 'Looking at Bundle:'
          presenceData.largeImageKey = document.querySelector<HTMLImageElement>('span.thumbnail-span img')
            ?.src ?? ActivityAssets.Logo
          presenceData.state = item

          presenceData.buttons = [
            {
              label: 'View Bundle',
              url: href,
            },
          ]
          break
        }
        case pathname.includes('/search/users'): {
          presenceData.details = 'Searching for an user:'
          presenceData.smallImageKey = Assets.Search
          presenceData.state = new URL(href).searchParams.get('keyword')
          break
        }
        case pathname.includes('/develop'): {
          presenceData.name = 'Roblox - Developers'
          presenceData.details = 'Viewing tab'
          const developTabs = document.querySelector<HTMLDivElement>(
            '#DevelopTabs .tab-active',
          )?.textContent

          switch (developTabs) {
            case 'My Creations': {
              presenceData.state = `${developTabs} > ${
                document.querySelector<HTMLAnchorElement>('.tab-item-selected')
                  ?.textContent
              }`
              break
            }

            case 'Group Creations': {
              presenceData.state = `${developTabs} > ${
                document.querySelector<HTMLAnchorElement>(
                  '#SelectedGroupId option[selected="selected"]',
                )?.textContent
              } > ${
                document.querySelector<HTMLAnchorElement>('.tab-item-selected')
                  ?.textContent
              }`
              break
            }

            case 'Library': {
              if (searchResult) {
                presenceData.details = `Searching at ${developTabs} for: `
                presenceData.state = searchResult
              }
              else {
                presenceData.state = `${developTabs} > ${
                  document.querySelector<HTMLAnchorElement>(
                    '.selectedAssetTypeFilter',
                  )?.textContent
                }`
              }
              break
            }

            default: {
              presenceData.state = `${developTabs}`
              break
            }
          }
          break
        }
        case pathname.includes('/localization'): {
          const localizationTab = document.querySelector<HTMLSpanElement>(
            '.left-panel ul .active a',
          )
          ?? document.querySelector<HTMLSpanElement>(
            '.nav-tabs .active .text-lead',
          )
          if (pathname.includes('/configure')) {
            presenceData.details = 'Managing Localizations'
          }
          else {
            const localizationGameName = document.querySelector<HTMLHeadingElement>(
              '#selenium-game-title-heading',
            )
            ?? document.querySelector<HTMLHeadingElement>(
              'div.component-container h4',
            )

            presenceData.details = `Localizing "${
              localizationGameName?.textContent ?? 'Untilted Game'
            }"`
          }

          presenceData.state = `Tab: ${localizationTab?.textContent}`
          break
        }
        case pathname.includes('/transactions'): {
          presenceData.details = 'Transactions Page'
          presenceData.state = `Tab: ${
            document.querySelector<HTMLSpanElement>(
              '.transaction-type-dropdown .rbx-selection-label',
            )?.textContent
            // Transaction tab
          }`
          break
        }
        case pathname.includes('/badges/'): {
          presenceData.details = 'Looking at Badge:'
          presenceData.largeImageKey = document.querySelector<HTMLImageElement>('span.thumbnail-span img')
            ?.src ?? ActivityAssets.Logo
          presenceData.state = item

          presenceData.buttons = [
            {
              label: 'View Badge',
              url: href,
            },
          ]
          break
        }
        case pathname.includes('/library/'): {
          presenceData.details = 'Looking at Asset:'
          presenceData.largeImageKey = document.querySelector<HTMLImageElement>('span.thumbnail-span img')
            ?.src ?? ActivityAssets.Logo
          presenceData.state = item

          presenceData.buttons = [
            {
              label: 'View Asset',
              url: href,
            },
          ]
          break
        }
        case pathname.includes('/game-pass/'): {
          presenceData.details = 'Looking at Gamepass:'
          presenceData.largeImageKey = document.querySelector<HTMLImageElement>('span.thumbnail-span img')
            ?.src ?? ActivityAssets.Logo
          presenceData.state = item

          presenceData.buttons = [
            {
              label: 'View Gamepass',
              url: href,
            },
          ]
          break
        }

        default: {
          for (const [i, v] of Object.entries(pages)) {
            if (pathname.includes(i)) {
              presenceData.details = v.details ?? 'Current Page: '
              if (v.state)
                presenceData.state = v.state
              else if (presenceData.buttons)
                delete presenceData.buttons
            }
          }
        }
      }
      break
    }

    case 'devforum.roblox.com': {
      const pages: {
        [name: string]: PresenceData
      } = {
        '/': { state: 'Browsing Homepage' },
        '/following': { state: 'Browsing Following Topics' },
        '/top': { state: 'Browsing Top Topics' },
        '/unread': { state: 'Browsing Unread Topics' },
        '/latest': { state: 'Browsing Latest Topics' },
        '/new': { state: 'Browsing New Topics' },
        '/about': { state: 'Browsing About' },
        '/faq': { state: 'Browsing FAQ' },
        '/categories': { state: 'Browsing Categories' },
      }

      presenceData.name = 'Roblox - DevForum'
      presenceData.details = 'Browsing through the forum'
      presenceData.largeImageKey = ActivityAssets.DeveloperLogo
      devImage = true

      switch (true) {
        case pathname.includes('/t/'): {
          presenceData.state = `Reading ${
            document.querySelector('.fancy-title')?.textContent
          }`
          presenceData.smallImageKey = Assets.Reading

          presenceData.buttons = [
            {
              label: 'View Topic',
              url: href,
            },
          ]

          break
        }
        case pathname.includes('/tag/')
          || (pathname.includes('/c/') && !pathname.includes('/categories/')): {
          presenceData.state = `Browsing ${
            document.title.split('- DevForum | Roblox')[0]
          }`
          break
        }
        case pathname.includes('/search'): {
          presenceData.state = `Searching "${new URL(href).searchParams.get(
            'q',
          )}"`
          presenceData.smallImageKey = Assets.Search
          break
        }
        case pathname.includes('/badges') && !pathname.includes('/u'): {
          presenceData.state = 'Browsing Badges'

          if (document.querySelector('.container.show-badge')) {
            presenceData.state = `Browsing ${
              document
                .querySelector('.container.show-badge h1')
                ?.textContent
                ?.split('/')?.[1]
            } Badge`
          }
          break
        }
        case pathname.includes('/g/'): {
          presenceData.state = 'Browsing Groups'

          if (document.querySelector('.group-info-name')) {
            presenceData.state = `Browsing ${
              document.querySelector('.group-info-name')?.textContent
            } Group`
          }
          break
        }
        case pathname.includes('/u/'): {
          //const user = document.querySelector('.username')?.textContent
          // for some reason, the devforum has different classes per user? weird?
          const user = document.querySelector('.username')?.textContent
            ?? document.querySelector('.user-card-name')?.textContent;
          presenceData.state = `Browsing ${user}'s Profile`
          presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.user-profile-avatar img')
            ?.src ?? ActivityAssets.DeveloperLogo
          devImage = true
          presenceData.buttons = [
            {
              label: 'View Profile',
              url: href,
            },
          ]

          const sections: {
            [name: string]: [string, boolean]
          } = {
            '/summary': [`Browsing ${user}'s Summary`, false],
            '/activity': [`Browsing ${user}'s Activity`, false],
            '/badges': [`Browsing ${user}'s Badges`, false],
            '/preferences': ['Editing Account Preferences', true],
            '/messages': ['Browsing Messages', true],
            '/notifications': ['Browsing Notifications', true],
          }

          if (pathname.includes('/follow')) {
            presenceData.state = 'Browsing Network'
            if (presenceData.buttons)
              delete presenceData.buttons

            if (pathname.includes('/followers'))
              presenceData.state = 'Looking at Followers'
            else if (pathname.includes('/following'))
              presenceData.state = 'Looking at Following'
          }
          else {
            for (const [i, v] of Object.entries(sections)) {
              if (pathname.includes(i)) {
                presenceData.state = v[0]
                if (v[1] === true && presenceData.buttons)
                  delete presenceData.buttons
              }
              else {
                for (const [i, v] of Object.entries(pages)) {
                  if (pathname === i)
                    presenceData.state = v.state
                }
              }
            }
          }
          break
        }
        case !!document.querySelector('.composer-action-createTopic'): {
          presenceData.state = 'Creating a New Topic'
          break
        }
        case !!document.querySelector('.composer-action-privateMessage'): {
          presenceData.state = 'Writing a Private Message'
          break
        }
        case !!document.querySelector('.composer-action-reply'): {
          presenceData.state = `Replying To ${
            document
              .querySelector('.composer-action-reply')
              ?.querySelector('.user-link')
              ?.textContent
          }`
          break
        }
        case !!document.querySelector('.keyboard-shortcuts-modal'): {
          presenceData.state = 'Browsing Keyboard Shortcuts'
          break
        }
        case !!document.querySelector('.flag-modal.in'): {
          presenceData.state = 'Flagging a Post'
          if (presenceData.buttons)
            delete presenceData.buttons
          break
        }
        case !!document.querySelector('.composer-action-edit'): {
          presenceData.state = 'Editing a Post'
          if (presenceData.buttons)
            delete presenceData.buttons
          break
        }
      }

      break
    }

    case 'create.roblox.com': {
      presenceData.name = 'Roblox - Create'
      presenceData.largeImageKey = ActivityAssets.CreateLogo
      const search = document.querySelector('#search-text-field')
      switch (true) {
        case pathname === '/landing': {
          presenceData.details = 'Browsing on the landing page'
          break
        }
        case pathname === '/': {
          presenceData.details = 'Browsing on the homepage'
          break
        }
        case pathname.includes('/dashboard/creations'): {
          presenceData.details = 'Creation\'s dashboard'
          presenceData.state = `Tab: ${
            document.querySelector('button[aria-selected="true"]')?.textContent
          }`
          break
        }
        case pathname.includes('analytics'): {
          presenceData.details = 'Viewing analytics'
          presenceData.state = `Tab: ${
            document.querySelector('button[aria-selected="true"]')?.textContent
          }`
          break
        }
        case pathname.includes('/translator-portal'): {
          presenceData.details = 'Browsing through the translator portal'
          break
        }
        case pathname.includes('credentials'): {
          presenceData.details = 'Viewing the credentials manager'
          break
        }
        case pathname.includes('/docs'): {
          presenceData.name = 'Roblox - Create - Docs'
          switch (true) {
            case !!search: {
              presenceData.details = search?.getAttribute('value')
                ? 'Searching for:'
                : 'Searching...'
              presenceData.state = document
                .querySelector('#search-text-field')
                ?.getAttribute('value')
              presenceData.smallImageKey = Assets.Search
              break
            }
            case !!document.querySelector('li[aria-selected="true"]'): {
              presenceData.details = 'Reading docs about:'
              presenceData.state = document.querySelector(
                'li[aria-selected="true"]',
              )?.textContent
              presenceData.smallImageKey = Assets.Reading
              presenceData.buttons = [
                {
                  label: 'Read Article',
                  url: href,
                },
              ]
              break
            }
            default: {
              presenceData.details = 'Viewing the homepage'
              break
            }
          }
          break
        }
        case pathname.includes('/marketplace/asset/'): {
          presenceData.name = 'Roblox - Create - Marketplace'
          presenceData.details = `Viewing ${document
            .querySelector('button[aria-selected="true"]')
            ?.textContent
            ?.toLowerCase()}:`
          presenceData.state = document.querySelector(
            '[data-testid="assetHeadingDetailsTestId"] > h1',
          )?.textContent
          presenceData.buttons = [
            {
              label: 'View Asset',
              url: href,
            },
          ]
          break
        }
        case pathname.includes('/marketplace'): {
          presenceData.name = 'Roblox - Create - Marketplace'
          presenceData.details = 'Viewing tab'
          presenceData.state = document.querySelector(
            'button[aria-selected="true"]',
          )?.textContent
          presenceData.buttons = [
            {
              label: 'View Marketplace',
              url: href,
            },
          ]
          break
        }
        case pathname.includes('/talent/'): {
          presenceData.name = 'Roblox - Create - Talent'
          if (document.querySelector('#text-input')?.getAttribute('value')) {
            presenceData.details = 'Searching for:'
            presenceData.state = document
              .querySelector('#text-input')
              ?.getAttribute('value')
            presenceData.smallImageKey = Assets.Search
          }
          else {
            presenceData.details = 'Viewing tab'
            presenceData.state = document.querySelector(
              'button[aria-selected="true"]',
            )?.textContent
          }
          break
        }
        case pathname.includes('/roadmap'): {
          presenceData.details = 'Browsing through the roadmap'
          presenceData.buttons = [
            {
              label: 'View Roadmap',
              url: href,
            },
          ]
          break
        }
      }
      break
    }
  }

  if (!buttons && presenceData.buttons)
    delete presenceData.buttons
  if (
    !imagesEnabled
    && presenceData.largeImageKey !== ActivityAssets.Logo
    && !devImage
    && hostname !== 'create.roblox.com' // ImagesEnabled setting off & The largeimagekey isnt ActivityAssets.Logo & & Its NOT somewhere that uses the devimage
  ) {
    presenceData.largeImageKey = ActivityAssets.Logo
  }
  else if (
    !imagesEnabled
    && presenceData.largeImageKey !== ActivityAssets.DeveloperLogo
    && devImage // ImagesEnabled setting off & The largeimagekey isnt Assets.DeveloperLogo & Its somewhere that uses the devimage
  ) {
    presenceData.largeImageKey = ActivityAssets.DeveloperLogo
  }
  else if (
    !imagesEnabled
    && presenceData.largeImageKey !== ActivityAssets.CreateLogo
    && !devImage
    && hostname === 'create.roblox.com'
  ) {
    presenceData.largeImageKey = ActivityAssets.CreateLogo
  }

  if (onlyDevForums && !hostname.includes('devforum'))
    presence.clearActivity()
  else presence.setActivity(presenceData)
})
