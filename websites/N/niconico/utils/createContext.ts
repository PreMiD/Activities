// niconico initialize file
enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/N/niconico/assets/logo.png',
}

// getStrings from premid
async function getStrings(presence: Presence) {
  return presence.getStrings({
    browse: 'general.browsing',
    play: 'general.playing',
    pause: 'general.paused',
    live: 'general.live',
    searchFor: 'general.searchFor',
    search: 'general.search',
    searchSomething: 'general.searchSomething',
    buttonWatchVideo: 'general.buttonWatchVideo',
    buttonWatchStream: 'general.buttonWatchStream',
  },
  )
}

export default async function createContext(presence: Presence) {
  // Fetch presence strings
  const returns: {
    firstInit: boolean
    presenceStrings: Awaited<ReturnType<typeof getStrings>>
    Logo: string
  } = {
    firstInit: true,
    presenceStrings: await getStrings(presence),
    Logo: ActivityAssets.Logo,
  }
  return returns
}
