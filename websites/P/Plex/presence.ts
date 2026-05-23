import { ActivityType, Assets, getTimestamps, getTimestampsFromMedia, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '645028677033132033',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const { language } = window.navigator // Make this change-able with presence settings
// en = English
// nl = Nederlands
// Language list can be found here: https://api.premid.app/v2/langFile/list

/**
 * Get Translation
 * @param stringName Name of string you want to get
 */
function getTranslation(stringName: string): string {
  switch (stringName) {
    case 'HomePage':
      switch (language) {
        case 'nl':
          return 'Bekijkt de startpagina'
        case 'de':
          return 'Ist auf der Startseite'
        case 'sv':
          return 'Kollar på startsidan'
        default:
          return 'Viewing home page'
      }
    case 'News':
      switch (language) {
        case 'nl':
          return 'Bladeren door het niews'
        case 'de':
          return 'Sieht sich News an'
        case 'sv':
          return 'Bläddrar igenom nyheter'
        default:
          return 'Browsing news'
      }
    case 'WebShows':
      switch (language) {
        case 'nl':
          return 'Bladeren door alle web shows'
        case 'de':
          return 'Sieht sich Web-Shows an'
        case 'sv':
          return 'Bläddrar igenom web shows'
        default:
          return 'Browsing web shows'
      }
    case 'Podcasts':
      switch (language) {
        case 'nl':
          return 'Bladeren door podcasts'
        case 'de':
          return 'Sieht sich Podcasts an'
        case 'sv':
          return 'Bläddrar igenom podcasts'
        default:
          return 'Browsing podcasts'
      }
    case 'Music':
      switch (language) {
        case 'nl':
          return 'Bladeren door muziek'
        case 'de':
          return 'Sieht sich Musik an'
        case 'sv':
          return 'Bläddrar igenom musik'
        default:
          return 'Browsing music'
      }
    case 'Search':
      switch (language) {
        case 'nl':
          return 'Zoekt naar:'
        case 'de':
          return 'Sucht nach:'
        case 'sv':
          return 'Söker efter:'
        default:
          return 'Searching for:'
      }
    case 'Library':
      switch (language) {
        case 'nl':
          return 'Bekijkt bibliotheek:'
        case 'de':
          return 'Ist in der Bibliothek:'
        case 'sv':
          return 'Kollar på bibliotek:'
        default:
          return 'Viewing library:'
      }
      break
    case 'Collection':
      switch (language) {
        case 'nl':
          return 'Bekijkt collectie:'
        case 'de':
          return 'Ist in der Kollektion'
        case 'sv':
          return 'Kollar på samling:'
        default:
          return 'Viewing collection:'
      }

    case 'Playlist':
      switch (language) {
        case 'nl':
          return 'Bekijkt afspeellijst:'
        case 'de':
          return 'Ist in der Playlist'
        case 'sv':
          return 'Kollar på spellista:'
        default:
          return 'Viewing playlist:'
      }
    case 'Vod':
      switch (language) {
        case 'nl':
          return 'Bekijkt Film/TV Show/VOD:'
        case 'de':
          return 'Schaut Film/TV-Sendung/VOD:'
        case 'sv':
          return 'Kollar på Film/TV Show/VOD:'
        default:
          return 'Viewing Movie/TV Show/VOD:'
      }
    default:
      presence.error(
        'Unknown StringName please contact the Developer of this presence!\nYou can contact him/her in the PreMiD Discord (discord.premid.app)',
      )
      return 'Unknown stringName'
  }
}

let isUploading = false

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/P/Plex/assets/logo.png',
}

const uploadedImages: Record<string, string> = {}
async function uploadImage(urlToUpload: string): Promise<string> {
  if (isUploading)
    return ActivityAssets.Logo

  if (uploadedImages[urlToUpload])
    return uploadedImages[urlToUpload]
  isUploading = true

  return new Promise((resolve) => {
    fetch(urlToUpload)
      .then(res => res.blob())
      .then((blob) => {
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = () => {
          isUploading = false

          const result = reader.result as string
          uploadedImages[urlToUpload] = result

          resolve(result)
        }
      })
  })
}
function isPrivateIp(ip = location.hostname) {
  return /^(?:(?:10|127|192(?:\.|-)168|172(?:\.|-)(?:1[6-9]|2\d|3[01]))(?:\.|-)|localhost)/.test(
    ip,
  )
}

