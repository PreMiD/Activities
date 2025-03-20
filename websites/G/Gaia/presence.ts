import { Assets } from 'premid'

const presence = new Presence({
  clientId: '928134371205083166',
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
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Gaia/assets/logo.png',
    smallImageKey: Assets.Search,
    startTimestamp: browsingTimestamp,
  }

  const [buttons, cover] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('cover'),
  ])
  const pages: Record<
    string,
    PresenceData | (() => PresenceData | Promise<PresenceData>)
  > = {
    '/(video|series)/': async () => {
      const video = document.querySelector('video')
      const data = presenceData

      if (video) {
        const title = [
          document.querySelector('.heading.video-player-meta__series-title')
            ?.textContent,
          document.querySelector('.heading.video-player-meta__title')
            ?.textContent,
          document
            .querySelector('.text-season-episode')
            ?.textContent
            ?.toUpperCase(),
        ]
        const coverUrl = document
          .querySelector<HTMLElement>('.vjs-poster')
          ?.style
          ?.backgroundImage
          ?.match(/url\("(.*)"\)/)?.[1]

        delete data.startTimestamp

        data.details = title.find(Boolean)
        data.state = title[0] ? `${title[2]} ${title[1]}` : 'Film'

        data.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        data.smallImageText = video.paused ? 'Paused' : 'Playing'

        if (cover && coverUrl)
          data.largeImageKey = await getShortURL(coverUrl)

        if (!video.paused) {
          [data.startTimestamp, data.endTimestamp] = presence.getTimestampsfromMedia(video)
        }

        data.buttons = [
          {
            label: title[0] ? 'Watch Series' : 'Watch Film',
            url: document.URL,
          },
        ]

        return data
      }
      else {
        const title = [
          (
            document.querySelector('.jumbotron-episode__meta > h1')
            ?? document.querySelector('.heading.detail-series__title')
          )?.textContent,
          document.querySelector('.jumbotron-video__meta> h1')?.textContent,
        ]

        data.details = title[0] ? 'Viewing series:' : 'Viewing film:'
        data.state = title.find(Boolean)

        data.buttons = [
          {
            label: title[0] ? 'View Series' : 'View Film',
            url: document.URL,
          },
        ]

        return data
      }
    },
    '/(yoga|style|seeking-truth|topic|alternative-healing|transformation)/': () => ({
      details: 'Browsing:',
      state: document.querySelector('.heading.jumbotron-subcategory__title')
        ?.textContent,
    }),
    '/films-docs/': {
      details: 'Browsing:',
      state: 'Docs & Films',
    },
    '/recently-added': {
      details: 'Viewing what\'s new on Gaia',
    },
  }

  for (const [path, data] of Object.entries(pages)) {
    if (location.pathname.match(path)) {
      if (typeof data === 'function') {
        const output = await data()

        if (output.largeImageKey)
          presenceData = output
        else presenceData = { ...presenceData, ...output } as PresenceData
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
