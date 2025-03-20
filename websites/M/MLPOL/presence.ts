const browsingTimestamp = Math.floor(Date.now() / 1000)
const presence = new Presence({
  clientId: '781944209770151997',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/MLPOL/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  // I was gonna do a bunch of DOM manipulation but I give up on life so I'm just gonna do the most spaghetti way of doing this humanly possible.

  // Home
  if (document.location.pathname === '/')
    presenceData.details = 'Homepage'

  // Boards
  if (document.location.pathname === '/mlpol')
    presenceData.details = '/mlpol/ - My Little Politics'

  if (document.location.pathname === '/qa')
    presenceData.details = '/qa/ - Questions and Answers'

  if (document.location.pathname === '/go')
    presenceData.details = '/go/ - Golden Oaks'

  if (document.location.pathname === '/1ntr')
    presenceData.details = '/1ntr/ - Internet & Imageboards'

  if (document.location.pathname === '/vx')
    presenceData.details = '/vx/ - Videogames and Paranormal'

  if (document.location.pathname === '/cyb')
    presenceData.details = '/cyb/ - Cyberpunk Fiction and Fact'

  if (document.location.pathname === '/sp')
    presenceData.details = '/sp/ - Football'

  if (document.location.pathname === '/ub')
    presenceData.details = '/ub/ - Überhengst'

  if (document.location.pathname === '/a')
    presenceData.details = '/a/ - Anime and Manga'

  // Starts With
  if (document.location.pathname.startsWith('/mlpol/'))
    presenceData.details = '/mlpol/ - My Little Politics'

  if (document.location.pathname.startsWith('/qa/'))
    presenceData.details = '/qa/ - Questions and Answers'

  if (document.location.pathname.startsWith('/go/'))
    presenceData.details = '/go/ - Golden Oaks'

  if (document.location.pathname.startsWith('/1ntr/'))
    presenceData.details = '/1ntr/ - Internet & Imageboards'

  if (document.location.pathname.startsWith('/vx/'))
    presenceData.details = '/vx/ - Videogames and Paranormal'

  if (document.location.pathname.startsWith('/cyb/'))
    presenceData.details = '/cyb/ - Cyberpunk Fiction and Fact'

  if (document.location.pathname.startsWith('/sp/'))
    presenceData.details = '/sp/ - Football'

  if (document.location.pathname.startsWith('/ub/'))
    presenceData.details = '/ub/ - Überhengst'

  if (document.location.pathname.startsWith('/a/'))
    presenceData.details = '/a/ - Anime and Manga'

  presence.setActivity(presenceData)
})
