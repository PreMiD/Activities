const presence = new Presence({
  clientId: '1464055281456775244',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/H/Hugging%20Face/assets/logo.png',
}

const profileTabs: Record<string, string> = {
  models: 'Models',
  datasets: 'Datasets',
  spaces: 'Spaces',
  likes: 'Likes',
  followers: 'Followers',
  following: 'Following',
  collections: 'Collections',
}

presence.on('UpdateData', async () => {
  const { pathname, search, href } = document.location
  const segments = pathname.replace(/\/+$/, '').split('/').filter(Boolean)
  const [showButtons, showTimestamp, privacy] = await Promise.all([
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('privacy'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }
  const searchParams = new URLSearchParams(search)
  const query = searchParams.get('q') ?? searchParams.get('search')

  if (segments.length === 0) {
    presenceData.details = 'Viewing the homepage'
  }
  else if (segments[0] === 'search') {
    presenceData.details = 'Searching Hugging Face'
    if (!privacy && query) {
      presenceData.state = query
    }
  }
  else if (segments[0] === 'models') {
    if (query) {
      presenceData.details = 'Searching models'
      if (!privacy)
        presenceData.state = query
    }
    else {
      presenceData.details = 'Browsing models'
    }
  }
  else if (segments[0] === 'datasets') {
    if (segments.length >= 3) {
      presenceData.details = privacy ? 'Viewing a dataset' : 'Viewing dataset'
      if (!privacy)
        presenceData.state = `${segments[1]}/${segments[2]}`
      if (!privacy && showButtons) {
        presenceData.buttons = [{ label: 'View Dataset', url: href }]
      }
    }
    else if (query) {
      presenceData.details = 'Searching datasets'
      if (!privacy)
        presenceData.state = query
    }
    else {
      presenceData.details = 'Browsing datasets'
    }
  }
  else if (segments[0] === 'spaces') {
    if (segments.length >= 3) {
      presenceData.details = privacy ? 'Viewing a space' : 'Viewing space'
      if (!privacy)
        presenceData.state = `${segments[1]}/${segments[2]}`
      if (!privacy && showButtons) {
        presenceData.buttons = [{ label: 'View Space', url: href }]
      }
    }
    else if (query) {
      presenceData.details = 'Searching spaces'
      if (!privacy)
        presenceData.state = query
    }
    else {
      presenceData.details = 'Browsing spaces'
    }
  }
  else if (segments[0] === 'tasks') {
    presenceData.details = 'Browsing tasks'
    if (!privacy && segments[1]) {
      presenceData.state = segments[1].replace(/-/g, ' ')
    }
  }
  else if (segments[0] === 'docs') {
    presenceData.details = 'Reading documentation'
    if (!privacy && segments[1]) {
      presenceData.state = segments[1].replace(/-/g, ' ')
    }
  }
  else if (segments[0] === 'learn') {
    presenceData.details = 'Learning with Hugging Face'
    if (!privacy && segments[1]) {
      presenceData.state = segments[1].replace(/-/g, ' ')
    }
  }
  else if (segments[0] === 'blog') {
    presenceData.details = 'Reading the blog'
    if (!privacy) {
      const title = document.querySelector('h1')?.textContent?.trim()
      if (title)
        presenceData.state = title
    }
  }
  else if (segments[0] === 'pricing') {
    presenceData.details = 'Viewing pricing'
  }
  else if (segments[0] === 'enterprise') {
    presenceData.details = 'Viewing enterprise'
  }
  else if (segments[0] === 'organizations') {
    presenceData.details = 'Browsing organizations'
  }
  else if (segments[0] === 'collections') {
    presenceData.details = 'Browsing collections'
  }
  else if (segments[0] === 'notifications') {
    presenceData.details = 'Viewing notifications'
  }
  else if (segments[0] === 'settings' || segments[0] === 'account') {
    presenceData.details = 'Viewing settings'
  }
  else if (segments[0] === 'login') {
    presenceData.details = 'Logging in'
  }
  else if (segments[0] === 'join') {
    presenceData.details = 'Creating an account'
  }
  else if (segments.length === 1) {
    presenceData.details = 'Viewing a profile'
    if (!privacy) {
      presenceData.state = segments[0]
      if (showButtons) {
        presenceData.buttons = [{ label: 'View Profile', url: href }]
      }
    }
  }
  else {
    const owner = segments[0]
    const repo = segments[1]
    const profileTab = profileTabs[repo]

    if (profileTab) {
      presenceData.details = 'Viewing a profile'
      if (!privacy)
        presenceData.state = `${owner} - ${profileTab}`
    }
    else {
      presenceData.details = privacy ? 'Viewing a model' : 'Viewing model'
      if (!privacy)
        presenceData.state = `${owner}/${repo}`
      if (!privacy && showButtons) {
        presenceData.buttons = [{ label: 'View Model', url: href }]
      }
    }
  }

  if (privacy) {
    delete presenceData.buttons
  }

  if (showTimestamp)
    presenceData.startTimestamp = browsingTimestamp

  presence.setActivity(presenceData)
})
