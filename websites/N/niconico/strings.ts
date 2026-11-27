const keys = {
  browse: 'general.browsing',
  play: 'general.playing',
  pause: 'general.paused',
  live: 'general.live',
  searchFor: 'general.searchFor',
  search: 'general.search',
  searchSomething: 'general.searchSomething',
  viewChannel: 'general.viewChannel',
  viewProfile: 'general.viewProfile',
  buttonViewChannel: 'general.buttonViewChannel',
  buttonViewProfile: 'general.buttonViewProfile',
  buttonWatchVideo: 'general.buttonWatchVideo',
  buttonWatchStream: 'general.buttonWatchStream',
  reading: 'general.reading',
  readingArticle: 'general.readingArticle',
  buttonReadArticle: 'general.buttonReadArticle',
  watchingAd: 'niconico.watchingAd',
  deletedUser: 'niconico.deletedUser',
}

export type Strings = Record<keyof typeof keys, string>

export function getStrings(presence: Presence): Promise<Strings> {
  return presence.getStrings(keys)
}
