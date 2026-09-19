import type MovixStrings from '../Movix.json'

declare global {
  interface StringKeys {
    movix: keyof typeof MovixStrings
  }
}

const STRING_KEYS = {
  browseHome: 'general.viewHome',
  home: 'movix.home',
  searching: 'general.search',
  searchQuery: 'general.searchFor',
  searchGlobal: 'general.searchSomething',
  searchLabel: 'general.search',
  browseMovies: 'movix.browseMovies',
  movies: 'movix.movies',
  browseSeries: 'movix.browseSeries',
  series: 'movix.series',
  browseCollections: 'movix.browseCollections',
  collections: 'movix.collections',
  viewCollection: 'movix.viewCollection',
  collectionId: 'movix.collectionId',
  viewMovie: 'general.viewAMovie',
  movieId: 'movix.movieId',
  viewSeries: 'general.viewASeries',
  seriesId: 'movix.seriesId',
  downloadMovie: 'movix.downloadMovie',
  downloadSeries: 'movix.downloadSeries',
  movieToDownload: 'movix.movieToDownload',
  seriesToDownload: 'movix.seriesToDownload',
  useDebrid: 'movix.useDebrid',
  debridService: 'movix.debridService',
  debrid: 'movix.debrid',
  browseGenre: 'general.viewAGenre',
  moviesByGenre: 'movix.moviesByGenre',
  seriesByGenre: 'movix.seriesByGenre',
  useRoulette: 'movix.useRoulette',
  randomPick: 'movix.randomPick',
  browsePlatformCatalog: 'movix.browsePlatformCatalog',
  viewPlatform: 'movix.viewPlatform',
  platformId: 'movix.platformId',
  signIn: 'movix.signIn',
  signInState: 'movix.signInState',
  createAccount: 'movix.createAccount',
  accountCreation: 'movix.accountCreation',
  bip39: 'movix.bip39',
  viewPerson: 'movix.viewPerson',
  personId: 'movix.personId',
  viewProfile: 'general.viewAProfile',
  userProfile: 'movix.userProfile',
  viewAlerts: 'movix.viewAlerts',
  alerts: 'movix.alerts',
  watchLiveTv: 'movix.watchLiveTv',
  live: 'general.live',
  viewSuggestions: 'movix.viewSuggestions',
  suggestions: 'movix.suggestions',
  viewExtension: 'movix.viewExtension',
  extension: 'movix.extension',
  viewList: 'general.viewAList',
  listId: 'movix.listId',
  browseLists: 'general.viewAList',
  listCatalog: 'movix.listCatalog',
  viewLegal: 'movix.viewLegal',
  dmca: 'movix.dmca',
  useAdmin: 'movix.useAdmin',
  administration: 'movix.administration',
  selectProfile: 'movix.selectProfile',
  manageProfiles: 'movix.manageProfiles',
  browseWishboard: 'movix.browseWishboard',
  communityRequests: 'movix.communityRequests',
  writeRequest: 'movix.writeRequest',
  newRequest: 'movix.newRequest',
  viewRequests: 'movix.viewRequests',
  myRequests: 'movix.myRequests',
  submitLink: 'movix.submitLink',
  linkSubmission: 'movix.linkSubmission',
  viewAbout: 'movix.viewAbout',
  readPrivacy: 'general.privacy',
  readTerms: 'general.terms',
  cinegraphMovie: 'movix.cinegraphMovie',
  cinegraphSeries: 'movix.cinegraphSeries',
  cinegraphPerson: 'movix.cinegraphPerson',
  cinegraph: 'movix.cinegraph',
  configureSettings: 'movix.configureSettings',
  viewTop10: 'movix.viewTop10',
  top10: 'movix.top10',
  viewWrapped: 'movix.viewWrapped',
  wrapped: 'movix.wrapped',
  wrappedYear: 'movix.wrappedYear',
  notFound: 'movix.notFound',
  error404: 'movix.error404',
  browseMovix: 'general.browsing',
  createParty: 'movix.createParty',
  newParty: 'movix.newParty',
  inParty: 'movix.inParty',
  participantsOne: 'movix.participantsOne',
  participantsMany: 'movix.participantsMany',
  joinParty: 'movix.joinParty',
  codeEntry: 'movix.codeEntry',
  codeValue: 'movix.codeValue',
  browseRooms: 'movix.browseRooms',
  publicRooms: 'movix.publicRooms',
  roomId: 'movix.roomId',
  sourceSelection: 'movix.sourceSelection',
  playing: 'general.playing',
  paused: 'general.paused',
  ended: 'movix.ended',
  externalPlayer: 'movix.externalPlayer',
  watchMovie: 'general.watchingMovie',
  watchSeries: 'general.watchingSeries',
  watchAnime: 'general.watchingAnime',
  watchContent: 'general.watchingVid',
  fallbackMovie: 'movix.fallbackMovie',
  fallbackSeries: 'movix.fallbackSeries',
  fallbackAnime: 'general.anime',
  btnViewPage: 'general.buttonViewPage',
  btnWatch: 'general.buttonWatchVideo',
  btnJoinRoom: 'movix.btnJoinRoom',
} satisfies Record<string, StringKeysResolved>

type PresenceStrings = Record<keyof typeof STRING_KEYS, string>

let currentLanguage: string | undefined
let currentStrings: PresenceStrings

export async function loadStrings(presence: Presence, language: string): Promise<void> {
  if (currentLanguage === language) {
    return
  }

  const strings = await presence.getStrings(STRING_KEYS)
  currentStrings = strings
  currentLanguage = language
}

export function getLanguage(): string {
  return (currentLanguage || 'en').replaceAll('_', '-')
}

export function s(): PresenceStrings {
  return currentStrings
}

export function format(
  template: string,
  ...args: Array<string | number>
): string {
  return template.replace(/\{(\d+)\}/g, (match, index) => {
    const value = args[Number(index)]
    return value === undefined ? match : String(value)
  })
}
