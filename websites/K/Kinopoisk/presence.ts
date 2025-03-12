import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1034799018980679680',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.watchingVid',
      pause: 'general.paused',
      view: 'general.view',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let contentTitle: string | null | undefined
let contentSerieTitle: string | null | undefined

function textContent(tags: string) {
  return document.querySelector(tags)?.textContent?.trim()
}

function pageTitle(string: string) {
  return document
    .querySelector<HTMLTitleElement>('title')
    ?.textContent
    ?.split(string)
}

enum ActivityAssets {
  Library = 'https://cdn.rcd.gg/PreMiD/websites/K/Kinopoisk/assets/logo.png',
  Movies = 'https://cdn.rcd.gg/PreMiD/websites/K/Kinopoisk/assets/0.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    details: 'Где-то на сайте',
    smallImageText: 'Kinopoisk',
  }
  const [privacy, time] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('time'),
  ])
  const { hostname, pathname } = document.location

  let isPaused

  if (!strings)
    strings = await getStrings()

  switch (hostname) {
    case 'www.kinopoisk.ru':
      presenceData.largeImageKey = ActivityAssets.Library
      switch (pathname.split('/')[1]) {
        case '':
          presenceData.details = 'На главной странице'
          break
        case 'lists':
          switch (pathname.split('/')[2]) {
            case 'categories':
              presenceData.details = 'Смотрит списки'
              presenceData.state = textContent('.styles_activeCategory__mDu7i')
              break
            case 'movies':
              presenceData.details = 'Смотрит список'
              presenceData.state = textContent('.styles_title__jB8AZ')
              break
          }
          break
        case 'film':
          presenceData.details = 'Смотрит страницу фильма'
          if (!pathname.split('/')[3]) {
            presenceData.state = textContent('.styles_title__65Zwx')
          }
          else {
            presenceData.state = `${textContent(
              '.breadcrumbs li:last-child a',
            )} – ${textContent('.breadcrumbs li:first-child')}`
          }
          break
        case 'series':
          presenceData.details = 'Смотрит страницу сериала'
          if (!pathname.split('/')[3]) {
            presenceData.state = textContent('.styles_title___itJ6 span')
          }
          else {
            presenceData.state = `${textContent(
              '.breadcrumbs li:last-child a',
            )} – ${textContent('.breadcrumbs li:first-child')}`
          }
          break
        case 'name':
          presenceData.details = 'Смотрит страницу человека'
          if (!pathname.split('/')[3]) {
            presenceData.state = pageTitle(' — ')?.[0]
          }
          else {
            presenceData.state = `${pageTitle(' — ')?.[0]} – ${
              pageTitle(' — ')?.[1]
            }`
          }
          break
        case 'media':
          if (!pathname.split('/')[3]) {
            presenceData.details = `Смотрит ${textContent(
              '.media-list-page-title',
            )?.toLowerCase()}`
            presenceData.state = textContent(
              '.media-main-page-navigation-menu__item.active',
            )
          }
          else {
            presenceData.state = textContent(
              '.media-post-title span:last-child',
            )
            switch (pathname.split('/')[2]) {
              case 'article':
                presenceData.details = 'Смотрит статьи'
                break
              case 'game':
                presenceData.details = 'Смотрит тесты'
                break
              case 'news':
                presenceData.details = 'Смотрит новости'
                break
              case 'podcast':
                presenceData.details = 'Смотрит подкасты'
                break
              case 'rubric':
                presenceData.details = 'Смотрит рубрики'
                presenceData.state = textContent('.media-list-page-title')
                break
              case 'special':
                presenceData.details = 'Смотрит спецпроекты'
                break
              case 'video':
                presenceData.details = 'Смотрит видео'
                break
            }
          }
          break
        case 'afisha':
          if (!privacy) {
            presenceData.details = 'Ищет билеты в кино'
            presenceData.smallImageKey = Assets.Search
          }
          break
        case 'chance':
          presenceData.details = 'Ищет случайный фильм'
          presenceData.state = textContent('.filmName a')
          break
        case 'premiere':
          presenceData.details = `Смотрит график премьер ${textContent(
            '.act',
          )}`
          presenceData.state = textContent('.main_title_prem')
          break
        case 's':
          presenceData.details = 'Ищет фильмы'
          presenceData.smallImageKey = Assets.Search
          break
        case 'special':
          presenceData.details = 'Смотрит спецпроект'
          presenceData.state = textContent('.festival-welcome__text-title')
          break
        case 'top':
          presenceData.details = 'Ищет фильм через навигатор'
          presenceData.smallImageKey = Assets.Search
          break
        case 'user':
          presenceData.details = 'Смотрит профиль'
          presenceData.state = pageTitle(':')?.[1]
          break
        case 'mykp':
          presenceData.details = 'Смотрит свой профиль'
          presenceData.state = pageTitle(':')?.[1]
          break
      }
      break

    case 'hd.kinopoisk.ru':
      presenceData.details = 'В онлайн-кинотеатре'
      presenceData.largeImageKey = ActivityAssets.Movies

      if (document.querySelector('.FilmContent_wrapper__EicQU')) {
        presenceData.details = `Смотрит информацию ${textContent(
          '.FilmContent_wrapper__EicQU .TabList_root__Kwcez button',
        )?.toLowerCase()}`
        presenceData.state = document
          .querySelector<HTMLImageElement>('.FilmContent_wrapper__EicQU img')
          ?.alt
          .replace('Смотреть', '')
          .replace('фильм', '')
        presenceData.smallImageKey = Assets.Viewing
      }

      if (document.querySelector('.CrispySlideDown_fade_active__StELV')) {
        presenceData.details = `Смотрит информацию ${textContent(
          '.CrispySlideDown_fade_active__StELV .TabList_root__Kwcez button',
        )?.toLowerCase()}`
        presenceData.state = document
          .querySelector<HTMLImageElement>(
            '.CrispySlideDown_fade_active__StELV img',
          )
          ?.alt
          .replace('Смотреть', '')
          .replace('фильм', '')
        presenceData.smallImageKey = Assets.Viewing
      }

      if (document.querySelector('.PlayerManager_body__rOEVd')) {
        if (document.querySelector('.Meta_image__CXoKi')) {
          contentTitle = document.querySelector<HTMLImageElement>('.Meta_image__CXoKi')?.alt
        }

        if (document.querySelector('.Meta_subtitle__jnooi'))
          contentSerieTitle = textContent('.Meta_subtitle__jnooi')

        if (contentTitle || contentSerieTitle) {
          presenceData.details = `Смотрит ${
            !privacy ? contentTitle : contentSerieTitle ? 'сериал' : 'фильм'
          }`

          const contentTimestamps = presence.getTimestampsfromMedia(
            document.querySelector('video')!,
          );

          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(contentTimestamps[0], contentTimestamps[1])
        }
        else {
          presenceData.details = 'Смотрит телеканал'
          presenceData.startTimestamp = browsingTimestamp
        }

        isPaused = document.querySelector('.styles_play__lWZwM')

        presenceData.state = contentSerieTitle
        presenceData.smallImageKey = isPaused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = isPaused ? strings.pause : strings.play

        if (isPaused || !time) {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
      }
      else {
        contentTitle = null
        contentSerieTitle = null
      }
      break
  }

  if (privacy)
    delete presenceData.state
  presence.setActivity(presenceData)
})
