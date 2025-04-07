import { ActivityType, Assets } from 'premid'
import {
  ActivityAssets,
  cropPreset,
  exist,
  getAdditionnalStrings,
  getChannel,
  getLocalizedAssets,
  getThumbnail,
  limitText,
  stringsMap,
} from './util.js'

const presence = new Presence({
  clientId: '1240716875927916616',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
async function getStrings() {
  return presence.getStrings(
    stringsMap,

  )
}
const slideshow = presence.createSlideshow()

let oldLang: string | null = null
let strings: Awaited<ReturnType<typeof getStrings>>
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
    lang,
    usePresenceName,
    useChannelName,
    usePrivacyMode,
    useTimestamps,
    useButtons,
    usePoster,
  ] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('usePresenceName'),
    presence.getSetting<boolean>('useChannelName'),
    presence.getSetting<boolean>('usePrivacyMode'),
    presence.getSetting<boolean>('useTimestamps'),
    presence.getSetting<number>('useButtons'),
    presence.getSetting<boolean>('usePoster'),
  ])

  if (oldLang !== lang || !strings) {
    oldLang = lang
    strings = getAdditionnalStrings(lang, await getStrings())
  }

  if (oldPath !== pathname) {
    oldPath = pathname
    slideshow.deleteAllSlides()
  }

  switch (true) {
    /* MAIN PAGE (Page principale)

    (https://www.rtlplay.be/) */
    case pathname === '/'
      || (pathParts[1] === 'rtlplay' && pathParts.length <= 2): {
      presenceData.details = strings.browsing

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

    (https://www.rtlplay.be/rtlplay/direct/tvi) */
    case (hostname === 'www.rtlplay.be' && ['direct'].includes(pathParts[2]!))
      || (['www.radiocontact.be', 'www.belrtl.be'].includes(hostname)
        && ['player'].includes(pathParts[1]!)): {
      switch (true) {
        case hostname === 'www.rtlplay.be': {
          if (usePrivacyMode) {
            presenceData.details = strings.watchingLive

            presenceData.smallImageKey = ActivityAssets.Privacy
            presenceData.smallImageText = strings.privacy
          }
          else {
            if (exist('div.playerui__adBreakInfo')) {
              presenceData.smallImageKey = getLocalizedAssets(lang, 'Ad')
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
              presenceData.name = getChannel(pathParts[3]!).channel
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
                getChannel(pathParts[3]!).radioplayerAPI!,
              )
              const dataString = await response.text()
              const media = JSON.parse(dataString)

              if (media.results.now.type === 'PE_E') {
                // When a song is played
                presenceData.largeImageKey = await getThumbnail(
                  media.results.now.songArtURL,
                )
                presenceData.state = `${media.results.now.name} - ${media.results.now.artistName}`
              }
              else {
                // When we don't have a song, we simply show the radio name as the show name is already displayed in state
                presenceData.largeImageKey = getChannel(pathParts[3]!).logo
                presenceData.state = getChannel(pathParts[3]!).channel
              }

              presenceData.largeImageText = strings.watchingLiveMusic

              presenceData.smallImageKey = ActivityAssets.VinyleAnimated
              presenceData.smallImageText = strings.listeningMusic
            }
            else {
              presenceData.largeImageKey = getChannel(pathParts[3]!).logo
              presenceData.largeImageText = getChannel(pathParts[3]!).channel
            }

            if (useTimestamps) {
              if (exist('span.playerui__controls__stat__time')) {
                // Video method: Uses video viewing statistics near play button if displayed
                [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
                  presence.timestampFromFormat(
                    document
                      .querySelector('span.playerui__controls__stat__time')
                      ?.textContent
                      ?.split('/')[0]
                      ?.trim() ?? '',
                  ),
                  presence.timestampFromFormat(
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
                presence.timestampFromFormat(
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
        case ['www.radiocontact.be', 'www.belrtl.be'].includes(hostname): {
          if (usePrivacyMode) {
            presenceData.details = strings.listeningMusic

            presenceData.type = ActivityType.Listening

            presenceData.smallImageKey = ActivityAssets.VinyleAnimated
            presenceData.smallImageText = strings.listeningMusic
          }
          else {
            presenceData.name = getChannel(hostname).channel
            presenceData.type = getChannel(hostname).type

            if (exist('button[aria-label="stop"]')) {
              presenceData.smallImageKey = ActivityAssets.VinyleAnimated
              presenceData.smallImageText = strings.listeningMusic
            }
            else {
              presenceData.smallImageKey = ActivityAssets.Vinyle
              presenceData.smallImageText = strings.pause
            }

            try {
              // Fetch the data from the API
              const response = await fetch(getChannel(hostname).radioplayerAPI!) // Website backend use radioplayer api
              const dataString = await response.text()
              const data = JSON.parse(dataString)
              switch (data.results.now.type) {
                // When a song is played
                case 'PE_E': {
                  presenceData.details = data.results.now.name
                  presenceData.state = data.results.now.artistName
                  presenceData.startTimestamp = data.results.now.startTime || browsingTimestamp
                  presenceData.endTimestamp = data.results.now.stopTime
                    || delete presenceData.endTimestamp
                  presenceData.largeImageKey = await getThumbnail(
                    data.results.now.songArtURL,
                  )
                  break
                }
                // When there's no song and only the show (ex: radio host is speaking)
                case 'PI': {
                  presenceData.details = data.results.pis[0].programmeName
                  presenceData.state = data.results.pis[0].programmeDescription
                  presenceData.startTimestamp = data.results.now.startTime || browsingTimestamp
                  presenceData.endTimestamp = data.results.now.stopTime
                    || delete presenceData.endTimestamp
                  presenceData.largeImageKey = await getThumbnail(
                    data.results.pis[0].imageUrl,
                  )
                  break
                }
                // When there's songs but no show (ex: late night)
                default: {
                  presenceData.details = getChannel(hostname).channel
                  presenceData.state = strings.listeningMusic
                  presenceData.largeImageKey = getChannel(hostname).logo
                  break
                }
              }

              presenceData.largeImageText = limitText(
                `${getChannel(hostname).channel} - ${
                  data.results.now.serviceDescription
                }`,
              )
            }
            catch (error) {
              presence.error(`Error fetching data from the API: ${error}`)
            }

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
      const titleText = document.querySelector('h1.lfvp-player__title')?.textContent
        || 'Unknown Media'
      const matchResult = titleText.match(
        /^(?<mediaName>.*?)\sS(?<seasonNumber>\d+)\sE(?<episodeNumber>\d+)\s(?<episodeName>.*)$/,
      )
      const {
        mediaName = titleText,
        seasonNumber = null,
        episodeNumber = null,
        episodeName = null,
      } = matchResult?.groups || {}

      let isPaused = false
      presenceData.largeImageKey = ActivityAssets.Logo // Intializing default

      if (usePrivacyMode) {
        presenceData.details = episodeName
          ? strings.watchingShow
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
              presenceData.startTimestamp = presence.getTimestampsfromMedia(video)[0]
              presenceData.endTimestamp = presence.getTimestampsfromMedia(video)[1]
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
                [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
                  presence.timestampFromFormat(formattedTimestamps[0]!.trim()),
                  presence.timestampFromFormat(formattedTimestamps[1]!.trim()),
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
          ? getLocalizedAssets(lang, 'Ad')
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
            cropPreset.horizontal,
          )
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
    case pathParts[2]!.length > 15: {
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
            cropPreset.vertical,
          )
          presenceDataSlide.largeImageKey = await getThumbnail(
            document.querySelector('img.detail__img')?.getAttribute('src') ?? '',
            cropPreset.horizontal,
          )

          slideshow.addSlide('poster-image', presenceData, 5000)
          slideshow.addSlide('background-image', presenceDataSlide, 5000)
        }
      }
      break
    }
    default: {
      presenceData.details = strings.browsing
      presenceData.state = strings.viewAPage

      presenceData.smallImageKey = ActivityAssets.Binoculars
      presenceData.smallImageText = strings.browsing

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
