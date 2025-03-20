import { Assets } from 'premid'

const presence = new Presence({
  clientId: '743233111097081886',
})

// Timestamp
function getTimeStamp() {
  return Math.floor(Date.now() / 1000)
}

// Variables
let Routes: string[],
  Queries: { [key: string]: string | string[] },
  DiscussionTitle: string | undefined,
  DiscussionAuthor: string | undefined,
  NewsTitle: string | undefined,
  peopleName: string | undefined,
  teamName: string | undefined,
  UserName: string | undefined,
  BookmarkType: string | undefined,
  BookmarkSize: string | undefined

presence.on('UpdateData', async () => {
  // Presence Data
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/Ranobelib/assets/logo.png',
  }

  // Setup Routes & Query
  Routes = document.location.href
    .replace(document.location.search, '')
    .split('/')
    .splice(3)
  Queries = Object.fromEntries(
    document.location.search
      .slice(1)
      .split('&')
      .map((k, _i, a) => {
        const item: string[] = k.replace(/\[(.*?)\]+/g, '').split('=')
        const Keys = a
          .map(i => i.replace(/\[(.*?)\]+/g, '').split('='))
          .filter(i => i[0] === item[0])

        if (Keys.length === 1)
          return item
        else return [item[0], Keys.map(i => i[1])]
      }),
  )

  // Website Pages
  switch (Routes[0]) {
    case '': {
      // Homepage
      presenceData.smallImageText = 'reading'
      presenceData.smallImageKey = Assets.Search
      presenceData.details = 'Главная'
      presenceData.startTimestamp = 0

      // Page Section
      if (Queries.section === 'my-updates')
        presenceData.state = 'Мои обновления'
      else presenceData.state = 'Все обновления'

      break
    }
    case 'manga-list': {
      // List of mangas
      presenceData.smallImageText = 'reading'
      presenceData.smallImageKey = Assets.Search
      presenceData.details = 'Каталог ранобэ'

      if (!Array.isArray(Queries.types))
        Queries.types = [Queries.types!]

      // Search Types
      if (Queries.types && Queries.types.length === 1) {
        // Types size === 1
        switch (Queries.types[0]) {
          case '10':
            presenceData.state = 'Ищет японское ранобэ'
            break
          case '11':
            presenceData.state = 'Ищет корейское ранобэ'
            break
          case '12':
            presenceData.state = 'Ищет китайское ранобэ'
            break
          case '13':
            presenceData.state = 'Ищет английское ранобэ'
            break
          case '14':
            presenceData.state = 'Ищет авторские'
            break
          case '9':
            presenceData.state = 'Ищет фанфики'
            break
          default:
            presenceData.state = 'Ищет ранобэ'
            break
        }
      }
      else if (Queries.types && Queries.types.length > 1) {
        // Types size > 1
        const mangas: string[] = []

        for (const item of Queries.types.sort()) {
          switch (item) {
            case '10':
              mangas.push('Японское')
              break
            case '11':
              mangas.push('Корейское')
              break
            case '12':
              mangas.push('Китайское')
              break
            case '13':
              mangas.push('Английское')
              break
            case '14':
              mangas.push('Авторские')
              break
            case '9':
              mangas.push('Фанфики')
              break
            default:
              mangas.push('Ранобэ')
              break
          }
        }

        presenceData.state = `Ищет: ${mangas.join(', ')}`
      }
      else {
        presenceData.state = 'Ищет Ранобэ'
      }

      break
    }
    case 'forum': {
      // Forum page
      presenceData.details = 'Форум'

      // Subpages of forums
      switch (Routes[1]) {
        case '': {
          // Main forum page
          presenceData.smallImageText = 'Читает'
          presenceData.smallImageKey = Assets.Reading

          if (Queries.subscription)
            presenceData.state = 'Мои подписки'

          if (Queries.user_id)
            presenceData.state = 'Мои темы'

          switch (Queries.category) {
            case 'all':
              presenceData.state = 'Все категории'
              break
            case '1':
              presenceData.state = 'Баги и проблемы'
              break
            case '2':
              presenceData.state = 'Предложения для сайта'
              break
            case '3':
              presenceData.state = 'Поиск тайтлов'
              break
            case '4':
              presenceData.state = 'Поиск кадров'
              break
            case '5':
              presenceData.state = 'Обсуждение Манги'
              break
            case '6':
              presenceData.state = 'Обсуждение Аниме'
              break
            case '7':
              presenceData.state = 'Обсуждение Ранобэ'
              break
            case '8':
              presenceData.state = 'Видеоигры'
              break
            case '9':
              presenceData.state = 'Переводчикам'
              break
            case '10':
              presenceData.state = 'Как переводить мангу'
              break
            case '11':
              presenceData.state = 'Как рисовать мангу'
              break
            case '12':
              presenceData.state = 'Общение'
              break
            case '13':
              presenceData.state = 'Другое'
              break
          }

          break
        }
        case 'discussion-create': {
          // Discussion create
          presenceData.smallImageText = 'Пишет'
          presenceData.smallImageKey = Assets.Writing
          presenceData.state = 'Создает новую тему'

          break
        }
        case 'discussion': {
          // Discussion page
          if (Routes[2] && !Routes[3]) {
            // Opened discussion
            presenceData.smallImageText = 'Читает'
            presenceData.smallImageKey = Assets.Reading

            const titleElement = document.querySelector(
              '.discussion .discussion__title',
            )?.textContent
            const authorElement = document.querySelector(
              '.discussion .discussion-creator__username',
            )?.textContent

            DiscussionTitle = titleElement ?? undefined
            DiscussionAuthor = authorElement ?? undefined

            if (DiscussionAuthor && DiscussionTitle)
              presenceData.state = `Тема: ${DiscussionTitle}| Автор: ${DiscussionAuthor}`
          }
          else if (Routes[3] && Routes[3] === 'edit') {
            // Editor discussion
            presenceData.smallImageText = 'Пишет'
            presenceData.smallImageKey = Assets.Writing

            presenceData.state = DiscussionTitle
              ? `Редактирует тему: ${DiscussionTitle}`
              : 'Редактирует тему'
          }

          break
        }
      }

      break
    }
    case 'faq': {
      // Faq page

      if (Routes[1] === 'article') {
        // Faq Editor

        presenceData.details = 'Faq'
        presenceData.smallImageText = 'Редактирует'
        presenceData.smallImageKey = Assets.Writing
        presenceData.state = `Редактирует: ${Queries.article} вопрос`
      }
      else {
        // Faq Sections
        presenceData.details = 'Faq'
        presenceData.smallImageText = 'Читает'
        presenceData.smallImageKey = Assets.Reading

        switch (Queries.section) {
          case '1':
            presenceData.state = 'Ранобэ'
            break
          case '2':
            presenceData.state = 'Общие вопросы'
            break
          case '3':
            presenceData.state = 'Профиль пользователя'
            break
          case '4':
            presenceData.state = 'Чтение ранобэ'
            break
          case '5':
            presenceData.state = 'Комментарии'
            break
          case '6':
            presenceData.state = 'Мини-чат'
            break
          case '7':
            presenceData.state = 'Решение проблем'
            break
          case '8':
            presenceData.state = 'Правила'
            break
          case '9':
            presenceData.state = 'Форум'
            break
        }
      }

      break
    }
    case 'news': {
      // News page
      presenceData.details = 'Новости'
      presenceData.smallImageText = 'Читает'
      presenceData.smallImageKey = Assets.Reading

      if (Routes[1]) {
        // Opened News
        const titleElement = document.querySelector('.news__title')
        NewsTitle = titleElement?.textContent ?? undefined

        if (NewsTitle)
          presenceData.state = NewsTitle
      }
      else {
        // News List
        presenceData.details = 'Новости'
        presenceData.smallImageText = 'Читает'
        presenceData.smallImageKey = Assets.Reading
        presenceData.state = 'Список новостей'
      }

      break
    }
    case 'notification': {
      // Notification list
      presenceData.details = 'Уведомления'
      presenceData.smallImageText = 'Читает'
      presenceData.smallImageKey = Assets.Reading

      switch (Queries.type) {
        case 'chapter':
          presenceData.state = 'Главы'
          break
        case 'comments':
          presenceData.state = 'Комментарии'
          break
        case 'message':
          presenceData.state = 'Сообщения'
          break
        case 'friend':
          presenceData.state = 'Заявки в друзья'
          break
        case 'other':
          presenceData.state = 'Другое'
          break
        case 'all':
          presenceData.state = 'Все'
          break
      }

      break
    }
    case 'contact-us': {
      // Contact page
      presenceData.details = 'Контакты'
      presenceData.smallImageText = 'Пишет'
      presenceData.smallImageKey = Assets.Writing
      presenceData.state = 'info@mangalib.me'

      break
    }
    case 'messages': {
      // Messages page
      presenceData.details = 'Личные сообщения'
      presenceData.smallImageText = 'Пишет'
      presenceData.smallImageKey = Assets.Writing
      presenceData.startTimestamp = getTimeStamp()

      break
    }
    case 'people': {
      // Authors (Moderation) page

      if (Routes[1] === 'create') {
        presenceData.details = 'Добавляет автора'
        presenceData.smallImageText = 'Добавляет автора'
        presenceData.smallImageKey = Assets.Writing

        peopleName = (<HTMLInputElement>document.querySelector('#name')).value

        if (peopleName.length > 1)
          presenceData.state = peopleName
        else presenceData.state = 'Имя автора не задано'
      }

      break
    }
    case 'team': {
      // Team page

      if (Routes[1] === 'create') {
        // Create New Team
        presenceData.details = 'Добавляет команду'
        presenceData.smallImageText = 'Добавляет команду'
        presenceData.smallImageKey = Assets.Writing

        teamName = (<HTMLInputElement>document.querySelector('#name')).value

        if (teamName.length > 1)
          presenceData.state = teamName
        else presenceData.state = 'Имя команды не задано'
      }
      else if (!Routes[2]) {
        // Main Team Page
        presenceData.details = 'Команда перевода'
        presenceData.smallImageText = 'Смотрит переводчика'
        presenceData.smallImageKey = Assets.Reading

        const title = document.querySelector('.team-profile__name')

        teamName = title?.textContent?.replace('редактировать', '')

        if (teamName)
          presenceData.state = teamName
      }
      else if (Routes[2] === 'edit') {
        presenceData.details = 'Команда перевода'
        presenceData.smallImageText = 'Редактирует переводчика'
        presenceData.smallImageKey = Assets.Writing

        switch (Queries.section) {
          case 'info':
            presenceData.state = 'Редактирует информацию команды'
            break
          case 'users':
            presenceData.state = 'Редактирует участников команды'
            break
        }
      }

      break
    }
    case 'moderation': {
      // Moderation page

      presenceData.details = 'Модерация'
      presenceData.smallImageText = 'Управляет сайтом'
      presenceData.smallImageKey = Assets.Reading

      if (!Routes[1]) {
        presenceData.state = 'Модерация глав'
      }
      else {
        switch (Routes[1]) {
          case 'manga': {
            if (Routes[2] === 'rejected')
              presenceData.state = 'Отклоненные ранобэ'
            else presenceData.state = 'Модерация ранобэ'

            break
          }
          case 'manga-edit': {
            presenceData.state = 'Изменения ранобэ'
            break
          }
          case 'author': {
            presenceData.state = 'Новые Авторы'
            break
          }
          case 'publisher': {
            presenceData.state = 'Новые Издательства'
            break
          }
          case 'comments': {
            presenceData.state = 'Жалобы на комментарии'
            break
          }
          case 'forum-posts': {
            presenceData.state = 'Жалобы на форуме'
            break
          }
          case 'comments-list': {
            if (Routes[2] === 'all')
              presenceData.state = 'Список комментариев'
            else if (Routes[2] === 'sticky')
              presenceData.state = 'Закрепленные комментарии'

            break
          }
          case 'ban-list': {
            presenceData.state = 'Баны'
            break
          }
          case 'other': {
            presenceData.state = 'Другое'
            break
          }
        }
      }
      break
    }
    case 'user': {
      // User page
      presenceData.smallImageText = 'Смотрит профиль пользователя'
      presenceData.smallImageKey = Assets.Reading

      const username = document.querySelector('.profile-user__username span')

      UserName = username?.textContent ?? undefined

      if (UserName)
        presenceData.details = `Профиль:${UserName}`

      if (Routes[1] === 'content') {
        presenceData.details = 'Мои добавления'
        presenceData.smallImageText = 'Пишет'
        presenceData.smallImageKey = Assets.Writing
        presenceData.startTimestamp = 0

        if (!Routes[2]) {
          presenceData.state = 'Добавленные тайтлы'
        }
        else {
          switch (Routes[2]) {
            case 'moderation': {
              presenceData.state = 'Тайтлы на модерации'
              break
            }
            case 'rejected': {
              presenceData.state = 'Тайтлы не прошедшие модерацию'
              break
            }
            case 'chapters': {
              presenceData.state = 'Главы на модерации'
              break
            }
          }
        }
      }
      else if (Routes[1] === 'edit') {
        presenceData.details = 'Мои настройки'
        presenceData.smallImageText = 'Настраивает'
        presenceData.smallImageKey = Assets.Writing
        presenceData.startTimestamp = 0

        switch (Queries.section) {
          case 'info':
            presenceData.state = 'Информация'
            break
          case 'site-settings':
            presenceData.state = 'Настройки сайта'
            break
          case 'notifications':
            presenceData.state = 'Уведомления'
            break
          case 'password':
            presenceData.state = 'Безопасность'
            break
        }
      }
      else if (!Routes[2]) {
        // Main user page
        const size = document.querySelector(
          '.bookmark-menu .menu__item.is-active .bookmark-menu__label',
        )
        const title = document.querySelector(
          '.bookmark-menu .menu__item.is-active .bookmark-menu__name',
        )

        BookmarkSize = size?.textContent ?? undefined
        BookmarkType = `${title?.textContent?.charAt(0).toUpperCase()
        }${title?.textContent?.slice(1)}`

        presenceData.details = `Закладки ${UserName}`
        presenceData.state = `${BookmarkType.trim()}: ${BookmarkSize}`
        presenceData.smallImageText = 'Читает'
        presenceData.smallImageKey = Assets.Reading
        presenceData.startTimestamp = 0
      }
      else {
        switch (Routes[2]) {
          case 'comment': {
            presenceData.details = `Профиль: ${UserName}`
            let commentType

            switch (Queries.comment_type) {
              case 'manga': {
                commentType = 'Комментарии к ранобэ'
                break
              }
              case 'chapter': {
                commentType = 'Комментарии к главам'
                break
              }
              case 'post': {
                commentType = 'Комментарии к новостям'
                break
              }
              default:
                commentType = 'Все комментарии'
            }

            presenceData.state = commentType

            break
          }
          case 'following': {
            presenceData.details = `Профиль: ${UserName}`
            presenceData.state = 'Список друзей'

            break
          }
          case 'mutual-friends': {
            presenceData.details = `Профиль: ${UserName}`
            presenceData.state = 'Общие друзья'

            break
          }
          case 'ignore': {
            presenceData.details = `Профиль: ${UserName}`
            presenceData.state = 'Игнор-лист'

            break
          }
          case 'ban': {
            presenceData.details = 'Мой профиль'
            presenceData.state = 'История банов'

            break
          }
        }
      }
      break
    }
    case 'manga': {
      // Manga page

      if (Routes[1] === 'create') {
        // create new manga
        presenceData.details = 'Добавляет ранобэ'
        presenceData.smallImageText = 'Пишет'
        presenceData.smallImageKey = Assets.Writing

        const title = <HTMLInputElement>document.querySelector('#rus_name')

        if (title.value.length > 1)
          presenceData.state = title.value
        else presenceData.state = 'Имя ранобэ не задано'
      }
      else {
        switch (Routes[2]) {
          case 'edit': {
            // edit
            presenceData.smallImageText = 'Редактирует'
            presenceData.smallImageKey = Assets.Writing
            presenceData.details = document.querySelector(
              '.section__header .breadcrumb a',
            )?.textContent

            switch (Queries.section) {
              case 'media-edit':
                presenceData.state = 'Редактирование'
                break
              case 'changes':
                presenceData.state = 'Список изменений'
                break
              case 'related-items':
                presenceData.state = 'Связанные тайтлы'
                break
            }

            break
          }
          case 'bulk-create': {
            // bulk create
            presenceData.details = 'Добавляет главы'
            presenceData.smallImageText = 'Добавляет'
            presenceData.smallImageKey = Assets.Uploading
            presenceData.state = `Ранобэ: ${
              document.querySelector('.section__header .breadcrumb a')
                ?.textContent
            }`

            break
          }
          case 'add-chapter': {
            // add chapter
            presenceData.details = 'Добавляет главу'
            presenceData.smallImageText = 'Добавляет'
            presenceData.smallImageKey = Assets.Uploading
            presenceData.state = `Ранобэ: ${
              document.querySelector('.section__header .breadcrumb a')
                ?.textContent
            }`

            break
          }
          default: {
            presenceData.details = 'Редактирует главу'
            presenceData.smallImageText = 'Пишет'
            presenceData.smallImageKey = Assets.Writing
            presenceData.state = `Ранобэ: ${
              document.querySelector('.section__header .breadcrumb a')
                ?.textContent
            }`
          }
        }
      }
      break
    }
    default:
      if (document.querySelector('.reader')) {
        presenceData.details = 'Читает ранобэ'
        presenceData.state = document.title.split(' ').slice(2, -4).join(' ')
        presenceData.smallImageText = 'Читает'
        presenceData.smallImageKey = Assets.Reading
        presenceData.startTimestamp = getTimeStamp()
      }
      else {
        const { title } = document

        presenceData.details = 'Смотрит ранобэ'
        presenceData.state = title.split('/')[0]?.split(' ').slice(1).join(' ')
        presenceData.smallImageText = 'Читает'
        presenceData.smallImageKey = Assets.Reading
      }
  }

  presence.setActivity(presenceData, true)
})
