import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1073310499057451119',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

let data: {
  currTime: number
  duration: number
  paused: boolean
} | null = null

enum ActivityAssets {
  Logo = 'https://i.imgur.com/tZcHnJA.png',   
  Settings = 'https://i.imgur.com/tZcHnJA.png',   
  Notifications = 'https://i.imgur.com/tZcHnJA.png',   
}

interface Strings {
  exploring: string
  animeList: string
  specials: string
  watching: string
  paused: string
  playing: string
  profile: string
  viewAnime: string
  watchEpisode: string
}

const strings: Record<'en' | 'ro', Strings> = {
  en: {
    exploring: 'Exploring AnimeTerra',
    animeList: 'Looking at Anime List',
    specials: 'Looking at Specials & Movies',
    watching: 'Watching',
    paused: 'Paused',
    playing: 'Playing',
    profile: 'Checking User Profile',
    viewAnime: 'View Anime',
    watchEpisode: 'Watch Episode'
  },
  ro: {
    exploring: 'Explorează AnimeTerra',
    animeList: 'Se uită pe Lista de Anime',
    specials: 'Se uită pe Lista de Speciale & Filme',
    watching: 'Se uită la',
    paused: 'Pauză',
    playing: 'Se uită',
    profile: 'Verifică Profilul Utilizatorului',
    viewAnime: 'Vezi Anime',
    watchEpisode: 'Vezi Episodul'
  }
}

presence.on(
  'iFrameData',
  async (receivedData: {
    currTime: number
    duration: number
    paused: boolean
  }) => {
    data = receivedData
  },
)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: 'AnimeTerra',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const buttonsEnabled = await presence.getSetting<boolean>('buttons')
  const lang = await presence.getSetting<string>('lang') || '0'
  const currentStrings = strings[lang === '0' ? 'en' : 'ro'] ?? strings.en

  const { pathname, href } = document.location

  if (pathname === '/' || pathname === '/home') {
    presenceData.details = currentStrings.exploring
  }
  else if (pathname === '/animes') {
    presenceData.details = currentStrings.animeList
    presenceData.smallImageKey = Assets.Reading
  }
  else if (pathname === '/specials') {
    presenceData.details = currentStrings.specials
    presenceData.smallImageKey = Assets.Reading
  }
  else if (pathname.startsWith('/anime/')) {
    const title = document.querySelector<HTMLHeadingElement>('h1.text-2xl.font-bold.text-white')
    const thumbnail = document.querySelector<HTMLImageElement>('img[data-nimg="fill"]')?.src

    presenceData.largeImageKey = thumbnail
    if (title) presenceData.details = title.textContent
    if (buttonsEnabled) {
      presenceData.buttons = [
        {
          label: currentStrings.viewAnime,
          url: href,
        }
      ]
    }
  }
  else if (pathname.startsWith('/watch/')) {
    const title = document.querySelector<HTMLHeadingElement>('h1.text-3xl.md\\:text-4xl.font-extrabold.mb-4')
    const thumbnail = document.querySelector<HTMLImageElement>('div.relative.aspect-\\[2\\/3\\] img[data-nimg="fill"]')?.src

    presenceData.largeImageKey = thumbnail
    if (title) presenceData.details = title.textContent
    if (data) {
      presenceData.type = ActivityType.Playing
      if (!data.paused) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(data.currTime, data.duration)
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = currentStrings.playing
      } else {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = currentStrings.paused
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }

    if (buttonsEnabled) {
      presenceData.buttons = [
        {
          label: currentStrings.watchEpisode,
          url: href,
        }
      ]
    }
  }
  else if (pathname === '/profile') {
    presenceData.details = currentStrings.profile
    presenceData.smallImageKey = ActivityAssets.Settings
  }

  presence.setActivity(presenceData)
})