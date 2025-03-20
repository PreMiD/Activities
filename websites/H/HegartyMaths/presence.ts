const presence = new Presence({
  clientId: '935600572457963561',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const privacy = await presence.getSetting<boolean>('privacy')
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/HegartyMaths/assets/logo.jpg',
    startTimestamp: browsingTimestamp,
  }

  if (
    document.location.pathname === '/'
    || document.location.pathname.includes('/login/')
  ) {
    presenceData.details = 'Viewing home page'
  }
  else if (document.location.pathname === '/my-stats') {
    presenceData.details = 'Viewing profile'
    if (!privacy) {
      const correct = Math.round(
        (Number(
          document.querySelector('div#vue-tooltip-6 small span')?.innerHTML,
        )
        / Number(
          document.querySelector('div#vue-tooltip-5 small span')?.innerHTML,
        ))
        * 100,
      )
      presenceData.state = `${correct}% correct answers`
    }
  }
  else if (document.location.pathname === '/assessment') {
    if (
      document.querySelectorAll('ul.Assessment__breadcrumb li')[0]?.innerHTML
      === 'Fix Up 5'
    ) {
      presenceData.details = 'Revising'
      if (!privacy)
        presenceData.state = 'Fix Up 5'
    }
    else {
      presenceData.details = 'Doing a lesson'
      if (!privacy) {
        presenceData.state = new DOMParser().parseFromString(
          document.querySelectorAll('ul.Assessment__breadcrumb li')[2]!
            .innerHTML,
          'text/html',
        ).documentElement.textContent
      }
    }
  }
  else if (document.location.pathname.includes('/progress')) {
    presenceData.details = 'Choosing a lesson'
  }
  else if (document.location.pathname.includes('/scores')) {
    if (document.location.pathname !== '/scores') {
      presenceData.details = 'Viewing scores for a task'
      if (!privacy) {
        const task = (presenceData.state = new DOMParser().parseFromString(
          document.querySelector('h2.Review__name')?.innerHTML ?? '',
          'text/html',
        ).documentElement.textContent)

        presenceData.state = `${task}: ${
          document.querySelector('div.Review__hero-score h1')?.innerHTML ?? ''
        }`
      }
    }
    else {
      switch (new URLSearchParams(window.location.search).get('filter')) {
        case 'green':
          presenceData.details = 'Viewing green scores'
          break
        case 'amber':
          presenceData.details = 'Viewing amber scores'
          break
        case 'red':
          presenceData.details = 'Viewing red scores'
          break
        default:
          presenceData.details = 'Viewing all scores'
          break
      }
      const text = document.querySelector('div.row div.col-xs-12')?.innerHTML
      const outof = Math.ceil(
        Number(text?.substring(text?.indexOf('f ') + 1).slice(0, 4)) / 10,
      )
      const pageParams = new URLSearchParams(window.location.search)

      presenceData.state = `Page ${
        pageParams.has('page') ? pageParams.get('page') : 1
      } of ${outof === 0 ? 1 : outof}`
    }
  }
  else if (document.location.pathname.includes('/tasks')) {
    presenceData.details = 'Viewing tasks'
    if (document.querySelector('table.table tbody')) {
      if (!privacy) {
        presenceData.state = `${
          document.querySelectorAll('table.table tbody tr').length
        } tasks`
      }
    }
    else {
      presenceData.state = 'No tasks'
    }
  }
  else {
    switch (document.location.pathname) {
      case '/fixup5':
        presenceData.details = 'Revising'
        if (!privacy)
          presenceData.state = 'Fix Up 5'
        break
      case '/memri':
        presenceData.details = 'Revising'
        if (!privacy)
          presenceData.state = 'Memri'
        break
      case '/contact':
        presenceData.details = 'Viewing contact page'
        break
      case '/contact-us':
        presenceData.details = 'Viewing contact page'
        break
      case '/student-resources':
        presenceData.details = 'Viewing student resources'
        break
      case '/story':
        presenceData.details = 'Reading'
        presenceData.state = 'The story of HegartyMaths'
        break
      case '/trial':
        presenceData.details = 'Reading'
        if (!privacy)
          presenceData.state = 'Trial page'
        break
      case '/press':
        presenceData.details = 'Reading'
        presenceData.state = 'HegartyMaths in the news'
        break
      case '/success':
        presenceData.details = 'Reading'
        presenceData.state = 'HegartyMaths success stories'
        break
      default:
        presenceData.details = 'Viewing a task'
        break
    }
  }

  presence.setActivity(presenceData)
})
