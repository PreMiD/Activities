const presence = new Presence({
  clientId: '1557545790082256927',
})

enum ActivityAssets {
  Logo = 'https://vrchat.dance/logo-512.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

const ROLES: Record<string, string> = {
  dancer: 'Dancer',
  dj: 'DJ',
  photographer: 'Photographer',
  host: 'Host',
  security: 'Security',
  artist: 'Artist',
}

// the people pages: /dancers/<name>, /djs/<name>…
const PEOPLE: Record<string, [string, string]> = {
  dancers: ['Browsing dancers', 'Viewing a dancer'],
  djs: ['Browsing DJs', 'Viewing a DJ'],
  photographers: ['Browsing photographers', 'Viewing a photographer'],
  hosts: ['Browsing hosts', 'Viewing a host'],
  security: ['Browsing security', 'Viewing a security member'],
  artists: ['Browsing artists', 'Viewing an artist'],
  duos: ['Browsing duos', 'Viewing a duo'],
  fans: ['Browsing vrchat.dance', 'Viewing a profile'],
}

/** The name of the club or person the page is about (its heading). */
function pageTitle() {
  return document.querySelector('h1')?.textContent?.trim() ?? ''
}

presence.on('UpdateData', async () => {
  const [showProfile, showPage, showButtons] = await Promise.all([
    presence.getSetting<boolean>('showProfile'),
    presence.getSetting<boolean>('showPage'),
    presence.getSetting<boolean>('showButtons'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, origin, href } = document.location
  const [section = '', item = ''] = pathname.split('/').filter(Boolean)
  const here = href.split(/[?#]/)[0]!

  // what they are looking at
  let doing = 'Browsing vrchat.dance'
  let about = ''
  let button = ''
  if (!section) {
    doing = 'Browsing the home page'
  }
  else if (section === 'clubs') {
    doing = item ? 'Viewing a club' : 'Browsing clubs'
    if (item) {
      about = pageTitle()
      button = 'View this club'
    }
  }
  else if (PEOPLE[section]) {
    doing = PEOPLE[section][item ? 1 : 0]
    if (item) {
      about = pageTitle()
      button = 'View this profile'
    }
  }
  else if (section === 'schedule') {
    doing = 'Checking tonight\'s schedule'
  }
  else if (section === 'calendar') {
    doing = 'Viewing the calendar'
  }
  else if (section === 'me') {
    doing = 'Editing their account'
  }
  else if (section === 'guide' || section === 'tour') {
    doing = 'Reading the guide'
  }
  if (!showPage) {
    doing = 'Browsing vrchat.dance'
    about = ''
    button = ''
  }

  // the signed-in member, written in the page by the site (#pmd-me)
  const me = showProfile ? document.querySelector<HTMLElement>('#pmd-me')?.dataset : undefined
  const myPage = me?.path ? `${origin}${me.path}` : ''
  if (myPage && here === myPage) {
    doing = 'Viewing their own profile'
    about = ''
    button = ''
  }

  if (me?.name) {
    const role = [ROLES[me.roles?.split(',')[0] ?? ''], me.club].filter(Boolean).join(' · ')
    presenceData.details = me.name
    presenceData.state = about ? `${doing}: ${about}` : doing
    if (me.picture) {
      presenceData.largeImageKey = new URL(me.picture, origin).href
      presenceData.smallImageKey = ActivityAssets.Logo
      presenceData.smallImageText = role || 'vrchat.dance'
    }
    presenceData.detailsUrl = myPage
    presenceData.largeImageUrl = myPage
  }
  else {
    presenceData.details = doing
    if (about)
      presenceData.state = about
  }

  if (showButtons) {
    const buttons: ButtonData[] = []
    if (myPage)
      buttons.push({ label: 'View my profile', url: myPage })
    if (button)
      buttons.push({ label: button, url: here })
    if (buttons.length)
      presenceData.buttons = buttons.slice(0, 2) as [ButtonData, ButtonData?]
  }

  presence.setActivity(presenceData)
})
