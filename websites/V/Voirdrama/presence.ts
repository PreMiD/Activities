import { ActivityType, Assets, getTimestamps } from 'premid'

let video = {
  duration: 0,
  currentTime: 0,
  paused: true,
}

const presence = new Presence({
  clientId: '1234098856376012860',
})

const pathArr = document.location.pathname.split('/')
const browsingTimestamp = Math.floor(Date.now() / 1000)
const pages: Record<string, PresenceData> = {
  'liste-dramas': {
    state: 'Listes de dramas',
  },
  'nouveaux-ajouts': {
    state: 'Nouveaux dramas',
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
  const strings = await presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    home: 'general.viewHome',
    viewEpisode: 'general.buttonViewEpisode',
    viewPage: 'general.viewPage',
    browsing: 'general.browsing',
    searchFor: 'general.searchFor',
  })
  const [privacyMode, showTimestamps, showButtons] = await Promise.all(
    [
      presence.getSetting<boolean>('privacy'),
      presence.getSetting<boolean>('timestamps'),
      presence.getSetting<boolean>('buttons'),
    ],
  )

  let presenceData: PresenceData = {
    details: strings.home,
    type: ActivityType.Watching,
    largeImageKey: 'https://i.imgur.com/RkcVWHJ.png',
    startTimestamp: browsingTimestamp,
  }

  if (privacyMode) {
    presenceData.details = strings.browsing
  }
  switch (pathArr[1]) {
    case 'drama': {
      const title = document.querySelector('ol > li:nth-child(2) > a')
      presenceData.details = 'Visite la page du drama :'
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
        const [startTimestamp, endTimestamp] = getTimestamps(
          video.currentTime,
          video.duration,
        )

        presenceData.details = title.textContent
        presenceData.state = `Episode: ${document
          .querySelector('li.active')
          ?.textContent
          ?.split('-')
          .pop()}`;
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
            label: 'Voir le drama',
            url: title.getAttribute('href'),
          },
        ]
        if (video.paused) {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
      }
      break
    }
    case 'drama-genre':
      presenceData.details = strings.viewPage
      presenceData.state = `Listes drama du genre "${
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
  else presence.clearActivity()
})
