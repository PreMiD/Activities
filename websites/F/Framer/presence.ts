const presence = new Presence({
  clientId: '1339573271502262314',
})

let startTime = sessionStorage.getItem('presenceStartTime')

if (!startTime) {
  startTime = Math.floor(Date.now() / 1000).toString()
  sessionStorage.setItem('presenceStartTime', startTime)
}

presence.on('UpdateData', async () => {
  const presenceData: any = {
    details: 'Browsing Framer',
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/Framer/assets/logo.jpg',
    startTimestamp: Number(startTime),
  }

  const rawTitle = document.title
  const projectName = rawTitle.replace(/\s*- Framer\s*$/, '').trim()

  const pathSegments = document.location.pathname.split('/').filter(Boolean)

  if (document.location.pathname === '/') {
    presenceData.details = 'On Homepage'
  }
  else if (document.location.pathname === '/projects') {
    presenceData.details = 'Browsing All Projects'
  }
  else if (pathSegments[0] === 'projects' && pathSegments.length > 1) {
    presenceData.details = 'Editing a Project'
    presenceData.state = `Project: ${projectName}`
  }
  else if (document.location.pathname.startsWith('/prototype')) {
    presenceData.details = 'Prototyping in Framer'
  }
  else if (document.location.pathname.startsWith('/code')) {
    presenceData.details = 'Writing Code in Framer'
  }

  presence.setActivity(presenceData)
})
