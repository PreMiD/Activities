import { ActivityType, Assets, getTimestampsFromMedia, StatusDisplayType } from 'premid'

const presence = new Presence({
  clientId: '1206601150607134780',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
async function getStrings() {
  return presence.getStrings(
    {
      buttonWatchStream: 'general.buttonWatchStream',
      buttonWatchVideo: 'general.buttonWatchVideo',
      live: 'general.live',
      paused: 'general.paused',
      playing: 'general.playing',
      search: 'general.search',
      searchSomething: 'general.searchSomething',
      viewHome: 'general.viewHome',
      viewList: 'general.viewList',
      viewSeries: 'general.viewSeries',
      waitingLive: 'general.waitingLive',
      waitingLiveThe: 'general.waitingLiveThe',
      watchingLive: 'general.watchingLive',
      watchingVid: 'general.watchingVid',
    },
  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

interface PresenceRow {
  text: string | undefined
  url: string | undefined
}

function setProgramRows(data: PresenceData, program: PresenceRow, other: PresenceRow, programFirst: boolean, showProgram: boolean) {
  const [details, state] = programFirst ? [program, other] : [other, program]
  data.details = details.text
  data.detailsUrl = details.url
  data.state = state.text
  data.stateUrl = state.url
  if (showProgram)
    data.statusDisplayType = programFirst ? StatusDisplayType.Details : StatusDisplayType.State
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: 'Tver',
    type: ActivityType.Watching,
    statusDisplayType: StatusDisplayType.Name,
    largeImageKey: 'https://i.imgur.com/ERIpjV7.png',
    startTimestamp: browsingTimestamp,
  }
  const [
    buttons,
    displayType,
    liveDetails,
    newLang,
    privacy,
    showTimestamps,
    videoDetails,
    videoPic,
  ] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<number>('displayType'),
    presence.getSetting<number>('liveDetails'),
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<number>('videoDetails'),
    presence.getSetting<boolean>('videoPic'),
  ])
  const { pathname, href } = document.location
  const [, page, contentId] = pathname.split('/')

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  presenceData.details = strings.viewHome
  function setList(selector: string, isSeries = false) {
    presenceData.details = isSeries ? strings.viewSeries : strings.viewList
    if (privacy)
      return
    presenceData.state = document.querySelector(selector)?.textContent?.trim()
    presenceData.stateUrl = href
    if (isSeries && displayType === 1)
      presenceData.statusDisplayType = StatusDisplayType.State
  }

  switch (page) {
    case 'live': {
      const liveItem = document.querySelector('a[class*=\'LiveItem_active\']')
      const liveStatus = liveItem?.querySelector('[data-type]')?.getAttribute('data-type')
      const isScheduled = liveStatus === 'scheduled'
      if (privacy) {
        presenceData.details = isScheduled ? strings.waitingLive : strings.watchingLive
        break
      }
      const description = document.querySelector('[class*=\'LiveDescription_root\']')
      const tvStation = description?.querySelector('[class*=\'LiveDescription_producer\']')?.textContent?.trim()
      const title = description?.querySelector('h1')?.textContent?.trim()
      const seriesUrl = description?.querySelector<HTMLAnchorElement>('a[class*=\'LiveDescription_seriesLink\']')?.href
      if (videoPic) {
        const image = liveItem?.querySelector<HTMLImageElement>('img')?.src
        if (image)
          presenceData.largeImageKey = image
      }
      setProgramRows(
        presenceData,
        { text: title, url: seriesUrl },
        { text: isScheduled ? strings.waitingLiveThe : tvStation, url: href },
        liveDetails === 1,
        displayType === 1,
      )
      presenceData.largeImageUrl = href
      presenceData.buttons = [{ label: strings.buttonWatchStream, url: href }]
      if (liveStatus === 'live') {
        presenceData.smallImageKey = Assets.Live
        presenceData.smallImageText = strings.live
      }
      break
    }
    case 'episodes': {
      if (privacy) {
        presenceData.details = strings.watchingVid
        break
      }
      if (videoPic)
        presenceData.largeImageKey = `https://statics.tver.jp/images/content/thumbnail/episode/small/${contentId}.jpg`
      const titles = document.querySelector('[class*=\'EpisodeDescription_titleWrapper\'] > div')
      const seriesTitle = titles?.querySelector('h2')?.textContent?.trim()
      const episodeTitle = titles?.querySelector('h1')?.textContent?.trim()
      const seriesUrl = document.querySelector<HTMLAnchorElement>('a[class*=\'EpisodeDescription_seriesLink\']')?.href
      setProgramRows(
        presenceData,
        { text: seriesTitle, url: seriesUrl },
        { text: episodeTitle, url: href },
        videoDetails === 0,
        displayType === 1,
      )
      presenceData.largeImageUrl = href
      const video = document.querySelector<HTMLVideoElement>('video')
      if (video) {
        if (showTimestamps && !video.paused) {
          const [start, end] = getTimestampsFromMedia(video)
          if (end > start) {
            presenceData.startTimestamp = start
            presenceData.endTimestamp = end
          }
        }
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video.paused ? strings.paused : strings.playing
      }
      presenceData.buttons = [{ label: strings.buttonWatchVideo, url: href }]
      break
    }
    case 'series': {
      if (contentId)
        setList('[class*=\'SeriesInfo_title\']', true)
      break
    }
    case 'specials': {
      if (pathname === '/specials') {
        presenceData.details = strings.viewList
        if (!privacy)
          presenceData.detailsUrl = href
      }
      else {
        setList('[class*=\'SpecialFeature_title\']')
      }
      break
    }
    case 'mypage': {
      if (['fav', 'later', 'resume'].includes(contentId ?? ''))
        setList('main [role="tab"][aria-selected="true"]')
      break
    }
    case 'rankings': {
      if (contentId === 'episode')
        setList('main [role="tab"][aria-selected="true"]')
      break
    }
    case 'tags': {
      if (contentId)
        setList('[class*=\'TagTitle_tagTitle\']')
      break
    }
    case 'categories': {
      if (contentId)
        setList(`a[href="${pathname}"]`)
      break
    }
    case 'search': {
      presenceData.details = strings.searchSomething
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = strings.searchSomething
      if (!privacy) {
        const keyword = decodeURIComponent(contentId ?? '')
        if (keyword) {
          presenceData.details = strings.search
          presenceData.state = keyword
          presenceData.stateUrl = href
        }
      }
      break
    }
  }

  if (!showTimestamps) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }
  if (!buttons)
    delete presenceData.buttons

  presence.setActivity(presenceData)
})
