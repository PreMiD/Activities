import { Assets } from 'premid'

const presence: Presence = new Presence({
  clientId: '631379801826918400',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})
const startTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/I/IMDb/assets/logo.png',
    startTimestamp,
  }
  const url = document.URL
  if (url.includes('/videoplayer/')) {
    const [video] = document.querySelectorAll('video') as unknown as [HTMLVideoElement]
    presenceData.details = document.querySelector('h1.title')?.textContent
    presenceData.state = (
      document.querySelectorAll('.primary-relation-name')[0] as HTMLElement
    ).textContent
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/I/IMDb/assets/logo.png'
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused
      ? (await strings).pause
      : (await strings).play;
    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
      Math.floor(video.currentTime),
      Math.floor(video.duration),
    )
    if (video.paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
  }
  else if (url.includes('/find?')) {
    presenceData.details = 'Searching...'
    presenceData.smallImageKey = Assets.Search
  }
  else if (url.includes('/title/')) {
    const tokens = document.title.split(' - ')
    presenceData.details = tokens[0]
    if (tokens[1]?.trim() === 'IMDb')
      presenceData.state = 'Browsing...'
    else presenceData.state = tokens[1]?.trim()
  }
  else if (url.includes('/user/') || url.includes('/poll/')) {
    [presenceData.details] = document.title.split(' - ')
  }
  else if (url.includes('/list/')) {
    [presenceData.details] = document.title.split(' - ')
    presenceData.state = 'Viewing a list'
  }
  else if (url.includes('/search/')) {
    [presenceData.details] = document.title.split(' - ')
    presenceData.state = 'Searching...'
  }
  else if (url.includes('/name/')) {
    [presenceData.details] = document.title.split(' - ')
    if (document.title.split(' - ')[1]?.trim() === 'IMDb')
      presenceData.state = 'Filmography'
    else presenceData.state = document.title.split(' - ')[1]?.trim()
  }
  else {
    if (
      !url.includes('/ap/')
      && !url.includes('/registration/')
      && url !== 'https://www.imdb.com/'
    ) {
      [presenceData.details] = document.title.split(' - ')
    }

    presenceData.state = 'Browsing'
  }
  presence.setActivity(presenceData, true)
})
