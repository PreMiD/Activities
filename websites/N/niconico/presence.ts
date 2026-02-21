import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

import createContext from './utils/createContext.js'
import getSettings from './utils/getSettings.js'

const presence = new Presence({
  clientId: '609220157910286346',
})

presence.on('UpdateData', async () => {
  // create context every update
  const initialized = await createContext(presence)

  // set presenceData
  const presenceData: PresenceData = {
    largeImageKey: initialized?.Logo,
    details: initialized?.presenceStrings.browse,
  }

  const { privacy, buttons, ads, pause, playback } = await getSettings(presence)
  const video = document.querySelector<HTMLVideoElement>('video')

  // get hostname and more info
  const { hostname, href, pathname } = document.location

  switch (hostname) {
    case 'www.nicovideo.jp': {
      if (pathname.startsWith('/watch/')) {
        const disabledControlElement = document.querySelectorAll<HTMLButtonElement>(
          'button[id="tooltip:«r8»:trigger"][disabled]',
        )
        if (disabledControlElement.length !== 0 && ads && !privacy) {
          presenceData.details = 'Watching an ad'
        }
        else {
        const ownerElement = document.querySelectorAll(
          'a[data-anchor-area="video_information"]:not(:has(div))',
        ).item(1)

          const imageElement = document.querySelector('meta[property="og:image"]')

          presenceData.details = document.querySelector('main h1')?.textContent
          presenceData.state = `${ownerElement ? ownerElement.textContent : 'Deleted User'
          } - ${pathname.match(/..\d+$/)?.[0]}`
          presenceData.largeImageKey = imageElement
            ? imageElement.attributes.getNamedItem('content')?.value
            : initialized?.Logo
          presenceData.smallImageKey = pause ? !video?.paused ? Assets.Play : Assets.Pause : ''
          presenceData.smallImageText = pause ? !video?.paused ? initialized?.presenceStrings.play : initialized?.presenceStrings.pause : ''
          if (video && !video?.paused)
            [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)

          presenceData.buttons = [
            {
              label: initialized?.presenceStrings.buttonWatchVideo ?? 'Watch Video',
              url: href,
            },
          ]
        }
      }
      else if (pathname.startsWith('/search/')) {
        const searchValue = decodeURIComponent(pathname.slice('/search/'.length))

        presenceData.details = initialized?.presenceStrings.searchSomething
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = initialized?.presenceStrings.search

        if (searchValue.trim()) {
          presenceData.details = initialized?.presenceStrings.searchFor
          presenceData.state = searchValue
        }
      }
      else if (pathname.startsWith('/tag/')) {
        const tagValue = decodeURIComponent(pathname.slice('/tag/'.length))

        presenceData.details = initialized?.presenceStrings.searchSomething
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = initialized?.presenceStrings.search

        if (tagValue.trim()) {
          presenceData.details = initialized?.presenceStrings.searchFor
          presenceData.state = tagValue
        }
      }
      else if (pathname.startsWith('/mylist_search/')) {
        const mylistValue = decodeURIComponent(pathname.slice('/mylist_search/'.length))

        presenceData.details = initialized?.presenceStrings.searchSomething
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = initialized?.presenceStrings.search

        if (mylistValue.trim()) {
          presenceData.details = initialized?.presenceStrings.searchFor
          presenceData.state = mylistValue
        }
      }
      else if (pathname.startsWith('/user_search/')) {
        const user_searchValue = decodeURIComponent(pathname.slice('/user_search/'.length))

        presenceData.details = initialized?.presenceStrings.searchSomething
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = initialized?.presenceStrings.search

        if (user_searchValue.trim()) {
          presenceData.details = initialized?.presenceStrings.searchFor
          presenceData.state = user_searchValue
        }
      }
      else if (pathname.startsWith('/series_search/')) {
        const series_searchValue = decodeURIComponent(pathname.slice('/series_search/'.length))

        presenceData.details = initialized?.presenceStrings.searchSomething
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = initialized?.presenceStrings.search

        if (series_searchValue.trim()) {
          presenceData.details = initialized?.presenceStrings.searchFor
          presenceData.state = series_searchValue
        }
      }
      break
    }
    case 'live.nicovideo.jp':
    case 'live2.nicovideo.jp': {
      if (pathname.startsWith('/watch/lv')) {
        presenceData.details = document.querySelector(
          ' [class^=\'___program-title___\'] span ',
        )?.textContent ?? ''
        presenceData.state = `${
          (
            document.querySelector('a.label')
            ?? document.querySelector('a.channel-name-anchor')
          )?.textContent
        } - ${pathname.match(/lv\d+/)?.[0]}`
        presenceData.smallImageKey = Assets.Live
        presenceData.smallImageText = initialized?.presenceStrings.live
        if (video && !video?.paused)
          [presenceData.startTimestamp] = getTimestampsFromMedia(video)

        presenceData.buttons = [
          {
            label: initialized?.presenceStrings.buttonWatchStream ?? 'Watch Stream',
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
    presenceData.details = initialized?.presenceStrings.buttonWatchVideo
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
