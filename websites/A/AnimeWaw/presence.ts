import { ActivityType, Assets, getTimestamps } from 'premid'

// Приложение Discord «AnimeWaw» (discord.com/developers/applications).
const presence = new Presence({ clientId: '1563836106615554108' })

const LOGO = 'https://www.animewaw.uz/icon.png'

// Что сайт сам кладёт в <div id="aw-presence" data-state="…"> (см.
// anime-frontend/lib/presence.js): по селекторам вёрстки не гадаем, а плеер
// Kodik — чужой iframe, его <video> отсюда всё равно не видно.
interface AwState {
  page?: 'title' | 'room'
  title?: { id: number, name: string, poster?: string, url: string }
  video?: {
    player: 'aw' | 'kodik'
    episode?: number
    episodeCount?: number
    voice?: string
    playing?: boolean
    time?: number
    duration?: number
    at?: number
  }
  room?: { code: string, url: string, people?: number }
}

function readState(): AwState {
  try {
    return JSON.parse(document.querySelector<HTMLElement>('#aw-presence')?.dataset.state || '{}')
  }
  catch {
    return {}
  }
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

// Переводы запрашиваются у расширения не на каждом обновлении (раз в
// секунду — PreMiD ругается на медленный UpdateData), а заново только при
// смене языка в настройках активности.
function getStrings() {
  return presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    browse: 'general.browsing',
    search: 'general.search',
    viewSeries: 'general.buttonViewSeries',
    watchingAnime: 'general.watchingAnime',
    episode: 'general.episode',
    together: 'animewaw.together',
    watchTogether: 'animewaw.buttonWatchTogether',
    top100: 'animewaw.top100',
  })
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const [newLang, privacy, showCover, showButtons, showBrowsing, titleAsPresence, hideWhenPaused] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('browsingActivity'),
    presence.getSetting<boolean>('titleAsPresence'),
    presence.getSetting<boolean>('hideWhenPaused'),
  ])
  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  const state = readState()
  const { title, video, room } = state
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: LOGO,
  }

  if (title && (state.page === 'title' || state.page === 'room')) {
    if (hideWhenPaused && video && !video.playing) {
      presence.clearActivity()
      return
    }

    presenceData.details = privacy ? strings.watchingAnime : title.name

    if (!privacy) {
      const parts: string[] = []
      if (video?.episode) {
        parts.push(video.episodeCount ? `${strings.episode} ${video.episode}/${video.episodeCount}` : `${strings.episode} ${video.episode}`)
      }
      // В комнате — сколько смотрят вместе, иначе — озвучка.
      if (room)
        parts.push(`${strings.together} · ${room.people ?? 1}`)
      else if (video?.voice)
        parts.push(video.voice)
      if (parts.length)
        presenceData.state = parts.join(' · ')

      if (titleAsPresence)
        presenceData.name = title.name
      if (showCover && title.poster)
        presenceData.largeImageKey = title.poster
      presenceData.largeImageText = title.name
      presenceData.detailsUrl = title.url
    }

    if (video) {
      presenceData.smallImageKey = video.playing ? Assets.Play : Assets.Pause
      presenceData.smallImageText = video.playing ? strings.play : strings.pause
      if (video.playing && video.duration) {
        // Сайт обновляет позицию не каждую секунду — досчитываем от момента снимка.
        const elapsed = video.at ? (Date.now() - video.at) / 1000 : 0
        const current = Math.min(video.duration, (video.time ?? 0) + elapsed)
        ;[presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(Math.floor(current), Math.floor(video.duration))
      }
    }

    if (showButtons && !privacy) {
      const buttons: [ButtonData, ButtonData?] = room
        ? [{ label: strings.watchTogether, url: room.url }, { label: strings.viewSeries, url: title.url }]
        : [{ label: strings.viewSeries, url: title.url }]
      presenceData.buttons = buttons
    }
  }
  else if (showBrowsing || privacy) {
    presenceData.details = strings.browse
    presenceData.startTimestamp = browsingTimestamp
    if (!privacy && document.location.pathname.startsWith('/search')) {
      presenceData.details = strings.search
      presenceData.smallImageKey = Assets.Search
    }
    else if (!privacy && document.location.pathname.startsWith('/top100')) {
      presenceData.details = strings.top100
    }
  }
  else {
    presence.clearActivity()
    return
  }

  presence.setActivity(presenceData)
})
