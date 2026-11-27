import type { IncludedItem } from './types.js'
import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'
import {
  clearPageInfo,
  fetchPageInfo,
  getPageInfo,
} from './functions/fetchPageInfo.js'

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/H/HBO%20Max/assets/logo.jpeg',
}

const presence = new Presence({
  clientId: '1394513095367463043',
})

function findByAlternateId(id: string) {
  return getPageInfo()?.data?.included?.find((x: IncludedItem) => x.attributes?.alternateId === id)
}

function findById(id: string) {
  return getPageInfo()?.data?.included?.find((x: IncludedItem) => x.id === id)
}

function getCoverArt(item: ReturnType<typeof findByAlternateId>): string | undefined {
  if (!item?.relationships?.images?.data)
    return undefined

  const images = item.relationships.images.data
  const allImages = images
    .map(ref => findById(ref.id))
    .filter(Boolean)

  const boxart = allImages.find((img) => {
    const kind = (img?.attributes as any)?.kind as string | undefined
    return kind && (kind.includes('box') || kind.includes('tile') || kind.includes('poster'))
  })
  if (boxart?.attributes.src)
    return boxart.attributes.src

  const any = allImages.find(img => img?.attributes.src)
  return any?.attributes.src
}

function getAttrs(item: ReturnType<typeof findByAlternateId>) {
  return item?.attributes as any
}

function getDescription(item: ReturnType<typeof findByAlternateId>): string | undefined {
  const attrs = getAttrs(item)
  return attrs?.logLine ?? attrs?.description ?? attrs?.synopsis ?? undefined
}

function getTitleInfo(usePresenceName: boolean) {
  const pageInfo = getPageInfo()
  if (!pageInfo?.data)
    return null

  const segments = location.pathname.split('/')

  if (segments[1] === 'video') {
    const episodeItem = findByAlternateId(segments[3] ?? '')
    const showId = episodeItem?.relationships?.show?.data.id ?? ''
    const showItem = findByAlternateId(showId)

    if (!episodeItem || !showItem)
      return null

    const isMovie = episodeItem.attributes.videoType === 'MOVIE'
    const s = episodeItem.attributes.seasonNumber
    const e = episodeItem.attributes.episodeNumber
    const showName = showItem.attributes.name
    const episodeName = episodeItem.attributes.name

    if (isMovie) {
      const releaseDate = getAttrs(episodeItem)?.airDate ?? getAttrs(showItem)?.premiereDate
      const year = releaseDate
        ? new Date(releaseDate).getUTCFullYear()
        : undefined
      const editId = (episodeItem.relationships as any)?.edit?.data?.id as string | undefined
      const durationMs = editId
        ? getAttrs(findById(editId))?.duration as number | undefined
        : undefined
      const minutes = durationMs
        ? Math.floor(durationMs / 60_000)
        : undefined

      return {
        name: usePresenceName ? showName : 'HBO Max',
        details: showName,
        state: [
          year,
          minutes
            ? `${minutes} minutes`
            : undefined,
        ].filter(Boolean).join(' • ') || undefined,
        largeImageKey: getCoverArt(showItem),
        largeImageText: showName,
        isMovie,
        pageUrl: document.location.href.split('?')[0]!,
        showUrl: undefined,
      }
    }

    return {
      name: usePresenceName ? showName : 'HBO Max',
      details: (usePresenceName && episodeName) || showName,
      state: usePresenceName || !episodeName
        ? `Season ${s}, Episode ${e}`
        : `S${s} E${e} - ${episodeName}`,
      largeImageKey: getCoverArt(showItem),
      largeImageText: `Season ${s}, Episode ${e}`,
      isMovie,
      pageUrl: document.location.href.split('?')[0]!,
      showUrl: `${document.location.origin}/series/${showId}`,
    }
  }

  const browseItem = findByAlternateId(segments[2] ?? '')
  const desc = getDescription(browseItem)

  return {
    details: browseItem?.attributes.name,
    state: desc?.slice(0, 128),
    largeImageKey: getCoverArt(browseItem),
    largeImageText: browseItem?.attributes.name,
    isMovie: segments[1] === 'movie',
    pageUrl: document.location.href.split('?')[0]!,
    showUrl: undefined,
  }
}

