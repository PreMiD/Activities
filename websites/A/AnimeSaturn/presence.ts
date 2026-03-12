import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1266069361928704072',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeSaturn/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings(
    {
      paused: 'general.paused',
      play: 'general.playing',
      search: 'general.searchFor',
      viewHome: 'general.viewHome',
      viewShow: 'general.viewShow',
      viewEpisode: 'general.viewEpisode',
      buttonViewEpisode: 'general.buttonViewEpisode',
      buttonViewShow: 'general.buttonViewShow',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }
  const [newLang, cover] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('cover'),
  ])
  const { pathname, href } = document.location

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  if (document.querySelector<HTMLInputElement>('.search-box')?.value) {
    presenceData.details = `${strings.search} ${
      document.querySelector<HTMLInputElement>('.search-box')?.value
    }`
    presenceData.smallImageKey = Assets.Search
    presence.setActivity(presenceData)
    return
  }
  if (pathname === '/') {
    presenceData.details = strings.viewHome
  }
  else if (pathname.startsWith('/animelist')) {
    presenceData.details = 'Viewing Archive'
    presenceData.state = `Filter by: ${document
      .querySelector('.badge.badge-saturn > b')
      ?.textContent
      ?.replace(/\\n|\s/g, '')}`
  }
  else if (pathname.startsWith('/animeincorso')) {
    presenceData.details = 'Viewing seasonal anime'
    presenceData.state = `Page ${
      document.querySelector('.active > a')?.textContent
    }`
  }
  else if (pathname.startsWith('/anime')) {
    // view anime
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = strings.viewShow
    presenceData.details = document.querySelector(
      '.anime-title-as > b',
    )?.textContent
    presenceData.state = `Episodes: ${
      document.querySelectorAll(
        '.btn-group.episodes-button.episodi-link-button',
      )?.length ?? 0
    } | ${
      document
        .querySelector('.container.shadow.rounded.text-white')
        ?.textContent
        ?.split('\n')[1]
    }`
    presenceData.largeImageKey = cover
      ? document.querySelector<HTMLImageElement>('.cover-anime')?.src
      ?? ActivityAssets.Logo
      : ActivityAssets.Logo
    presenceData.buttons = [
      {
        label: strings.buttonViewShow,
        url: href,
      },
    ]
  }
  else if (pathname.startsWith('/ep')) {
    // view episode
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = strings.viewEpisode
    presenceData.details = strings.viewEpisode
    presenceData.state = document.querySelector('h3')?.textContent
    presenceData.largeImageKey = cover
      ? document.querySelector<HTMLImageElement>('.img-fluid')?.src
      ?? ActivityAssets.Logo
      : ActivityAssets.Logo
  }
  else if (pathname.startsWith('/watch')) {
    // watch anime
    delete presenceData.startTimestamp
    const video = document.querySelector<HTMLVideoElement>('video')
    presenceData.smallImageKey = video?.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video?.paused ? strings.paused : strings.play
    presenceData.details = document.querySelector('.text-white.mb-3')?.textContent
    if (video && !Number.isNaN(video.duration) && !video.paused) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video.currentTime, video.duration)
    }
    presenceData.buttons = [
      {
        label: strings.buttonViewEpisode,
        url: href,
      },
    ]
  }
  else if (pathname.startsWith('/newest')) {
    presenceData.details = 'Viewing new anime'
  }
  else if (pathname.startsWith('/upcoming')) {
    presenceData.details = 'Viewing upcoming anime'
  }
  else if (pathname.startsWith('/calendario')) {
    presenceData.details = 'Viewing Schedule'
  }
  else if (pathname.startsWith('/toplist')) {
    let top3 = ''
    for (let i = 0; i < 3; i++) {
      top3 += `${i + 1}° ${
        document.querySelectorAll<HTMLImageElement>(
          `#${
            document.querySelector('.active.show')?.id
          } .margin-top-anime-page > a > img`,
        )[i]?.title
      }\n`
    }
    presenceData.details = `Viewing top-anime: ${
      document.querySelector('.nav-item.active')?.textContent
    }`
    presenceData.state = top3
  }
  else if (pathname.startsWith('/info')) {
    presenceData.smallImageKey = Assets.Viewing
    presenceData.details = 'Viewing info'
    presenceData.state = document.querySelector('.p-3 > b')?.textContent
    presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.p-3 div > img')?.src
      ?? ActivityAssets.Logo
  }
  presence.setActivity(presenceData)
})
