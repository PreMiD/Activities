import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1329883342132351058',
})
const strings = presence.getStrings({
  playing: 'general.playing',
  paused: 'general.paused',
  searchFor: 'general.searchFor',
  viewHome: 'general.viewHome',
  viewGenre: 'general.viewGenre',
  viewPage: 'general.viewPage',
  viewSeries: 'general.viewSeries',
  viewMovie: 'general.viewMovie',
  buttonViewSeries: 'general.buttonViewSeries',
  buttonViewEpisode: 'general.buttonViewEpisode',
  buttonWatchMovie: 'general.buttonWatchMovie',
  viewCategory: 'general.viewCategory',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/P/Pi%20Fansubs/assets/logo.jpeg',
}

let iFrameVideo: boolean, currentTime: number, duration: number

interface IFrameData {
  iframeVideo: {
    iFrameVideo: boolean
    currTime: number
    dur: number | null
  }
}

presence.on('iFrameData', (data: IFrameData) => {
  if (data.iframeVideo.dur) {
    ({ iFrameVideo } = data.iframeVideo)
    currentTime = data.iframeVideo.currTime
    duration = data.iframeVideo.dur
  }
})

function textContent(tags: string) {
  return document.querySelector(tags)?.textContent?.trim()
}

function getImage(tags: string) {
  return document.querySelector<HTMLImageElement>(tags)?.src ?? ActivityAssets.Logo
}

presence.on('UpdateData', async () => {
  const { pathname, href, search } = document.location
  const path = pathname.split('/')
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: (await strings).viewHome,
    type: ActivityType.Watching,
  }

  switch (path[1]) {
    case 'release': {
      presenceData.details = 'Vendo lançamentos de:'
      presenceData.state = textContent('.heading-archive')
      break
    }
    case 'genre': {
      presenceData.details = (await strings).viewGenre
      presenceData.state = textContent('.heading-archive')
      break
    }
    case 'series-de-tv': {
      if (path[2] && path[2] !== 'page') {
        presenceData.details = (await strings).viewSeries
        presenceData.state = textContent(
          '.sheader > div:nth-child(2) > h1:nth-child(1)',
        )
        presenceData.largeImageKey = getImage('.poster > img:nth-child(1)')
        presenceData.buttons = [
          {
            label: (await strings).buttonViewSeries,
            url: href,
          },
        ]
      }
      else {
        presenceData.details = 'Explorando Séries'
      }
      break
    }
    case 'filmes': {
      if (path[2] && path[2] !== 'page') {
        presenceData.name = textContent('.sheader > div:nth-child(2) > h1:nth-child(1)')
        presenceData.largeImageKey = getImage('.poster > img:nth-child(1)')
        presenceData.details = 'No Pi Fansubs'
        if (iFrameVideo && !Number.isNaN(duration)) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
            Math.floor(currentTime),
            Math.floor(duration),
          )
          presenceData.smallImageKey = Assets.Play
          presenceData.smallImageText = (await strings).playing
        }
        else {
          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = (await strings).paused
        }
        presenceData.buttons = [
          {
            label: (await strings).buttonWatchMovie,
            url: href,
          },
        ]
      }
      else {
        presenceData.details = 'Explorando Filmes'
      }
      break
    }
    case 'episodios': {
      if (path[2] && path[2] !== 'page') {
        const match = textContent('.epih1')?.match(/(\d+)x(\d+)/)

        presenceData.largeImageKey = getImage(
          '.mark-1 > div:nth-child(1) > img:nth-child(1)',
        )
        presenceData.details = 'No Pi Fansubs'
        presenceData.name = textContent('.epih1')?.replace(/: \d+x\d+/, '')
        presenceData.largeImageText = match
          ? `Season ${match[1]}, Episode ${match[2]}`
          : textContent('.epih1')
        if (iFrameVideo && !Number.isNaN(duration)) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
            Math.floor(currentTime),
            Math.floor(duration),
          )
          presenceData.smallImageKey = Assets.Play
          presenceData.smallImageText = (await strings).playing
        }
        else {
          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = (await strings).paused
        }
        presenceData.buttons = [
          {
            label: (await strings).buttonViewEpisode,
            url: href,
          },
        ]
      }
      else {
        presenceData.details = 'Explorando Episódios'
      }
      break
    }
    case 'avisos-e-informacoes': {
      presenceData.details = (await strings).viewPage
      presenceData.state = 'Avisos'
      break
    }
    case 'category': {
      presenceData.details = (await strings).viewCategory
      presenceData.state = textContent(
        '.content > header:nth-child(1) > h1:nth-child(1)',
      )?.replace('Category Archives: ', '')
      break
    }
    default: {
      if (search) {
        presenceData.details = (await strings).searchFor
        presenceData.state = decodeURI(search.split('=')[1]!).replaceAll(
          '+',
          ' ',
        )
      }
      else if (path[1]!.length >= 1) {
        presenceData.details = (await strings).viewPage
        presenceData.state = textContent('.titl')
      }
      break
    }
  }
  presence.setActivity(presenceData)
})
