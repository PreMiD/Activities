const presence = new Presence({
  clientId: '648494004870184981',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/0-9/4gamers/assets/logo.png',
  }

  if (document.location.hostname === 'www.4gamers.com.tw') {
    if (document.location.pathname === '/') {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Viewing home page'
    }
    else if (document.location.pathname.includes('/new')) {
      presenceData.details = document.querySelectorAll('.news-header-title')[0]?.textContent
      presenceData.state = `Category: ${
        document.querySelectorAll('.news-header-category')[0]?.textContent
      }`
    }
    else if (document.location.pathname.includes('magazine')) {
      presenceData.details = document.querySelectorAll('.magazine-content-title')[0]?.textContent
      presenceData.state = `Publish Date: ${
        document.querySelectorAll('.magazine-content-time')[0]?.textContent
      }`
    }
    else if (document.location.pathname.includes('tournament')) {
      presenceData.details = '賽事專欄'
    }
  }
  if (!presenceData.details) {
    presenceData.startTimestamp = browsingTimestamp
    presence.setActivity(presenceData)
  }
  else {
    presence.setActivity(presenceData)
  }
})
