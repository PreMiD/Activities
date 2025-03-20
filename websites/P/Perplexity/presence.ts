import { Assets } from 'premid'

const presence = new Presence({
  clientId: '893871116945350726',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const threadExportRegex = /([a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12})/i
let recentSearchQuery: string | null = null

presence.on('UpdateData', async () => {
  const { href, pathname } = document.location
  const [privacy, hideButtons, iconType] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('hideButtons'),
    presence.getSetting<number>('iconType'),
  ])
  const currentSearch = new URL(href).searchParams.get('q')
  const pageInput = document.querySelector<HTMLInputElement>('.md\\:mb-md')
  const currentPage = pathname.split('/')[1]
  const largeImage = [
    'https://cdn.rcd.gg/PreMiD/websites/P/Perplexity/assets/logo.png',
    'https://cdn.rcd.gg/PreMiD/websites/P/Perplexity/assets/0.png',
  ][iconType]
  || 'https://cdn.rcd.gg/PreMiD/websites/P/Perplexity/assets/logo.png'
  const presenceData: PresenceData = {
    largeImageKey: largeImage,
    startTimestamp: browsingTimestamp,
  }
  if (currentSearch && currentSearch !== recentSearchQuery)
    recentSearchQuery = currentSearch

  presenceData.details = 'Home'

  if (!currentPage)
    return presence.setActivity(presenceData)

  switch (currentPage.toLowerCase()) {
    case 'search':
      presenceData.details = privacy ? 'Searching' : 'Searching for'
      presenceData.smallImageKey = Assets.Search

      if (pathname.match(threadExportRegex)) {
        presenceData.buttons = [
          {
            label: 'Open Thread',
            url: href,
          },
        ]
      }

      presenceData.state = recentSearchQuery
      if (
        pageInput
        && pageInput.textContent
        && pageInput.textContent !== recentSearchQuery
      ) {
        presenceData.state = pageInput.textContent
      }
      break

    case 'threads':
      presenceData.details = 'Searching threads'
      presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/P/Perplexity/assets/1.png'
      break

    case 'about':
      presenceData.details = 'Reading about'
      break

    case 'blog':
      presenceData.details = 'Reading blog'
      break

    case 'privacy':
      presenceData.details = 'Reading privacy policy'
      break

    case 'tos':
      presenceData.details = 'Reading terms of service'
      break

    default:
      presenceData.details = 'Browsing'
      presenceData.state = currentPage
      break
  }

  if (privacy && presenceData.state)
    delete presenceData.state
  if (hideButtons && presenceData.buttons)
    delete presenceData.buttons

  presence.setActivity(presenceData)
})
