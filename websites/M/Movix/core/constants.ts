export const SITE_NAME = 'Movix'
export const FALLBACK_SITE_URL = 'https://movix.llc'
export const FALLBACK_LOGO = `${FALLBACK_SITE_URL}/movix512.png`
export const TMDB_API_BASE = 'https://api.themoviedb.org/3'
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'
export const TMDB_API_KEY = 'f3d757824f08ea2cff45eb8f47ca3a1e'

export const PROVIDER_NAMES: Record<string, string> = {
  8: 'Netflix',
  119: 'Prime Video',
  337: 'Disney+',
  338: 'Marvel Studios',
  350: 'Apple TV+',
  355: 'Warner Bros',
  356: 'DC Comics',
  384: 'HBO MAX',
  531: 'Paramount+',
}

export const SAFE_BUTTON_PATTERNS = [
  /^\/collection\/[^/]+$/i,
  /^\/movie\/[^/]+$/i,
  /^\/tv\/[^/]+$/i,
  /^\/download\/[^/]+\/[^/]+$/i,
  /^\/genre\/[^/]+\/[^/]+$/i,
  /^\/provider\/[^/]+\/[^/]+(?:\/[^/]+)?$/i,
  /^\/person\/[^/]+$/i,
  /^\/watchparty\/room\/[^/]+$/i,
  /^\/list\/[^/]+$/i,
  /^\/vip\/invoice\/[^/]+$/i,
  /^\/vip\/cadeau\/[^/]+$/i,
  /^\/ftv\/info\/[^/]+$/i,
  /^\/wrapped(?:\/[^/]+)?$/i,
]

export const NON_BREAKING_SPACE_PATTERN = /\u00A0/g
export const WHITESPACE_PATTERN = /\s+/g
export const STRIP_SITE_NAME_PATTERN = /\s*(?:[-:]\s*)?Movix$/i
export const HTTPS_URL_PATTERN = /^https:\/\//i
export const WORD_SEPARATOR_PATTERN = /[_-]+/g
export const WORD_INITIAL_PATTERN = /\b\w/g
export const WWW_PREFIX_PATTERN = /^www\./i
export const LEADING_EPISODE_NUMBER_PATTERN = /^\d+\.\s*/
export const LEADING_EPISODE_LABEL_PATTERN = /^episode\s+\d+\s*[:-]?\s*/i
export const ONLY_EPISODE_NUMBER_PATTERN = /^episode\s+\d+$/i
export const WATCH_TITLE_NEW_PAGE_PATTERN = /ouvrir dans une nouvelle page/i
export const WATCH_TITLE_TRAILER_PATTERN = /trailer background/i
export const WATCH_TITLE_SKIP_PATTERN = /^[-+]\d+s$/i
export const WATCH_TITLE_ZOOM_PATTERN = /^zoom [+-]$/i
export const SOURCE_LABEL_SEPARATOR_PATTERN = /^[:\s-]+/
export const RELEASE_TAG_PATTERN = /\s*SORTI(?:E|ES|S)?[.!]*$/i
export const QUOTED_TEXT_PATTERNS = [
  /\u00AB([^\u00AB\u00BB]+)\u00BB/,
  /\u201C([^\u201C\u201D]+)\u201D/,
  /"([^"]+)"/,
  /'([^']+)'/,
]
export const WATCH_MOVIE_PATH_PATTERN = /^\/watch\/movie\/[^/]+$/i
export const WATCH_TV_PATH_PATTERN = /^\/watch\/tv\/[^/]+\/s\/[^/]+\/e\/[^/]+$/i
export const WATCH_ANIME_PATH_PATTERN = /^\/watch\/anime\/[^/]+\/season\/[^/]+\/episode\/[^/]+$/i
export const ROUTE_COLLECTION_PATTERN = /^\/collection\/([^/]+)$/i
export const ROUTE_MOVIE_PATTERN = /^\/movie\/([^/]+)$/i
export const ROUTE_TV_PATTERN = /^\/tv\/([^/]+)$/i
export const ROUTE_DOWNLOAD_PATTERN = /^\/download\/(movie|tv)\/([^/]+)$/i
export const ROUTE_GENRE_PATTERN = /^\/genre\/([^/]+)\/([^/]+)$/i
export const ROUTE_PROVIDER_CATALOG_PATTERN = /^\/provider\/([^/]+)\/([^/]+)(?:\/([^/]+))?$/i
export const ROUTE_PROVIDER_PATTERN = /^\/provider\/([^/]+)$/i
export const ROUTE_PERSON_PATTERN = /^\/person\/([^/]+)$/i
export const ROUTE_WATCHPARTY_ROOM_PATTERN = /^\/watchparty\/room\/([^/]+)$/i
export const ROUTE_WATCHPARTY_JOIN_PATTERN = /^\/watchparty\/join(?:\/([^/]+))?$/i
export const ROUTE_LIST_PATTERN = /^\/list\/([^/]+)$/i
export const ROUTE_VIP_INVOICE_PATTERN = /^\/vip\/invoice\/([^/]+)$/i
export const ROUTE_VIP_GIFT_PATTERN = /^\/vip\/cadeau\/([^/]+)$/i
export const ROUTE_FTV_INFO_PATTERN = /^\/ftv\/info\/([^/]+)$/i
export const ROUTE_FTV_WATCH_PATTERN = /^\/ftv\/watch\/[^/]+$/i
export const ROUTE_WRAPPED_PATTERN = /^\/wrapped(?:\/([^/]+))?$/i
export const EPISODE_CODE_SUFFIX_PATTERN = /\s*-\s*S\d+E\d+$/i
