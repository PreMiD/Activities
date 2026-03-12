import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1066684228726698014',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/J/jut.su/assets/logo.png',
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }
  const { pathname } = document.location
  const title = document.querySelector('[class="b-b-title center"]')
    ?? document.querySelector('[itemprop="name"]')
  const search = document.querySelector<HTMLInputElement>('[name="ystext"]')
  const mangaTitle = document
    .querySelector('#the_manga_title')
    ?.textContent
    ?.split(':')
  const video = document.querySelector<HTMLVideoElement>(
    '[id="my-player_html5_api"]',
  )
  const name = document.querySelector('#dle-content > div > h1 > span')

  switch (true) {
    case !!search?.value:
      presenceData.details = 'Ищет по запросу'
      presenceData.state = `«${search.value}»`
      break
    case pathname === '/':
      presenceData.details = 'На домашней странице'
      break
    case pathname === '/pm/':
      presenceData.details = 'Просматривает сообщения'
      break
    case !!pathname.match(/read-\d*/g):
      presenceData.details = 'Учавствует в переписке'
      break
    case !!pathname.match(/\/user\//):
      presenceData.details = 'Смотрит профиль'
      presenceData.state = pathname.split('/')[2]?.replace(/\+/g, ' ')
      break
    case !!pathname.match(/\/rewards\//):
      presenceData.details = 'Смотрит награды пользователя'
      presenceData.state = pathname.split('/')[2]?.replace(/\+/g, ' ')
      break
    case !!pathname.match(/\/tests\//):
      presenceData.details = 'Проходит тест'
      break
    case pathname === '/anime/':
      presenceData.details = 'Смотрит список аниме'
      break
    case pathname === '/manga/':
      presenceData.details = 'Смотрит список манги Наруто'
      break
    case pathname === '/novels/':
      presenceData.details = 'Смотрит список новелл'
      break
    case !!mangaTitle:
      presenceData.details = `Читает мангу «${mangaTitle[0]}»`
      presenceData.state = mangaTitle[1]
      break
    case !!video: {
      delete presenceData.startTimestamp

      if (!video.paused && !Number.isNaN(Number(video.duration))) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Воспроизводится'
      }
      else {
        delete presenceData.endTimestamp
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = 'Приостановлено'
      }
      const titles = name?.textContent
        ?.replace(/смотреть\s/i, '')
        .replace(/(\d* сезон)?\s?\d* серия|\d фильм/g, '')
        .trim()
      presenceData.details = titles
      presenceData.state = name?.textContent
        ?.replace(/смотреть\s/i, '')
        .replace(titles ?? '', '')

      const coverArtElement = document.querySelector<HTMLDivElement>(
        '.all_anime_title.aat_ep',
      )
      if (coverArtElement) {
        const coverArt = coverArtElement.style.backgroundImage
        if (coverArt) {
          presenceData.largeImageKey = coverArt
            .replace('url("', '')
            .replace('")', '')
        }
      }
      break
    }
    case !!title:
      presenceData.details = 'Смотрит страницу аниме'
      presenceData.state = title.attributes.getNamedItem('content')?.value
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
