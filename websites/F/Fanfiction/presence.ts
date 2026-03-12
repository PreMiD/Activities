const presence = new Presence({
  clientId: '630790482804473857',
})
const crossover: unknown[] = []
const tags = [
  '/anime/',
  '/book/',
  '/cartoon/',
  '/comic/',
  '/game/',
  '/misc/',
  '/movie/',
  '/play/',
  'tv',
]
const browsingTimetsamp = Math.floor(Date.now() / 1000)
let anime
for (let i = 0; i < tags.length; i++) crossover.push([`/crossovers${tags[i]}`])

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/F/Fanfiction/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimetsamp,
  }

  if (document.location.pathname === '/') {
    presenceData.details = 'Browing fanfics'
    presenceData.state = 'at Homepage'
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.smallImageText = 'browsing'
  }
  else if (tags.includes(document.location.pathname)) {
    presenceData.details = 'Exploring Fanfics'
    presenceData.state = `Catagory: ${document.location.pathname.replace(
      '/',
      ' ',
    )} `
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.smallImageText = document.location.href
  }
  else if (document.location.pathname.startsWith('/s/')) {
    presenceData.details = 'Reading Fanfiction..'
    presenceData.state = `title: ${document.location.pathname
      .replace('/s/', '')
      .split('/')
      .join('')
      .replace(/\d+/, '')
      .replace('crossovers', '')
      .split('-')
      .join(' ')} `
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.smallImageText = document.location.href
    presence.setActivity(presenceData)
  }
  else if (crossover.includes(document.location.pathname)) {
    presenceData.details = 'Exploring Fanfics'
    presenceData.state = `Catagory: ${document.location.pathname
      .replace('crossovers', '')
      .replace('/', ' ')} (Crossover) `
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.smallImageText = document.location.href
  }
  else if (/\d/.test(document.location.pathname)) {
    anime = document.location.pathname
      .split('/')
      .join('')
      .replace(/\d+/, '')
      .replace('crossovers', '')

    presenceData.details = 'Exploring Fanfics'
    presenceData.state = `Looking for ${anime} `
    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.smallImageText = document.location.href
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
