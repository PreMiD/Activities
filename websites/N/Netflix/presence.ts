import type { ShowVideo } from './types.js'
import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'
import {
  clearMetadata,
  fetchMetadata,
  metadata,
} from './functions/fetchMetadata.js'

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/N/Netflix/assets/1.png',
  Noback = 'https://cdn.rcd.gg/PreMiD/websites/N/Netflix/assets/2.png',
  Animated = 'https://cdn.rcd.gg/PreMiD/websites/N/Netflix/assets/0.gif',
}

const presence = new Presence({
  clientId: '926541425682829352',
})

async function getStrings() {
  return presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    browse: 'general.browsing',
    watchingMovie: 'general.watchingMovie',
    watchingSeries: 'general.watchingSeries',
    viewSeries: 'general.buttonViewSeries',
    viewMovies: 'general.buttonViewMovie',
    watchEpisode: 'general.buttonViewEpisode',
    watchMovie: 'general.buttonWatchMovie',
    seriesDisplayFull: 'netflix.seriesDisplay.full',
    seriesDisplayShort: 'netflix.seriesDisplay.short',
    movieDisplay: 'netflix.movieDisplay',
    searching: 'netflix.searching',
    searchingFor: 'netflix.searchingFor',
    myList: 'netflix.myList',
    latest: 'netflix.latest',
    games: 'netflix.games',
    originalAudio: 'netflix.originalAudio',
    audio: 'netflix.audio',
    subtitles: 'netflix.subtitles',
    browsingGenre: 'netflix.browsingGenre',
  })
}

let oldLang: string | null = null
let strings: Awaited<ReturnType<typeof getStrings>>
let browsingTimestamp: number | null = null

const GENRE_MAP: Record<string, string> = {
  34399: 'Films',
  801362: 'Action Films',
  7442: 'Adventure Films',
  3063: 'Anime Films',
  89844: 'Award-Winning Films',
  90139: 'Blockbuster Films',
  6548: 'Comedy Films',
  5824: 'Crime Films',
  2243108: 'Documentaries',
  5763: 'Drama Films',
  89708: 'European Films',
  9744: 'Fantasy Films',
  58886: 'German Films',
  8711: 'Horror Films',
  7077: 'Independent Films',
  78367: 'International Films',
  783: 'Kids & Family',
  52852: 'Music & Musicals',
  8883: 'Romantic Films',
  3276033: 'Sci-Fi Films',
  3345391: 'Short Films & Documentaries',
  4370: 'Sport Films',
  11559: 'Stand-Up Comedy',
  8933: 'Thriller Films',
  83: 'Series',
  10673: 'Action & Adventure Series',
  6721: 'Anime Series',
  52117: 'British Series',
  10375: 'Comedy Series',
  26146: 'Crime Series',
  10105: 'Documentary Series',
  11714: 'Drama Series',
  82900738: 'Netflix Emmy® Collection',
  89663: 'European Series',
  65198: 'German Series',
  83059: 'Horror Series',
  1195213: 'International Series',
  27346: 'Kids TV',
  4366: 'Mystery Series',
  2070390: 'Reality, Variety & Chat Shows',
  26156: 'Romantic Series',
  1372: 'Sci-Fi & Fantasy Series',
  52780: 'Science & Nature Series',
  25788: 'Sport Series',
  60951: 'Teen Series',
  89811: 'Thriller Series',
  72404: 'US Series',
}

