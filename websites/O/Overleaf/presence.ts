const presence = new Presence({
  clientId: '784954155747377162',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/Overleaf/assets/logo.png',
    smallImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/Overleaf/assets/0.png',
    smallImageText: 'Overleaf',
    startTimestamp: browsingTimestamp,
  }
  const pth = window.location.pathname.toLowerCase()

  // Projects page (hub)
  if (pth === '/project' || pth === '/project/') {
    presenceData.details = 'Browsing Projects'
    const actif = document
      .querySelectorAll('.project-list-sidebar')[0]
      ?.querySelectorAll('.active')
    const maybecustom = actif?.[0]?.querySelectorAll('.name.ng-binding')
    if (maybecustom?.length !== 0)
      presenceData.state = maybecustom?.[0]?.textContent
    // Take care of (i) logo
    else presenceData.state = actif?.[0]?.querySelectorAll('a')[0]?.textContent
  }
  else if (pth.includes('/project')) {
    // Project page
    presenceData.details = document.title.replace(
      '- Online LaTeX Editor Overleaf',
      '',
    )
    presenceData.state = document
      .querySelectorAll('.file-tree-list')[0]
      ?.querySelectorAll('.selected')[0]
      ?.querySelectorAll('span')[0]
      ?.textContent
  }
  else if (pth.includes('/learn')) {
    // Documentation
    presenceData.details = 'Browsing Documentation'
    if (pth === '/learn' || pth === '/learn/') {
      presenceData.state = 'Main Page'
    }
    else {
      presenceData.state = document.title.replace(
        '- Overleaf, Online LaTeX Editor',
        '',
      )
    }
  }
  else {
    // Random other pages
    presenceData.details = 'Browsing:'
    presenceData.state = document.title.replace(
      '- Overleaf, Online LaTeX Editor',
      '',
    )
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
