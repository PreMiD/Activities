import { Assets } from 'premid'

const presence = new Presence({
  clientId: '790721299126943744',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/SimulatorFM/assets/logo.png',
  }

  if (document.querySelector<HTMLElement>('.fa-pause')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = `Listening to ${
      document.querySelector<HTMLElement>('#songName')?.textContent
    } by ${document.querySelector<HTMLElement>('#songArtist')?.textContent}`
    presenceData.state = `Presented by ${
      document.querySelector<HTMLElement>('#dj_name')?.textContent
    }`
    presence.setActivity(presenceData)
  }
  else {
    switch (document.location.pathname) {
      case '/': {
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Viewing'
        presenceData.state = 'Recently Played'
        presenceData.smallImageKey = Assets.Reading
        presence.setActivity(presenceData)

        break
      }
      case '/request': {
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Typing'
        presenceData.state = 'A Request'
        presenceData.smallImageKey = Assets.Reading
        presence.setActivity(presenceData)

        break
      }
      case '/timetable': {
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Viewing'
        presenceData.state = 'Timetable'
        presenceData.smallImageKey = Assets.Reading
        presence.setActivity(presenceData)

        break
      }
      case '/team': {
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Viewing'
        presenceData.state = 'Team Page'
        presenceData.smallImageKey = Assets.Reading
        presence.setActivity(presenceData)

        break
      }
      case '/apply': {
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Viewing'
        presenceData.state = 'Apply to become a presenter'
        presenceData.smallImageKey = Assets.Reading
        presence.setActivity(presenceData)

        break
      }
      case '/contact-us': {
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Viewing'
        presenceData.state = 'Contact Page'
        presenceData.smallImageKey = Assets.Reading
        presence.setActivity(presenceData)

        break
      }
    }
  }
})
