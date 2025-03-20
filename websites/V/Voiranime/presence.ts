import { ActivityType, Assets } from 'premid'

let video = {
  duration: 0,
  currentTime: 0,
  paused: true,
}
let currentLang = 'en'
let strings: Awaited<ReturnType<typeof getStrings>>

const presence = new Presence({
  clientId: '867411016836186112',
})
async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      home: 'general.viewHome',
      viewEpisode: 'general.buttonViewEpisode',
      viewAnime: 'general.buttonViewAnime',
      watchingAnime: 'general.watchingAnime',
      browsing: 'general.browsing',
      viewPage: 'general.viewPage',
      searchFor: 'general.searchFor',
    },
    currentLang,
  )
}
const pathArr = document.location.pathname.split('/')
const browsingTimestamp = Math.floor(Date.now() / 1000)
const pages: Record<string, PresenceData> = {
  'liste-danimes': {
    state: 'Listes d\'animes',
  },
  'nouveaux-ajouts': {
    state: 'Nouveaux animes',
  },
  'prochainement': {
    state: 'Prochains animes',
  },
}

presence.on(
  'iFrameData',
  (data: { duration: number, currentTime: number, paused: boolean }) => {
    if (data?.duration)
      video = data
  },
)

presence.on('UpdateData', async () => {
  const [newLang, privacyMode, showTimestamps, showButtons] = await Promise.all(
    [
      presence.getSetting<string>('lang').catch(() => 'fr'),
      presence.getSetting<boolean>('privacy'),
      presence.getSetting<boolean>('timestamps'),
      presence.getSetting<boolean>('buttons'),
    ],
  )

  if (currentLang !== newLang || !strings) {
    currentLang = newLang
    strings = await getStrings()
  }

  let presenceData: PresenceData = {
    details: strings.home,
    type: ActivityType.Watching,
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/Voiranime/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (privacyMode)
    presenceData.details = strings.browsing
  switch (pathArr[1]) {
    case 'anime': {
      const title = document.querySelector('ol > li:nth-child(2) > a')
      presenceData.details = 'Visite la page de l\'anime :'
      presenceData.state = document.querySelector(
        'div.post-title > h1',
      )?.textContent
      if (privacyMode) {
        delete presenceData.state
        presenceData.details = strings.browsing
      }
      if (
        !Number.isNaN(video.duration)
        && title
        && !!document.querySelector('li.active')
      ) {
        const [startTimestamp, endTimestamp] = presence.getTimestamps(
          video.currentTime,
          video.duration,
        )

        presenceData.details = title.textContent
        presenceData.state = document
          .querySelector('li.active')
          ?.textContent
          ?.split('-')[1];
        [presenceData.startTimestamp, presenceData.endTimestamp] = [
          startTimestamp,
          endTimestamp,
        ]
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video.paused
          ? strings.pause
          : strings.play
        presenceData.buttons = [
          {
            label: strings.viewEpisode,
            url: document.location.href,
          },
          {
            label: strings.viewAnime,
            url: title.getAttribute('href'),
          },
        ]
        if (video.paused) {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
        if (privacyMode) {
          delete presenceData.buttons
          delete presenceData.smallImageKey
          delete presenceData.state
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
          presenceData.details = strings.watchingAnime
        }
      }
      break
    }
    case 'anime-genre':
      presenceData.details = strings.viewPage
      presenceData.state = `Listes d'animes du genre "${
        document.querySelector('h1')?.textContent
      }"`
      if (privacyMode) {
        delete presenceData.state
        presenceData.details = strings.browsing
      }
      break
    default:
      if (document.location.search.startsWith('?s')) {
        presenceData.details = strings.searchFor
        presenceData.state = new URLSearchParams(document.location.search).get(
          's',
        )
        presenceData.smallImageKey = Assets.Search
      }
      else if (Object.keys(pages).includes(pathArr[1]!)) {
        presenceData.details = strings.viewPage
      }
      presenceData = { ...presenceData, ...pages[pathArr[1]!] } as PresenceData
      if (privacyMode) {
        delete presenceData.state
        delete presenceData.smallImageKey
        presenceData.details = strings.browsing
      }
      break
  }

  if (!showButtons || privacyMode)
    delete presenceData.buttons
  if (!showTimestamps) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
