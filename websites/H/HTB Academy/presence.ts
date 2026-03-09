const presence = new Presence({
  clientId: '1200517025383075840',
})

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/HTB%20Academy/assets/logo.jpg',
  }

  if (pathname === '/') {
    presenceData.details = 'Breaching into the Academy'
  }

  else if (pathname.includes('/dashboard')) {
    presenceData.details = 'Browsing the dashboard'

    const progress = document.querySelectorAll('.text-primary.font-mono.text-2xl.font-medium.inline-block')

    const off = progress[0]?.textContent || '0'
    const def = progress[1]?.textContent || '0'
    const gen = progress[2]?.textContent || '0'

    presenceData.state = `Off: ${off} | Def: ${def} | Gen: ${gen}`
  }

  else if (pathname.includes('/paths')) {
    presenceData.details = 'Browsing paths'
  }

  else if (pathname.includes('/modules')) {
    presenceData.details = 'Browsing modules'
  }

  else if (pathname.includes('/section') && pathname.includes('/module')) {
    const ModuleNameArray = document.querySelector('.grow main a')?.textContent?.trim()?.split(' ') ?? []
    const moduleName = ModuleNameArray.slice(0, -1).join(' ') || 'Module'
    const sectionName = document.querySelector('.text-4xl.text-primary.font-bold.mb-4')?.textContent || 'Section'

    presenceData.details = `Reading Module: ${moduleName}`
    presenceData.state = `Section: ${sectionName}`
  }

  else if (pathname.includes('/module')) {
    const title = document.querySelector('.module-header-title')?.textContent
    presenceData.details = 'Reading details about module:'
    presenceData.state = title ? `"${title}"` : 'Unknown Module'
  }

  else if (pathname.includes('/my-certificates')) {
    presenceData.details = 'Looking at certificates'
    presenceData.state = 'Admiration Mode'
  }

  else if (pathname.includes('/my-badges')) {
    presenceData.details = 'Looking at badges'
  }

  presence.setActivity(presenceData)
})
