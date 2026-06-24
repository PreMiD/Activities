export enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/O/ogladajanime/assets/0.png',
  DefaultProfilePicture = 'https://cdn.rcd.gg/PreMiD/websites/O/OgladajAnime/assets/0.png',
}

export enum ListItemStatus {
  categoryWatching = 1,
  categoryWatched = 2,
  categoryPlanning = 3,
  categorySuspended = 4,
  categoryAbandoned = 5,
}

// ! - use localization strings
// !? - uses the format: Viewing Page: {new line} {provided localization string}, example: !?terms
export const StaticBrowsing = {
  '/watch2gether': '!browsingRooms',
  '/main2': '!viewHome',
  '/search/name/': '!searchSomething',
  '/search/custom': '!searchSomething',
  '/search/rand': '!random',
  '/search/new': '!new',
  '/search/main': '!topRated',
  '/chat': '!chatting',
  '/user_activity': '!lastActivity',
  '/last_comments': '!?newestComments',
  '/active_sessions': '!?activeLoginSessions',
  '/manage_edits': '!?newestEdits',
  '/anime_list_to_load': '!importList',
  '/discord': '!?contact',
  '/support': '!?donate',
  '/rules': '!?terms',
  '/harmonogram': '!?upcomingEpisodes',
  '/anime_seasons': '!?upcomingAnimes',
  '/all_anime_list': '!?allAvailableAnimes',
  '/': '!viewHome', // This MUST stay at the end, otherwise this will always display no matter the page
}
