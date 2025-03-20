import { Assets } from 'premid'

const presence = new Presence({
  clientId: '840169707297832970',
})
const data: {
  startedSince?: number
  settings?: {
    id?: string
    delete?: boolean
    uses?: (keyof PresenceData)[]
  }[]
  presence: {
    [key: string]: {
      disabled?: boolean
      setPresenceData?: () => void
    }
  }
} = {
  presence: {},
  startedSince: ~~(Date.now() / 1000),
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/E/Everskies/assets/logo.png',
    smallImageKey: Assets.Search,
    startTimestamp: data.startedSince,
  }

  data.presence = {
    '/community': {
      setPresenceData() {
        presenceData.details = 'Browsing forums...'
      },
    },
    '/community/forums/': {
      setPresenceData() {
        presenceData.details = 'Browsing forums:'
        presenceData.state = document.querySelector(
          'span.ng-star-inserted',
        )?.textContent
      },
    },
    '/community/forums/([a-z]+)/([a-z0-9]+)': {
      setPresenceData() {
        presenceData.details = 'Viewing forum:'
        presenceData.state = document
          .querySelector('body > app-root > div > x-discussion-view > div > h2')
          ?.textContent
          ?.trim()

        presenceData.buttons = [
          {
            label: 'View Forum',
            url: document.URL,
          },
        ]
      },
    },
    '/chatroom': {
      setPresenceData() {
        const roomTitle = document.querySelector(
          'div > div.current.pad-4.ng-tns-c221-371.ng-star-inserted > div.room-name.ng-tns-c221-371',
        )?.textContent

        presenceData.details = 'Browsing chat rooms...'

        if (roomTitle) {
          presenceData.details = 'In chat room:'
          presenceData.state = roomTitle
        }
      },
    },
    '/club': {
      setPresenceData() {
        presenceData.details = 'Browsing clubs...'
      },
    },
    '/club/([a-z0-9-])': {
      setPresenceData() {
        presenceData.details = 'Viewing club:'
        presenceData.state = document.querySelector(
          'span.ng-tns-c123-778',
        )?.textContent

        presenceData.buttons = [
          {
            label: 'View Club',
            url: document.URL,
          },
        ]
      },
    },
    '/users': {
      setPresenceData() {
        const searchParams = new URLSearchParams(document.location.search)
        presenceData.details = 'Browsing users...'

        if (document.location.search.startsWith('?')) {
          presenceData.details = searchParams.get('friends')
            ? 'Viewing their friends'
            : 'Searching for user:'
          if (searchParams.get('q'))
            presenceData.state = searchParams.get('q')
        }
      },
    },
    '/user/([a-zA-Z0-9-]+)': {
      setPresenceData() {
        presenceData.details = 'Viewing user:'
        presenceData.state = document.querySelector('x-user-name > div')?.textContent

        presenceData.buttons = [
          {
            label: 'View User',
            url: document.URL,
          },
        ]
      },
    },
    '/competitions': {
      setPresenceData() {
        presenceData.details = 'Browsing competitions...'
      },
    },
    '/shop/([a-z-]+)': {
      setPresenceData() {
        presenceData.details = 'Looking at:'
        presenceData.state = `Shop • ${document
          .querySelector(
            'div.box-title-tab.bt.br.bl.nowrap.b5.bg5.color5.ng-star-inserted',
          )
          ?.textContent
          ?.trim()}`

        presenceData.buttons = [
          {
            label: 'View Shop',
            url: document.URL,
          },
        ]
      },
    },
    '/games': {
      setPresenceData() {
        presenceData.details = 'Browsing games...'
      },
    },
    '/games/': {
      setPresenceData() {
        presenceData.details = 'Playing a game:'
        presenceData.state = document.querySelector('div.box-title')?.textContent

        presenceData.buttons = [
          {
            label: 'Play Game',
            url: document.URL,
          },
        ]
      },
    },
    '/wardrobe': {
      setPresenceData() {
        presenceData.details = 'Looking at:'
        presenceData.state = document.querySelector('div.box-title')?.textContent
      },
    },
    '/magazine': {
      setPresenceData() {
        presenceData.details = 'Viewing their magazines'
      },
    },
    '/profile/': {
      setPresenceData() {
        presenceData.details = 'Viewing their'
        presenceData.state = `Prfile • ${
          document.querySelector('div.box-title')?.textContent
        }`
      },
    },
    '/page/([a-z-])': {
      setPresenceData() {
        presenceData.details = 'Viewing page:'
        presenceData.state = document.querySelector('div.box-title')?.textContent
      },
    },
  }

  data.settings = [
    {
      id: 'timestamp',
      delete: true,
      uses: ['startTimestamp', 'endTimestamp'],
    },
    {
      id: 'buttons',
      delete: true,
      uses: ['buttons'],
    },
  ]

  for (const [k, v] of Object.entries(data.presence)) {
    if (document.location.pathname.match(k) && !v.disabled)
      v.setPresenceData?.()
  }

  for (const setting of data.settings) {
    const settingValue = await presence
      .getSetting<boolean>(setting.id ?? '')
      .catch(() => null)

    if (!settingValue && setting.delete) {
      for (const PData of setting.uses ?? [])
        delete presenceData[PData as keyof PresenceData]
    }
  }

  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})
