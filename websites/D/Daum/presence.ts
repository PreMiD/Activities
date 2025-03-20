import { Assets } from 'premid'

class DaumPresence extends Presence {
  constructor(presenceOptions: PresenceOptions) {
    super(presenceOptions)
  }

  get serviceName() {
    const url = document.location.hostname

    switch (true) {
      case !!url.match(/movie(\.v)?\.daum\.([a-z0-9]+)/):
        return 'DAUM_MOVIE'
      case !!url.match(/news(\.v)?\.daum\.([a-z0-9]+)/):
        return 'DAUM_NEWS'
      case !!url.match(/sports(\.v)?\.daum\.([a-z0-9]+)/):
        return 'DAUM_SPORTS'
      case !!url.match(/entertain(\.v)?\.daum\.([a-z0-9]+)/):
        return 'DAUM_ENTERTAIN'
      case !!url.match(/blog(\.v)?\.daum\.([a-z0-9]+)/):
        return 'DAUM_BLOG'
      case !!url.match(/auto(\.v)?\.daum\.([a-z0-9]+)/):
        return 'DAUM_AUTO'
      case !!url.match(/mail(\.v)?\.daum\.([a-z0-9]+)/):
        return 'DAUM_MAIL'
      case !!url.match(/(top\.)?cafe(\.v)?\.daum\.([a-z0-9]+)/):
        return 'DAUM_CAFE'
      case !!url.match(/([a-z]+)(\.v)?\.daum\.([a-z0-9]+)/):
        return 'DAUM'
      default:
        break
    }
  }

  get isReadingArticle() {
    return !!document.location.hostname.match(
      /([a-z]+)(\.v)\.daum\.([a-z0-9]+)/,
    )
  }
}

const presence = new DaumPresence({
  clientId: '829266476875120650',
})
const data: {
  settings?: {
    id: string
    delete?: boolean
    data: string[]
  }[]
  presence?: {
    [key: string]: {
      service:
        | 'DAUM'
        | 'DAUM_MOVIE'
        | 'DAUM_AUTO'
        | 'DAUM_NEWS'
        | 'DAUM_SPORTS'
        | 'DAUM_BLOG'
        | 'DAUM_MAIL'
        | 'DAUM_ENTERTAIN'
        | 'DAUM_CAFE'
        | 'ANY'
      href?: boolean
      hash?: boolean
      article?: boolean
      setPresenceData?: () => void
    }
  }
} = {
  presence: undefined,
}
const startTime = Math.floor(Date.now() / 1000)

let video: {
    duration: number
    currentTime: number
    paused: boolean
    title?: string
  },
  cafe: {
    name: string
    title: string
    article: string
  }

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/D/Daum/assets/logo.png',
  DaumMail = 'https://cdn.rcd.gg/PreMiD/websites/D/Daum/assets/0.png',
  DaumCafe = 'https://cdn.rcd.gg/PreMiD/websites/D/Daum/assets/1.png',
}

