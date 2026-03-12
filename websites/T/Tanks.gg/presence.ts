const presence = new Presence({
  clientId: '1003195428642238464',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Tanks.gg/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = window.location

  if (pathname === '/') {
    presenceData.details = 'Browsing the home page'
  }
  else if (document.location.pathname.startsWith('/tank/')) {
    presenceData.details = 'Viewing a tank'
    presenceData.state = `${
      document.querySelector('.header-tank > h1')?.firstChild?.textContent
    }`
    presenceData.buttons = [
      {
        label: 'View Tank',
        url: href,
      },
    ]
  }
  else if (document.location.pathname.startsWith('/list/stats')) {
    presenceData.details = 'Browsing tanks by stats'
    presenceData.state = `Sorting by: ${
      document.querySelector(
        '#content > div > div.container-fluid.main-container > div > div.filter > div.dropdown.stat > button',
      )?.textContent
    }`
    presenceData.buttons = [
      {
        label: 'View Page',
        url: href,
      },
    ]
  }
  else if (document.location.pathname.startsWith('/techtree/')) {
    presenceData.details = 'Viewing the tech tree'
    presenceData.state = document.querySelector('.current')?.textContent
    presenceData.buttons = [
      {
        label: 'View Tech Tree',
        url: href,
      },
    ]
  }
  else if (document.location.pathname.startsWith('/compare/')) {
    presenceData.details = 'Comparing tanks'
    presenceData.buttons = [
      {
        label: 'View Comparison',
        url: href,
      },
    ]
  }
  else if (document.querySelector('[class="player-stats"]')) {
    presenceData.details = `Viewing profile (${
      document.querySelector('[class="dropdown-item active"]')?.textContent
    })`
    presenceData.state = `${
      document.querySelector(
        '#content > div > div.container-fluid.main-container > div > div.top-container > div.main-col > h2',
      )?.firstChild?.textContent
    }`
    presenceData.buttons = [
      {
        label: 'View Profile',
        url: href,
      },
    ]
  }
  else {
    switch (pathname) {
      case '/list': {
        presenceData.details = 'Browsing tanks'
        break
      }
      case '/compare': {
        presenceData.details = 'Comparing tanks'
        break
      }
      case '/about': {
        presenceData.details = 'Viewing the about page'
        break
      }
      case '/privacy': {
        presenceData.details = 'Viewing the privacy policy'
        break
      }
    }
  }
  presence.setActivity(presenceData)
})
