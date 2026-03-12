type Functionlize<T> = {
  [P in keyof T]: () => T[P];
}

interface Route extends Functionlize<Partial<PresenceDataFull>> {
  path: RegExp
  playback?: () => boolean
  run?: () => PresenceData
}

enum Settings {
  TIMESTAMP = 'timestamp',
  BUTTONS = 'buttons',
  LOGO = 'logo',
}

enum Icons {
  PAUSED = 'paused',
  PLAYED = 'played',
  SEARCHING = 'searching',
  LOCATION = 'location',
  DISCOVERY = 'discovery',
}

enum Logos {
  LIGHT = 'light-logo',
  DARK = 'dark-logo',
}

let video = { duration: 0, currentTime: 0, paused: true }

const presence = new Presence({
  clientId: '770030754356396052',
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
    { path: /^\/$/, details: () => 'On Homepage' },
    {
      path: /^\/episode\//,
      run: () => {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
          Math.floor(video.currentTime),
          Math.floor(video.duration),
        )

        if (video.paused) {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }

        return presenceData
      },
      playback: () => !video.paused,
      smallImageKey: () => (video.paused ? Icons.PAUSED : Icons.PLAYED),
      smallImageText: () => (video.paused ? 'Paused' : 'Played'),
      state: () =>
        document
          .querySelectorAll('.container')[1]
          ?.textContent
          ?.slice(1, -1)
          .split(' ')
          .slice(0, -2)
          .join(' '),
      details: () =>
        `Episode: ${document
          .querySelectorAll('.container')[1]
          ?.textContent
          ?.slice(1, -1)
          .split(' ')
          .pop()}`,
      buttons: () => [
        { label: 'Watch Episode', url: location.href },
        {
          label: 'View Anime',
          url: document
            .querySelector('.anime-page-link')
            ?.querySelector('a')
            ?.getAttribute('href') ?? '',
        },
      ],
    },
    {
      path: /^\/\?search_param=(.*)/,
      smallImageKey: () => Icons.SEARCHING,
      smallImageText: () => 'Searching',
      details: () =>
        `Results: ${document.querySelectorAll('.col-lg-2').length ?? 0}`,
      state: () =>
        `Searching: ${document
          .querySelectorAll('.container')[1]
          ?.textContent
          ?.split(' ')
          .slice(4, -1)
          .join(' ')}`,
      buttons: () => [{ label: 'Results', url: location.href }],
    },
    {
      path: /^\/anime\/(.*)/,
      smallImageKey: () => Icons.LOCATION,
      smallImageText: () => 'Viewing',
      details: () => 'Viewing an Anime',
      state: () => document.querySelector('.anime-details-title')?.textContent ?? undefined,
      buttons: () => [
        { label: 'View Anime', url: location.href },
        {
          label: 'Last Episode',
          url: document
            .querySelector('#DivEpisodesList')
            ?.lastElementChild
            ?.querySelector('a')
            ?.getAttribute('href') ?? '',
        },
      ],
    },
    {
      path: /^\/(%d9%82%d8%a7%d8%a6%d9%85%d8%a9-%d8%a7%d9%84%d8%a7%d9%86%d9%85%d9%8a|anime-(.*))/,
      smallImageKey: () => Icons.DISCOVERY,
      smallImageText: () => 'Browsing',
      details: () => 'Browsing for Anime',
      buttons: () => [{ label: 'Browse', url: location.href }],
    },
    {
      path: /^\/%d9%85%d9%88%d8%a7%d8%b9%d9%8a%d8%af-%d8%b9%d8%b1%d8%b6-%d8%ad%d9%84%d9%82%d8%a7%d8%aa-%d8%a7%d9%84%d8%a7%d9%86%d9%85%d9%8a/,
      smallImageKey: () => Icons.DISCOVERY,
      smallImageText: () => 'Discovering',
      details: () => 'Discovering Episodes Releases',
      buttons: () => [{ label: 'Discover', url: location.href }],
    },
  ]

  return routes.find(route => route.path.test(path))!
}

presence.on(
  'iFrameData',
  (data: { duration: number, currentTime: number, paused: boolean }) => {
    video = data
  },
)

presence.on('UpdateData', async () => {
  const [showTimestamp, showButtons, logo] = await Promise.all([
    presence.getSetting<boolean>(Settings.TIMESTAMP),
    presence.getSetting<boolean>(Settings.BUTTONS),
    presence.getSetting<number>(Settings.LOGO),
  ])

  let presenceData: PresenceData = {
    largeImageKey: [Logos.LIGHT, Logos.DARK][logo] || Logos.LIGHT,
  }

  if (showTimestamp)
    presenceData.startTimestamp = startTimestamp

  const route = router({
    presenceData,
    path: location.href.replace(`https://${location.hostname}`, ''),
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
