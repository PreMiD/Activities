import { Assets } from 'premid'

const presence = new Presence({ clientId: '818756651279450144' })

presence.on('UpdateData', async () => {
  const path = location.pathname
  const [subdomain] = location.host.split('.')
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Tailwind%20CSS/assets/logo.png',
    startTimestamp: Math.round(Date.now() / 1000),
  }

  if (location.host === 'tailwindui.com') {
    presenceData.details = 'Viewing page:'
    if (path.includes('/components')) {
      if (path.includes('/components/')) {
        const pathnames = location.pathname.split('/')
        presenceData.details = 'Viewing component:'
        presenceData.state = `${pathnames[pathnames.length - 2]
          ?.replaceAll('-', ' ')
          .replace(/(^\w|\s\w)/g, m => m.toUpperCase())} - ${
          document.querySelector('main .max-w-8xl h2')?.textContent
          || 'Unknown component'
        }`
      }
      else {
        presenceData.details = 'Browsing components'
        presenceData.smallImageKey = Assets.Search
      }
    }
    else {
      switch (path) {
        case '/pricing': {
          presenceData.state = 'Tailwind UI - Pricing'
          break
        }
        case '/login': {
          presenceData.state = 'Tailwind UI - Login'
          break
        }
        case '/': {
          presenceData.state = 'Tailwind UI - Home'
          break
        }
      }
    }
  }
  else if (subdomain === 'blog') {
    if (path !== '/') {
      presenceData.details = 'Reading an article:'
      presenceData.state = document.querySelector('article header div div h1')?.textContent
        || 'Unknown article'
      presenceData.smallImageKey = Assets.Reading
    }
    else {
      presenceData.details = 'Browsing articles'
      presenceData.smallImageKey = Assets.Search
    }
  }
  else if (subdomain === 'play') {
    presenceData.details = 'In Tailwind Play'
  }
  else if (path.includes('/docs')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = document.querySelector('#content-wrapper div h1')?.textContent
      || 'Unknown page'
  }
  else if (path === '/') {
    presenceData.details = 'Viewing homepage'
  }
  else if (path === '/resources') {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Resources'
  }
  else {
    presenceData.details = 'Viewing an unknown page'
  }

  presence.setActivity(presenceData)
})
