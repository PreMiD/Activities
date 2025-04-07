import { Assets } from 'premid'

const presence = new Presence({
  clientId: '972073369564483584',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      search: 'general.search',
      episode: 'general.episode',
      browsing: 'general.browsing',
      viewHome: 'general.viewHome',
      viewChannel: 'general.viewChannel',
      watchingVid: 'general.watchingVid',
      viewCategory: 'general.viewCategory',
      readingAbout: 'general.readingAbout',
      searchSomething: 'general.searchSomething',
      buttonWatchVideo: 'general.buttonWatchVideo',
      buttonViewEpisode: 'general.buttonViewEpisode',
    },

  )
}
let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const newLang = await presence.getSetting<string>('lang').catch(() => 'en')
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/bilibilitv/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { hostname, href, pathname } = document.location
  const pathArray = pathname?.split('/')
  const title = document.querySelector('.bstar-meta__title')?.textContent
  const playing = !document.querySelector(
    'img.player-mobile-icon.player-mobile-pause-icon.player-mobile-active',
  )
  const thumbnail = document
    .querySelector<HTMLMetaElement>('meta[property="og:image"]')
    ?.content
    ?.split('?')?.[0]
    ?? 'https://cdn.rcd.gg/PreMiD/websites/B/bilibilitv/assets/logo.png'
  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }
  // Main Site
  if (hostname === 'www.bilibili.tv') {
    const pathKey = Number.isNaN(Number(pathArray[2])) ? pathArray[2] : pathArray[1]
    switch (pathKey) {
      case 'video': {
        presenceData.details = strings.watchingVid
        presenceData.state = title
        presenceData.buttons = [
          {
            label: strings.buttonWatchVideo,
            url: href,
          },
        ]
        break
      }
      case 'play': {
        presenceData.details = title
        presenceData.state = `${strings.episode} ${document
          .querySelector('a.ep-item.ep-item--active')
          ?.textContent
          ?.replace(/\D/g, '')}`
        presenceData.buttons = [
          {
            label: strings.buttonViewEpisode,
            url: href,
          },
        ]
        break
      }
      case 'media': {
        presenceData.details = strings.readingAbout.replace(':', '')
        presenceData.state = document.querySelector(
          '.media-detail__title',
        )?.textContent
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = strings.browsing
        break
      }
      case 'popular': {
        presenceData.details = strings.viewCategory.replace(':', '')
        presenceData.state = 'Popular'
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = strings.browsing
        break
      }
      case 'space': {
        presenceData.details = strings.viewChannel.replace(':', '')
        presenceData.state = document.querySelector('.space-info__name')?.textContent
          ?? strings.searchSomething
        break
      }
      case 'index': {
        presenceData.details = strings.search
        presenceData.state = document.querySelector(
          'a.router-link-exact-active.router-link-active.anime-radio__tag.anime-radio__tag--active',
        )?.textContent ?? strings.searchSomething
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = strings.browsing
        break
      }
      default: {
        presenceData.details = strings.viewHome
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = strings.browsing
        break
      }
    }
    if (pathKey === 'video' || pathKey === 'play') {
      presenceData.largeImageKey = thumbnail
      presenceData.smallImageKey = playing ? Assets.Play : Assets.Pause
      if (playing) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
          presence.timestampFromFormat(
            document.querySelector('.player-mobile-time-current-text')
              ?.textContent ?? '00:00',
          ),
          presence.timestampFromFormat(
            document.querySelector('.player-mobile-time-total-text')
              ?.textContent ?? '00:00',
          ),
        )
      }
    }
    // Studio
  }
  else if (hostname === 'studio.bilibili.tv') {
    if (pathArray[1]) {
      presenceData.details = document.querySelector('.is-active')?.textContent
    }
    else {
      presenceData.details = document.querySelector(
        '.nav-menu__menu-title',
      )?.textContent
    }
    presenceData.state = 'Bilibili Studio'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
