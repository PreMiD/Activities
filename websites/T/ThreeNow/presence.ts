import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})

let currentTime: number, duration: number, paused: boolean

interface iFrameData {
  currentTime: number
  duration: number
  paused: boolean
}

presence.on('iFrameData', (inc: unknown) => {
  const data = inc as iFrameData
  if (data.duration)
    ({ currentTime, duration, paused } = data)
})

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/ThreeNow/assets/logo.png',
    name: 'ThreeNow',
  }

  if (document.URL === 'https://www.threenow.co.nz/') {
    presenceData.details = 'Browsing the main page'
    presenceData.startTimestamp = Math.floor(Date.now() / 1000)
  }
  else if (document.location.pathname.includes('/shows/')) {
    if (document.querySelectorAll('.EpisodeSynopsis-subtitle').length >= 1) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(Math.floor(currentTime), Math.floor(duration))
      presenceData.state = document.querySelectorAll(
        '.EpisodeSynopsis-title',
      )[0]?.textContent

      if (paused) {
        presenceData.details = 'Watching a show'
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
        presenceData.smallImageKey = Assets.Pause
      }
      else {
        presenceData.details = 'Watching a show'
        presenceData.smallImageKey = Assets.Play
      }
    }
    else {
      presenceData.details = 'Viewing a show'
      presenceData.state = document.querySelectorAll(
        '.HeroSynopsis-title',
      )[0]?.textContent
    }
  }
  else if (document.location.pathname.includes('/search')) {
    presenceData.details = 'Searching shows'
    presenceData.state = (
      document.querySelectorAll('.SearchInput-input')[0] as HTMLInputElement
    ).value
    presenceData.startTimestamp = Math.floor(Date.now() / 1000)
  }
  else {
    switch (document.URL) {
      case 'https://www.threenow.co.nz/live-tv-guide': {
        presenceData.details = 'Viewing the Live TV guide'
        break
      }
      case 'https://www.threenow.co.nz/live-tv-guide/three': {
        presenceData.details = 'Watching Three Live'
        presenceData.startTimestamp = Math.floor(Date.now() / 1000)

        break
      }
      case 'https://www.threenow.co.nz/live-tv-guide/three-life': {
        presenceData.details = 'Watching ThreeLife Live'
        presenceData.startTimestamp = Math.floor(Date.now() / 1000)

        break
      }
      case 'https://www.threenow.co.nz/live-tv-guide/bravo': {
        presenceData.details = 'Watching The Edge TV Live'
        presenceData.startTimestamp = Math.floor(Date.now() / 1000)

        break
      }
      default:
        if (
          document.location.pathname.includes('/tv')
          && document.location.pathname.includes('.html')
        ) {
          presenceData.details = 'ThreeFans'
          presenceData.state = 'Checking out information for fans!'
        }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
