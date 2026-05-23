const presence = new Presence({
  clientId: '503557087041683458',
})

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Stuff.co.nz/assets/logo.png',
    name: 'Stuff.co.nz',
  }

  if (!document.querySelectorAll('.sics-component__headline__title')[0]) {
    if (
      document.URL === 'https://www.stuff.co.nz/'
      || document.URL === 'https://www.stuff.co.nz'
    ) {
      presenceData.details = 'Viewing the headlines'
      presenceData.startTimestamp = Math.floor(Date.now() / 1000)
    }
    else if (document.location.href.includes('/national')) {
      presenceData.startTimestamp = Math.floor(Date.now() / 1000)
      if (document.location.href.includes('/nz-earthquake')) {
        presenceData.details = 'Viewing national articles on...'
        presenceData.state = 'Earthquakes'
      }
      else if (document.location.href.includes('/crime')) {
        presenceData.details = 'Viewing national articles on...'
        presenceData.state = 'Crime'
      }
      else if (document.location.href.includes('/politics')) {
        presenceData.details = 'Viewing national articles on...'
        presenceData.state = 'Politics'
      }
      else if (document.location.href.includes('/stuff-circuit')) {
        presenceData.details = 'Viewing national articles on...'
        presenceData.state = 'Stuff Circuit'
      }
      else if (document.location.href.includes('/science')) {
        presenceData.details = 'Viewing national articles on...'
        presenceData.state = 'Science'
      }
      else if (document.location.href.includes('/education')) {
        presenceData.details = 'Viewing national articles on...'
        presenceData.state = 'Education'
      }
      else if (document.location.href.includes('/health')) {
        presenceData.details = 'Viewing national articles on...'
        presenceData.state = 'Health'
      }
      else if (document.location.href.includes('/1-news')) {
        presenceData.details = 'Viewing national articles from...'
        presenceData.state = '1 NEWS'
      }
      else if (document.location.href.includes('/maori-television')) {
        presenceData.details = 'Viewing national articles from...'
        presenceData.state = 'Māori Television'
      }
      else if (document.location.href.includes('/weather')) {
        presenceData.details = 'Viewing the weather...'
        presenceData.state = document.querySelectorAll('.section-location-header')[0]
          ?.textContent || 'National Forecast'
      }
      else if (document.location.href.includes('/quizzies')) {
        presenceData.details = 'Looking at quizzes'
        presenceData.startTimestamp = Math.floor(Date.now() / 1000)
      }
      else {
        presenceData.details = 'Viewing national headlines'
      }
    }
    else if (document.location.href.includes('/environment')) {
      presenceData.details = 'Viewing national articles on the...'
      presenceData.state = 'Environment'
    }
    else if (document.location.href.includes('/world')) {
      presenceData.startTimestamp = Math.floor(Date.now() / 1000)
      if (document.location.href.includes('/americas/donald-trumps-america')) {
        presenceData.details = 'Viewing international news from the...'
        presenceData.state = 'United States of America'
      }
      else if (document.location.href.includes('/americas')) {
        presenceData.details = 'Viewing international news from the...'
        presenceData.state = 'Americas'
      }
      else if (document.location.href.includes('/australia')) {
        presenceData.details = 'Viewing international news from...'
        presenceData.state = 'Australia'
      }
      else if (document.location.href.includes('/europe')) {
        presenceData.details = 'Viewing international news from...'
        presenceData.state = 'Europe'
      }
      else if (document.location.href.includes('/middle-east')) {
        presenceData.details = 'Viewing international news from the...'
        presenceData.state = 'Middle East'
      }
      else if (document.location.href.includes('/asia')) {
        presenceData.details = 'Viewing international news from...'
        presenceData.state = 'Asia'
      }
      else if (document.location.href.includes('/africa')) {
        presenceData.details = 'Viewing international news from...'
        presenceData.state = 'Africa'
      }
      else if (document.location.href.includes('/south-pacific')) {
        presenceData.details = 'Viewing international news from the...'
        presenceData.state = 'South Pacific'
      }
      else {
        presenceData.details = 'Viewing world-wide headlines'
      }
    }
    else if (document.location.href.includes('/business')) {
      presenceData.startTimestamp = Math.floor(Date.now() / 1000)
      if (document.location.href.includes('/property')) {
        presenceData.details = 'Viewing business news related to...'
        presenceData.state = 'Property'
      }
      else if (document.location.href.includes('/industries')) {
        presenceData.details = 'Viewing business news related to...'
        presenceData.state = 'Industries'
      }
      else if (document.location.href.includes('/money')) {
        presenceData.details = 'Viewing business news related to...'
        presenceData.state = 'Money'
      }
      else if (document.location.href.includes('/farming')) {
        presenceData.details = 'Viewing business news related to...'
        presenceData.state = 'NZ Farmer'
      }
      else if (document.location.href.includes('/opinion-analysis')) {
        presenceData.details = 'Viewing business news related to...'
        presenceData.state = 'Opinion & Analysis'
      }
      else if (document.location.href.includes('/small-business')) {
        presenceData.details = 'Viewing business news related to...'
        presenceData.state = 'Small Businesses'
      }
      else if (document.location.href.includes('/world')) {
        presenceData.details = 'Viewing international business news'
      }
      else {
        presenceData.details = 'Viewing business headlines'
      }
    }
    else if (document.location.href.includes('/sport')) {
      presenceData.startTimestamp = Math.floor(Date.now() / 1000)
      if (document.location.href.includes('/scores')) {
        presenceData.details = 'Viewing sports news related to...'
        presenceData.state = 'Scoring'
      }
      else if (document.location.href.includes('/opinion')) {
        presenceData.details = 'Viewing sports news related to...'
        presenceData.state = 'Opinion'
      }
      else if (document.location.href.includes('/rugby')) {
        presenceData.details = 'Viewing sports news related to...'
        presenceData.state = 'Rugby'
      }
      else if (document.location.href.includes('/cricket')) {
        presenceData.details = 'Viewing sports news related to...'
        presenceData.state = 'Cricket'
      }
      else if (document.location.href.includes('/league')) {
        presenceData.details = 'Viewing sports news related to...'
        presenceData.state = 'League'
      }
      else if (document.location.href.includes('/football')) {
        presenceData.details = 'Viewing sports news related to...'
        presenceData.state = 'Football'
      }
      else if (document.location.href.includes('/basketball')) {
        presenceData.details = 'Viewing sports news related to...'
        presenceData.state = 'Basketball'
      }
      else if (document.location.href.includes('/golf')) {
        presenceData.details = 'Viewing sports news related to...'
        presenceData.state = 'Golf'
      }
      else if (document.location.href.includes('/netball')) {
        presenceData.details = 'Viewing sports news related to...'
        presenceData.state = 'Netball'
      }
      else if (document.location.href.includes('/tennis')) {
        presenceData.details = 'Viewing sports news related to...'
        presenceData.state = 'Tennis'
      }
      else if (document.location.href.includes('/motorsport')) {
        presenceData.details = 'Viewing sports news related to...'
        presenceData.state = 'Motorsport'
      }
      else if (document.location.href.includes('/esport')) {
        presenceData.details = 'Viewing sports news related to...'
        presenceData.state = 'esport'
      }
      else if (document.location.href.includes('/combat')) {
        presenceData.details = 'Viewing sports news related to...'
        presenceData.state = 'Combat'
      }
      else if (document.location.href.includes('/other-sports')) {
        presenceData.details = 'Viewing sporting news'
      }
      else {
        presenceData.details = 'Viewing sporting headlines'
      }
    }
    else if (document.location.href.includes('/entertainment')) {
      presenceData.startTimestamp = Math.floor(Date.now() / 1000)
      if (document.location.href.includes('/bravo')) {
        presenceData.details = 'Viewing articles related to...'
        presenceData.state = 'Bravo'
      }
      else if (document.location.href.includes('/celebrities')) {
        presenceData.details = 'Viewing entertainment articles related to...'
        presenceData.state = 'Celebrities'
      }
      else if (document.location.href.includes('/film')) {
        presenceData.details = 'Viewing entertainment articles related to...'
        presenceData.state = 'Film'
      }
      else if (document.location.href.includes('/music')) {
        presenceData.details = 'Viewing entertainment articles related to...'
        presenceData.state = 'Music'
      }
      else if (document.location.href.includes('/tv-radio')) {
        presenceData.details = 'Viewing entertainment articles related to...'
        presenceData.state = 'TV & Radio'
      }
      else if (document.location.href.includes('/games')) {
        presenceData.details = 'Viewing entertainment articles related to...'
        presenceData.state = 'Games'
      }
      else if (document.location.href.includes('/books')) {
        presenceData.details = 'Viewing entertainment articles related to...'
        presenceData.state = 'Books'
      }
      else if (document.location.href.includes('/arts')) {
        presenceData.details = 'Viewing entertainment articles related to...'
        presenceData.state = 'The Arts'
      }
      else if (document.location.href.includes('/events')) {
        presenceData.details = 'Viewing entertainment articles related to...'
        presenceData.state = 'Events'
      }
      else {
        presenceData.details = 'Viewing entertainment headlines'
      }
    }
    else if (document.location.href.includes('/life-style')) {
      presenceData.startTimestamp = Math.floor(Date.now() / 1000)
      if (document.location.href.includes('/love-sex')) {
        presenceData.details = 'Viewing lifestyle articles related to...'
        presenceData.state = 'Love & Sex'
      }
      else if (document.location.href.includes('/well-good')) {
        presenceData.details = 'Viewing lifestyle articles related to...'
        presenceData.state = 'Well & Good'
      }
      else if (document.location.href.includes('/food-wine')) {
        presenceData.details = 'Viewing lifestyle articles related to...'
        presenceData.state = 'Food & Wine'
      }
      else if (document.location.href.includes('/parenting')) {
        presenceData.details = 'Viewing lifestyle articles related to...'
        presenceData.state = 'Parenting'
      }
      else if (document.location.href.includes('/beauty')) {
        presenceData.details = 'Viewing lifestyle articles related to...'
        presenceData.state = 'Beauty'
      }
      else if (document.location.href.includes('/fashion')) {
        presenceData.details = 'Viewing lifestyle articles related to...'
        presenceData.state = 'Fashion'
      }
      else if (document.location.href.includes('/homed')) {
        presenceData.details = 'Viewing lifestyle articles related to...'
        presenceData.state = 'Homed'
      }
      else if (document.location.href.includes('/weddings')) {
        presenceData.details = 'Viewing lifestyle articles related to...'
        presenceData.state = 'Weddings'
      }
      else if (document.location.href.includes('/royal-family')) {
        presenceData.details = 'Viewing lifestyle articles related to...'
        presenceData.state = 'The Royal Family'
      }
      else if (document.location.href.includes('/cutestuff')) {
        presenceData.details = 'Viewing lifestyle articles related to...'
        presenceData.state = 'Cute Stuff'
      }
      else if (document.location.href.includes('/puzzles')) {
        presenceData.details = 'Viewing puzzles'
      }
      else {
        presenceData.details = 'Viewing lifestyle headlines'
      }
    }
    else if (document.location.href.includes('/travel')) {
      presenceData.startTimestamp = Math.floor(Date.now() / 1000)
      if (document.location.href.includes('/back-your-backyard')) {
        presenceData.details = 'Viewing travel articles related to...'
        presenceData.state = 'Back your Backyard'
      }
      else if (document.location.href.includes('/green-travel')) {
        presenceData.details = 'Viewing travel articles related to...'
        presenceData.state = 'Green Travel'
      }
      else if (document.location.href.includes('/kiwi-traveller')) {
        presenceData.details = 'Viewing travel articles related to...'
        presenceData.state = 'Kiwi Traveller'
      }
      else if (document.location.href.includes('/snow')) {
        presenceData.details = 'Viewing travel articles related to...'
        presenceData.state = 'Snow'
      }
      else if (document.location.href.includes('/destinations')) {
        presenceData.details = 'Viewing travel articles related to...'
        presenceData.state = 'Destinations'
      }
      else if (document.location.href.includes('/themes')) {
        presenceData.details = 'Viewing travel articles related to...'
        presenceData.state = 'Themes'
      }
      else if (document.location.href.includes('/news')) {
        presenceData.details = 'Viewing travel articles related to...'
        presenceData.state = 'News'
      }
      else if (document.location.href.includes('/travel-troubles')) {
        presenceData.details = 'Viewing travel articles related to...'
        presenceData.state = 'Travel Troubles'
      }
      else if (document.location.href.includes('/cruising')) {
        presenceData.details = 'Viewing travel articles related to...'
        presenceData.state = 'Cruising'
      }
      else {
        presenceData.details = 'Viewing travel headlines'
      }
    }
    else if (document.location.href.includes('/motoring')) {
      presenceData.startTimestamp = Math.floor(Date.now() / 1000)
      if (document.location.href.includes('/electric-vehicles')) {
        presenceData.details = 'Viewing motoring articles related to...'
        presenceData.state = 'Electric Vehicles'
      }
      else if (document.location.href.includes('/road-tests')) {
        presenceData.details = 'Viewing travel articles related to...'
        presenceData.state = 'Reviews'
      }
      else if (document.location.href.includes('/bikes')) {
        presenceData.details = 'Viewing travel articles related to...'
        presenceData.state = 'Bikes'
      }
      else if (document.location.href.includes('/customs-classics')) {
        presenceData.details = 'Viewing travel articles related to...'
        presenceData.state = 'Customs & Classics'
      }
      else if (document.location.href.includes('/top-cars')) {
        presenceData.details = 'Viewing travel articles related to...'
        presenceData.state = 'Top Cars'
      }
      else if (document.location.href.includes('/news')) {
        presenceData.details = 'Viewing motoring news'
      }
      else {
        presenceData.details = 'Viewing motoring headlines'
      }
    }
  }
  else {
    presenceData.details = 'Reading an article...'
    presenceData.state = document.querySelectorAll(
      '.sics-component__headline__title',
    )[0]?.textContent
    presenceData.startTimestamp = Math.floor(Date.now() / 1000)
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
