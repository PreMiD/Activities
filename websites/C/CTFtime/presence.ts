import { Assets } from 'premid'

type Functionlize<T> = {
  [P in keyof T]: () => T[P];
}

interface Route extends Functionlize<Partial<PresenceDataFull>> {
  path: RegExp
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/CTFtime/assets/logo.png',
}

enum Settings {
  TIMESTAMP = 'timestamp',
  BUTTONS = 'buttons',
  COVERS = 'images',
}
const { href, hostname } = document.location
const presence = new Presence({
  clientId: '1253040451624370300',
})
const imgElements = document.querySelector<HTMLImageElement>('.span2 img')?.src ?? ActivityAssets.Logo
const startTimestamp: number = Math.floor(Date.now() / 1000)
function router({ path }: { path: string, presenceData: PresenceData }): Route {
  const routes: Route[] = [
    {
      path: /^\/$/,
      details: () => 'On Homepage',
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Browsing',
    },

    {
      path: /^\/ctfs$/,
      details: () => 'Looking for a CTF',
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Browsing',
    },
    {
      path: /^\/event\/list\/.*upcoming.*$/,
      details: () => 'Browsing upcoming CTFs',
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Browsing',
    },
    {
      path: /^\/event\/list\/.*now.*$/,
      details: () => 'Browsing running CTFs',
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Browsing',
    },
    {
      path: /^\/event\/list\/.*archive.*$/,
      details: () => 'Browsing past CTFs',
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Browsing',
    },
    {
      path: /^\/tasks.*$/,
      details: () => 'Searching write ups',
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Browsing',
    },
    {
      path: /^\/calendar.*$/,
      details: () => 'Checking Calendar',
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Browsing',
    },
    {
      path: /^\/profile.*$/,
      details: () => 'Editing their profile',
      smallImageKey: () => Assets.Writing,
    },
    {
      path: /^\/writeups$/,
      details: () => 'Looking for Writeups',
      smallImageKey: () => Assets.Reading,
    },
    {
      path: /^\/writeup.*$/,
      details: () => 'Reading a Challenge Writeup',
      state: () => document.querySelector('.page-header h2')?.textContent ?? undefined,
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Learning',
      buttons: () => [
        {
          label: 'Read With Me',
          url: href.split('/').slice(0, 5).join('/'),
        },
      ],
    },
    {
      path: /^\/task.*$/,
      details: () => 'Viewng a Challenge Info',
      state: () => document.querySelector('.page-header h2')?.textContent ?? undefined,
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Learning',
      buttons: () => [
        {
          label: 'Challenge Link',
          url: href.split('/').slice(0, 5).join('/'),
        },
      ],
    },
    {
      path: /^\/task.*\/writeup.*$/,
      details: () => 'Making a Challenge Write up',
      state: () => document.querySelector('.page-header h2')?.textContent ?? undefined,
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Learning',
      buttons: () => [
        {
          label: 'Challenge Link',
          url: (() => {
            return href
              .split('/')
              .slice(0, 5)
              .join('/')
              .replace(/\/writeup$/, '')
          })(),
        },
      ],
    },
    {
      path: /^\/event.*$/,
      details: () => 'Viewing a CTF',
      state: () => document.querySelector('.page-header h2')?.textContent ?? undefined,
      largeImageKey: () => imgElements,
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Browsing',
      buttons: () => [
        {
          label: 'View CTF',
          url: href.split('/').slice(0, 5).join('/'),
        },
      ],
    },
    {
      path: /^\/user.*$/,
      details: () => 'Viewing user profile',
      state: () => document.querySelector('.page-header h2')?.textContent ?? undefined,
      largeImageKey: () => imgElements,
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Browsing',
      buttons: () => [
        {
          label: 'Profile',
          url: href.split('/').slice(0, 5).join('/'),
        },
      ],
    },
    {
      path: /^\/team.*$/,
      state: () => document.querySelector('.page-header h2')?.textContent ?? undefined,
      details: () => 'Viewing a Team',
      largeImageKey: () => imgElements,
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Browsing',
      buttons: () => [
        {
          label: 'View Team',
          url: href.split('/').slice(0, 5).join('/'),
        },
      ],
    },
    {
      path: /^\/stats.*$/,
      state: () => {
        const h3Elements = document.querySelectorAll('h3')
        if (h3Elements.length > 1)
          return `Region: ${h3Elements[0]?.textContent}`
        else return 'Global Ranking'
      },
      details: () => 'Viewing Teams Ranking',
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Browsing',
      buttons: () => [
        {
          label: 'View Ranks',
          url: href.split('/').slice(0, 5).join('/'),
        },
      ],
    },
    {
      path: /^\/ctfprofile.*$/,
      details: () => 'Organizing CTF',
    },
    {
      path: /^\/.*$/,
      details: () => {
        return href.split('/')[3]?.toUpperCase().split('-').join(' ')
      },
    },
  ]

  return routes.find(route => route.path.test(path)) as Route
}

presence.on('UpdateData', async () => {
  const [showTimestamp, showButtons, showCovers] = await Promise.all([
    presence.getSetting<boolean>(Settings.TIMESTAMP),
    presence.getSetting<boolean>(Settings.BUTTONS),
    presence.getSetting<boolean>(Settings.COVERS),
  ])
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  if (showTimestamp)
    presenceData.startTimestamp = startTimestamp

  const route = router({
    presenceData,
    path: href.replace(`https://${hostname}`, ''),
  })

  if (!route)
    return presence.setActivity(presenceData)
  if (route.state)
    presenceData.state = route.state()
  if (route.details)
    presenceData.details = route.details()
  if (showButtons && route.buttons)
    presenceData.buttons = route.buttons() as [ButtonData, ButtonData?]
  if (route.largeImageKey && showCovers)
    presenceData.largeImageKey = route.largeImageKey()
  if (route.smallImageKey)
    presenceData.smallImageKey = route.smallImageKey()
  if (route.smallImageText)
    presenceData.smallImageText = route.smallImageText()
  if (showTimestamp && route.endTimestamp)
    presenceData.endTimestamp = route.endTimestamp()

  presence.setActivity(presenceData)
})
