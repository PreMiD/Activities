const presence = new Presence({
  clientId: '825307070584586250',
})
const data: {
  isChecked: boolean
  service?: [string, string]
  settings?: {
    id: string
    delete?: boolean
    data: string[]
  }[]
} = {
  isChecked: false,
}

const assets: Record<string, string> = {
  naver: 'https://cdn.rcd.gg/PreMiD/websites/N/Naver/assets/0.png',
  naver_webtoon: 'https://cdn.rcd.gg/PreMiD/websites/N/Naver/assets/1.png',
  naver_series: 'https://cdn.rcd.gg/PreMiD/websites/N/Naver/assets/2.png',
  naver_tv: 'https://cdn.rcd.gg/PreMiD/websites/N/Naver/assets/3.png',
  naver_papago: 'https://cdn.rcd.gg/PreMiD/websites/N/Naver/assets/4.png',
  naver_blog: 'https://cdn.rcd.gg/PreMiD/websites/N/Naver/assets/5.png',
  naver_blog_browse: 'https://cdn.rcd.gg/PreMiD/websites/N/Naver/assets/6.png',
  naver_cafe: 'https://cdn.rcd.gg/PreMiD/websites/N/Naver/assets/7.png',
}

enum MainAssets {
  Browse = 'https://cdn.rcd.gg/PreMiD/websites/N/Naver/assets/8.png',
  Book = 'https://cdn.rcd.gg/PreMiD/websites/N/Naver/assets/9.png',
  Play = 'https://cdn.rcd.gg/PreMiD/websites/N/Naver/assets/10.png',
  Pause = 'https://cdn.rcd.gg/PreMiD/websites/N/Naver/assets/11.png',
  Language = 'https://cdn.rcd.gg/PreMiD/websites/N/Naver/assets/12.png',
}

function getServiceName(url = document.location.hostname): [string, string] | undefined {
  switch (true) {
    case !!url.match(/tv\.naver\.([a-z0-9]+)/):
      return ['Naver TV', 'NAVER_TV']
    case !!url.match(/comic\.naver\.([a-z0-9]+)/):
      return ['Naver Webtoon', 'NAVER_WEBTOON']
    case !!url.match(/papago\.naver\.([a-z0-9]+)/):
      return ['Papago', 'NAVER_PAPAGO']
    case !!url.match(/blog\.naver\.([a-z0-9]+)/):
      return ['Naver Blog', 'NAVER_BLOG']
    case !!url.match(/cafe\.naver\.([a-z0-9]+)/):
      return ['Naver Cafe', 'NAVER_CAFE']
    case !!url.match(/(novel|series)\.naver\.([a-z0-9]+)/):
      return ['Naver Series', 'NAVER_SERIES']
    case !!url.match(/([a-z]+)\.naver\.([a-z0-9]+)/):
      return ['Naver', 'NAVER']
    default:
      break
  }
  return undefined
}

let blog: string, cafeTitle: string | undefined

presence.on('iFrameData', (data: unknown) => {
  ({ blog } = data as { blog: string })
})

