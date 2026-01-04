import { ActivityType, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1191450515670843533',
})

presence.on('UpdateData', async () => {
  const [
    privacyMode,
    showBrowsingStatus,
    showCover,
    showTimestamp,
    showSmallImages,
  ] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showBrowsingStatus'),
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('showSmallImages'),
  ])

  const presenceData: any = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/HDrezka/assets/logo.png',
  }

  const urlPath = document.location.pathname
  const contentType = document.querySelector('meta[property=\'og:url\']')?.getAttribute('content')?.split('/')[3]
  const isMediaPage = urlPath.match(/\/(films|series|cartoons|animation)\/.+/)

  if (privacyMode && isMediaPage) {
    return presence.setActivity({
      details: 'Watching something private',
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/HDrezka/assets/logo.png',
    })
  }

  if (document.location.pathname === '/') {
    if (!showBrowsingStatus) {
      return presence.clearActivity()
    }
    presenceData.details = 'Browsing the Home Page'
  } else if (isMediaPage) {
    const title = document.querySelector('.b-post__title h1')?.textContent?.trim()
    const coverImage = document.querySelector<HTMLImageElement>('.b-sidecover a img')?.src

    presenceData.details = title
    presenceData.largeImageKey = (showCover && coverImage) ? coverImage : 'https://cdn.rcd.gg/PreMiD/websites/H/HDrezka/assets/logo.png'

    const video = document.querySelector('video')

    if (video && !video.paused) {
      if (showTimestamp) {
        const [startTimestamp, endTimestamp] = getTimestampsFromMedia(video)
        presenceData.startTimestamp = startTimestamp
        presenceData.endTimestamp = endTimestamp
      }
      presenceData.type = ActivityType.Watching
    } else if (showSmallImages) {
      presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/H/HDrezka/assets/logo.png'
      presenceData.smallImageText = 'Paused'
    }

    const isSeries = ['series', 'animation', 'cartoons'].includes(contentType || '')

    if (isSeries) {
      const activeSeason = document.querySelector('.b-simple_season__item.active')?.textContent?.trim()
      const activeEpisode = document.querySelector('.b-simple_episode__item.active')?.textContent?.trim()

      if (activeSeason && activeEpisode) {
        presenceData.state = `Season ${activeSeason}, Episode ${activeEpisode}`
      } else {
        presenceData.state = 'Watching a series'
      }
    } else {
      presenceData.state = 'Watching a movie'
    }

    const translator = document.querySelector('.b-translator__item.active')?.textContent?.trim()
    if (translator) {
      presenceData.largeImageText = `Voiceover: ${translator}`
    }

    presenceData.buttons = [
      {
        label: 'Watch on Rezka',
        url: document.location.href,
      },
    ]
  } else {
    if (!showBrowsingStatus) {
      return presence.clearActivity()
    }
    presenceData.details = 'Exploring the website'
  }

  presence.setActivity(presenceData)
})
