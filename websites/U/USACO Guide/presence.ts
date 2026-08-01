const presence = new Presence({
  clientId: '1498741548865552614',
})
const browsingTimestamp = Math.floor(Date.now() / 1000) // Show elapsed time

enum ActivityAssets {
  Logo = 'https://i.imgur.com/oRapkfu.png',
}

presence.on('UpdateData', async () => {
  const { pathname, hostname } = document.location

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  let title = document.title.split(' · ')[0]?.split(' | ')[0]?.trim() || ''
  if (title.toLowerCase().endsWith(' - solution')) {
    title = title.substring(0, title.length - 11).trim()
  }
  else if (title.toLowerCase().endsWith(' - editorial')) {
    title = title.substring(0, title.length - 12).trim()
  }

  if (hostname === 'ide.usaco.guide') {
    presenceData.details = 'Using IDE'
    presenceData.state = title === 'USACO IDE' || !title ? 'Coding' : title
  }
  else if (hostname === 'forum.usaco.guide') {
    presenceData.details = 'Browsing Forum'
    presenceData.state = title === 'USACO Forum' || !title ? 'Homepage' : title
  }
  else {
    const pathParts = pathname.split('/').filter(Boolean)
    const section = pathParts[0]

    const sections: Record<string, string> = {
      general: 'General section',
      bronze: 'Bronze section',
      silver: 'Silver section',
      gold: 'Gold section',
      plat: 'Platinum section',
      adv: 'Advanced section',
      problems: 'Problems',
      groups: 'Groups',
      editor: 'Editor',
      settings: 'Settings',
    }

    if (!section || pathname === '/') {
      presenceData.details = 'Browsing USACO Guide'
      presenceData.state = 'Homepage'
    }
    else if (section === 'problems' && pathParts[1]) {
      let problemName = pathParts[1]

      problemName = problemName.replace(/^(?:usaco|cf|cses|ac|spoj|kattis|poi|joi|joic|boi|ceoi|ioi|apio|coci|ys|infoarena|balkan|szkopul)(?:-[a-z0-9]+)?-/i, '')

      problemName = problemName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

      if (pathParts.includes('solution')) {
        presenceData.details = 'Viewing Solution'
      }
      else {
        presenceData.details = 'Solving Problem'
      }
      presenceData.state = title === 'USACO Guide' || !title ? problemName : title
    }
    else if (section && sections[section]) {
      presenceData.details = `Browsing ${sections[section]}`
      presenceData.state = title === 'USACO Guide' || !title ? 'Exploring guides' : title
    }
    else {
      presenceData.details = 'Browsing USACO Guide'
      presenceData.state = title === 'USACO Guide' || !title ? 'Exploring guides' : title
    }
  }

  presence.setActivity(presenceData)
})
