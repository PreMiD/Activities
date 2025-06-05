import type { VideoData } from './iframe.js'
import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const name = 'Playlist Randomizer'
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/P/Playlist%20Randomizer/assets/logo.png',
}

enum TitleSelection {
  Activity = 0,
  Playlist = 1,
  Artist = 2,
  Song = 3,
}

enum ImageSelection {
  Playlist = 0,
  Song = 1,
}

let videoData: VideoData | null = null
presence.on('iFrameData', (data: VideoData) => {
  videoData = data
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name,
    type: ActivityType.Listening,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  if (pathname === '/') {
    presenceData.details = 'Browsing Home Page'
  }
  else if (pathname === '/about') {
    presenceData.details = 'Reading the About Page'
  }
  else {
    const [titleSelection, largeImage] = await Promise.all([
      presence.getSetting<TitleSelection>('title'),
      presence.getSetting<ImageSelection>('largeImage'),
    ])
    const playlistTitle = document.querySelector('main h2')?.textContent
    const playlistImage = document.querySelector<HTMLImageElement>('.MuiPaper-root > .MuiGrid-root img')
    const activeSong = document.querySelector('li.Mui-selected')
    const videoImage = activeSong?.querySelector('img')
    const activeArtist = activeSong?.querySelector('.MuiTypography-caption')?.textContent
    const activeSongTitle = activeSong?.querySelector('.MuiListItemText-primary')?.firstChild?.textContent

    presenceData.largeImageKey = (largeImage === ImageSelection.Playlist
      ? playlistImage
      : videoImage
    ) ?? ActivityAssets.Logo

    switch (titleSelection) {
      case TitleSelection.Artist: {
        presenceData.name = activeArtist ?? name
        presenceData.details = activeSongTitle
        presenceData.state = playlistTitle
        break
      }
      case TitleSelection.Playlist: {
        presenceData.name = playlistTitle ?? name
        presenceData.details = activeSongTitle
        presenceData.state = activeArtist
        break
      }
      case TitleSelection.Song: {
        presenceData.name = activeSongTitle ?? name
        presenceData.details = `By ${activeArtist}`
        presenceData.state = playlistTitle
        break
      }
      default: {
        presenceData.details = playlistTitle
        presenceData.state = `${activeArtist} - ${activeSongTitle}`
      }
    }

    if (videoData) {
      presenceData.smallImageKey = videoData.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = videoData.paused ? 'Paused' : 'Playing'
      if (!videoData.paused) {
        presenceData.startTimestamp = videoData.startTimestamp
        presenceData.endTimestamp = videoData.endTimestamp
      }
      presenceData.buttons = [{
        label: 'View Playlist',
        url: href,
      }, {
        label: 'View Song on YouTube',
        url: `https://youtu.be/${videoData.id}`,
      }]
    }
  }

  presence.setActivity(presenceData)
})
