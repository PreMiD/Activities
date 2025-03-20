import { Assets } from 'premid'

type Functionlize<T> = {
  [P in keyof T]: () => T[P];
}

interface Route extends Functionlize<Partial<PresenceDataFull>> {
  path: RegExp
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/Coursera/assets/logo.png',
}

enum Settings {
  TIMESTAMP = 'timestamp',
  BUTTONS = 'buttons',
}
const { href, hostname } = document.location
const presence = new Presence({
  clientId: '1179996601327026227',
})
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
      path: /^\/account-profile$/,
      details: () => ' Viewing own Profile',
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Browsing',
    },
    {
      path: /^\/user\/.*$/,
      details: () => {
        return `Viewing ${
          document.querySelector(
            '[data-testid=\'profile-photo-invite-section-title\']',
          )?.textContent
        }'s Profile`
      },
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Browsing',
      buttons: () => [{ label: 'View Profile', url: href }],
    },
    {
      path: /^\/learn\/(?!.*\bhome\b).*\/$/,
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Learning',
      state: () => {
        return `Subject: ${document.title.substring(
          0,
          document.title.lastIndexOf(' ') - 1,
        )}`
      },

      details: () => {
        return href.split('/')[4]?.split('-').join(' ')
      },
      buttons: () => [
        {
          label: 'View Course',
          url: href.split('/').slice(0, 5).join('/'),
        },
      ],
    },
    {
      path: /^\/learn\/.*\/home\/week\/.*$/,
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Learning',
      state: () => {
        return href.split('/')[4]?.split('-').join(' ')
      },
      details: () => {
        return `Viewing : ${href
          .split('/')[6]
          ?.split('-')
          .join(' ')
          .toUpperCase()} ${href.split('/')[7]}'s content`
      },
      buttons: () => [
        {
          label: 'View Course',
          url: href.split('/').slice(0, 5).join('/'),
        },
      ],
    },
    {
      path: /^\/learn\/.*\/home\/(?!.*\bweek\b).*$/,
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Learning',
      state: () => {
        return `Viewing Course ${href.split('/')[6]?.split('-').join(' ')}`
      },
      details: () => {
        return href.split('/')[4]?.split('-').join(' ')
      },
      buttons: () => [
        {
          label: 'View Course',
          url: href.split('/').slice(0, 5).join('/'),
        },
      ],
    },
    {
      path: /^\/learn\/.*\/discussions$/,
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Learning',
      state: () => {
        return 'Reading Course Discussions Forums'
      },
      details: () => {
        return href.split('/')[4]?.split('-').join(' ')
      },
      buttons: () => [
        {
          label: 'View Course',
          url: href.split('/').slice(0, 5).join('/'),
        },
      ],
    },
    {
      path: /^\/learn\/.*\/resources\/.*$/,
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Learning',
      state: () => {
        return 'Viewing Course Resources'
      },
      details: () => {
        return href.split('/')[4]?.split('-').join(' ')
      },
      buttons: () => [
        {
          label: 'View Course',
          url: href.split('/').slice(0, 5).join('/'),
        },
      ],
    },
    {
      path: /^\/learn\/.*\/course-inbox$/,
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Learning',
      state: () => {
        return 'Checking Course Inbox'
      },
      details: () => {
        return href.split('/')[4]?.split('-').join(' ')
      },
      buttons: () => [
        {
          label: 'View Course',
          url: href.split('/').slice(0, 5).join('/'),
        },
      ],
    },

    {
      path: /^\/learn\/.+\/lecture\/*/,
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Learning',
      state: () => {
        return `Lecture: ${document.title.substring(
          0,
          document.title.lastIndexOf(' ') - 1,
        )}`
      },
      details: () => {
        return href.split('/')[4]?.split('-').join(' ')
      },
      buttons: () => [
        {
          label: 'View Course',
          url: href.split('/').slice(0, 5).join('/'),
        },
      ],
    },
    {
      path: /^\/learn\/.+\/quiz\/*/,
      smallImageKey: () => Assets.Writing,
      smallImageText: () => 'Learning',
      state: () => {
        return 'Taking a Quiz'
      },
      details: () => {
        return href.split('/')[4]?.split('-').join(' ')
      },
      buttons: () => [
        {
          label: 'View Course',
          url: href.split('/').slice(0, 5).join('/'),
        },
      ],
    },
    {
      path: /^\/learn\/.+\/exam\/*/,
      smallImageKey: () => Assets.Writing,
      smallImageText: () => 'Learning',
      state: () => {
        return 'Solving an Exam'
      },
      details: () => {
        return href.split('/')[4]?.split('-').join(' ')
      },
      buttons: () => [
        {
          label: 'View Course',
          url: href.split('/').slice(0, 5).join('/'),
        },
      ],
    },
    {
      path: /^\/learn\/.+\/ungraded*\/*/,
      smallImageKey: () => Assets.Writing,
      smallImageText: () => 'Learning',
      state: () => {
        return `Subject: ${document.title.substring(
          0,
          document.title.lastIndexOf(' ') - 1,
        )}`
      },
      details: () => {
        return href.split('/')[4]?.split('-').join(' ')
      },
      buttons: () => [
        {
          label: 'View Course',
          url: href.split('/').slice(0, 5).join('/'),
        },
      ],
    },

    {
      path: /^\/learn\/.*$/,
      smallImageKey: () => Assets.Viewing,
      smallImageText: () => 'Viewing',
      details: () => 'Viewing a Course',
      state: () => {
        return document.querySelector('[data-e2e=\'hero-title\']')?.textContent ?? undefined
      },
      buttons: () => [{ label: 'View Course', url: href }],
    },
    {
      path: /^\/specializations\/.+$/,
      smallImageKey: () => Assets.Viewing,
      smallImageText: () => 'Viewing',
      details: () => 'Viewing a Course',
      state: () => {
        return document.querySelector('[data-e2e=\'hero-title\']')?.textContent ?? undefined
      },
      buttons: () => [{ label: 'View Course', url: href }],
    },
    {
      path: /^\/search*/,
      smallImageKey: () => Assets.Search,
      smallImageText: () => 'Searching',
      details: () => {
        return `Searching for "${new URL(href).searchParams.get('query')}"`
      },

      state: () => {
        return `Found ${
          document
            .querySelector('[data-e2e=\'NumberOfResultsSection\']')
            ?.textContent
            ?.split(' ')[0]
        } results`
      },
      buttons: () => [{ label: 'View Results', url: href }],
    },
    {
      path: /^\/.*$/,
      details: () => {
        const currentUrl = href
        if (currentUrl.includes('my-learning'))
          return 'My Courses'
        else
          return currentUrl.split('/')[3]?.toUpperCase().split('-').join(' ')
      },
      smallImageKey: () => Assets.Reading,
      smallImageText: () => 'Browsing',
    },
  ]

  return routes.find(route => route.path.test(path))!
}

presence.on('UpdateData', async () => {
  const [showTimestamp, showButtons] = await Promise.all([
    presence.getSetting<boolean>(Settings.TIMESTAMP),
    presence.getSetting<boolean>(Settings.BUTTONS),
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
  if (route.largeImageKey)
    presenceData.largeImageKey = route.largeImageKey()
  if (route.smallImageKey)
    presenceData.smallImageKey = route.smallImageKey()
  if (route.smallImageText)
    presenceData.smallImageText = route.smallImageText()
  if (showTimestamp && route.endTimestamp)
    presenceData.endTimestamp = route.endTimestamp()

  presence.setActivity(presenceData)
})
