declare const Presence: any

interface PresenceData {
  largeImageKey?: string
  smallImageKey?: string
  smallImageText?: string
  details?: string
  state?: string
  startTimestamp?: number | null
  buttons?: Array<{ label: string, url: string }>
}

const presence = new Presence({
  clientId: '1444444337445408869',
})

let startTimestamp = Math.floor(Date.now() / 1000)
let lastPath = ''

function formatItemName(str: string): string {
  if (!str)
    return ''
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function findImageByLink(keyword: string): string | undefined {
  const images = document.getElementsByTagName('img')
  for (let i = 0; i < images.length; i++) {
    const img = images[i]
    if (img && img.src && img.src.includes(keyword))
      return img.src
  }
  return undefined
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  if (pathname !== lastPath) {
    startTimestamp = Math.floor(Date.now() / 1000)
    lastPath = pathname
  }

  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/Warframe%20Market/assets/logo.png',
    startTimestamp,
  }

  const showButtons = await presence.getSetting('showButtons')

  if (/^\/items\/\w+/.test(pathname)) {
    const rawName = pathname.split('/')[2] || ''

    if (rawName) {
      const itemName = formatItemName(rawName)

      const itemImage = findImageByLink('/items/images/')
      if (itemImage)
        presenceData.largeImageKey = itemImage

      presenceData.details = 'Looking at Item'
      presenceData.state = itemName

      if (showButtons) {
        presenceData.buttons = [{
          label: 'View Market Prices',
          url: document.location.href,
        }]
      }
    }
  }
  else if (pathname.startsWith('/profile/')) {
    const username = pathname.split('/')[2] || 'User'

    presenceData.details = 'Viewing User'
    presenceData.state = username

    if (showButtons) {
      presenceData.buttons = [{
        label: 'View Profile',
        url: document.location.href,
      }]
    }
  }
  else if (pathname.startsWith('/auctions')) {
    presenceData.details = 'Browsing Auctions'
  }
  else if (pathname.startsWith('/tools')) {
    presenceData.details = 'Using Tools'
    presenceData.state = 'Ducanator'
  }
  else {
    presenceData.details = 'Browsing Market'
    presenceData.state = 'Looking for deals'
  }

  presence.setActivity(presenceData)
})
