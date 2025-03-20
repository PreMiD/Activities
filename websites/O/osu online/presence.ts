const presence = new Presence({ clientId: '714822481286004778' })
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/osu%20online/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.pathname === '/') {
    const gameArea = document.querySelector('#game-area > canvas')
    const pauseMenu = document.querySelector('#pause-menu')
    if (gameArea) {
      presenceData.details = 'Clicking circles'
      if (!pauseMenu?.getAttribute('hidden')) {
        presenceData.details = 'Clicking circles'
        presenceData.state = 'Paused menu'
      }
    }
    else {
      const [pageHome] = document.querySelectorAll('.title')
      let pageText1
      if (!pageHome)
        pageText1 = 'Browsing...'
      else pageText1 = `Listening: ${pageHome.textContent}`

      presenceData.details = 'Viewing the homepage'
      presenceData.state = pageText1
    }
  }
  else if (document.location.pathname.startsWith('/index')) {
    const [pageHome] = document.querySelectorAll('.title')
    let pageText1
    if (!pageHome)
      pageText1 = 'Browsing...'
    else pageText1 = `Listening: ${pageHome.textContent}`

    presenceData.details = 'Viewing the homepage'
    presenceData.state = pageText1
  }
  else if (document.location.pathname.startsWith('/new')) {
    const [pageNew] = document.querySelectorAll('.title')
    let pageText2
    if (!pageNew)
      pageText2 = 'Browsing...'
    else pageText2 = `Listening: ${pageNew.textContent}`

    presenceData.details = 'Viewing new beatmaps'
    presenceData.state = pageText2
  }
  else if (document.location.pathname.startsWith('/hot')) {
    const [pageHot] = document.querySelectorAll('.title')
    let pageText3
    if (!pageHot)
      pageText3 = 'Browsing...'
    else pageText3 = `Listening: ${pageHot.textContent}`

    presenceData.details = 'Viewing hot beatmaps'
    presenceData.state = pageText3
  }
  else if (document.location.pathname.startsWith('/genre')) {
    const [pageGen2, pageGen3, pageGen1] = document.querySelectorAll('.title')
    const [pageGen4, pageGen5] = document.querySelectorAll('.selitem.active')
    if (pageGen1) {
      presenceData.details = 'Searching by categories'
      presenceData.state = `Listening: ${pageGen1.textContent}`
    }
    else {
      presenceData.details = 'Searching by categories'
      presenceData.state = `${pageGen2?.textContent}: ${pageGen4?.textContent} ${pageGen3?.textContent}: ${pageGen5?.textContent}`
    }
  }
  else if (document.location.pathname.startsWith('/search')) {
    const [pageSch1] = document.querySelectorAll('.title')
    const [pageSch2] = document.getElementsByName(
      'q',
    ) as NodeListOf<HTMLInputElement>
    let pageText6, pageText7
    if (pageSch1) {
      pageText6 = `Listening: ${pageSch1.textContent}`
      presenceData.details = 'Searching for beatmaps'
      presenceData.state = pageText6
    }
    else {
      if (pageSch2?.value === '')
        pageText7 = 'Browsing...'
      else pageText7 = `Keyword: ${pageSch2?.value}`

      presenceData.details = 'Searching for beatmaps'
      presenceData.state = pageText7
    }
  }
  else if (document.location.pathname.startsWith('/local')) {
    const [pageFav] = document.querySelectorAll('.title')
    let pageText7
    if (!pageFav)
      pageText7 = 'Browsing...'
    else pageText7 = `Listening: ${pageFav.textContent}`

    presenceData.details = 'Viewing my favourites'
    presenceData.state = pageText7
  }
  else if (document.location.pathname.startsWith('/history')) {
    presenceData.details = 'Viewing playing history'
    presenceData.state = 'Browsing...'
  }
  else if (document.location.pathname.startsWith('/faq')) {
    presenceData.details = 'Viewing FAQ'
    presenceData.state = 'Getting some information'
  }
  else if (document.location.pathname.startsWith('/settings')) {
    presenceData.details = 'Viewing settings'
    presenceData.state = 'Changing...'
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
