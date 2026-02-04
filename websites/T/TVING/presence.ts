import { Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '831432191120375829',
})
const browsingTimestamp = Date.now() / 1000
const shortenedURLs: Record<string, string> = {}

async function getShortURL(url: string) {
  if (!url || url.length < 256)
    return url
  if (shortenedURLs[url])
    return shortenedURLs[url]
  try {
    const pdURL = await (
      await fetch(`https://pd.premid.app/create/${url}`)
    ).text()
    shortenedURLs[url] = pdURL
    return pdURL
  }
  catch (err) {
    presence.error(err as string)
    return url
  }
}

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/TVING/assets/logo.png',
    smallImageKey: Assets.Search,
    startTimestamp: browsingTimestamp,
  }

  const [buttons, cover] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('cover'),
  ])
  const imageUrl = 'https://image.tving.com'
  const pages: Record<
    string,
    | PresenceData
    | ((video?: HTMLVideoElement) => PresenceData | undefined | Promise<PresenceData | undefined>)
  > = {
    '/(vod/|movie/|)player/': async (video) => {
      const data: PresenceData = {
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/TVING/assets/logo.png',
      }

      if (video) {
        const streamData = JSON.parse(document.querySelector('[id=__NEXT_DATA__]')?.textContent ?? '{}').props.pageProps.streamData

        data.details = streamData.body.content.program_name
        data.state = streamData.body.content.episode_name

        data.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        data.smallImageText = video.paused ? 'Paused' : 'Playing'

        if (cover)
          data.largeImageKey = await getShortURL(imageUrl + streamData.body.content.info.episode.image[0].url)

        if (!video.paused) {
          [data.startTimestamp, data.endTimestamp] = getTimestampsFromMedia(video)
        }

        data.buttons = [
          {
            label: !location.pathname.includes('/movie/')
              ? '에피소드 보기'
              : '영화 보기',
            url: document.URL,
          },
        ]

        return data
      }
    },
    '/live/player/': video => ({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/TVING/assets/logo.png',
      details: document.querySelector('.live-title__channel')?.textContent,
      state: '라이브',
      smallImageKey: video && video.paused ? Assets.Pause : Assets.Play,
      smallImageText: video && video.paused ? '일시 정지' : '재생 중',
      endTimestamp: (() => {
        if (video && !video.paused)
          return getTimestampsFromMedia(video).pop()
      })(),
      buttons: [
        {
          label: '라이브 보기',
          url: document.URL,
        },
      ],
    }),
    '/schedule/': {
      details: '일정을 보는 중',
    },
    '/event/': {
      details: '이벤트 보는 중',
    },
    '/faq/': {
      details: 'FAQ 보는 중',
    },
  }

  for (const [path, data] of Object.entries(pages)) {
    if (location.pathname.match(path)) {
      if (typeof data === 'function') {
        const output = await data(document.querySelector('video') ?? undefined)

        if (output?.largeImageKey)
          presenceData = output
        else presenceData = { ...presenceData, ...output } as PresenceData
        console.log(presenceData)
      }
      else {
        presenceData = { ...presenceData, ...data } as PresenceData
      }
    }
  }

  if (!buttons)
    delete presenceData.buttons

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
