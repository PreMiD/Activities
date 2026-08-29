export type PresenceLanguage = 'fr' | 'en'

export interface PresenceStrings {
  browseHome: string
  home: string
  searching: string
  searchQuery: string
  searchGlobal: string
  searchLabel: string
  browseMovies: string
  movies: string
  browseSeries: string
  series: string
  browseCollections: string
  collections: string
  viewCollection: string
  collectionId: string
  viewMovie: string
  movieId: string
  viewSeries: string
  seriesId: string
  downloadMovie: string
  downloadSeries: string
  movieToDownload: string
  seriesToDownload: string
  useDebrid: string
  debridService: string
  debrid: string
  browseGenre: string
  moviesByGenre: string
  seriesByGenre: string
  useRoulette: string
  randomPick: string
  browsePlatformCatalog: string
  viewPlatform: string
  platformId: string
  signIn: string
  signInState: string
  createAccount: string
  accountCreation: string
  bip39: string
  viewPerson: string
  personId: string
  viewProfile: string
  userProfile: string
  viewAlerts: string
  alerts: string
  watchLiveTv: string
  live: string
  viewSuggestions: string
  suggestions: string
  viewExtension: string
  extension: string
  viewList: string
  listId: string
  browseLists: string
  listCatalog: string
  viewLegal: string
  dmca: string
  useAdmin: string
  administration: string
  selectProfile: string
  manageProfiles: string
  browseWishboard: string
  communityRequests: string
  writeRequest: string
  newRequest: string
  viewRequests: string
  myRequests: string
  submitLink: string
  linkSubmission: string
  viewAbout: string
  readPrivacy: string
  readTerms: string
  cinegraphMovie: string
  cinegraphSeries: string
  cinegraphPerson: string
  cinegraph: string
  configureSettings: string
  viewTop10: string
  top10: string
  viewWrapped: string
  wrapped: string
  wrappedYear: string
  notFound: string
  error404: string
  browseMovix: string
  createParty: string
  newParty: string
  inParty: string
  participantsOne: string
  participantsMany: string
  joinParty: string
  codeEntry: string
  codeValue: string
  browseRooms: string
  publicRooms: string
  roomId: string
  sourceSelection: string
  playing: string
  paused: string
  ended: string
  externalPlayer: string
  watchMovie: string
  watchSeries: string
  watchAnime: string
  watchContent: string
  fallbackMovie: string
  fallbackSeries: string
  fallbackAnime: string
  btnViewPage: string
  btnWatch: string
  btnJoinRoom: string
}

