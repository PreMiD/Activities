import type { Presence } from 'premid'

export interface PresenceStrings {
  play: string
  pause: string
  browse: string
  search: string
  viewPage: string
  viewSeries: string
  watchEpisode: string
  viewProfile: string
  watchingSeries: string
  seasonEpisode: string
  home: string
  animeList: string
  schedule: string
  users: string
  notifications: string
  settings: string
  donation: string
  login: string
  register: string
  admin: string
  viewingAnime: string
  viewingProfile: string
  ownProfile: string
  tabPosts: string
  tabMedia: string
  tabWatchlist: string
  tabFavorites: string
  tabHistory: string
  privacyWatching: string
  privacyBrowsing: string
}

const SITE_STRINGS: Record<'en' | 'tr', Omit<PresenceStrings,
  'play' | 'pause' | 'browse' | 'search' | 'viewPage' | 'viewSeries' | 'watchEpisode' | 'watchingSeries'
>> = {
  en: {
    viewProfile: 'View profile',
    seasonEpisode: 'Season {0} · Episode {1}',
    home: 'Home',
    animeList: 'Anime catalog',
    schedule: 'Release schedule',
    users: 'Community',
    notifications: 'Notifications',
    settings: 'Account settings',
    donation: 'Support AniTilky',
    login: 'Signing in',
    register: 'Creating account',
    admin: 'Admin panel',
    viewingAnime: 'Viewing anime',
    viewingProfile: 'Viewing profile',
    ownProfile: 'My profile',
    tabPosts: 'Posts',
    tabMedia: 'Media',
    tabWatchlist: 'Watchlist',
    tabFavorites: 'Favorites',
    tabHistory: 'Watch history',
    privacyWatching: 'Watching content',
    privacyBrowsing: 'Browsing AniTilky',
  },
  tr: {
    viewProfile: 'Profile git',
    seasonEpisode: 'Sezon {0} · Bölüm {1}',
    home: 'Ana sayfa',
    animeList: 'Anime kataloğu',
    schedule: 'Yayın takvimi',
    users: 'Topluluk',
    notifications: 'Bildirimler',
    settings: 'Hesap ayarları',
    donation: 'AniTilky\'ye destek',
    login: 'Giriş yapılıyor',
    register: 'Hesap oluşturuluyor',
    admin: 'Yönetim paneli',
    viewingAnime: 'Anime inceleniyor',
    viewingProfile: 'Profil görüntüleniyor',
    ownProfile: 'Kendi profili',
    tabPosts: 'Gönderiler',
    tabMedia: 'Medya',
    tabWatchlist: 'İzleme listesi',
    tabFavorites: 'Favoriler',
    tabHistory: 'İzleme geçmişi',
    privacyWatching: 'İçerik izleniyor',
    privacyBrowsing: 'AniTilky\'de geziniyor',
  },
}

export async function getStrings(presence: Presence, lang: string): Promise<PresenceStrings> {
  const normalized = lang.startsWith('tr') ? 'tr' : 'en'
  const general = await presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      browse: 'general.browsing',
      search: 'general.search',
      viewPage: 'general.viewPage',
      viewSeries: 'general.buttonViewSeries',
      watchEpisode: 'general.buttonViewEpisode',
      watchingSeries: 'general.watchingSeries',
    },
    lang,
  )

  return { ...general, ...SITE_STRINGS[normalized] }
}

export type ProfileTabKey = keyof Pick<PresenceStrings,
  'tabPosts' | 'tabMedia' | 'tabWatchlist' | 'tabFavorites' | 'tabHistory'
>

export const PROFILE_TABS: Record<string, ProfileTabKey> = {
  posts: 'tabPosts',
  media: 'tabMedia',
  watchlist: 'tabWatchlist',
  favorites: 'tabFavorites',
  history: 'tabHistory',
}
