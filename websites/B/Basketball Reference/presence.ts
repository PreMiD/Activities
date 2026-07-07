const presence = new Presence({
  clientId: '1509365921674952724',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const strings = await presence.getStrings({
    viewingPlayer: 'basketball_reference.viewingPlayer',
    viewingTeam: 'basketball_reference.viewingTeam',
    browsingSeason: 'basketball_reference.browsingSeason',
    viewingBoxScore: 'basketball_reference.viewingBoxScore',
    browsingLeaders: 'basketball_reference.browsingLeaders',
    browsingPlayoffs: 'basketball_reference.browsingPlayoffs',
    browsingTeams: 'basketball_reference.browsingTeams',
    browsingLeagues: 'basketball_reference.browsingLeagues',
    browsingPlayers: 'basketball_reference.browsingPlayers',
    browsingWNBA: 'basketball_reference.browsingWNBA',
    browsingDraft: 'basketball_reference.browsingDraft',
    browsingDraftYear: 'basketball_reference.browsingDraftYear',
    browsingStandings: 'basketball_reference.browsingStandings',
    browsingAwards: 'basketball_reference.browsingAwards',
    browsingFrivStandings: 'basketball_reference.browsingFrivStandings',
    browsingAllStar: 'basketball_reference.browsingAllStar',
    browsingAllStarYear: 'basketball_reference.browsingAllStarYear',
    browsingTeamDraft: 'basketball_reference.browsingTeamDraft', // <-- Nova string
    searching: 'general.search',
    browsingHome: 'general.viewHome',
  })

  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/Basketball%20Reference/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  const { pathname } = document.location

  if (/^\/players\/[a-z]\/\w+\.html/.test(pathname)) {
    const playerName
      = (document.querySelector('h1[itemprop=\'name\']')?.textContent || '').trim()
        || (document.title.split(' Stats')[0] || '').trim()
    presenceData.details = strings.viewingPlayer
    presenceData.state = playerName
  }
  // --- HISTÓRICO DE DRAFT DO TIME (Ex: /teams/WAS/draft.html) ---
  else if (/^\/teams\/[A-Z]+\/draft\.html/.test(pathname)) {
    const teamAcronym = pathname.match(/\/teams\/([A-Z]+)\/draft\.html/)?.[1] || ''
    const teamDraftName 
      = (document.querySelector('h1')?.textContent || '').trim()
        || document.title.replace(' Franchise Index', '').trim()
        || `${teamAcronym} Draft History`
        
    presenceData.details = strings.browsingTeamDraft
    presenceData.state = teamDraftName
  }
  else if (/^\/teams\/[A-Z]+\/\d+\.html/.test(pathname)) {
    const teamName
      = (document.querySelector('h1')?.textContent || '').trim()
        || (document.title.split(' Roster')[0] || '').trim()
    presenceData.details = strings.viewingTeam
    presenceData.state = teamName
  }
  else if (pathname.includes('_standings.html')) {
    const standingsYear = pathname.match(/NBA_(\d{4})_standings\.html/)?.[1] || ''
    presenceData.details = strings.browsingStandings
    presenceData.state = `NBA ${standingsYear}`
  }
  else if (/^\/leagues\/NBA_\d+\.html/.test(pathname)) {
    const season = pathname.match(/NBA_(\d+)/)?.[1] || ''
    presenceData.details = strings.browsingSeason
    presenceData.state = `NBA ${season}`
  }
  else if (pathname.startsWith('/boxscores/')) {
    presenceData.details = strings.viewingBoxScore
    presenceData.state = document.title.replace(' Box Score', '').trim()
  }
  else if (pathname.startsWith('/leaders/')) {
    presenceData.details = strings.browsingLeaders
    presenceData.state = 'NBA Leaders'
  }
  else if (pathname.startsWith('/playoffs/')) {
    const year = pathname.match(/\d{4}/)?.[0] || ''
    presenceData.details = strings.browsingPlayoffs
    presenceData.state = `NBA Playoffs ${year}`
  }
  else if (pathname.includes('/search/')) {
    const query = new URLSearchParams(document.location.search).get('search') || ''
    presenceData.details = strings.searching
    presenceData.state = `"${query}"`
  }
  else if (pathname.startsWith('/teams/')) {
    presenceData.details = strings.browsingTeams
  }
  else if (pathname.startsWith('/leagues/')) {
    presenceData.details = strings.browsingLeagues
  }
  else if (pathname.startsWith('/players/')) {
    presenceData.details = strings.browsingPlayers
  }
  else if (pathname.startsWith('/wnba/')) {
    presenceData.details = strings.browsingWNBA
  }
  else if (pathname.startsWith('/awards/')) {
    presenceData.details = strings.browsingAwards
    if (pathname !== '/awards/' && pathname !== '/awards/index.html') {
      const awardName = (document.querySelector('h1')?.textContent || '').trim()
      if (awardName) {
        presenceData.state = awardName
      }
    }
  }
  else if (pathname.startsWith('/friv/standings.fcgi')) {
    presenceData.details = strings.browsingFrivStandings
  }
  else if (pathname.startsWith('/allstar/')) {
    const allStarYear = pathname.match(/\/allstar\/(\d{4})/)?.[1]
    if (allStarYear) {
      presenceData.details = strings.browsingAllStarYear
      presenceData.state = `All-Star Game ${allStarYear}`
    } else {
      presenceData.details = strings.browsingAllStar
    }
  }
  else if (pathname.startsWith('/draft/')) {
    const draftYear = pathname.match(/_(\d{4})\.html/)?.[1]
    if (draftYear) {
      presenceData.details = strings.browsingDraftYear
      presenceData.state = `NBA Draft ${draftYear}`
    } else {
      presenceData.details = strings.browsingDraft
    }
  }
  else {
    presenceData.details = strings.browsingHome
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
