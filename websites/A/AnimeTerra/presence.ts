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
}

async function getStrings() {
  return presence.getStrings(
    {
      exploring: 'general.browsing',
      animeList: 'general.viewAnimeList',
      specials: 'general.viewSpecials',
      watching: 'general.watching',
      paused: 'general.paused',
      playing: 'general.playing',
      profile: 'general.viewProfile',
      viewAnime: 'general.buttonViewAnime',
      watchEpisode: 'general.buttonViewEpisode',
    }
  )
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

  const [buttonsEnabled, strings] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    getStrings(),
  ])

  const { pathname, href } = document.location

  if (pathname === '/' || pathname === '/home') {
    presenceData.details = strings.exploring
  }
  else if (pathname === '/animes') {
    presenceData.details = 'Viewing anime list'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (pathname === '/specials') {
    presenceData.details = 'Viewing specials & movies'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (pathname.startsWith('/anime/')) {
    const title = document.querySelector<HTMLHeadingElement>('h1.text-2xl.font-bold.text-white')
    const thumbnail = document.querySelector<HTMLImageElement>('img[data-nimg="fill"]')?.src

    presenceData.largeImageKey = thumbnail
    if (title) {
      presenceData.details = `Viewing anime: ${title.textContent}`
    }
    if (buttonsEnabled) {
      presenceData.buttons = [
        {
          label: strings.viewAnime,
          url: href,
        },
      ]
    }
  }
  else if (pathname.startsWith('/watch/')) {
    const title = document.querySelector<HTMLHeadingElement>('h1.text-3xl.md\\:text-4xl.font-extrabold.mb-4')
    const thumbnail = document.querySelector<HTMLImageElement>('div.relative.aspect-\\[2\\/3\\] img[data-nimg="fill"]')?.src

    presenceData.largeImageKey = thumbnail
    if (title) {
      presenceData.details = `Watching: ${title.textContent}`
    }
    if (data) {
      presenceData.type = ActivityType.Playing
      if (!data.paused) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(data.currTime, data.duration)
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = strings.playing
      }
      else {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = strings.paused
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }

    if (buttonsEnabled) {
      presenceData.buttons = [
        {
          label: strings.watchEpisode,
          url: href,
        },
      ]
    }
  }
  else if (pathname === '/profile') {
    presenceData.details = 'Viewing profile'
    presenceData.smallImageKey = ActivityAssets.Logo
  }

  presence.setActivity(presenceData)
})
