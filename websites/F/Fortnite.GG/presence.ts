import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1412711943369785415',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/F/Fortnite.GG/assets/logo.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Viewing,
  }

  const urlpath = document.location.pathname.split('/')
  const queryString = document.location.search // for grabbing query strings from url
  const params = new URLSearchParams(queryString)

  const setting = {
    privacy: await presence.getSetting<boolean>('privacy'),
  }

  const homepageStates: Record<string, string> = { // all homepage Fortnite islands
    '': 'Looking at the Battle Royale map',
    'blitz': 'Looking at the Blitz Royale map',
    'og': 'Looking at the Fortnite OG map',
    'reload': 'Looking at the Reload map',
    'reload-desert': 'Looking at the Reload map',
    'slurp-rush': 'Looking at the Reload map',
    'squid-game': 'Looking at the Reload map',
  }

  const sitePages: Record<string, { details: string, state: string, key: string, button: string }> = { // list of all page RPCs that don't require extra code
    'map-evolution': { details: 'Map Evolution', state: 'Comparing Fortnite maps', key: Assets.Search, button: 'y' },
    'wishlist': { details: 'Cosmetics', state: 'Looking at my wishlist', key: Assets.Viewing, button: 'y' },
    'locker': { details: 'Cosmetics', state: 'Viewing my locker', key: Assets.Viewing, button: 'y' },
    'news': { details: 'News', state: 'Reading the news feed', key: Assets.Reading, button: 'y' },
    'most-used': { details: 'Cosmetics', state: 'Browsing the most used cosmetics', key: Assets.Viewing, button: 'y' },
    'cosmetic-stats': { details: 'Cosmetics', state: 'Viewing cosmetic stats', key: Assets.Search, button: 'y' },
    'free-cosmetics': { details: 'Free Cosmetics', state: 'Looking at free cosmetics', key: Assets.Viewing, button: 'y' },
    'daily-jam-tracks': { details: 'Jam Tracks', state: 'Viewing the daily jam tracks', key: Assets.Viewing, button: 'y' },
    'player-count': { details: 'Creative', state: 'Viewing live player count', key: Assets.Viewing, button: 'y' },
    'creative': { details: 'Creative', state: 'Browsing most played maps', key: Assets.Reading, button: 'y' },
    'creators': { details: 'Creative', state: 'Browsing Fortnite creators', key: Assets.Reading, button: 'y' },
    'discover': { details: 'Creative', state: 'Browsing UEFN discover page', key: Assets.Search, button: 'y' },
    'best-cosmetics': { details: 'Rankings', state: 'Fortnite Outfits', key: Assets.Viewing, button: 'y' },
    'best-survey-skins': { details: 'Rankings', state: 'Survey Skins', key: Assets.Viewing, button: 'y' },
    'best-seasons': { details: 'Rankings', state: 'Fortnite Seasons', key: Assets.Viewing, button: 'y' },
    'best-crew-skins': { details: 'Rankings', state: 'Crew Skins', key: Assets.Viewing, button: 'y' },
    'best-fanmade-skins': { details: 'Rankings', state: 'Fan-made Skins', key: Assets.Viewing, button: 'y' },
    'about': { details: 'About', state: 'Reading about page', key: Assets.Reading, button: 'n' },
    'legal': { details: 'Legal', state: 'Reading legal info', key: Assets.Reading, button: 'n' },
    'account': { details: 'Account', state: 'Managing my account', key: Assets.Downloading, button: 'n' },
    'account-subscriptions': { details: 'Account', state: 'Managing my account', key: Assets.Downloading, button: 'n' },
    'account-settings': { details: 'Account', state: 'Managing my account', key: Assets.Downloading, button: 'n' },
    'premium': { details: 'Premium', state: 'Viewing Fortnite.GG Premium', key: Assets.Downloading, button: 'y' },
    'guides': { details: 'Guides', state: 'Reading Fortnite guides', key: Assets.Reading, button: 'y' },
    'pro-settings': { details: 'Guides', state: 'Looking at pro settings', key: Assets.Search, button: 'y' },
    'weapons': { details: 'Guides', state: 'Browsing all weapons', key: Assets.Search, button: 'y' },
    'xp': { details: 'Guides', state: 'Viewing XP calculator', key: Assets.Reading, button: 'y' },
    'story': { details: 'Story', state: 'Reading about Fortnite lore', key: Assets.Reading, button: 'y' },
    'season-countdown': { details: 'Season Countdown', state: 'Waiting for the next season', key: Assets.Premiere, button: 'y' },
    'community': { details: 'Community', state: 'Browsing social media posts', key: Assets.Reading, button: 'y' },
    'assets': { details: 'Beyond Assets', state: 'Viewing Fortnite assets', key: Assets.Search, button: 'y' },
  }

  const statPages: Record<string, string> = { // all versions of the stats page
    'stats': 'Viewing player stats',
    'br-stats': 'Viewing Battle Royale stats',
    'blitz-stats': 'Viewing Blitz Royale stats',
    'og-stats': 'Viewing Fortnite OG stats',
    'reload-stats': 'Viewing Reload stats',
    'ranked-stats': 'Viewing Ranked stats',
    'ranked-reload-stats': 'Viewing Ranked Reload stats',
    'ballistic-stats': 'Viewing Ballistic stats',
    'racing-stats': 'Viewing Racing stats',
  }

  const page = urlpath[1] ?? ''

  if (setting.privacy) {
    presenceData.details = 'Browsing website'
    presenceData.smallImageText = 'Privacy mode enabled'
    presenceData.smallImageKey = Assets.Question
  }

  else if (homepageStates[page]) {
    presenceData.details = 'Homepage'
    presenceData.state = homepageStates[page]
  }
  else if (sitePages[page]) {
    presenceData.details = sitePages[page].details
    presenceData.state = sitePages[page].state
    presenceData.smallImageKey = sitePages[page].key
    if (!setting.privacy && sitePages[page].button === 'y') {
      presenceData.buttons = [
        {
          label: `View ${sitePages[page].details}`,
          url: document.location.href,
        },
      ]
    }
  }
  else if (statPages[page]) {
    presenceData.details = 'Stats'
    presenceData.state = statPages[page]
    presenceData.smallImageKey = Assets.Search
  }

  else if (urlpath[1] === 'island') { // if user is viewing a specific island, this will grab details and display in RPC
    presenceData.details = 'Creative'
    presenceData.state = 'Viewing a Fortnite Creative island'
    presenceData.smallImageKey = Assets.Search
    if (!setting.privacy) {
      presenceData.buttons = [
        {
          label: 'View Island',
          url: document.location.href,
        },
      ]
    }

    if (params.get('code')) {
      const islandDetails = document.querySelector<HTMLDivElement>('.island-detail')
      const islandName = islandDetails?.querySelector<HTMLHeadingElement>('h1')?.textContent ?? 'Viewing an island'
      const islandCreator = islandDetails?.querySelector<HTMLDivElement>('div')?.textContent ?? 'Creator unknown'
      presenceData.details = islandName
      presenceData.state = islandCreator
      presenceData.smallImageText = 'Viewing a Fortnite Creative island'
    }
  }

  else if (urlpath[1] === 'creator') { // if user is viewing a specific map creator, this will grab details and display in RPC
    const creatorName = document.querySelector<HTMLHeadingElement>('.creator-title')?.textContent ?? ''
    presenceData.details = 'Viewing creator'
    presenceData.state = creatorName
    if (!setting.privacy) {
      presenceData.buttons = [
        {
          label: 'Visit Creator',
          url: document.location.href,
        },
      ]
    }
  }

  else if (urlpath[1] === 'cosmetics') {
    presenceData.details = 'Cosmetics'
    presenceData.state = 'Browsing all cosmetics'
    presenceData.buttons = [
      {
        label: 'View Cosmetics',
        url: document.location.href,
      },
    ]
  }
  if (params.get('id')) { // grab ID of a cosmetic and display information about it in the RPC
    const cosmeticType = document.querySelector<HTMLMetaElement>('[class="fn-detail-type"]')
    const cosmeticName = document.querySelector<HTMLMetaElement>('[class="fn-detail-name"]')
    presenceData.details = `Viewing ${cosmeticType?.textContent ?? 'a cosmetic'}`
    presenceData.state = `${cosmeticName?.textContent ?? ''}`
    presenceData.buttons = [
      {
        label: `View Cosmetic`,
        url: document.location.href,
      },
    ]
  }
  const cosmeticFilters: Record<string, string> = { // list of the main filter types on the cosmetics page along with their RPC state
    outfit: 'Looking at outfits',
    emote: 'Looking at emotes',
    pickaxe: 'Looking at pickaxes',
    backpack: 'Looking at backblings',
    glider: 'Looking at gliders',
    kicks: 'Looking at kicks',
    wrap: 'Looking at wraps',
    loadingscreen: 'Looking at loading screens',
    music: 'Looking at jam tracks',
    contrail: 'Looking at contrails',
    spray: 'Looking at sprays',
    emoji: 'Looking at emojis',
    banner: 'Looking at banners',
    bundle: 'Looking at bundles',
  }

  const type = params.get('type')
  if (type && cosmeticFilters[type]) {
    presenceData.state = cosmeticFilters[type]
  }
  if (params.get('tag') === 'unreleased') { // accounts for user looking at full leaked items page or filtering with this tag
    presenceData.state = 'Browsing leaked cosmetics'
  }

  else if (urlpath[1] === 'shop') {
    presenceData.details = 'Item Shop'
    const shopFilters: Record<string, string> = {
      'new': 'Checking out brand new items',
      'wishlist': 'Looking at wishlisted shop items',
      'different': 'Looking at fresh cosmetics',
      'leaving': 'Looking at items that leave today',
      'longest-wait': 'Looking at rarest items',
      'bestsellers': 'Looking at best selling items',
    }

    const shopState // determines if there is a current shop filter based on URL strings, or defaults to a generic message
      = Object.keys(shopFilters).find(key => params.has(key))
        ? shopFilters[Object.keys(shopFilters).find(key => params.has(key))!]
        : `Looking at today's item shop`

    presenceData.state = shopState
    presenceData.buttons = [
      {
        label: 'View Shop',
        url: document.location.href,
      },
    ]
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
