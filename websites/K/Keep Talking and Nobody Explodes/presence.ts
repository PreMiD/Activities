import { Assets } from 'premid'

const presence = new Presence({
  clientId: '681116862930747520',
})

let oldLang: string
let newLang: string
let strings: Awaited<ReturnType<typeof getStrings>>
let timestamp = 0
let previous: Location
let current: Location

presence.on('UpdateData', async () => {
  const path = current.pathname.split('/').slice(1)
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/K/Keep%20Talking%20and%20Nobody%20Explodes/assets/logo.png',
  }

  oldLang = newLang
  newLang = await presence.getSetting<string>('lang').catch(() => 'en')
  if (!strings || oldLang !== newLang)
    strings = await getStrings(newLang)
  current = window.location

  if (current.hostname.split('.')[0] === 'bombmanual') {
    // Bomb manual page
    switch (isLanguageCode(path[0]!) ? path[1] : path[0]) {
      // Web manual, PDF manual
      case 'web':
      case 'print': {
        if (timestamp === 0 || isNewLocation(previous, current))
          timestamp = Date.now()

        const pages = [...document.querySelectorAll<HTMLDivElement>('.page')]
        const page = Math.round(
          (window.scrollY / getDocumentHeight()) * (pages.length - 1),
        )

        presenceData.details = document
          .querySelector<HTMLTitleElement>('.title')
          ?.textContent
          ?.replace(/\n|\t/g, '')
        presenceData.smallImageText = strings.reading
        presenceData.smallImageKey = Assets.Reading
        presenceData.startTimestamp = timestamp

        if (page === 0) {
          presenceData.state = document.querySelector<HTMLHeadingElement>(
            '.versioning',
          )?.firstChild?.textContent
        }
        else {
          presenceData.state = `${strings.page} ${page + 1} / ${
            pages.length
          }: ${pages[page]?.children[0]?.children[1]?.textContent}`
        }
        break
      }
      // How to play, Language select
      case 'how-to-play-pc.html':
      case 'how-to-play-mobile.html':
      case 'how-to-play-switch.html':
      case 'how-to-play-xbox.html':
      case 'how-to-play-playstation.html':
      case 'how-to-play-vr.html':
      case 'how-to-play-psvr.html':
      case 'how-to-play-gear-vr.html':
      case 'how-to-play-oculus-go.html':
      case 'how-to-play-oculus-quest.html':
      case 'how-to-play-daydream.html':
      case 'language':
        presenceData.details = document.title
        break
        // Startpage, Unknown
      default:
        return presence.setActivity()
    }
  }
  else {
    // Main page
    switch (path[0]) {
      // Contact Us, Privacy Policy
      case 'contact-us':
      case 'privacy-policy':
        presenceData.details = document.querySelector<HTMLHeadingElement>('h1')?.textContent
          ?? document.title
        break
        // Presskit
      case 'presskit':
        presenceData.details = 'Presskit'
        break
        // How To Play Remotely
      case 'how-to-play-remotely':
        presenceData.details = 'How To Play Remotely'
        break
        // Mobile app
      case 'mobile':
        presenceData.details = 'Mobile App'
        break
        // Translation FAQ
      case 'translation-faq':
        presenceData.details = 'Translation FAQ'
        break
      case 'faq':
        presenceData.details = 'FAQ'

        if (window.location.hash?.length > 0) {
          presenceData.state = document.querySelector(
            window.location.hash,
          )?.children[0]?.children[0]?.children[0]?.children[0]?.children[0]?.textContent
        }
        break
        // Commercial Licensing
      case 'commercial-license':
        presenceData.details = 'Commercial Licensing'
        break
        // Non-Commercial Use
      case 'non-commercial-use':
        presenceData.details = 'Non-Commercial Use'
        break
        // Startpage, Unknown
      default:
        return presence.setActivity()
    }
  }

  presence.setActivity(presenceData)
  previous = current
})

async function getStrings(lang: string) {
  return presence.getStrings(
    {
      reading: 'general.reading',
      page: 'general.page',
    },
    lang,
  )
}

function getDocumentHeight() {
  const { body } = document
  const { documentElement: html } = document

  return Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight,
  )
}

function isLanguageCode(text: string) {
  return /^[a-z]{2}(?:-[A-Z]{2})?$/.test(text)
}

function isNewLocation(previous: Location, current: Location) {
  return (
    !previous
    || !current
    || previous.hostname !== current.hostname
    || previous.pathname !== current.pathname
    || previous.protocol !== current.protocol
    || previous.port !== current.port
  )
}
