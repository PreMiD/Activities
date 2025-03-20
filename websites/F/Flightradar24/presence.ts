import { Assets } from 'premid'

const presence = new Presence({
  clientId: '930914836773224498',
})
const browsingStamp = Math.floor(Date.now() / 1000)
let remaining = 0
let leftTimestamp = 0
let player = {
  total: '',
  elapsed: '',
  isPlaying: false,
}
let video = {
  currentTime: 0,
  duration: 0,
  paused: true,
}

enum OtherAssets {
  airborne = 'https://cdn.rcd.gg/PreMiD/websites/F/Flightradar24/assets/0.png',
  arriving = 'https://cdn.rcd.gg/PreMiD/websites/F/Flightradar24/assets/1.png',
  departing = 'https://cdn.rcd.gg/PreMiD/websites/F/Flightradar24/assets/2.png',
  diverting = 'https://cdn.rcd.gg/PreMiD/websites/F/Flightradar24/assets/3.png',
  onground = 'https://cdn.rcd.gg/PreMiD/websites/F/Flightradar24/assets/4.png',
}

presence.on(
  'iFrameData',
  (inc: unknown) => {
    const data = inc as {
      elapsed: string
      total: string
      isPlaying: boolean
      currentTime: number
      duration: number
      paused: boolean
    }
    player = {
      total: data.total,
      elapsed: data.elapsed,
      isPlaying: data.isPlaying,
    }
    video = {
      currentTime: data.currentTime,
      duration: data.duration,
      paused: data.paused,
    }
  },
)

