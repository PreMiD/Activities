import {
  ActivityType,
  Assets,
  getTimestamps,
  getTimestampsFromMedia,
  timestampFromFormat,
} from 'premid'

import {
  ActivityAssets,
  checkStringLanguage,
  cropPreset,
  exist,
  fetchCache,
  getChannel,
  getLocalizedAssets,
  getSetting,
  getThumbnail,
  limitText,
  presence,
  sanitize,
  strings,
} from './util.js'

const browsingTimestamp = Math.floor(Date.now() / 1000)
const slideshow = presence.createSlideshow()

let localizedAssets = getLocalizedAssets('default')
let oldPath = document.location.pathname

presence.on('UpdateData', async () => {
  const { hostname, href, pathname } = document.location
  const pathParts = pathname.split('/')
  const presenceData: PresenceData = {
    name: 'RTLplay',
    largeImageKey: ActivityAssets.Animated, // Default
    largeImageText: 'RTLplay',
    type: ActivityType.Watching,
  } as PresenceData
  const [
    newLang,
    usePresenceName,
    useChannelName,
    usePrivacyMode,
    useTimestamps,
    useButtons,
    usePoster,
  ] = await Promise.all([
    getSetting<string>('lang', 'en'),
    getSetting<boolean>('usePresenceName'),
    getSetting<boolean>('useChannelName'),
    getSetting<boolean>('usePrivacyMode'),
    getSetting<boolean>('useTimestamps'),
    getSetting<number>('useButtons'),
    getSetting<boolean>('usePoster'),
  ])

  // Update strings if user selected another language.
  if (!checkStringLanguage(newLang))
    return

  localizedAssets = getLocalizedAssets(newLang)

  if (oldPath !== pathname) {
    oldPath = pathname
    slideshow.deleteAllSlides()
  }

  switch (true) {
    /* MAIN PAGE (Page principale)

    https://www.rtlplay.be/rtlplay
    https://www.radiocontact.be/
    https://www.belrtl.be/index-bel-rtl.htm
    https://mint.be/ (is not added because it's also the media player page)
    */
    case (pathname === '/'
      || (['rtlplay', 'index-bel-rtl.htm'].includes(pathParts[1]!) && !pathParts[2]))
    && hostname !== 'mint.be': {
      console.warn(hostname)
      presenceData.details = strings.browsing
      presenceData.name = getChannel(hostname).name
      presenceData.largeImageKey = getChannel(hostname).animated
      presenceData.largeImageText = getChannel(hostname).name

      if (usePrivacyMode) {
        presenceData.state = strings.viewAPage

        presenceData.smallImageKey = ActivityAssets.Privacy
        presenceData.smallImageText = strings.privacy
      }
      else {
        presenceData.state = strings.viewHome

        presenceData.smallImageKey = ActivityAssets.Binoculars
        presenceData.smallImageText = strings.browsing

        if (useTimestamps)
          presenceData.startTimestamp = browsingTimestamp
      }
      break
    }

    /* RESEARCH PAGE (Page de recherche)

    (https://www.rtlplay.be/rtlplay/recherche) */
    case ['recherche'].includes(pathParts[2]!): {
      if (usePrivacyMode) {
        presenceData.details = strings.browsing
        presenceData.state = strings.searchSomething

        presenceData.smallImageKey = ActivityAssets.Privacy
        presenceData.smallImageText = strings.privacy
      }
      else {
        const searchBarSelector = '[class*="InputField-module-scss-module"]'
        if (!exist(searchBarSelector))
          console.warn('Search bar not found, presence may need update to fit the new website design')

        const searchQuery = document.querySelector(searchBarSelector)?.getAttribute('value') ?? '{}'

        presenceData.details = strings.browsing
        presenceData.state = searchQuery
          ? `${strings.searchFor} ${searchQuery}`
          : strings.searchSomething

        if (useTimestamps)
          presenceData.startTimestamp = browsingTimestamp

        if (useButtons) {
          presenceData.buttons = [
            {
              label: strings.buttonViewPage,
              url: href, // We are not redirecting directly to the raw video stream, it's only the media page
            },
          ]
        }
      }

      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = strings.search
      break
    }

    /* MY LIST (Ma Liste)

    (https://www.rtlplay.be/rtlplay/ma-liste) */
    case ['ma-liste'].includes(pathParts[2]!): {
      presenceData.details = strings.browsing

      if (usePrivacyMode) {
        presenceData.state = strings.viewAPage

        presenceData.smallImageKey = ActivityAssets.Privacy
        presenceData.smallImageText = strings.privacy
      }
      else {
        presenceData.state = strings.viewlist
        if (useButtons) {
          presenceData.buttons = [
            {
              label: strings.buttonViewPage,
              url: href, // We are not redirecting directly to the raw video stream, it's only the media page
            },
          ]
        }
      }
      break
    }

    /* CATEGORY PAGE / COLLECTION PAGE (Page de catégorie)

    (https://www.rtlplay.be/rtlplay/collection/c2dBY3Rpb24) */
    case ['series', 'films', 'divertissement'].includes(pathParts[3]!) || pathParts[2] === 'collection': {
      if (usePrivacyMode) {
        presenceData.state = strings.viewAPage

        presenceData.smallImageKey = ActivityAssets.Privacy
        presenceData.smallImageText = strings.privacy
      }
      else {
        const categoryTitleSelector = '[class*=MainLayout-module-scss-module] h1'
        if (!exist(categoryTitleSelector))
          console.warn('Category title not found, presence may need update to fit the new website design')

        presenceData.state = strings.viewCategory.replace(':', '')
        presenceData.details = document.querySelector(categoryTitleSelector)?.textContent?.trim() || ''

        presenceData.smallImageKey = ActivityAssets.Binoculars
        presenceData.smallImageText = strings.browsing

        if (useTimestamps)
          presenceData.startTimestamp = browsingTimestamp

        if (useButtons) {
          presenceData.buttons = [
            {
              label: strings.buttonViewPage,
              url: href, // We are not redirecting directly to the raw video stream, it's only the media page
            },
          ]
        }
      }
      break
    }

    /* DIRECT PAGE (Page des chaines en direct)

    https://www.rtlplay.be/rtlplay/direct/tvi
    https://www.radiocontact.be/live/
    https://www.radiocontact.be/player/
    https://www.belrtl.be/player/webradio7
    https://mint.be/ (exceptionnaly is also the main page)
    */
    case (hostname === 'www.rtlplay.be' && ['direct'].includes(pathParts[2]!))
      || (['www.radiocontact.be', 'www.belrtl.be'].includes(hostname)
        && ['player', 'live'].includes(pathParts[1]!))
      || hostname === 'mint.be' : {
      switch (true) {
        case hostname === 'www.rtlplay.be': {
          if (usePrivacyMode) {
            presenceData.details = strings.watchingLive

            presenceData.smallImageKey = ActivityAssets.Privacy
            presenceData.smallImageText = strings.privacy
          }
          else {
            const buttonsSelector = '[class*=ActionButton-module-scss-module] > div > span'
            if (!exist(buttonsSelector))
              console.warn('Buttons not found, presence may need update to fit the new website design')

            const buttons = document.querySelectorAll(buttonsSelector)
            if (document.querySelector('[class*=AdBreakStats-module-scss-module] > span')) {
              presenceData.smallImageKey = localizedAssets.Ad
              presenceData.smallImageText = strings.watchingAd
            }
            else if (buttons[0]?.textContent.toLowerCase() === 'play') {
              // State paused
              presenceData.smallImageKey = Assets.Pause
              presenceData.smallImageText = strings.pause
            }
            else if (buttons[2]?.textContent.toLowerCase() === 'tetour au live') {
              // State deferred
              presenceData.smallImageKey = ActivityAssets.Deferred
              presenceData.smallImageText = strings.deferred
            }
            else {
              // State live
              presenceData.smallImageKey = ActivityAssets.LiveAnimated
              presenceData.smallImageText = strings.live
            }

            const items = Array.from(document.querySelectorAll<HTMLAnchorElement>('[class*=LiveChannelsItem-module-scss-module] [class*=link]'))
            const livestreamIdx = items.findIndex((el) => {
              const href = el.getAttribute('href') || ''
              if (!href)
                return false
              return new URL(href, window.location.origin).pathname === pathname
            })
            const livestreamItems = document.querySelectorAll('[class*=LiveChannelsItem-module-scss-module] [class*=title]')
            if (
              !useChannelName
              && (livestreamItems[livestreamIdx])
              && !['contact', 'bel'].includes(pathParts[3]!) // Radio show name are not relevant
            ) {
              presenceData.name = livestreamItems[livestreamIdx]?.textContent || ''
            }
            else {
              presenceData.name = getChannel(pathParts[3]!).name
            }

            presenceData.type = getChannel(pathParts[3]!).type

            presenceData.state = strings.watchingLive
            presenceData.details = livestreamItems[livestreamIdx]?.textContent || ''

            if (['contact', 'bel'].includes(pathParts[3]!)) {
              // Songs played in the livestream are the same as the audio radio ones but with video clips
              // Fetch the data from the Radioplayer API. It is used on the official radio contact and bel rtl websites
              const response = await fetch(
                getChannel(pathParts[3]!).radioAPI!,
              )
              const dataString = await response.text()
              const media = JSON.parse(dataString)

              presenceData.largeImageKey = await getThumbnail(
                media.results.now.imageUrl,
              )
              presenceData.state = media.results.now.artistName ? `${media.results.now.name} - ${media.results.now.artistName}` : getChannel(pathParts[3]!).name

              if (usePresenceName && !useChannelName) {
                const detail = media.results.now.programmeName || media.results.now.artistName
                presenceData.name = detail ? strings.on.replace('{0}', detail).replace('{1}', presenceData.name) : presenceData.name
              }

              presenceData.largeImageText = strings.watchingLiveMusic

              presenceData.smallImageKey = ActivityAssets.ListeningLive
              presenceData.smallImageText = strings.listeningMusic
            }
            else {
              presenceData.largeImageKey = getChannel(pathParts[3]!).logo
              presenceData.largeImageText = getChannel(pathParts[3]!).name
            }

            if (useTimestamps) {
              const timeStatSelector = '[class*=TimeStat-module-scss-module]'
              if (exist(timeStatSelector)) {
                // Video method: Uses video viewing statistics near play button if displayed
                [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
                  timestampFromFormat(
                    document
                      .querySelector(timeStatSelector)
                      ?.textContent
                      ?.split('/')[0]
                      ?.trim() ?? '',
                  ),
                  timestampFromFormat(
                    document
                      .querySelector(timeStatSelector)
                      ?.textContent
                      ?.split('/')[1]
                      ?.trim() ?? '',
                  ),
                )
              }
              else {
                console.warn('Timestamps not found, presence may need update to fit the new website design')
              }
            }

            if (useButtons) {
              presenceData.buttons = [
                {
                  label: strings.buttonWatchStream,
                  url: href, // We are not redirecting directly to the raw video stream, it's only the media page
                },
              ]
            }
          }
          break
        }
        // Webradio websites
        case ['www.radiocontact.be', 'www.belrtl.be', 'mint.be'].includes(hostname): {
          const webradio = pathParts[2] || hostname
          if (usePrivacyMode) {
            presenceData.details = strings.listeningMusic

            presenceData.type = ActivityType.Listening

            presenceData.smallImageKey = ActivityAssets.ListeningLive
            presenceData.smallImageText = strings.listeningMusic
          }
          else {
            presenceData.name = getChannel(webradio).name
            presenceData.type = getChannel(webradio).type

            if (exist('button[aria-label="stop"]')) {
              presenceData.smallImageKey = ActivityAssets.ListeningLive
              presenceData.smallImageText = strings.listeningMusic
            }
            else {
              presenceData.smallImageKey = ActivityAssets.ListeningPaused
              presenceData.smallImageText = strings.pause
            }

            // Fetch the data from the API using fetchCache
            let data

            if (!pathParts[2]) {
              // Main radio use radioplayer api
              const apiData = await fetchCache(getChannel(hostname).radioAPI!) as any
              data = apiData.results.now
            }
            else {
              // Secondary webradio use in house api
              const playlistData = await fetchCache(getChannel(pathParts[2]).radioAPI!) as any[]

              // Find the currently playing song by comparing timestamps
              const now = Date.now() / 1000 // Current time in seconds
              const currentSong = playlistData.find((song: any) => {
                const startTime = new Date(song.StartTime).getTime() / 1000
                const endTime = new Date(song.EndTime).getTime() / 1000
                return startTime <= now && now <= endTime
              }) || playlistData[0] // Fallback to first song if none found

              data = {
                name: currentSong.Title,
                artistName: currentSong.Artist,
                imageUrl: currentSong.Cover['200'],
                startTime: new Date(currentSong.StartTime).getTime() / 1000,
                stopTime: new Date(currentSong.EndTime).getTime() / 1000,
              }
            }

            if (!data) {
              console.warn('No song data found, presence may need update to fit the new website design')
              break
            }

            presenceData.details = data.name || strings.listeningMusic
            presenceData.state = data.artistName || data.description || getChannel(webradio).name

            if (usePresenceName && !useChannelName) {
              const detail = data.programmeName || data.artistName
              presenceData.name = detail ? strings.on.replace('{0}', detail).replace('{1}', presenceData.name) : presenceData.name
            }

            if (useTimestamps && pathParts[2] !== 'live') {
              presenceData.startTimestamp = data.startTime || browsingTimestamp
              presenceData.endTimestamp = data.stopTime
                || delete presenceData.endTimestamp
              presenceData.largeImageKey = await getThumbnail(
                data.imageUrl,
              )
            }

            presenceData.largeImageText = data.serviceDescription
              ? limitText(
                  `${getChannel(webradio).name} - ${
                    data.serviceDescription
                  }`,
                )
              : getChannel(webradio).name

            if (useButtons) {
              presenceData.buttons = [
                {
                  label: strings.buttonListenAlong,
                  url: href, // We are not redirecting directly to the raw video stream, it's only the media page
                },
              ]
            }
          }
          break
        }
      }
      break
    }

    /* MEDIA PLAYER PAGE (Lecteur video)

    (https://www.rtlplay.be/rtlplay/player/75e9a91b-29d1-4856-be8c-0b3532862404) */
    case ['player'].includes(pathParts[2]!): {
      let mediaName: string = 'Unknown Media'
      let seasonNumber: string | null = null
      let episodeNumber: string | null = null
      let episodeName: string | null = null
      let coverArt: string | null = null
      // TODO can be improve by retrieving the full json using an intercept api
      const mediaInfos = document.querySelector('script[type="application/ld+json"]')?.textContent
      if (mediaInfos) {
        // Retrieve the json in the page
        const data = []
        data.push(JSON.parse(mediaInfos))
        let description = sanitize(data[0].name) as any
        description = description.match(/(?<mediaName>.*?)(?:\sS(?<seasonNumber>\d+)\sE(?<episodeNumber>\d+)\s(?<episodeName>.*))?$/i)
        if (description && description.groups) {
          mediaName = description.groups.mediaName || 'Unknown Media'
          seasonNumber = description.groups.seasonNumber || null
          episodeNumber = description.groups.episodeNumber || null
          episodeName = description.groups.episodeName || null
          coverArt = data[0].thumbnailUrl
        }
        else {
          episodeNumber = data[0].episodeNumber
        }
      }
      else {
        // Fallback method: read the player title
        const titleText = document.querySelector('h1')?.textContent
          || 'Unknown Media'

        // Clean the text: remove extra whitespace, newlines, and normalize spaces
        const cleanTitle = titleText.replace(/\s+/g, ' ').trim()

        const matchResult = cleanTitle.match(
          /^(?<mediaName>.*?)\sS(?<seasonNumber>\d+)\sE(?<episodeNumber>\d+)\s(?<episodeName>.*) - $/,
        )
        if (matchResult && matchResult.groups) {
          mediaName = matchResult.groups.mediaName || cleanTitle
          seasonNumber = matchResult.groups.seasonNumber || null
          episodeNumber = matchResult.groups.episodeNumber || null
          episodeName = matchResult.groups.episodeName || null
        }
        else {
          mediaName = cleanTitle
        }
      }

      if (mediaName === 'Unknown Media')
        console.warn('Media name not found, presence may need update to fit the new website design')

      let isPaused = false
      presenceData.largeImageKey = ActivityAssets.Logo // Initializing default

      if (usePrivacyMode) {
        presenceData.details = episodeName
          ? strings.watchingAProgramOrSeries
          : strings.watchingMovie

        presenceData.smallImageKey = ActivityAssets.Privacy
        presenceData.smallImageText = strings.privacy
      }
      else {
        // Media Infos
        if (usePresenceName) {
          presenceData.name = mediaName //  Watching MediaName
          presenceData.details = episodeName ?? mediaName // EpisodeName
          if (episodeName)
            presenceData.state = `${strings.season} ${seasonNumber}, ${strings.episode} ${episodeNumber}` // Season 0, Episode 0
          if (seasonNumber && episodeNumber) {
            // MediaName on RTLplay
            presenceData.largeImageText = strings.on.replace('{0}', mediaName).replace('{1}', 'RTLplay')
          }
        }
        else {
          presenceData.details = mediaName // MediaName
          if (episodeName)
            presenceData.state = episodeName // EpisodeName
          if (seasonNumber && episodeNumber) {
            presenceData.largeImageText = `Season ${seasonNumber}, Episode ${episodeNumber}`
          }
        }

        // Progress Bar / Timestamps
        const ad = exist('[class*=AdBreakStats-module-scss-module] > span')
        if (useTimestamps && !ad) {
          const video = document.querySelector('video') as HTMLMediaElement
          if (video) {
            // Video method: extracting from video object
            presence.info('Timestamps is using video method')

            isPaused = video.paused

            if (isPaused) {
              presenceData.startTimestamp = browsingTimestamp
              delete presenceData.endTimestamp
            }
            else {
              presenceData.startTimestamp = getTimestampsFromMedia(video)[0]
              presenceData.endTimestamp = getTimestampsFromMedia(video)[1]
            }
          }
          else {
            // Fallback method: extracting from UI
            presence.info('Timestamps is using fallback method')

            isPaused = exist('i.playerui__icon--name-play')

            if (isPaused) {
              presenceData.startTimestamp = browsingTimestamp
              delete presenceData.endTimestamp
            }
            else {
              const timeStatSelector = '[class*=TimeStat-module-scss-module]'
              if (!exist(timeStatSelector))
                console.warn('FallbackTimestamps not found, presence may need update to fit the new website design')

              const formattedTimestamps = document
                .querySelector(timeStatSelector)
                ?.textContent
                ?.split('/')

              if (formattedTimestamps && formattedTimestamps.length === 2) {
                [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
                  timestampFromFormat(formattedTimestamps[0]!.trim()),
                  timestampFromFormat(formattedTimestamps[1]!.trim()),
                )
              }
            }
          }
        }
        else {
          presenceData.startTimestamp = browsingTimestamp
          delete presenceData.endTimestamp
        }

        // Key Art - Status
        presenceData.smallImageKey = ad
          ? localizedAssets.Ad
          : isPaused
            ? ActivityAssets.PauseGradient
            : ActivityAssets.PlayGradient
        presenceData.smallImageText = ad
          ? strings.watchingAd
          : isPaused
            ? strings.pause
            : strings.play

        if (useButtons) {
          presenceData.buttons = [
            {
              label: episodeName
                ? strings.buttonWatchEpisode
                : strings.buttonWatchMovie,
              url: href, // We are not redirecting directly to the raw video stream, it's only the media page
            },
          ]
        }

        // Key Art - Poster
        if (usePoster && exist('meta[property="og:image"')) {
          presenceData.largeImageKey = await getThumbnail(
            document
              .querySelector('meta[property="og:image"')!
              .getAttribute('content')!,
            ActivityAssets.Animated,
            cropPreset.horizontal,
          )
          if (coverArt) {
            const presenceDataPoster = structuredClone(presenceData)
            presenceDataPoster.largeImageKey = mediaName
            presenceDataPoster.largeImageKey = await getThumbnail(
              coverArt,
              ActivityAssets.Animated,
              cropPreset.horizontal,
            )

            slideshow.addSlide('poster-image', presenceDataPoster, 5000)
            slideshow.addSlide('episode-image', presenceData, 5000)
          }
        }
      }

      break
    }
    /* MEDIA PAGE (Page de media)

    (https://www.rtlplay.be/rtlplay/salvation~2ab30366-51fe-4b29-a720-5e41c9bd6991) */
    case (hostname === 'www.rtlplay.be' && pathParts[2]!.length > 15): {
      presenceData.startTimestamp = browsingTimestamp

      if (usePrivacyMode) {
        presenceData.details = strings.browsing
        presenceData.state = strings.viewAPage
        presenceData.smallImageKey = ActivityAssets.Privacy
        presenceData.smallImageText = strings.privacy
      }
      else {
        let mediaName: string = 'Unknown Media'
        let mediaType: string = ''
        let description: string = ''
        let coverArt: string | null = null

        const backgroundArt = document.querySelector('[class*="__img"]')?.getAttribute('src') as string ?? presenceData.largeImageKey
        // TODO can be improve by retrieving the full json using an intercept api
        const mediaInfos = document.querySelector('script[type="application/ld+json"]')?.textContent
        if (mediaInfos) {
          // Retrieve the json in the page
          const data = JSON.parse(mediaInfos)
          mediaName = data.name
          mediaType = data['@type']
          description = data.description
          coverArt = data.image
        }
        else {
          mediaName = document.querySelector('h1[class*="__title"]')?.textContent || 'Unknown Media'
          mediaType = document.querySelector('meta[property="og:type"]')?.getAttribute('content')?.includes('movie') ? 'Movie' : 'TVSeries'
          description = document.querySelector('p[class*="__root"]')?.textContent || ''
          coverArt = document.querySelector('[class*="__img"]')?.getAttribute('src') ?? ''
        }

        const yearSelector = 'dd[title="Année de production"]'
        const durationSelector = 'dd[title="Durée"]'
        const seasonSelector = 'dd:not([title])'
        const genresSelector = 'dd[title="Genre"]'
        if (!exist(yearSelector))
          console.warn('Year element not found, presence may need update to fit the new website design')
        if (!exist(durationSelector))
          console.warn('Duration element not found, presence may need update to fit the new website design')
        if (!exist(seasonSelector) && mediaType === 'TVSeries')
          console.warn('Season element not found, presence may need update to fit the new website design')
        if (!exist(genresSelector))
          console.warn('Genres elements not found, presence may need update to fit the new website design')

        const yearElement = document.querySelector(yearSelector)
        const durationElement = document.querySelector(durationSelector)
        const seasonElement = document.querySelector(seasonSelector)
        const genresArray = document.querySelectorAll(genresSelector)

        let subtitle = mediaType === 'Movie' ? strings.movie : strings.tvshow
        subtitle += yearElement ? `, ${yearElement.textContent}` : '' // Add Release Year
        subtitle += seasonElement && mediaType === 'TVSeries' ? ` - ${seasonElement.textContent}` : '' // Add amount of seasons
        subtitle += durationElement ? ` - ${durationElement.textContent}` : '' // Add Duration

        for (const element of genresArray) // Add Genres
          subtitle += ` - ${element.textContent}`

        presenceData.details = sanitize(mediaName) // MediaName
        presenceData.state = sanitize(subtitle) // MediaType - 2024 - 4 seasons or 50 min - Action - Drame

        presenceData.largeImageText = description
          ? sanitize(limitText(description)) // 128 characters is the limit
          : subtitle // Summary if available

        presenceData.smallImageKey = ActivityAssets.Binoculars
        presenceData.smallImageText = strings.browsing

        if (useButtons) {
          presenceData.buttons = [
            {
              label: strings.buttonViewPage,
              url: href, // We are not redirecting directly to the raw video stream, it's only the media page
            },
          ]
        }

        if (usePoster) {
          presenceData.largeImageKey = await getThumbnail(
            coverArt ?? '',
            ActivityAssets.Animated,
            cropPreset.horizontalCentered,
          )

          const presenceDataSlide = structuredClone(presenceData) // Deep copy
          presenceDataSlide.state = description || subtitle
          presenceDataSlide.largeImageKey = await getThumbnail(backgroundArt, ActivityAssets.Animated, cropPreset.horizontal)

          slideshow.addSlide('poster-image', presenceData, 5000)
          slideshow.addSlide('background-image', presenceDataSlide, 5000)
        }
      }
      break
    }
    // TODO Support https://www.rtl.be/podcasts/
    default: {
      presenceData.name = getChannel(hostname).name

      presenceData.details = strings.browsing
      presenceData.state = strings.viewAPage

      presenceData.smallImageKey = ActivityAssets.Binoculars
      presenceData.smallImageText = strings.browsing

      presenceData.largeImageKey = getChannel(hostname).animated
      presenceData.largeImageText = getChannel(hostname).name

      if (useTimestamps)
        presenceData.startTimestamp = browsingTimestamp
      break
    }
  }
  if (slideshow.getSlides().length > 0)
    presence.setActivity(slideshow)
  else if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
