import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '609220157910286346',
})

async function getStrings() {
  return presence.getStrings({
    browse: 'general.browsing',
    play: 'general.playing',
    pause: 'general.paused',
    live: 'general.live',
    searchFor: 'general.searchFor',
    search: 'general.search',
    searchSomething: 'general.searchSomething',
    buttonWatchVideo: 'general.buttonWatchVideo',
    buttonWatchStream: 'general.buttonWatchStream',
  },
  )
}

let videoExists = false

presence.on(
  'iFrameData',
  (data: boolean) => {
    videoExists = data
  },
)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/N/niconico/assets/logo.png',
}

let strings: Awaited<ReturnType<typeof getStrings>>

presence.on('UpdateData', async () => {
  if (!strings)
    strings = await getStrings()

  const [privacy, buttons, ads, pause, playback] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('ads'),
    presence.getSetting<boolean>('pause'),
    presence.getSetting<boolean>('playback'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: strings.browse,
  }
  const { hostname, href, pathname } = document.location
  const checkAd = !!videoExists
  const video = document.querySelector<HTMLVideoElement>('video')

  switch (hostname) {
    case 'www.nicovideo.jp': {
      if (checkAd && ads && !privacy) {
        presenceData.details = 'Watching an ad'
        if (video && playback && !privacy)
          [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
      }
      else if (pathname.startsWith('/watch/')) {
        const ownerElement = document.querySelector(
          'a[data-anchor-area="video_information"]:not(:has(div))',
        )
        const imageElement = document.querySelector('meta[property="og:image"]')

        presenceData.details = document.querySelector('main h1')?.textContent
        presenceData.state = `${ownerElement ? ownerElement.textContent : 'Deleted User'
        } - ${pathname.match(/..\d+$/)?.[0]}`
        presenceData.largeImageKey = imageElement
          ? imageElement.attributes.getNamedItem('content')?.value
          : ActivityAssets.Logo
        presenceData.smallImageKey = pause ? !video?.paused ? Assets.Play : Assets.Pause : ''
        presenceData.smallImageText = pause ? !video?.paused ? strings.play : strings.pause : ''
        if (video && !video?.paused)
          [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)

        presenceData.buttons = [
          {
            label: strings.buttonWatchVideo,
            url: href,
          },
        ]
      }
      else if (pathname.startsWith('/search/')) {
        const searchValue = decodeURIComponent(pathname.slice('/search/'.length))

        presenceData.details = strings.searchSomething
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = strings.search

        if (searchValue.trim()) {
          presenceData.details = strings.searchFor
          presenceData.state = searchValue
        }
      }
      else if (pathname.startsWith('/tag/')) {
        const tagValue = decodeURIComponent(pathname.slice('/tag/'.length))

        presenceData.details = strings.searchSomething
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = strings.search

        if (tagValue.trim()) {
          presenceData.details = strings.searchFor
          presenceData.state = tagValue
        }
      }
      else if (pathname.startsWith('/mylist_search/')) {
        const mylistValue = decodeURIComponent(pathname.slice('/mylist_search/'.length))

        presenceData.details = strings.searchSomething
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = strings.search

        if (mylistValue.trim()) {
          presenceData.details = strings.searchFor
          presenceData.state = mylistValue
        }
      }
      else if (pathname.startsWith('/user_search/')) {
        const user_searchValue = decodeURIComponent(pathname.slice('/user_search/'.length))

        presenceData.details = strings.searchSomething
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = strings.search

        if (user_searchValue.trim()) {
          presenceData.details = strings.searchFor
          presenceData.state = user_searchValue
        }
      }
      else if (pathname.startsWith('/series_search/')) {
        const series_searchValue = decodeURIComponent(pathname.slice('/series_search/'.length))

        presenceData.details = strings.searchSomething
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = strings.search

        if (series_searchValue.trim()) {
          presenceData.details = strings.searchFor
          presenceData.state = series_searchValue
        }
      }
      break
    }

    case 'live.nicovideo.jp':
    case 'live2.nicovideo.jp': {
      if (checkAd && ads && !privacy) {
        const video = document.querySelector<HTMLVideoElement>('video')
        presenceData.details = 'Watching an ad'
        if (video && playback && !privacy)
          [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
      }
      else if (pathname.startsWith('/watch/lv')) {
        presenceData.details = document.querySelector(
          ' [class^=\'___program-title___\'] span ',
        )?.textContent ?? ''
        presenceData.state = `${
          (
            document.querySelector('[class^=\'___channel-name-anchor___\']')
            ?? document.querySelector('[class^=\'___group-name-anchor___\']')
          )?.textContent
        } - ${pathname.match(/lv\d+/)?.[0]}`
        presenceData.smallImageKey = Assets.Live
        presenceData.smallImageText = strings.live
        if (video && video?.paused)
          [presenceData.startTimestamp] = getTimestampsFromMedia(video)

        presenceData.buttons = [
          {
            label: strings.buttonWatchStream,
            url: href,
          },
        ]
      }
      break
    }

    case 'seiga.nicovideo.jp': {
      if (pathname.startsWith('/seiga/im')) {
        presenceData.details = document.querySelector('.title')?.textContent
        presenceData.state = `${
          document.querySelector('#ko_watchlist_header.user .user_name strong')
            ?.textContent
        } - ${pathname.match(/im\d+/)?.[0]}`
      }
      else if (pathname.startsWith('/watch/mg')) {
        presenceData.details = document.querySelector('.title')?.textContent
        presenceData.state = `${
          document.querySelector('.author_name')?.textContent
        } - ${pathname.match(/mg\d+/)?.[0]}`
      }

      break
    }
  }

  if ((presenceData.details || presenceData.state) && privacy) {
    presenceData.details = strings.buttonWatchVideo
    delete presenceData.state
  }

  if (presenceData.startTimestamp && (!playback || privacy))
    delete presenceData.startTimestamp

  if (playback && !privacy && presenceData.endTimestamp)
    (presenceData as PresenceData).type = ActivityType.Watching
  if (presenceData.buttons && (!buttons || privacy))
    delete presenceData.buttons

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
