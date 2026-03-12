import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1036732879725658213',
})

enum Content {
  friends = 'Друзья',
  photos = 'Фото',
  statuses = 'Заметки',
  groups = 'Группы',
  market = 'Товары',
  music = 'Музыка',
  games = 'Игры',
  video = 'Видео',
  giftsFriend = 'Подарки',
  about = 'О себе',
  feed = 'новости',
  guests = 'гостей',
  marks = 'события',
  messages = 'сообщения',
  vitrine = 'игры',
  gifts = 'подарки',
  discovery = 'рекомендации',
  topphoto = 'фото-конкурс',
  marathons = 'марафоны',
  services = 'приложения',
  mall = 'товары',
  payments = 'платежи и подписки',
  online = 'людей на сайте',
}

async function getStrings() {
  return presence.getStrings({
    playVideo: 'general.watchingVid',
    playMusic: 'general.playing',
    pause: 'general.paused',
    view: 'general.view',
    reading: 'general.reading',
  })
}

let video = {
  duration: 0,
  currentTime: 0,
  paused: true,
}
let strings: Awaited<ReturnType<typeof getStrings>>

function textContent(tags: string) {
  return document.querySelector(tags)?.textContent
}

function typeContent(string: string) {
  return Content[string as keyof typeof Content]
}

presence.on(
  'iFrameData',
  (data: unknown) => {
    video = data as typeof video
  },
)

presence.on('UpdateData', async () => {
  if (!strings)
    strings = await getStrings()
  const presenceData: PresenceData = {
    details: 'Где-то на сайте',
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/OK/assets/logo.png',
  }
  const [musicMode, privacy, time, logo] = await Promise.all([
    presence.getSetting<boolean>('musicMode'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('logo'),
  ])
  const { pathname } = document.location
  const playMusic = document
    .querySelector('music-mini-player')
    ?.hasAttribute('playing')

  function showMusic() {
    const timeMusic = document
      .querySelector<HTMLElement>('wm-player-duration .track .tooltip')
      ?.lastChild
      ?.textContent
      ?.split(' / ')

    presenceData.details = textContent('.mini-player_name')
    presenceData.state = textContent('.mini-player_artist')
    presenceData.smallImageKey = playMusic ? Assets.Play : Assets.Pause
    presenceData.smallImageText = playMusic ? strings.playMusic : strings.pause

    if (logo) {
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
        '.mini-player_cover-img',
      )?.src
    }

    if (timeMusic && playMusic) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
        presence.timestampFromFormat(timeMusic[0]!),
        presence.timestampFromFormat(timeMusic[1]!),
      )
    }
  }

  if (!musicMode) {
    switch (pathname.split('/')[1]) {
      case 'music':
        presenceData.details = 'Слушает музыку'
        if (!privacy)
          showMusic()
        break

      case 'video':
        presenceData.details = 'Смотрит видео'
        presenceData.smallImageKey = Assets.Viewing
        presenceData.smallImageText = strings.view

        if (document.querySelector('.vp-layer')) {
          presenceData.state = textContent('.vp-layer-info_h')
          presenceData.smallImageKey = video.paused
            ? Assets.Pause
            : Assets.Play
          presenceData.smallImageText = video.paused
            ? strings.pause
            : strings.playVideo

          if (!video.paused) {
            [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video.currentTime, video.duration)
          }
        }
        break

      case 'profile':
        presenceData.details = `Смотрит профиль ${textContent(
          '.__user-profile-name-decorator',
        )}`
        presenceData.smallImageKey = Assets.Viewing
        presenceData.smallImageText = strings.view

        if (pathname.split('/')[3]) {
          if (document.querySelector('.compact-profile')) {
            presenceData.details = `Смотрит профиль ${
              document.querySelector<HTMLLinkElement>('.compact-profile_a')
                ?.textContent
            }`
          }
          else {
            presenceData.details = `Смотрит профиль ${
              document.querySelector('.nav-side_i-w')?.lastChild?.textContent
            }`
          }
          presenceData.state = typeContent(pathname.split('/')[3]!)
        }

        if (privacy)
          presenceData.details = 'Смотрит профиль пользователя'
        break

      case 'guests':
      case 'marks':
      case 'vitrine':
      case 'gifts':
      case 'discovery':
      case 'topphoto':
      case 'marathons':
      case 'services':
      case 'mall':
      case 'payments':
      case 'online':
        presenceData.details = `Смотрит ${typeContent(pathname.split('/')[1]!)}`
        presenceData.smallImageKey = Assets.Viewing
        presenceData.smallImageText = strings.view
        break

      case 'feed':
      case 'messages':
        presenceData.details = `Читает ${typeContent(pathname.split('/')[1]!)}`
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = strings.reading
        break

      case 'notifications':
        presenceData.details = 'Читает оповещения'
        presenceData.state = document.querySelector(
          '.toolbar-layer_menu .nav-side_i.__ac .tico',
        )?.lastChild?.textContent
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = strings.reading
        break

      case 'game':
        presenceData.details = 'Играет в игру'
        break

      case 'bookmarks':
        presenceData.details = 'Смотрит закладки'
        presenceData.state = textContent('.nav-side_i.__ac div')
        presenceData.smallImageKey = Assets.Viewing
        presenceData.smallImageText = strings.view
        break

      case 'settings':
        presenceData.details = 'Настраивает аккаунт'
        presenceData.state = textContent('.nav-side_i.__ac .tico')
        break
    }
  }

  if (privacy)
    delete presenceData.state
  if (musicMode && document.querySelector('music-mini-player'))
    showMusic()
  if ((!playMusic && video.paused) || !time || privacy) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }
  presence.setActivity(presenceData)
})
