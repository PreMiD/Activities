import { Assets } from 'premid'

const presence = new Presence({
  clientId: '636588416854917130',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/0-9/1337x/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (
    document.location.pathname === '/'
    || document.location.pathname === '/home/'
  ) {
    presenceData.details = 'Viewing home page'
  }
  else if (document.location.pathname.includes('/movie-library')) {
    presenceData.details = 'Viewing the movie library'
  }
  else if (document.location.pathname.includes('/series-library')) {
    presenceData.details = 'Viewing the series library'
  }
  else if (document.location.pathname.includes('/new-episodes')) {
    presenceData.details = 'Viewing the latest episodes'
  }
  else if (document.location.pathname.includes('/top-100')) {
    presenceData.details = 'Viewing the top 100'
  }
  else if (document.location.pathname.includes('/trending')) {
    presenceData.details = 'Viewing what\'s trending'
  }
  else if (document.location.pathname.includes('/cat/Anime/')) {
    presenceData.details = 'Viewing Anime torrents'
  }
  else if (document.location.pathname.includes('/sub/')) {
    const title = document.querySelector(
      'body > main > div > div > div.box-info.trending > div > h1',
    )

    presenceData.details = 'Viewing:'
    presenceData.state = title?.textContent
  }
  else if (document.location.pathname.includes('/cat/Apps/')) {
    presenceData.details = 'Viewing Apps Torrents'
  }
  else if (document.location.pathname.includes('/cat/Documentaries/')) {
    presenceData.details = 'Viewing Documentaries Torrents'
  }
  else if (document.location.pathname.includes('/cat/Games/')) {
    presenceData.details = 'Viewing Games Torrents'
  }
  else if (document.location.pathname.includes('/cat/Movies/')) {
    presenceData.details = 'Viewing Movies Torrents'
  }
  else if (document.location.pathname.includes('/cat/Music/')) {
    presenceData.details = 'Viewing Music Torrents'
  }
  else if (document.location.pathname.includes('/cat/Other/')) {
    presenceData.details = 'Viewing Other Torrents'
  }
  else if (document.location.pathname.includes('/cat/TV/')) {
    presenceData.details = 'Viewing TV Torrents'
  }
  else if (document.location.pathname.includes('/cat/XXX/')) {
    presenceData.details = 'Viewing XXX Torrents'
  }
  else if (document.location.pathname.includes('/upload')) {
    presenceData.details = 'Uploading something...'
  }
  else if (document.location.pathname.includes('/rules')) {
    presenceData.details = 'Reading the rules'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (document.location.pathname.includes('/contact')) {
    presenceData.details = 'Writing to 1337x'
    presenceData.smallImageKey = Assets.Writing
  }
  else if (document.location.pathname.includes('/about')) {
    presenceData.details = 'Reading about 1337x'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (document.location.pathname.includes('/torrent/')) {
    presenceData.details = 'Viewing torrent:'
    const title = document.querySelector(
      'body > main > div > div > div > div.box-info-heading.clearfix > h1',
    )
    presenceData.state = title?.textContent
  }
  else if (document.location.pathname.includes('/search')) {
    const search = document.querySelector(
      'body > main > div > div > div > div.box-info-heading.clearfix > h1 > span',
    )

    presenceData.details = 'Searching for:'
    presenceData.state = search?.textContent
    presenceData.smallImageKey = Assets.Search
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
