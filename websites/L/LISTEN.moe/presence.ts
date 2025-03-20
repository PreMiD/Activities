import { Assets } from 'premid'

const presence: Presence = new Presence({
  clientId: '615652705565933581',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  live: 'general.live',
})
const presenceData: PresenceData = {
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/LISTEN.moe/assets/logo.jpg',
}
const audio = document.querySelector('audio')
let path: string
let startTimestamp: number
let playback: boolean
let elemt
let artists = []
let track: string
let artist: string

function resetTimestamp() {
  startTimestamp = Math.floor(Date.now() / 1000)
}

function getArtists(): string {
  artists = []
  elemt = document.querySelector(
    'span.ja.player-song-artist-container',
  )?.childNodes

  if (elemt) {
    for (let i = 0; i < elemt.length; i++)
      artists.push(elemt[i]?.textContent?.replace(/\s+/g, ' ').trim())

    artist = artists.join(' ')
  }
  return artist
}

function getTrack(): string {
  track = document
    .querySelector('span.ja.player-song-title')
    ?.textContent
    ?.replace(/\s+/g, ' ')
    .trim()
    .split('[')[0]
    ?.trim() ?? 'Loading....'
  return track
}

if (audio) {
  audio.onplay = function (): void {
    resetTimestamp()
  }
  audio.onpause = function (): void {
    resetTimestamp()
  }
}

presence.on('UpdateData', async () => {
  path = window.location.pathname
  playback = !!audio && !audio.paused

  if (playback) {
    presenceData.details = getTrack()
    presenceData.state = getArtists()
    presenceData.smallImageKey = Assets.Live
    presenceData.smallImageText = (await strings).live
    presenceData.startTimestamp = startTimestamp
  }
  else if (path.includes('music')) {
    track = (document.querySelectorAll('input.search')[1] as HTMLInputElement)
      .value

    presenceData.details = 'Searching for a music'
    presenceData.state = track
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Searching'
    presenceData.startTimestamp = startTimestamp
  }
  else if (path.includes('u')) {
    const user = document.querySelector('div.profileName > span')?.textContent
    presenceData.details = `Viewing ${user}'s profile`
    if (path.includes('favorites'))
      presenceData.state = 'Favorites'
    else if (path.includes('uploads'))
      presenceData.state = 'Uploads'
    else delete presenceData.state
  }
  else {
    presenceData.details = 'Not playing'
    presenceData.state = 'Home'
  }
  presence.setActivity(presenceData, true)
})