const FR: PresenceStrings = {
  browseHome: 'Parcourt la page d\'accueil',
  home: 'Accueil',
  searching: 'Effectue une recherche',
  searchQuery: 'Recherche : {0}',
  searchGlobal: 'Recherche globale',
  searchLabel: 'Recherche',
  browseMovies: 'Parcourt le catalogue de films',
  movies: 'Films',
  browseSeries: 'Parcourt le catalogue de séries',
  series: 'Séries',
  browseCollections: 'Parcourt les collections',
  collections: 'Collections',
  viewCollection: 'Consulte la collection',
  collectionId: 'Collection {0}',
  viewMovie: 'Consulte la fiche du film',
  movieId: 'Film {0}',
  viewSeries: 'Consulte la fiche de la série',
  seriesId: 'Série {0}',
  downloadMovie: 'Prépare le téléchargement du film',
  downloadSeries: 'Prépare le téléchargement de la série',
  movieToDownload: 'Film à télécharger',
  seriesToDownload: 'Série à télécharger',
  useDebrid: 'Utilise le débrideur de liens',
  debridService: 'Service : {0}',
  debrid: 'Débridage de liens',
  browseGenre: 'Parcourt le catalogue par genre',
  moviesByGenre: 'Films par genre',
  seriesByGenre: 'Séries par genre',
  useRoulette: 'Utilise la roulette de suggestions',
  randomPick: 'Sélection aléatoire',
  browsePlatformCatalog: 'Parcourt le catalogue d\'une plateforme',
  viewPlatform: 'Consulte une plateforme',
  platformId: 'Plateforme {0}',
  signIn: 'Se connecte',
  signInState: 'Connexion',
  createAccount: 'Crée un compte',
  accountCreation: 'Création de compte',
  bip39: 'Connexion BIP39',
  viewPerson: 'Consulte la fiche de la personne',
  personId: 'Personne {0}',
  viewProfile: 'Consulte son profil',
  userProfile: 'Profil utilisateur',
  viewAlerts: 'Consulte ses alertes',
  alerts: 'Alertes',
  watchLiveTv: 'Regarde la TV en direct',
  live: 'En direct',
  viewSuggestions: 'Consulte les suggestions personnalisées',
  suggestions: 'Suggestions',
  viewExtension: 'Consulte la page de l\'extension',
  extension: 'Extension Movix',
  viewList: 'Consulte la liste publique',
  listId: 'Liste {0}',
  browseLists: 'Parcourt les listes publiques',
  listCatalog: 'Catalogue des listes',
  viewLegal: 'Consulte les informations légales',
  dmca: 'DMCA',
  useAdmin: 'Utilise la console d\'administration',
  administration: 'Administration',
  selectProfile: 'Sélectionne un profil',
  manageProfiles: 'Gère ses profils',
  browseWishboard: 'Parcourt le Wishboard',
  communityRequests: 'Demandes de la communauté',
  writeRequest: 'Rédige une demande Wishboard',
  newRequest: 'Nouvelle demande',
  viewRequests: 'Consulte ses demandes Wishboard',
  myRequests: 'Mes demandes',
  submitLink: 'Soumet un lien au Wishboard',
  linkSubmission: 'Soumission de lien',
  viewAbout: 'Consulte la page À propos',
  readPrivacy: 'Lit la politique de confidentialité',
  readTerms: 'Lit les conditions d\'utilisation',
  cinegraphMovie: 'Explore les connexions d\'un film dans CinéGraph',
  cinegraphSeries: 'Explore les connexions d\'une série dans CinéGraph',
  cinegraphPerson: 'Explore les connexions d\'une personne dans CinéGraph',
  cinegraph: 'Explore CinéGraph',
  configureSettings: 'Configure ses préférences',
  viewTop10: 'Consulte le top 10',
  top10: 'Top 10',
  viewWrapped: 'Consulte son récapitulatif annuel',
  wrapped: 'Wrapped',
  wrappedYear: 'Wrapped {0}',
  notFound: 'Page introuvable',
  error404: 'Erreur 404',
  browseMovix: 'Navigue sur Movix',
  createParty: 'Crée une WatchParty',
  newParty: 'Nouvelle WatchParty',
  inParty: 'En WatchParty',
  participantsOne: '1 participant',
  participantsMany: '{0} participants',
  joinParty: 'Rejoint une WatchParty',
  codeEntry: 'Saisie du code',
  codeValue: 'Code {0}',
  browseRooms: 'Parcourt les salons WatchParty',
  publicRooms: 'Salons publics',
  roomId: 'Salon {0}',
  sourceSelection: 'Sélection de la source',
  playing: 'Lecture en cours',
  paused: 'En pause',
  ended: 'Lecture terminée',
  externalPlayer: 'Lecture via un lecteur externe',
  watchMovie: 'Regarde un film',
  watchSeries: 'Regarde une série',
  watchAnime: 'Regarde un anime',
  watchContent: 'Regarde un contenu',
  fallbackMovie: 'Film',
  fallbackSeries: 'Série',
  fallbackAnime: 'Anime',
  btnViewPage: 'Voir la page',
  btnWatch: 'Regarder',
  btnJoinRoom: 'Rejoindre le salon',
}

