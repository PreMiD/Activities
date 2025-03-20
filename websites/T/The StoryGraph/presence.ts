const presence = new Presence({
  clientId: '1345071934563418153',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/T/The%20StoryGraph/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings({
    browsing: 'general.browsing',
    viewHome: 'general.viewHome',
    searchFor: 'general.searchFor',
    viewPage: 'general.viewPage',
    terms: 'general.terms',
    privacy: 'general.privacy',
    buttonViewBook: 'thestorygraph.buttonViewBook',
    viewBook: 'thestorygraph.viewBook',
    viewSimilarBook: 'thestorygraph.viewSimilarBook',
    viewEdition: 'thestorygraph.viewEdition',
    viewContentWarnings: 'thestorygraph.viewContentWarnings',
    readBookClubQuestions: 'thestorygraph.readBookClubQuestions',
    readReviews: 'thestorygraph.readReviews',
    readReview: 'thestorygraph.readReview',
    bookTickets: 'thestorygraph.bookTickets',
    buddyReads: 'thestorygraph.buddyReads',
    readalongs: 'thestorygraph.readalongs',
    viewStats: 'thestorygraph.viewStats',
    viewReadingChallenges: 'thestorygraph.viewReadingChallenges',
    viewCommunity: 'thestorygraph.viewCommunity',
    viewBookClubs: 'thestorygraph.viewBookClubs',
    viewSimilarUsers: 'thestorygraph.viewSimilarUsers',
    viewEnteredGiveaways: 'thestorygraph.viewEnteredGiveaways',
    viewGiveaway: 'thestorygraph.viewGiveaway',
    viewGiveaways: 'thestorygraph.viewGiveaways',
    buttonViewGiveaway: 'thestorygraph.buttonViewGiveaway',
    viewNotifications: 'thestorygraph.viewNotifications',
    viewPreferences: 'thestorygraph.viewPreferences',
    buttonReadReview: 'thestorygraph.buttonReadReview',
    viewProfile: 'thestorygraph.viewProfile',
    buttonViewProfile: 'thestoryGraph.buttonViewProfile',
    editProfile: 'thestorygraph.editProfile',
    viewReadingJournal: 'thestorygraph.viewReadingJournal',
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
    case 'books': {
      if (pathname.split('/')[3] === 'similar') {
        presenceData.details = strings.viewSimilarBook
        presenceData.state = document.querySelector('.standard-link')?.textContent
      }
      if (pathname.split('/')[3] === 'editions') {
        presenceData.details = strings.viewEdition
        presenceData.state = document.querySelector('h3:nth-child(1) > a:nth-child(2)')?.textContent
      }
      if (pathname.split('/')[3] === 'content_warnings') {
        presenceData.details = strings.viewContentWarnings
        presenceData.state = document.querySelector('.standard-link')?.textContent
      }
      else {
        presenceData.details = strings.viewBook
        presenceData.state = document.title.slice(0, document.title.length - '| The StoryGraph'.length).trim()
        presenceData.buttons = [
          {
            label: strings.buttonViewBook,
            url: href,
          },
        ]
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.book-cover >img')?.src ?? ActivityAssets.Logo
      }
      break
    }
    case 'users': {
      switch (pathname.split('/')[2]) {
        case 'sign_in':
        case 'password':
        case 'sign_up': {
          presenceData.details = strings.viewPage
          presenceData.state = 'Login'
          break
        }
      }
      break
    }
    case 'plus': {
      presenceData.details = strings.viewPage
      presenceData.state = 'The StoryGraph Plus'
      break
    }
    case 'app': {
      presenceData.details = strings.viewPage
      presenceData.state = 'App'
      break
    }
    case 'terms-of-service': {
      presenceData.details = strings.viewPage
      presenceData.state = strings.terms
      break
    }
    case 'privacy': {
      presenceData.details = strings.viewPage
      presenceData.state = strings.privacy
      break
    }
    case 'browse': {
      presenceData.details = strings.browsing
      if (search.includes('search_term')) {
        presenceData.details = strings.searchFor
        presenceData.state = decodeURIComponent(
          search?.split('=')[1] ?? '',
        )
      }
      break
    }
    case 'book_club_questions': {
      presenceData.details = strings.readBookClubQuestions
      presenceData.state = document.querySelector('.text-lg')?.textContent
      break
    }
    case 'book_reviews': {
      presenceData.details = strings.readReviews
      presenceData.state = document.querySelector('.standard-link')?.textContent
      break
    }
    case 'reviews': {
      presenceData.details = strings.readReview
      presenceData.state = document.querySelector('h4 > .standard-link')?.textContent
      presenceData.buttons = [
        {
          label: strings.buttonReadReview,
          url: href,
        },
      ]
      break
    }
    case 'book_tickets': {
      presenceData.details = strings.bookTickets
      break
    }
    case 'readalongs': {
      presenceData.details = strings.readalongs
      break
    }
    case 'buddy-reads': {
      presenceData.details = strings.buddyReads
      break
    }
    case 'community': {
      presenceData.details = strings.viewCommunity
      break
    }
    case 'book_clubs': {
      presenceData.details = strings.viewBookClubs
      break
    }
    case 'similar-users': {
      presenceData.details = strings.viewSimilarUsers
      break
    }
    case 'giveaway_entries': {
      presenceData.details = strings.viewEnteredGiveaways
      break
    }
    case 'stats': {
      presenceData.details = strings.viewStats
      break
    }
    case 'reading_challenges': {
      presenceData.details = strings.viewReadingChallenges
      break
    }
    case 'giveaways': {
      presenceData.details = strings.viewGiveaways
      if (pathname.split('/')[2]) {
        presenceData.details = strings.viewGiveaway
        presenceData.state = document.querySelector('h2.text-base')?.textContent
        presenceData.buttons = [
          {
            label: strings.buttonViewGiveaway,
            url: href,
          },
        ]
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('img.rounded-sm')?.src ?? ActivityAssets.Logo
      }
      break
    }
    case 'profile': {
      presenceData.details = strings.viewProfile
      presenceData.buttons = [
        {
          label: strings.buttonViewProfile,
          url: href,
        },
      ]
      presenceData.state = document.querySelector('div.w-max')?.textContent?.replace('Edit your profile', '')
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>('img.object-cover')?.src ?? ActivityAssets.Logo
      if (pathname.split('/')[2] === 'edit') {
        presenceData.details = strings.editProfile
      }
      break
    }
    case 'currently-reading':
    case 'books-read':
    case 'to-read':
    case 'five_star_reads': {
      presenceData.details = strings.viewPage
      // eslint-disable-next-line unicorn/prefer-dom-node-text-content
      presenceData.state = document.querySelector<HTMLHeadingElement>('.page-heading')?.innerText?.trim() ?? null
      break
    }
    case 'journal': {
      presenceData.details = strings.viewReadingJournal
      break
    }
    case 'notifications': {
      presenceData.details = strings.viewNotifications
      break
    }
    case 'preferences': {
      presenceData.details = strings.viewPreferences
      break
    }
    default: {
      if (pathname.split('/')[1]) {
        presenceData.details = strings.browsing
      }
      else {
        presenceData.details = strings.viewHome
      }
      break
    }
  }

  presence.setActivity(presenceData)
})
