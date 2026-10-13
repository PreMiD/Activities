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
    const player = document.querySelector<HTMLAudioElement>('.player-contain')
    
    const songInfo = player?.querySelectorAll<HTMLElement>('.song-info h2')
    const songName = songInfo?.[0]?.textContent?.trim()
    const songArtist = songInfo?.[1]?.textContent?.trim()

    const djName = player?.querySelector<HTMLElement>('.player-avatar')?.getAttribute('alt')?.trim()

    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = `Listening to ${songName || 'Unknown Song'} by ${songArtist || 'Unknown Artist'}`
    presenceData.state = `Presented by ${djName || 'SimulatorFM'}`

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
