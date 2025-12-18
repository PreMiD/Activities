import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})

async function getStrings() {
  return presence.getStrings(
    {
      browse: 'general.browsing',
      buttonViewEpisode: 'general.buttonViewEpisode',
      buttonWatchVideo: 'general.buttonWatchVideo',
      paused: 'general.paused',
      play: 'general.playing',
      search: 'general.search',
      searchFor: 'general.searchFor',
      viewCategory: 'general.viewCategory',
      viewHome: 'general.viewHome',
      viewMovie: 'general.viewMovie',
      viewShow: 'general.viewShow',
      watchingVid: 'general.watchingVid',
    },

  )
}

enum Logo {
  RedShowtime = 'https://cdn.rcd.gg/PreMiD/websites/S/Showtime/assets/0.png',
  WhiteShowtime = 'https://cdn.rcd.gg/PreMiD/websites/S/Showtime/assets/1.png',
  BlackShowtime = 'https://cdn.rcd.gg/PreMiD/websites/S/Showtime/assets/2.png',
  SkyShowtime = 'https://cdn.rcd.gg/PreMiD/websites/S/Showtime/assets/3.png',
}
function logoCheck(logoNumber: number) {
  return logoNumber === 0 // Red
    ? Logo.RedShowtime
    : logoNumber === 1 // White
      ? Logo.WhiteShowtime
      : logoNumber === 2 // Black
        ? Logo.BlackShowtime
        : logoNumber === 3 // SkyShowtime
          ? Logo.SkyShowtime
          : Logo.RedShowtime // Default (Red)
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null
let pathSplit: string[]

presence.on('UpdateData', async () => {
  const [newLang, privacy, buttons, covers, logo] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('covers'),
    presence.getSetting<number>('logo'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: logoCheck(logo),
    name: 'Showtime',
  }
  const { pathname, hostname, href } = document.location
  const episodeEtc = document
    .querySelector(
      '[class="item playback-metadata__container-episode-metadata-info"]',
    )
    ?.textContent
    ?.split(':')
  const video = document.querySelector<HTMLVideoElement>('video')

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  switch (hostname.replace('www.', '')) {
    case 'skyshowtime.com': {
      const title = document.querySelector('[class="playback-header__title"]')
        ?.textContent
        ?? document.querySelector('title')?.textContent?.split(' - ')[0]
      pathSplit = pathname
        .replace('/watch', '')
        .replace('/kids', '')
        .split('/')

      switch (pathSplit[1]) {
        case 'highlights':
        case 'home': {
          presenceData.details = strings.viewHome
          break
        }
        case 'tv': {
          if (pathname.replace('/watch', '') === '/tv' || privacy)
            presenceData.details = 'Browsing tv shows'
          else presenceData.details = `Browsing ${title}'s shows`
          break
        }
        case 'movies': {
          presenceData.details = 'Browsing movies'
          break
        }
        case 'entertainment': {
          presenceData.details = 'Browsing tv shows'
          break
        }
        case 'my-stuff': {
          presenceData.details = 'Viewing their list'
          break
        }
        case 'profiles': {
          if (href.includes('#setting'))
            presenceData.details = 'Managing their profiles'
          else presenceData.details = 'Viewing their profiles'
          break
        }
        case 'search': {
          const search = document.querySelector<HTMLInputElement>(
            'input[class="search-input"]',
          )
          presenceData.smallImageKey = Assets.Search
          if (search?.value && !privacy) {
            presenceData.details = strings.searchFor
            presenceData.state = search.value
          }
          else {
            presenceData.details = strings.search
          }
          break
        }
        case 'asset': {
          presenceData.details = `Viewing ${
            pathname.includes('/tv/') ? 'tv show' : 'movie'
          }`
          presenceData.details = pathname.includes('/tv/')
            ? privacy
              ? strings.viewShow.replace(':', '')
              : strings.viewShow
            : privacy
              ? strings.viewMovie.replace(':', '')
              : strings.viewMovie
          presenceData.largeImageKey = document
            .querySelector(
              '[class="program-details__title program-details__title-logo visible"]',
            )
            ?.getAttribute('src')
            ?.replace('webp', 'png') ?? logoCheck(logo)
          presenceData.state = title

          break
        }
        case 'playback': {
          if (video && !Number.isNaN(video.duration)) {
            [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
            presenceData.smallImageKey = video.paused
              ? Assets.Pause
              : Assets.Play
            presenceData.smallImageText = video.paused
              ? strings.paused
              : strings.play
            video.paused
              ? delete presenceData.endTimestamp
              : delete presenceData.startTimestamp
            presenceData.buttons = [
              {
                label: strings.buttonWatchVideo,
                url: href,
              },
            ]
          }
          presenceData.details = privacy ? strings.watchingVid : title
          presenceData.state = `${episodeEtc?.[0]?.replace(
            ' ',
            ':',
          )} - ${episodeEtc?.[1]?.trim()}`
          break
        }
        default: {
          presenceData.details = strings.browse
        }
      }
      break
    }
    case 'showtime.com':
    case 'sho.com': {
      const title = document
        .querySelector('[data-label="title link"]')
        ?.textContent
        ?.split(',')
      const search = document.querySelector<HTMLInputElement>(
        'input[class="global-nav__search-field"]',
      )
      pathSplit = pathname.split('/')
      switch (true) {
        case document.querySelector('[class*=\'global-nav--selected\']')
          ?.textContent === 'Series': {
          presenceData.details = 'Viewing series'
          break
        }
        case !!search?.value: {
          presenceData.smallImageKey = Assets.Search
          if (!privacy) {
            presenceData.details = strings.searchFor
            presenceData.state = search.value
          }
          else {
            presenceData.details = strings.search
          }
          break
        }
        case !!document.querySelector('[class="refresh-hero__body"]')
          && !!pathSplit[1]: {
          presenceData.details = privacy
            ? strings.viewShow.replace(':', '')
            : strings.viewShow
          presenceData.state = document.querySelector(
            '[class="refresh-hero__headline "]',
          )?.textContent
          break
        }
        default: {
          switch (pathSplit[1]) {
            case 'channel-listings': {
              presenceData.details = 'Viewing channel listings'
              break
            }
            case 'sports':
            case 'documentaries':
            case 'movies': {
              presenceData.details = `Browsing ${document
                .querySelector('[class="global-nav__item"]')
                ?.textContent
                ?.toLowerCase()
                ?.trim()}`
              break
            }
            case 'schedule': {
              presenceData.details = 'Browsing the schedule'
              break
            }
            case 'video': {
              switch (true) {
                case pathSplit[2] === 'full-episodes': {
                  presenceData.details = 'Browsing all free full episodes'
                  break
                }
                case !!pathSplit[2]?.match(/\d{5}/g): {
                  if (video && !Number.isNaN(video.duration)) {
                    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
                    presenceData.smallImageKey = video.paused
                      ? Assets.Pause
                      : Assets.Play
                    presenceData.smallImageText = video.paused
                      ? strings.paused
                      : strings.play
                    video.paused
                      ? delete presenceData.endTimestamp
                      : delete presenceData.startTimestamp
                    presenceData.buttons = [
                      {
                        label: strings.buttonWatchVideo,
                        url: href,
                      },
                    ]
                  }
                  else {
                    presenceData.buttons = [
                      {
                        label: strings.buttonViewEpisode,
                        url: href,
                      },
                    ]
                  }
                  presenceData.details = privacy
                    ? strings.watchingVid
                    : document
                      .querySelector('title')
                      ?.textContent
                      ?.toLowerCase()
                      .includes('trailer') // if its a trailer
                      ? document
                          .querySelector(
                            '[class="video-metadata__details__title"]',
                          )
                          ?.textContent
                          ?.replace(/Season \d /g, '') // then include trailer info in title
                      : title?.[0] // else dont

                  presenceData.state = title && title.length > 2
                    ? `${title[1]
                      ?.replace(/ /g, '')
                      .replace('Season', 'S')}${title[2]
                      ?.replace(/ /g, '')
                      .replace('Episode', ':E')}`
                    : title?.[1]
                  presenceData.largeImageKey = document
                    .querySelector('meta[property="og:image"]')
                    ?.getAttribute('content') ?? logoCheck(logo)
                  break
                }
              }
              break
            }
            default: {
              presenceData.details = strings.browse
            }
          }
        }
      }
    }
  }

  if (privacy && presenceData.state)
    delete presenceData.state
  if ((!buttons || privacy) && presenceData.buttons)
    delete presenceData.buttons
  if (
    (!covers || privacy)
    && !Object.values(Logo).includes(presenceData.largeImageKey as Logo)
  ) {
    presenceData.largeImageKey = logoCheck(logo)
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
