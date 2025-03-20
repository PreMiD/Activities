import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1096792677888053308',
})
async function getStrings() {
  return presence.getStrings({
    play: 'general.watchingVid',
    pause: 'general.paused',
  })
}

let video = {
  duration: 0,
  currentTime: 0,
  paused: true,
}
let strings: Awaited<ReturnType<typeof getStrings>>

const animetypes: { [key: string]: string } = {
  'tv': 'ТВ-сериал',
  'tv-speshl': 'ТВ-спешл',
  'ova': 'OVA',
  'ona': 'ONA',
  'polnometrazhnyy-film': 'Фильм',
  'korotkometrazhnyy-film': 'Фильм',
  'dunkhua': 'Дунху',
}
const animegenres: { [key: string]: string } = {
  'boyevyye-iskusstva': 'Боевые искусства',
  'voyna': 'Война',
  'drama': 'Драма',
  'detektiv': 'Детектив',
  'istoriya': 'История',
  'komediya': 'Комедия',
  'mekha': 'Меха',
  'mistika': 'Мистика',
  'makho-sedze': 'Махо-сёдзё',
  'muzykalnyy': 'Музыкальный',
  'povsednevnost': 'Повседневность',
  'priklyucheniya': 'Приключения',
  'parodiya': 'Пародия',
  'romantika': 'Романтика',
  'senen': 'Сёнен',
  'sedze': 'Сёдзё',
  'sport': 'Спорт',
  'skazka': 'Сказка',
  'sedze-ay': 'Сёдзё-ай',
  'senen-ay': 'Сёнен-ай',
  'samurai': 'Самураи',
  'triller': 'Триллер',
  'uzhasy': 'Ужасы',
  'fantastika': 'Фантастика',
  'fentezi': 'Фентези',
  'shkola': 'Школа',
  'etti': 'Эччи',
}

enum ActivityAssets {
  VostLogo = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/logo.png',
  Ongoing = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/0.png',
  Anons = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/1.png',
}

enum otherAssets {
  'boyevyye-iskusstva' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/2.png',
  'voyna' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/3.png',
  'drama' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/4.png',
  'detektiv' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/5.png',
  'istoriya' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/6.png',
  'komediya' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/7.png',
  'mekha' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/8.png',
  'mistika' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/9.png',
  'makho-sedze' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/10.png',
  'muzykalnyy' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/11.png',
  'povsednevnost' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/12.png',
  'priklyucheniya' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/13.png',
  'parodiya' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/14.png',
  'romantika' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/15.png',
  'senen' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/16.png',
  'sedze' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/17.png',
  'sport' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/18.png',
  'skazka' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/19.png',
  'samurai' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/20.png',
  'triller' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/21.png',
  'uzhasy' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/22.png',
  'fantastika' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/23.png',
  'fentezi' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/24.png',
  'shkola' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/25.png',
  'etti' = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeVost/assets/26.png',
}

let strtstamp = Math.floor(Date.now() / 1000)
let pausestamp = false

presence.on(
  'iFrameData',
  (data: unknown) => {
    video = data as typeof video
  },
)

presence.on('UpdateData', async () => {
  const [privacy, time, logo, buttons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('logo'),
    presence.getSetting<boolean>('buttons'),
  ])
  const presenceData: PresenceData = {
    details: 'Где-то на сайте',
    largeImageKey: ActivityAssets.VostLogo,
    smallImageText: '🏴‍☠️ AnimeVost',
  }
  const websiteloc = document.location.pathname.split('/')
  if (!strings)
    strings = await getStrings()
  if (!privacy) {
    if (websiteloc[1] === '')
      presenceData.details = 'На главной странице'
    if (websiteloc[1] === 'zhanr') {
      const animegenre = animegenres[websiteloc[2] ?? '']
      presenceData.details = `🔎 В поисках аниме жанра ${animegenre}`
      presenceData.smallImageKey = otherAssets[websiteloc[2] as keyof typeof otherAssets]
      presenceData.smallImageText = `🔎 В поисках аниме жанра ${animegenre}`
    }
    if (websiteloc[1] === 'god')
      presenceData.details = `🔎 В поисках аниме ${websiteloc[2]} года`
    if (websiteloc[1] === 'ongoing') {
      presenceData.details = '🔎 В поисках онгоинга'
      presenceData.smallImageKey = ActivityAssets.Ongoing
      presenceData.smallImageText = '🔎 В поисках Онгоинга'
    }
    if (websiteloc[1] === 'preview') {
      presenceData.details = '🔎 В поисках анонса'
      presenceData.smallImageKey = ActivityAssets.Anons
      presenceData.smallImageText = '🔎 В поисках Анонса'
    }
    if (websiteloc[1] === 'user') {
      presenceData.details = `На странице пользователя ${decodeURIComponent(
        websiteloc[2] ?? '',
      )}`
      if (logo) {
        presenceData.largeImageKey = document
          .querySelector('.userinfoCenterAva')
          ?.querySelector('img')
          ?.src
        presenceData.smallImageKey = ActivityAssets.VostLogo
        presenceData.smallImageText = '🏴‍☠️ AnimeVost'
      }
    }
  }
  else {
    presenceData.largeImageKey = ActivityAssets.VostLogo
    presenceData.smallImageText = '🏴‍☠️ AnimeVost'
    presenceData.details = 'Где-то на сайте'
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
    delete presenceData.state
  }
  if (websiteloc[1] === 'tip' && websiteloc[2] !== '') {
    const animetype = animetypes[document.location.pathname.split('/')[2] ?? '']
    const animename = document
      .querySelectorAll('.shortstoryHead')[0]
      ?.textContent
      ?.split('/')[0]
      ?.trim()
    presenceData.details = `В поисках ${animetype} a`
    if (websiteloc[3] !== '') {
      if (!privacy && logo) {
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.imgRadius')?.src
        presenceData.smallImageKey = ActivityAssets.VostLogo
        presenceData.smallImageText = '🏴‍☠️ AnimeVost'
      }
      else {
        delete presenceData.smallImageKey
        presenceData.largeImageKey = ActivityAssets.VostLogo
      }
      if (video.duration) {
        presenceData.details = `Смотрит ${animetype} ${
          !privacy ? animename : ''
        }`
        presenceData.state = document.querySelector('.active')?.textContent
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video.paused
          ? strings.pause
          : strings.play
        if (video.currentTime && time) {
          if (video.paused) {
            delete presenceData.startTimestamp
            delete presenceData.endTimestamp
            if (!pausestamp) {
              strtstamp = Math.floor(Date.now() / 1000)
              pausestamp = true
            }
          }
          else {
            pausestamp = false;
            [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video.currentTime, video.duration)
          }
        }
      }
      else {
        presenceData.details = `На странице ${animetype}a ${
          !privacy ? animename : ''
        }`
      }
    }
  }
  if (buttons && !privacy) {
    presenceData.buttons = [
      {
        label: 'Открыть страницу',
        url: document.location.href,
      },
    ]
  }
  else {
    delete presenceData.buttons
  }
  if (time)
    presenceData.startTimestamp = strtstamp
  presence.setActivity(presenceData)
})
