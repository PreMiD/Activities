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
    presenceData.details = `Viewing ${document.querySelector('h3')?.textContent.trim()}'s post`
    presenceData.buttons = [{ label: 'View Post', url: `${document.querySelector('h2.posts-wrapper')?.id}` }]
    presenceData.smallImageKey = document.querySelector<HTMLImageElement>('.user-icon')?.src
  }
  else if (document.location.pathname.includes('users/')) {
    presenceData.details = `Visiting ${document.querySelector('h2.community-title')?.textContent.match(/@(\S+)/)?.[1] || 'User'}'s profile`
    presenceData.smallImageKey = document.querySelector<HTMLImageElement>('.user-icon')?.src
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
  if (showButtons && document.location.pathname.includes('posts/')) {
    presenceData.buttons = [
      {
        label: 'View Post',
        url: document.location.href
      },
    ],
  }
  if (privacyMode) {
    presenceData.details = undefined
    presenceData.state = undefined
    presenceData.largeImageText = undefined
    presenceData.smallImageKey = undefined
    presenceData.buttons = undefined
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
