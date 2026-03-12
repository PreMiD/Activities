import { Assets } from 'premid'

const presence = new Presence({
  clientId: '863866805184626708',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/Manacube/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  if (document.location.hostname === 'manacube.com')
    presenceData.details = 'Forums'

  if (document.location.pathname.includes('/threads/')) {
    const title = document.querySelector(
      'div.p-pageWrapper > div.p-body > div.p-body-inner > div.p-body-main > div.p-body-content > div.p-body-header > div.p-title > h1',
    )
    if (title) {
      presenceData.state = title.textContent
      presenceData.details = 'Forums, Viewing Thread:'
    }
    else {
      presenceData.details = 'Forums, Browsing..'
    }
  }
  else if (document.location.pathname.includes('/forums/')) {
    const title = document.querySelector(
      'div.p-pageWrapper > div.p-body > div.p-body-inner > div.p-body-main > div.p-body-content > div.p-body-header > div.p-title > h1',
    )
    if (title) {
      presenceData.state = title.textContent
      presenceData.details = 'Forums, Viewing Category:'
    }
    else {
      presenceData.details = 'Forums, Browsing...'
    }
  }
  else if (
    document.location.pathname.includes('/whats-new/')
    && document.location.pathname.includes('/profile-posts/')
  ) {
    presenceData.details = 'Forums, Viewing the list of'
    presenceData.state = 'Latest Profile Posts'
  }
  else if (
    document.location.pathname.includes('/whats-new/')
    && document.location.pathname.includes('/posts/')
  ) {
    presenceData.details = 'Forums, Viewing the list of'
    presenceData.state = 'Latest Posts'
  }
  else if (document.location.pathname.includes('/search/')) {
    const search = document.querySelector(
      'div.p-pageWrapper > div.p-body > div.p-body-inner > div.p-body-main > div.p-body-content > div.p-body-header > div.p-title > h1 > a > em',
    )
    if (search) {
      presenceData.details = 'Forums, Searching For:'
      presenceData.state = search.textContent

      presenceData.smallImageKey = Assets.Search
    }
  }
  else if (document.location.pathname.includes('/members/')) {
    const user = document.querySelector(
      'div.p-pageWrapper > div.p-body > div.p-body-inner > div.p-body-main > div.p-body-content > div.p-body-pageContent > div.block > div.block-container > div.block-body > div.memberHeader > div.memberHeader-main > div.memberHeader-content > h1 > span > span',
    )
    presenceData.details = 'Forums, Viewing User:'
    presenceData.state = user?.textContent
  }
  else if (document.location.pathname.includes('/account/')) {
    presenceData.details = 'Forums, Account Settings'
  }
  else if (document.location.pathname.includes('/support/')) {
    const title = document.querySelector(
      'div.p-pageWrapper > div.p-body > div.p-body-inner > div.p-body-main > div.p-body-content > div.p-body-header > div.p-title > h1',
    )
    presenceData.details = 'Support, Browsing'
    presenceData.state = title?.textContent
  }
  else if (document.location.pathname.includes('/watched/')) {
    if (document.location.pathname.includes('/threads/')) {
      presenceData.details = 'Forums, Viewing Their'
      presenceData.state = 'Watched Threads'
    }
    else {
      presenceData.details = 'Forums, Viewing Their'
      presenceData.state = 'Watched Forums'
    }
  }
  else if (document.location.pathname.includes('/conversations/')) {
    if (
      document.querySelector(
        'div.p-pageWrapper > div.p-body > div.p-body-inner > div.p-body-main > div.p-body-content > div.p-body-header > div.p-title > h1',
      )
    ) {
      const title = document.querySelector(
        'div.p-pageWrapper > div.p-body > div.p-body-inner > div.p-body-main > div.p-body-content > div.p-body-header > div.p-title > h1',
      )
      presenceData.details = 'Forums, Reading a DM'
      presenceData.state = `${title?.textContent}...`
    }
    else {
      presenceData.details = 'Forums, Browsing'
      presenceData.state = 'Through DMs'
    }
  }
  else if (document.location.pathname.includes('/stats/')) {
    if (document.location.pathname.includes('/player/')) {
      const user = document.querySelector(
        'div.p-pageWrapper > div.p-body > div.p-body-inner > div.p-body-main > div.p-body-content > div.p-body-pageContent > div.section--player > div.air > div.section-playerName > div.text > div.top > h3',
      )
      presenceData.details = 'Stats, Viewing User:'
      presenceData.state = user?.textContent
    }
    else if (document.location.pathname.includes('/leaderboards/')) {
      presenceData.details = 'Stats, Browsing'
      presenceData.state = 'Server Seaderboards'
    }
    else {
      presenceData.details = 'Stats, Browsing'
      presenceData.state = 'Server Stats'
    }
  }
  else if (document.location.pathname.includes('/staff/')) {
    presenceData.details = 'Forums, Browsing'
    presenceData.state = 'Staff Page'
  }
  if (document.location.hostname === 'store.manacube.com') {
    if (document.location.pathname.includes('/category/ranks')) {
      presenceData.details = 'Store, Browsing'
      presenceData.state = 'Ranks'
    }
    else if (document.location.pathname.includes('/category/keys')) {
      presenceData.details = 'Store, Browsing'
      presenceData.state = 'Keys'
    }
    else if (document.location.pathname.includes('/category/cubits')) {
      presenceData.details = 'Store, Browsing'
      presenceData.state = 'Cubits'
    }
    else if (document.location.pathname.includes('/category/skyblock')) {
      presenceData.details = 'Store, Browsing'
      presenceData.state = 'Skyblock Black Market'
    }
    else if (document.location.pathname.includes('/category/survival')) {
      presenceData.details = 'Store, Browsing'
      presenceData.state = 'Survival Black Market'
    }
    else if (document.location.pathname.includes('/category/factions')) {
      presenceData.details = 'Store, Browsing'
      presenceData.state = 'Factions Black Market'
    }
    else if (document.location.pathname.includes('/category/1151309')) {
      presenceData.details = 'Store, Browsing'
      presenceData.state = 'Olympus Black Market'
    }
    else if (document.location.pathname.includes('/category/1053998')) {
      presenceData.details = 'Store, Browsing'
      presenceData.state = 'Parkour Black Market'
    }
    else if (document.location.pathname.includes('/category/1053997')) {
      presenceData.details = 'Store, Browsing'
      presenceData.state = 'Creative Black Market'
    }
    else if (document.location.pathname.includes('/category/kits')) {
      presenceData.details = 'Store, Browsing'
      presenceData.state = 'Kits'
    }
    else if (document.location.pathname.includes('/category/553670')) {
      presenceData.details = 'Store, Browsing'
      presenceData.state = 'Skyblock Titles'
    }
    else if (document.location.pathname.includes('/category/553671')) {
      presenceData.details = 'Store, Browsing'
      presenceData.state = 'Creative Titles'
    }
    else if (document.location.pathname.includes('/category/553673')) {
      presenceData.details = 'Store, Browsing'
      presenceData.state = 'Parkour Titles'
    }
    else if (document.location.pathname.includes('/category/kitpvp-titles')) {
      presenceData.details = 'Store, Browsing'
      presenceData.state = 'KitPvP Titles'
    }
    else if (document.location.pathname.includes('/category/553672')) {
      presenceData.details = 'Store, Browsing'
      presenceData.state = 'Factions Titles'
    }
    else if (document.location.pathname.includes('/category/750480')) {
      presenceData.details = 'Store, Browsing'
      presenceData.state = 'Survival Titles'
    }
    else if (document.location.pathname.includes('/category/1003651')) {
      presenceData.details = 'Store, Browsing'
      presenceData.state = 'Island Titles'
    }
    else if (document.location.pathname.includes('/patrons')) {
      presenceData.details = 'Store, Browsing'
      presenceData.state = 'Patrons'
    }
    else if (document.location.pathname.includes('/checkout')) {
      presenceData.details = 'Store, Checking out'
      presenceData.state = 'Viewing basket'
    }
    else {
      presenceData.details = 'Store, Browsing...'
    }
  }
  if (document.location.hostname === 'bans.manacube.com') {
    if (document.location.pathname.includes('/bans')) {
      presenceData.details = 'Bans, Browsing'
      presenceData.state = 'Viewing List of bans'
    }
    else if (document.location.pathname.includes('/mutes')) {
      presenceData.details = 'Bans, Browsing'
      presenceData.state = 'Viewing List of mutes'
    }
    else if (document.location.pathname.includes('/kicks')) {
      presenceData.details = 'Bans, Browsing'
      presenceData.state = 'Viewing List of kicks'
    }
    else if (document.location.pathname.includes('/user')) {
      const user = document.querySelector(
        'div.pagewrapper > div.container > div.row > div.col-md-2 > div.user-info > h3',
      )
      presenceData.details = 'Bans, Viewing'
      presenceData.state = `Viewing ${user?.textContent}`
    }
    else {
      presenceData.details = 'Bans, Browsing...'
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
