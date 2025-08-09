import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let npTitle: string, npArtist: string, npOnAir: string, npListeners: number

function fetchStats(): void {
  fetch('https://staff.weareharmony.net/api/nowplaying')
    .then(result => result.json())
    .then((result) => {
      npTitle = result.song.title
      npArtist = result.song.artist
      npOnAir = result.onAir.name
      npListeners = result.listeners
    })
}

fetchStats()
setInterval(fetchStats, 10000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/Harmony/assets/logo.png',
    smallImageKey: Assets.Live,
    name: 'Harmony',
  }

  if (document.location.hash.startsWith('#/')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.smallImageText = `Listeners: ${npListeners} | Live DJ: ${npOnAir}`
    if (document.location.hash === '#/Home') {
      presenceData.details = `🎶 ➜ ${npTitle}`
      presenceData.state = `🎤 ➜ ${npArtist}`
    }
    else if (document.location.hash.startsWith('#/User')) {
      presenceData.details = `📰 ➜ Viewing user: ${
        document.querySelector(
          'body > div.page-container > div > div.p-container > p',
        )?.textContent
      }`
      presenceData.state = `💿 ➜ ${npOnAir}`
    }
    else if (document.location.hash.startsWith('#/Song')) {
      presenceData.details = `📰 ➜ Viewing song: ${
        document.querySelector('.sp-title')?.textContent
      }`
      presenceData.state = `🎤 ➜ ${
        document.querySelector('.sp-artist')?.textContent
      }`
    }
    else if (document.location.hash.startsWith('#/Library')) {
      presenceData.details = `📰 ➜ Viewing page: ${
        (document.querySelector('.mlib') || document.querySelector('.olib'))
          ?.textContent
      }`
      presenceData.state = `💿 ➜ ${npOnAir}`
    }
    else if (document.location.hash.startsWith('#/Special.Blank')) {
      presenceData.details = `📰 ➜ ${
        document.querySelector('#navbar > ul.dropdown.ubox > div > h1')
          ?.textContent
      } got FUNKY TOWNED!`
      presenceData.state = `💿 ➜ ${npOnAir}`
    }
    else {
      presenceData.details = `📰 ➜ Viewing page: ${
        document.location.hash.slice(2).split('?')[0]
      }`
      presenceData.state = `💿 ➜ ${npOnAir}`
    }
  }
  presence.setActivity(presenceData)
})
