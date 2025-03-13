import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1051110545723506718',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/I/India%20Today%20News/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      home: 'general.viewHome',
      search: 'general.searchFor',
      browse: 'general.browsing',
      watchingLive: 'general.watchingLive',
      live: 'general.live',
      watchingVid: 'general.watchingVid',
      buttonViewPage: 'general.buttonViewPage',
      buttonWatchVideo: 'general.buttonWatchVideo',
      buttonReadArticle: 'general.buttonReadArticle',
    },

  )
}

function capitaliseFirstLetter(string: string) {
  return (
    string.trim().charAt(0).toUpperCase() + string.trim().slice(1).toLowerCase()
  )
}

let video = {
  duration: 0,
  currentTime: 0,
  paused: true,
}
let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on(
  'iFrameData',
  (data: { duration: number, currentTime: number, paused: boolean }) => {
    video = data
  },
)

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'Unsupported page',
  }

  const { href, pathname } = document.location
  const [showTimestamp, showButtons, showAuthor, newLang, privacy] = await Promise.all([
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('author'),
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
  ])

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  if (privacy) {
    presenceData.details = strings.browse
    presence.setActivity(presenceData)
    return
  }
  const pages: Record<string, PresenceData> = {
    '/photo': {
      details: 'Viewing Photographical news',
      buttons: [
        {
          label: strings.buttonViewPage,
          url: href,
        },
      ],
    },
    '/data-intelligence-unit': {
      details: 'Viewing DIU news',
      buttons: [
        {
          label: strings.buttonViewPage,
          url: href,
        },
      ],
    },
    '/news.html': {
      details: 'Viewing news',
      buttons: [
        {
          label: strings.buttonViewPage,
          url: href,
        },
      ],
    },
  }
  const authorTitle = document
    .querySelector('div.Story_story__author__cJoes')
    ?.querySelector('a.jsx-99cc083358cc2e2d')
    ?.textContent
  const multipleAuthors = document.querySelector('div.Story_authors__OqkJZ')
  const topic = document
    .querySelector('[class="jsx-559305e56e2f7896 active"]')
    ?.textContent
    ?.toLowerCase()
    .trim()

  for (const [path, data] of Object.entries(pages)) {
    if (pathname.includes(path))
      presenceData = { ...presenceData, ...data } as PresenceData
  }

  if (pathname === '/') {
    presenceData.details = strings.home
  }
  else if (pathname.includes('/search/')) {
    presenceData.details = strings.search
    presenceData.state = pathname.split('/search/')[1]
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Searching'
  }
  else if (topic && pathname.includes(`/${topic}`)) {
    presenceData.details = `Viewing ${capitaliseFirstLetter(topic)} news`
    presenceData.buttons = [
      {
        label: strings.buttonViewPage,
        url: href,
      },
    ]
  }
  else if (pathname.includes('/photo')) {
    presenceData.details = document.querySelector(
      'h1.Photo_maintitle__G_cdj',
    )?.textContent
    presenceData.state = `Total of ${
      document.querySelector('span.typedata')?.textContent?.split('/')[1]
    } photos`
    presenceData.largeImageKey = document
      .querySelector('div.PhotoCard_card__pic__axT6x')
      ?.querySelector('img')
      ?.src
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.smallImageText = 'India Today News - Photos'
    presenceData.buttons = [
      {
        label: strings.buttonReadArticle,
        url: href,
      },
    ]

    if (pathname.includes('s') && !pathname.includes('/photo/')) {
      presenceData.details = `Viewing ${pathname
        .split('/photos')[0]
        ?.replace('/', '')
        ?.split('/')[1]
        ?.toUpperCase()} Photo Gallery`
      presenceData.largeImageKey = ActivityAssets.Logo
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'India Today News - Photo Gallery'
      presenceData.buttons = [
        {
          label: 'View Photo Gallery',
          url: href,
        },
      ]
      delete presenceData.state
    }
  }
  else if (!Number.isNaN(video.duration) && pathname.includes('/video')) {
    const [startTimestamp, endTimestamp] = presence.getTimestamps(
      Math.floor(video.currentTime),
      Math.floor(video.duration),
    )
    presenceData.details = strings.watchingVid
    presenceData.state = document.querySelector(
      'h1.Videoplayer_title__3Vk_I',
    )?.textContent
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused ? strings.pause : strings.play
    presenceData.buttons = [
      {
        label: strings.buttonWatchVideo,
        url: href,
      },
    ]

    if (showTimestamp) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = [
        startTimestamp,
        endTimestamp,
      ]
    }

    if (video.paused)
      delete presenceData.endTimestamp

    if (pathname.includes('s') && !pathname.includes('/video/')) {
      presenceData.details = `Viewing ${pathname
        .split('/videos')[0]
        ?.replace('/', '')
        ?.split('/')[1]
        ?.toUpperCase()} Videos`
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'India Today News - Videos'
      presenceData.buttons = [
        {
          label: 'View Videos',
          url: href,
        },
      ]
    }
  }
  else if (pathname.includes('/weather/')) {
    const weather = document
      .querySelector('div.wtr_ttl_lhs')
      ?.querySelector('h1')
      ?.textContent
      ?.split('Today')
    presenceData.details = weather?.[0]?.trim()
    presenceData.state = weather?.[1]?.trim()
    presenceData.smallImageKey = document
      .querySelector('span.wkl_li_icn')
      ?.querySelector('img')
      ?.src
    presenceData.smallImageText = `${document
      .querySelector('span.wtr_tmp_txt')
      ?.textContent
      ?.trim()} - ${document
      .querySelector('div.wtr_tmp_rhs')
      ?.querySelector('strong')
      ?.textContent
      ?.trim()}°C`
    presenceData.buttons = [
      {
        label: 'View Weather',
        url: href,
      },
    ]
  }
  else if (pathname.includes('/story')) {
    const liveBlog = document.querySelector('h1.LiveBlog_blogtitile__WB5Az')
    presenceData.details = document.querySelector(
      'h1.Story_strytitle__MYXmR',
    )?.textContent
    presenceData.state = document.querySelector('span.strydate')?.textContent
    presenceData.largeImageKey = document
      .querySelector('div.Story_associate__image__bYOH_')
      ?.querySelector('img')
      ?.src
    presenceData.smallImageKey = document
      .querySelector('a.jsx-99cc083358cc2e2d')
      ?.querySelector('img')
      ?.src
    presenceData.smallImageText = authorTitle
    if (liveBlog) {
      presenceData.details = liveBlog.textContent
      presenceData.state = document.querySelector('span.catdate')?.textContent
      presenceData.largeImageKey = document
        .querySelector('div.LiveBlog_blogmos__UcOVK > img')
        ?.getAttribute('src')
      presenceData.smallImageKey = document
        .querySelector('div.Byline_profile__pic__ijD9v > a > img')
        ?.getAttribute('src')
      presenceData.smallImageText = document.querySelector(
        'div.Byline_category__author__UEnOW > a',
      )?.textContent
    }
    presenceData.buttons = [
      {
        label: strings.buttonReadArticle,
        url: href,
      },
    ]

    if (pathname.includes('/india/story'))
      presenceData.largeImageKey = ActivityAssets.Logo

    if (multipleAuthors) {
      presenceData.smallImageKey = ActivityAssets.Logo
      presenceData.smallImageText = 'Multiple Authors'
    }
  }
  else if (video && !Number.isNaN(video.duration) && pathname.includes('livetv')) {
    presenceData.details = strings.watchingLive
    presenceData.state = document
      .querySelector('h1.Livetv_titlewithicon__Z2jnL')
      ?.textContent
      ?.toUpperCase()
      ?.replace('LIVE TV', '')
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Live
    presenceData.smallImageText = video.paused ? strings.pause : strings.live
    presenceData.buttons = [
      {
        label: 'Watch Live TV',
        url: href,
      },
    ]
  }

  if (!showButtons && presenceData.buttons)
    delete presenceData.buttons
  if (
    (showTimestamp && !presenceData.startTimestamp)
    || !presenceData.endTimestamp
  ) {
    presenceData.startTimestamp = browsingTimestamp
  }
  if (showAuthor) {
    if (pathname.includes('/story')) {
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Reading article'
    }
  }
  else if (pathname.includes('/story') && !multipleAuthors) {
    presenceData.buttons?.push({
      label: 'View Author',
      url: document
        .querySelector('div.Story_story__author__cJoes')
        ?.querySelector('a.jsx-99cc083358cc2e2d')
        ?.getAttribute('href') ?? '',
    })
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
