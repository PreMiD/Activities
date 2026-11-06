import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1568374674700636260',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/GMhgPg7.png',
}

// Guarda o poster de cada drama (a página do episódio pode não ter o .poster)
const coverCache = new Map<string, string>()

// O site usa rotas por hash: #/, #/cat/<tag>, #/drama/<slug>, #/drama/<slug>/<episódio>
function getRoute(): string[] {
  return location.hash
    .replace(/^#\/?/, '')
    .split('?')[0]!
    .split('/')
    .filter(Boolean)
    .map((part) => {
      try {
        return decodeURIComponent(part)
      }
      catch {
        return part
      }
    })
}

// 'The Remarried Empress - Dublado - Episódio 1 | Lost Dramas' -> 'The Remarried Empress - Dublado'
function getDramaName(slug?: string): string {
  const name = document.title
    .replace(/\s*\|\s*Lost Dramas\s*$/i, '')
    .replace(/\s*-\s*Epis[oó]dio\s*\d+\s*$/i, '')
    .trim()

  if (name && name.toLowerCase() !== 'lost dramas')
    return name

  const heading = document.querySelector('.detail h1')?.textContent?.trim()
  if (heading)
    return heading

  return slug ? slug.replace(/-/g, ' ') : 'Lost Dramas'
}

function getEpisodeNumber(route: string[]): string | null {
  if (route[2] && /^\d+$/.test(route[2]))
    return route[2]

  return document.title.match(/Epis[oó]dio\s*(\d+)/i)?.[1] ?? null
}

// <div class="poster" style="background-image:url('...')"></div>
function getPoster(): string | null {
  const poster = document.querySelector<HTMLElement>('.poster')
  const match = poster?.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/)
  return match?.[1] || null
}

function formatTag(tag: string): string {
  if (/drama$/i.test(tag))
    return `${tag}s` // K-Drama -> K-Dramas
  if (/dublado$/i.test(tag))
    return `${tag}s` // Dublado -> Dublados
  return tag
}

presence.on('UpdateData', async () => {
  const [showButtons, showCover] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('cover'),
  ])

  const route = getRoute()

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  if (route.length === 0) {
    // Home: nome da presence (Lost Dramas), sem botão
    presenceData.details = 'Lost Dramas'
    presenceData.state = 'Página Inicial'
  }
  else if (route[0] === 'cat' && route[1]) {
    // Catálogo por tag: nome da presence (Lost Dramas), sem botão
    presenceData.details = 'Explorando o Catálogo'
    presenceData.state = formatTag(route[1])
  }
  else if (route[0] === 'drama' && route[1]) {
    const slug = route[1]
    const poster = getPoster()
    if (poster)
      coverCache.set(slug, poster)

    const cover = showCover ? coverCache.get(slug) : null
    if (cover)
      presenceData.largeImageKey = cover

    const dramaName = getDramaName(slug)
    const episode = getEpisodeNumber(route)

    presenceData.name = dramaName

    if (episode) {
      // Página de episódio
      presenceData.details = dramaName
      presenceData.state = `Episódio ${episode}`

      const video = document.querySelector<HTMLVideoElement>('video')
      if (video && Number.isFinite(video.duration) && video.duration > 0) {
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video.paused ? 'Pausado' : 'Reproduzindo'

        if (video.paused) {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
        else {
          [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
        }
      }

      if (showButtons) {
        presenceData.buttons = [
          { label: 'Assistir o Drama', url: document.location.href },
        ]
      }
    }
    else {
      // Página do drama (sinopse)
      presenceData.details = dramaName
      presenceData.state = 'Checando a sinopse'

      if (showButtons) {
        presenceData.buttons = [
          { label: 'Ver o Drama', url: document.location.href },
        ]
      }
    }
  }
  else {
    presenceData.details = 'Lost Dramas'
    presenceData.state = 'Navegando no site'
  }

  presence.setActivity(presenceData)
})