const EN: PresenceStrings = {
  browseHome: 'Browsing the home page',
  home: 'Home',
  searching: 'Searching',
  searchQuery: 'Searching for: {0}',
  searchGlobal: 'Global search',
  searchLabel: 'Search',
  browseMovies: 'Browsing the movie catalog',
  movies: 'Movies',
  browseSeries: 'Browsing the TV show catalog',
  series: 'TV shows',
  browseCollections: 'Browsing collections',
  collections: 'Collections',
  viewCollection: 'Viewing the collection',
  collectionId: 'Collection {0}',
  viewMovie: 'Viewing the movie page',
  movieId: 'Movie {0}',
  viewSeries: 'Viewing the TV show page',
  seriesId: 'TV show {0}',
  downloadMovie: 'Preparing the movie download',
  downloadSeries: 'Preparing the TV show download',
  movieToDownload: 'Movie to download',
  seriesToDownload: 'TV show to download',
  useDebrid: 'Using the link debrider',
  debridService: 'Service: {0}',
  debrid: 'Link debriding',
  browseGenre: 'Browsing the catalog by genre',
  moviesByGenre: 'Movies by genre',
  seriesByGenre: 'TV shows by genre',
  useRoulette: 'Using the suggestion roulette',
  randomPick: 'Random pick',
  browsePlatformCatalog: 'Browsing a platform\'s catalog',
  viewPlatform: 'Viewing a platform',
  platformId: 'Platform {0}',
  signIn: 'Signing in',
  signInState: 'Sign-in',
  createAccount: 'Creating an account',
  accountCreation: 'Account creation',
  bip39: 'BIP39 sign-in',
  viewPerson: 'Viewing the person\'s page',
  personId: 'Person {0}',
  viewProfile: 'Viewing their profile',
  userProfile: 'User profile',
  viewAlerts: 'Checking their alerts',
  alerts: 'Alerts',
  watchLiveTv: 'Watching live TV',
  live: 'Live',
  viewSuggestions: 'Viewing personalized suggestions',
  suggestions: 'Suggestions',
  viewExtension: 'Viewing the extension page',
  extension: 'Movix extension',
  viewList: 'Viewing the public list',
  listId: 'List {0}',
  browseLists: 'Browsing public lists',
  listCatalog: 'List catalog',
  viewLegal: 'Viewing legal information',
  dmca: 'DMCA',
  useAdmin: 'Using the admin console',
  administration: 'Administration',
  selectProfile: 'Selecting a profile',
  manageProfiles: 'Managing profiles',
  browseWishboard: 'Browsing the Wishboard',
  communityRequests: 'Community requests',
  writeRequest: 'Writing a Wishboard request',
  newRequest: 'New request',
  viewRequests: 'Viewing their Wishboard requests',
  myRequests: 'My requests',
  submitLink: 'Submitting a link to the Wishboard',
  linkSubmission: 'Link submission',
  viewAbout: 'Viewing the About page',
  readPrivacy: 'Reading the privacy policy',
  readTerms: 'Reading the terms of service',
  cinegraphMovie: 'Exploring a movie\'s connections in CinéGraph',
  cinegraphSeries: 'Exploring a TV show\'s connections in CinéGraph',
  cinegraphPerson: 'Exploring a person\'s connections in CinéGraph',
  cinegraph: 'Exploring CinéGraph',
  configureSettings: 'Configuring preferences',
  viewTop10: 'Viewing the top 10',
  top10: 'Top 10',
  viewWrapped: 'Viewing their yearly recap',
  wrapped: 'Wrapped',
  wrappedYear: 'Wrapped {0}',
  notFound: 'Page not found',
  error404: 'Error 404',
  browseMovix: 'Browsing Movix',
  createParty: 'Creating a WatchParty',
  newParty: 'New WatchParty',
  inParty: 'In a WatchParty',
  participantsOne: '1 participant',
  participantsMany: '{0} participants',
  joinParty: 'Joining a WatchParty',
  codeEntry: 'Entering a code',
  codeValue: 'Code {0}',
  browseRooms: 'Browsing WatchParty rooms',
  publicRooms: 'Public rooms',
  roomId: 'Room {0}',
  sourceSelection: 'Selecting a source',
  playing: 'Playing',
  paused: 'Paused',
  ended: 'Playback finished',
  externalPlayer: 'Playing via an external player',
  watchMovie: 'Watching a movie',
  watchSeries: 'Watching a TV show',
  watchAnime: 'Watching an anime',
  watchContent: 'Watching content',
  fallbackMovie: 'Movie',
  fallbackSeries: 'TV show',
  fallbackAnime: 'Anime',
  btnViewPage: 'View page',
  btnWatch: 'Watch',
  btnJoinRoom: 'Join the room',
}

let currentLanguage: PresenceLanguage = 'fr'
let currentStrings: PresenceStrings = FR

export function setLanguage(language: PresenceLanguage): void {
  currentLanguage = language
  currentStrings = language === 'en' ? EN : FR
}

export function getLanguage(): PresenceLanguage {
  return currentLanguage
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
