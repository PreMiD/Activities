const presence = new Presence({
  clientId: '1014999001801691246',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    startTimestamp: browsingTimestamp,
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/Heroku/assets/logo.png',
  }
  const { hostname, pathname, search } = window.location
  const showNames = await presence.getSetting<boolean>('showNames')
  switch (hostname) {
    case 'www.heroku.com': {
      presenceData.details = 'Browsing'
      if (pathname === '/home') {
        presenceData.state = 'Home page'
      }
      else {
        presenceData.state = document.title.match(
          /(.*?)(?= \| Heroku|$)/,
        )?.[1]
      }
      break
    }
    case 'blog.heroku.com': {
      presenceData.details = 'Browsing blog posts'
      if (pathname !== '/') {
        presenceData.state = document.title.match(
          /(.*?)(?= \| Heroku|$)/,
        )?.[1]
      }
      break
    }
    case 'brand.heroku.com': {
      presenceData.details = 'Browsing'
      presenceData.state = 'Brand'
      break
    }
    case 'dashboard.heroku.com': {
      presenceData.details = 'Viewing Dashboard'
      if (pathname === '/apps') {
        presenceData.state = 'Apps'
      }
      else if (pathname === '/new-app') {
        presenceData.details = 'Creating new app'
      }
      else if (pathname.startsWith('/account')) {
        presenceData.details = 'Managing account'
        switch (pathname) {
          case '/acount': {
            presenceData.state = 'Account settings'
            break
          }
          case '/account/applications': {
            presenceData.state = 'Application settings'
            break
          }
          case '/account/billing': {
            presenceData.state = 'Billing settings'
            break
          }
        }
      }
      else if (pathname.startsWith('/apps/')) {
        if (showNames) {
          presenceData.details = `Managing app: '${
            document.title.match(/(.*?)(?= \| Heroku|$)/)?.[1]
          }'`
        }
        else {
          presenceData.details = 'Managing app'
        }

        const [subpath, subpath2] = pathname.split('/').slice(3)
        if (subpath) {
          if (subpath === 'activity') {
            presenceData.state = 'Activity'
            if (subpath2 === 'builds')
              presenceData.state = 'Viewing build log'
          }
          else {
            presenceData.state = `${subpath[0]?.toUpperCase()}${subpath.slice(
              1,
            )}`
          }
        }
        else {
          presenceData.state = 'Overview'
        }
      }
      else if (pathname === '/provision-addon') {
        presenceData.details = 'Provisioning an addon'
        presenceData.state = document.querySelector(
          '.new-app-view > div > div > div:nth-of-type(2) > div:nth-of-type(2)',
        )?.textContent
      }
      break
    }
    case 'data.heroku.com': {
      presenceData.details = 'Browsing Data'
      if (pathname === '/') {
        presenceData.state = 'Looking at datastores'
      }
      else if (pathname === '/dataclips') {
        presenceData.state = 'Looking at dataclips'
      }
      else if (pathname.startsWith('/datastores/')) {
        if (showNames) {
          presenceData.state = `Viewing datastore '${document.title.match(
            /(.*?)(?= \| Heroku Data|$)/,
          )}'`
        }
        else {
          presenceData.state = 'Viewing a datastore'
        }
      }
      else if (pathname.startsWith('/dataclips/')) {
        if (showNames) {
          presenceData.state = `Viewing dataclip '${document.title.match(
            /(.*?)(?= \| Heroku Data|$)/,
          )}'`
        }
        else {
          presenceData.state = 'Viewing a dataclip'
        }
      }
      break
    }
    case 'devcenter.heroku.com': {
      presenceData.details = 'Browsing Dev Center'
      if (pathname === '/') {
        presenceData.state = 'Home page'
      }
      else {
        presenceData.state = document.title.match(
          /(.*?)(?= \| Heroku Dev Center|$)/,
        )?.[1]
      }
      break
    }
    case 'elements.heroku.com': {
      presenceData.details = 'Browsing Elements'
      presenceData.state = document.title.match(
        /(.*?)(?= - Heroku Elements|$)/,
      )?.[1]
      break
    }
    case 'help.heroku.com': {
      presenceData.details = 'Browsing Heroku Support'
      if (/^\/\d+$/.test(pathname)) {
        presenceData.details = 'Viewing Support Ticket'
        presenceData.state = document.querySelector('h2')?.textContent
      }
      else if (
        pathname === '/tickets/new'
        || (pathname === '/' && new URLSearchParams(search).get('t') === 'true')
      ) {
        presenceData.state = 'Creating a new ticket'
      }
      else if (pathname === '/tickets') {
        presenceData.state = 'Viewing tickets'
      }
      else {
        presenceData.state = document.querySelector('h2')?.textContent
          || document.querySelector('h1')?.textContent
          || document.title
      }
      break
    }
    case 'status.heroku.com': {
      presenceData.details = 'Viewing Heroku Status'
      if (pathname === '/incidents') {
        presenceData.state = 'Past incidents'
      }
      else if (pathname.startsWith('/incidents/')) {
        presenceData.state = document.title.match(
          /(.*?)(?= \| Heroku Status|$)/,
        )?.[1]
      }
      else {
        const [appStatus, dataStatus, toolsStatus] = document.querySelectorAll(
          '.container.body-container > div a > .status-summary__description',
        )
        presenceData.state = `Apps: ${appStatus?.textContent?.replace(/\s/g, '')}
Data: ${dataStatus?.textContent?.replace(/\s/g, '')}
Tools: ${toolsStatus?.textContent?.replace(/\s/g, '')}`
      }
      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
})
