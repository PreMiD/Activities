import type { AnimeData } from './api/models/anime.js'
import type { AgeRestriction } from './api/models/common.js'
import type { MangaData } from './api/models/manga.js'
import type { RanobeData } from './api/models/ranobe.js'
import { ActivityType, Assets, getTimestamps, getTimestampsFromMedia } from 'premid'
import { Lib } from './api/lib.js'
import { cleanUrl, getSiteId, SiteId, switchLogo } from './api/utils.js'

const presence = new Presence({
  clientId: '684124119146692619',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

interface IFrameVideo {
  duration: number
  currentTime: number
  paused: boolean
}

const lib = new Lib()

function isPrivacyMode(setting: boolean, ageRestriction?: AgeRestriction) {
  return setting || ageRestriction?.id === 5
}

function setPrivacyMode(presenceData: PresenceData) {
  presenceData.details = 'Приватный режим'
  presenceData.state = 'Вам не следует знать лишнего!'
}

type RouteName
  = | ''
    | 'anime'
    | 'manga'
    | 'book'
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

let iFrameVideo: IFrameVideo | null = null
let currentDub: string

presence.on('iFrameData', (data: unknown) => {
  iFrameVideo = data as typeof iFrameVideo
})

presence.on('UpdateData', async () => {
  const { pathname, hostname, href, origin } = document.location
  const siteId = getSiteId(hostname)
  /**
   * `[2]` - route, but when reading manga or ranobe it becomes a slug
   *
   * `[3]` - usually a slug (often it's already a title id), but in specific cases it becomes an additional path
   *
   * `[4]` - additional path (watch, form, ...); manga and ranobe only: volume number
   *
   * `[5]` - manga and ranobe only: chapter number
   */
  const pathnameParts = pathname.split('/')
  const route = <RouteName>pathnameParts[2] ?? ''

  let presenceData: PresenceData = {
    startTimestamp: browsingTimestamp,
  }

  const [privacySetting, buttonsSetting, titleSetting] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('titleAsPresence'),
  ])

  switch (siteId) {
    case SiteId.MangaLib: {
      presenceData = {
        ...presenceData,
        type: ActivityType.Playing,
        largeImageKey: switchLogo(siteId),
        name: 'MangaLib',
        smallImageText: 'MangaLib',
      }
      break
    }
    case SiteId.RanobeLib: {
      presenceData = {
        ...presenceData,
        type: ActivityType.Playing,
        largeImageKey: switchLogo(siteId),
        name: 'RanobeLib',
        smallImageText: 'RanobeLib',
      }
      break
    }
    case SiteId.AnimeLib: {
      presenceData = {
        ...presenceData,
        type: ActivityType.Watching,
        largeImageKey: switchLogo(siteId),
        name: 'AnimeLib',
        smallImageText: 'AnimeLib',
      }
      break
    }
  }

  /**
   * Checks if [2] includes '--', which is usually exists only in url slugs.
   * If this is true, it means the user is reading a manga or ranobe, therefore [2] becomes a slug
   */
  if (pathnameParts[2]?.includes('--')) {
    const slug = pathnameParts[2]
    const volume = pathnameParts[4]!.replace('v', '')
    const chapter = pathnameParts[5]!.replace('c', '')

    const { data } = await lib.getTitle<MangaData | RanobeData>(slug, siteId, origin)

    switch (siteId) {
      case SiteId.MangaLib: {
        const { name, rus_name, cover, ageRestriction, toast } = <MangaData>data
        if (isPrivacyMode(privacySetting, ageRestriction) || toast) {
          setPrivacyMode(presenceData)
          break
        }

        presenceData.details = `Читает ${rus_name ?? name}`
        presenceData.state = `Том ${volume} Глава ${chapter}`
        presenceData.largeImageKey = cover.adjusted
        presenceData.smallImageKey = switchLogo(siteId)
        presenceData.buttons = [
          {
            label: 'Открыть мангу',
            url: cleanUrl(href),
          },
        ]
        break
      }
      case SiteId.RanobeLib: {
        const { name, rus_name, cover, ageRestriction, toast } = <RanobeData> data
        if (isPrivacyMode(privacySetting, ageRestriction) || toast) {
          setPrivacyMode(presenceData)
          break
        }

        presenceData.details = `Читает ${rus_name ?? name}`
        presenceData.state = `Том ${volume} Глава ${chapter}`
        presenceData.largeImageKey = cover.adjusted
        presenceData.smallImageKey = switchLogo(siteId)
        presenceData.buttons = [
          {
            label: 'Открыть ранобэ',
            url: cleanUrl(href),
          },
        ]
        break
      }
    }
  }
  else {
    switch (route) {
      case '': {
        presenceData.details = 'Главная страница'
        presenceData.state = 'Так внимательно изучает...'
        break
      }
      case 'catalog': {
        presenceData.details = 'В каталоге'
        presenceData.state = 'Что ждёт нас сегодня?'
        break
      }
      case 'top-views': {
        presenceData.details = 'В топе по просмотрам'
        presenceData.state = 'Любуется популярными тайтлами'
        break
      }
      case 'messages': {
        presenceData.details = 'В личных сообщениях'
        presenceData.state = 'С кем-то общается...'
        break
      }
      case 'downloads': {
        presenceData.details = 'Страница загрузок'
        presenceData.state = 'Просматривает загруженные материалы'
        break
      }
      case 'media': {
        if (pathnameParts[3] === 'create') {
          presenceData.details = 'Добавляет тайтл'
          presenceData.state = 'Вышло что-то новенькое?'
        }
        break
      }
      case 'characters': {
        const slug = pathnameParts[3]

        if (slug) {
          if (slug === 'new') {
            presenceData.details = 'Добавляет персонажа'
            presenceData.state = 'Очередной аниме персонаж...'
          }
          else {
            const character = await lib.getCharacter(slug, siteId, origin)
            const { name, rus_name, cover } = character.data

            presenceData.details = 'Страница персонажа'
            presenceData.state = `${rus_name} (${name})`
            presenceData.largeImageKey = cover.adjusted
            presenceData.smallImageKey = switchLogo(siteId)
            presenceData.buttons = [
              {
                label: 'Oткрыть персoнажа',
                url: cleanUrl(href),
              },
            ]
          }
        }
        else {
          presenceData.details = 'Страница персонажей'
          presenceData.state = 'Ищет нового фаворита?'
        }
        break
      }
      case 'franchise': {
        if (pathnameParts[3]) {
          const name = document.querySelector('h1')
          const altName = document.querySelector('h2')

          if (name && altName) {
            presenceData.details = 'Страница франшизы'
            presenceData.state = `${name.textContent} (${altName.textContent?.split('/')[0] ?? ''
            })`
            presenceData.buttons = [
              {
                label: 'Открыть франшизу',
                url: cleanUrl(href),
              },
            ]
          }
        }
        else {
          presenceData.details = 'Страница франшиз'
          presenceData.state = 'Их так много...'
        }
        break
      }
      case 'faq': {
        const id = pathnameParts[3]

        if (id) {
          if (document.querySelector('h1')) {
            presenceData.details = 'Страница вопросов и ответов'
            presenceData.state = document.querySelector('h1')?.textContent ?? ''
            presenceData.buttons = [
              {
                label: 'Открыть страницу',
                url: cleanUrl(href),
              },
            ]
          }
        }
        else {
          presenceData.details = 'Страница вопросов и ответов'
          presenceData.state = 'Ответ на любой вопрос здесь!'
        }
        break
      }
      case 'news': {
        if (pathnameParts[3]) {
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
            presenceData.largeImageKey = switchLogo(siteId)
            presenceData.smallImageKey = avatar
            presenceData.smallImageText = username
            presenceData.buttons = [
              {
                label: 'Открыть новость',
                url: cleanUrl(href),
              },
            ]
          }
        }
        else {
          presenceData.details = 'На странице новостей'
          presenceData.state = 'Ищет, чего бы почитать'
        }
        break
      }
      case 'people': {
        const slug = pathnameParts[3]

        if (slug) {
          if (slug === 'create') {
            presenceData.details = 'Добавляет человека'
            presenceData.state = 'Какая-то известная личность?'
          }
          else {
            const person = await lib.getPerson(slug, siteId, origin)
            const { name: mainName, rus_name, alt_name, cover } = person.data

            const name = rus_name !== ''
              ? rus_name
              : alt_name !== ''
                ? alt_name
                : mainName

            presenceData.details = 'Страница человека'
            presenceData.state = `${name} (${mainName})`
            presenceData.largeImageKey = cover.adjusted
            presenceData.smallImageKey = switchLogo(siteId)
            presenceData.buttons = [
              {
                label: 'Открыть человека',
                url: cleanUrl(href),
              },
            ]
          }
        }
        else {
          presenceData.details = 'Страница людей'
          presenceData.state = 'Ищет нового фаворита?'
        }
        break
      }
      case 'collections': {
        const id = pathnameParts[3]

        if (id) {
          if (id === 'new') {
            presenceData.details = 'Создаёт коллекцию'
            presenceData.state = 'В ней будет много интересного!'
          }
          else {
            const collection = await lib.getCollection(id, siteId, origin)
            const { name, user, type, adult } = collection.data

            // Show collection viewing in privacy mode if it's enabled, or enforce it when collection was marked as for adults
            if (privacySetting || adult) {
              setPrivacyMode(presenceData)
              break
            }

            let collectionType: string
            switch (type) {
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
            presenceData.state = `${name} от ${user.username}`
            presenceData.smallImageKey = user.avatar.adjusted
            presenceData.smallImageText = user.username
            presenceData.buttons = [
              {
                label: 'Oткрыть кoллекцию',
                url: cleanUrl(href),
              },
            ]
          }
        }
        else {
          presenceData.details = 'Страница коллекций'
          presenceData.state = 'Их так много...'
        }
        break
      }
      case 'user': {
        const id = pathnameParts[3]

        if (id) {
          if (id === 'notifications') {
            presenceData.details = 'Страница уведомлений'
            presenceData.state = 'Что-то новенькое?'
          }
          else {
            const user = await lib.getUser(id, siteId, origin)
            const { username, avatar } = user.data

            presenceData.details = 'Страница пользователя'
            presenceData.state = username
            presenceData.largeImageKey = avatar.adjusted
            presenceData.smallImageKey = switchLogo(siteId)
            presenceData.buttons = [
              {
                label: 'Открыть профиль',
                url: cleanUrl(href),
              },
            ]
          }
        }
        else {
          presenceData.details = 'Страница пользователей'
          presenceData.state = 'Столько интересных личностей!'
        }
        break
      }
      case 'reviews': {
        const id = pathnameParts[3]

        if (id) {
          if (id === 'new') {
            presenceData.details = 'Пишет отзыв'
            presenceData.state = 'Излагает свои мысли...'
          }
          else {
            const review = await lib.getReview(id, siteId, origin)
            const { title, user, related } = review.data

            // Show review reading in privacy mode if it's enabled, or enforce it when related anime is RX rated
            if (
              isPrivacyMode(privacySetting, related.ageRestriction)
            ) {
              setPrivacyMode(presenceData)
              break
            }

            presenceData.details = `Отзыв на ${related.rus_name}`
            presenceData.state = `${title} от ${user.username}`
            presenceData.largeImageKey = related.cover.adjusted
            presenceData.smallImageKey = user.avatar.adjusted
            presenceData.smallImageText = user.username
            presenceData.buttons = [
              {
                label: 'Открыть отзыв',
                url: cleanUrl(href),
              },
            ]
          }
        }
        else {
          presenceData.details = 'Страница отзывов'
          presenceData.state = 'Столько разных мнений!'
        }
        break
      }
      case 'team': {
        const slug = pathnameParts[3]

        if (slug) {
          if (slug === 'create') {
            presenceData.details = 'Создаёт свою команду'
            presenceData.state = 'Она обязательно будет успешной!'
          }
          else {
            const name = document.querySelector('.cover__wrap')?.parentElement?.nextSibling?.textContent
            const coverSrc = document.querySelector<HTMLImageElement>('.cover__img')?.src

            if (name && coverSrc) {
              const cover = await lib.fetchCover(coverSrc, origin)

              presenceData.details = 'Страница команды'
              presenceData.state = name
              presenceData.largeImageKey = cover
              presenceData.smallImageKey = switchLogo(siteId)

              presenceData.buttons = [
                {
                  label: 'Открыть команду',
                  url: cleanUrl(href),
                },
              ]
            }
          }
        }
        else {
          presenceData.details = 'Страница команд'
          presenceData.state = 'Все такие талантливые!'
        }
        break
      }
      case 'publisher': {
        const slug = pathnameParts[3]

        if (slug) {
          if (slug === 'new') {
            presenceData.details = 'Добавляет издательство'
            presenceData.state = 'Да что они там издают?'
          }
          else {
            const publisher = await lib.getPublisher(slug, siteId, origin)
            const { name, rus_name, cover } = publisher.data

            presenceData.details = 'Страница издателя'
            presenceData.state = `${rus_name || name} (${name})`
            presenceData.largeImageKey = cover.adjusted
            presenceData.buttons = [
              {
                label: 'Открыть издателя',
                url: cleanUrl(href),
              },
            ]
          }
        }
        else {
          presenceData.details = 'Страница издетелей'
          presenceData.state = 'Их так много...'
        }
        break
      }
      case 'anime': {
        const slug = pathnameParts[3]!
        const { data } = await lib.getTitle<AnimeData>(slug, siteId, origin)
        const { name, rus_name, cover, ageRestriction, toast } = data

        if (isPrivacyMode(privacySetting, ageRestriction)) {
          setPrivacyMode(presenceData)
          break
        }

        if (pathname.endsWith('/watch')) {
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
            if (toast) {
              const title = document.querySelector('h1')?.textContent
              const coverSrc = document.querySelector<HTMLImageElement>('.cover__img')?.src

              if (title && coverSrc) {
                const cover = await lib.fetchCover(coverSrc, origin)

                titleSetting
                  ? (presenceData.name = title)
                  : (presenceData.details = title)
                presenceData.state = `${episode ? (episode.includes('эпизод') ? episode : 'Фильм') : 'Фильм'
                } | ${currentDub}`
                presenceData.largeImageKey = cover
              }
            }
            else {
              const title = rus_name !== '' ? rus_name : name

              titleSetting
                ? (presenceData.name = title)
                : (presenceData.details = title)
              presenceData.state = `${episode ? (episode.includes('эпизод') ? episode : 'Фильм') : 'Фильм'
              } | ${currentDub}`
              presenceData.largeImageKey = cover.adjusted
            }

            presenceData.buttons = [
              {
                label: 'Открыть аниме',
                url: cleanUrl(href),
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
          break
        }
        else {
          /**
           * Slighty different behaviour when anime is licensed
           */
          if (toast) {
            const title = document.querySelector('h1')?.textContent
            const coverSrc = document.querySelector<HTMLImageElement>('.cover__img')?.src

            if (title && coverSrc) {
              const cover = await lib.fetchCover(coverSrc, origin)

              presenceData.details = 'Страница аниме'
              presenceData.state = `${title}`
              presenceData.largeImageKey = cover
              presenceData.smallImageKey = switchLogo(siteId)
              presenceData.buttons = [
                {
                  label: 'Открыть аниме',
                  url: cleanUrl(href),
                },
              ]
            }
          }
          else {
            presenceData.details = 'Страница аниме'
            presenceData.state = `${rus_name !== '' ? rus_name : name}`
            presenceData.largeImageKey = cover.adjusted
            presenceData.smallImageKey = switchLogo(siteId)
          }

          presenceData.buttons = [
            {
              label: 'Открыть аниме',
              url: cleanUrl(href),
            },
          ]
        }
        break
      }
      case 'manga': {
        const slug = pathnameParts[3]

        if (slug) {
          const { data } = await lib.getTitle<RanobeData>(slug, siteId, origin)

          if (data.toast) {
            setPrivacyMode(presenceData)
          }
          else {
            presenceData.details = 'Страница манги'
            presenceData.state = `${data.rus_name !== '' ? data.rus_name : data.name}`
            presenceData.largeImageKey = data.cover.adjusted
            presenceData.smallImageKey = switchLogo(siteId)

            presenceData.buttons = [
              {
                label: 'Открыть мангу',
                url: cleanUrl(href),
              },
            ]
          }
        }
        break
      }
      case 'book': {
        const slug = pathnameParts[3]

        if (slug) {
          const { data } = await lib.getTitle<RanobeData>(slug, siteId, origin)

          if (data.toast) {
            setPrivacyMode(presenceData)
          }
          else {
            presenceData.details = 'Страница ранобэ'
            presenceData.state = `${data.rus_name !== '' ? data.rus_name : data.name}`
            presenceData.largeImageKey = data.cover.adjusted
            presenceData.smallImageKey = switchLogo(siteId)

            presenceData.buttons = [
              {
                label: 'Открыть ранобэ',
                url: cleanUrl(href),
              },
            ]
          }
        }
        break
      }
      default: {
        presenceData.details = 'Где-то...'
        presenceData.state = 'Не пытайтесь найти!'
        break
      }
    }
  }

  if (!buttonsSetting)
    delete presenceData.buttons

  presence.setActivity(presenceData)
})
