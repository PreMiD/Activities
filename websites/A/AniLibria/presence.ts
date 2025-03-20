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
  API_DOCS: '/api/docs/v1',
  RGENRES: /\/anime\/genres\/releasesOfGenre\//,
  RELEASE_EPISODES: /\/anime\/releases\/release\/[^/]+\/episodes/,
  RELEASE_FRANCHISES: /\/anime\/releases\/release\/[^/]+\/franchises/,
  RELEASE_MEMBERS: /\/anime\/releases\/release\/[^/]+\/members/,
  RELEASE_TORRENTS: /\/anime\/releases\/release\/[^/]+\/torrents/,
  WATCH_EPISODE: /\/anime\/video\/episode\//,
}

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location
  const ogTitle = document
    .querySelector('meta[property="og:title"]')
    ?.getAttribute('content')
  const video = document.querySelector('video')

  let firstArg = ''
  let secondArg = ''

  if (ogTitle) {
    // eslint-disable-next-line regexp/no-super-linear-backtracking
    const match = ogTitle.match(/(.*)\s*\|\s*(.*)/)
    if (match && match[2]) {
      firstArg = match[1] ?? ''
      secondArg = match[3] || match[2]
    }
    else {
      firstArg = ogTitle
    }
  }

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AniLibria/assets/logo.png',
  }

  switch (true) {
    case !!document.querySelector('input[autofocus]'):
      presenceData.state = 'Ищет аниме'
      break
    case pathname === PATHS.MAIN_PAGE:
      presenceData.state = 'На главной странице'
      presenceData.buttons = [{ label: 'Сайт', url: href }]
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
    case pathname === PATHS.API_DOCS:
      presenceData.state = 'Смотрит API-документацию'
      break
    case PATHS.RGENRES.test(pathname):
      presenceData.details = firstArg
      presenceData.state = 'Смотрит релизы жанра'
      break
    case PATHS.RELEASE_EPISODES.test(pathname):
      presenceData.details = firstArg
      presenceData.state = 'Смотрит эпизоды релиза'
      break
    case PATHS.RELEASE_FRANCHISES.test(pathname):
      presenceData.details = firstArg
      presenceData.state = 'Смотрит связанное с релизом'
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
      presenceData.details = secondArg
      presenceData.state = firstArg
      presenceData.buttons = [{ label: 'Смотреть эпизод', url: href }]
      if (video) {
        const { paused, duration } = video
        const [start, end] = presence.getTimestampsfromMedia(video)

        presenceData.startTimestamp = start
        presenceData.endTimestamp = end
        presenceData.smallImageKey = paused || Number.isNaN(duration) ? Assets.Pause : Assets.Play
        presenceData.smallImageText = paused || Number.isNaN(duration) ? 'На паузе' : 'Воспроизводится'
      }
      break
  }

  if (!presenceData.details)
    presenceData.details = 'AniLibria'

  presence.setActivity(presenceData)
})