presence.on(
  'iFrameData',
  (inc: unknown) => {
    const data = inc as { video?: typeof video, cafe?: typeof cafe }
    if (data.video)
      ({ video } = data)
    if (data.cafe)
      ({ cafe } = data)
  },
)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: startTime,
  }

  switch (presence.serviceName) {
    case 'DAUM_MAIL':
      presenceData.largeImageKey = ActivityAssets.DaumMail
      break

    case 'DAUM_CAFE':
      presenceData.largeImageKey = ActivityAssets.DaumCafe
      break

    default:
      break
  }

  data.presence = {
    '/v/([0-9a-zA-Z]+)': {
      service: 'ANY',
      article: true,
      setPresenceData() {
        presenceData.details = 'Reading article:'
        presenceData.state = document.querySelector('h3.tit_view')?.textContent

        presenceData.buttons = [
          {
            url: document.URL,
            label: 'Read Article',
          },
        ]

        if (video) {
          presenceData.details = 'Watching video:'
          presenceData.state = video.title ?? document.querySelector('h3.tit_view')?.textContent

          presenceData.smallImageKey = video.paused
            ? Assets.Pause
            : Assets.Play
          presenceData.smallImageText = video.paused ? 'Paused' : 'Playing';

          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video.currentTime, video.duration)

          presenceData.buttons = [
            {
              label: 'Watch Video',
              url: document.URL,
            },
          ]

          if (video.paused) {
            delete presenceData.startTimestamp
            delete presenceData.endTimestamp
          }
        }
      },
    },
    '/([a-zA-Z0-9]+)/([a-zA-Z0-9]+)': {
      service: 'DAUM_BLOG',
      setPresenceData() {
        presenceData.details = 'Reading blog:'
        presenceData.state = document.querySelector('a.link-title')?.textContent

        presenceData.buttons = [
          {
            label: 'Read Blog',
            url: document.URL,
          },
        ]
      },
    },
    'vod/view/([0-9a-zA-Z]+)': {
      service: 'DAUM_AUTO',
      setPresenceData() {
        presenceData.details = 'Watching video:'
        presenceData.state = document.querySelector('strong.tit_vod')?.textContent

        presenceData.smallImageKey = video?.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video?.paused ? 'Paused' : 'Playing';

        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video?.currentTime, video?.duration)

        presenceData.buttons = [
          {
            label: 'Watch Video',
            url: document.URL,
          },
        ]

        if (video?.paused) {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
      },
    },
    '/newcar/model/([0-9a-zA-Z]+)': {
      service: 'DAUM_AUTO',
      setPresenceData() {
        presenceData.details = 'Viewing car:'
        presenceData.state = document.querySelector('h3.tit_model')?.textContent

        presenceData.buttons = [
          {
            label: 'View Car',
            url: document.URL,
          },
        ]
      },
    },
    '/moviedb/': {
      service: 'DAUM_MOVIE',
      setPresenceData() {
        presenceData.details = 'Viewing movie:'
        presenceData.state = document.querySelector('span.txt_tit')?.textContent

        presenceData.buttons = [
          {
            label: 'View Movie',
            url: document.URL,
          },
        ]
      },
    },
    '/person/': {
      service: 'DAUM_MOVIE',
      setPresenceData() {
        presenceData.details = 'Viewing actor:'
        presenceData.state = document.querySelector('span.txt_tit')?.textContent

        presenceData.buttons = [
          {
            label: 'View Actor',
            url: document.URL,
          },
        ]
      },
    },
    '/moviedb/contents': {
      service: 'DAUM_MOVIE',
      setPresenceData() {
        if (video) {
          presenceData.details = 'Watching video:'
          presenceData.state = document.querySelector('strong.tit_player')?.textContent

          presenceData.smallImageKey = video.paused
            ? Assets.Pause
            : Assets.Play
          presenceData.smallImageText = video.paused ? 'Paused' : 'Playing';

          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video.currentTime, video.duration)

          presenceData.buttons = [
            {
              label: 'Watch Video',
              url: document.URL,
            },
          ]

          if (video.paused) {
            delete presenceData.startTimestamp
            delete presenceData.endTimestamp
          }
        }
      },
    },
    '/video/([0-9a-zA-Z]+)': {
      service: 'DAUM_SPORTS',
      setPresenceData() {
        presenceData.details = 'Watching video:'
        presenceData.state = document.querySelector('strong.tit_vod')?.textContent

        presenceData.smallImageKey = video?.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video?.paused ? 'Paused' : 'Playing';

        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video?.currentTime, video?.duration)

        presenceData.buttons = [
          {
            label: 'Watch Video',
            url: document.URL,
          },
        ]

        if (video?.paused) {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
      },
    },
    '/tv/([0-9]+)/video/([0-9]+)': {
      service: 'DAUM_ENTERTAIN',
      setPresenceData() {
        presenceData.details = video?.title
          ?? document.querySelector('span.inner_tit2')?.textContent
        presenceData.state = document
          .querySelector('a.link_txt')
          ?.textContent
          ?.trim()

        presenceData.smallImageKey = video?.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video?.paused ? 'Paused' : 'Playing';

        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video?.currentTime, video?.duration)

        presenceData.buttons = [
          {
            label: 'Watch Video',
            url: document.URL,
          },
          {
            label: 'View Channel',
            url: document.querySelector<HTMLAnchorElement>('a.link_txt')!.href,
          },
        ]

        if (video?.paused) {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
      },
    },
    '#INBOX': {
      service: 'DAUM_MAIL',
      hash: true,
      setPresenceData() {
        presenceData.details = 'Viewing Inbox'
      },
    },
    '#INBOX/': {
      service: 'DAUM_MAIL',
      hash: true,
      setPresenceData() {
        presenceData.details = 'Reading mail'
      },
    },
    '#MINE': {
      service: 'DAUM_MAIL',
      hash: true,
      setPresenceData() {
        presenceData.details = 'Viewing Inbox'
      },
    },
    '#DRAFT': {
      service: 'DAUM_MAIL',
      hash: true,
      setPresenceData() {
        presenceData.details = 'Viewing drafts'
      },
    },
    '#SENT': {
      service: 'DAUM_MAIL',
      hash: true,
      setPresenceData() {
        presenceData.details = 'Viewing sent'
      },
    },
    '#TRASH': {
      service: 'DAUM_MAIL',
      hash: true,
      setPresenceData() {
        presenceData.details = 'Viewing trash'
      },
    },
    '#SPAM': {
      service: 'DAUM_MAIL',
      hash: true,
      setPresenceData() {
        presenceData.details = 'Viewing spam'
      },
    },
    '#ALL': {
      service: 'DAUM_MAIL',
      hash: true,
      setPresenceData() {
        presenceData.details = 'Viewing all mail'
      },
    },
    '#UNREAD': {
      service: 'DAUM_MAIL',
      hash: true,
      setPresenceData() {
        presenceData.details = 'Viewing unread mail'
      },
    },
    '#setting': {
      service: 'DAUM_MAIL',
      hash: true,
      setPresenceData() {
        presenceData.details = 'Viewing thier settings'
      },
    },
    '\\?composer': {
      service: 'DAUM_MAIL',
      href: true,
      setPresenceData() {
        presenceData.details = 'Composing a new mail'
      },
    },
    '/([a-zA-Z0-9]+)': {
      service: 'DAUM_CAFE',
      setPresenceData() {
        presenceData.details = 'Viewing cafe:'
        presenceData.state = cafe.name ?? 'Unknown'

        presenceData.buttons = [
          {
            label: 'View Cafe',
            url: document.URL,
          },
        ]
      },
    },
    '/([0-9a-zA-Z]+)/([0-9A-Za-z]+)': {
      service: 'DAUM_CAFE',
      setPresenceData() {
        presenceData.details = 'Viewing page:'
        presenceData.state = `${cafe.title ?? 'Unknown'} • ${
          cafe.name ?? 'Unknown'
        }`

        presenceData.buttons = [
          {
            label: 'View Page',
            url: document.URL,
          },
        ]
      },
    },
    '/([a-zA-Z0-9]+)/([a-zA-Z0-9]+)/([a-zA-Z0-9]+)': {
      service: 'DAUM_CAFE',
      setPresenceData() {
        presenceData.details = 'Reading article:'
        presenceData.state = `${cafe.article ?? 'Unknown'} • ${
          cafe.name ?? 'Unknown'
        }`

        presenceData.buttons = [
          {
            label: 'Read Article',
            url: document.URL,
          },
        ]
      },
    },
  }

  data.settings = [
    {
      id: 'timestamp',
      delete: true,
      data: ['startTimestamp', 'endTimestamp'],
    },
    {
      id: 'buttons',
      delete: true,
      data: ['buttons'],
    },
  ]

  for (const [pathname, PData] of Object.entries(data.presence)) {
    if (
      (document.location.pathname.match(pathname)
        || (PData.hash && document.location.hash.match(pathname))
        || (PData.href && document.location.href.match(pathname)))
      && (PData.service === presence.serviceName || PData.service === 'ANY')
    ) {
      if (PData.article && PData.article === presence.isReadingArticle)
        PData.setPresenceData?.()
      else if (!PData.article)
        PData.setPresenceData?.()
    }
  }

  for (const setting of data.settings) {
    const settingValue = await presence.getSetting<boolean>(setting.id)

    if (!settingValue && setting.delete) {
      for (const PData of setting.data)
        delete presenceData[PData as keyof PresenceData]
    }
  }

  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})
