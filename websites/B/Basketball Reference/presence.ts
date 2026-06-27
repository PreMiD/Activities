const presence = new Presence({
  clientId: '1509365921674952724',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/Basketball%20Reference/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  const { pathname } = document.location
  const p = presence as any

  if (/^\/players\/[a-z]\/\w+\.html/.test(pathname)) {
    const playerName
      = (document.querySelector('h1[itemprop=\'name\']')?.textContent || '').trim()
        || (document.title.split(' Stats')[0] || '').trim()
    presenceData.details = p.getString('viewingPlayer')
    presenceData.state = playerName
  }
  else if (/^\/teams\/[A-Z]+\/\d+\.html/.test(pathname)) {
    const teamName
      = (document.querySelector('h1')?.textContent || '').trim()
        || (document.title.split(' Roster')[0] || '').trim()
    presenceData.details = p.getString('viewingTeam')
    presenceData.state = teamName
  }
  else if (/^\/leagues\/NBA_\d+\.html/.test(pathname)) {
    const season = pathname.match(/NBA_(\d+)/)?.[1] || ''
    presenceData.details = p.getString('browsingSeason')
    presenceData.state = `NBA ${season}`
  }
  else if (pathname.startsWith('/boxscores/')) {
    presenceData.details = p.getString('viewingBoxScore')
    presenceData.state = document.title.replace(' Box Score', '').trim()
  }
  else if (pathname.startsWith('/leaders/')) {
    presenceData.details = p.getString('browsingLeaders')
    presenceData.state = 'NBA Leaders'
  }
  else if (pathname.startsWith('/playoffs/')) {
    const year = pathname.match(/\d{4}/)?.[0] || ''
    presenceData.details = p.getString('browsingPlayoffs')
    presenceData.state = `NBA Playoffs ${year}`
  }
  else if (pathname.includes('/search/')) {
    const query = new URLSearchParams(document.location.search).get('search') || ''
    presenceData.details = p.getString('searching')
    presenceData.state = `"${query}"`
  }
  else {
    presenceData.details = p.getString('browsingHome')
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
