import { Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1055612773419196476',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/P/Pok%C3%A9flix/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings(
    {
      viewHome: 'general.viewHome',
      view: 'general.view',
      search: 'general.search',
      searchFor: 'general.searchFor',
      play: 'general.watchingVid',
      pause: 'general.paused',
      searchSomething: 'general.searchSomething',
      watchVideoButton: 'general.buttonWatchVideo',
    },
  )
}

let video = {
  duration: 0,
  currentTime: 0,
  paused: true,
}
let strings: Awaited<ReturnType<typeof getStrings>>

function textContent(tags: string) {
  return document.querySelector(tags)?.textContent?.trim()
}

function capitalizeFirstLetter(string: string) {
  return string.trim().charAt(0).toUpperCase() + string.trim().slice(1)
}

presence.on(
  'iFrameData',
  (data: unknown) => {
    video = data as typeof video
  },
)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    details: 'Somewhere on the site',
    largeImageKey: ActivityAssets.Logo,
  }
  const [privacy, time, buttons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('buttons'),
  ])
  const { pathname, href } = document.location
  const path = pathname.split('/')[1]

  if (!strings)
    strings = await getStrings()

  switch (path) {
    case 'index':
      presenceData.details = strings.viewHome
      break

    case 'browse':
    case 'upcoming':
    case 'movies':
    case 'specials':
      presenceData.details = !privacy
        ? strings.searchFor
        : strings.searchSomething
      presenceData.state = path === 'movies' || path === 'specials'
        ? capitalizeFirstLetter(path)
        : textContent('.container h2')
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = strings.search
      break

    case 'v':
    case 'video':
      presenceData.details = !privacy
        ? `${strings.view} ${document
          .querySelector('.fluid-container h2')
          ?.firstChild
          ?.textContent
          ?.trim()}`
        : strings.play
      presenceData.state = textContent('.fluid-container h2 p')

      if (!privacy && video.currentTime > 0) {
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video.paused
          ? strings.pause
          : strings.play
        presenceData.buttons = [
          {
            label: strings.watchVideoButton,
            url: href,
          },
        ]

        if (video.paused || !time) {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
        else {
          [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(video.currentTime, video.duration)
        }
      }
      break
  }

  if (privacy)
    delete presenceData.state
  if (privacy || !buttons)
    delete presenceData.buttons
  presence.setActivity(presenceData)
})