presence.on('UpdateData', async () => {
  const [
    usePresenceName,
    showCoverArt,
    showTimestamp,
    showBrowsingStatus,
    privacyMode,
  ] = await Promise.all([
    presence.getSetting<boolean>('usePresenceName'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('showBrowsingStatus'),
    presence.getSetting<boolean>('privacy'),
  ])

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
  }

  const segments = document.location.pathname.split('/')

  await fetchPageInfo(document.location.pathname)

  switch (segments[1]) {
    case 'show': {
      if (privacyMode) {
        presenceData.details = 'Watching a series'
        break
      }
      const info = getTitleInfo(false)
      presenceData.details = info?.details ?? 'Viewing a show:'
      presenceData.state = info?.state
      if (showCoverArt && info?.largeImageKey) {
        presenceData.largeImageKey = info.largeImageKey
        presenceData.largeImageText = info.largeImageText
      }
      if (info?.pageUrl) {
        presenceData.buttons = [
          { label: 'View Series', url: info.pageUrl },
        ]
      }
      break
    }

    case 'movie': {
      if (privacyMode) {
        presenceData.details = 'Watching a movie'
        break
      }
      const info = getTitleInfo(false)
      presenceData.details = info?.details ?? 'Viewing a movie:'
      presenceData.state = info?.state
      if (showCoverArt && info?.largeImageKey) {
        presenceData.largeImageKey = info.largeImageKey
        presenceData.largeImageText = info.largeImageText
      }
      if (info?.pageUrl) {
        presenceData.buttons = [
          { label: 'View Movie', url: info.pageUrl },
        ]
      }
      break
    }

    case 'video': {
      const video = document.querySelector('video')
      const playerTitle = document.querySelector('[data-testid="player-ux-asset-title"]')?.textContent?.trim()
      const info = getTitleInfo(usePresenceName && !privacyMode)
        ?? (playerTitle
          ? {
              name: usePresenceName ? playerTitle : 'HBO Max',
              details: playerTitle,
              state: undefined,
              largeImageKey: undefined,
              largeImageText: undefined,
              isMovie: undefined as boolean | undefined,
              pageUrl: document.location.href.split('?')[0]!,
              showUrl: undefined,
            }
          : null)

      if (!info || !video)
        break

      if (!privacyMode) {
        presenceData.name = info.name ?? playerTitle
        presenceData.details = info.details ?? playerTitle
        presenceData.state = info.state
        if (showCoverArt && info.largeImageKey) {
          presenceData.largeImageKey = info.largeImageKey
          presenceData.largeImageText = info.largeImageText
        }
        if (info.isMovie === undefined) {
          presenceData.buttons = [
            { label: 'Watch Now', url: info.pageUrl },
          ]
        }
        else if (info.isMovie) {
          presenceData.buttons = [
            { label: 'Watch Movie', url: info.pageUrl },
          ]
        }
        else {
          presenceData.buttons = info.showUrl
            ? [
                { label: 'Watch Episode', url: info.pageUrl },
                { label: 'View Series', url: info.showUrl },
              ]
            : [
                { label: 'Watch Episode', url: info.pageUrl },
              ]
        }
      }
      else {
        presenceData.details = info.isMovie === undefined
          ? 'Watching HBO Max'
          : info.isMovie ? 'Watching a movie' : 'Watching a series'
      }

      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused ? 'Paused' : 'Playing'

      if (showTimestamp && !video.paused && !privacyMode) {
        const [start, end] = getTimestampsFromMedia(video)
        presenceData.startTimestamp = start
        presenceData.endTimestamp = end
      }
      break
    }

    default: {
      clearPageInfo()

      if (!showBrowsingStatus || privacyMode)
        return presence.clearActivity()

      presenceData.details = 'Browsing HBO Max...'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Browsing'
      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
