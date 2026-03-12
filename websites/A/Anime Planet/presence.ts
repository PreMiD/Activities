import { Assets } from 'premid'

const presence = new Presence({
  clientId: '818135576074387507',
})
async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      browse: 'general.browsing',
      viewPage: 'general.viewPage',
      viewEpisode: 'general.buttonViewEpisode',
      viewSeries: 'general.buttonViewSeries',
      viewAnime: 'general.viewAnime',
      chapter: 'general.chapter',
      readingAricle: 'general.readingArticle',
      reading: 'general.reading',
      viewProfile: 'general.viewProfile',
      anime: 'general.anime',
      searchFor: 'general.searchFor',
      viewManga: 'general.viewManga',
      buttonViewProfile: 'general.buttonViewProfile',
    },

  )
}
const startsTime = Math.floor(Date.now() / 1000)

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null
let playback: boolean
let duration: number
let currentTime: number
let paused: boolean

presence.on('iFrameData', (data: unknown) => {
  const data2 = data as IFrameData
  playback = !!data2.iframeVideo?.duration

  if (playback)
    ({ duration, currentTime, paused } = data2.iframeVideo)
})

presence.on('UpdateData', async () => {
  const [
    newLang,
    AnimeDetails,
    AnimeState,
    MangaDetails,
    MangaState,
    timestamp,
    buttons,
  ] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<string>('AnimeDetails'),
    presence.getSetting<string>('AnimeState'),
    presence.getSetting<string>('MangaDetails'),
    presence.getSetting<string>('MangaState'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('buttons'),
  ])

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  let presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/Anime%20Planet/assets/logo.jpg',
    details: strings.browse,
    smallImageKey: Assets.Reading,
    startTimestamp: startsTime,
  }

  const path = document.location.pathname
  const content = {
    title: (
      document.querySelector('h2>a')
      || document.querySelector('h1>a')
      || document.querySelector('h1')
    )?.textContent?.trim(),
    episode: {
      title: '' as string | undefined,
      ep: '' as string | undefined,
    },
    titleAndEpisode: document
      .querySelector('h2.sub')
      ?.textContent
      ?.replace(
        document.querySelector('h2.sub > a')?.textContent ?? '',
        '',
      )
      .trim()
      .split('-'),
  }
  const animePlanetPages: {
    [key: string]: PresenceData
  } = {
    '/characters/(top-hated|all|top-loved)': {
      details: strings.viewPage,
      state: content.title,
    },
    '/characters/tags': {
      details: strings.viewPage,
      state: 'Characters',
    },
    '/characters/': {
      details: 'Viewing character:',
      state: `${content.title} • ${
        document.querySelector('table > tbody > tr > td')?.textContent
      }`,
      buttons: [
        {
          label: 'View Character',
          url: document.baseURI,
        },
      ],
    },
    '/forum/forums/': {
      details: 'Reading forum:',
      state: content.title,
      buttons: [
        {
          label: 'Read Forum',
          url: document.baseURI,
        },
      ],
    },
    '/forum/threads/': {
      details: 'Reading thread:',
      state: content.title,
      buttons: [
        {
          label: 'Read Thread',
          url: document.baseURI,
        },
      ],
    },
    '/forum/': {
      details: strings.viewPage,
      state: 'Forums',
    },
    '/challenges/': {
      details: 'Viewing challenge:',
      state: content.title,
    },
    '/community/': {
      details: strings.viewPage,
      state: `Community • ${content.title}`,
    },
    'reviews.php': {
      details: strings.viewPage,
      state: `${content.title} • ${
        location.search.endsWith('anime') ? 'Anime' : 'Manga'
      }`,
    },
    '/users/': {
      details: strings.viewProfile,
      state: document.querySelector('h1')?.textContent?.trim(),
      smallImageText: document.querySelector('p:nth-child(2) > a')?.textContent,
      buttons: [
        {
          label: strings.buttonViewProfile,
          url: document.baseURI,
        },
      ],
    },
    '/studios/': {
      details: 'Viewing studio:',
      state: content.title,
    },
    '/manga/(read-online|recommendations|light-novels|top-manga|all|magazines)': {
      details: strings.viewPage,
      state: content.title,
    },
    '/manga/tags/': {
      details: 'Manga | Viewing tag:',
      state: content.title,
    },
    '/manga/': {
      details: strings.viewManga,
      state: content.title,
    },
    '/anime/(watch-online|top-anime|seasons|all|recommendations)': {
      details: strings.viewPage,
      state: content.title,
    },
    '/anime/tags/': {
      details: 'Anime | Viewing tag:',
      state: content.title,
    },
    '/anime/': {
      details: strings.viewAnime,
      state: content.title,
    },
    '/login': {
      details: strings.viewPage,
      state: 'The login page',
    },
    '/sign-up': {
      details: strings.viewPage,
      state: 'The sign up page',
    },
  }

  for (const [key, value] of Object.entries(animePlanetPages)) {
    if (path.match(key)) {
      presenceData = { ...presenceData, ...value }
      break
    }
  }

  if (path.includes('/videos/')) {
    if (content.titleAndEpisode && content.titleAndEpisode.length > 1) {
      content.episode.title = document
        .querySelector('h2.sub')
        ?.textContent
        ?.replace(
          document.querySelector('h2.sub > a')?.textContent ?? '',
          '',
        )
        ?.trim()
        ?.split('-')
        ?.slice(1)
        ?.join('')
        ?.trim()
    }

    content.episode.ep = document
      .querySelector('h2.sub')
      ?.textContent
      ?.replace(document.querySelector('h2.sub > a')?.textContent ?? '', '')
      ?.trim()
      ?.split(/-/)[0]
      ?.match(/[1-9]?\d{0,2}.?[1-9]?\d/)?.[0]
      ?.trim()

    if (!Number.isNaN(duration)) {
      presenceData.details = AnimeDetails?.replace(
        '%title%',
        content.title ?? '',
      ).replace(
        '%episode%',
        `EP.${content.episode.ep} ${content.episode.title ?? ''}`,
      )
      presenceData.state = AnimeState?.replace('%title%', content.title ?? '').replace(
        '%episode%',
        `EP.${content.episode.ep} ${content.episode.title ?? ''}`,
      );

      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(currentTime, duration)

      presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = paused ? strings.pause : strings.play

      presenceData.buttons = [
        {
          label: strings.viewEpisode,
          url: document.baseURI,
        },
        {
          label: strings.viewSeries,
          url: document.querySelector<HTMLAnchorElement>('h2.sub > a')!.href,
        },
      ]

      if (paused) {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }
    else {
      presenceData.details = strings.viewAnime
      presenceData.state = content.title
    }
  }
  else if (path.includes('/chapters/')) {
    [content.episode.ep] = document
      .querySelector('h1')
      ?.textContent
      ?.replace(content.title ?? '', '')
      ?.match(/[1-9]?\d{0,2}.?[1-9]?\d{1,2}/g) ?? []

    presenceData.details = MangaDetails?.replace(
      '%title%',
      content.title ?? '',
    ).replace('%chapter%', `${strings.chapter} ${content.episode.ep}`)
    presenceData.state = MangaState?.replace('%title%', content.title ?? '').replace(
      '%chapter%',
      `${strings.chapter} ${content.episode.ep}`,
    )

    presenceData.smallImageText = strings.reading

    presenceData.buttons = [
      {
        label: 'Read Chapter',
        url: document.baseURI,
      },
    ]
  }

  if (!buttons)
    delete presenceData.buttons
  if (!timestamp) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  presence.setActivity(presenceData)
})

interface IFrameData {
  iframeVideo: {
    duration: number
    currentTime: number
    paused: boolean
  }
}
