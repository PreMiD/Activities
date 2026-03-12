import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1234605936098807829',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let paused: boolean,
  currentTime: number,
  duration: number

presence.on(
  'iFrameData',
  (data: unknown) => {
    ({ currentTime, paused, duration } = data as { currentTime: number, paused: boolean, duration: number })
  },
)
presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/I/Indavide%C3%B3/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const strings = await presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
  })
  const { hostname, href, pathname } = document.location
  if (pathname === '/' && hostname === 'indavideo.hu') {
    presenceData.details = 'On the homepage'
  }
  else if (
    pathname.includes('/search/text/')
    || pathname.includes('/search/detailed/')
  ) {
    const searchBar = document.querySelector<HTMLInputElement>('#ddl_search-what')?.value
    presenceData.details = `Searching for "${searchBar}"...`
  }
  else if (pathname.includes('/video/')) {
    delete presenceData.startTimestamp
    const videoTitle = document.querySelector('.vid_header_title')?.textContent
    const uploader = document.querySelector('.vid_header_username')?.textContent
    presenceData.details = `Watching "${videoTitle?.trim()}"`
    presenceData.state = `Uploaded by ${uploader?.trim()}`
    presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = paused ? strings.pause : strings.play
    if (!paused) {
      const [startTimestamp, endTimestamp] = presence.getTimestamps(
        Math.floor(currentTime),
        Math.floor(duration),
      );
      [presenceData.startTimestamp, presenceData.endTimestamp] = [
        startTimestamp,
        endTimestamp,
      ]
    }
    presenceData.buttons = [
      {
        label: 'Watch video',
        url: href,
      },
    ]
  }
  else if (pathname.includes('/profile/')) {
    const uploader = document.querySelector('#user')?.textContent
    presenceData.details = `Browsing user profile "${uploader?.trim()}"...`
  }
  else if (pathname.includes('/myprofile/basicdata')) {
    presenceData.details = 'Managing their account details...'
  }
  else if (pathname.includes('/myprofile/customize')) {
    presenceData.details = 'Customizing their account...'
  }
  else if (pathname.includes('/myprofile/myvideos')) {
    presenceData.details = 'Looking at their videos...'
  }
  else if (pathname.includes('/myprofile/mylooprs')) {
    presenceData.details = 'Looking at their loops...'
  }
  else if (pathname.includes('/myprofile/myplaylists')) {
    presenceData.details = 'Looking at their playlists...'
  }
  else if (pathname.includes('/myprofile/mywatchlater')) {
    presenceData.details = 'Looking at their Watch Later list...'
  }
  else if (pathname.includes('/myprofile/mysubscribes')) {
    presenceData.details = 'Looking at their subscriptions...'
  }
  else if (pathname.includes('/myprofile/stripfactory')) {
    presenceData.details = 'Working on a strip embed...'
  }
  else if (hostname !== 'indavideo.hu') {
    switch (hostname) {
      case 'auto.indavideo.hu': {
        presenceData.details = 'Browsing the Autó category...'
        break
      }
      case 'film.indavideo.hu': {
        presenceData.details = 'Browsing the Film category...'
        break
      }
      case 'csimota.indavideo.hu': {
        presenceData.details = 'Browsing the Csimota category...'
        break
      }
      case 'palyazat.indavideo.hu': {
        presenceData.details = 'Browsing the Pályázat category...'
        break
      }
      case 'upload.indavideo.hu': {
        presenceData.details = 'Uploading a video...'
        break
      }
    }
  }
  else {
    presenceData.details = 'Browsing...'
  }
  presence.setActivity(presenceData)
})
