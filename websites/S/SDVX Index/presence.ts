import { Assets } from 'premid'

let browsingTimestamp = Math.floor(Date.now() / 1000)
let lastPage = document.location.href

const presence = new Presence({
  clientId: '1214435082408820776',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/SDVX%20Index/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const showButtons = await presence.getSetting<boolean>('buttons')
  const path = pathname.split('/')

  path.shift()
  if (pathname.endsWith('/'))
    path.pop()

  if (lastPage !== href) {
    lastPage = href
    browsingTimestamp = Math.floor(Date.now() / 1000)
  }

  if (path[0] === 'song.php') {
    getSongDetails(presenceData, href, showButtons)
  }
  else {
    presenceData.details = 'Looking for a chart'
    if (path[0]?.startsWith('level_sort')) {
      presenceData.state = 'Sorting by level'
    }
    else if (path[0]?.startsWith('date_sort')) {
      presenceData.state = 'Sorting by game version'
    }
    else if (path[0]?.startsWith('diff_sort')) {
      presenceData.state = 'Sorting by difficulty'
    }
    else if (path[0]?.startsWith('title_sort')) {
      presenceData.state = 'Sorting by title'
    }
    else if (path[0]?.startsWith('genre_sort')) {
      presenceData.state = 'Sorting by genre'
    }
    else if (path[0]?.startsWith('radar_sort')) {
      presenceData.state = 'Sorting by radar category'
    }
    else if (path[0]?.startsWith('search_song')) {
      presenceData.state = 'Searching...'
      presenceData.smallImageKey = Assets.Search
    }
  }
  presence.setActivity(presenceData)
})

function getSongDetails(
  presenceData: PresenceData,
  href: string,
  showButtons: boolean,
): void {
  presenceData.details = `${
    document.querySelector('#songTitle')?.textContent
  } / ${document.querySelector('#artistName')?.textContent}`
  presenceData.state = `${
    document.querySelector('.currentDiff .difficulty-abbreviation1')
      ?.textContent
  }${
    document.querySelector('.currentDiff .difficulty-level1')?.textContent
  } | BPM: ${document.querySelector('#bpmInfo')?.textContent} | Max EX: ${
    document.querySelector('#exInfo')?.textContent
  }`
  presenceData.largeImageKey = document
    .querySelector('#jacketArt')
    ?.getAttribute('src')
  presenceData.smallImageKey = Assets.Viewing
  presenceData.smallImageText = 'Viewing a chart'

  if (showButtons) {
    presenceData.buttons = [
      {
        label: 'View Chart',
        url: href,
      },
    ]
  }
}
