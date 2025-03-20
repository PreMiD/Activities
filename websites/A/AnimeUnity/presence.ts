import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1264199486910234725',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeUnity/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings(
    {
      paused: 'general.paused',
      play: 'general.playing',
      search: 'general.searchFor',
      viewCategory: 'general.viewCategory',
      viewHome: 'general.viewHome',
      viewShow: 'general.viewShow',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null
let current: number
let duration: number
let paused: boolean

presence.on(
  'iFrameData',
  (data: unknown) => {
    ({ current, duration, paused } = data as { current: number, duration: number, paused: boolean })
  },
)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }
  const [newLang, cover] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('cover'),
  ])
  const { pathname } = document.location

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }
  if (document.querySelector('input.search-bar')) {
    presenceData.details = `${strings.search} ${
      document.querySelector<HTMLInputElement>('.search-bar')?.value
    }`
    presenceData.smallImageKey = Assets.Search
    presence.setActivity(presenceData)
    return
  }
  if (pathname === '/') {
    presenceData.details = strings.viewHome
  }
  else if (pathname.startsWith('/archivio')) {
    presenceData.details = 'Viewing Archive'
  }
  else if (pathname.startsWith('/calendario')) {
    presenceData.details = 'Viewing Schedule'
  }
  else if (pathname.startsWith('/top-anime')) {
    let top3 = ''
    for (let i = 0; i < 3; i++) {
      top3 += `${i + 1}° ${
        document.querySelectorAll('.name')[i]?.textContent
      }\n`
    }
    presenceData.details = `Viewing top-anime: ${document
      .querySelector('.nav-link.active')
      ?.textContent
      ?.replace(/\n\s+/g, '')}`
    presenceData.state = top3
  }
  else if (pathname.startsWith('/anime')) {
    delete presenceData.startTimestamp
    presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = paused ? strings.paused : strings.play

    presenceData.details = document.querySelector('.title')?.textContent
    presenceData.state = `Episode ${document
      .querySelector('.episode.episode-item.active.seen')
      ?.querySelector('a')
      ?.textContent
      ?.replace(/\n\s+/g, '')}`
    presenceData.largeImageKey = cover
      ? (document.querySelector<HTMLImageElement>('.cover')?.src ?? ActivityAssets.Logo)
      : ActivityAssets.Logo

    if (!Number.isNaN(duration) && !paused) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(current, duration)
    }
  }
  presence.setActivity(presenceData)
})
