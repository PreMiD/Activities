import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '935597176426491924',
})

async function getStrings() {
  return presence.getStrings({
    play: 'general.watchingAnime',
    pause: 'general.paused',
  })
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeGO/assets/logo.jpg',
}

let video = {
  exists: false,
  duration: 0,
  currentTime: 0,
  paused: true,
}
let strings: Awaited<ReturnType<typeof getStrings>>

function getCurrentTypeSpelling(typeContent?: string) {
  switch (typeContent) {
    case 'manga':
      return 'манги'
    case 'character':
    case 'characters':
      return 'персонажа'
    case 'person':
      return 'человека'
    default:
      return 'аниме'
  }
}

presence.on(
  'iFrameData',
  (data: unknown) => {
    video = data as typeof video
  },
)

presence.on('UpdateData', async () => {
  const [privacy, time, logo, buttons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('logo'),
    presence.getSetting<boolean>('buttons'),
  ])
  const presenceData: PresenceData = {
    details: 'Где-то на сайте',
    largeImageKey: ActivityAssets.Logo,
    smallImageText: 'AnimeGO',
  } as PresenceData
  const { pathname, href } = document.location
  const currentType = getCurrentTypeSpelling(pathname.split('/')[1])

  if (!strings)
    strings = await getStrings()

  if (pathname === '/') {
    presenceData.details = 'На главной странице'
  }
  else if (
    pathname === '/anime'
    || pathname === '/manga'
    || pathname === '/characters'
    || /\/(?:anime|manga|characters)\/(?:season|genre|type|status|filter|studio|dubbing)\//.test(pathname)
  ) {
    presenceData.details = `В поиске ${currentType}`
    presenceData.state = document.querySelector('.entity__title h1')?.textContent
  }
  else if (
    /\/(?:anime|manga|character|person)\//.test(pathname)
  ) {
    const titleContent = document.querySelector<HTMLHeadElement>('.entity__title h1')?.textContent
      ?? document.querySelector<HTMLHeadElement>('.person__title h1')?.textContent ?? ''
    const image = document.querySelector<HTMLImageElement>(`.entity__poster img`)?.src
      ?? document.querySelector<HTMLImageElement>(`.person__picture img`)?.src

    presenceData.details = `Смотрит страницу ${currentType}`
    presenceData.state = titleContent
    if (!privacy && logo && image) {
      presenceData.largeImageKey = image
      presenceData.smallImageKey = ActivityAssets.Logo
    }
    if (!privacy) {
      presenceData.stateUrl = href
      presenceData.largeImageUrl = href
    }
    presenceData.buttons = [
      {
        label: 'Открыть страницу',
        url: href,
      },
    ]

    if (video.exists) {
      const selectEpisodes = document.querySelector<HTMLSelectElement>('select[name=\'series\']')
      const currentEpisodeTitle = document.querySelector('.episode-info__name .episode-info__value')?.textContent
      const serie = `${selectEpisodes?.options[selectEpisodes?.selectedIndex]?.text}${currentEpisodeTitle ? ` - ${currentEpisodeTitle}` : ''}`
      presenceData.details = privacy ? `Смотрит ${currentType}` : titleContent
      presenceData.state = serie
      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused ? strings.pause : strings.play
      delete presenceData.stateUrl
      if (!privacy)
        presenceData.detailsUrl = href

      if (time) {
        presenceData.type = ActivityType.Watching
        if (video.paused) {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
        else {
          [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(video.currentTime, video.duration)
        }
      }
    }
  }

  if (privacy || !buttons)
    delete presenceData.buttons

  if (privacy)
    delete presenceData.state

  presence.setActivity(presenceData)
})
