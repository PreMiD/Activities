import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '721748388143562852',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  browsing: 'general.browsing',
})
const media: MediaObj = {
  // anyone is welcome to suggest more metadata via GH issues
  time: undefined,
  length: undefined,
  state: 'stopped',
  loop: undefined,
  repeat: undefined,
  filename: undefined,
  title: undefined,
  album: undefined,
  artist: undefined,
  trackNumber: undefined,
  showName: undefined,
  seasonNumber: undefined,
  episodeNumber: undefined,
  Type: undefined,
}
let isShow = false
let isSong = false
let prev: string | undefined
let elapsed: number
let i: number
let oldArt = ''
let dataURL = ''

function setLoop(f: () => void, ms: number): number {
  f()
  return setInterval(f, ms)
}

function decodeReq(entity: Element) {
  // decoding HTML entities the stackoverflow way
  const txt = document.createElement('textarea')
  txt.innerHTML = entity.textContent ?? ''
  return txt.value
}

function getTag(collection: NodeListOf<Element>, tagName: string) {
  for (const tag of collection) {
    if (tag.getAttribute('name') === tagName)
      return tag
  }
}

presence.on('UpdateData', async () => {
  if (
    document.querySelector('.footer')
    && document.querySelector('.footer')?.textContent?.includes('VLC')
  ) {
    const presenceData: PresenceData = {
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/VLC/assets/logo.png',
    }

    if (media.state !== prev) {
      prev = media.state
      elapsed = Math.floor(Date.now() / 1000)
    }

    if (media.Type === 'Audio')
      (presenceData as PresenceData).type = ActivityType.Listening
    else if (media.Type === 'Video')
      (presenceData as PresenceData).type = ActivityType.Watching

    if (media.state === 'playing' || media.state === 'paused') {
      const img = document.querySelector<HTMLImageElement>('#albumArt')
      if (!img)
        return
      if (img.src !== oldArt) {
        const artCanvas = document.createElement('canvas')
        const ctx = artCanvas.getContext('2d')
        if (!ctx)
          return
        artCanvas.height = 256
        artCanvas.width = 256

        ctx.drawImage(img, 0, 0, artCanvas.width, artCanvas.height)
        dataURL = artCanvas.toDataURL()
        oldArt = img.src
      }

      if (!img.src.includes('/images/') && dataURL.includes('image'))
        presenceData.largeImageKey = dataURL

      if (isSong) {
        if (media.title && media.album && media.title === media.album)
          media.album = undefined

        presenceData.details = ((media.title ?? '')
          + (media.trackNumber ? ` Track N°${media.trackNumber}` : '')
          || 'A song') + (media.album ? ` on ${media.album}` : '')
        media.artist
          ? (presenceData.state = `by ${media.artist}`)
          : media.filename
            ? (presenceData.state = media.filename)
            : delete presenceData.state
      }
      else if (isShow) {
        media.showName
          ? (presenceData.details = media.showName)
          : media.title
            ? (presenceData.details = media.title)
            : media.filename
              ? (presenceData.details = media.filename)
              : (presenceData.details = 'some TV')
        presenceData.state = `S${media.seasonNumber}E${media.episodeNumber}`
      }
      else {
        media.showName
          ? (presenceData.details = media.showName)
          : media.title
            ? (presenceData.details = media.title)
            : media.filename
              ? (presenceData.details = media.filename)
              : (presenceData.details = 'something')
        media.seasonNumber
          ? (presenceData.state = `season ${media.seasonNumber}`)
          : media.episodeNumber
            ? (presenceData.state = `episode ${media.episodeNumber}`)
            : delete presenceData.state
      }

      if (presenceData.details && presenceData.details.length > 100)
        presenceData.details = presenceData.details.substring(0, 127)
      if (
        typeof presenceData.state === 'string'
        && presenceData.state.length > 100
      ) {
        presenceData.state = presenceData.state.substring(0, 127)
      }

      presenceData.smallImageKey = media.state === 'paused'
        ? Assets.Pause
        : media.loop === 'true' && media.repeat === 'false'
          ? Assets.Repeat
          : media.repeat === 'true' && media.loop === 'false'
            ? Assets.RepeatOne
            : media.state === 'playing'
              ? Assets.Play
              : Assets.Pause

      presenceData.smallImageText = media.state === 'paused'
        ? (await strings).pause
        : media.loop === 'true' && media.repeat === 'false'
          ? 'All on loop'
          : media.repeat === 'true' && media.loop === 'false'
            ? 'On loop'
            : media.state === 'playing'
              ? (await strings).play
              : (await strings).pause;

      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(Number(media.time), Number(media.length))

      if (media.state === 'playing') {
        presence.setActivity(presenceData)
      }
      else {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
        presence.setActivity(presenceData)
      }
    }
    else if (media.state === 'stopped') {
      presenceData.details = 'standby'
      delete presenceData.state
      delete presenceData.smallImageKey
      delete presenceData.smallImageText
      presenceData.startTimestamp = elapsed
      delete presenceData.endTimestamp

      presence.setActivity(presenceData)
    }
  }
})

