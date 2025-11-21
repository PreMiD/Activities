import { ActivityType, Assets } from 'premid'

const presence = new Presence({ clientId: '1165759293576982578' })
const PATHS = {
  MAIN_PAGE: '/',
  CATALOG: '/anime/catalog/',
  SCHEDULE: '/anime/schedule',
  LATEST_VIDEOS: '/media/videos/latest/',
  LATEST_EPISODES: '/anime/releases/latest/',
  FAVORITES: '/me/favorites/',
  COLLECTIONS: '/me/collections/',
  FRANCHISES: '/anime/franchises/',
  GENRES: '/anime/genres/',
  TORRENTS: '/anime/torrents/',
  RULES: '/rules',
  SUPPORT: '/support',
  SETTINGS: /^\/app\/settings\//,
  API_DOCS: /^\/api\/docs\//,
  RGENRES: /\/anime\/genres\/releasesOfGenre\//,
  FRANCHISE_PAGE: /^\/anime\/franchises\/[a-f0-9-]+$/,
  RELEASE_EPISODES: /\/anime\/releases\/release\/[^/]+\/episodes/,
  RELEASE_FRANCHISES: /\/anime\/releases\/release\/[^/]+\/franchises/,
  RELEASE_MEMBERS: /\/anime\/releases\/release\/[^/]+\/members/,
  RELEASE_TORRENTS: /\/anime\/releases\/release\/[^/]+\/torrents/,
  WATCH_EPISODE: /\/anime\/video\/episode\//,
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const ogTitle = document
    .querySelector('meta[property="og:title"]')
    ?.getAttribute('content')
  const video = document.querySelector('video')

  let firstArg = ''
  let secondArg = ''

  if (ogTitle) {
    const parts = ogTitle.split('|').map(part => part.trim())
    if (parts.length >= 3) {
      firstArg = parts[1] ?? ''
      secondArg = parts[2] ?? ''
    }
    else if (parts.length === 2) {
      firstArg = parts[0] ?? ''
      secondArg = parts[1] ?? ''
    }
    else {
      firstArg = ogTitle
    }
  }

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: 'https://i.imgur.com/EFyOIYd.png',
  }

  switch (true) {
    case !!document.querySelector('input[autofocus]'):
      presenceData.state = 'Ищет аниме'
      break
    case pathname === PATHS.MAIN_PAGE:
      presenceData.state = 'На главной странице'
      break
    case pathname === PATHS.CATALOG:
      presenceData.state = 'Смотрит каталог релизов'
      break
    case pathname === PATHS.SCHEDULE:
      presenceData.state = 'Просматривает расписание выхода эпизодов'
      break
    case pathname === PATHS.LATEST_VIDEOS:
      presenceData.state = 'Смотрит новые видео'
      break
    case pathname === PATHS.LATEST_EPISODES:
      presenceData.state = 'Смотрит новые эпизоды'
      break
    case pathname === PATHS.FAVORITES:
      presenceData.state = 'Просматривает избранное'
      break
    case pathname === PATHS.COLLECTIONS:
      presenceData.state = 'Смотрит коллекции'
      break
    case pathname === PATHS.FRANCHISES:
      presenceData.state = 'Смотрит франшизы аниме'
      break
    case pathname === PATHS.GENRES:
      presenceData.state = 'Смотрит жанры аниме'
      break
    case pathname === PATHS.TORRENTS:
      presenceData.state = 'Смотрит торренты аниме'
      break
    case pathname === PATHS.RULES:
      presenceData.state = 'Читает правила'
      break
    case pathname === PATHS.SUPPORT:
      presenceData.state = 'На странице поддержки проекта'
      break
    case PATHS.SETTINGS.test(pathname):
      presenceData.state = 'На странице настроек'
      break
    case PATHS.API_DOCS.test(pathname):
      presenceData.state = 'Смотрит API-документацию'
      break
    case PATHS.RGENRES.test(pathname):
      if (ogTitle) {
        const parts = ogTitle.split('|').map(part => part.trim())
        presenceData.details = parts[0] ?? 'Жанр'
      }
      presenceData.state = 'Смотрит релизы жанра'
      break
    case PATHS.FRANCHISE_PAGE.test(pathname):
      if (ogTitle) {
        const parts = ogTitle.split('|').map(part => part.trim())
        presenceData.details = parts[0] ?? 'Франшиза'
      }
      presenceData.state = 'Смотрит франшизу'
      break
    case PATHS.RELEASE_EPISODES.test(pathname):
      presenceData.details = firstArg
      presenceData.state = 'Смотрит эпизоды релиза'
      break
    case PATHS.RELEASE_FRANCHISES.test(pathname):
      presenceData.details = firstArg
      presenceData.state = 'Смотрит франшизу релиза'
      break
    case PATHS.RELEASE_MEMBERS.test(pathname):
      presenceData.details = firstArg
      presenceData.state = 'Смотрит участников релиза'
      break
    case PATHS.RELEASE_TORRENTS.test(pathname):
      presenceData.details = firstArg
      presenceData.state = 'Смотрит торренты релиза'
      break
    case PATHS.WATCH_EPISODE.test(pathname):
      presenceData.details = secondArg || 'AniLibria'
      presenceData.state = firstArg || 'Смотрит эпизод'
      if (video && video.duration > 0) {
        if (video.paused) {
          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = 'На паузе'
        }
        else {
          const timestamps = presence.getTimestamps(
            Math.floor(video.currentTime),
            Math.floor(video.duration)
          )
          presenceData.startTimestamp = timestamps[0]
          presenceData.endTimestamp = timestamps[1]
          presenceData.smallImageKey = Assets.Play
          presenceData.smallImageText = 'Воспроизводится'
        }
      }
      break
  }

  if (!presenceData.details)
    presenceData.details = 'AniLibria'

  presence.setActivity(presenceData)
})
