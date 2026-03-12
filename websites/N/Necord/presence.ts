import { Assets } from 'premid'

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/N/Necord/assets/0.png',
  Idle = 'https://cdn.rcd.gg/PreMiD/websites/N/Necord/assets/1.png',
}

const presence = new Presence({
  clientId: '1081479845940314114',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const IDLE_TIMEOUT = 10 * 60 * 1000
const settings = [
  'search',
  'docs-page',
  'docs-page-content',
  'docs-page-sidebar',
  'idling',
]

let sidebar: string | null = null
let lastActivity: number = Date.now()

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { href, pathname, search } = document.location
  const title = document.title.split(' | ')[0]
  const privacy = await presence.getSetting('privacy')
  const [
    isSearchPublic,
    isCurrentPagePublic,
    isCurrentContentPublic,
    isSidebarPublic,
    isIdlingPublic,
  ] = await Promise.all(
    !privacy
      ? settings.map(setting => presence.getSetting(setting))
      : Array.from({ length: settings.length }).fill(false),
  )

  switch (true) {
    case lastActivity + IDLE_TIMEOUT < Date.now() && isIdlingPublic: {
      presenceData.smallImageKey = ActivityAssets.Idle
      presenceData.smallImageText = 'Idling'
      presenceData.details = 'Idling at page: '
      presenceData.state = title
      presenceData.startTimestamp = Math.floor(lastActivity / 1000)

      break
    }

    case pathname.startsWith('/search'): {
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Searching'
      presenceData.details = 'Searching for something'

      if (search && isSearchPublic) {
        presenceData.details = 'Searching for:'
        presenceData.state = [
          search.split('q=')[1],
          `(${
            document.querySelector<HTMLDivElement>('main')?.childElementCount
            ?? 0
          } results)`,
        ].join(' ')

        presenceData.buttons = [
          {
            label: 'Show Results',
            url: href,
          },
        ]
      }

      break
    }

    case !!sidebar && isSidebarPublic: {
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Searching'
      presenceData.details = 'Selecting a category:'
      presenceData.state = sidebar

      break
    }

    default: {
      const topmostElem = document.querySelector<HTMLLinkElement>(
        '.table-of-contents__link--active',
      )
      ?? document.querySelector<HTMLLinkElement>('.table-of-contents__link')

      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Reading'
      presenceData.details = `Reading ${
        isCurrentPagePublic ? title : 'a'
      } page${isCurrentContentPublic ? ':' : ''}`
      presenceData.state = isCurrentContentPublic
        ? `${topmostElem?.textContent} (${getScrollPercentage().toFixed(2)}%)`
        : null
      presenceData.buttons = [
        {
          label: 'Read Page',
          url: topmostElem?.href ?? '',
        },
      ]

      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

document.addEventListener('mouseover', (e) => {
  const target = e.target as HTMLElement

  if (target.classList.contains('menu__link'))
    sidebar = target.textContent
  else if (!target.classList.contains('menu'))
    sidebar = null

  lastActivity = Date.now()
})

function getScrollPercentage() {
  const { scrollY, innerHeight } = window
  const { scrollHeight } = document.body
  const percentage = (scrollY / (scrollHeight - innerHeight)) * 100

  return percentage === 0 ? 0 : percentage || 100
}
