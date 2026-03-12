const presence = new Presence({
  clientId: '640997739689279498',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/LautFM/assets/logo.png',
  }

  switch (
    document
      .querySelectorAll('.btn.playbutton')[0]
      ?.getAttributeNode('data-trackingaction')
      ?.textContent
  ) {
    case 'stop': {
      presenceData.details = `Playing ${
        document.querySelector(
          '#app > div.fixed.fixed--top > div > a > div > div > span > b',
        )?.textContent
      }`
      presenceData.state = document.querySelector(
        '#app > div.fixed.fixed--top > div > a > div > div > div',
      )?.textContent
      break
    }
    case 'play': {
      presenceData.startTimestamp = browsingTimestamp
      if (document.location.pathname === '/genres') {
        presenceData.state = 'Schaut nach Genres'
      }
      else if (document.location.pathname.includes('/stations/genre/')) {
        presenceData.state = 'Sucht Stationen'
      }
      else if (document.location.pathname.includes('/stations/location')) {
        presenceData.state = 'Sucht lokale Stationen'
      }
      else if (document.location.pathname === '/stations/all') {
        presenceData.state = 'Sucht nach Top-Sender'
      }
      else {
        presenceData.details = 'Befindet sich bei Station'
        presenceData.state = document.querySelector(
          '#app > section > header > div.fm-station-header__col.fm-station-header__col--name > h1',
        )?.textContent
      }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