const shortenedURLs: Record<string, string> = {}
async function getShortURL(url: string) {
  if (url && isPrivateIp(new URL(url).hostname))
    return await uploadImage(url)
  if (!url || url.length < 256)
    return url

  if (shortenedURLs[url])
    return shortenedURLs[url]
  try {
    const pdURL = await (
      await fetch(`https://pd.premid.app/create/${url}`)
    ).text()
    shortenedURLs[url] = pdURL
    return pdURL
  }
  catch (err) {
    presence.error(err as string)
    return url
  }
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  } as PresenceData
  const { pathname, href } = document.location

  if (document.querySelector('#plex')) {
    if (document.querySelector('#plex > div:nth-child(4) > div')) {
      const media = document.querySelector<HTMLVideoElement | HTMLAudioElement>(
        '#plex :is(video, audio)',
      )
      const [cover, titlePresenceName] = await Promise.all([
        presence.getSetting<boolean>('cover'),
        presence.getSetting<boolean>('usePresenceName'),
      ])

      if (
        document.querySelector('[class^=PlayerControls-buttonGroupCenter]')!
          .children
          .length > 1
      ) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(media!)
      }
      else {
        const formatTimestamps = document
          .querySelector('[data-testid="mediaDuration"]')
          ?.textContent
          ?.split(' ');

        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
          timestampFromFormat(formatTimestamps?.[0] ?? ''),
          timestampFromFormat(formatTimestamps?.[1] ?? ''),
        )
      }

      if (cover && navigator.mediaSession.metadata?.artwork?.[0]?.src) {
        const art = navigator.mediaSession.metadata.artwork?.[0]?.src
        presenceData.largeImageKey = await getShortURL(
          art
            .replace(/width=\d{1,3}/, 'width=1024')
            .replace(/height=\d{1,3}/, 'height=1024'),
        )
      }

      presenceData.smallImageKey = media?.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = media?.paused ? 'Paused' : 'Playing'

      const title = document.querySelector(
        '[class^=PlayerControlsMetadata] [data-testid="metadataTitleLink"]',
      )?.textContent
      const subTitle = Array.from(
        document.querySelector(
          '[class^=PlayerControlsMetadata] :is([data-testid="metadataTitleLink"] + span, [data-testid="metadataTitleLink"] + div)',
        )!.childNodes,
      )
        .map(node => node.textContent)
        .join(' ')

      if (!titlePresenceName)
        presenceData.details = title
      else presenceData.name = title ?? ''

      presenceData.state = subTitle
      if (
        (!navigator.mediaSession.metadata?.artist
          && !navigator.mediaSession.metadata?.album)
        || !!document.querySelector('.application.show-video-player')
        || !!document.querySelector('video')
      ) {
        presenceData.type = ActivityType.Watching
      }
      else {
        presenceData.type = ActivityType.Listening
      }

      if (media?.paused) {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }
    else if (href.includes('/tv.plex.provider.webshows')) {
      presenceData.details = getTranslation('WebShows')
      const title = document.querySelector(
        '#plex > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > span',
      )
      if (title) {
        presenceData.details = 'Viewing webshow:'
        presenceData.state = title.textContent
      }
    }
    else if (href.includes('/tv.plex.provider.news')) {
      presenceData.details = getTranslation('News')
    }
    else if (href.includes('/tv.plex.provider.podcasts')) {
      presenceData.details = getTranslation('Podcasts')
      const title = document.querySelector(
        '#plex > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > span',
      )
      if (title) {
        presenceData.details = 'Viewing podcast:'
        presenceData.state = title.textContent
      }
    }
    else if (href.includes('/tv.plex.provider.music')) {
      presenceData.details = getTranslation('Music')
      const title = document.querySelector(
        '#plex > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > span',
      )
      if (title) {
        presenceData.details = 'Viewing album:'
        presenceData.state = title.textContent
      }
    }
    else if (href.includes('/search')) {
      const search = document.querySelector(
        '#plex > div:nth-child(3) > div > div:nth-child(2) > div > div:nth-child(2) > span',
      )

      presenceData.details = getTranslation('Search')
      presenceData.state = search?.textContent?.split('"')[1]?.replace(/"/g, '')
      presenceData.smallImageKey = Assets.Search
    }
    else if (href.includes('/com.plexapp.plugins.library')) {
      presenceData.details = getTranslation('Library')
      presenceData.state = document.querySelector(
        '#plex > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > a > div:nth-child(1)',
      )?.textContent
    }
    else if (href.includes('content.collections')) {
      presenceData.details = getTranslation('Collection')
      presenceData.state = document.querySelector(
        '#plex > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(3) > span',
      )?.textContent
    }
    else if (
      href.includes('content.playlists')
      && document.querySelector(
        '#plex > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(3) > span',
      )
    ) {
      presenceData.details = getTranslation('Playlist')
      presenceData.state = document.querySelector(
        '#plex > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(3) > span',
      )?.textContent
    }
    else if (href.includes('tv.plex.provider.vod')) {
      presenceData.details = getTranslation('Vod')
      presenceData.state = document.querySelector(
        '#plex > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div > span',
      )?.textContent
    }
    else if (href.includes('/server/')) {
      presenceData.details = getTranslation('Vod')
      presenceData.state = document.querySelector(
        '#plex > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div > span',
      )?.textContent
    }
    else if (
      href === 'https://app.plex.tv/'
      || href === 'https://app.plex.tv/desktop'
      || href === 'https://app.plex.tv/desktop#'
      || href === 'https://app.plex.tv/desktop/#!/'
      || pathname === '/web/index.html'
      || pathname === '/web/index.html#'
    ) {
      presenceData.details = getTranslation('HomePage')
    }

    if (!presenceData.details && !presenceData.name)
      presence.setActivity()
    else presence.setActivity(presenceData)
  }
})
