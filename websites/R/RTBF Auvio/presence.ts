import { ActivityType, Assets, getTimestamps, getTimestampsFromMedia, timestampFromFormat } from 'premid'
import {
  ActivityAssets,
  clearTimestamps,
  cropPreset,
  decodeImageUrl,
  exist,
  formatDuration,
  getChannel,
  getColor,
  getDomAttribute,
  getDomText,
  getLocalizedAssets,
  getPreferredTitle,
  getSetting,
  limitText,
  normalizeTitle,
  parseSchedule,
  presence,
  resetWarnings,
  safeFetchMetadata,
  safeGetThumbnail,
  strings,
  textOr,
  updateStringLanguage,
  warnMissing,
} from './util.js'

const browsingTimestamp = Math.floor(Date.now() / 1000)
const slideshow = new Slideshow()

let oldPath = document.location.pathname
let isMediaPage = false
let isMediaPlayer = false
let audioPlayer = false
let title = ''
let subtitle = ''
presence.on('UpdateData', async () => {
  const { href, pathname } = document.location
  const pathParts = pathname.split('/')
  const presenceData: PresenceData = { // Default
    name: 'Auvio',
    largeImageKey: ActivityAssets.Auvio,
    largeImageText: 'RTBF Auvio',
    smallImageKey: ActivityAssets.Binoculars,
    type: ActivityType.Watching,
  }
  const [
    newLang,
    usePresenceName,
    useChannelName,
    usePrivacyMode,
    usePoster,
    useButtons,
  ] = [
    getSetting<string>('lang', 'en'),
    getSetting<boolean>('usePresenceName', false),
    getSetting<boolean>('useChannelName', false),
    getSetting<boolean>('usePrivacyMode', true),
    getSetting<boolean>('usePoster', false),
    getSetting<boolean>('useButtons', false),
  ]

  // Update strings if user selected another language.
  if (!updateStringLanguage(newLang))
    return
  presenceData.smallImageText = strings.browsing

  if (oldPath !== pathname) {
    oldPath = pathname
    resetWarnings()
    slideshow.deleteAllSlides()
    audioPlayer = false
  }

  const audioLabel = document.querySelector('#audioPlayerContainer #PlayerUIButtonPlayPause')?.getAttribute('aria-label')?.toLowerCase() ?? ''
  const audioActive = exist('#audioPlayerContainer')
    && !exist('[role="dialog"][aria-label="Player"]')
    && (exist('#audioPlayerContainer #PlayerUIButtonStop') || audioLabel === 'pause')

  if (audioPlayer && !audioActive) {
    slideshow.deleteAllSlides()
    audioPlayer = false
  }

  let useSlideshow = false

  switch (true) {
    case audioActive: {
      if (!audioPlayer) {
        slideshow.deleteAllSlides() // Clearing previous slides
        audioPlayer = true
      }
      /* NOTE: PODCAST PLAYER
      NOTE: When a podcast is played, it appears in an audio player at the bottom of the screen.
      Once a podcast has been launched, it is visible at all times throughout the site until the website is refreshed. */

      const firstLine = document.querySelector('[class*=PlayerUIAudio_titleText]')?.textContent ?? ''
      const secondLine = document.querySelector('[class*=PlayerUIAudio_subtitle]')?.textContent ?? ''
      const duration = document.querySelector('[class*=PlayerUIAudio_duration]')?.textContent ?? '0'
      warnMissing('audio-title', !firstLine.trim(), 'No audio player title found ([class*=PlayerUIAudio_titleText]).')
      warnMissing('audio-duration', !exist('[class*=PlayerUIAudio_duration]'), 'No audio player duration element found ([class*=PlayerUIAudio_duration]).')
      warnMissing('audio-label', !!audioLabel && !['lecture', 'play', 'pause'].includes(audioLabel), 'Unrecognized audio play/pause label.')

      if (duration === 'DIRECT' || exist('#PlayerUIAudioGoToLiveButton')) {
        /* ANCHOR: RADIO LIVE FEED
          EXAMPLE: https://auvio.rtbf.be/chaine/classic-21-5
          NOTE: Direct radios are in the same place as podcasts, and play in the same audio player.
          The only difference is in the duration field, which is equal to “direct”, or the back to direct button if in deferred mode. */

        const coverArt = decodeImageUrl(document.querySelector('[class*=PlayerUIAudio_logoContainer] > span > img')?.getAttribute('src') ?? '')
        const logoName = coverArt.split('?')[0]?.split('/').pop()?.replace(/\.[^.]+$/, '') ?? ''
        const channelName = [firstLine.split(' - ')[0] ?? '', logoName, pathParts[1] === 'chaine' ? (pathParts[2] ?? '').replace(/-\d+$/, '') : '']
          .find(name => getChannel(name).found) ?? ''
        warnMissing('radio-channel', !channelName, 'No known radio channel could be identified from the player.')

        presenceData.name = usePrivacyMode || !usePresenceName ? strings.toARadio : getChannel(channelName).channel
        presenceData.type = ActivityType.Listening

        presenceData.smallImageKey = usePrivacyMode ? ActivityAssets.Privacy : ActivityAssets.ListeningLive
        presenceData.smallImageText = usePrivacyMode ? strings.privatePlay : strings.play
        presenceData.startTimestamp = browsingTimestamp

        if (usePrivacyMode) {
          presenceData.details = strings.listeningTo.replace('{0}', ' ').replace('{1}', strings.aRadio)
        }
        else {
          /* ANCHOR: RADIO SHOW NAME
            The first line of the audio player is the name of the program with which it is presented. */

          useSlideshow = true
          const showData = structuredClone(presenceData) // Deep copy

          showData.details = firstLine.replace(/\([^()]+\)(?!.*\([^()]+\))/, '').trim() || firstLine
          showData.state = (firstLine.includes(' - ') ? firstLine.split(' - ')[1]!.match(/\(([^()]+)\)(?!.*\([^()]+\))/)?.pop() : '') || ''

          showData.largeImageKey = coverArt.includes(
            'https://ds.static.rtbf.be/default/',
          ) // Must not match default auvio image https://ds.static.rtbf.be/default/image/770x770/default-auvio_0.jpg
            ? getChannel(channelName).logo
            : await safeGetThumbnail(
                coverArt,
                cropPreset.squared,
                getChannel(channelName).color,
              )
          showData.largeImageText += ' - Radio'

          if (showData.state)
            slideshow.addSlide('SHOW', showData, 5000)

          /* ANCHOR: RADIO SONG NAME
            The second line shows the music currently playing on the radio, with the artist in brackets.
            Sometimes no music is played and it's just an audio program. */

          const songData = structuredClone(presenceData) // Deep copy

          if (/\([^()]+\)(?!.*\([^()]+\))/.test(secondLine)) {
            // If it has parentheses, it's probably a song.
            songData.details = secondLine
              .replace(/\([^()]+\)(?!.*\([^()]+\))/, '')
              .trim()
            songData.state = secondLine.match(/\(([^()]+)\)(?!.*\([^()]+\))/)!.pop() || strings.live
          }
          else {
            // If it is not, it's probably an audio program
            songData.details = secondLine.length > 30 ? secondLine.slice(0, secondLine.slice(0, 30).lastIndexOf(' ')) : secondLine
            songData.state = secondLine.length > 30 ? secondLine.slice(songData.details.length).trim() : ''
          }
          songData.details ||= firstLine || strings.toARadio

          songData.largeImageKey = firstLine.includes(' - ') || !coverArt ? getChannel(channelName).logo : await safeGetThumbnail(coverArt, cropPreset.squared, getChannel(channelName).color)
          songData.largeImageText += ' - Radio'

          slideshow.addSlide('SONG', songData, 5000)
        }
      }
      else {
        /* ANCHOR:  VOD PODCAST
          EXAMPLE: https://auvio.rtbf.be/media/la-semaine-des-5-heures-la-semaine-des-5-heures-3318620
          Podcasts can be original programs or past broadcasts. */

        presenceData.name = usePresenceName && !usePrivacyMode ? firstLine || strings.toAPodcast : strings.toAPodcast
        presenceData.type = ActivityType.Listening

        presenceData.details = !usePrivacyMode
          ? firstLine || strings.toAPodcast
          : strings.listeningTo.replace('{0}', ' ').replace('{1}', strings.aPodcast)

        presenceData.state = !usePrivacyMode ? secondLine : ''

        presenceData.smallImageKey = usePrivacyMode ? ActivityAssets.Privacy : ActivityAssets.ListeningVOD
        presenceData.smallImageText = usePrivacyMode ? strings.privatePlay : strings.play

        const durationParts = duration.split('/').map(part => part.trim())
        const validAudioDuration = durationParts.length === 2 && durationParts.every(part => /^\d+(?::\d+){1,2}$/.test(part))
        warnMissing('audio-time-format', !validAudioDuration, 'Podcast timing is unavailable or has an unexpected format.')
        if (validAudioDuration) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
            timestampFromFormat(durationParts[0]!),
            timestampFromFormat(durationParts[1]!),
          )
        }

        if (usePoster) {
          const imageSrc = document.querySelector('[class*=PlayerUIAudio_logoContainer] > span > img')?.getAttribute('src')
          warnMissing('audio-image', !imageSrc, 'No podcast artwork found ([class*=PlayerUIAudio_logoContainer] > span > img).')
          if (imageSrc) {
            presenceData.largeImageKey = await safeGetThumbnail(
              decodeImageUrl(imageSrc),
              cropPreset.squared,
              getChannel('default').color,
            )
          }
        }
        if (!usePrivacyMode)
          presenceData.largeImageText += ' - Podcasts'
      }
      break
    }
    /* NOTE: RESEARCH PAGE
    EXAMPLE: https://auvio.rtbf.be/explorer */
    case ['explorer'].includes(pathParts[1]!): {
      const searchInput
        = document.querySelector(
          'input[class*=PageContent_inputSearch]',
        ) as HTMLInputElement | null

      warnMissing('search-input', !searchInput, 'No search input found (input[class*=PageContent_inputSearch]).')
      const searchQuery = searchInput?.value ?? ''

      if (!usePrivacyMode && searchQuery !== '') {
        presenceData.details = strings.browsing
        presenceData.state = `${strings.searchFor} ${searchQuery}`
      }
      else {
        presenceData.details = strings.browsing
        presenceData.state = strings.searchSomething
      }
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = strings.search

      break
    }

    /* NOTE: ACCOUNT & ACCOUNT SETTINGS PAGE
    EXAMPLE: https://auvio.rtbf.be/mes_informations) */
    case [
      'mes_informations',
      'controle_parental',
      'portabilite',
      'mes_offres_premium',
      'langues_sous_titres',
      'parametres_lecture',
    ].includes(pathParts[1]!): {
      if (!usePrivacyMode)
        warnMissing('account-title', !exist('h1[class*=UserGateway_title]'), 'No account page title found (h1[class*=UserGateway_title]).')
      presenceData.details = usePrivacyMode ? strings.browsing : getDomText('h1[class*=UserGateway_title]', strings.browsing)
      presenceData.state = usePrivacyMode ? strings.viewAPage : strings.viewAccount

      const name = getDomText('[class*=HeaderUser_text]', '')
      presenceData.smallImageKey = usePrivacyMode || name.toLowerCase().includes('se connecter')
        ? ActivityAssets.Binoculars
        : getDomAttribute('[class*=HeaderUser_avatar] > span > img', 'src', ActivityAssets.Binoculars)
      presenceData.smallImageText = usePrivacyMode
        ? strings.browsing
        : name

      presenceData.largeImageKey = ActivityAssets.Logo
      break
    }
    case ['media', 'live', 'emission'].includes(pathParts[1]!): {
      /* NOTE: MEDIA PAGE
      EXAMPLES: https://auvio.rtbf.be/live/on-nest-pas-des-pigeons-601928
                https://auvio.rtbf.be/media/everything-everywhere-all-at-once-film-aux-7-oscars-en-2023-3284136 */

      const hasTrailerPlayer = exist('#ui-trailer-1')
        || exist('div[class*=WidgetMediaTrailer_trailerVideo]')
        || exist('div[class*=WidgetMediaTrailer_bottomBar]')
      const videoPlayerSelector = '#vodPlayerContainer, #livePlayerContainer, [role="dialog"][aria-label="Player"], [class*=PlayerDialog_playerOverlay]'
      const videoPlayer = document.querySelector(videoPlayerSelector)
      const hasPlayerControls = !!videoPlayer?.querySelector('#PlayerUIButtonPlayPause')
        && (
          !!videoPlayer.querySelector('[class*=PlayerUI_BottomContainer], [class*=PlayerUI_bottomControls], [class*=PlayerUI_bottomTimebar]')
        )
      const hasPlayerDialog = exist('[role="dialog"][aria-label="Player"]')
        || exist('[class*=PlayerDialog_playerOverlay]')
        || exist('#livePlayerContainer')
        || exist('#vodPlayerContainer')
      const hasPlayerError = exist('[id="PlayerErrorComponent.back"]')
      const hasVideoPlayer = hasPlayerDialog && !hasPlayerError
        && (
          exist('div#vodPlayerContainer video')
          || exist('div#livePlayerContainer video')
          || (!hasTrailerPlayer && hasPlayerControls)
        )

      warnMissing('video-player', hasPlayerDialog && !hasPlayerError && !hasVideoPlayer, 'A player dialog is open but no video or player controls were found; it may still be loading.')

      if (usePrivacyMode) {
        presenceData.smallImageKey = ActivityAssets.Privacy
        presenceData.smallImageText = strings.privacy

        if (!hasVideoPlayer) {
          presenceData.details = strings.browsing
          presenceData.state = strings.viewAPage
        }
        else {
          switch (true) {
            case pathParts[1] === 'media': {
              presenceData.state = strings.watchingMovie
              break
            }
            case pathParts[1] === 'emission': {
              presenceData.state = strings.watchingShow
              break
            }
            case pathParts[1] === 'live': {
              presenceData.state = strings.watchingLive
              break
            }
          }
          presenceData.details = 'RTBF Auvio'
        }
      }
      else {
        useSlideshow = true

        const metadatas = await safeFetchMetadata(`https://bff-service.rtbf.be/auvio/v1.23/pages/${pathParts[1]!}/${pathParts[2]!}`)

        const content = metadatas?.data?.content
        const hasContent = !!content && typeof content === 'object' && !Array.isArray(content) && Object.keys(content).length > 0
        warnMissing('media-metadata', !!metadatas?.data && !hasContent, 'Media metadata has no usable content object.')

        let mediaType, mediaSubtype, description, image, channel, duration, category, scheduledFrom, scheduledTo, waitTime, remainingTime
        let shouldUsePreferredTitle = true
        if (hasContent) {
          // Populating metadatas variables with API method

          mediaType = textOr(metadatas.data.pageType, textOr(metadatas.data.content?.pageType))
          mediaSubtype = textOr(metadatas.data.content?.type)
          shouldUsePreferredTitle = !['MOVIE', 'SERIE'].includes(mediaSubtype)

          title = textOr(metadatas.data.content?.title, 'Auvio')
          warnMissing('media-title', title === 'Auvio' && !textOr(metadatas.data.content?.title), 'Media metadata has no usable title.')
          subtitle = textOr(metadatas.data.content?.subtitle, textOr(metadatas.data.content?.media?.subtitle))

          if (title === subtitle)
            subtitle = ''

          if (!subtitle) {
            const titleParts = title.split(' - ')
            if (titleParts.length > 1) {
              subtitle = titleParts[1] ?? ''
              title = title.replace(subtitle, '').trim()
            }
          }

          description = limitText(textOr(metadatas.data.content?.description, textOr(metadatas.data.content?.media?.description, 'Auvio')), 128)

          image = textOr(metadatas.data.content?.background?.m, ActivityAssets.Logo)

          channel = textOr(metadatas.data.content?.channel?.label, textOr(metadatas.data.content?.media?.channelLabel))

          duration = metadatas.data.content?.duration
            ? formatDuration(metadatas.data.content.duration)
            : metadatas.data.content?.media?.duration
              ? formatDuration(metadatas.data.content.media.duration)
              : ''
          warnMissing('media-duration', !!(metadatas.data.content?.duration ?? metadatas.data.content?.media?.duration) && !duration, 'Media duration has an unexpected format.')

          category = textOr(metadatas.data.content?.category?.label)
          if (['film', 'films'].includes(normalizeTitle(category)))
            shouldUsePreferredTitle = false

          scheduledFrom = parseSchedule(metadatas.data.content?.scheduledFrom)
          scheduledTo = parseSchedule(metadatas.data.content?.scheduledTo)

          if (scheduledFrom !== null) {
            waitTime = scheduledFrom - Math.floor(Date.now() / 1000)
          }

          if (scheduledTo !== null) {
            remainingTime = scheduledTo - Math.floor(Date.now() / 1000)
          }
        }
        else {
          // Populating metadatas variables with Fallback method
          let mediaData: any

          for (
            let i = 0;
            i
            < document.querySelectorAll('script[type=\'application/ld+json\']')
              .length;
            i++
          ) {
            try {
              const data = JSON.parse(document.querySelectorAll('script[type=\'application/ld+json\']')[i]?.textContent ?? '{}')
              if (data && ['Movie', 'Episode', 'BroadcastEvent', 'VideoObject'].includes(data['@type'])) {
                mediaData = data
                shouldUsePreferredTitle = !['Episode', 'Movie'].includes(data['@type'])
              }
            }
            catch {
              warnMissing('invalid-jsonld', true, 'Media structured data could not be parsed.')
            }
          }

          mediaType = pathParts[1]

          subtitle = getDomText('[class*=DetailsTitle_subtitle]', '')
          title = getDomText('div[class*=DetailsTitle_title] > h1', 'Auvio').replace(subtitle, '') || 'Auvio'
          warnMissing('fallback-title', title === 'Auvio', 'No media title was found in the page fallback.')
          description = limitText(textOr(mediaData?.description, 'Auvio'), 128)
          image = textOr(mediaData?.thumbnailUrl, ActivityAssets.Logo)
          channel = document.querySelectorAll('div[class*=DetailsTitle_channelCategory] > div')[0]?.textContent?.trim() ?? ''
          duration = formatDuration(mediaData?.duration ?? 0)
          category = getDomText('[class*=Breadcrumb_breadcrumb] > ul > li:last-child > span', '')

          scheduledFrom = null
          scheduledTo = null
          waitTime = 0
          remainingTime = 0
        }

        const isSportContent = normalizeTitle(category ?? '') === 'sport'
          || exist('a[href*="/categorie/sport-"]')
        if (shouldUsePreferredTitle)
          title = getPreferredTitle(title, subtitle, isSportContent)
        if (!hasVideoPlayer) {
          // NOTE: MEDIA PAGE
          isMediaPage = true
          if (isMediaPlayer) {
            slideshow.deleteAllSlides()
            isMediaPlayer = false
          }

          // BASE SLIDES
          presenceData.details = title

          presenceData.largeImageText = description
          if (usePoster) {
            presenceData.largeImageKey = await safeGetThumbnail(
              image,
              cropPreset.horizontal,
              getColor(channel || 'Auvio'),
            )
          }
          else {
            presenceData.largeImageKey = getChannel(channel || 'Auvio').logo // Default logo if not found
          }

          if (useButtons) {
            presenceData.buttons = [
              {
                label: strings.buttonViewPage,
                url: href,
              },
            ]
          }

          presenceData.smallImageKey = ActivityAssets.Binoculars
          presenceData.smallImageText = strings.browsing

          presenceData.startTimestamp = browsingTimestamp

          // SLIDE: Subtitle
          if (subtitle) {
            const subtitleData = structuredClone(presenceData)
            subtitleData.state = subtitle
            slideshow.addSlide('01', subtitleData, 5000)
          }

          if (category) {
            const categoryData = structuredClone(presenceData)
            categoryData.state = category
            slideshow.addSlide('02', categoryData, 5000)
          }

          if (description) {
            const descriptionData = structuredClone(presenceData)
            descriptionData.state = description
            slideshow.addSlide('03', descriptionData, 5000)
          }

          // SLIDE: Infos
          if (channel || duration || category) {
            const infosData = structuredClone(presenceData)
            infosData.state = [channel, duration, category].filter(Boolean).join(' - ') // "La Une - 51min - Policier"
            if (channel && getChannel(channel).found)
              infosData.largeImageKey = getChannel(channel).logo
            slideshow.addSlide('04', infosData, 5000)
          }

          // SLIDE: Livestream Status
          if (mediaType === 'LIVE' && (scheduledFrom || scheduledTo)) {
            const scheduleData = structuredClone(presenceData)
            if ((waitTime || -1) > 0) {
              scheduleData.state = strings.startsIn.replace('{0}', formatDuration(waitTime!)) // "Starts in 3h41"
              scheduleData.smallImageKey = ActivityAssets.Waiting
              scheduleData.smallImageText = strings.waitingLive
            }
            else if ((remainingTime || -1) > 0) {
              scheduleData.state = strings.endsIn.replace('{0}', formatDuration(remainingTime!)) // "Ends in 3h41"
              scheduleData.smallImageKey = ActivityAssets.Deferred
              scheduleData.smallImageText = strings.browsing
            }
            else {
              scheduleData.state = strings.liveEnded // "Livestream has ended"
            }
            slideshow.addSlide('05', scheduleData, 5000)
          }
        }
        else {
          // NOTE: MEDIA PLAYER PAGE
          isMediaPlayer = true
          if (isMediaPage) {
            slideshow.deleteAllSlides()
            isMediaPage = false
          }

          // Update the variables only if the overlay is visible and the elements are found
          title = getDomText('h1[class*=TitleDetails_title]', title)
          subtitle = getDomText('[class*=TitleDetails_subtitle]', subtitle)

          // Try to extract season from the title (e.g. "Show Name S01" or "Show Name S1")
          let seasonNumber, episodeNumber, episodeName
          const seasonMatch = title?.match(/S(?<seasonNumber>\d+)/i)
          if (seasonMatch?.groups?.seasonNumber) {
            seasonNumber = seasonMatch.groups.seasonNumber
            // Remove the season token from the title (e.g. "Show Name S01")
            title = title.replace(seasonMatch[0], '').trim()
          }
          else {
            seasonNumber = '01'
          }

          // Try to extract episode number and optional episode name from the subtitle
          // Examples: "E01 - Episode Name" or "E01 Episode Name" or "01 - Episode Name"
          const episodeMatch = subtitle?.match(/^E?(?<episodeNumber>\d+)(?:(?:\s*-\s*|\s+)(?<episodeName>\S.*))?$/i)
          if (episodeMatch?.groups?.episodeNumber) {
            episodeNumber = episodeMatch.groups.episodeNumber
            if (episodeMatch.groups.episodeName)
              episodeName = episodeMatch.groups.episodeName.trim()
          }

          if (shouldUsePreferredTitle)
            title = getPreferredTitle(title, subtitle, isSportContent)

          const videoArray = document.querySelectorAll<HTMLVideoElement>('div#vodPlayerContainer video, div#livePlayerContainer video')
          const video = videoArray[videoArray.length - 1] ?? null
          const activeVideoPlayer = video?.closest('#vodPlayerContainer, #livePlayerContainer') ?? videoPlayer
          const playPauseButton = activeVideoPlayer?.querySelector<HTMLButtonElement>('#PlayerUIButtonPlayPause')
          const playPauseLabel = playPauseButton?.getAttribute('aria-label')?.toLowerCase() ?? ''
          const hasAdOverlay = exist('.ad-click-overlay')
            || exist('.ad-children-wrapper')
            || exist('#ad')
            || exist('[class*=PlayerAdUI_clickInfo]')
          const bAdCountdown = hasAdOverlay
          const playerPausedLabel = playPauseLabel.includes('pause')
            ? false
            : playPauseLabel.includes('lecture') || playPauseLabel.includes('play')
              ? true
              : null
          const isPaused = playerPausedLabel ?? video?.paused ?? false

          warnMissing('video-element', !hasAdOverlay && !video, 'No video element found in #vodPlayerContainer or #livePlayerContainer.')
          warnMissing('video-label', !hasAdOverlay && !!playPauseLabel && playerPausedLabel === null, 'Unrecognized video play/pause label; using the video paused state.')

          // BASE SLIDES
          if (usePresenceName)
            presenceData.name = title

          presenceData.details = usePresenceName ? episodeName ?? subtitle : title

          presenceData.largeImageText = episodeNumber && seasonNumber ? `Season ${seasonNumber}, Episode ${episodeNumber}` : description
          if (usePoster) {
            presenceData.largeImageKey = await safeGetThumbnail(
              image,
              cropPreset.horizontal,
              getColor(channel || 'Auvio'),
            )
          }
          else {
            presenceData.largeImageKey = getChannel(channel).logo // Default logo if not found
          }

          // LIVE MEDIA PLAYER
          const liveDelay = video ? Math.abs(Math.floor(Date.now() / 1000 - video.currentTime)) : Number.POSITIVE_INFINITY
          const isLiveMediaPlayer = mediaType === 'LIVE'
            || (video !== null && liveDelay < 3600) // Sometimes lives don't follow established codes
          if (isLiveMediaPlayer) {
            if (usePresenceName && useChannelName && channel !== '')
              presenceData.name = channel

            if (useButtons) {
              presenceData.buttons = [
                {
                  label: strings.buttonWatchStream,
                  url: href,
                },
              ]
            }

            if (bAdCountdown) {
              presenceData.smallImageKey = getLocalizedAssets(newLang, 'Ad')
              presenceData.smallImageText = strings.ad

              clearTimestamps(presenceData)
            }
            else if (liveDelay < 60) { // Live
              presenceData.smallImageKey = isPaused
                ? Assets.Pause
                : ActivityAssets.LiveAnimated
              presenceData.smallImageText = isPaused
                ? strings.pause
                : strings.live

              if (isPaused) {
                clearTimestamps(presenceData)
              }
              else {
                if (scheduledFrom)
                  presenceData.startTimestamp = scheduledFrom
                if (scheduledTo)
                  presenceData.endTimestamp = scheduledTo
              }
            }
            else { // Deferred
              presenceData.smallImageKey = isPaused
                ? Assets.Pause
                : ActivityAssets.DeferredAnimated
              presenceData.smallImageText = isPaused
                ? strings.pause
                : strings.deferred
            }

            // SLIDE: Watching Live or Ad
            const watchingData = structuredClone(presenceData)
            watchingData.state = bAdCountdown
              ? strings.ad
              : channel
                ? strings.on.replace('{0}', strings.watchingLive).replace('{1}', channel)
                : strings.on.replace('{0}', strings.watchingLive).replace('{1}', 'Auvio')

            slideshow.addSlide('03', watchingData, 5000)
          }
          else {
            // VOD MEDIA PLAYER
            if (useButtons) {
              let stringMedia
              if (mediaSubtype === 'SERIE') {
                stringMedia = strings.buttonWatchSeries
              }
              else if (mediaSubtype === 'SHOW') {
                stringMedia = strings.buttonWatchProgram
              }
              else if (mediaSubtype === 'VIDEO') {
                stringMedia = strings.buttonWatchMovie
              }
              else {
                stringMedia = strings.buttonWatchVideo
              }
              presenceData.buttons = [
                {
                  label: stringMedia,
                  url: href,
                },
              ]
            }

            if (bAdCountdown) {
              presenceData.smallImageKey = getLocalizedAssets(newLang, 'Ad')
              presenceData.smallImageText = strings.ad

              clearTimestamps(presenceData)
            }
            else if (isPaused) {
              presenceData.smallImageKey = Assets.Pause
              presenceData.smallImageText = strings.pause

              clearTimestamps(presenceData)
            }
            else if (video && Number.isFinite(video.duration) && video.duration > 0 && Number.isFinite(video.currentTime)) {
              presenceData.smallImageKey = Assets.Play
              presenceData.smallImageText = strings.play

              presenceData.startTimestamp = getTimestampsFromMedia(video)[0]
              presenceData.endTimestamp = getTimestampsFromMedia(video)[1]
            }
            else {
              presenceData.smallImageKey = Assets.Play
              presenceData.smallImageText = strings.play
              clearTimestamps(presenceData)
            }
          }

          // SLIDE: Subtitle
          if (subtitle) {
            const subtitleData = structuredClone(presenceData)
            subtitleData.state = usePresenceName ? description : episodeName ?? subtitle
            slideshow.addSlide('01', subtitleData, 5000)
          }

          if (category) {
            const categoryData = structuredClone(presenceData)
            categoryData.state = category
            slideshow.addSlide('02', categoryData, 5000)
          }

          // SLIDE: Infos
          if (channel || duration || category) {
            const infosData = structuredClone(presenceData)
            infosData.state = [channel, duration, category].filter(Boolean).join(' - ') // "La Une - 51min - Policier"
            if (channel && getChannel(channel).found)
              infosData.largeImageKey = getChannel(channel).logo
            slideshow.addSlide('04', infosData, 5000)
          }
        }
      }
      break
    }
    /* NOTE: HOME PAGE, CATEGORY & CHANNEL PAGES
    EXAMPLES: https://auvio.rtbf.be/categorie/sport-9
              https://auvio.rtbf.be/chaine/la-une-1 */

    case pathname === '/' // Homepage
      || [
        'categorie',
        'direct', // Considered as a category
        'podcasts', // Considered as a category
        'kids', // Considered as a category
        'mon-auvio',
        'chaine',
        'mot-cle',
        'premium',
        'widget',
        'notreselection',
      ].includes(pathParts[1]!): {
      presenceData.details = strings.browsing

      if (usePrivacyMode) {
        presenceData.state = strings.viewAPage

        presenceData.smallImageKey = ActivityAssets.Privacy
        presenceData.smallImageText = strings.privacy
      }
      else if (pathname === '/') {
        // ANCHOR: HOME PAGE
        presenceData.state = strings.viewHome
        presenceData.startTimestamp = browsingTimestamp
      }
      else {
        // ANCHOR: CATEGORY AND CHANNEL PAGE
        const headingTitle = getDomText('h1', '')
        const breadcrumbTitle = getDomText('nav[aria-label="Fil d\'ariane"] > ul > li:nth-last-child(1) > span', '')
        warnMissing('category-title', !headingTitle && !breadcrumbTitle, 'No category title or breadcrumb found (h1 or nav[aria-label="Fil d\'ariane"]).')
        const categoryTitle = headingTitle.length < 20 && headingTitle
          ? headingTitle
          : breadcrumbTitle || headingTitle || 'Auvio' // Last of breadcrumb list

        presenceData.details = pathParts[1] === 'podcasts' ? `${categoryTitle} & Radios` : categoryTitle

        presenceData.state = strings.viewCategory.replace(':', '')

        // Fallback
        presenceData.largeImageKey = await safeGetThumbnail(
          getChannel(pathParts[1]!).logo,
          cropPreset.squared,
          getColor(categoryTitle || 'Auvio'),
        )
        presenceData.largeImageText = `Catégorie ${categoryTitle} sur Auvio`

        if (useButtons) {
          presenceData.buttons = [
            {
              label: strings.buttonViewCategory,
              url: href,
            },
          ]
        }

        if (usePoster
          && !['podcasts'].includes(pathParts[1]!) // TO-DO: Podcast category can cause issues
        ) {
          const galleryElement = document.querySelector('.swiper-wrapper:has(:not(figure) img)') || document.querySelector('[class*=Mosaic_mosaic]')
          const selector = galleryElement?.querySelector('img[class*=TileProgramPoster_hoverPicture]')
            ? 'img[class*=TileProgramPoster_hoverPicture]' // If programs cover art are in portrait
            : galleryElement?.querySelector('img[class*=TileMedia_hoverPicture]')
              ? 'img[class*=TileMedia_hoverPicture]' // If programs cover art are in landscape
              : '[class*=TileMedia_mosaic] > span > img' // If the page is mot-cle

          // SLIDES: Samples of content in the category
          const images = galleryElement?.querySelectorAll<HTMLImageElement>(selector) ?? []
          warnMissing('gallery-images', !!galleryElement && images.length === 0, 'A gallery was found but no matching program or media images were found.')
          for (
            let index = 0;
            index < images.length;
            index++
          ) {
            const src = decodeImageUrl(images[index]?.getAttribute('src') ?? '')

            // Sometimes url starts with data:image and it doesn't render well, so we take no risks
            if (!src.match('data:image') && src !== '') {
              useSlideshow = true
              const sampleData = structuredClone(presenceData) // Deep copy
              const mediaTitle = images[index]?.getAttribute('title') || index.toString()

              sampleData.largeImageKey = await safeGetThumbnail(
                src,
                selector === 'img[class*=TileProgramPoster_hoverPicture]'
                  ? cropPreset.vertical
                  : cropPreset.horizontal,
                getColor(categoryTitle || 'Auvio'),
              )
              if (mediaTitle !== index.toString()) {
                const sample = strings.on.replace('{1}', pathParts[1]!.includes('chaine') ? categoryTitle : 'Auvio')
                sampleData.largeImageText = sampleData.state = sample.replace('{0}', limitText(mediaTitle, 128 - sample.length))
              }
              slideshow.addSlide(mediaTitle, sampleData, 2500)

              // SLIDE: Viewing Category
              const viewingData = structuredClone(sampleData)
              viewingData.state = strings.viewCategory.replace(':', '')
              if (getChannel(categoryTitle).found)
                viewingData.largeImageKey = getChannel(categoryTitle).logo
              slideshow.addSlide(`${mediaTitle}*`, viewingData, 2500)
            }
          }
        }
      }
      break
    }

    // In case we need a default
    default: {
      presenceData.details = strings.browsing
      presenceData.state = strings.viewAPage
      break
    }
  }

  if (presenceData.details === '')
    delete presenceData.details
  if (presenceData.state === '')
    delete presenceData.state

  if (useSlideshow) {
    presence.setActivity(slideshow)
  }
  else if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
