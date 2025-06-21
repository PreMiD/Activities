const presence = new Presence({
  clientId: '1382295680176881784',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/H/Hashnode/assets/logo.png',
}

// Pages
const pages: { [k: string]: string[] } = {
  '/': ['Page', 'Home'],
  '/bookmarks': ['Page', 'Bookmarks'],
  '/history': ['Page', 'Reading History'],
  '/onboard': ['Page', 'Onboarding'],
  '/changelog': ['Page', 'Changelog'],
  '/about': ['Page', 'About'],
  '/brand-resources': ['Page', 'Brand Resources'],
  '/privacy': ['Page', 'Privacy Policy'],
  '/terms': ['Page', 'Terms of Use Agreement'],
  '/code-of-conduct': ['Page', 'Code of Conduct'],
  '/feed': ['Community', 'Feed'],
  '/following': ['Community', 'Following'],
  '/featured': ['Community', 'Featured'],
  '/products/blogs': ['Product Page', 'Blogs'],
  '/products/docs': ['Product Page', 'API Docs'],
  '/settings': ['Settings', 'Profile'],
  '/settings/email': ['Settings', 'Email'],
  '/settings/developer': ['Settings', 'Developer'],
  '/settings/account': ['Settings', 'Account'],

}

// Dashboard
const dashboardRoutes: { [k: string]: string } = {
  '': 'Dashboard',
  '/overview': 'Overview',
  '/general': 'General',
  '/appearance': 'Appearance',
  '/navbar': 'Navbar',
  '/widgets': 'Widgets',
  '/integrations': 'Integrations',
  '/webhooks': 'Webhooks',
  '/posts': 'Posts',
  '/series': 'Series',
  '/pages': 'Pages',
  '/redirects': 'Redirects',
  'extra-controls': 'Extra Controls',
  '/members': 'Members',
  '/notifications': 'Notifications',
  '/policies': 'Policies',
  'newsletter': 'Newsletter',
  '/recommendations': 'Recommendations',
  '/github': 'GitHub',
  '/import': 'Import',
  '/export': 'Export',
  '/analytics': 'Analytics',
  '/seo': 'SEO',
  '/domain': 'Domain',
}

presence.on('UpdateData', async () => {
  const page = document.location.pathname
  const [, ...hrefRest] = document.location.href.split('//')
  const href = hrefRest.join('')

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  // Pages
  if ((page && pages[page]) || (page && pages[page.slice(0, -1)])) {
    presenceData.details = `Viewing ${pages[page]![0] || pages[page.slice(0, -1)]![0]}`
    presenceData.state = pages[page]![1] || pages[page.slice(0, -1)]![1]
  }

  // Profiles
  else if (
    href.includes('hashnode.com/@')
    && href.match('[^/]*$')?.[0].includes('@')
    && href.match('[^/]*$')![0] === href.slice(-href.match('[^/]*$')![0].length)
  ) {
    presenceData.details = 'Viewing a profile:'
    presenceData.state = document.querySelector('h1 a span')?.textContent
      ?? 'Unknown User'
  }

  // Search
  else if (page.includes('/search')) {
    presenceData.details = 'Searching for:'
    presenceData.state = new URLSearchParams(document.location.search).get('q') ?? 'something...'
  }

  // Dashboard
  else if (
    href.includes('/dashboard')
    && href.split('/dashboard')[0]!.includes('hashnode.com/')
    && /^[a-z0-9]+$/i.test(href.split('/dashboard')[0]!.split('/').pop() || '')
  ) {
    const route = href.split('/dashboard')[1]?.split('?')[0] || ''
    presenceData.details = 'Viewing Dashboard:'
    presenceData.state = dashboardRoutes[route] || 'Overview'
  }

  // Article Writing
  else if (
    href.includes('hashnode.com/draft/')
    && href.split('hashnode.com/draft/')[1]!.match(/^[a-z0-9]+$/i)
  ) {
    presenceData.details = 'Editing an article:'
    presenceData.state = document.querySelector('#title-input')?.textContent || 'Untitled Article'
  }

  // API Docs Writing
  else if (
    href.includes('hashnode.com/docs/')
    && href.split('hashnode.com/docs/')[1]!.match(/^[a-z0-9/]+$/i)
  ) {
    presenceData.details = 'Editing API Docs:'
    presenceData.state = document.querySelector('section aside div div span')?.textContent || 'Unknown'
  }

  // Unknown Page
  else {
    presenceData.details = 'Browsing Hashnode'
    presenceData.state = 'Unknown Page'
  }
  presence.setActivity(presenceData)
})
