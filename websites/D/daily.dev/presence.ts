const presence = new Presence({
  clientId: '1248697988331864084',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/D/daily.dev/assets/logo.png',
}

function processPostSite(): Partial<PresenceData> {
  return {
    details: 'Reading a post',
    state: document.querySelector('h1')?.textContent,
    buttons: [
      {
        label: 'Read Post',
        url: document.location.href,
      },
    ],
  }
}
function processSourceSite() {
  return {
    details: 'Reading a source',
    state: `Source: ${document.querySelector('h1')?.textContent}`,
  }
}
function processSearchSite() {
  return {
    details: 'Searching',
    state: `Searching for ${new URLSearchParams(document.location.search).get(
      'search',
    )}`,
  }
}
const siteDataMap = [
  {
    path: /^\/$/,
    process: () => ({
      details: 'Homepage',
      state: 'Discovering new posts',
    }),
  },
  {
    path: /^\/posts\/[a-z0-9-]+$/,
    process: processPostSite,
  },
  {
    path: /^\/squads$/,
    process: () => ({
      details: 'Squads page',
      state: 'Discovering new squads',
    }),
  },
  {
    path: /^\/discussed$/,
    process: () => ({
      details: 'Discussion homepage',
      state: 'Discovering new discussions',
    }),
  },
  {
    path: /^\/bookmarks$/,
    process: () => ({
      details: 'Bookmarks',
      state: 'Discovering saved posts',
    }),
  },
  {
    path: /^\/popular$/,
    process: () => ({
      details: 'Popular posts',
      state: 'Discovering popular posts',
    }),
  },
  {
    path: /^\/sources\/.*$/,
    process: processSourceSite,
  },
  {
    path: /^\/upvoted\/.*$/,
    process: () => ({
      details: 'Upvoted posts',
      state: 'Discovering upvoted posts',
    }),
  },
  {
    path: /^\/search$/,
    process: () => ({
      details: 'Searching',
      process: processSearchSite,
    }),
  },
  {
    path: /^\/history\/.*$/,
    process: () => ({
      details: 'History',
      state: 'Browsing personal history',
    }),
  },
]

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const siteData = siteDataMap.find(siteData =>
    siteData.path.test(document.location.pathname),
  )

  if (siteData) {
    presenceData = {
      ...presenceData,
      ...siteData.process(),
    } as PresenceData
  }

  presence.setActivity(presenceData)
})
