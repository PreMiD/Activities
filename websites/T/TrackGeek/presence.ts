const presence = new Presence({
  clientId: '1468261449762738297',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = 'https://i.imgur.com/wrdklQH.png',
}

async function getStrings() {
  return presence.getStrings({
    buttonViewPage: 'general.buttonViewPage',
    viewMember: 'general.viewMember',
    viewPage: 'general.viewPage',
    viewGame: 'general.viewGame',
    buttonViewGame: 'general.buttonViewGame',
    viewTV: 'general.viewShow',
    buttonViewTV: 'general.buttonViewShow',
    buttonViewMovie: 'general.buttonViewMovie',
    viewMovie: 'general.viewMovie',
    browsing: 'general.browsing',
    buttonWatchVideo: 'general.buttonWatchVideo',
    settings: 'TrackGeek.settings',
    viewFranchise: 'TrackGeek.viewFranchise',
    buttonViewFranchise: 'TrackGeek.buttonViewFranchise',
    viewCompany: 'TrackGeek.viewCompany',
    buttonViewCompany: 'TrackGeek.buttonViewCompany',
    viewCast: 'TrackGeek.viewCast',
    buttonViewCast: 'TrackGeek.buttonViewCast',
    viewManga: 'general.viewManga',
    buttonViewManga: 'TrackGeek.buttonViewManga',
    viewAnime: 'general.viewAnime',
    buttonViewAnime: 'TrackGeek.buttonViewAnime',
    viewBook: 'TrackGeek.viewBook',
    buttonViewBook: 'TrackGeek.buttonViewBook',
    tvShows: 'TrackGeek.tvShows',
    mangas: 'TrackGeek.mangas',
    animes: 'TrackGeek.animes',
    books: 'TrackGeek.books',
    games: 'TrackGeek.games',
    movies: 'TrackGeek.movies',
    searchFor: 'general.searchFor'
  })
}

function textContent(tags: string) {
  return document.querySelector(tags)?.textContent?.trim()
}

function getImage(tags: string) {
  return document.querySelector<HTMLImageElement>(tags)?.src ?? ActivityAssets.Logo
}

presence.on('UpdateData', async () => {
  const { pathname, href, search } = document.location
  const path = pathname.split('/')
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp
  }
 const strings = await getStrings()

  switch (path[1]) {
    case 'feed': 
      presenceData.details = 'Browsing Feed'
      break
    case 'donate': 
      presenceData.details = strings.viewPage
      presenceData.state = textContent('h2') ?? undefined
      break
    case 'shop':
    case 'add-data':
    case 'credits':
    case 'tos':
    case 'privacy-policy':
    case 'compare':
      presenceData.details = strings.viewPage
      presenceData.state = textContent('h1') ?? undefined
      break
    case 'notifications': 
    case 'billing':
      presenceData.details = strings.viewPage
      presenceData.state = textContent('div.font-semibold') ?? undefined
      break
    case 'settings':
      presenceData.details = strings.viewPage
      presenceData.state = strings.settings
      break
    case 'game':
      presenceData.details = strings.viewPage
      presenceData.state = "Games"
        if (path[2]) {
          switch (path[2]) {
            case 'recent':
            case 'popular':
            case 'upcoming':
            case 'anticipated':
              presenceData.details = strings.viewPage
              presenceData.state = textContent('.text-2xl') ?? undefined
              break
            case 'franchises':
              presenceData.details = strings.viewFranchise
              presenceData.state = textContent('h1') ?? undefined
              presenceData.largeImageKey = getImage('img.h-60')
              presenceData.buttons = [
                {
                  label: strings.buttonViewFranchise,
                  url: href,
                },
              ]
              break
            case 'company':
              presenceData.details = strings.viewCompany
              presenceData.state = textContent('h1') ?? undefined
              presenceData.largeImageKey = getImage('img.object-contain')
              presenceData.buttons = [
                {
                  label: strings.buttonViewCompany,
                  url: href,
                },
              ]
              break
            default:
              presenceData.details = strings.viewGame
              presenceData.state = textContent('h1') ?? undefined
              presenceData.largeImageKey = getImage('img.object-cover')
              presenceData.buttons = [
                {
                  label: strings.buttonViewGame,
                  url: href,
                },
              ]
              break
          }
        }
      break
    case 'cast':
      presenceData.details = strings.viewCast
      presenceData.state = textContent('h1') ?? undefined
      presenceData.largeImageKey = getImage('img.object-cover')
      presenceData.buttons = [
        {
          label: strings.buttonViewCast,
          url: href,
        },
      ]
      break
    case 'anime':
      presenceData.details = strings.viewPage
      presenceData.state = "Animes"
        if (path[2]) {
          switch (path[2]) {
            case 'airing':
            case 'recommendations':
            case 'upcoming':
            case 'top':
              presenceData.details = strings.viewPage
              presenceData.state = textContent('.text-2xl') ?? undefined
              break
            case 'company':
              presenceData.details = strings.viewCompany
              presenceData.state = textContent('h1') ?? undefined
              presenceData.largeImageKey = getImage('img.object-contain')
              presenceData.buttons = [
                {
                  label: strings.buttonViewCompany,
                  url: href,
                },
              ]
              break
            default:
              presenceData.details = strings.viewAnime
              presenceData.state = textContent('h1') ?? undefined
              presenceData.largeImageKey = getImage('img.object-cover')
              presenceData.buttons = [
                {
                  label: strings.buttonViewAnime,
                  url: href,
                },
              ]
              break
          }
        }
      break
    case 'book':
      presenceData.details = strings.viewPage
      presenceData.state = "Books"
        if (path[2]) {
          switch (path[2]) {
            case 'trending':
            case 'upcoming':
              presenceData.details = strings.viewPage
              presenceData.state = textContent('.text-2xl') ?? undefined
              break
            case 'franchises':
              presenceData.details = strings.viewFranchise
              presenceData.state = textContent('h1') ?? undefined
              presenceData.buttons = [
                {
                  label: strings.buttonViewFranchise,
                  url: href,
                },
              ]
              break
            default:
              presenceData.details = strings.viewBook
              presenceData.state = textContent('h1') ?? undefined
              presenceData.largeImageKey = getImage('img.object-cover')
              presenceData.buttons = [
                {
                  label: strings.buttonViewBook,
                  url: href,
                },
              ]
              break
          }
        }
      break
    case 'manga':
      presenceData.details = strings.viewPage
      presenceData.state = "Mangas"
        if (path[2]) {
          switch (path[2]) {
            case 'publishing':
            case 'recommendations':
            case 'upcoming':
            case 'top':
              presenceData.details = strings.viewPage
              presenceData.state = textContent('.text-2xl') ?? undefined
              break
            case 'cast':
              presenceData.details = strings.viewCast
              presenceData.state = textContent('h1') ?? undefined
              presenceData.largeImageKey = getImage('img.object-cover')
              presenceData.buttons = [
                {
                  label: strings.buttonViewCast,
                  url: href,
                },
              ]
              break
            default:
              presenceData.details = strings.viewManga
              presenceData.state = textContent('h1') ?? undefined
              presenceData.largeImageKey = getImage('img.object-cover')
              presenceData.buttons = [
                {
                  label: strings.buttonViewManga,
                  url: href,
                },
              ]
              break
          }
        }
      break
    case 'movie':
      presenceData.details = strings.viewPage
      presenceData.state = "Movies"
        if (path[2]) {
          switch (path[2]) {
            case 'airing':
            case 'popular':
            case 'trending':
            case 'upcoming':
              presenceData.details = strings.viewPage
              presenceData.state = textContent('.text-2xl') ?? undefined
              break
            case 'franchises':
              presenceData.details = strings.viewFranchise
              presenceData.state = textContent('h1') ?? undefined
              presenceData.largeImageKey = getImage('img.h-60')
              presenceData.buttons = [
                {
                  label: strings.buttonViewFranchise,
                  url: href,
                },
              ]
              break
            case 'company':
              presenceData.details = strings.viewCompany
              presenceData.state = textContent('h1') ?? undefined
              presenceData.largeImageKey = getImage('img.object-contain')
              presenceData.buttons = [
                {
                  label: strings.buttonViewCompany,
                  url: href,
                },
              ]
              break
            default:
              presenceData.details = strings.viewMovie
              presenceData.state = textContent('h1') ?? undefined
              presenceData.largeImageKey = getImage('img.object-cover')
              presenceData.buttons = [
                {
                  label: strings.buttonViewMovie,
                  url: href,
                },
              ]
              break
          }
        }
      break
    case 'tv':
      presenceData.details = strings.viewPage
      presenceData.state = "TV Shows"
        if (path[2]) {
          switch (path[2]) {
            case 'airing':
            case 'popular':
            case 'trending':
            case 'upcoming':
              presenceData.details = strings.viewPage
              presenceData.state = textContent('.text-2xl') ?? undefined
              break
            case 'company':
              presenceData.details = strings.viewCompany
              presenceData.state = textContent('h1') ?? undefined
              presenceData.largeImageKey = getImage('img.object-contain')
              presenceData.buttons = [
                {
                  label: strings.buttonViewCompany,
                  url: href,
                },
              ]
              break
            default:
              presenceData.details = strings.viewTV
              presenceData.state = textContent('h1') ?? undefined
              presenceData.largeImageKey = getImage('img.object-cover')
              presenceData.buttons = [
                {
                  label: strings.buttonViewTV,
                  url: href,
                },
              ]
              break
          }
        }
      break
    case 'search':
      presenceData.details = strings.searchFor
      const query = new URLSearchParams(search).get('query')?.trim()
      const category = textContent('span[data-slot=select-value]')
      presenceData.state = query
        ? category
          ? `${category} ${query}`
          : query
        : undefined
      break
    case 'user':
      presenceData.details = strings.viewMember + " " +  textContent('span.font-bold')
      presenceData.state = textContent('div[role=tablist] > button[data-state=active]')?.replace(/\s*\([^)]*\)/g, '').trim() || undefined
      presenceData.largeImageKey = getImage('img.aspect-square')
      presenceData.buttons = [
        {
          label: strings.buttonViewPage,
          url: href,
        },
      ]
      break
    default: 
    presenceData.details = strings.browsing
    break
  }

  presence.setActivity(presenceData)
})
