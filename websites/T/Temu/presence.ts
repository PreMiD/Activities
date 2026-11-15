const presence = new Presence({
  clientId: '1489860025316020245',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/T/Temu/assets/logo.png',
}

let elapsed = Math.floor(Date.now() / 1000)
let prev = ''

function cleanTitle(): string {
  return document.title.replace(/\s*[-|]\s*Temu.*$/i, '').replace(/^Temu.*?[-|]\s*/i, '').trim()
}

presence.on('UpdateData', async () => {
  const path = document.location.pathname
  const href = document.location.href
  const title = cleanTitle()
  const query = new URLSearchParams(document.location.search).get('search_key')

  if (href !== prev) {
    prev = href
    elapsed = Math.floor(Date.now() / 1000)
  }

  const data: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: elapsed,
  }

  if (path.includes('-g-') || path.includes('goods.html')) {
    data.details = 'Viewing product:'
    data.state = title ? (title.length > 128 ? `${title.substring(0, 125)}...` : title) : 'Unknown'
  }
  else if (path.includes('search_result')) {
    data.details = query ? `Searching: ${query}` : 'Searching for products'
  }
  else if (path.includes('cart')) {
    data.details = 'Viewing their cart'
  }
  else if (path.includes('orders')) {
    data.details = 'Viewing their orders'
  }
  else if (path.includes('coupon')) {
    data.details = 'Browsing coupons'
  }
  else if (path.includes('channel')) {
    data.details = title || 'Browsing a category'
  }
  else if (path.includes('support')) {
    data.details = 'Viewing support center'
  }
  else if (path === '/') {
    data.details = 'Browsing the homepage'
  }
  else {
    data.details = 'Browsing Temu'
  }

  presence.setActivity(data)
})
