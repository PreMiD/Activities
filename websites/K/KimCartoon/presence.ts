import { Assets } from 'premid'

const presence = new Presence({
  clientId: '640253556078673951',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let title: string
let iFrameVideo = false
let currentTime = 0
let duration = 0
let paused = true

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/K/KimCartoon/assets/logo.png',
}
interface IFrameData {
  iframeVideo: {
    dur: number
    iFrameVideo: boolean
    paused: boolean
    currTime: number
  }
}
function capitalizeFirstLetter(string: string) {
  if (!string)
    return 'Undefined'
  return (
    string.trim().charAt(0).toUpperCase() + string.trim().slice(1).toLowerCase()
  )
}

function fullURL(covers: string, hostname: string) {
  if (covers?.includes('https'))
    return covers
  else if (covers?.includes('Uploads'))
    return `https://${hostname}${covers}`
  else return ActivityAssets.Logo
}

presence.on('iFrameData', (inc: unknown) => {
  const data = inc as IFrameData
  ({ iFrameVideo, paused } = data.iframeVideo)
  currentTime = data.iframeVideo.currTime
  duration = data.iframeVideo.dur
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const cover = await presence.getSetting<boolean>('cover')
  const { hostname, pathname, href } = document.location

  switch (true) {
    case iFrameVideo: {
      const epsOrMovie = document.querySelector('option[selected="selected"]')?.textContent
        ?? document.querySelector('[id="selectEpisode"] > [selected]')
          ?.textContent
      const titleSplit = document
        .querySelector('[class="watch_title a_center"]')
        ?.textContent
        ?.toLowerCase()
        ?.replace('watch', '')
        ?.replace(' online free', '')
        ?.replace(' information', '')
        ?.split(' season')
        ?? document
          .querySelector('[id="navsubbar"]')
          ?.textContent
          ?.toLowerCase()
          ?.replace('watch', '')
          ?.replace(' online free', '')
          ?.replace(' information', '')
          ?.split(' season')

      title = capitalizeFirstLetter(titleSplit?.[0] ?? '')
      presenceData.details = title
      presenceData.state = epsOrMovie?.includes('Episode') && titleSplit && titleSplit.length > 1
        ? `Season ${titleSplit[1]} ${epsOrMovie}`
        : epsOrMovie?.includes('Movie')
          ? 'Movie'
          : epsOrMovie?.includes('Episode') && titleSplit?.length === 1
            ? epsOrMovie
            : `Episode ${epsOrMovie}`
      presenceData.largeImageKey = fullURL(
        document
          .querySelector('[property="og:image"]')
          ?.getAttribute('content') ?? '',
        hostname,
      )
      if (iFrameVideo && !Number.isNaN(duration)) {
        delete presenceData.startTimestamp
        presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = paused ? 'Paused' : 'Playing'
        if (!paused) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(currentTime, duration)
        }

        presenceData.buttons = [{ label: 'Watch Cartoon', url: href }]
      }
      else {
        presenceData.buttons = [{ label: 'View Cartoon', url: href }]
      }
      break
    }
    case pathname === '/': {
      presenceData.details = 'Viewing the homepage'
      break
    }
    case pathname.includes('/Genre'): {
      presenceData.details = 'Viewing all genres'
      break
    }
    case pathname.includes('/CartoonList'): {
      presenceData.details = 'Viewing the cartoonlist'
      presenceData.buttons = [{ label: 'View The Cartoonlist', url: href }]
      break
    }
    case pathname.includes('/Cartoon/'): {
      presenceData.details = 'Viewing cartoon:'
      presenceData.state = document.querySelector('[class="bigChar"]')?.textContent ?? pathname.split('/')[2]?.replace('-', ' ')
      presenceData.largeImageKey = document
        .querySelector('[property="og:image"]')
        ?.getAttribute('content') ?? ActivityAssets.Logo
      presenceData.buttons = [{ label: 'View Cartoon', url: href }]
      break
    }
    case pathname.includes('/kimcartoon.me'): {
      presenceData.details = 'Viewing the old homepage'
      break
    }
  }

  if (!cover && presenceData.largeImageKey !== ActivityAssets.Logo)
    presenceData.largeImageKey = ActivityAssets.Logo

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
