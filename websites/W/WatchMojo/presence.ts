import { Assets } from 'premid'

const presence = new Presence({
  clientId: '822457774574272592',
})
async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      browse: 'general.browsing',
      watchingVid: 'general.watchingVid',
      watching: 'general.watching',
      search: 'general.search',
      searchFor: 'general.searchFor',
      searchSomething: 'general.searchSomething',
      playingTrivia: 'watchmojo.playingTrivia',
      trivia: 'watchmojo.trivia',
      triviaGame: 'watchmojo.triviaGame',
      article: 'general.readingArticle',
      category: 'general.viewCategory',
      viewChannel: 'general.viewChannel',
      buttonViewChannel: 'general.buttonViewChannel',
      buttonReadArticle: 'general.buttonReadArticle',
      buttonWatchVideo: 'general.buttonWatchVideo',
      buttonPlayTrivia: 'watchmojo.buttonPlayTrivia',
    },

  )
}
function capitalize(s: string) {
  s = s.replace('%20', '-')
  if (s.includes('-')) {
    let newStr = ''
    for (let i = 0; i < s.split('-').length; i++) {
      const str = s.split('-')[i]
      newStr += `${str!.charAt(0).toUpperCase() + str!.slice(1)} `
    }
    return newStr
  }
  else {
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
}

let browsingTimestamp = Math.floor(Date.now() / 1000)
let prevUrl = document.location.href
let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null
let iframeDur = 0
let iframeCur = 0
let iframePau = false

presence.on(
  'iFrameData',
  (data: {
    video: boolean
    duration: number
    currentTime: number
    paused: boolean
  }) => {
    if (data.video) {
      iframeDur = data.duration
      iframeCur = data.currentTime
      iframePau = data.paused
    }
  },
)

presence.on('UpdateData', async () => {
  const newLang = await presence.getSetting<string>('lang').catch(() => 'en')
  const showBrowsing = await presence.getSetting<boolean>('browse')
  const showTimestamp = await presence.getSetting<boolean>('timestamp')
  const showButtons = await presence.getSetting<boolean>('buttons')
  const privacy = await presence.getSetting<boolean>('privacy')
  const video = document.querySelector<HTMLVideoElement>('#myDiv_html5')

  let presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/WatchMojo/assets/logo.jpg',
  }

  if (document.location.href !== prevUrl) {
    prevUrl = document.location.href
    browsingTimestamp = Math.floor(Date.now() / 1000)
  }

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  const statics: {
    [name: string]: PresenceData
  } = {
    '/': {
      details: strings.browse,
    },
    '/video/id/(\\d*)/': {
      details: privacy ? strings.watchingVid : strings.watching,
      state: privacy
        ? null
        : document.querySelector('.brid-poster-title')?.textContent,
      smallImageKey: video?.paused ? Assets.Pause : Assets.Play,
      smallImageText: video?.paused ? strings.pause : strings.play,
      startTimestamp: video?.paused
        ? null
        : video
          ? presence.getTimestampsfromMedia(video)[0]
          : null,
      endTimestamp: video?.paused
        ? null
        : video
          ? presence.getTimestampsfromMedia(video)[1]
          : null,
      buttons: [{ label: strings.buttonWatchVideo, url: document.URL }],
    },
    '/trivia/': {
      details: privacy
        ? strings.playingTrivia
        : strings.trivia.replace(
            '{0}',
            document.querySelector('#yttitle')?.textContent ?? '',
          ),
      state: privacy
        ? null
        : strings.triviaGame
            .replace(
              '{0}',
              document
                .querySelector('#questnum')
                ?.textContent
                ?.split('of')[0]
                ?.split(' ')[1]
                ?.trim() ?? '',
            )
            .replace(
              '{1}',
              document
                .querySelector('#questnum')
                ?.textContent
                ?.split('of')[1]
                ?.split(' ')[1]
                ?.trim() ?? '',
            )
            .replace(
              '{2}',
              document
                .querySelector('.scorequiz > b')
                ?.textContent
                ?.split('/')[0]
                ?.split(' ')[2] ?? '',
            )
            .replace(
              '{3}',
              document
                .querySelector('.scorequiz > b')
                ?.textContent
                ?.split('/')[1] ?? '',
            ),
      smallImageKey: iframePau ? Assets.Pause : Assets.Play,
      smallImageText: iframePau ? strings.pause : strings.play,
      startTimestamp: iframePau
        ? 0
        : presence.getTimestamps(iframeCur, iframeDur)[0],
      endTimestamp: iframePau
        ? 0
        : presence.getTimestamps(iframeCur, iframeDur)[1],
      buttons: [{ label: strings.buttonPlayTrivia, url: document.URL }],
    },
    '/blog/(\\d*)/(\\d*)/(\\d*)/': {
      details: strings.article,
      state: document.querySelector('h1')?.textContent,
      buttons: [{ label: strings.buttonReadArticle, url: document.URL }],
    },
    '/categories/': {
      details: strings.category,
      state: typeof location.pathname.split('/')[2] === 'string'
        ? capitalize(location.pathname.split('/')[2]!)
        : 'NEEDS RESET',
    },
    '/channels/': {
      details: strings.viewChannel,
      state: location.pathname.split('/')[2],
      buttons: [{ label: strings.buttonViewChannel, url: document.URL }],
    },
    '/search/': {
      details: strings.searchFor,
      state: document.querySelector('#result > div > b:nth-child(2)')?.textContent
        || document.querySelector('#resultd > a > span')?.textContent,
      smallImageKey: Assets.Search,
      smallImageText: strings.search,
    },
  }

  if (showTimestamp)
    presenceData.startTimestamp = browsingTimestamp

  if (showBrowsing) {
    for (const [k, v] of Object.entries(statics)) {
      if (
        location.href
          .replace(/\/?$/, '/')
          .replace(`https://${document.location.hostname}`, '')
          .replace('?', '/')
          .replace('=', '/')
          .match(k)
      ) {
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = strings.browse
        presenceData = { ...presenceData, ...v } as PresenceData
      }
    }
  }

  if (privacy && presenceData.smallImageKey === Assets.Search) {
    presenceData.details = strings.searchSomething
    delete presenceData.state
  }
  else if (privacy && presenceData.smallImageKey === Assets.Reading) {
    presenceData.details = strings.browse
    delete presenceData.state
  }

  if (!showButtons || privacy)
    delete presenceData.buttons

  if (!presenceData.details)
    delete presenceData.details
  if (!presenceData.state)
    delete presenceData.state
  if (!presenceData.startTimestamp)
    delete presenceData.startTimestamp
  if (!presenceData.endTimestamp)
    delete presenceData.endTimestamp

  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})
