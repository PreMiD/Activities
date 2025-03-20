import { Assets } from 'premid'

const presence = new Presence({
  clientId: '634124614544392193',
})

let oldLang: string,
  newLang: string,
  strings: Awaited<ReturnType<typeof getStrings>>,
  timestamp: number

presence.on('UpdateData', async () => {
  const host = window.location.hostname.split('.')
  const path = window.location.pathname.split('/').slice(1)
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/Radio.net/assets/logo.png',
  }

  oldLang = newLang
  newLang = await presence.getSetting<string>('lang').catch(() => 'en')
  if (!strings || oldLang !== newLang)
    strings = await getStrings(newLang)

  if (host[0] === 'corporate') {
    // Corporate page
    switch (path[0]) {
      // About us, Broadcasters, Advertising, Press, Jobs, Contact
      case 'about-us':
      case 'ueber-uns':
      case 'broadcasters':
      case 'sender':
      case 'advertising':
      case 'werbung':
      case 'press':
      case 'presse':
      case 'jobs':
      case 'contact':
      case 'kontakt': {
        const item = document.querySelector<HTMLLIElement>(
          '.current_page_item',
        )?.textContent

        presenceData.details = `${host.join('.')} corporate`
        presenceData.state = `${item?.charAt(0).toUpperCase()}${item?.slice(1).toLowerCase()}`
        break
      }
      default:
        return presence.setActivity()
    }
  }
  else {
    // Main page
    switch (path[0]) {
      // Radio station
      case 's':
        // Check if the animation icon is shown
        if (
          document.querySelector<HTMLSpanElement>('.player__animate-icon')?.style.display !== 'none'
        ) {
          // Radio is playing / buffering
          timestamp ||= Date.now()

          presenceData.details = document.querySelector<HTMLHeadingElement>('h1')?.textContent
          presenceData.state = document.querySelector<HTMLDivElement>('.player__song')?.textContent
          presenceData.largeImageKey = (
            document.querySelector<HTMLDivElement>('#station')?.children[3]?.children[1]?.firstChild?.firstChild?.firstChild as HTMLImageElement
          )?.src
          presenceData.smallImageText = strings.play
          presenceData.smallImageKey = Assets.Play
          presenceData.startTimestamp = timestamp
        }
        else {
          // Radio is paused
          timestamp = 0

          presenceData.details = document.querySelector<HTMLHeadingElement>('h1')?.textContent
          presenceData.largeImageKey = (
            document.querySelector<HTMLDivElement>('#station')?.children[3]?.children[1]?.firstChild?.firstChild?.firstChild as HTMLImageElement
          )?.src
          presenceData.smallImageText = strings.pause
          presenceData.smallImageKey = Assets.Pause
        }
        break
        // Podcast
      case 'p':
        // Check if the animation icon is shown
        if (
          document.querySelector<HTMLSpanElement>('.player__animate-icon')?.style.display !== 'none'
        ) {
          // Podcast is playing / buffering
          const times = document
            .querySelector<HTMLDivElement>('.player__timing-wrap')
            ?.textContent
            ?.split('|') ?? []
          const timestamps = presence.getTimestamps(
            presence.timestampFromFormat(times[0] ?? ''),
            presence.timestampFromFormat(times[1] ?? ''),
          )

          presenceData.details = document.querySelector<HTMLHeadingElement>('h1')?.textContent
          presenceData.state = document.querySelector<HTMLDivElement>('.player__song')?.textContent
          presenceData.largeImageKey = (
            document.querySelector<HTMLDivElement>('#podcast')?.children[1]?.children[1]?.firstChild?.firstChild?.firstChild as HTMLImageElement
          )?.src
          presenceData.smallImageText = strings.play
          presenceData.smallImageKey = Assets.Play;
          [presenceData.startTimestamp, presenceData.endTimestamp] = timestamps
        }
        else {
          // Podcast is paused
          presenceData.details = document.querySelector<HTMLHeadingElement>('h1')?.textContent
          presenceData.state = document.querySelector<HTMLDivElement>('.player__song')?.textContent
          presenceData.largeImageKey = (
            document.querySelector<HTMLDivElement>('#podcast')?.children[1]?.children[1]?.firstChild?.firstChild?.firstChild as HTMLImageElement
          )?.src
          presenceData.smallImageText = strings.pause
          presenceData.smallImageKey = Assets.Pause
        }
        break
        // Search
      case 'search':
        presenceData.details = new URLSearchParams(window.location.search).get(
          'q',
        )
        presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
        presenceData.smallImageText = strings.search
        presenceData.smallImageKey = Assets.Search
        break
        // Genre, Topic, Country, City, Local stations, Top stations
      case 'genre':
      case 'topic':
      case 'country':
      case 'city':
      case 'local-stations':
      case 'top-stations':
        presenceData.details = document.querySelector<HTMLHeadingElement>('h1')?.textContent
        presenceData.smallImageText = strings.browsing
        presenceData.smallImageKey = Assets.Reading
        break
        // Choose your country, Contact, App, Terms and conditions, Privacy policy, Imprint
      case 'country-selector':
      case 'contact':
      case 'app':
      case 'terms-and-conditions':
      case 'privacy-policy':
      case 'imprint':
        presenceData.details = document.title
        break
        // Startpage, Unknown
      default:
        return presence.setActivity()
    }
  }
})

async function getStrings(lang: string) {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      search: 'general.searching',
      browsing: 'general.browsing',
    },
    lang,
  )
}
