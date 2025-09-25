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
        const { searchQuery } = JSON.parse(
          document
            .querySelector('div[js-element="searchResults"]')
            ?.getAttribute('data-tracking') ?? '{}',
        )

        presenceData.details = strings.browsing
        presenceData.state = searchQuery
          ? `${strings.searchFor} ${searchQuery.term}`
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
        presenceData.state = strings.viewList
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
    case ['collection', 'series', 'films', 'divertissement'].includes(
      pathParts[2]!,
    ): {
      if (usePrivacyMode) {
        presenceData.state = strings.viewAPage

        presenceData.smallImageKey = ActivityAssets.Privacy
        presenceData.smallImageText = strings.privacy
      }
      else {
        const data = JSON.parse(
          document.querySelector('script[type=\'application/ld+json\']')
            ?.textContent ?? '{}',
        )

        presenceData.state = strings.viewCategory.replace(':', '')
        presenceData.details = pathParts[2] !== 'collection'
          ? pathParts[2]![0]!.toUpperCase() + pathParts[2]!.substring(1) // to Upper Case the first letter
          : data[0]['@type'] === 'CollectionPage'
            ? data[0].name
            : null

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
            if (exist('div.playerui__adBreakInfo')) {
              presenceData.smallImageKey = localizedAssets.Ad
              presenceData.smallImageText = strings.watchingAd
            }
            else if (exist('i.playerui__icon--name-play')) {
              // State paused
              presenceData.smallImageKey = Assets.Pause
              presenceData.smallImageText = strings.pause
            }
            else if (exist('div.playerui__liveStat--deferred')) {
              // State deferred
              presenceData.smallImageKey = ActivityAssets.Deferred
              presenceData.smallImageText = strings.deferred
            }
            else {
              // State live
              presenceData.smallImageKey = ActivityAssets.LiveAnimated
              presenceData.smallImageText = strings.live
            }

            if (
              !useChannelName
              && (
                document.querySelector(
                  'li[aria-current=\'true\'] > a > div > div.live-broadcast__channel-title',
                )?.textContent || ''
              ).toLowerCase() !== 'aucune donnée disponible'
              && !['contact', 'bel'].includes(pathParts[3]!) // Radio show name are not relevant
            ) {
              presenceData.name = document.querySelector(
                'li[aria-current=\'true\'] > a > div > div.live-broadcast__channel-title',
              )?.textContent || ''
            }
            else {
              presenceData.name = getChannel(pathParts[3]!).name
            }

            presenceData.type = getChannel(pathParts[3]!).type

            presenceData.state = strings.watchingLive
            presenceData.details = document.querySelector(
              'li[aria-current=\'true\'] > a > div > div.live-broadcast__channel-title',
            )?.textContent || ''
            if (['contact', 'bel'].includes(pathParts[3]!)) {
              /* Songs played in the livestream are the same as the audio radio ones but with video clips
              Fetch the data from the Radioplayer API. It is used on the official radio contact and bel rtl websites */
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
                presenceData.name = strings.on.replace('{0}', detail).replace('{1}', presenceData.name)
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
              if (exist('span.playerui__controls__stat__time')) {
                // Video method: Uses video viewing statistics near play button if displayed
                [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
                  timestampFromFormat(
                    document
                      .querySelector('span.playerui__controls__stat__time')
                      ?.textContent
                      ?.split('/')[0]
                      ?.trim() ?? '',
                  ),
                  timestampFromFormat(
                    document
                      .querySelector('span.playerui__controls__stat__time')
                      ?.textContent
                      ?.split('/')[1]
                      ?.trim() ?? '',
                  ),
                )
              }
              else {
                // Fallback method: Uses program start and end times in tv guide overlay
                presenceData.startTimestamp = Math.floor(
                  new Date(
                    document
                      .querySelector(
                        'li.live-broadcast__channel[aria-current="true"] time[js-element="startTime"]',
                      )
                      ?.getAttribute('datetime')
                      ?.replace(/[+-]\d{2}:\d{2}\[.*\]/, '') ?? '', // Removing UTC offset and the time zone
                  ).getTime() / 1000,
                )
                presenceData.endTimestamp = Math.floor(
                  new Date(
                    document
                      .querySelector(
                        'li.live-broadcast__channel[aria-current="true"] time[js-element="endTime"]',
                      )
                      ?.getAttribute('datetime')
                      ?.replace(/[+-]\d{2}:\d{2}\[.*\]/, '') ?? '', // Removing UTC offset and the time zone
                  ).getTime() / 1000,
                )
              }
            }
            else if (exist('span.playerui__controls__stat__time')) {
              presenceData.largeImageText += ` - ${Math.round(
                timestampFromFormat(
                  document
                    .querySelector('span.playerui__controls__stat__time')
                    ?.textContent
                    ?.split('/')[1]
                    ?.trim() ?? '',
                ) / 60,
              )} min`
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

            presenceData.details = data.name || strings.listeningMusic
            presenceData.state = data.artistName || data.description || getChannel(webradio).name

            if (usePresenceName && !useChannelName) {
              const detail = data.programmeName || data.artistName
              presenceData.name = strings.on.replace('{0}', detail).replace('{1}', presenceData.name)
            }

            presenceData.startTimestamp = data.startTime || browsingTimestamp
            presenceData.endTimestamp = data.stopTime
              || delete presenceData.endTimestamp
            presenceData.largeImageKey = await getThumbnail(
              data.imageUrl,
            )

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
        const data = JSON.parse(mediaInfos)
        mediaName = data[0].name
        const description = data[0].description.match(/S(?<seasonNumber>\d+)\sE(?<episodeNumber>\d+)\s(?<episodeName>.*)/)
        if (description && description.groups) {
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
        const titleText = document.querySelector('h1.lfvp-player__title')?.textContent
          || 'Unknown Media'

        // Clean the text: remove extra whitespace, newlines, and normalize spaces
        const cleanTitle = titleText.replace(/\s+/g, ' ').trim()

        const matchResult = cleanTitle.match(
          /^(?<mediaName>.*?)\sS(?<seasonNumber>\d+)\sE(?<episodeNumber>\d+)\s(?<episodeName>.*)$/,
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
        }
        else {
          presenceData.details = mediaName // MediaName
          if (episodeName)
            presenceData.state = `S${seasonNumber} E${episodeNumber} - ${episodeName}` // S0 - E0 - EpisodeName
        }
        if (seasonNumber && episodeNumber) {
          // MediaName - Season 0 - Episode 0
          presenceData.largeImageText = ` - ${strings.season} ${seasonNumber} - ${strings.episode} ${episodeNumber}`
          presenceData.largeImageText = limitText(mediaName, 128 - presenceData.largeImageText.length)
            + presenceData.largeImageText
        }

        // Progress Bar / Timestamps
        const ad = exist('div.playerui__adBreakInfo')
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
              const formattedTimestamps = document
                .querySelector('.playerui__controls__stat__time')
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
            ? Assets.Pause
            : Assets.Play
        presenceData.smallImageText = ad
          ? strings.watchingAd
          : isPaused
            ? strings.pause
            : strings.play

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
            presenceData.largeImageText = `${strings.season} ${seasonNumber}, ${strings.episode} ${episodeNumber}`

            const presenceDataPoster = structuredClone(presenceData)
            presenceDataPoster.largeImageKey = mediaName
            presenceDataPoster.largeImageKey = await getThumbnail(
              coverArt,
              ActivityAssets.Animated,
              cropPreset.horizontal,
            )

            const presenceDataLogo = structuredClone(presenceData)
            presenceDataLogo.largeImageText = 'RTLplay'
            presenceDataLogo.largeImageKey = await getThumbnail(
              ActivityAssets.Logo,
              ActivityAssets.Animated,
              cropPreset.squared,
            )

            slideshow.addSlide('poster-image', presenceDataPoster, 5000)
            slideshow.addSlide('episode-image', presenceData, 5000)
            slideshow.addSlide('logo-image', presenceDataLogo, 5000)
          }
        }

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
        const summaryElement = document.querySelector('p.detail__description')
        const yearElement = document.querySelector(
          'dd.detail__meta-label[title="Année de production"]',
        )
        const durationElement = document.querySelector(
          'dd.detail__meta-label[title="Durée"]',
        )
        const seasonElement = document.querySelector(
          'dd.detail__meta-label:not([title])',
        )
        const genresArray = document.querySelectorAll('dl:nth-child(1) > dd > a')
        const isMovie = !!document
          .querySelector('meta[property="og:type"]')
          ?.getAttribute('content')
          ?.includes('movie')

        let subtitle = isMovie ? strings.movie : strings.tvshow
        subtitle += yearElement ? ` - ${yearElement.textContent}` : '' // Add Release Year
        subtitle += seasonElement && !isMovie ? ` - ${seasonElement.textContent}` : '' // Add amount of seasons
        subtitle += durationElement ? ` - ${durationElement.textContent}` : '' // Add Duration

        for (const element of genresArray) // Add Genres
          subtitle += ` - ${element.textContent}`

        presenceData.details = document.querySelector('h1.detail__title')?.textContent // MediaName
        presenceData.state = subtitle // MediaType - 2024 - 4 seasons or 50 min - Action - Drame

        presenceData.largeImageText = summaryElement?.textContent
          ? limitText(summaryElement.textContent) // 128 characters is the limit
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
          const presenceDataSlide = structuredClone(presenceData) // Deep copy

          presenceData.largeImageKey = await getThumbnail(
            document.querySelector('img.detail__poster')?.getAttribute('src') ?? '',
            ActivityAssets.Animated,
            cropPreset.vertical,
          )
          presenceDataSlide.largeImageKey = await getThumbnail(
            document.querySelector('img.detail__img')?.getAttribute('src') ?? '',
            ActivityAssets.Animated,
            cropPreset.horizontal,
          )

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
