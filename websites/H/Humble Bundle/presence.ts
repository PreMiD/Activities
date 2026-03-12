import { Assets } from 'premid'

const presence = new Presence({
  clientId: '633816611022962708',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/Humble%20Bundle/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  switch (document.location.hostname) {
    case 'www.humblebundle.com': {
      const search = document.querySelector<HTMLInputElement>('#site-search')
      if (document.location.pathname === '/') {
        presenceData.details = 'Viewing homepage'
      }
      else if (document.location.pathname.includes('/monthly')) {
        presenceData.details = 'Viewing Humdle Monthly'
      }
      else if (document.location.pathname.includes('/store/')) {
        if (document.location.pathname.includes('/promo')) {
          presenceData.details = 'Viewing promo:'
          const title = document.querySelector('head > title')
          presenceData.state = title?.textContent
        }
        else if (document.location.pathname.includes('/search')) {
          presenceData.details = 'Searching for something'
          presenceData.state = 'in the store'
          presenceData.smallImageKey = Assets.Search
        }
        else if (document.location.pathname.includes('/about')) {
          presenceData.details = 'Viewing about section of the store'
        }
        else if (document.location.pathname.includes('/wishlist')) {
          presenceData.details = 'Viewing their wishlist'
        }
        else {
          presenceData.details = 'Viewing item:'
          const title = document.querySelector(
            'body > div.page-wrap > div.base-main-wrapper > div.inner-main-wrapper > section > div.main-content > div.full-width-container.js-page-content > div > div.row-view.gray-row.showcase-row > div > div:nth-child(1) > div > div > h1',
          )
          presenceData.state = title?.textContent
        }
      }
      else if (document.location.pathname.includes('/store')) {
        presenceData.details = 'Browsing the store'
      }
      else if (document.location.pathname.includes('/refer')) {
        presenceData.details = 'Viewing refer program'
      }
      else if (document.location.pathname.includes('/accessibility')) {
        presenceData.details = 'Viewing accessibility'
      }
      else if (document.location.pathname.includes('/about')) {
        presenceData.details = 'Viewing about section'
      }
      else if (document.location.pathname.includes('/charities')) {
        presenceData.details = 'Viewing charities'
      }
      else if (document.location.pathname.includes('/rewards')) {
        presenceData.details = 'Viewing rewards'
      }
      else if (document.location.pathname.includes('/partner')) {
        presenceData.details = 'Viewing partners'
      }
      else if (document.location.pathname.includes('/publishing')) {
        presenceData.details = 'Viewing publishing'
      }
      else if (document.location.pathname.includes('/user')) {
        presenceData.details = 'Viewing their account'
      }
      else if (document.location.pathname.includes('/home')) {
        presenceData.details = 'Viewing their homepage'
      }

      if (search && search.value.length >= 2) {
        presenceData.details = 'Searching for:'
        presenceData.state = search.value
        presenceData.smallImageKey = Assets.Search
      }

      break
    }
    case 'jobs.humblebundle.com': {
      presenceData.details = 'Viewing jobs at Humble'
      break
    }
    case 'support.humblebundle.com': {
      const title = document.querySelector('head > title')
      if (
        document.location.pathname === '/'
        || title?.textContent === 'Humble Bundle'
      ) {
        presenceData.details = 'Browsing Support Center'
      }
      else {
        presenceData.details = 'Support - Reading:'
        presenceData.state = title?.textContent?.replace(' – Humble Bundle', '')
        presenceData.smallImageKey = Assets.Reading
      }

      break
    }
    case 'blog.humblebundle.com': {
      if (document.location.pathname === '/') {
        presenceData.details = 'Browsing Blog'
      }
      else {
        presenceData.details = 'Blog - Reading:'
        const title = document.querySelector('#main > article > header > h1')
        presenceData.state = title?.textContent
        presenceData.smallImageKey = Assets.Reading
      }

      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
