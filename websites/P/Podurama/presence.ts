import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1234257543467892826',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/P/Podurama/assets/logo.png',
}

enum Pages {
  home = 'home',
  podcast = 'podcast',
  episode = 'episode',
  bookmarks = 'bookmarks',
  recent = 'recently-played',
  Trending = 'top-charts',
  myPodcasts = 'subscribed-podcasts',
  newEps = 'new-episodes',
  myFiles = 'my-files',
  favorites = 'favourites',
  tags = 'tags',
  // eslint-disable-next-line ts/no-duplicate-enum-values
  Bookmarks = 'bookmarks',
  followed = 'followed-playlists',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const [, sect, subsect] = document.location.pathname.split('/')
  const player = document.querySelector('.audio-player')
  const useTimeLeft = await presence.getSetting<boolean>('usetimeleft')

  if (player) {
    const audioEl = document.querySelector('audio')!
    const [startTS, endTS] = presence.getTimestampsfromMedia(audioEl)
    presenceData.details = 'Listening to a Podcast'
    presenceData.state = player.querySelector('.episode-title')?.textContent

    if (audioEl.paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
    else if (useTimeLeft) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = [
        startTS,
        endTS,
      ]
    }
    else {
      presenceData.startTimestamp = startTS
    }

    presenceData.smallImageKey = audioEl.paused ? Assets.Pause : Assets.Play
    presenceData.largeImageKey = player
      ?.querySelector('.episode-details')
      ?.querySelector('img')
      ?.src
  }
  else {
    switch (sect) {
      case Pages.podcast:
        {
          const header = document.querySelector('header')
          presenceData.details = 'Viewing Podcast Page'
          presenceData.state = header?.querySelector('h1')?.textContent
          presenceData.largeImageKey = header?.querySelector('img')?.src
        }
        break

      case Pages.episode: {
        presenceData.details = 'Viewing Podcast Page'
        presenceData.state = document.querySelector('.episode-title')?.textContent
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.main-img-loc')?.src
        break
      }

      case Pages.bookmarks:
        presenceData.details = 'Browsing Bookmarks'
        break

      case Pages.Trending: {
        presenceData.details = 'Browsing Trending Podcasts!'
        presenceData.state = `In the '${subsect?.replaceAll(
          '-',
          ' ',
        )}' category`
        break
      }

      case Pages.favorites:
        presenceData.details = 'Browsing Favorite Episodes!'
        break

      case Pages.followed:
        presenceData.details = 'Browsing Followed Podcasts!'
        break

      case Pages.myFiles:
        presenceData.details = 'Browsing My Files!'
        break

      case Pages.myPodcasts:
        presenceData.details = 'Browsing Subcribed Podcasts!'
        break

      case Pages.newEps:
        presenceData.details = 'Searching for New Episodes!'
        break

      case Pages.recent:
        presenceData.details = 'Browsing Recently Played!'
        break

      case Pages.tags:
        presenceData.details = 'Browsing Collections!'
        break

      default:
        presenceData.details = 'Browsing the Site'
    }
  }

  presence.setActivity(presenceData)
})