presence.on('UpdateData', async () => {
  if (!data.isChecked) {
    data.service = getServiceName()
    data.isChecked = true
  }

  const presenceData: PresenceData = {
    name: data.service?.[0],
    details: 'Browsing...',
    largeImageKey: assets[data.service?.[1].toLowerCase() ?? ''],
    smallImageKey: assets[`${data.service?.[1].toLowerCase()}_browse`] ?? MainAssets.Browse,
  }
  const { pathname, href } = document.location

  data.settings = [
    {
      id: 'buttons',
      delete: true,
      data: ['buttons'],
    },
  ]

  switch (data.service?.[1]) {
    case 'NAVER_TV': {
      if (pathname.match('/v/([0-9]+)')) {
        if (
          document.querySelector<HTMLElement>('div.ad_info_area')?.offsetParent
        ) {
          const video = document.querySelector<HTMLVideoElement>(
            '[data-role="videoEl"]',
          )!
          presenceData.details = 'Currently watching an ad';
          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
          presenceData.smallImageKey = MainAssets.Play
          presenceData.smallImageText = 'Playing'

          if (video.paused) {
            presenceData.smallImageKey = MainAssets.Pause
            presenceData.smallImageText = 'Paused'
            delete presenceData.startTimestamp
            delete presenceData.endTimestamp
          }
        }
        else {
          const video = document.querySelector('video')!

          presenceData.details = document.querySelector(
            'h2[class^=ArticleSection_article_title_]',
          )?.textContent
          presenceData.state = document
            .querySelector('strong[class^=ArticleSection_channel_title_]')
            ?.textContent
            ?.trim();

          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
          presenceData.smallImageKey = MainAssets.Play
          presenceData.smallImageText = 'Playing'

          if (video.paused) {
            presenceData.smallImageKey = MainAssets.Pause
            presenceData.smallImageText = 'Paused'
            delete presenceData.startTimestamp
            delete presenceData.endTimestamp
          }

          presenceData.buttons = [
            {
              url: href,
              label: 'Watch Video',
            },
            {
              url: document.querySelector<HTMLAnchorElement>(
                'a[class^=ArticleSection_link_channel_]',
              )!.href,
              label: 'View Channel',
            },
          ]
        }
      }
      else if (document.querySelector('div[class^=showId_container]')) {
        presenceData.details = 'Viewing channel:'
        presenceData.state = document.querySelector('h2')?.textContent
        presenceData.buttons = [
          {
            url: href,
            label: 'View Channel',
          },
        ]
      }
      break
    }
    case 'NAVER_BLOG': {
      if (pathname.match('/([a-z])')) {
        presenceData.details = 'Reading a blog post:'
        presenceData.state = blog

        presenceData.buttons = [
          {
            url: href,
            label: 'Read Blog',
          },
        ]
      }
      break
    }
    case 'NAVER_CAFE': {
      if (pathname.match('/([a-z])')) {
        cafeTitle ??= document.querySelector('h1.d-none')?.textContent ?? undefined
        if (cafeTitle) {
          presenceData.details = 'Viewing cafe:'
          presenceData.state = cafeTitle

          presenceData.buttons = [
            {
              label: 'View Cafe',
              url: href,
            },
          ]
        }
        else if (pathname.includes('/search/')) {
          presenceData.details = 'Searching for something'
        }
      }
      break
    }
    case 'NAVER_SERIES': {
      if (pathname.startsWith('/novel')) {
        if (pathname.includes('detail.series')) {
          presenceData.details = 'Viewing novel:'
          presenceData.state = document.querySelector('#content h2')
          presenceData.buttons = [{ url: href, label: 'View Novel' }]
        }
      }
      else if (pathname.startsWith('/webnovel')) {
        if (pathname.includes('/list')) {
          presenceData.details = 'Viewing web novel:'
          presenceData.state = document.querySelector('h2.title')
          presenceData.buttons = [{ url: href, label: 'View Novel' }]
        }
        else if (pathname.includes('/detail')) {
          presenceData.details = document.querySelector(
            '#menuFloatingLayer > a',
          )?.textContent
          presenceData.state = document.querySelector('#topVolumeList')?.textContent
          presenceData.buttons = [{ url: href, label: 'Read Epiosde' }]
          presenceData.smallImageKey = MainAssets.Book
        }
      }
      break
    }
    case 'NAVER_WEBTOON': {
      if (pathname.startsWith('/webtoon/list')) {
        presenceData.details = 'Viewing webtoon:'
        presenceData.state = document.querySelector(
          'h2[class^=EpisodeListInfo__title]',
        )
        presenceData.buttons = [{ url: href, label: 'View Webtoon' }]
      }
      else if (pathname.startsWith('/webtoon/detail')) {
        const [title, ep] = document
          .querySelector<HTMLMetaElement>('[property="og:title"]')
          ?.content
          .split(' - ') ?? []
        presenceData.details = ep
        presenceData.state = title
        presenceData.buttons = [{ url: href, label: 'Read Episode' }]
        presenceData.smallImageKey = MainAssets.Book
      }
      break
    }
    case 'NAVER_PAPAGO': {
      if (pathname.startsWith('/website')) {
        presenceData.details = 'Translating a website'
        presenceData.smallImageKey = MainAssets.Language
      }
      else if (pathname.startsWith('/docs')) {
        presenceData.details = 'Translating a document'
        presenceData.smallImageKey = MainAssets.Language
      }
      else if (pathname === '/') {
        presenceData.details = 'Translating something...'
        presenceData.smallImageKey = MainAssets.Language
      }
      break
    }
    case 'NAVER': {
      if (pathname === '/search.naver')
        presenceData.details = 'Searching for something'

      break
    }
  }

  if (data.settings) {
    for (const setting of data.settings) {
      if (!(await presence.getSetting<boolean>(setting.id)) && setting.delete) {
        for (const x of setting.data) delete presenceData[<'state'>x]
      }
    }
  }

  presence.setActivity(presenceData)
})
