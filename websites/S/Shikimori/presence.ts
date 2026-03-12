import { Assets } from 'premid'

const presence = new Presence({
  clientId: '934863156356972584',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/Shikimori/assets/logo.png',
}

function textContent(tags: string) {
  return document.querySelector(tags)?.textContent
}

presence.on('UpdateData', async () => {
  const [privacy, logo, buttons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('logo'),
    presence.getSetting<boolean>('buttons'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'Где-то на сайте',
  }
  const title = document
    .querySelector('meta[property=\'og:title\']')
    ?.getAttribute('content')
  const { pathname, href } = document.location
  const typeContent = pathname.split('/')[1] === 'animes'
    ? 'Аниме'
    : pathname.split('/')[1] === 'mangas'
      ? 'Манга'
      : 'Ранобэ'
  const isImageExist = (tags: string) => {
    return document.querySelector<HTMLImageElement>(tags) && !privacy && logo
      ? document.querySelector<HTMLImageElement>(tags)?.src
      : ActivityAssets.Logo
  }

  presenceData.buttons = [
    {
      label: 'Открыть страницу',
      url: href,
    },
  ]

  switch (pathname.split('/')[1]) {
    case '':
      presenceData.details = 'На главной странице'
      break

    case 'animes':
    case 'mangas':
    case 'ranobe':
      presenceData.details = `В поиске ${typeContent}`
      presenceData.smallImageKey = Assets.Search

      if (pathname.split('/')[2]) {
        switch (pathname.split('/')[2]) {
          case 'genre':
          case 'kind':
          case 'status':
          case 'order-by':
          case 'mylist':
          case 'season':
          case 'score':
          case 'duration':
          case 'rating':
          case 'studio':
            presenceData.state = textContent('header > h1')
            break

          default:
            presenceData.details = `${title} (${typeContent})`
            presenceData.largeImageKey = isImageExist('.c-poster img')
            presenceData.smallImageKey = Assets.Viewing
            break
        }
      }

      switch (pathname.split('/')[3]) {
        case 'critiques':
        case 'reviews':
          presenceData.details = `${document
            .querySelector('meta[itemprop=\'name\']')
            ?.getAttribute('content')} (${typeContent})`
          presenceData.state = title
          presenceData.largeImageKey = isImageExist('.b-menu_logo img')
          presenceData.smallImageKey = Assets.Reading
          break

        case 'characters':
        case 'chronology':
        case 'clubs':
        case 'collections':
        case 'favoured':
        case 'screenshots':
        case 'similar':
        case 'staff':
        case 'related':
        case 'videos':
          presenceData.details = `${textContent(
            '.b-breadcrumbs span:last-child span',
          )} (${typeContent})`
          presenceData.state = textContent('.subheadline')
          presenceData.largeImageKey = isImageExist('.b-menu_logo img')
          presenceData.smallImageKey = Assets.Viewing
          break

        case 'franchise':
          presenceData.details = textContent(
            '.b-breadcrumbs span:last-child span',
          )
          presenceData.state = 'Франшиза'
          presenceData.smallImageKey = Assets.Viewing
          break

        default:
          break
      }
      break

    case 'clubs':
    case 'collections':
    case 'articles':
    case 'contests':
    case 'users':
    case 'ongoings':
    case 'achievements':
    case 'moderations':
    case 'kakie-anime-postmotret':
      presenceData.details = title
      presenceData.smallImageKey = Assets.Viewing

      if (pathname.split('/')[2]) {
        presenceData.details = textContent('.b-link span:first-child')
        presenceData.state = textContent('.l-page header h1')
        presenceData.largeImageKey = isImageExist('.b-menu_logo img')
      }
      break

    case 'forum':
      presenceData.details = textContent('.l-page header .b-link span')
      presenceData.smallImageKey = Assets.Reading

      switch (pathname.split('/')[2]) {
        case 'updates':
        case 'reviews':
          presenceData.state = textContent('.reload')
          break

        default:
          presenceData.state = title
          presenceData.largeImageKey = isImageExist('.b-menu_logo img')
          break
      }
      break

    case title?.replace(' ', '+'):
      presenceData.details = `Профиль ${!privacy ? title : 'пользователя'}`
      presenceData.largeImageKey = isImageExist('.avatar img')
      presenceData.smallImageKey = Assets.Viewing
      break

    case 'characters':
    case 'people':
      presenceData.details = textContent('.l-page header p')
      presenceData.largeImageKey = isImageExist('.c-poster img')
      presenceData.smallImageKey = Assets.Viewing

      if (!privacy) {
        presenceData.details = `${title} (${textContent('.l-page header p')})`

        if (pathname.split('/')[3]) {
          presenceData.details = `${textContent(
            '.b-breadcrumbs span:last-child span',
          )} (${textContent('.l-page header p')})`
          presenceData.state = title
          presenceData.largeImageKey = isImageExist('.b-menu_logo img')
        }
      }
      break
  }

  switch (pathname.split('/')[2]) {
    case 'achievements':
    case 'clubs':
    case 'comments':
    case 'favorites':
    case 'feed':
    case 'friends':
    case 'reviews':
    case 'versions':
    case 'topics':
      presenceData.details = `Профиль ${
        !privacy ? pathname.split('/')[1]?.replace('+', ' ') : 'пользователя'
      }`
      presenceData.state = title
      presenceData.smallImageKey = Assets.Viewing
      break

    case 'dialogs':
      presenceData.details = 'Почта'
      presenceData.smallImageKey = Assets.Viewing
      break

    case 'messages':
      presenceData.details = title
      presenceData.smallImageKey = Assets.Viewing
      break

    case 'history':
      presenceData.details = `Профиль ${
        !privacy ? pathname.split('/')[1]?.replace('+', ' ') : 'пользователя'
      }`
      presenceData.state = 'История списка'
      presenceData.largeImageKey = isImageExist('.submenu-triangle img')
      presenceData.smallImageKey = Assets.Viewing
      break

    case 'list':
      if (pathname.split('/')[3]?.match(/anime|manga/)) {
        presenceData.details = `${textContent('.subheadline')} ${
          !privacy ? pathname.split('/')[1] : 'пользователя'
        }`
        presenceData.state = document.querySelector<HTMLElement>(
          '.mylist .b-link.selected',
        )?.firstChild
        presenceData.largeImageKey = isImageExist('.avatar img')
        presenceData.smallImageKey = Assets.Viewing
      }
      break
  }

  if (!buttons || privacy)
    delete presenceData.buttons
  if (privacy)
    delete presenceData.state
  presence.setActivity(presenceData)
})
