import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1142916495991652422',
})
const startTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/H/Home%20Assistant/assets/logo.png',
}

interface RouteConfig {
  prefix: string
  defaultDetail: string
  defaultTitle: string
  detailFormatter?: (title: string) => string
}

const ROUTES: RouteConfig[] = [
  {
    prefix: '/integrations',
    defaultDetail: 'Browsing integrations',
    defaultTitle: 'Integrations',
    detailFormatter: title => `Browsing ${title} Integration`,
  },
  {
    prefix: '/docs',
    defaultDetail: 'Browsing Documentation',
    defaultTitle: 'Documentation',
    detailFormatter: title => `Browsing ${title} Docs`,
  },
  {
    prefix: '/installation',
    defaultDetail: 'Browsing Installation Guide',
    defaultTitle: 'Installation Guide',
    detailFormatter: title => `Browsing ${title} Guide`,
  },
  {
    prefix: '/getting-started',
    defaultDetail: 'Browsing Getting Started Guide',
    defaultTitle: 'Getting Started Guide',
    detailFormatter: title => `Browsing ${title} Guide`,
  },
  { prefix: '/blog', defaultDetail: 'Browsing blog', defaultTitle: '' },
  { prefix: '/help', defaultDetail: 'Browsing help', defaultTitle: '' },
]

presence.on('UpdateData', () => {
  const { pathname } = window.location

  const route = ROUTES.find(r => pathname.startsWith(r.prefix))
  let details = 'Browsing website'

  if (route) {
    details = route.defaultDetail

    if (route.detailFormatter && route.defaultTitle) {
      const heading = document.querySelector<HTMLHeadingElement>('h1.title.indent')
      const title = heading?.textContent?.trim() || ''

      if (title && title !== route.defaultTitle) {
        details = route.detailFormatter(title)
      }
    }
  }

  presence.setActivity({
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: Assets.Search,
    startTimestamp,
    type: ActivityType.Playing,
    details,
  })
})
