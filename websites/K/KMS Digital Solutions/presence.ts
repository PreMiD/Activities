/// <reference path="../../../@types/premid/index.d.ts" />
const presence = new Presence({ clientId: '1332727864684187728' })

enum ActivityAssets {
  Logo = 'https://screens.lordreider.de/VUsu2/wAbEtOqi54.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

function sanitize(input?: string | null, maxLen = 96): string | undefined {
  if (!input) return undefined
  // Strip excessive whitespace and unsafe chars
  const cleaned = input.replace(/[\n\r\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim()
  return cleaned.length > maxLen ? cleaned.slice(0, maxLen - 1) + '…' : cleaned
}

function isPortalHost(host: string): boolean {
  return /(^|\.)kundenaccess\.de$/i.test(host)
}

function isKmsHost(host: string): boolean {
  return /(^|\.)kmsdigitalsolutions\.de$/i.test(host)
}

function getSectionFromPath(pathname: string): { section: string; label?: string } {
  const parts = pathname.toLowerCase().split('/').filter(Boolean)
  const first = parts[0] || ''

  switch (first) {
    case '%C3%BCber-uns': // safety if not decoded
    case 'über-uns':
    case 'ueber-uns':
      return { section: 'Über uns' }
    case 'leistungen':
    case 'services':
      return { section: 'Leistungen' }
    case 'unsere-dienste':
      return { section: 'Unsere Dienste' }
    case 'angebote':
      return { section: 'Angebote' }
    case 'faq':
    case 'fragen-und-antworten':
      return { section: 'FAQ' }
    case 'team':
      return { section: 'Team' }
    case 'portfolio':
    case 'referenzen':
      return { section: 'Portfolio' }
    case 'blog':
    case 'magazin': {
      const slug = parts[1]
      return slug ? { section: 'Artikel', label: slug } : { section: 'Blog' }
    }
    case 'karriere':
    case 'jobs':
      return { section: 'Karriere' }
    case 'kontakt':
      return { section: 'Kontakt' }
    case 'impressum':
      return { section: 'Impressum' }
    case 'datenschutz':
    case 'privacy':
      return { section: 'Datenschutz' }
    case 'agb':
      return { section: 'AGB' }
    case 'sla':
      return { section: 'SLA' }
    case 'k\u00fcndigungs-und-widerrufsformular':
    case 'kuendigungs-und-widerrufsformular':
      return { section: 'Kündigung/Widerruf' }
    case 'widerrufsbelehrung':
      return { section: 'Widerrufsbelehrung' }
    case 'downloadbereich':
      return { section: 'Downloadbereich' }
    case 'strompreis-rechner':
      return { section: 'Strompreis-Rechner' }
    case 'passwort-generator':
      return { section: 'Passwort-Generator' }
    case 'wissensdatenbank':
      return { section: 'Wissensdatenbank' }
    case 'serverstatus':
    case 'netzwerkstatus':
      return { section: 'Serverstatus' }
    default:
      return { section: parts.length ? parts.join(' / ') : 'Startseite' }
  }
}

function getPortalSection(pathname: string, search?: string): { section: string } {
  const p = pathname.toLowerCase()
  // WHMCS verwendet oft index.php?rp=/store/<slug>
  let virt = ''
  try {
    if (search) {
      const qs = new URLSearchParams(search)
      const rp = qs.get('rp')
      if (rp) virt = decodeURIComponent(rp.toLowerCase())
    }
  }
  catch { /* ignore */ }
  const s = virt || p

  if (s.includes('clientarea.php') || s.startsWith('/clientarea')) return { section: 'Client Area' }
  if (s.includes('cart.php') || s.startsWith('/cart')) return { section: 'Store / Cart' }
  if (s.includes('/store')) return { section: 'Store' }
  if (s.includes('knowledgebase')) return { section: 'Knowledgebase' }
  if (s.includes('supporttickets') || s.includes('submitticket')) return { section: 'Support Tickets' }
  if (s.includes('downloads')) return { section: 'Downloads' }
  if (s.includes('announcements')) return { section: 'Announcements' }
  if (s.includes('serverstatus') || s.includes('networkstatus')) return { section: 'Serverstatus' }
  if (s.includes('affiliates')) return { section: 'Affiliates' }
  if (s.includes('register') || s.includes('pwreset') || s.includes('password')) return { section: 'Auth' }
  if (s.includes('contact')) return { section: 'Kontakt' }

  // Product and category hints
  const map: Array<[RegExp, string]> = [
    [/webhosting/, 'Webhosting'],
    [/keeper/, 'Keeper (B2B)'],
    [/office\s*365|microsoft/, 'Microsoft Office 365 (B2B)'],
    [/maincubes|dedicated|dedizierte.*maincubes/, 'Dedizierte Server Maincubes'],
    [/interwerk/, 'Dedizierte Server Interwerk'],
    [/sonderposten/, 'Dedizierte Server Sonderposten'],
    [/kvm.*frankfurt/, 'KVM vServer Frankfurt'],
    [/kvm.*d[üu]sseldorf|kvm.*international/, 'KVM vServer Düsseldorf/International'],
    [/kvm.*storage|storage-?vserver/, 'KVM vServer Storage'],
    [/vpn/, 'VPN-Dienst'],
    [/managed.*applications?/, 'Managed Applications'],
    [/mail.*sogo|sogo/, 'Mail-Hosting mit SOGo'],
    [/j-?lawyer/, 'J-Lawyer Kanzleisoftware (B2B)'],
    [/dns/, 'DNS-Hosting'],
    [/resell|reselling|reseller/, 'Reselling (B2B)'],
    [/mitglied/, 'Mitgliedschaften'],
    [/ssl/, 'SSL-Zertifikate'],
    [/email/, 'Email-Services'],
    [/monitoring/, 'Website- und Server-Monitoring'],
    [/domain.*registr|registerdomain|domainchecker/, 'Domain registrieren'],
    [/domain.*transfer|transferdomain/, 'Domain transferieren'],
  ]
  for (const [rx, label] of map) {
    try {
      if (rx.test(s)) return { section: label }
    }
    catch {
      // ignore bad regex
    }
  }
  return { section: s === '/' || s === '' ? 'Startseite' : s.replace(/^\/+|\/+$/g, '') }
}

function maskQuery(query: string): string {
  try {
    const params = new URLSearchParams(query)
    // Remove/Mask potentially sensitive keys
    const sensitive = ['q', 'query', 'search', 'email', 'user', 'id', 'token']
    for (const key of sensitive) {
      if (params.has(key)) params.set(key, '*')
    }
    // Limit output
    const entries = Array.from(params.entries()).slice(0, 3)
    return entries.map(([k, v]) => `${k}=${v}`).join('&')
  }
  catch {
    return ''
  }
}

presence.on('UpdateData', async () => {
  const { hostname, search } = document.location
  const pathname = decodeURIComponent(document.location.pathname)

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  // Decide context by host
  if (isPortalHost(hostname)) {
    // Kundenportal
    const section = getPortalSection(pathname, search)
    presenceData.details = 'KMS Kundenportal'
    presenceData.state = sanitize(section.section)
  }
  else if (isKmsHost(hostname)) {
    // Öffentliche Website
    const section = getSectionFromPath(pathname)

    // Prefer document.title when helpful
    const title = sanitize(document.title)

    // Build nice details/state
    if (section.section === 'Startseite') {
      presenceData.details = 'KMS Digital Solutions'
      presenceData.state = 'Startseite'
    }
    else if (section.section === 'Artikel') {
      presenceData.details = 'Liest Artikel'
      // Use title if it seems like an article title and not the site name only
      presenceData.state = title && title.length > 5 ? title : sanitize(section.label)
    }
    else if (section.section === 'Blog') {
      presenceData.details = 'Durchstöbert Blog'
      presenceData.state = 'Beiträge'
    }
    else if (section.section === 'Leistungen') {
      presenceData.details = 'Erkundet Leistungen'
      presenceData.state = 'Services'
    }
    else if (section.section === 'Portfolio') {
      presenceData.details = 'Sichtet Portfolio'
      presenceData.state = 'Referenzen'
    }
    else if (section.section === 'Karriere') {
      presenceData.details = 'Sieht sich Jobs an'
      presenceData.state = 'Karriere'
    }
    else if (section.section === 'Kontakt') {
      presenceData.details = 'Kontaktseite'
      presenceData.state = '—'
    }
    else if (section.section === 'Impressum' || section.section === 'Datenschutz') {
      presenceData.details = section.section
      presenceData.state = 'Rechtliches'
    }
    else {
      presenceData.details = 'Browsing'
      presenceData.state = sanitize(section.section)
    }

    // If on search-like page, include non-sensitive query info
    if (search && /[?&](q|query|search)=/i.test(search)) {
      const masked = maskQuery(search)
      if (masked) presenceData.state = sanitize(`${presenceData.state} · ${masked}`, 96)
    }
  }
  else {
    // Safety: clear presence on unrelated hosts
    presence.setActivity()
    return
  }

  presence.setActivity(presenceData.details ? presenceData : {})
})
