import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '799629862620758046',
})

async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      browsing: 'general.browsing',
      live: 'general.live',
      searching: 'general.search',
      viewMovie: 'general.viewMovie',
      watchingMovie: 'general.watchingMovie',
      watchingSeries: 'general.watchingSeries',
      watchMovie: 'general.buttonViewMovie',
      watchSeries: 'general.buttonViewSeries',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/J/Joyn/assets/logo.jpg',
    type: ActivityType.Watching,
  }
  const newLang = await presence.getSetting<string>('lang').catch(() => 'en')
  const setting = {
    timeRemaining: await presence.getSetting<boolean>('timeRemaining'),
    showButtons: await presence.getSetting<boolean>('showButtons'),
  }
  const urlpath = window.location.pathname.split('/')
  const video = document.querySelector<HTMLVideoElement>('div video')

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  if (
    document.location.hostname === 'www.joyn.de'
    || document.location.hostname === 'joyn.de'
  ) {
    if (document.querySelector('.lk71lm-0.htJLsh')) {
      presenceData.details = strings.searching
      presenceData.state = document.querySelector<HTMLInputElement>('.search-input')?.value
    }
    else if (
      (urlpath[1] === '' || document.location.pathname.includes('/#home'))
      && urlpath[2] !== ''
    ) {
      presenceData.details = strings.browsing
    }
    else {
      switch (urlpath[1]) {
        case 'compilation': {
          const compilation = document.querySelector('.artLogo')
          presenceData.details = 'Viewing Compilation:'
          if (compilation)
            presenceData.state = (compilation as HTMLImageElement).alt
          if (!compilation)
            presenceData.state = document.querySelector('.hXdaOG')?.textContent

          if (setting.showButtons) {
            presenceData.buttons = [
              {
                label: 'Watch Compilation',
                url: `https://www.joyn.de/compilation/${urlpath[2]}`,
              },
            ]
          }

          break
        }
        case 'filme': {
          const film = document.querySelector('.artLogo')
          presenceData.details = strings.viewMovie
          if (film)
            presenceData.state = (film as HTMLImageElement).alt
          if (!film)
            presenceData.state = document.querySelector('.hXdaOG')?.textContent

          if (setting.showButtons) {
            presenceData.buttons = [
              {
                label: strings.watchMovie,
                url: `https://www.joyn.de/filme/${urlpath[2]}`,
              },
            ]
          }

          break
        }
        case 'serien': {
          const serie = document.querySelector('.artLogo')
          presenceData.details = 'Viewing Series:'
          if (serie)
            presenceData.state = (serie as HTMLImageElement).alt
          if (!serie)
            presenceData.state = document.querySelector('.hXdaOG')?.textContent

          if (setting.showButtons) {
            presenceData.buttons = [
              {
                label: strings.watchSeries,
                url: `https://www.joyn.de/serien/${urlpath[2]}`,
              },
            ]
          }

          break
        }
        default:
          if (
            urlpath[1] !== 'play'
            && (document.location.pathname.includes('/serien')
              || document.location.pathname.includes('/filme')
              || document.location.pathname.includes('/sport'))
          ) {
            presenceData.details = strings.browsing
          }
          else if (urlpath[1] === 'channels') {
            presenceData.details = strings.browsing
            presenceData.state = document.querySelector('.bISbKZ')?.textContent
          }
          else if (urlpath[1] === 'play' && urlpath[2] === 'filme') {
            presenceData.details = document.title.replace(
              'streamen | Joyn',
              '',
            )
            presenceData.state = 'Movie'
            if (video && !video.paused) {
              if (setting.timeRemaining) {
                [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
              }
              presenceData.smallImageKey = Assets.Play
              presenceData.smallImageText = strings.play
            }
            else {
              presenceData.smallImageKey = Assets.Pause
              presenceData.smallImageText = strings.pause
            }
            if (setting.showButtons) {
              presenceData.buttons = [
                {
                  label: strings.watchMovie,
                  url: `https://www.joyn.de/filme/${urlpath[3]}`,
                },
              ]
            }
          }
          else if (urlpath[1] === 'play' && urlpath[2] === 'serien') {
            presenceData.details = document.title.replace('streamen', '')
            presenceData.state = 'Series'
            if (video && !video.paused) {
              if (setting.timeRemaining) {
                [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
              }
              presenceData.smallImageKey = Assets.Play
              presenceData.smallImageText = strings.play
            }
            else {
              presenceData.smallImageKey = Assets.Pause
              presenceData.smallImageText = strings.pause
            }

            if (setting.showButtons) {
              presenceData.buttons = [
                {
                  label: strings.watchSeries,
                  url: `https://www.joyn.de/serien/${urlpath[3]}`,
                },
              ]
            }
          }
          else if (urlpath[1] === 'play' && urlpath[2] === 'trailer') {
            presenceData.details = document.title.replace('Trailer | Joyn', '')
            presenceData.state = 'Trailer'
            if (video && !video.paused) {
              if (setting.timeRemaining) {
                [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
              }
              presenceData.smallImageKey = Assets.Play
              presenceData.smallImageText = strings.play
            }
            else {
              presenceData.smallImageKey = Assets.Pause
              presenceData.smallImageText = strings.pause
            }
          }
          else if (urlpath[1] === 'play' && urlpath[2] === 'live-tv') {
            presenceData.details = document.title.replace(
              'im Livestream anschauen | Joyn',
              '',
            )
            presenceData.state = 'Live-TV'
            presenceData.smallImageKey = Assets.Live
            presenceData.smallImageText = strings.live

            if (setting.showButtons) {
              presenceData.buttons = [
                {
                  label: 'Watch show',
                  url: window.location.href,
                },
              ]
            }
          }
          else if (urlpath[1] === 'play' && urlpath[2] === 'compilation') {
            presenceData.details = document.title.replace('| Joyn', '')
            presenceData.state = 'Compilation'
            if (video && !video.paused) {
              if (setting.timeRemaining) {
                [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
              }
              presenceData.smallImageKey = Assets.Play
              presenceData.smallImageText = strings.play
            }
            else {
              presenceData.smallImageKey = Assets.Pause
              presenceData.smallImageText = strings.pause
            }

            if (setting.showButtons) {
              presenceData.buttons = [
                {
                  label: 'Watch Compilation',
                  url: `https://www.joyn.de/compilation/${urlpath[3]}`,
                },
              ]
            }
          }
          else if (urlpath[1] === 'play' && urlpath[2] === 'sport') {
            presenceData.details = document.querySelector(
              '.metadataWrapper .metadataTitle',
            )?.textContent
            presenceData.state = 'Sport'
            if (video && !video.paused) {
              if (setting.timeRemaining) {
                [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
              }
              presenceData.smallImageKey = Assets.Play
              presenceData.smallImageText = strings.play
            }
            else {
              presenceData.smallImageKey = Assets.Pause
              presenceData.smallImageText = strings.pause
            }

            if (setting.showButtons) {
              presenceData.buttons = [
                {
                  label: 'Watch sports show',
                  url: window.location.href,
                },
              ]
            }
          }
          else if (urlpath[1] === 'collections' && urlpath[2]) {
            presenceData.details = 'Viewing Collection:'
            presenceData.state = document.querySelector(
              'h1.sc-eqamei-0.cdfQp',
            )?.textContent
          }
          else {
            switch (urlpath[1]) {
              case 'mein-account': {
                if (urlpath[2] === 'details') {
                  presenceData.details = 'My Account'
                  presenceData.state = 'Details'
                }
                else {
                  presenceData.details = 'My Account'
                }

                break
              }
              case 'abo': {
                if (urlpath[2] === 'bezahlung') {
                  presenceData.details = 'My Account'
                  presenceData.state = 'Payment method'
                }
                else if (urlpath[2] === 'rechnung') {
                  presenceData.details = 'My Account'
                  presenceData.state = 'Bills'
                }
                else {
                  presenceData.details = 'My Account'
                  presenceData.state = 'Membership'
                }

                break
              }
              case 'fsk': {
                presenceData.details = 'My Account'
                presenceData.state = 'FSK Settings'

                break
              }
              case 'ueber-joyn': {
                presenceData.details = 'About Joyn'
                break
              }
              case 'jugendschutz': {
                presenceData.details = 'Youth protection'
                break
              }
              case 'datenschutz': {
                presenceData.details = 'Privacy policy'
                break
              }
              case 'agb': {
                presenceData.details = 'Terms of service'
                break
              }
            }
          }
      }
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