presence.on('UpdateData', async () => {
  const [
    lang,
    usePresenceName,
    showTimestamp,
    showBrowsingStatus,
    showCover,
    showSeries,
    showMovies,
    showSmallImages,
    logoType,
    privacyMode,
  ] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('usePresenceName'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('showBrowsingStatus'),
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('showSeries'),
    presence.getSetting<boolean>('showMovies'),
    presence.getSetting<boolean>('showSmallImages'),
    presence.getSetting<number>('logoType'),
    presence.getSetting<boolean>('privacy'),
  ])

  if (oldLang !== lang) {
    oldLang = lang
    strings = await getStrings()
  }

  const path = document.location.href
  const watchingMediaId = path.match(/\/watch\/(\d+)/)

  if (watchingMediaId) {
    browsingTimestamp = null
    await fetchMetadata(watchingMediaId[1]!)
    const video = document.querySelector('video')

    if (!video)
      return

    const { paused } = video
    const [startTimestamp, endTimestamp] = getTimestampsFromMedia(video)

    if (metadata?.data?.video.type === 'show' && showSeries) {
      if (privacyMode) {
        return await presence.setActivity({
          type: ActivityType.Watching,
          details: strings.watchingSeries,
          largeImageKey: ActivityAssets.Logo,
        })
      }

      const videoData = metadata.data.video as ShowVideo
      const season = metadata.data.video.seasons.find(s =>
        s.episodes.map(e => e.episodeId).includes(videoData.currentEpisode),
      )
      const episode = season?.episodes.find(
        e => e.episodeId === videoData.currentEpisode,
      )

      return await presence.setActivity({
        type: ActivityType.Watching,
        details: metadata.data.video.title,
        state: strings.seriesDisplayShort
          .replace('{0}', season?.seq.toString() ?? '')
          .replace('{1}', episode?.seq.toString() ?? '')
          .replace('{2}', episode?.title ?? ''),
        largeImageKey: !showCover
          ? [ActivityAssets.Animated, ActivityAssets.Logo, ActivityAssets.Noback][logoType]
          || ActivityAssets.Logo
          : metadata?.data?.video.boxart.at(0)?.url,
        largeImageText: `Season ${season?.seq.toString()}, Episode ${episode?.seq.toString()}`,
        ...(showSmallImages && paused && {
          smallImageKey: Assets.Pause,
          smallImageText: strings.pause,
        }),
        ...(showTimestamp && !paused && {
          startTimestamp,
          endTimestamp,
        }),
        ...(usePresenceName && {
          name: metadata.data.video.title,
          details: episode?.title,
          state: episode?.synopsis,
        }),
        buttons: [
          {
            label: strings.watchEpisode,
            url: document.location.href.split('?')[0]!,
          },
          {
            label: strings.viewSeries,
            url: `https://www.netflix.com/title/${metadata.data.video.id}`,
          },
        ],
      })
    }

    if (metadata?.data?.video.type === 'movie' && showMovies) {
      if (privacyMode) {
        return await presence.setActivity({
          type: ActivityType.Watching,
          details: strings.watchingMovie,
          largeImageKey: ActivityAssets.Logo,
        })
      }

      return await presence.setActivity({
        type: ActivityType.Watching,
        details: metadata.data.video.title,
        state: strings.movieDisplay
          .replace('{0}', metadata.data.video.year.toString())
          .replace(
            '{1}',
            Math.floor(metadata.data.video.runtime / 60).toString(),
          ),
        largeImageKey: !showCover
          ? [ActivityAssets.Animated, ActivityAssets.Logo, ActivityAssets.Noback][logoType]
          || ActivityAssets.Logo
          : metadata.data.video.boxart.at(0)?.url,
        ...(showSmallImages && {
          smallImageKey: paused ? Assets.Pause : Assets.Play,
        }),
        smallImageText: paused ? strings.pause : strings.play,
        ...(showTimestamp && !paused && {
          startTimestamp,
          endTimestamp,
        }),
        ...(usePresenceName && {
          name: metadata.data.video.title,
        }),
        buttons: [
          {
            label: strings.watchMovie,
            url: document.location.href.split('?')[0]!,
          },
        ],
      })
    }

    return presence.clearActivity()
  }

  if (!browsingTimestamp)
    browsingTimestamp = Math.floor(Date.now() / 1000)

  const browsingMediaId = path.match(/\/title\/(\d+)/) ?? path.match(/jbv=(\d+)/)

  if (browsingMediaId) {
    if (privacyMode)
      return presence.clearActivity()

    await fetchMetadata(browsingMediaId[1]!)

    return await presence.setActivity({
      details: metadata?.data?.video.title,
      state: metadata?.data?.video.synopsis.slice(0, 128),
      ...(showTimestamp && { startTimestamp: browsingTimestamp }),
      largeImageKey: !showCover
        ? [ActivityAssets.Animated, ActivityAssets.Logo, ActivityAssets.Noback][logoType]
        || ActivityAssets.Logo
        : metadata?.data?.video.boxart.at(0)?.url,
      ...(showSmallImages && {
        smallImageKey: Assets.Reading,
      }),
      smallImageText: strings.browse,
      buttons: [
        {
          label: metadata?.data?.video.type === 'show'
            ? strings.viewSeries
            : strings.viewMovies,
          url: document.location.href,
        },
      ],
    })
  }

  clearMetadata()

  if (showBrowsingStatus && !privacyMode) {
    const url = new URL(document.location.href)
    const pathname = url.pathname

    let details: string = strings.browse

    if (pathname.startsWith('/search')) {
      const query = url.searchParams.get('q')
      details = query ? strings.searchingFor.replace('{0}', query) : strings.searching
    }
    else if (pathname.includes('/my-list')) {
      details = strings.myList
    }
    else if (pathname.includes('/latest')) {
      details = strings.latest.replace('{0}', ' ')
    }
    else if (pathname.includes('/games')) {
      details = strings.games
    }
    else if (pathname.includes('/browse/original-audio')) {
      details = strings.originalAudio
    }
    else if (pathname.includes('/browse/audio')) {
      details = strings.audio
    }
    else if (pathname.includes('/browse/subtitles')) {
      details = strings.subtitles
    }
    else if (pathname.includes('/browse/genre/')) {
      const genreId = pathname.split('/browse/genre/')[1]?.split('?')[0]?.replace('/', '')
      const mappedGenre = genreId ? GENRE_MAP[genreId] : undefined
      const domGenre = document.querySelector('.genre-title, .header-title, h1')?.textContent?.trim()

      const genreName = mappedGenre || domGenre
      details = genreName ? strings.browsingGenre.replace('{0}', genreName) : strings.browse
    }

    return await presence.setActivity({
      details,
      ...(showTimestamp && { startTimestamp: browsingTimestamp }),
      largeImageKey: [ActivityAssets.Animated, ActivityAssets.Logo, ActivityAssets.Noback][logoType]
        || ActivityAssets.Logo,
      smallImageKey: Assets.Reading,
      smallImageText: strings.browse,
    })
  }

  browsingTimestamp = null
  return presence.clearActivity()
})
