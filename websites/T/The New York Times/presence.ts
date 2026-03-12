import { Assets } from 'premid'

const presence = new Presence({
  clientId: '813781191308083239',
})
const time = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const title = document.title.replace(' - The New York Times', '')
  const setting = await getSettings()
  const { pathname, hostname, href, search } = window.location
  const path = pathname.split('/')
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/The%20New%20York%20Times/assets/logo.jpg',
    startTimestamp: time,
  }

  if (hostname === 'www.nytimes.com') {
    if (setting.buttons && !setting.privacy) {
      presenceData.buttons = [
        {
          label: 'View Page',
          url: href,
        },
      ]
    }

    if (
      ((path[1] === 'international' || path[1] === 'ca' || path[1] === 'es')
        && !path[2])
      || !path[1]
    ) {
      presenceData.details = 'Viewing Home Page'
    }
    else if (pathname.includes('/interactive/')) {
      presenceData.details = 'Viewing an Interactive:'
      if (!setting.privacy)
        presenceData.state = title
    }
    else if (
      pathname.includes('/section/')
      || pathname.includes('/spotlight/podcasts')
    ) {
      presenceData.details = 'Viewing a Section Page:'
      if (!setting.privacy)
        presenceData.state = title
    }
    else if (pathname.includes('/destination/')) {
      presenceData.details = 'Viewing a Destination Page:'
      if (!setting.privacy)
        presenceData.state = title
    }
    else if (pathname.includes('/reviews/')) {
      presenceData.details = 'Viewing a Review Page:'
      if (!setting.privacy)
        presenceData.state = title
    }
    else if (pathname.includes('/column/')) {
      presenceData.details = 'Viewing a Column Page:'
      if (!setting.privacy)
        presenceData.state = title
    }
    else if (pathname.includes('/search')) {
      presenceData.details = setting.privacy ? 'Searching' : 'Searching for:'
      if (!setting.privacy)
        presenceData.state = new URLSearchParams(search).get('query')

      if (setting.buttons && !setting.privacy) {
        presenceData.buttons = [
          {
            label: 'Show Search Results',
            url: href,
          },
        ]
      }
    }
    else if (pathname.includes('/video/')) {
      presenceData.details = 'Viewing a Video Section:'
      presenceData.state = title
    }
    else if (hasDatePath(pathname) && pathname.includes('/podcasts/')) {
      const audioPlayer = document.querySelector('audio')
      const podcast = document.querySelector('span.css-1f76qa2 span')
      const podcastLogo = document.querySelector<HTMLImageElement>(
        'span.css-1f76qa2 img',
      )

      presenceData.details = setting.privacy
        ? 'Listening to a Podcast'
        : 'Listening to a Podcast:'
      if (podcast && !setting.privacy)
        presenceData.state = `${podcast.textContent}: ${title}`

      if (audioPlayer && !Number.isNaN(audioPlayer.duration)) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(audioPlayer)

        if (audioPlayer.paused) {
          delete presenceData.endTimestamp
          presenceData.startTimestamp = time
        }
      }

      if (setting.buttons && !setting.privacy) {
        presenceData.buttons = [
          {
            label: 'Listen to Podcast',
            url: href,
          },
        ]
      }

      if (setting.podcastLogo && !setting.privacy && podcastLogo)
        presenceData.largeImageKey = await getShortURL(podcastLogo.src)
    }
    else if (path[1] === 'by' && path[2]) {
      const author = document.querySelector('h1.css-1uxfi68.e16wpn5v0')?.textContent
        ?? 'Unknown'

      presenceData.details = 'Viewing an Author Page:'
      presenceData.state = author

      if (document.querySelector('div.css-cnx41t img')) {
        presenceData.smallImageKey = await getShortURL(
          document.querySelector<HTMLImageElement>('div.css-cnx41t img')!.src,
        )
        presenceData.smallImageText = author
      }
    }
    else if (hasDatePath(pathname) && path[4]) {
      const author = document.querySelector<HTMLImageElement>(
        'img.css-1bfqq7u.ey68jwv2',
      )
      const authors = document.querySelector('p.css-aknsld.e1jsehar1')
      const headline = document.querySelector('h1[data-testid="headline"]')?.textContent
        ?? title
      const isLive = document.querySelector(
        'span span.css-bwjyn0.live-blog-header-live-label[data-active="true"]',
      )
      const wasLive = document.querySelector('span.css-233int.e16638kd4')

      presenceData.details = setting.privacy
        ? 'Reading an Article'
        : setting.moreDetails && !isLive && !wasLive
          ? headline
          : 'Reading an Article:'

      if (!setting.privacy) {
        presenceData.state = setting.moreDetails && !isLive && !wasLive
          ? `${authors?.textContent ?? `By ${author?.title ?? 'Unknown'}`}, ${
            document.querySelector('time span')?.textContent
          }`
          : headline
      }

      if (setting.buttons && !setting.privacy) {
        presenceData.buttons = [
          {
            label: 'Read Article',
            url: href,
          },
        ]
      }

      if (isLive) {
        presenceData.smallImageKey = Assets.Live
        presenceData.smallImageText = 'Live'
      }
      else if (setting.articleAuthor && !setting.privacy && author) {
        presenceData.smallImageKey = await getShortURL(author.src)
        presenceData.smallImageText = authors?.textContent ?? `By ${author.title}`
      }
    }
  }
  else if (hostname === 'myaccount.nytimes.com') {
    presenceData.details = 'Managing Account'

    if (!setting.privacy) {
      switch (path[2]) {
        case 'subscription': {
          presenceData.state = 'Subscription Overview'
          break
        }
        case 'billing': {
          presenceData.state = 'Billing History'
          break
        }
        case 'settings': {
          presenceData.state = 'Emails and Settings'
          break
        }
        case 'change-email': {
          presenceData.state = 'Change Email'
          break
        }
        case 'forgot-password': {
          presenceData.state = 'Reset Password'
          break
        }
        default:
          if (path[1] === 'get-started' && path[2] === 'manage-billing')
            presenceData.state = 'Payment details'
      }
    }
  }

  if (!presenceData.state)
    delete presenceData.state

  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})

const shortenedURLs: Record<string, string> = {}
async function getShortURL(url: string) {
  if (!url || url.length < 256)
    return url
  if (shortenedURLs[url])
    return shortenedURLs[url]
  try {
    const pdURL = await (
      await fetch(`https://pd.premid.app/create/${url}`)
    ).text()
    shortenedURLs[url] = pdURL
    return pdURL
  }
  catch (err) {
    presence.error(err as string)
    return url
  }
}

function hasDatePath(pathname: string) {
  return /\d{4}\/\d{2}\/\d{2}/.test(pathname)
}

async function getSettings() {
  const settings = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('podcastLogo'),
    presence.getSetting<boolean>('articleAuthor'),
    presence.getSetting<boolean>('moreDetails'),
  ])
  const names = [
    'privacy',
    'buttons',
    'podcastLogo',
    'articleAuthor',
    'moreDetails',
  ]
  const obj: {
    [key: string]: boolean
  } = {}

  for (const [i, name] of names.entries()) obj[name] = settings[i]!

  return obj
}
