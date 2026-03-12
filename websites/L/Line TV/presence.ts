import { Assets } from 'premid'

const presence = new Presence({
  clientId: '813392002526871592',
})
async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      paused: 'general.paused',
      browse: 'general.browsing',
      viewSeries: 'general.viewSeries',
      searchSomething: 'general.searchSomething',
      buttonViewEpisode: 'general.buttonViewEpisode',
    },

  )
}
const browsingTimestamp = Math.floor(Date.now() / 1000)
const shortenedURLs: Record<string, string> = {}

async function shortenURL(url: string) {
  if (!url || url.length < 256)
    return url
  if (shortenedURLs[url])
    return shortenedURLs[url]
  try {
    const pdURL = await (
      await fetch(`https://pd.premid.app/create/${url}`)
    ).text()
    return (shortenedURLs[url] = pdURL)
  }
  catch (err) {
    presence.error(err as string)
    return url
  }
}

let oldLang: string | null = null
let strings: Awaited<ReturnType<typeof getStrings>>

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const [newLang, showButton, cover] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('cover'),
  ])

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/Line%20TV/assets/logo.png',
    startTimestamp: browsingTimestamp,
    details: strings.browse,
  }

  if (pathname.includes('/drama/')) {
    const video = document.querySelector('video')
    const title = document
      .querySelector('h2.font-700.text-24.break-all')
      ?.textContent
      ?.split('：')
    const episodeTitle = title?.pop()

    if (video) {
      presenceData.details = title?.join('：')
      presenceData.state = episodeTitle;

      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)

      presenceData.largeImageKey = cover
        ? await shortenURL(
            document.querySelector<HTMLImageElement>(
              `img[alt='${title?.join('：')}']`,
            )?.src ?? '',
          )
        : 'linetv_logo'

      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused
        ? strings.paused
        : strings.play

      if (video.paused) {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }

      if (showButton) {
        presenceData.buttons = [
          {
            label: strings.buttonViewEpisode,
            url: location.href,
          },
        ]
      }
      else {
        delete presenceData.buttons
      }
    }
    else {
      presenceData.details = strings.viewSeries
      presenceData.state = title?.join('：')
    }
  }
  else if (pathname.includes('/search')) {
    presenceData.details = strings.searchSomething
    presenceData.smallImageKey = Assets.Search
  }

  presence.setActivity(presenceData)
})
