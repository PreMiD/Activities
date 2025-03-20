const presence = new Presence({
  clientId: '651135297756856339',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let title
const actionURL = new URL(document.location.href)
const title2URL = new URL(document.location.href)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Touhou%20Wiki/assets/logo.png',
  }

  title = document.querySelector('h1#firstHeading')
  const actionResult = actionURL.searchParams.get('action')
  const title2Result = title2URL.searchParams.get('title')
  if (
    document.location.pathname === '/wiki/Touhou_Wiki'
    || document.location.pathname === '/wiki/Заглавная_страница'
    || document.location.pathname === '/wiki/东方维基'
    || document.location.pathname === '/wiki/동방위키:대문'
  ) {
    presenceData.state = 'Main Page | Home'
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (title && document.location.pathname.includes('/wiki/')) {
    presenceData.details = 'Reading about:'
    presenceData.state = title.textContent
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (
    actionResult === 'history'
    && title2Result
    && document.location.pathname.includes('/w/')
  ) {
    presenceData.details = 'Viewing revision history of:'
    if (title2Result.includes('_'))
      presenceData.state = title2Result.replaceAll('_', ' ')
    else presenceData.state = title2Result

    presenceData.startTimestamp = browsingTimestamp
  }
  else if (
    actionResult === 'edit'
    && title2Result
    && document.location.pathname.includes('/w/')
  ) {
    presenceData.details = 'Editing a page:'
    if (title2Result.includes('_'))
      presenceData.state = title2Result.replaceAll('_', ' ')
    else presenceData.state = title2Result

    presenceData.startTimestamp = browsingTimestamp
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
