const presence = new Presence({
  clientId: '1471435992442474506',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/R/Recodive/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const time = await presence.getSetting<boolean>('time')

  const strings = await presence.getStrings({
    browse: 'general.browsing',
    home: 'general.viewHome',
    viewPage: 'general.viewPage',
    view: 'general.view',
    branding: 'recodive.branding',
    jobs: 'recodive.jobs',
    imprint: 'recodive.imprint',
    terms: 'recodive.terms',
    privacy: 'recodive.privacy',
    cookies: 'recodive.cookies',
    withdrawal: 'recodive.withdrawal',
    legal: 'recodive.legal',
    projects: 'recodive.projects',
    about: 'recodive.about',
    team: 'recodive.team',
    contact: 'recodive.contact',
  })

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  const { pathname, hash } = document.location
  let entityName

  if (time)
    presenceData.startTimestamp = browsingTimestamp

  switch (true) {
    case pathname.includes('/branding'):
      presenceData.details = strings.viewPage
      presenceData.state = strings.branding
      break
    case pathname.includes('/jobs'):
      presenceData.details = strings.viewPage
      presenceData.state = strings.jobs
      break
    case /\/legal(?:\/.+\/)?/.test(pathname):
      entityName = pathname.match(/\/legal\/(.+)\//)?.[1]
      if (entityName === 'recodive') {
        presenceData.state = 'Recodive - '
      }
      else if (entityName === 'premid') {
        presenceData.state = 'PreMiD - '
      }
      else {
        presenceData.state = ''
      }

      switch (true) {
        case pathname.includes('/imprint'):
          presenceData.details = strings.viewPage
          presenceData.state += strings.imprint
          break
        case pathname.includes('/terms'):
          presenceData.details = strings.viewPage
          presenceData.state += strings.terms
          break
        case pathname.includes('/privacy'):
          presenceData.details = strings.viewPage
          presenceData.state += strings.privacy
          break
        case pathname.includes('/cookies'):
          presenceData.details = strings.viewPage
          presenceData.state += strings.cookies
          break
        case pathname.includes('/withdrawal-rights'):
          presenceData.details = strings.viewPage
          presenceData.state += strings.withdrawal
          break
        default:
          presenceData.details = strings.viewPage
          presenceData.state += strings.legal
          break
      }
      break
    default:
      presenceData.details = strings.home
      if (hash)
        presenceData.state = `${strings.view} ${strings[hash.slice(1) as keyof typeof strings]}`
      break
  }

  presence.setActivity(presenceData)
})
