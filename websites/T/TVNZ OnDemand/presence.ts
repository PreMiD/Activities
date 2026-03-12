import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})

let currentTime: number, duration: number, paused: boolean, playback

presence.on(
  'iFrameData',
  (inc: unknown) => {
    const data = inc as { duration: number, currentTime: number, paused: boolean }
    playback = !!data.duration
    if (playback)
      ({ currentTime, duration, paused } = data)
  },
)

presence.on('UpdateData', () => {
  const [startTimestamp, endTimestamp] = presence.getTimestamps(
    Math.floor(currentTime),
    Math.floor(duration),
  )
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/TVNZ%20OnDemand/assets/logo.png',
    name: 'TVNZ OnDemand',
  }

  if (document.location.href.includes('login.tech.tvnz.co.nz')) {
    presenceData.details = 'Logging in...'
  }
  else if (document.location.pathname.includes('/1-news-special')) {
    presenceData.details = 'Watching a live 1 NEWS Special'
    presenceData.state = document.querySelectorAll('.Hero-title')[1]?.textContent
    presenceData.startTimestamp = Math.floor(Date.now() / 1000)
  }
  else if (
    document.location.pathname.includes('/choose-profile')
    || document.location.pathname.includes('/profiles-welcome')
  ) {
    presenceData.details = 'Choosing a profile'
  }
  else if (
    document.URL === 'https://www.tvnz.co.nz/'
    || document.URL === 'https://www.tvnz.co.nz'
    || document.URL === 'https://www.tvnz.co.nz/shows'
  ) {
    presenceData.details = 'Browsing the main page'
    presenceData.startTimestamp = Math.floor(Date.now() / 1000)
  }
  else if (document.location.pathname.includes('/episodes/')) {
    if (!Number.isNaN(endTimestamp)) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = [
        startTimestamp,
        endTimestamp,
      ]
    }

    presenceData.state = document.querySelectorAll('.Player-title')[0]?.textContent

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
  else if (document.location.pathname.includes('/shows/')) {
    presenceData.details = 'Viewing a show'
    presenceData.state = document.querySelectorAll('.Hero-title')[1]?.textContent
  }
  else if (
    document.URL === 'https://www.tvnz.co.nz/categories/my-favourites'
  ) {
    presenceData.details = 'Browsing favourite shows'
    presenceData.startTimestamp = Math.floor(Date.now() / 1000)
  }
  else if (document.location.pathname.includes('/categories/')) {
    presenceData.details = 'Browsing a category'
    presenceData.startTimestamp = Math.floor(Date.now() / 1000)
    presenceData.state = document.querySelectorAll('.PageHeader-title')[0]?.textContent
  }
  else if (
    document.location.pathname.includes('/manage-profiles')
    || document.location.pathname.includes('/add-profile')
  ) {
    presenceData.details = 'Managing profiles'
  }
  else if (document.location.pathname.includes('/settings')) {
    presenceData.details = 'Managing account details'
  }
  else if (document.location.pathname.includes('/search')) {
    presenceData.details = 'Searching shows'
    presenceData.startTimestamp = Math.floor(Date.now() / 1000)
  }
  else {
    switch (document.URL) {
      case 'https://www.tvnz.co.nz/livetv': {
        presenceData.details = 'Viewing the Live TV guide'
        break
      }
      case 'https://www.tvnz.co.nz/livetv/tvnz-1': {
        presenceData.details = 'Watching TVNZ 1 Live'
        presenceData.startTimestamp = Math.floor(Date.now() / 1000)
        presenceData.state = document.querySelectorAll('.Player-title')[0]?.textContent

        break
      }
      case 'https://www.tvnz.co.nz/livetv/tvnz-2': {
        presenceData.details = 'Watching TVNZ 2 Live'
        presenceData.startTimestamp = Math.floor(Date.now() / 1000)
        presenceData.state = document.querySelectorAll('.Player-title')[0]?.textContent

        break
      }
      case 'https://www.tvnz.co.nz/livetv/tvnz-duke': {
        presenceData.details = 'Watching TVNZ Duke Live'
        presenceData.startTimestamp = Math.floor(Date.now() / 1000)
        presenceData.state = document.querySelectorAll('.Player-title')[0]?.textContent

        break
      }
      default:
        if (document.location.pathname.includes('/one-news'))
          presenceData.details = 'Browsing 1 NEWS'
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
