const presence = new Presence({
  clientId: '983277228710297600',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let locationcity: string,
  locationstate: string,
  locationcountry: string,
  x: string,
  y: string,
  editedObject: string | undefined,
  selectedObject: boolean
setInterval(() => {
  if (x && y) {
    const fetchingGeo = fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${x}&lon=${y}&format=json`,
    )
    fetchingGeo.then((res) => {
      res.json().then((res) => {
        [locationcity, locationstate, locationcountry] = [
          res.address.isolated_dwelling
          ?? res.address.hamlet
          ?? res.address.village
          ?? res.address.town
          ?? res.address.city,
          res.address.state,
          res.address.country,
        ]
      })
    })
    fetchingGeo.catch()
  }
}, 5000)

presence.on('UpdateData', async () => {
  const privacySettings = await presence.getSetting<boolean>('privacy')
  let presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/OpenStreetMap/assets/logo.png',
    startTimestamp: browsingTimestamp,
    details: 'Viewing:',
  }

  const pages: Record<string, PresenceData> = {
    '/traces': { state: 'Public GPS tracks' },
    '/traces/new': { state: 'GPS tracks upload' },
    '/diary': { state: 'Users\' Diaries' },
    '/diary/new': { state: 'Writing a new diary entry' },
    '/help': { state: 'Getting Help' },
    '/welcome': { state: 'OpenStreetMap basics guide' },
    '/copyright': { state: 'Copyright and License' },
    '/about': { state: 'About OpenStreetMap' },
    '/dashboard': { state: 'User Dashboard' },
    '/preferences': { state: 'User preferences' },
    '/export': { state: 'Map exports' },
    '/directions': { state: 'Planning a route' },
    '/oauth2': { state: 'User OAuth applications' },
    '/history': { state: 'Changeset history' },
    '/account/edit': { state: 'User settings' },
  }

  for (const [path, data] of Object.entries(pages)) {
    if (document.location.pathname.includes(path))
      presenceData = { ...presenceData, ...data } as PresenceData
  }

  const pagesSubdomain: Record<string, PresenceData> = {
    dmca: { state: 'Claim of Copyright Infringement' },
    dns: { state: 'GeoDNS Zones' },
    git: { state: 'Project Git' },
    lists: { state: 'Project Mailing Lists' },
    welcome: { state: 'Welcome Mat - Organizations' },
    blogs: { state: 'Community blogs' },
    nominatim: { state: 'Nominatim search engine' },
  }

  for (const [path, data] of Object.entries(pagesSubdomain)) {
    if (document.location.hostname.startsWith(path))
      presenceData = { ...presenceData, ...data } as PresenceData
  }

  if (document.location.hostname.startsWith('help')) {
    presenceData.details = 'Reading help:'
    presenceData.state = document.title.split(' -')[0]
  }
  else if (
    document.location.hostname.startsWith('blog')
    && !document.location.hostname.startsWith('blogs')
  ) {
    presenceData.details = 'Reading a blog post:'
    presenceData.state = document.title.split('|')[0]
    presenceData.buttons = [
      { label: 'Read this post', url: document.location.href },
    ]
  }
  else if (document.location.hostname.startsWith('forum')) {
    presenceData.details = 'Reading a forum post:'
    presenceData.state = document.title.split('/')[0]
    presenceData.buttons = [
      { label: 'Read this post', url: document.location.href },
    ]
  }
  else if (document.location.hostname.startsWith('community')) {
    presenceData.details = 'Reading a community post:'
    presenceData.state = document.title.split('-')[0]
    presenceData.buttons = [
      { label: 'Read this post', url: document.location.href },
    ]
  }
  else if (
    document.location.pathname.includes('/search')
    && !document.location.pathname.includes('nominatim')
  ) {
    presenceData.details = 'Search results for:'
    presenceData.state = document.title.split('|')[0]
  }
  else if (document.location.pathname.includes('/user/')) {
    presenceData.details = `On ${document.title
      .split('|')[0]
      ?.trim()}'s profile:`
    const userEdits = document.querySelector(
      '#content > div.content-heading > div > div > div.col > nav > ul > li:nth-child(1) > span',
    )?.textContent
    const mapperSince = document.querySelector(
      '#content > div.content-heading > div > div > div.col > div > small > dl > dd',
    )?.textContent
    presenceData.state = `${userEdits} edits since ${mapperSince}`
    presenceData.buttons = [
      { label: 'Check this profile', url: document.location.href },
    ]
  }
  else if (document.location.pathname.includes('/changeset/')) {
    presenceData.details = `Watching changeset ${
      document.location.href.split('/')[4]
    }`

    presenceData.state = `"${document
      .querySelector('#sidebar_content > div.browse-section > p.font-italic')
      ?.textContent
      ?.trim()}"`
    presenceData.buttons = [
      { label: 'Check the changeset', url: document.location.href },
    ]
  }
  else if (document.location.pathname.includes('/way/')) {
    const wayNumber = document
      .querySelector(
        '#sidebar_content > div.d-flex.w-100 > div.flex-grow-1.text-break > h2',
      )
      ?.textContent
      ?.split(':')[1]
    presenceData.details = `Watching the way ${wayNumber}`
    presenceData.state = `From the changeset "${document
      .querySelector('#sidebar_content > div.browse-section > p.font-italic')
      ?.textContent
      ?.trim()}"`
    presenceData.buttons = [
      { label: 'Check the way', url: document.location.href },
    ]
  }
  else if (document.location.pathname.includes('/node/')) {
    const wayNumber = document
      .querySelector(
        '#sidebar_content > div.d-flex.w-100 > div.flex-grow-1.text-break > h2',
      )
      ?.textContent
      ?.split(':')[1]
    presenceData.details = `Watching the node ${wayNumber}`
    presenceData.state = `From the changeset ${
      document.querySelector(
        '#sidebar_content > div.browse-section > p.font-italic',
      )?.textContent
    }`
    presenceData.buttons = [
      { label: 'Check the node', url: document.location.href },
    ]
  }
  else if (document.location.pathname.includes('/edit')) {
    try {
      editedObject = document
        .querySelector<HTMLIFrameElement>('#id-embed')
        ?.contentDocument
        ?.title
        ?.split('–')[1]
        ?.substring(1)
      selectedObject = true
    }
    catch {
      selectedObject = false
    }
    if (!selectedObject)
      presenceData.details = 'On the map editor'
    else presenceData.details = `Editing "${editedObject}"`
    x = document.location.href.split('/')[4]!
    y = document.location.href.split('/')[5]!
    if (typeof locationcountry === 'undefined' || privacySettings)
      presenceData.state = 'Somewhere on planet earth'
    else
      presenceData.state = `Near ${locationcity}, ${locationstate}, ${locationcountry}`
    if (!privacySettings) {
      presenceData.buttons = [
        { label: 'Edit the map', url: document.location.href },
      ]
    }
  }
  else if (document.location.hash.includes('#map=')) {
    presenceData.details = 'Looking at the map'
    x = document.location.href.split('/')[4]!
    y = document.location.href.split('/')[5]!
    if (typeof locationcountry === 'undefined' || privacySettings)
      presenceData.state = 'Somewhere on planet earth'
    else
      presenceData.state = `Near ${locationcity}, ${locationstate}, ${locationcountry}`
    if (!privacySettings) {
      presenceData.buttons = [
        { label: 'Open the map', url: document.location.href },
      ]
    }
  }
  else if (document.location.pathname.startsWith('/wiki')) {
    presenceData.details = 'Reading the wiki'
    presenceData.state = `"${document.title.split('—')[0]}"`
    presenceData.buttons = [
      { label: 'Check the page', url: document.location.href },
    ]
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
