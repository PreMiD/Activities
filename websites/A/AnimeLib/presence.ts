import type {
  AgeRestriction,
  AnimeData,
  CharacterData,
  CollectionData,
  PersonData,
  PublisherData,
  ReviewData,
  TeamData,
  UserData,
} from './lib.js'
import { ActivityType, Assets, getTimestamps, getTimestampsFromMedia } from 'premid'
import { AnimeLib } from './lib.js'

const presence = new Presence({
  clientId: '1320289587943444552',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeLib/assets/logo.png',
  Play = 'https://cdn.rcd.gg/PreMiD/resources/play.png',
  Pause = 'https://cdn.rcd.gg/PreMiD/resources/pause.png',
}

type RouteName =
  | ''
  | 'anime'
  | 'characters'
  | 'people'
  | 'catalog'
  | 'user'
  | 'top-views'
  | 'collections'
  | 'reviews'
  | 'team'
  | 'franchise'
  | 'publisher'
  | 'media'
  | 'news'
  | 'faq'
  | 'messages'
  | 'downloads'

interface IFrameVideo {
  duration: number
  currentTime: number
  paused: boolean
}

function isPrivacyMode(setting: boolean, ageRestriction?: AgeRestriction) {
  return setting || ageRestriction?.id === 5
}
function setPrivacyMode(presenceData: PresenceData) {
  presenceData.details = 'Приватный режим'
  presenceData.state = 'Вам не следует знать лишнего!'
}
function cleanUrl(location: Location) {
  return location.href.replace(location.search, '').replace('/watch', '')
}

let iFrameVideo: IFrameVideo | null = null
let currentDub: string

presence.on('iFrameData', (data: unknown) => {
  iFrameVideo = data as typeof iFrameVideo
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp,
    largeImageText: 'AnimeLib',
    smallImageText: 'AnimeLib',
  }
  const [privacySetting, buttonsSetting, titleSetting] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('titleAsPresence'),
  ])
  const path = document.location.pathname
  const route = <RouteName>`${path}/`.split('/')[2]

  let animeData: AnimeData,
    userData: UserData,
    characterData: CharacterData,
    peopleData: PersonData,
    collectionData: CollectionData,
    reviewData: ReviewData,
    teamData: TeamData,
    publisherData: PublisherData

  switch (route) {
    case '':
      presenceData.details = 'Главная страница'
      presenceData.state = 'Так внимательно изучает...'
      break
    case 'anime':
      animeData = await AnimeLib.getAnime(
        path,
        path.split('/')[3]!.split('-')[0]!,
      ).then(response => <AnimeData>response.data)

      // Show anime watching in privacy mode if it's enabled, or enforce it when anime is RX rated
      if (isPrivacyMode(privacySetting, animeData.ageRestriction)) {
        setPrivacyMode(presenceData)
        break
      }

      if (path.endsWith('/watch')) {
        const video = document.querySelector('video')
        const dub = document
          .querySelector('.menu-item.is-active')
          ?.querySelector('.menu-item__text')
          ?.textContent
          ?? document
            .querySelector('.btn.is-plain.is-outline')
            ?.querySelector('strong')
            ?.textContent
        const episode = document.querySelector('[id^=\'episode\'][class*=\' \'] > span')
          ?.textContent
          ?? document
            .querySelectorAll('.btn.is-outline')[6]
            ?.querySelector('span')
            ?.textContent
            ?? document
              .querySelectorAll('.btn.is-outline')[7]
              ?.querySelector('span')
              ?.textContent

        if (dub || currentDub) {
          /**
           * This makes sure that the dub will always be defined.
           * When user changes menu between dubs/subs, the menu items are different,
           * so it's not possible to get the current active item if it's in a different menu.
           */
          if (dub)
            currentDub = dub

          /**
           * Slighty different behaviour when anime is licensed
           */
          if (animeData.toast) {
            const title = document.querySelector('h1')?.textContent
            const cover = document.querySelector<HTMLImageElement>('.cover__img')?.src

            if (title && cover) {
              titleSetting
                ? (presenceData.name = title)
                : (presenceData.details = title)
              presenceData.state = `${episode ? (episode.includes('эпизод') ? episode : 'Фильм') : 'Фильм'
              } | ${currentDub}`
              presenceData.largeImageKey = cover
              presenceData.largeImageText = title
            }
          }
          else {
            const title = animeData.rus_name !== '' ? animeData.rus_name : animeData.name

            titleSetting
              ? (presenceData.name = title)
              : (presenceData.details = title)
            presenceData.state = `${
              episode ? (episode.includes('эпизод') ? episode : 'Фильм') : 'Фильм'
            } | ${currentDub}`
            presenceData.largeImageKey = animeData.cover.default
            presenceData.largeImageText = title
          }

          presenceData.buttons = [
            {
              label: 'Открыть аниме',
              url: cleanUrl(document.location),
            },
          ]

          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = 'На паузе'
        }

        if (video || iFrameVideo) {
          if (video) {
            [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
            presenceData.smallImageKey = video.paused
              ? Assets.Pause
              : Assets.Play
            presenceData.smallImageText = video.paused
              ? 'На паузе'
              : 'Воспроизводится'

            iFrameVideo = null
          }
          else if (iFrameVideo) {
            [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
              iFrameVideo.currentTime,
              iFrameVideo.duration,
            )
            presenceData.smallImageKey = iFrameVideo.paused
              ? Assets.Pause
              : Assets.Play
            presenceData.smallImageText = iFrameVideo.paused
              ? 'На паузе'
              : 'Воспроизводится'
          }

          if (video?.paused || iFrameVideo?.paused) {
            delete presenceData.startTimestamp
            delete presenceData.endTimestamp
          }
        }
      }
      else {
        /**
         * Slighty different behaviour when anime is licensed
         */
        if (animeData.toast) {
          const cover = document.querySelector<HTMLImageElement>('.cover__img')?.src
          const title = document.querySelector('h1')?.textContent
          const altTitle = document.querySelector('h2')?.textContent

          if (cover && title && altTitle) {
            presenceData.details = 'Страница аниме'
            presenceData.state = `${title} (${altTitle})`
            presenceData.largeImageKey = cover
            presenceData.largeImageText = title
            presenceData.buttons = [
              {
                label: 'Открыть аниме',
                url: cleanUrl(document.location),
              },
            ]
          }
        }
        else {
          presenceData.details = 'Страница аниме'
          presenceData.state = `${animeData.rus_name !== '' ? animeData.rus_name : animeData.name
          } (${animeData.eng_name ?? animeData.name})`
          presenceData.largeImageKey = animeData.cover.default
          presenceData.largeImageText = animeData.rus_name !== '' ? animeData.rus_name : animeData.name
        }

        presenceData.buttons = [
          {
            label: 'Открыть аниме',
            url: cleanUrl(document.location),
          },
        ]
      }
      break
    case 'characters':
      if (path.split('/')[3]) {
        if (path.split('/')[3] === 'new') {
          presenceData.details = 'Добавляет персонажа'
          presenceData.state = 'Очередной аниме персонаж...'
        }
        else {
          characterData = await AnimeLib.getCharacter(
            path,
            path.split('/')[3]!.split('-')[0]!,
          ).then(response => <CharacterData>response.data)

          presenceData.details = 'Страница персонажа'
          presenceData.state = `${characterData.rus_name} (${characterData.name})`
          presenceData.largeImageKey = characterData.cover.default
          presenceData.largeImageText = characterData.rus_name
          presenceData.smallImageKey = ActivityAssets.Logo
          presenceData.buttons = [
            {
              label: 'Oткрыть персoнажа',
              url: cleanUrl(document.location),
            },
          ]
        }
      }
      else {
        presenceData.details = 'Страница персонажей'
        presenceData.state = 'Ищет нового фаворита?'
      }
      break
    case 'people':
      if (path.split('/')[3]) {
        if (path.split('/')[3] === 'create') {
          presenceData.details = 'Добавляет человека'
          presenceData.state = 'Какая-то известная личность?'
        }
        else {
          peopleData = await AnimeLib.getPerson(
            path,
            path.split('/')[3]!.split('-')[0]!,
          ).then(response => <PersonData>response.data)

          const name = peopleData.rus_name !== ''
            ? peopleData.rus_name
            : peopleData.alt_name !== ''
              ? peopleData.alt_name
              : peopleData.name

          presenceData.details = 'Страница человека'
          presenceData.state = `${name} (${peopleData.name})`
          presenceData.largeImageKey = peopleData.cover.default
          presenceData.largeImageText = name
          presenceData.smallImageKey = ActivityAssets.Logo
          presenceData.buttons = [
            {
              label: 'Открыть человека',
              url: cleanUrl(document.location),
            },
          ]
        }
      }
      else {
        presenceData.details = 'Страница людей'
        presenceData.state = 'Ищет нового фаворита?'
      }
      break
    case 'catalog':
      presenceData.details = 'В каталоге'
      presenceData.state = 'Что ждёт нас сегодня?'
      break
    case 'user':
      if (path.split('/')[3]) {
        if (path.split('/')[3] === 'notifications') {
          presenceData.details = 'Страница уведомлений'
          presenceData.state = 'Что-то новенькое?'
        }
        else {
          userData = await AnimeLib.getUser(path.split('/')[3]!).then(
            response => <UserData>response.data,
          )

          presenceData.details = 'Страница пользователя'
          presenceData.state = userData.username
          presenceData.largeImageKey = userData.avatar.url
          presenceData.largeImageText = userData.username
          presenceData.smallImageKey = ActivityAssets.Logo
          presenceData.buttons = [
            {
              label: 'Открыть профиль',
              url: cleanUrl(document.location),
            },
          ]
        }
      }
      else {
        presenceData.details = 'Страница пользователей'
        presenceData.state = 'Столько интересных личностей!'
      }
      break
    case 'top-views':
      presenceData.details = 'В топе по просмотрам'
      presenceData.state = 'Любуется популярными аниме'
      break
    case 'collections':
      if (path.split('/')[3]) {
        if (path.split('/')[3] === 'new') {
          presenceData.details = 'Создаёт коллекцию'
          presenceData.state = 'В ней будет много интересного!'
        }
        else {
          collectionData = await AnimeLib.getCollection(
            path.split('/')[3]!,
          ).then(response => <CollectionData>response.data)

          // Show collection viewing in privacy mode if it's enabled, or enforce it when collection was marked as for adults
          if (privacySetting || collectionData.adult) {
            setPrivacyMode(presenceData)
            break
          }

          let collectionType: string
          switch (collectionData.type) {
            case 'titles':
              collectionType = 'тайтлам'
              break
            case 'character':
              collectionType = 'персонажам'
              break
            case 'people':
              collectionType = 'людям'
              break
          }

          presenceData.details = `Коллекция по ${collectionType}`
          presenceData.state = `${collectionData.name} от ${collectionData.user.username}`
          presenceData.largeImageKey = ActivityAssets.Logo
          presenceData.smallImageKey = collectionData.user.avatar.url
          presenceData.smallImageText = collectionData.user.username
          presenceData.buttons = [
            {
              label: 'Oткрыть кoллекцию',
              url: cleanUrl(document.location),
            },
          ]
        }
      }
      else {
        presenceData.details = 'Страница коллекций'
        presenceData.state = 'Их так много...'
      }
      break
    case 'reviews':
      if (path.split('/')[3]) {
        if (path.split('/')[3] === 'new') {
          presenceData.details = 'Пишет отзыв'
          presenceData.state = 'Излагает свои мысли...'
        }
        else {
          reviewData = await AnimeLib.getReview(path.split('/')[3]!).then(
            response => <ReviewData>response.data,
          )

          // Show review reading in privacy mode if it's enabled, or enforce it when related anime is RX rated
          if (
            isPrivacyMode(privacySetting, reviewData.related.ageRestriction)
          ) {
            setPrivacyMode(presenceData)
            break
          }

          presenceData.details = `Отзыв на ${reviewData.related.rus_name}`
          presenceData.state = `${reviewData.title} от ${reviewData.user.username}`
          presenceData.largeImageKey = reviewData.related.cover.default
          presenceData.largeImageText = reviewData.related.rus_name
          presenceData.smallImageKey = reviewData.user.avatar.url
          presenceData.smallImageText = reviewData.user.username
          presenceData.buttons = [
            {
              label: 'Открыть отзыв',
              url: cleanUrl(document.location),
            },
          ]
        }
      }
      else {
        presenceData.details = 'Страница отзывов'
        presenceData.state = 'Столько разных мнений!'
      }
      break
    case 'team':
      if (path.split('/')[3]) {
        if (path.split('/')[3] === 'create') {
          presenceData.details = 'Создаёт свою команду'
          presenceData.state = 'Она обязательно будет успешной!'
        }
        else {
          teamData = await AnimeLib.getTeam(
            path,
            path.split('/')[3]!.split('-')[0]!,
          ).then(response => <TeamData>response.data)

          presenceData.details = 'Страница команды'
          presenceData.state = `${teamData.name} (${
            teamData.alt_name ?? teamData.name
          })`
          presenceData.largeImageKey = teamData.cover.default
          presenceData.smallImageKey = ActivityAssets.Logo
          presenceData.buttons = [
            {
              label: 'Открыть команду',
              url: cleanUrl(document.location),
            },
          ]
        }
      }
      else {
        presenceData.details = 'Страница команд'
        presenceData.state = 'Они все такие разные!'
      }
      break
    case 'franchise':
      if (path.split('/')[3]) {
        const name = document.querySelector('h1')
        const altName = document.querySelector('h2')

        if (name && altName) {
          presenceData.details = 'Страница франшизы'
          presenceData.state = `${name.textContent} (${
            altName.textContent?.split('/')[0] ?? ''
          })`
          presenceData.buttons = [
            {
              label: 'Открыть франшизу',
              url: cleanUrl(document.location),
            },
          ]
        }
      }
      else {
        presenceData.details = 'Страница франшиз'
        presenceData.state = 'Их так много...'
      }
      break
    case 'publisher':
      if (path.split('/')[3]) {
        if (path.split('/')[3] === 'new') {
          presenceData.details = 'Добавляет издательство'
          presenceData.state = 'Да что они там издают?'
        }
        else {
          publisherData = await AnimeLib.getPublisher(
            path,
            path.split('/')[3]!.split('-')[0]!,
          ).then(response => <PublisherData>response.data)

          presenceData.details = 'Страница издателя'
          presenceData.state = `${
            publisherData.rus_name ?? publisherData.name
          } (${publisherData.name})`
          presenceData.largeImageKey = publisherData.cover.default
          presenceData.buttons = [
            {
              label: 'Открыть издателя',
              url: cleanUrl(document.location),
            },
          ]
        }
      }
      else {
        presenceData.details = 'Страница издетелей'
        presenceData.state = 'Их так много...'
      }
      break
    case 'media':
      if (path.split('/')[3] === 'create') {
        presenceData.details = 'Добавляет тайтл'
        presenceData.state = 'Он будет самым интересным!'
      }
      break
    case 'news':
      if (path.split('/')[3]) {
        const avatar = document
          .querySelector('.user-inline')
          ?.querySelector<HTMLImageElement>('.avatar.is-rounded')
          ?.src
        const username = document.querySelector(
          '.user-inline__username',
        )?.textContent
        const title = document.querySelector('h1')?.textContent

        if (avatar && username && title) {
          presenceData.details = 'Читает новость'
          presenceData.state = `${title} от ${username}`
          presenceData.largeImageKey = ActivityAssets.Logo
          presenceData.smallImageKey = avatar
          presenceData.smallImageText = username
          presenceData.buttons = [
            {
              label: 'Открыть новость',
              url: cleanUrl(document.location),
            },
          ]
        }
      }
      else {
        presenceData.details = 'На странице новостей'
        presenceData.state = 'Ищет, чего бы почитать'
      }
      break
    case 'faq':
      if (path.split('/')[3]) {
        if (document.querySelector('h1')) {
          presenceData.details = 'Страница вопросов и ответов'
          presenceData.state = document.querySelector('h1')?.textContent ?? ''
          presenceData.buttons = [
            {
              label: 'Открыть страницу',
              url: cleanUrl(document.location),
            },
          ]
        }
      }
      else {
        presenceData.details = 'Страница вопросов и ответов'
        presenceData.state = 'Ответ на любой вопрос здесь!'
      }
      break
    case 'messages':
      presenceData.details = 'В личных сообщениях'
      presenceData.state = 'С кем-то общается...'
      break
    case 'downloads':
      presenceData.details = 'Страница загрузок'
      presenceData.state = 'Просматривает загруженные материалы'
      break
    default:
      presenceData.details = 'Где-то...'
      presenceData.state = 'Не пытайтесь найти!'
      break
  }

  if (!buttonsSetting)
    delete presenceData.buttons

  presence.setActivity(presenceData)
})
