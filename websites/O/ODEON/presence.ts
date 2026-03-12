import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1414514904614043688',
})

enum ActivityAssets {
  BlueLogo = 'https://cdn.rcd.gg/PreMiD/websites/O/ODEON/assets/logo.jpeg',
  BlueWithTextLogo = 'https://cdn.rcd.gg/PreMiD/websites/O/ODEON/assets/0.jpeg',
  WhiteLogo = 'https://cdn.rcd.gg/PreMiD/websites/O/ODEON/assets/1.jpeg',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

function getUrlParts() {
  const urlpath = document.location.pathname.split('/')
  return {
    page: urlpath[1] ?? '',
    secondPage: urlpath[2] ?? '',
  }
}

presence.on('UpdateData', async () => {
  const { page, secondPage } = getUrlParts()
  const setting = {
    privacy: await presence.getSetting<boolean>('privacy'),
    logo: await presence.getSetting<number>('logo'),
  }
  const logoList = [
    ActivityAssets.BlueLogo,
    ActivityAssets.BlueWithTextLogo,
    ActivityAssets.WhiteLogo,
  ]
  const presenceData: PresenceData = {
    largeImageKey: logoList[setting.logo] ?? ActivityAssets.BlueLogo,
    startTimestamp: browsingTimestamp,
  }
  const searchBox = document.querySelector('.search-box.active-search')
  const search = searchBox?.querySelector<HTMLInputElement>('input.auto-complete')

  interface StateObj { details: string, state: string }
  type StateValue = StateObj | (() => StateObj)
  const pageStates: Record<string, Record<string, StateValue>> = { // contains all the different pages and their states
    'films': {
      '': { details: 'Films', state: 'Browsing all showings' },
      'default': () => {
        const filmTitle = document.querySelector('.v-film-title__text')?.textContent ?? ''
        return { details: 'Viewing film', state: filmTitle }
      },
    },
    'cinemas': {
      '': { details: 'Cinemas', state: 'Browsing all cinemas' },
      'default': () => {
        const cinemaName = document.querySelector('.address-container .cinema-title')?.textContent ?? ''
        return { details: 'Viewing cinema', state: cinemaName }
      },
    },
    'memberships': {
      'default': { details: 'Memberships', state: 'Browsing memberships' },
      'odeon-extras': { details: '', state: 'Browsing ODEON Extras' },
    },
    'limitless': {
      default: { details: 'Memberships', state: 'Browsing myLIMITLESS' },
    },
    'gift-shop': {
      default: { details: 'Store', state: 'Browsing gift shop' },
    },
    'offers-and-competitions': {
      default: { details: 'Offers', state: 'Browsing offers & competitions' },
    },
    'family': {
      default: { details: 'Family', state: 'Browsing family films' },
    },
    'my-account': {
      default: { details: 'My Account', state: 'Managing account' },
    },
    'ticketing': { // Ticket booking flow
      'seat-picker': { details: '', state: 'Choosing seats 🪑' },
      'ticket-picker': { details: '', state: 'Choosing ticket type 🎟️' },
      'food-and-drink': { details: '', state: 'Choosing food & drink 🍿' },
      'order-items': { details: '', state: 'Reviewing tickets 🛒' },
      'order-payment': { details: '', state: 'Finalizing order 💳' },
      'booking-confirmation': { details: '', state: 'Tickets booked 🎉' },
      'order-details': () => {
        const ticketTitle = document.querySelector('.v-film-title__text')?.textContent ?? ''
        return { state: ticketTitle, details: 'Viewing booked ticket' }
      },
      'default': () => {
        const filmTitle = document.querySelector('h2.v-film-title__text')?.textContent ?? ''
        return { details: `Booking ${filmTitle}`, state: '' }
      },
    },
    'experiences': { // Experiences page and subpages
      'food-drinks': { details: 'Experiences', state: 'Browsing food & drink' },
      'isense': { details: 'Experiences', state: 'Browsing iSense movies' },
      'imax': { details: 'Experiences', state: 'Browsing IMAX movies' },
      'dolby': { details: 'Experiences', state: 'Browsing Dolby Cinema' },
      'xl-screens': { details: 'Experiences', state: 'Browsing XL screens' },
      'laser': { details: 'Experiences', state: 'Browsing LASER movies' },
      'odeon-luxe': { details: 'Experiences', state: 'Browsing ODEON Luxe' },
      'islington-luxe': { details: 'Experiences', state: 'Luxe & Dine' },
      'vip-beds': { details: 'Experiences', state: 'Browsing VIP Beds' },
      'private-cinema-bookings': { details: 'Experiences', state: 'Browsing Private Cinema Bookings' },
      'london-cinemas-in-the-west-end': { details: 'Experiences', state: 'Browsing West End Cinemas' },
      'default': { details: 'Experiences', state: 'Browsing experiences' },
    },
    'privacy-and-legal': {
      'default': { details: 'Legal', state: 'Browsing privacy & legal' },
      'privacy-policy': { details: '', state: 'Viewing privacy policy' },
      'cookie-policy': { details: '', state: 'Viewing cookie policy' },
      'privacy-summary': { details: '', state: 'Viewing privacy summary' },
      'limitless-membership-terms-and-conditions': { details: '', state: 'Viewing myLIMITLESS T&Cs' },
      'online-purchase-terms': { details: '', state: 'Viewing online purchase T&Cs' },
      'odeon-extras-terms-and-conditions': { details: '', state: 'Viewing ODEON Extras T&Cs' },
      'website-terms-of-use': { details: '', state: 'Viewing website T&Cs' },
      'general-admission-terms': { details: '', state: 'Viewing general admission T&Cs' },
      'odeon-gift-card-terms-of-use': { details: '', state: 'Viewing gift card T&Cs' },
      'social-media-prize-draw-t-c': { details: '', state: 'Viewing prize draw T&Cs' },
      'limitless-gift-membership': { details: '', state: 'Viewing myLIMITLESS gift T&Cs' },
      'wifi-terms-of-use': { details: '', state: 'Viewing WiFi T&Cs' },
      'tell-odeon-monthly-prize-draw-terms-conditions': { details: '', state: 'Viewing monthly prize draw T&Cs' },
      'meerkat-movies-at-odeon-terms-and-conditions': { details: '', state: 'Viewing Meerkat Movies T&Cs' },
      'saver-mondays-and-discounted-extras-tickets': { details: '', state: 'Viewing Saver Mondays T&Cs' },
      'guest-ticket-terms-conditions': { details: '', state: 'Viewing guest ticket T&Cs' },
    },
    'accessibility': {
      'default': { details: 'Accessibility', state: 'Browsing accessibility info' },
      'restricted-mobility': { details: '', state: 'Viewing restricted mobility info' },
      'sight-loss': { details: '', state: 'Viewing sight loss info' },
      'hearing-loss': { details: '', state: 'Viewing hearing loss info' },
      'autism-friendly': { details: '', state: 'Viewing autism-friendly info' },
      'cea-card': { details: '', state: 'Viewing CEA card info' },
    },
    'about-us': {
      'default': { details: 'About Us', state: 'Reading about ODEON' },
      'modern-slavery-statement': { details: '', state: 'Modern slavery statement' },
    },
    'event-cinema': {
      default: { details: 'Event Cinema', state: 'Browsing event cinema' },
    },
    'corporate-events': {
      'default': { details: 'Corporate Events', state: 'Browsing corporate events' },
      'enquire-now': { details: '', state: 'Making an inquiry' },
    },
    'odeon-scene': {
      '': { details: 'ODEON Scene', state: 'Browsing ODEON Scene' },
      'all-articles': { details: 'ODEON Scene', state: 'Browsing all articles' },
      'default': () => {
        const articleTitle = document.querySelector('.component-title-container__content')?.textContent ?? ''
        return { details: 'Reading an article', state: `${articleTitle}` }
      },
    },
  }

  if (setting.privacy) {
    presenceData.details = 'Browsing ODEON Cinemas'
    presenceData.smallImageText = 'Privacy mode enabled'
    presenceData.smallImageKey = Assets.Question
  }
  else if (search) {
    presenceData.details = 'Searching'
    presenceData.state = search.value || ''
    presenceData.smallImageKey = Assets.Search
  }
  else if (!page) {
    presenceData.details = 'Homepage'
    presenceData.state = 'Browsing ODEON'
  }
  else if (pageStates[page]) {
    const states = pageStates[page]
    let stateObj
    if (typeof states[secondPage] === 'function') {
      stateObj = states[secondPage]()
    }
    else if (states[secondPage]) {
      stateObj = states[secondPage]
    }
    else if (typeof states.default === 'function') {
      stateObj = states.default()
    }
    else {
      stateObj = states.default
    }
    if (stateObj) {
      presenceData.details = stateObj.details
      presenceData.state = stateObj.state
      if (page === 'ticketing' && !presenceData.details) { // Fallback for ticket booking without a subpage
        const filmTitle = document.querySelector('h2.v-film-title__text')?.textContent ?? ''
        presenceData.details = `Booking ${filmTitle}`
      }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