const getStatus = setLoop(() => {
  if (
    document.querySelector('.footer')
    && document.querySelector('.footer')?.textContent?.includes('VLC')
  ) {
    const req = new XMLHttpRequest()
    // jquery sucks!!!

    req.onload = function (): void {
      if (req.readyState === req.DONE) {
        if (req.status === 200) {
          if (i > 0)
            i = 0;

          (req.responseXML?.querySelectorAll('state')[0]?.textContent?.length ?? 0) > 0
            ? (media.state = req.responseXML?.querySelectorAll('state')[0]?.textContent ?? undefined)
            : (media.state = 'stopped')

          if (media.state !== 'stopped') {
            media.time = req.responseXML?.querySelectorAll('time')[0]?.textContent ?? undefined
            media.length = req.responseXML?.querySelectorAll('length')[0]?.textContent ?? undefined
            media.loop = req.responseXML?.querySelectorAll('loop')[0]?.textContent ?? undefined
            media.repeat = req.responseXML?.querySelectorAll('repeat')[0]?.textContent ?? undefined
          }
          else {
            media.time = undefined
            media.length = undefined
            media.loop = undefined
            media.repeat = undefined
          }

          if (navigator.userAgent.toLowerCase().includes('firefox')) {
            const collection = req.responseXML!.querySelectorAll('info')!

            // basically the same thing but with a Firefox workaround because it's annoying

            getTag(collection, 'filename')
              ? (media.filename = decodeReq(getTag(collection, 'filename')!) ?? undefined)
              : (media.filename = undefined)
            getTag(collection, 'title')
              ? (media.title = decodeReq(getTag(collection, 'title')!) ?? undefined)
              : (media.title = undefined)
            getTag(collection, 'showName')
              ? (media.showName = decodeReq(getTag(collection, 'showName')!) ?? undefined)
              : (media.showName = undefined)
            getTag(collection, 'Type')
              ? (media.Type = decodeReq(getTag(collection, 'Type')!) ?? undefined)
              : (media.Type = undefined)

            if (getTag(collection, 'artist') || getTag(collection, 'album')) {
              isSong = true
              getTag(collection, 'artist')
                ? (media.artist = decodeReq(getTag(collection, 'artist')!) ?? undefined)
                : (media.artist = undefined)
              getTag(collection, 'album')
                ? (media.album = decodeReq(getTag(collection, 'album')!) ?? undefined)
                : (media.album = undefined)
            }
            else {
              isSong = false
              media.artist = undefined
              media.album = undefined
            }

            getTag(collection, 'trackNumber')
              ? (media.trackNumber = decodeReq(
                  getTag(collection, 'trackNumber')!,
                ) ?? undefined)
              : (media.trackNumber = undefined)

            if (
              getTag(collection, 'seasonNumber')
              && getTag(collection, 'episodeNumber')
            ) {
              isShow = true
              media.seasonNumber = decodeReq(
                getTag(collection, 'seasonNumber')!,
              ) ?? undefined
              media.episodeNumber = decodeReq(
                getTag(collection, 'episodeNumber')!,
              ) ?? undefined
            }
            else {
              isShow = false
              media.seasonNumber = undefined
              media.episodeNumber = undefined
            }
          }
          else {
            req.responseXML!.getElementsByName('filename')[0]
              ? (media.filename = decodeReq(
                  req.responseXML!.getElementsByName('filename')[0]!,
                ) ?? undefined)
              : (media.filename = undefined)
            req.responseXML!.getElementsByName('title')[0]
              ? (media.title = decodeReq(
                  req.responseXML!.getElementsByName('title')[0]!,
                ) ?? undefined)
              : (media.title = undefined)
            req.responseXML!.getElementsByName('showName')[0]
              ? (media.showName = decodeReq(
                  req.responseXML!.getElementsByName('showName')[0]!,
                ) ?? undefined)
              : (media.showName = undefined)
            req.responseXML!.getElementsByName('Type')[0]
              ? (media.Type = decodeReq(
                  req.responseXML!.getElementsByName('Type')[0]!,
                ) ?? undefined)
              : (media.Type = undefined)

            if (
              req.responseXML!.getElementsByName('artist')[0]
              || req.responseXML!.getElementsByName('album')[0]
            ) {
              isSong = true
              req.responseXML!.getElementsByName('artist')[0]
                ? (media.artist = decodeReq(
                    req.responseXML!.getElementsByName('artist')[0]!,
                  ) ?? undefined)
                : (media.artist = undefined)
              req.responseXML!.getElementsByName('album')[0]
                ? (media.album = decodeReq(
                    req.responseXML!.getElementsByName('album')[0]!,
                  ) ?? undefined)
                : (media.album = undefined)
            }
            else {
              isSong = false
              media.artist = undefined
              media.album = undefined
            }

            req.responseXML!.getElementsByName('track_number')[0]
              ? (media.trackNumber = decodeReq(
                  req.responseXML!.getElementsByName('track_number')[0]!,
                ) ?? undefined)
              : (media.trackNumber = undefined)

            if (
              req.responseXML!.getElementsByName('seasonNumber')[0]
              && req.responseXML!.getElementsByName('episodeNumber')[0]
            ) {
              isShow = true
              media.seasonNumber = decodeReq(
                req.responseXML!.getElementsByName('seasonNumber')[0]!,
              ) ?? undefined
              media.episodeNumber = decodeReq(
                req.responseXML!.getElementsByName('episodeNumber')[0]!,
              ) ?? undefined
            }
            else {
              isShow = false
              media.seasonNumber = undefined
              media.episodeNumber = undefined
            }
          }
          for (const key of Object.keys(media))
            media[key] = media[key]?.replace('&#39;', '\'')
        }
        else {
          i++
          if (i > 4) {
            i = 0

            clearInterval(getStatus)
            media.state = 'stopped'
            presence.error(
              `Something went wrong with the request, please contact other people at https://discord.premid.app with the following infos (RES: ${req.status} / S: ${req.readyState})`,
            )
          }
        }
      }
    }

    req.onerror = function (): void {
      media.state = 'stopped'
    }

    req.open(
      'GET',
      `${document.location.protocol}//${document.location.hostname}:${
        document.location.port ?? ''
      }/requests/status.xml`,
      true,
    )
    req.send()
  }
}, (navigator.userAgent.toLowerCase().includes('firefox') ? 5 : 2) * 1000)

interface MediaObj {
  time?: string
  length?: string
  state?: string
  loop?: string
  repeat?: string
  filename?: string
  title?: string
  album?: string
  artist?: string
  trackNumber?: string
  showName?: string
  seasonNumber?: string
  episodeNumber?: string
  Type?: string
  [key: string]: string | undefined
}
