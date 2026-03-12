import { Assets } from 'premid'

type Functionlize<T> = {
  [P in keyof T]: () => T[P];
}

interface Route extends Functionlize<Partial<PresenceDataFull>> {
  path: RegExp
  playback?: () => boolean
  run?: () => PresenceData
}

enum LoAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/Mahara-Tech/assets/logo.png',
}

enum Settings {
  TIMESTAMP = 'timestamp',
  BUTTONS = 'buttons',
}

let video = { duration: 0, currentTime: 0, paused: true }

const presence = new Presence({
  clientId: '1146100707959783495',
})
const startTimestamp: number = Math.floor(Date.now() / 1000)
function router({
  path,
  presenceData,
}: {
  path: string
  presenceData: PresenceData
}): Route {
  const routes: Route[] = [
    {
      path: /^\/my\//,
      details: () => 'On Homepage',
      state: () => {
        return 'Dashboard'
      },
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Browsing Courses',
    },
    {
      path: /^\/user\//,
      details: () => 'Viewing a profile',
      state: () => {
        return `${
          document.querySelector('h4.breadcrumb_title')?.textContent
        }'s profile`
      },
      smallImageKey: () => Assets.Reading,

      buttons: () => [
        {
          label: 'Visit Profile',
          url: (() => {
            return document.location.href
          })(),
        },
      ],
    },
    {
      path: /^\/mod\/hvp\/*/,

      run: () => {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
          Math.floor(video.currentTime),
          Math.floor(video.duration),
        )

        return presenceData
      },
      playback: () => !video.paused,
      smallImageKey: () => (video.paused ? Assets.Pause : Assets.Play),
      smallImageText: () => (video.paused ? 'Paused' : 'Playing'),

      details: () => document.title,
      state: () => {
        return document.querySelector('h4.title.float-left')?.textContent ?? undefined
      },
      buttons: () => [
        {
          label: 'View Course',
          url: (() => {
            const href = document
              .querySelector(
                '.btn.btn-primary.ccn-btn-backtocourse.float-left',
              )
              ?.getAttribute('href') ?? ''
            return href
          })(),
        },
      ],
    },

    {
      path: /^\/mod\/quiz\/*/,

      smallImageKey: () => Assets.Writing,
      smallImageText: () => 'taking a quiz...',

      details: () => document.title,
      state: () => {
        return document.querySelector('h4.title.float-left')?.textContent ?? undefined
      },
      buttons: () => [
        {
          label: 'View Course',
          url: (() => {
            const href = document
              .querySelector(
                '.btn.btn-primary.ccn-btn-backtocourse.float-left',
              )
              ?.getAttribute('href') ?? ''
            return href
          })(),
        },
      ],
    },

    {
      path: /^\/course\/(.*)/,

      smallImageKey: () => Assets.Viewing,
      smallImageText: () => 'Viewing',
      details: () => 'Viewing course',
      state: () => {
        return document.querySelector('h4.breadcrumb_title')?.textContent ?? undefined
      },
      buttons: () => [
        {
          label: 'View Course',
          url: (() => {
            return document.location.href
          })(),
        },
      ],
    },
    {
      path: /^\/mod\/*/,
      details: () => 'Browsing Courses',
      state: () => 'Choosing a Course',
      smallImageKey: () => Assets.Search,
      buttons: () => [
        {
          label: 'Search with me?',
          url: (() => {
            return document.location.href
          })(),
        },
      ],
    },
    {
      path: /.*$/,
      details: () => 'On Homepage',

      smallImageKey: () => Assets.Search,
      smallImageText: () => 'Browsing website',
    },
  ]

  return routes.find(route => route.path?.test(path))!
}

presence.on(
  'iFrameData',
  (data: { duration: number, currentTime: number, paused: boolean }) => {
    video = data
  },
)

presence.on('UpdateData', async () => {
  const [showTimestamp, showButtons] = await Promise.all([
    presence.getSetting<boolean>(Settings.TIMESTAMP),
    presence.getSetting<boolean>(Settings.BUTTONS),
  ])

  let presenceData: PresenceData = {
    largeImageKey: LoAssets.Logo,
  }

  if (showTimestamp)
    presenceData.startTimestamp = startTimestamp

  const route = router({
    presenceData,
    path: document.location.href.replace(
      `https://${document.location.hostname}`,
      '',
    ),
  })

  if (!route)
    return presence.setActivity(presenceData)

  if (route.run)
    presenceData = route.run()
  if (route.state)
    presenceData.state = route.state()
  if (route.details)
    presenceData.details = route.details()
  if (showButtons && route.buttons)
    presenceData.buttons = route.buttons() as [ButtonData, ButtonData?]
  if (route.largeImageKey)
    presenceData.largeImageKey = route.largeImageKey()
  if (route.smallImageKey)
    presenceData.smallImageKey = route.smallImageKey()
  if (route.smallImageText)
    presenceData.smallImageText = route.smallImageText()

  if (showTimestamp && route.endTimestamp)
    presenceData.endTimestamp = route.endTimestamp()

  presence.setActivity(presenceData, route.playback ? route.playback() : false)
})
