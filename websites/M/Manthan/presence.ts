import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1534951495068549271',
})

const startTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://ik.imagekit.io/rhs5tvh3k/tr:w-512,h-512/transparent%20(5).png',
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

async function getStrings() {
  return presence.getStrings({
    browsing: 'general.browsing',
    searching: 'general.search',
    reading: 'general.readingArticle',
    readButton: 'general.buttonReadArticle',
  })
}

function articleTitle(): string {
  const h1 = document.querySelector('h1')?.textContent?.trim()

  if (h1)
    return h1

  return document.title
    .replace(/\s*\|\s*Manthan$/i, '')
    .replace(/\s*-\s*Manthan$/i, '')
    .trim()
}

function shorten(text: string, max = 70): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

presence.on('UpdateData', async () => {
  const lang = await presence
    .getSetting<string>('lang')
    .catch(() => 'en')

  if (!strings || lang !== oldLang) {
    oldLang = lang
    strings = await getStrings()
  }

  const { pathname, href } = document.location

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp,
  }

  switch (true) {
    // Homepage
    case pathname === '/':
      presenceData.details = strings.browsing
      presenceData.state = 'Today\'s Headlines'
      break

      // Latest
    case pathname === '/latest':
      presenceData.details = 'Latest News'
      presenceData.state = 'Breaking & Trending'
      break

      // Feed
    case pathname === '/feed':
      presenceData.details = 'Browsing Feed'
      presenceData.state = 'Latest Stories'
      break

      // Feed Article
    case pathname.startsWith('/feed/'):
      presenceData.details = strings.reading
      presenceData.state = shorten(articleTitle())

      presenceData.smallImageKey = Assets.Reading

      presenceData.buttons = [
        {
          label: 'Read Story',
          url: href,
        },
      ]
      break

      // Article
    case pathname.startsWith('/article/'):
      presenceData.details = strings.reading
      presenceData.state = shorten(articleTitle())

      presenceData.smallImageKey = Assets.Reading

      presenceData.buttons = [
        {
          label: strings.readButton,
          url: href,
        },
      ]
      break

      // About
    case pathname === '/about':
      presenceData.details = 'About Manthan'
      presenceData.state = 'Independent Digital News'
      break

    default:
      presenceData.details = strings.browsing
      presenceData.state = 'Manthan'
      break
  }

  presence.setActivity(presenceData)
})
