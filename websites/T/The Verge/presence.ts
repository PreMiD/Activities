const presence = new Presence({
  clientId: '1375484913482203198',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/HvSPwP9.png',
}

async function getStrings() {
  return presence.getStrings({
    browsing: 'general.browsing',
    viewHome: 'general.viewHome',
    searchFor: 'general.searchFor',
    viewPage: 'general.viewPage',
    buttonViewPage: 'general.buttonViewPage',
    read: 'general.readingArticle',
    viewCategory: 'general.viewCategory',
    viewProfile: 'general.viewProfile',
  })
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, search } = document.location
  const strings = await getStrings()

  switch (pathname.split('/')[1]) {
    case 'authors':
      presenceData.details = strings.viewProfile
      presenceData.state = document.querySelector('.duet--article--dangerously-set-cms-markup')
      presenceData.largeImageKey = document
        .querySelector<HTMLMetaElement>('meta[property="og:image"]')
        ?.getAttribute('content') ?? ActivityAssets.Logo
      break
    case 'search':
      presenceData.details = strings.searchFor
      presenceData.state = decodeURIComponent(
        search?.split('=')[1]?.replaceAll('+', ' ') ?? '',
      )
      break
    case 'contact-the-verge':
      presenceData.details = 'Contacting The Verge'
      break
    case 'pages':
    case 'ethics-statement':
    case 'about-the-verge':
    case 'community-guidelines':
      presenceData.details = strings.viewPage
      presenceData.state = document.title.replace(' | The Verge', '')
      break
    case 'account':
      presenceData.details = 'Viewing Profile'
      break
    case 'tech':
    case 'apple':
    case 'amazon':
    case 'facebook':
    case 'google':
    case 'microsoft':
    case 'samsung':
    case 'business':
    case 'policy':
    case 'creators':
    case 'mobile':
    case 'cyber-security':
    case 'transportation':
    case 'reviews':
    case 'this-is-my-next':
    case 'good-deals':
    case 'gift-guide':
    case 'laptop-review':
    case 'headphone-review':
    case 'phone-review':
    case 'tablet-review':
    case 'smart-home-review':
    case 'smartwatch-review':
    case 'speaker-review':
    case 'drone-review':
    case 'science':
    case 'space':
    case 'energy':
    case 'environment':
    case 'health':
    case 'coronavirus':
    case 'entertainment':
    case 'games':
    case 'tv':
    case 'film':
    case 'hot-pod-newsletter':
    case 'ai-artificial-intelligence':
    case 'cars':
    case 'electric-cars':
    case 'autonomous-cars':
    case 'ride-sharing':
    case 'scooters':
    case 'features':
    case 'featured-video':
    case 'podcasts':
    case 'decoder-podcast-with-nilay-patel':
    case 'the-vergecast':
    case 'newsletters':
    case 'command-line-newsletter':
    case 'notepad-microsoft-newsletter':
      presenceData.details = strings.viewCategory
      presenceData.state = document
        .querySelector<HTMLMetaElement>('meta[property="og:title"]')
        ?.getAttribute('content')
      break
    default: {
      presenceData.details = strings.viewHome
      if (pathname.split('/')[1]) {
        presenceData.details = strings.browsing
      }
      if (pathname.split('/')[3]) {
        presenceData.details = strings.read
        presenceData.state = document
          .querySelector<HTMLMetaElement>('meta[property="og:title"]')
          ?.getAttribute('content')
        presenceData.largeImageKey = document
          .querySelector<HTMLMetaElement>('meta[property="og:image"]')
          ?.getAttribute('content') ?? ActivityAssets.Logo
        presenceData.buttons = [
          {
            label: strings.buttonViewPage,
            url: href,
          },
        ]
      }
    }
  }

  presence.setActivity(presenceData)
})