presence.on('UpdateData', async () => {
  const [elapsed, buttons, images, timeLeft] = await Promise.all([
    presence.getSetting<boolean>('elapsed'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('images'),
    presence.getSetting<boolean>('timeLeft'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/Flightradar24/assets/logo.png',
    startTimestamp: browsingStamp,
  }

  switch (document.location.hostname.split('.')[0]) {
    case 'www':
      switch (document.location.pathname.split('/')[1]) {
        case 'data':
          switch (document.location.pathname.split('/')[2]) {
            case 'airports':
              if (document.location.pathname === '/data/airports') {
                presenceData.details = 'Browsing Airports'
              }
              else if (
                document.querySelector('[data-testid=\'cnt-subpage-title\']')
              ) {
                presenceData.details = `Browsing ${
                  document.querySelector('[data-testid=\'cnt-subpage-title\']')
                    ?.firstElementChild
                    ?.firstChild
                    ?.textContent
                }`
                presenceData.state = `${
                  document.querySelector('small')?.textContent?.split(' ')[1]
                } ${document
                  .querySelector('small')
                  ?.textContent
                  ?.split(' ')[2]?.[0]
                  ?.toUpperCase()}${document
                  .querySelector('small')
                  ?.textContent
                  ?.split(' ')[2]
                  ?.slice(1)}`
              }
              else if (document.querySelector('.airport-name')) {
                presenceData.details = `Viewing ${
                  document.querySelector('.airport-name')?.textContent
                }`
                presenceData.state = document.querySelector<HTMLAnchorElement>(
                  '.btn.active',
                )?.childNodes[2]
                  ? document.querySelector<HTMLAnchorElement>('.btn.active')
                    ?.childNodes[2]
                    ?.textContent
                  : document.querySelector<HTMLAnchorElement>('.btn.active')
                    ?.textContent
                presenceData.buttons = [
                  {
                    label: 'View Airport',
                    url: document.location.href,
                  },
                ]
              }
              else {
                presenceData.details = 'Browsing Airports'
              }
              break
            case 'airlines':
              if (document.querySelector('.airline-name')) {
                presenceData.details = `Viewing ${
                  document.querySelector('.airline-name')?.textContent
                }`
                presenceData.state = document.querySelector<HTMLAnchorElement>(
                  '.btn.active',
                )?.childNodes[2]
                  ? document.querySelector<HTMLAnchorElement>('.btn.active')
                    ?.childNodes[2]
                    ?.textContent
                  : document.querySelector<HTMLAnchorElement>('.btn.active')
                    ?.textContent
                presenceData.buttons = [
                  {
                    label: 'View Airline',
                    url: document.location.href,
                  },
                ]
              }
              else {
                presenceData.details = 'Browsing Airlines'
              }
              break
            case 'aircraft':
              if (
                document.querySelector('[data-testid=\'cnt-subpage-title\'] > h1')
              ) {
                presenceData.details = `Viewing ${document
                  .querySelector('[data-testid=\'cnt-subpage-title\'] > h1 ')
                  ?.textContent
                  ?.replace('Production lists - ', '')}`
                presenceData.buttons = [
                  {
                    label: 'View Page',
                    url: document.location.href,
                  },
                ]
              }
              else if (
                document.querySelector('[data-testid=\'cnt-subpage-info\'] > h1')
              ) {
                presenceData.details = `Viewing ${document
                  .querySelector('[data-testid=\'cnt-subpage-info\'] > h1 ')
                  ?.textContent
                  ?.replace(
                    'Flight history for aircraft -',
                    'Aircraft',
                  )}`
                if (
                  images
                  && document.querySelector('.img-responsive')
                  && document.querySelector<HTMLImageElement>('.img-responsive')
                    ?.src !== ''
                ) {
                  presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
                    '.img-responsive',
                  )?.src
                }
                presenceData.buttons = [
                  {
                    label: 'View Aircraft',
                    url: document.location.href,
                  },
                ]
              }
              else {
                presenceData.details = 'Browsing Aircraft'
              }
              break
            case 'flights':
              if (
                document.querySelector('[data-testid=\'cnt-subpage-info\'] > h1')
              ) {
                presenceData.details = `Viewing ${document
                  .querySelector('[data-testid=\'cnt-subpage-info\'] > h1 ')
                  ?.textContent
                  ?.match(/(flight .+$)/g)}`
                presenceData.state = `${document
                  .querySelector('[data-testid=\'cnt-subpage-info\'] > h1 ')
                  ?.textContent
                  ?.replace(/(flight .+$)/g, '')
                  ?.replace('Flight history for ', '')}`
                presenceData.buttons = [
                  {
                    label: 'View Page',
                    url: document.location.href,
                  },
                ]
              }
              else {
                presenceData.details = 'Browsing Flights'
              }
              break
            case 'pinned':
              if (
                document.querySelector('[data-testid=\'cnt-subpage-info\'] > h1')
              ) {
                presenceData.details = `Viewing ${document
                  .querySelector('[data-testid=\'cnt-subpage-info\'] > h1 ')
                  ?.textContent
                  ?.replace(
                    'Flight history for aircraft -',
                    'Aircraft',
                  )}`
                if (
                  images
                  && document.querySelector('.img-responsive')
                  && document.querySelector<HTMLImageElement>('.img-responsive')
                    ?.src !== ''
                ) {
                  presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
                    '.img-responsive',
                  )?.src
                }
                presenceData.buttons = [
                  {
                    label: 'View Aircraft',
                    url: document.location.href,
                  },
                ]
              }
              else {
                presenceData.details = 'Browsing Pinned Flights'
              }
              break
            case 'statistics':
              presenceData.details = 'Viewing Statistics'
              break
            case null:
              presenceData.details = 'Searching Data'
              break
            default:
              presenceData.details = 'Searching Data'
              break
          }
          break
        case 'apps':
          presenceData.details = 'Viewing Mobile Apps'
          presenceData.state = document.querySelector('a.active')?.textContent
          break
        case 'add-coverage':
          presenceData.details = 'Viewing Add Coverage'
          break
        case 'apply-for-receiver':
          presenceData.details = 'Viewing Apply For Receiver'
          break
        case 'share-your-data':
          presenceData.details = 'Viewing Share Data'
          presenceData.state = document.querySelector('li.active')?.textContent
          break
        case 'build-your-own':
          presenceData.details = 'Viewing Build Your Own'
          presenceData.state = document.querySelector('li.active')?.textContent
          break
        case 'share-statistics':
          presenceData.details = 'Viewing Data Statistics'
          presenceData.state = `${
            document.querySelector('a.active')?.textContent?.split(' ')[0]
          } ${document
            .querySelector('a.active')
            ?.textContent
            ?.split(' ')[1]?.[0]
            ?.toUpperCase()}${document
            .querySelector('a.active')
            ?.textContent
            ?.split(' ')[1]
            ?.slice(1)}`
          break
        case 'premium':
          presenceData.details = 'Viewing Subscription Plans'
          break
        case 'about':
          presenceData.details = 'Viewing About Flightradar24'
          break
        case 'how-it-works':
          presenceData.details = 'Viewing How It Works'
          break
        case 'glossary':
          presenceData.details = 'Viewing Glossary'
          break
        case 'faq':
          presenceData.details = 'Viewing FAQ'
          break
        case 'contact-us':
          presenceData.details = 'Viewing Contact Us'
          break
        case 'privacy-policy':
          presenceData.details = 'Viewing Privacy Policy'
          break
        case 'terms-and-conditions':
          presenceData.details = 'Viewing Terms of Service'
          break
        case 'commercial-services':
          if (
            document.location.pathname === '/commercial-services/data-services'
          ) {
            presenceData.details = 'Viewing Data Services'
          }
          else if (
            document.location.pathname
            === '/commercial-services/app-integration'
          ) {
            presenceData.details = 'Viewing App Integration'
          }
          break
        case 'blog':
          switch (document.location.pathname) {
            case '/blog/': {
              presenceData.details = 'Browsing Blog Posts'
              break
            }
            case '/blog/newsletter/': {
              presenceData.details = 'Viewing Newsletter'
              break
            }
            case '/blog/avtalk-podcast/': {
              presenceData.details = 'Viewing Podcast'
              break
            }
            default:
              if (document.querySelector('iframe.blubrryplayer')) {
                [presenceData.details, presenceData.state] = document
                  .querySelector(
                    '.elementor-heading-title.elementor-size-default',
                  )
                  ?.textContent
                  ?.split(':') ?? []
                if (player.isPlaying) {
                  presenceData.smallImageKey = Assets.Play
                  presenceData.smallImageText = 'Playing';
                  [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
                    presence.timestampFromFormat(player.total),
                    presence.timestampFromFormat(player.elapsed),
                  )
                }
                else {
                  presenceData.smallImageKey = Assets.Pause
                  presenceData.smallImageText = 'Paused'
                }
              }
              else if (
                document.querySelector(
                  'h1.elementor-heading-title.elementor-size-default > i.fas.fa-video',
                )
              ) {
                if (video.duration !== 0) {
                  [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
                    presence.timestampFromFormat(player.total),
                    presence.timestampFromFormat(player.elapsed),
                  )
                }
                else if (document.querySelector('video')) {
                  [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(
                    document.querySelector<HTMLMediaElement>('video')!,
                  )
                }
                else {
                  presenceData.details = 'Viewing Blog Post'
                  presenceData.state = document.querySelector(
                    'h1.elementor-heading-title.elementor-size-default',
                  )?.textContent
                  presenceData.buttons = [
                    {
                      label: 'View Page',
                      url: document.location.href,
                    },
                  ]
                }
                presenceData.details = 'Watching Video'
                presenceData.state = document
                  .querySelector(
                    'h1.elementor-heading-title.elementor-size-default',
                  )
                  ?.textContent
                  ?.replace('Video: ', '')
                if (video.duration !== 0) {
                  presenceData.buttons = [
                    {
                      label: 'View Page',
                      url: document.location.href,
                    },
                    {
                      label: 'Watch Video',
                      url: `https://www.youtube.com/watch?v=${
                        document
                          .querySelector<HTMLVideoElement>(
                            'iframe.elementor-video',
                          )
                          ?.src
                          ?.split('/')[4]
                          ?.split('?')[0]
                      }`,
                    },
                  ]
                }
                else if (document.querySelector('video')) {
                  presenceData.buttons = [
                    {
                      label: 'View Page',
                      url: document.location.href,
                    },
                    {
                      label: 'Watch Video',
                      url: document.querySelector<HTMLMetaElement>(
                        'meta[itemprop=\'url\']',
                      )?.content ?? '',
                    },
                  ]
                }
                if (video.duration !== 0) {
                  if (video.paused) {
                    presenceData.smallImageKey = Assets.Pause
                    presenceData.smallImageText = 'Paused'
                  }
                  else {
                    presenceData.smallImageKey = Assets.Play
                    presenceData.smallImageText = 'Playing'
                  }
                }
                else if (document.querySelector('video')) {
                  if (
                    document.querySelector<HTMLMediaElement>('video')?.paused
                  ) {
                    presenceData.smallImageKey = Assets.Pause
                    presenceData.smallImageText = 'Paused'
                  }
                  else {
                    presenceData.smallImageKey = Assets.Play
                    presenceData.smallImageText = 'Playing'
                  }
                }
              }
              else {
                presenceData.details = 'Viewing Blog Post'
                presenceData.state = document.querySelector(
                  'h1.elementor-heading-title.elementor-size-default',
                )?.textContent
                presenceData.buttons = [
                  {
                    label: 'View Page',
                    url: document.location.href,
                  },
                ]
              }
          }
          break

        default:
          if (
            document.querySelector(
              '[data-testid=\'view-selector-toggle\'] > span:nth-child(2)',
            )?.textContent === 'Multi'
          ) {
            presenceData.details = `Viewing ${
              document.querySelector(
                '[data-testid=\'view-selector-toggle\'] > span:nth-child(2)',
              )?.textContent
            } Mode`
            if (
              document.querySelector('[data-testid=\'multiselect__info-panel\']')
            ) {
              presenceData.buttons = [
                {
                  label: 'View Page',
                  url: document.location.href,
                },
              ]
              if (
                document.querySelectorAll(
                  '[data-testid=\'multiselect__info-panel\']',
                ).length === 1
              ) {
                presenceData.state = `Tracking ${document
                  .querySelectorAll('[data-testid=\'multiselect__info-panel\']')
                  .length
                  .toString()} Flight`
              }
              else if (
                document.querySelectorAll(
                  '[data-testid=\'multiselect__info-panel\']',
                ).length >= 2
              ) {
                presenceData.state = `Tracking ${document
                  .querySelectorAll('[data-testid=\'multiselect__info-panel\']')
                  .length
                  .toString()} Flights`
              }
            }
          }
          else if (
            document.querySelector(
              '[data-testid=\'view-selector-toggle\'] > span:nth-child(2)',
            )?.textContent === 'Map'
          ) {
            presenceData.details = `Viewing ${
              document.querySelector(
                '[data-testid=\'view-selector-toggle\'] > span:nth-child(2)',
              )?.textContent
            } Mode`
            if (document.querySelector('[data-testid=\'aircraft-panel\']')) {
              if (
                document.querySelector(
                  '[data-testid=\'aircraft-panel__header__callsign\']',
                )?.textContent === 'N/A'
              ) {
                presenceData.details = `Tracking ${
                  document.querySelector(
                    '[data-testid=\'aircraft-panel__registration\']',
                  )?.textContent
                }`
              }
              else {
                presenceData.details = `Tracking ${
                  document.querySelector(
                    '[data-testid=\'aircraft-panel__header__callsign\']',
                  )?.textContent
                }`
              }
              presenceData.smallImageKey = OtherAssets[
                document
                  .querySelector(
                    '[data-testid=\'aircraft-panel\'] [data-testid=\'base-tooltip__content\']',
                  )
                  ?.textContent
                  ?.toLocaleLowerCase()
                  ?.replaceAll(' ', '') as keyof typeof OtherAssets
              ]
              presenceData.smallImageText = document.querySelector(
                '[data-testid=\'aircraft-panel\'] [data-testid=\'base-tooltip__content\']',
              )?.textContent
              if (
                document.querySelector(
                  '[data-testid=\'aircraft-panel__flight-time-remaining\'] > span',
                )
              ) {
                if (
                  remaining
                  !== Number.parseInt(
                    document
                      .querySelector(
                        '[data-testid=\'aircraft-panel__flight-time-remaining\'] > span',
                      )
                      ?.textContent
                      ?.slice(5)
                      ?.split(':')[0] ?? '',
                  )
                  * 3600
                  + Number.parseInt(
                    document
                      .querySelector(
                        '[data-testid=\'aircraft-panel__flight-time-remaining\'] > span',
                      )
                      ?.textContent
                      ?.slice(5)
                      ?.split(':')[1] ?? '',
                  )
                  * 60
                ) {
                  remaining = Number.parseInt(
                    document
                      .querySelector(
                        '[data-testid=\'aircraft-panel__flight-time-remaining\'] > span',
                      )
                      ?.textContent
                      ?.slice(5)
                      ?.split(':')[0] ?? '',
                  )
                  * 3600
                  + Number.parseInt(
                    document
                      .querySelector(
                        '[data-testid=\'aircraft-panel__flight-time-remaining\'] > span',
                      )
                      ?.textContent
                      ?.slice(5)
                      ?.split(':')[1] ?? '',
                  )
                  * 60
                  leftTimestamp = Math.floor(Date.now() / 1000) + remaining
                  presenceData.endTimestamp = leftTimestamp
                }
                else {
                  presenceData.endTimestamp = leftTimestamp
                }
              }
              if (
                images
                && document.querySelector<HTMLAnchorElement>(
                  '[data-testid=\'aircraft-panel__image-link\']',
                )?.href !== 'https://www.jetphotos.com/addphotos/'
                && document.querySelector<HTMLAnchorElement>(
                  '[data-testid=\'aircraft-panel__image-link\']',
                )?.href !== ''
              ) {
                presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
                  '[data-testid=\'aircraft-panel__image-link\'] > img',
                )?.src
              }
              presenceData.buttons = [
                {
                  label: 'View Page',
                  url: document.location.href,
                },
              ]
            }
            else if (
              document.querySelector('[data-testid=\'airport-panel\']')
            ) {
              presenceData.details = `Tracking ${
                document.querySelector(
                  '[data-testid=\'airport-panel__header__name\']',
                )?.textContent
              }`
              if (document.querySelector('span[class=\'AM\']')) {
                presenceData.state = `${
                  document.querySelector('span[class=\'AM\']')?.textContent
                }am | ${
                  document
                    .querySelector('.pnl-component.airport-info > .time > span')
                    ?.textContent
                    ?.split('|')[1]
                } | ${
                  document
                    .querySelector('.pnl-component.airport-info > .time > span')
                    ?.textContent
                    ?.split('|')[2]
                }`
              }
              else if (document.querySelector('span[class=\'PM\']')) {
                presenceData.state = `${
                  document.querySelector('span[class=\'PM\']')?.textContent
                }pm | ${
                  document
                    .querySelector('.pnl-component.airport-info > .time > span')
                    ?.textContent
                    ?.split('|')[1]
                } | ${
                  document
                    .querySelector('.pnl-component.airport-info > .time > span')
                    ?.textContent
                    ?.split('|')[2]
                }`
              }
              if (
                images
                && document.querySelector<HTMLAnchorElement>(
                  '[data-testid=\'airport-panel__image-link\']',
                )?.href !== 'https://www.jetphotos.com/addphotos/'
                && document.querySelector<HTMLAnchorElement>(
                  '[data-testid=\'airport-panel__image-link\']',
                )?.href !== ''
              ) {
                presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
                  '[data-testid=\'airport-panel__image-link\'] > img',
                )?.src
              }
              presenceData.buttons = [
                {
                  label: 'View Page',
                  url: document.location.href,
                },
              ]
            }
          }
          else {
            presenceData.details = 'Unsupported Page'
            presenceData.state = document.location.pathname
          }
          break
      }

      if (document.querySelector('[class=\'session-timeout-modal visible\']'))
        presenceData.details = 'Session Timed Out'

      break
    case 'forum':
      if (document.location.pathname === '/') {
        presenceData.details = `Viewing ${
          document.querySelector('.ui-state-active')?.textContent
        }`
      }
      else if (document.location.pathname.split('/')[1] === 'member') {
        presenceData.details = `Viewing ${
          document.querySelector('.ui-state-active')?.textContent
        } Of User`
        presenceData.state = document.querySelector('.username')?.textContent
        presenceData.buttons = [
          {
            label: 'View Profile',
            url: document.location.href,
          },
        ]
      }
      else if (
        document.querySelector('.widget-tabs-nav > ul > .ui-state-active')
        && document.querySelector('h1.main-title')
      ) {
        presenceData.details = `Viewing ${
          document.querySelector('.widget-tabs-nav > ul > .ui-state-active')
            ?.textContent
        } Of`
        presenceData.state = document.querySelectorAll('h1.main-title')[1]?.textContent
        presenceData.buttons = [
          {
            label: 'View Page',
            url: document.location.href,
          },
        ]
      }
      else if (document.querySelector('h1.main-title')) {
        presenceData.details = `Viewing ${
          document.querySelectorAll('h1.main-title')[1]?.textContent
        }`
        presenceData.buttons = [
          {
            label: 'View Page',
            url: document.location.href,
          },
        ]
      }
      else {
        presenceData.details = 'Unsupported Page'
        presenceData.state = document.location.pathname
      }
      if (
        document.location.pathname.split('/')[1] === 'search'
        && document.querySelector('.search-controls-keywords')
      ) {
        presenceData.state = document.querySelector(
          '.search-controls-keywords',
        )?.lastChild?.textContent
      }
      break
    case 'my':
      if (document.location.pathname.split('/')[1] === 'settings') {
        presenceData.details = 'Viewing Settings'
        presenceData.state = document.querySelector('li.active')?.textContent
      }
      else if (document.location.pathname.split('/')[1] === 'friends') {
        presenceData.details = 'Viewing Friends'
      }
      else if (document.location.pathname.split('/')[1] === 'add-flight') {
        presenceData.details = 'Adding Flight To Log'
      }
      else if (document.location.pathname !== '/') {
        presenceData.details = `Viewing Profile Of ${
          document.querySelector('h3')?.textContent
        }`
        presenceData.state = document.querySelector('h2')?.textContent
        presenceData.buttons = [
          {
            label: 'View Page',
            url: document.location.href,
          },
        ]
        if (images) {
          presenceData.largeImageKey = document
            .querySelector<HTMLImageElement>('img.avatar')
            ?.src
            ?.replace('=64', '=1024')
            ?.replace('=64', '=1024')
        }
      }
      else {
        presenceData.details = 'Viewing Logbook Homepage'
      }
      break
    case 'careers':
      presenceData.details = 'Careers at Flightradar24'
      if (document.location.pathname === '/jobs') {
        presenceData.state = 'Browsing Jobs'
      }
      else if (document.querySelector('span.textFitted')) {
        presenceData.state = document.querySelector('span.textFitted')?.textContent
      }
      else {
        presenceData.state = document.querySelectorAll('h2')[1]?.textContent
      }
      break
    default:
      presenceData.details = 'Unsupported Subdomain'
      presenceData.state = document.location.hostname
      break
  }

  if (!elapsed)
    delete presenceData.startTimestamp
  if (!timeLeft)
    delete presenceData.endTimestamp
  if (!buttons && presenceData.buttons)
    delete presenceData.buttons

  presence.setActivity(presenceData)
})
