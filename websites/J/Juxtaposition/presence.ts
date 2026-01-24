const presence = new Presence({
  clientId: '1463154052584968267',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let showButtons = true
let privacyMode = false

presence.on('UpdateData', async () => {
  showButtons = await presence.getSetting<boolean>('showButtons')
  privacyMode = await presence.getSetting<boolean>('privacyMode')
  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/cJPMbNG.png',
    startTimestamp: browsingTimestamp,
    smallImageKey: document.querySelector<HTMLImageElement>('.mii-icon')?.src,
  }
  if (document.location.pathname === '/feed') {
    presenceData.details = 'Viewing Home Page'
  }
  else if (document.location.pathname.includes('posts/')) {
    presenceData.details = `Viewing ${document.querySelector<HTMLAnchorElement>('.post-user-info-wrapper h3 a')?.textContent?.trim() || 'User'}'s post`
    presenceData.smallImageKey = document.querySelector<HTMLImageElement>('.user-icon')?.src
    presenceData.smallImageText = `@${((document.querySelector('meta[itemprop="name"], meta[property="og:title"], meta[name="twitter:title"]') as HTMLMetaElement | null)?.content.match(/@(\w+)/)?.[1] ?? '')}`
    if (showButtons) {
      presenceData.buttons = [{ label: 'View Post', url: document.location.href }]
    }
  }
  else if (document.location.pathname.startsWith('/users/')) {
    presenceData.details = `Visiting ${(document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null)?.content.replace(/\s*\(@.*?\)|\s*@\S+/, '').trim() || 'User'}'s profile`
    presenceData.smallImageKey = document.querySelector<HTMLImageElement>('.user-icon')?.src
    presenceData.smallImageText = `@${((document.querySelector('meta[property="og:title"], meta[name="twitter:title"], meta[itemprop="name"]') as HTMLMetaElement | null)?.content.match(/@(\w+)/)?.[1] ?? '')}`
    if (showButtons) {
      presenceData.buttons = [{ label: 'View Profile', url: (document.querySelector('meta[property="og:url"]') as HTMLMetaElement | null)?.content ?? document.location.href }]
    }
  }
  else if (document.location.pathname === '/friend_messages') {
    presenceData.details = 'Browsing private messages'
  }
  else if (document.location.pathname.includes('/friend_messages/')) {
    presenceData.details = 'Reading private messages'
  }
  else if (document.location.pathname === '/news/my_news') {
    presenceData.details = 'Reading notifications'
  }
  else if (document.location.pathname === '/titles') {
    presenceData.details = 'Browsing Communities'
  }
  else if (document.location.pathname === '/titles/all') {
    presenceData.details = 'Browsing all Communities'
  }
  else if (document.location.pathname.includes('titles/')) {
    presenceData.details = `Browsing ${document.querySelector('h2.community-title')?.textContent.trim().replace(/ Community$/i, '')} Community`
    presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.user-icon')?.src
  }
  if (privacyMode) {
    delete presenceData.details
    delete presenceData.state
    delete presenceData.largeImageText
    delete presenceData.smallImageKey
    delete presenceData.buttons
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
