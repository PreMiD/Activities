import { ActivityType, Assets, getTimestamps, getTimestampsFromMedia, timestampFromFormat } from 'premid'
import {
  ActivityAssets,
  checkStringLanguage,
  cropPreset,
  exist,
  formatDuration,
  getChannel,
  getColor,
  getLocalizedAssets,
  getSetting,
  getThumbnail,
  limitText,
  presence,
  strings,
} from './util.js'

const browsingTimestamp = Math.floor(Date.now() / 1000)
const slideshow = new Slideshow()

let oldPath = document.location.pathname
let isMediaPage = false
let isMediaPlayer = false
let title = ''
let subtitle = ''

presence.on('UpdateData', async () => {
  const { /* hostname, */ href, pathname } = document.location
  const pathParts = pathname.split('/')
  const presenceData: PresenceData = {
    name: 'Auvio',
    largeImageKey: ActivityAssets.Auvio, // Default
    largeImageText: 'RTBF Auvio',
    smallImageKey: ActivityAssets.Binoculars,
    smallImageText: strings.browsing,
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
    getSetting<boolean>('usePresenceName'),
    getSetting<boolean>('useChannelName'),
    getSetting<boolean>('usePrivacyMode'),
    getSetting<boolean>('usePoster'),
    getSetting<number>('useButtons'),
  ]

  // Update strings if user selected another language.
  if (!checkStringLanguage(newLang))
    return

  if (oldPath !== pathname) {
    oldPath = pathname
    slideshow.deleteAllSlides()
  }

  let useSlideshow = false

  switch (true) {
    case exist('#audioPlayerContainer'): {
      /* NOTE: PODCAST PLAYER
      NOTE: When a podcast is played, it appears in an audio player at the bottom of the screen.
      Once a podcast has been launched, it is visible at all times throughout the site until the website is refreshed. */

      if (document.querySelector('#PlayerUIAudioPlayPauseButton')?.getAttribute('aria-label') === 'pause') {
        const firstLine = document.querySelector('.PlayerUIAudio_titleText__HV4Y2')?.textContent ?? ''
        const secondLine = document.querySelector('.PlayerUIAudio_subtitle__uhGA4')?.textContent ?? ''
        const duration = document.querySelector('.PlayerUIAudio_duration__n7hxV')?.textContent ?? '0'

        if (duration === 'DIRECT' || exist('#PlayerUIAudioGoToLiveButton')) {
          /* ANCHOR: RADIO LIVE FEED
          NOTE: Direct radios are in the same place as podcasts, and play in the same audio player.
          The only difference is in the duration field, which is equal to “direct”, or the back to direct button if in deferred mode. */

          const channelName = (firstLine.includes(' - ') ? firstLine.split(' - ')[0] : firstLine.match(/^\w+/)?.[0])!
          const coverArt = decodeURIComponent(
            document.querySelector('.PlayerUIAudio_logoContainer__6ffGY > span > img')?.getAttribute('src')?.replace('/_next/image?url=', '').split('&w')[0] ?? '',
          )

          presenceData.name = usePrivacyMode || !usePresenceName ? strings.aRadio : getChannel(channelName).channel
          presenceData.type = ActivityType.Listening

          presenceData.smallImageKey = usePrivacyMode
            ? ActivityAssets.Privacy
            : ActivityAssets.ListeningLive
          presenceData.smallImageText = usePrivacyMode
            ? strings.privatePlay
            : strings.play

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
              : await getThumbnail(
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

            if (secondLine.match(/\([^()]+\)(?!.*\([^()]+\))/)) {
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

            songData.largeImageKey = firstLine.includes(' - ') ? getChannel(channelName).logo : await getThumbnail(coverArt, cropPreset.squared, getChannel(channelName).color)
            songData.largeImageText += ' - Radio'

            slideshow.addSlide('SONG', songData, 5000)
          }
        }
        else {
          /* ANCHOR:  VOD PODCAST

          Podcasts can be original programs or past broadcasts. */

          presenceData.name = usePresenceName && !usePrivacyMode ? firstLine : strings.aPodcast
          presenceData.type = ActivityType.Listening

          presenceData.details = !usePrivacyMode
            ? firstLine
            : strings.listeningTo.replace('{0}', ' ').replace('{1}', strings.aPodcast)

          presenceData.state = !usePrivacyMode ? secondLine : ''

          presenceData.smallImageKey = usePrivacyMode
            ? ActivityAssets.Privacy
            : ActivityAssets.ListeningVOD
          presenceData.smallImageText = usePrivacyMode
            ? strings.privatePlay
            : strings.play;

          [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
            timestampFromFormat(duration.split('/')?.[0] ?? duration),
            timestampFromFormat(duration.split('/')?.[1] ?? duration),
          )

          if (usePoster) {
            presenceData.largeImageKey = await getThumbnail(
              decodeURIComponent(
                // the url is a weird relative encoded link
                document.querySelector('.PlayerUIAudio_logoContainer__6ffGY > span > img')!.getAttribute('src')!.replace('/_next/image?url=', '').split('&w')[0]!,
              ),
              cropPreset.squared,
              getChannel('default').color,
            )
          }
          if (!usePrivacyMode)
            presenceData.largeImageText += ' - Podcasts'
        }
      }
      break
    }
    /* NOTE: RESEARCH (Page de recherche)

    (https://auvio.rtbf.be/explorer) */
    case ['explorer'].includes(pathParts[1]!): {
      const searchQuery = (
        document.querySelector(
          'input.PageContent_inputSearch__8B4AC',
        ) as HTMLInputElement
      ).value

      if (searchQuery !== '') {
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

    (ex: https://auvio.rtbf.be/mes_informations) */
    case [
      'mes_informations',
      'controle_parental',
      'portabilite',
      'mes_offres_premium',
      'langues_sous_titres',
      'parametres_lecture',
    ].includes(pathParts[1]!): {
      presenceData.details = usePrivacyMode ? strings.browsing : document.querySelector('.UserGateway_title__PkVAb')!.textContent
      presenceData.state = usePrivacyMode ? strings.viewAPage : strings.viewAccount

      presenceData.smallImageKey = usePrivacyMode || document.querySelector('.HeaderUser_text__tpHR7')!.textContent!.toLowerCase().includes('se connecter')
        ? ActivityAssets.Binoculars
        : document.querySelector('.HeaderUser_avatar__pbBy2 > span > img')!.getAttribute('src')
      presenceData.smallImageText = usePrivacyMode
        ? strings.browsing
        : document.querySelector('.HeaderUser_text__tpHR7')!.textContent

      presenceData.largeImageKey = ActivityAssets.Logo
      break
    }
    case ['media', 'live', 'emission'].includes(pathParts[1]!): {
      // NOTE: MEDIA PAGE
      if (usePrivacyMode) {
        if (!exist('#player')) {
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
          presenceData.details = 'watch'
        }
      }
      else {
        useSlideshow = true

        // Fetch RTBF API
        const response = await fetch(`https://bff-service.rtbf.be/auvio/v1.23/pages/${pathParts[1]!}/${pathParts[2]!}`)
        const dataString = await response?.text()
        const metadatas = JSON.parse(dataString)

        let mediaType, description, image, channel, duration, category, scheduledFrom, scheduledTo, waitTime, remainingTime
        if (response) {
          // Populating metadatas variables  && metadatas.status === "200"

          mediaType = metadatas.data.pageType
            ?? metadatas.data.content?.pageType
            ?? ''

          title = metadatas.data.content?.title ?? 'Auvio'
          subtitle = metadatas.data.content?.subtitle
            ?? metadatas.data.content?.media?.subtitle
            ?? ''

          if (title === subtitle)
            subtitle = ''

          if (!subtitle) {
            const titleParts = title.split(' - ')
            if (titleParts.length > 1) {
              subtitle = titleParts[1] ?? ''
              title = title.replace(subtitle, '').trim()
            }
          }

          description = metadatas.data.content?.description?.length > 2
            ? limitText(metadatas.data.content.description, 128)
            : metadatas.data.content?.media?.description?.length > 2
              ? limitText(metadatas.data.content.media.description, 128)
              : 'Auvio'

          image = metadatas.data.content?.background?.m ?? ActivityAssets.Logo

          channel = (metadatas.data.content?.channel ?? {})?.label ?? metadatas.data.content?.media?.channelLabel ?? ''

          duration = metadatas.data.content?.duration
            ? formatDuration(metadatas.data.content.duration)
            : metadatas.data.content?.media?.duration
              ? formatDuration(metadatas.data.content.media.duration)
              : ''

          category = metadatas.data.content?.category?.label ?? ''

          scheduledFrom = metadatas.data.content?.scheduledFrom ?? new Date(browsingTimestamp).toISOString()
          scheduledTo = metadatas.data.content?.scheduledTo ?? new Date(browsingTimestamp + 6000).toISOString()

          if (scheduledFrom) {
            waitTime = (new Date(scheduledFrom).getTime() / 1000) - browsingTimestamp
          }

          if (scheduledTo) {
            remainingTime = (new Date(scheduledTo).getTime() / 1000) - browsingTimestamp
          }
        }
        else {
          let mediaData: any

          for (
            let i = 0;
            i
            < document.querySelectorAll('script[type=\'application/ld+json\']')
              .length;
            i++
          ) {
            const data = JSON.parse(
              document.querySelectorAll('script[type=\'application/ld+json\']')[i]?.textContent ?? '{}',
            )
            if (['Movie', 'Episode', 'BroadcastEvent', 'VideoObject'].includes(data['@type']))
              mediaData = data
          }

          mediaType = pathParts[1]

          subtitle = document.querySelector('.DetailsTitle_subtitle__D30rn')?.textContent || ''
          title = document.querySelector('div.DetailsTitle_title__mdRHD > h1')?.textContent?.replace(subtitle, '') ?? 'Auvio'
          description = mediaData?.description && mediaData.description.length > 2 ? limitText(mediaData.description, 128) : 'Auvio'
          image = mediaData?.thumbnailUrl || ActivityAssets.Logo
          channel = document.querySelectorAll('div.DetailsTitle_channelCategory__vh_cY > div')[0]?.textContent ?? ''
          duration = formatDuration(mediaData?.duration ?? 0)
          category = document.querySelector('.Breadcrumb_breadcrumb__fdU_2 > ul > li:last-child > span')?.textContent || ''

          scheduledFrom = ''
          scheduledTo = ''
          waitTime = 0
          remainingTime = 0
        }
        if (!exist('#player')) {
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
            presenceData.largeImageKey = await getThumbnail(
              image,
              cropPreset.horizontal,
              getColor(channel),
            )
          }
          else {
            presenceData.largeImageKey = getChannel(channel).logo // Default logo if not found
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

          // SLIDE: Infos
          if (channel || duration || category) {
            const infosData = structuredClone(presenceData)
            infosData.state = [channel, duration, category].filter(Boolean).join(' - ') // "La Une - 51min - Policier"
            slideshow.addSlide('02', infosData, 5000)
          }

          // SLIDE: Livestream Status
          if (mediaType === 'LIVE') {
            const scheduleData = structuredClone(presenceData)
            if ((waitTime || -1) > 0) {
              scheduleData.state = 'Starts in {0}'.replace('{0}', formatDuration(waitTime!)) // "Starts in 3h41"
              scheduleData.smallImageKey = ActivityAssets.Waiting
              scheduleData.smallImageText = strings.waitingLive
            }
            else if ((remainingTime || -1) > 0) {
              scheduleData.state = 'Ends in {0}'.replace('{0}', formatDuration(remainingTime!)) // "Ends in 3h41"
              scheduleData.smallImageKey = ActivityAssets.Deferred
              scheduleData.smallImageText = strings.browsing
            }
            else {
              scheduleData.state = strings.liveEnded // "Livestream has ended"
            }
            slideshow.addSlide('03', scheduleData, 5000)
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
          title = document.querySelector('.TitleDetails_title__vsoUq')?.textContent ?? title
          subtitle = document.querySelector('.TitleDetails_subtitle__y1v4e')?.textContent ?? subtitle

          const videoArray = document.querySelectorAll('div.redbee-player-media-container > video')
          const video = videoArray[videoArray.length - 1] as HTMLVideoElement
          const bAdCountdown = exist(".sas-ctrl-countdown.sas-enable")

          // BASE SLIDES
          if (usePresenceName)
            presenceData.name = title

          presenceData.details = title

          presenceData.largeImageText = description
          if (usePoster) {
            presenceData.largeImageKey = await getThumbnail(
              image,
              cropPreset.horizontal,
              getColor(channel),
            )
          }
          else {
            presenceData.largeImageKey = getChannel(channel).logo // Default logo if not found
          }

          // LIVE MEDIA PLAYER
          const liveDelay = (Math.abs(Math.floor(new Date().getTime() / 1000 - video.currentTime)))
          if (mediaType === 'LIVE' 
            || (liveDelay < 3600) // Sometimes lives don't follow established codes
          ) {
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
              presenceData.smallImageKey = getLocalizedAssets(newLang, "Ad"),
              presenceData.smallImageText = strings.ad

              presenceData.startTimestamp = browsingTimestamp
              delete presenceData.endTimestamp
            } else if (liveDelay < 60) { // Live
              presenceData.smallImageKey = video.paused
                ? Assets.Pause
                : ActivityAssets.LiveAnimated
              presenceData.smallImageText = video.paused
                ? strings.pause
                : strings.live

              presenceData.startTimestamp = (new Date(scheduledFrom).getTime() / 1000)
              presenceData.endTimestamp = (new Date(scheduledTo).getTime() / 1000)
            }
            else { // Deferred
              presenceData.smallImageKey = video.paused
                ? Assets.Pause
                : ActivityAssets.DeferredAnimated
              presenceData.smallImageText = video.paused
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
              presenceData.buttons = [
                {
                  label: strings.buttonWatchVideo,
                  url: href,
                },
              ]
            }

            if (bAdCountdown) {
              presenceData.smallImageKey = getLocalizedAssets(newLang, "Ad"),
              presenceData.smallImageText = strings.ad

              presenceData.startTimestamp = browsingTimestamp
              delete presenceData.endTimestamp
            } else if (video.paused) {
              presenceData.smallImageKey = Assets.Pause
              presenceData.smallImageText = strings.pause

              presenceData.startTimestamp = browsingTimestamp
              delete presenceData.endTimestamp
            }
            else {
              presenceData.smallImageKey = Assets.Play
              presenceData.smallImageText = strings.play

              presenceData.startTimestamp = getTimestampsFromMedia(video)[0]
              presenceData.endTimestamp = getTimestampsFromMedia(video)[1]
            }
          }

          // SLIDE: Subtitle
          if (subtitle) {
            const subtitleData = structuredClone(presenceData)
            subtitleData.state = subtitle
            slideshow.addSlide('01', subtitleData, 5000)
          }

          // SLIDE: Infos
          if (channel || duration || category) {
            const infosData = structuredClone(presenceData)
            infosData.state = [channel, duration, category].filter(Boolean).join(' - ') // "La Une - 51min - Policier"
            slideshow.addSlide('02', infosData, 5000)
          }
        }
      }
      break
    }
    /* NOTE: HOME PAGE, CATEGORY & CHANNEL PAGE

    (ex: https://auvio.rtbf.be/categorie/sport-9 or https://auvio.rtbf.be/chaine/la-une-1) */

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
        const categoryTitle = document.querySelector('h1')!.textContent!.length < 20 // Sometimes the title is way too long
          ? document.querySelector('h1')!.textContent!
          : document.querySelector('li:nth-last-child() > span')!.textContent! // Last of breadcrumb list

        presenceData.details = pathParts[1] === 'podcasts' ? `${categoryTitle} & Radios` : categoryTitle

        presenceData.state = strings.viewCategory.replace(':', '')

        // Fallback
        presenceData.largeImageKey = await getThumbnail(
          getChannel(pathParts[1]!).logo,
          cropPreset.squared,
          getColor(categoryTitle),
        )
        presenceData.largeImageText = `Catégorie ${categoryTitle} sur Auvio`

        if (usePoster 
          && !['podcasts'].includes(pathParts[1]!) // TO-DO: Podcast category can cause issues
        ) {
          useSlideshow = true
          const selector = exist('img.TileProgramPoster_hoverPicture__v5RJX')
            ? 'img.TileProgramPoster_hoverPicture__v5RJX' // If programs cover art are in portrait
            : exist('img.TileMedia_hoverPicture__RGh_m')
              ?'img.TileMedia_hoverPicture__RGh_m' // If programs cover art are in landscape
              : ".TileMedia_mosaic__hxuYt > span > img"

          // SLIDES: Samples of content in the category
          const galleryElement = document.querySelector('.swiper-wrapper:has(:not(figure) img)') || document.querySelector(".Mosaic_mosaic__0Js0V")
          for (
            let index = 0;
            index < galleryElement!.childElementCount;
            index++
          ) {
            const src = decodeURIComponent(
              document.querySelectorAll(selector)[index]?.getAttribute('src')!.replace('/_next/image?url=', '').split('&w')[0] || '',
            )

            // Sometimes url starts with data:image and it doesn't render well, so we take no risks
            if (!src.match('data:image') && src !== '') {
              const sampleData = structuredClone(presenceData) // Deep copy
              const mediaTitle = document.querySelectorAll(selector)[index]?.getAttribute('title') || index.toString()

              sampleData.largeImageKey = await getThumbnail(
                src,
                exist('img.TileProgramPoster_hoverPicture__v5RJX')
                  ? cropPreset.vertical
                  : cropPreset.horizontal,
                  getColor(categoryTitle),
              )
              if (mediaTitle !== index.toString()) {
                const sample = strings.on.replace('{1}', pathParts[1]!.includes('chaine') ? categoryTitle : 'Auvio')
                sampleData.largeImageText = sampleData.state = sample.replace('{0}', limitText(mediaTitle, 128 - sample.length))
              }
              slideshow.addSlide(mediaTitle, sampleData, 2500)

              // SLIDE: Viewing Category
              const viewingData = structuredClone(sampleData)
              viewingData.state = strings.viewCategory.replace(':', '')
              viewingData.largeImageKey = getChannel(categoryTitle).logo
              slideshow.addSlide(`${mediaTitle}*`, viewingData, 2500)
            }
          }
        }

        if (useButtons) {
          presenceData.buttons = [
            {
              label: strings.buttonViewPage,
              url: href,
            },
          ]
        }
      }
      break
    }

    // In case we need a default
    default: {
      presenceData.details = strings.viewAPage
      presenceData.state = pathname
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
