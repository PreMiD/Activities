import { Assets } from 'premid'

const presence = new Presence({
  clientId: '635213174144237601',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let title
const viewString = 'Viewing '
const torrentString = '\'s torrents'

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/N/Nyaa.si/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (new URLSearchParams(window.location.search).has('q')) {
    presenceData.details = 'Searching for:'
    presenceData.state = document.querySelector('input')?.value
    presenceData.smallImageKey = Assets.Search
  }
  else if (document.location.pathname === '/') {
    presenceData.details = 'Viewing home page'
  }
  else if (document.location.pathname.includes('/rules')) {
    presenceData.smallImageKey = Assets.Reading
    presenceData.details = 'Reading the rules'
  }
  else if (document.location.pathname.includes('/help')) {
    presenceData.smallImageKey = Assets.Reading
    presenceData.details = 'Reading the help section'
  }
  else if (document.location.pathname.includes('/upload')) {
    presenceData.smallImageKey = Assets.Uploading
    presenceData.details = 'Uploading a torrent'
  }
  else if (document.location.pathname.includes('/view/')) {
    presenceData.details = 'Viewing torrent:'
    title = document.querySelector('h3.panel-title')?.textContent?.trim()
    presenceData.state = title
  }
  else if (document.location.pathname.includes('/user/')) {
    presenceData.details = viewString
      + document.querySelector('body > div > div > h3 > span')?.textContent
      + torrentString
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
