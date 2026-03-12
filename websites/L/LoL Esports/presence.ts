import { Assets } from 'premid'

const presence = new Presence({
  clientId: '767140375785111562',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let currentTime: number, duration: number, paused: boolean

presence.on(
  'iFrameData',
  (inc: unknown) => {
    const data = inc as {
      iframevideo: boolean
      currentTime: number
      duration: number
      paused: boolean
    }
    if (data.iframevideo === true)
      ({ currentTime, duration, paused } = data)
  },
)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/LoL%20Esports/assets/logo.jpg',
    startTimestamp: browsingTimestamp,
  }
  const path = document.location.pathname

  if (path === '/') {
    presenceData.details = 'Browsing...'
  }
  else if (path.includes('/news')) {
    presenceData.details = 'Viewing the latest news'
  }
  else if (path.includes('/schedule')) {
    presenceData.details = 'Browsing the schedule'
  }
  else if (path.includes('/live/')) {
    if (path.includes('/worlds'))
      presenceData.details = 'Watching Worlds'
    else presenceData.details = 'Watching Live'

    presenceData.state = document
      .querySelector('div.teams')
      ?.textContent
      ?.replace('VS', ' vs ')
    presenceData.smallImageKey = Assets.Live
  }
  else if (path.includes('/article/')) {
    presenceData.details = 'Reading news article:'
    presenceData.state = document.querySelector('div.title')?.textContent
    presenceData.smallImageKey = Assets.Reading
  }
  else if (path.includes('/vods/')) {
    presenceData.details = 'VODS'
    presenceData.state = 'Looking at past matches'
  }
  else if (path.includes('/vod/')) {
    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(Math.floor(currentTime), Math.floor(duration))
    presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
    if (paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
    presenceData.details = 'Watching a replay'
    presenceData.state = `${document
      .querySelector('div.teams')
      ?.textContent
      ?.replace('VS', ' vs ')} - Game ${
      document.querySelector('.game.selected')?.textContent
    }`
  }
  else if (path.includes('/standings/')) {
    presenceData.details = 'Looking at the standings'
  }

  presenceData.buttons = [
    {
      label: 'Watch Broadcast',
      url: document.URL,
    },
  ]
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
