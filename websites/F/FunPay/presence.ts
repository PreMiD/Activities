const presence = new Presence({ clientId: '1410684519866044537' })
const browsingTimestamp = Math.floor(Date.now() / 1000)

function stripLang(path: string) {
  return path.replace(/^\/(?:en|ru)\b/, '')
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/FunPay/assets/logo.jpg',
    startTimestamp: browsingTimestamp,
  }

  const path = stripLang(location.pathname)
  const [, page, id] = path.split('/')

  switch (page) {
    case '':
    case undefined:
      presenceData.details = 'Browsing homepage'
      break
    case 'lots':
      if (path.includes('/offer')) {
        presenceData.details = 'Viewing offer'
        presenceData.state = document.querySelector('h1')?.textContent?.trim()
        presenceData.buttons = [{ label: 'View Offer', url: location.href }]
      }
      else if (path.includes('/trade')) {
        presenceData.details = 'Creating offer'
        presenceData.state = document.querySelector('h1')?.textContent?.trim()
      }
      else if (id) {
        presenceData.details = 'Browsing offers'
        presenceData.state = document.querySelector('h1')?.textContent?.trim()
        presenceData.buttons = [{ label: 'View Offers', url: location.href }]
      }
      break
    case 'chips':
      presenceData.details = 'Browsing game currency'
      presenceData.state = document.querySelector('h1')?.textContent?.trim()
      presenceData.buttons = [{ label: 'View Currency', url: location.href }]
      break
    case 'users':
      presenceData.details = 'Viewing profile'
      presenceData.state = document.querySelector('h1')?.textContent?.trim()
      presenceData.buttons = [{ label: 'View Profile', url: location.href }]
      break
    case 'orders':
      presenceData.details = 'Viewing orders'
      break
    case 'chat':
      presenceData.details = 'Chatting'
      break
    case 'account':
      presenceData.details = 'Managing account'
      break
    default:
      presenceData.details = 'Browsing FunPay'
      break
  }

  const showButtons = await presence.getSetting<boolean>('buttons')
  if (!showButtons)
    delete presenceData.buttons

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
