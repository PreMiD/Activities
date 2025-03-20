import { Assets } from 'premid'

const browsingTimestamp = Math.floor(Date.now() / 1000)
const presence = new Presence({
  clientId: '629653820405710848',
})
presence.on('UpdateData', () => {
  const urlParams = new URLSearchParams(window.location.search)
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/E/Ecosia/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  if (document.location.pathname === '/') {
    presenceData.details = 'Home'
  }
  else if (
    document.location.pathname.startsWith('/search')
    && urlParams.has('q')
  ) {
    presenceData.details = `Searching for ${urlParams.get('q')}`
    presenceData.state = document.querySelectorAll('.result-count')[0]?.textContent

    presenceData.smallImageKey = Assets.Search
  }
  else if (
    document.location.pathname.startsWith('/images')
    && urlParams.has('q')
  ) {
    presenceData.details = 'Ecosia Images'
    presenceData.state = `Searching for ${urlParams.get('q')}`

    presenceData.smallImageKey = Assets.Search
  }
  else if (
    document.location.pathname.startsWith('/news')
    && urlParams.has('q')
  ) {
    presenceData.details = 'Ecosia News'
    presenceData.state = `Searching for ${urlParams.get('q')}`

    presenceData.smallImageKey = Assets.Search
  }
  else if (
    document.location.pathname.startsWith('/videos')
    && urlParams.has('q')
  ) {
    presenceData.details = 'Ecosia Videos'
    presenceData.state = `Searching for ${urlParams.get('q')}`

    presenceData.smallImageKey = Assets.Search
  }
  presence.setActivity(presenceData)
})
