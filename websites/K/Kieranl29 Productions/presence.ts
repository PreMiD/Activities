const presence = new Presence({
  clientId: 'REPLACE_WITH_DISCORD_APPLICATION_ID',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/K/Kieranl29%20Productions/assets/logo.png',
}

interface Site {
  name: string
  logo: string
  url: string
}

const sites: Record<string, Site> = {
  'kl29.co.uk': {
    name: 'Kieranl29 Productions',
    logo: ActivityAssets.Logo,
    url: 'https://kl29.co.uk/',
  },
  'kieranl29productions.co.uk': {
    name: 'Kieranl29 Productions',
    logo: ActivityAssets.Logo,
    url: 'https://kieranl29productions.co.uk/',
  },
  'nearme.kl29.co.uk': {
    name: 'Aircraft Near Me',
    logo: ActivityAssets.Logo,
    url: 'https://nearme.kl29.co.uk/',
  },
  'tff.wales': {
    name: 'Transport for Flamingo',
    logo: 'https://kl29.co.uk/assets/tff.webp',
    url: 'https://tff.wales/',
  },
  'uktransportboards.com': {
    name: 'UK Transport Boards',
    logo: 'https://kl29.co.uk/assets/uktb-logo-white.png',
    url: 'https://uktransportboards.com/',
  },
  'shop.uktransportboards.com': {
    name: 'UK Transport Boards Shop',
    logo: 'https://kl29.co.uk/assets/uktb-logo-white.png',
    url: 'https://shop.uktransportboards.com/',
  },
  'onemoreslice.co.uk': {
    name: 'One More Slice',
    logo: 'https://i.ibb.co/Gv09NFKD/oneslicewhiteksmall.png',
    url: 'https://onemoreslice.co.uk/',
  },
  'pogobakery.com': {
    name: 'Pogo Bakery',
    logo: 'https://pogobakery.com/assets/pogologo.png',
    url: 'https://pogobakery.com/',
  },
  'framesocials.com': {
    name: 'Frame Socials',
    logo: 'https://kl29.co.uk/assets/framesocials.png',
    url: 'https://framesocials.com/',
  },
  'artsian.wales': {
    name: 'ArtSiân',
    logo: 'https://artsian.wales/assets/artsian-logo-sm.png',
    url: 'https://artsian.wales/',
  },
  'southwalesaviationmuseum.com': {
    name: 'South Wales Aviation Museum',
    logo: 'https://cdn.kieranl29productions.co.uk/dataimgs/swam.png',
    url: 'https://southwalesaviationmuseum.com/',
  },
  'planetxo.uk': {
    name: 'PlanetXO',
    logo: 'https://cdn.kieranl29productions.co.uk/dataimgs/planetxologo.png',
    url: 'https://planetxo.uk/',
  },
  'builtbyjake.fit': {
    name: 'Built By Jake',
    logo: 'https://cdn.kieranl29productions.co.uk/dataimgs/bbj/bbjlogowhite.png',
    url: 'https://www.builtbyjake.fit/',
  },
  'djlazyb.com': {
    name: 'The Chill Out Zone',
    logo: 'https://cdn.kieranl29productions.co.uk/dataimgs/lazyb.png',
    url: 'https://djlazyb.com/',
  },
}

function getSite(hostname: string): Site {
  const host = hostname.replace(/^www\./, '')
  if (sites[host])
    return sites[host]
  const match = Object.keys(sites).find(domain => host.endsWith(`.${domain}`))
  return match ? sites[match]! : sites['kl29.co.uk']!
}

function getPageName(siteName: string): string {
  const title = document.title.trim()
  const cleaned = title
    .split(/\s[|\-–—]\s/)
    .map(part => part.trim())
    .filter(part => part && part.toLowerCase() !== siteName.toLowerCase())
  if (cleaned[0])
    return cleaned[0]
  const path = document.location.pathname.replace(/\/+$/, '')
  if (!path)
    return 'Home'
  const last = decodeURIComponent(path.split('/').pop() ?? '')
  return last.replace(/[-_]+/g, ' ').replace(/\.\w+$/, '').replace(/\b\w/g, c => c.toUpperCase())
}

presence.on('UpdateData', async () => {
  const [showPage, showButtons] = await Promise.all([
    presence.getSetting<boolean>('showPage'),
    presence.getSetting<boolean>('showButtons'),
  ])
  const site = getSite(document.location.hostname)
  const isKl29 = site.logo === ActivityAssets.Logo

  const presenceData: PresenceData = {
    largeImageKey: site.logo,
    largeImageText: site.name,
    details: `Browsing ${site.name}`,
    startTimestamp: browsingTimestamp,
  }

  if (!isKl29) {
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.smallImageText = 'Built by Kieranl29 Productions'
  }

  if (showPage)
    presenceData.state = getPageName(site.name)

  if (showButtons) {
    presenceData.buttons = [{ label: `Visit ${site.name}`.slice(0, 32), url: site.url }]
    if (!isKl29)
      presenceData.buttons.push({ label: 'Kieranl29 Productions', url: 'https://kl29.co.uk/' })
  }

  presence.setActivity(presenceData)
})
