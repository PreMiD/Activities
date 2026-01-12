import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1034799018980679680',
})

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
let contentType: string | null | undefined
let contentTitle: string | null | undefined
let contentSerieTitle: string | null | undefined

function textContent(tags: string) {
  return document.querySelector(tags)?.textContent?.trim()
}

function pageTitle(string?: string): string | string[] {
  const pageTitle = document
    .querySelector<HTMLTitleElement>('title')
    ?.textContent ?? ''
  if (string)
    return pageTitle.split(string)
  return pageTitle
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
  const [privacy, time, useActivityName] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('useActivityName'),
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
              presenceData.state = textContent('a[aria-current="location"]')
              break
            case 'movies':
              presenceData.details = 'Смотрит список'
              presenceData.state = textContent('main > div:nth-of-type(1) h1')
              break
          }
          break
        case 'film':
          presenceData.details = 'Смотрит страницу фильма'
          if (!pathname.split('/')[3]) {
            presenceData.state = textContent('h1 > span')
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
            presenceData.state = textContent('h1 > span')
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
            presenceData.state = textContent('h1')
          }
          else {
            presenceData.state = `${pageTitle(' — ')?.[0]} – ${pageTitle(' — ')?.[1]}`
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
          presenceData.state = pageTitle() as string
          break
      }
      break

    case 'hd.kinopoisk.ru': {
      presenceData.largeImageKey = ActivityAssets.Movies;
      (presenceData as PresenceData).type = ActivityType.Watching
      presenceData.details = 'В онлайн-кинотеатре'
      presenceData.state = textContent('div[data-tid="HeaderContentComponent"] a[aria-current="page"]')

      const filmContents = document.querySelectorAll<HTMLDivElement>('div[data-tid="FilmContent"]')
      const videoPlayerWrapper = document.querySelector<HTMLDivElement>('div[data-tid="ContentPlayerBody"]')
        ?? document.querySelector<HTMLDivElement>('div[data-tid="PlayerView"]')

      // Movies or Series previews
      if (filmContents.length > 0) {
        const lastFilmContent = filmContents[filmContents.length - 1]

        if (lastFilmContent) {
          const buttonElement = lastFilmContent.querySelector<HTMLButtonElement>('ul > li:first-child > button')
          const typeContent = buttonElement?.textContent?.trim()?.toLowerCase()
          const imgElement = lastFilmContent.querySelector<HTMLImageElement>('section h1 > img')
          const imgAlt = imgElement?.alt
            .replace('Смотреть', '')
            .replace('фильм', '')

          if (typeContent) {
            presenceData.details = `Смотрит ${typeContent}`
          }

          if (imgAlt) {
            presenceData.state = imgAlt
          }

          presenceData.smallImageKey = Assets.Viewing
        }
      }

      if (videoPlayerWrapper) {
        // Movies or Series
        if (videoPlayerWrapper.querySelector('div[data-tid="Image"] > img')) {
          contentType = 'фильм'
          contentTitle = videoPlayerWrapper.querySelector<HTMLImageElement>('div[data-tid="Meta"] div[data-tid="Image"] > img')?.alt
        }
        if (videoPlayerWrapper.querySelector('div[data-tid="Meta"] > div:last-child > div')) {
          contentType = 'сериал'
          contentSerieTitle = videoPlayerWrapper.querySelector<HTMLDivElement>('div[data-tid="Meta"] > div:last-child > div')?.textContent.trim()
        }

        if (videoPlayerWrapper.querySelector('section[data-tid="ChannelPlayerMeta"]')) { // TV's
          contentType = 'канал'
          contentTitle = videoPlayerWrapper.querySelector<HTMLParagraphElement>('section[data-tid="ChannelPlayerMeta"] p[data-tid="Text"]')?.textContent.trim()
          contentSerieTitle = videoPlayerWrapper.querySelector<HTMLParagraphElement>('section[data-tid="ChannelPlayerMeta"] > p')?.textContent?.trim()
          if (!privacy)
            presenceData.largeImageKey = videoPlayerWrapper.querySelector<HTMLImageElement>('.channel-icon')?.src ?? ActivityAssets.Movies
        }
        else if (videoPlayerWrapper.querySelector('section[data-tid="SportEventPlayerMeta"]')) { // Sport VOD's
          contentTitle = videoPlayerWrapper.querySelector<HTMLHeadingElement>('section[data-tid="SportEventPlayerMeta"] > header')?.textContent?.trim()
          contentSerieTitle = [...videoPlayerWrapper.querySelectorAll<HTMLSpanElement>('section[data-tid="SportEventPlayerMeta"] div[data-tid="Scoreboard"] > span')].map(el => el.textContent.trim()).join(' - ')
        }
        else if (videoPlayerWrapper.querySelector('div[data-tid="HighlightPlayerMeta"]')) { // Sport Highlights
          contentTitle = videoPlayerWrapper.querySelector<HTMLHeadingElement>('div[data-tid="HighlightPlayerMeta"] > h4')?.textContent?.trim()
          contentSerieTitle = videoPlayerWrapper.querySelector<HTMLParagraphElement>('div[data-tid="HighlightPlayerMeta"] > h5')?.textContent.trim()
        }

        if (contentTitle) {
          if (contentType)
            presenceData.details = `Смотрит ${contentType}`
          if (!privacy) {
            if (useActivityName)
              presenceData.name = contentTitle

            presenceData.details = contentTitle
            delete presenceData.state

            if (contentSerieTitle) {
              const [seasonNumber, episodeNumber, episodeTitle] = contentSerieTitle
                .split(/[,.]\s*/)
                .flatMap(x => Number.parseInt(x) || x)

              if (seasonNumber && episodeNumber && episodeTitle) {
                presenceData.details = useActivityName ? (episodeTitle as string) : contentTitle
                presenceData.state = useActivityName
                  ? `Сезон ${seasonNumber}, Эпизод ${episodeNumber}`
                  : `S${seasonNumber}:E${episodeNumber} ${episodeTitle}`
              }
              else {
                presenceData.state = contentSerieTitle
              }
            }
          }

          if (videoPlayerWrapper.querySelector<HTMLVideoElement>('video')) {
            [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(
              videoPlayerWrapper.querySelector<HTMLVideoElement>('video')!,
            )
          }
        }

        isPaused = videoPlayerWrapper.querySelector<HTMLButtonElement>('button[data-tid="PlayToggle"][aria-label="Смотреть"]')

        presenceData.smallImageKey = isPaused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = isPaused ? strings.pause : strings.play

        if (isPaused || !time) {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
      }
      else {
        contentType = null
        contentTitle = null
        contentSerieTitle = null
      }
      break
    }
  }

  if (privacy) {
    delete presenceData.state
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }
  presence.setActivity(presenceData)
})
