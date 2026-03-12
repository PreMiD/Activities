import { Assets } from 'premid'

const presence = new Presence({
  clientId: '701623299460825108',
})

let title = 'Loading SimulatorHits'
let artist = ''
let presenter = 'AutoDJ'

function getSongData(): void {
  fetch('https://api.simulatorhits.com/now-playing?override').then((response) => {
    if (response.status === 200) {
      response.json().then((data) => {
        ({ title, artist } = data.song)
        presenter = data.presenter.username
      })
    }
  })
}

setInterval(getSongData, 10000)
getSongData()

const currentTime = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/SimulatorHits/assets/logo.png',
    smallImageText: `Current Presenter: ${presenter}`,
    smallImageKey: Assets.Play,
    startTimestamp: currentTime,
  }

  if (document.location.hostname === 'simulatorhits.com') {
    switch (document.location.pathname) {
      case '/schedule': {
        presenceData.details = 'Viewing Schedule'
        presenceData.smallImageKey = Assets.Reading

        break
      }
      case '/news': {
        presenceData.details = 'Reading News'
        presenceData.smallImageKey = Assets.Reading

        break
      }
      case '/about/meet-the-team': {
        presenceData.details = 'Viewing Staff Team'
        presenceData.smallImageKey = Assets.Reading

        break
      }
      case '/request': {
        presenceData.details = 'Making a Request'
        presenceData.smallImageKey = Assets.Writing

        break
      }
      case '/streamers': {
        presenceData.details = 'Viewing Streamers'
        presenceData.smallImageKey = Assets.Reading

        break
      }
      default: {
        presenceData.details = title
        presenceData.state = artist
      }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
