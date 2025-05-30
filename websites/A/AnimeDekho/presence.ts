const presence = new Presence({
  clientId: '1371050079439425576',
})

const ActivityAssets = {
  DefaultLogo: 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeDekho/assets/logo.png',
}

function formatTitle(text: string): string {
  return text.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

interface EpisodeInfo {
  title: string
  season: string
  episode: string
}

function getEpisodeInfo(url: string): EpisodeInfo | null {
  const match = url.match(/\/epi\/(.+)-(\d+)x(\d+)\//)
  if (match) {
    return {
      title: formatTitle(match[1] || ''),
      season: `Season ${match[2]}`,
      episode: `Episode ${match[3]}`,
    }
  }
  return null
}

let lastEpisodeKey = ''
let fixedTimestamp: number | null = null

presence.on('UpdateData', () => {
  const { pathname } = window.location
  const presenceData: any = {}

  if (pathname.startsWith('/epi/')) {
    const info = getEpisodeInfo(`${pathname}/`)

    if (info) {
      const key = pathname
      if (!fixedTimestamp || lastEpisodeKey !== key) {
        fixedTimestamp = Math.floor(Date.now() / 1000)
        lastEpisodeKey = key
      }

      presenceData.details = info.title
      presenceData.state = `${info.season} · ${info.episode}`
      presenceData.startTimestamp = fixedTimestamp
      presenceData.largeImageKey = ActivityAssets.DefaultLogo

      presence.setActivity(presenceData)
      return
    }
  }
  else if (pathname.startsWith('/series/')) {
    const match = pathname.match(/\/series\/([^/]+)\//)
    if (match) {
      const rawName = match[1]
      const title = formatTitle(rawName || '')
      presenceData.details = title
    }
    else {
      presenceData.details = 'Viewing Anime Info'
    }
  }
  else if (pathname.startsWith('/category/')) {
    const category = formatTitle(pathname.split('/')[2] || 'Browsing')
    presenceData.details = 'Browsing Category'
    presenceData.state = category
  }
  else {
    presenceData.details = 'Browsing AnimeDekho'
  }

  presenceData.largeImageKey = ActivityAssets.DefaultLogo
  presence.setActivity(presenceData)
})
