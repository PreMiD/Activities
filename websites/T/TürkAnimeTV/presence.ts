import { Assets } from 'premid'

interface Video {
  paused: boolean
  duration: number
  currentTime: number
}

const presence = new Presence({ clientId: '666074265233260555' })
const strings = presence.getStrings({
  playing: 'general.playing',
  paused: 'general.paused',
  browsing: 'general.browsing',
  viewAnime: 'general.viewAnime',
  watching: 'general.watching',
  episode: 'general.episode',
  watchEpisode: 'general.buttonViewEpisode',
  anime: 'general.anime',
})

let video: Video

presence.on('iFrameData', (msg: unknown) => {
  video = msg as Video
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/T%C3%BCrkAnimeTV/assets/logo.png',
  }
  const title = document
    .querySelector(
      '#arkaplan > div:nth-child(3) > div.col-xs-8 > div > div:nth-child(3) > div > div.panel-ust > ol > li:nth-child(1) > a',
    )
    ?.textContent
    ?.trim() || null
  const ep = document
    .querySelector(
      '#arkaplan > div:nth-child(3) > div.col-xs-8 > div > div:nth-child(3) > div > div.panel-ust > ol > li:nth-child(2) > a',
    )
    ?.textContent
    ?.trim()
  const animeTitle = document
    .querySelector('#detayPaylas > div > div.panel-ust > div')
    ?.textContent
    ?.trim()
  const animePage = document
    .querySelector(
      '#arkaplan > div:nth-child(3) > div.col-xs-8 > div > div:nth-child(3) > div > div.panel-ust > ol > li:nth-child(1) > a',
    )
    ?.getAttribute('href') || document.URL

  // Series & Movies
  if (title && ep) {
    const epNum = ep.match(/\d+\. Bölüm/g)

    presenceData.details = `${(await strings).watching} ${title}`
    if (epNum) {
      presenceData.state = `${(await strings).episode} ${
        epNum[0].split('.')[0]
      }`
    }

    presenceData.buttons = [
      {
        label: (await strings).watchEpisode,
        url: document.URL.split('&')[0]!,
      },
      {
        label: (await strings).anime,
        url: `https://www.turkanime.net/${animePage}`,
      },
    ]
  }
  else if (window.location.pathname.startsWith('/anime/') && animeTitle) {
    // About Anime Page
    presenceData.details = (await strings).viewAnime
    presenceData.state = animeTitle
    presenceData.buttons = [
      {
        label: (await strings).anime,
        url: animePage,
      },
    ]
  }
  else {
    // Browsing
    presenceData.details = (await strings).browsing
    presenceData.startTimestamp = Math.floor(Date.now() / 1000)
  }

  if (video) {
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused
      ? (await strings).paused
      : (await strings).playing

    if (!video.paused && video.duration) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
        Math.floor(video.currentTime),
        Math.floor(video.duration),
      )
    }
  }

  presence.setActivity(presenceData)
})
