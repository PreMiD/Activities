import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1570396856985325612',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  // Прямая ссылка на картинку 512x512 (замените на свою, если она другая)
  Logo = 'https://i.imgur.com/T4V0Y5Z.png',
}

interface ParsedTitle {
  name: string
  season?: string
  episode?: string
}

// h1 вида: "Невский  (Сериал) 8 сезон 1 серия"
function parseTitle(h1: string): ParsedTitle {
  const match = h1.match(/(\d+)\s*сезон\s*(\d+)\s*серия/i)
  const name = h1
    .replace(/\(.*?\)/g, '') // убираем "(Сериал)", "(Фильм)"
    .replace(/\d+\s*сезон.*$/i, '') // убираем "8 сезон 1 серия"
    .replace(/\s+/g, ' ')
    .trim()

  return { name, season: match?.[1], episode: match?.[2] }
}

// Постер берём из og:image самой страницы PREMIER
function getPoster(): string | undefined {
  const src = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content
  if (!src)
    return undefined

  try {
    const url = new URL(src, document.location.href)
    if (url.protocol !== 'https:')
      return undefined
    return url.href
  }
  catch {
    return undefined
  }
}

presence.on('UpdateData', async () => {
  const [privacy, showTimestamp, showButtons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showButtons'),
  ])

  const { pathname, search, origin } = document.location
  const cleanUrl = origin + pathname // без ?fullscreen=true и прочего

  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  if (privacy) {
    presenceData.details = 'Смотрит PREMIER'
    presence.setActivity(presenceData)
    return
  }

  const video = document.querySelector<HTMLVideoElement>('video')
  const h1 = document.querySelector('h1')?.textContent ?? ''
  const isPlayerPage = /[?&]fullscreen=true/.test(search)

  if (video && isPlayerPage && h1 && video.readyState > 0) {
    const { name, season, episode } = parseTitle(h1)
    const title = name || h1.trim()

    presenceData = {
      ...presenceData,
      type: ActivityType.Watching,
      name: title,
      largeImageKey: getPoster() ?? ActivityAssets.Logo,
    }

    presenceData.details = title
    if (season && episode)
      presenceData.state = `${season} сезон, ${episode} серия`

    if (video.paused) {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Пауза'
    }
    else {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Смотрит'

      if (showTimestamp && Number.isFinite(video.duration)) {
        const [start, end] = getTimestampsFromMedia(video)
        presenceData.startTimestamp = start
        presenceData.endTimestamp = end
      }
    }

    if (showButtons)
      presenceData.buttons = [{ label: 'Смотреть', url: cleanUrl }]
  }
  else if (pathname === '/' || pathname === '') {
    presenceData.details = 'Главная страница'
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (pathname.startsWith('/search')) {
    presenceData.details = 'Ищет что посмотреть'
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (h1) {
    const { name } = parseTitle(h1)
    presenceData.details = 'Просматривает страницу'
    presenceData.state = name || h1.trim()
    presenceData.largeImageKey = getPoster() ?? ActivityAssets.Logo
    presenceData.startTimestamp = browsingTimestamp
    if (showButtons)
      presenceData.buttons = [{ label: 'Открыть', url: cleanUrl }]
  }
  else {
    presenceData.details = 'Просматривает PREMIER'
    presenceData.startTimestamp = browsingTimestamp
  }

  presence.setActivity(presenceData)
})
