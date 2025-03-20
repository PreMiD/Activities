const presence = new Presence({
  clientId: '685827254256795677',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/DaFont/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const path = document.location.pathname
  let details

  if (path === '/') {
    details = document.querySelector(
      '#width > div.minwidth > div > div > div:nth-child(9) > div:nth-child(3) > div.dfsmall > strong',
    )?.textContent
    presenceData.details = 'Browsing the main page :'
    presenceData.state = `${details}`
  }
  else if (path.startsWith('/themes.php')) {
    details = document.querySelector('#menuthemespp > table > tbody > tr')
      ?.children
      .length
    presenceData.details = 'Browsing the theme\'s page :'
    presenceData.state = `${details} total themes`
  }
  else if (path.startsWith('/theme.php')) {
    details = document
      .querySelector(
        '#width > div > div > div > div:nth-child(9) > div:nth-child(3) > div.dffont2',
      )
      ?.textContent
      ?.replace('&gt;', '>')
    presenceData.details = 'Browsing a sub-theme\'s page :'
    presenceData.state = `${details}`
  }
  else if (path.startsWith('/mtheme.php')) {
    details = document.querySelector(
      '#width > div > div > div > div:nth-child(9) > div:nth-child(5) > div.dffont2',
    )?.textContent
    presenceData.details = 'Browsing a main-theme\'s page :'
    presenceData.state = `${details}`
  }
  else if (path.startsWith('/new.php')) {
    details = document.querySelector(
      '#width > div > div > div > div:nth-child(9) > div:nth-child(5) > span > span',
    )?.textContent
    presenceData.details = 'Browsing the new fonts :'
    presenceData.state = `${details}`
  }
  else if (path.startsWith('/top.php')) {
    details = document.location.search.length > 1 ? 'All Time' : 'Yesterday'
    presenceData.details = 'Browsing the top fonts :'
    presenceData.state = `${details}`
  }
  else if (path.startsWith('/authors.php')) {
    presenceData.details = 'Browsing the authors :'
    if (document.location.search.startsWith('?letter')) {
      presenceData.state = `Sorted by letter : ${document.location.search
        .replace('?letter=', '')
        .toUpperCase()}`
    }
    else if (document.location.search.startsWith('?cc')) {
      presenceData.state = `Sorted by country : ${
        document.querySelector(
          '#width > div > div.layout > div > div:nth-child(9) > div > div:nth-child(2) > div:nth-child(11) > div:nth-child(1)',
        )?.textContent
      }`
    }
    else {
      presenceData.state = 'All authors'
    }
  }
  else if (path.startsWith('/forum')) {
    presenceData.details = 'On the forum'
  }
  else if (path.startsWith('/faq.php')) {
    presenceData.details = 'Reading the FAQ '
  }
  else if (path.startsWith('/soft.php')) {
    presenceData.details = 'Viewing the tools '
  }
  else if (path.startsWith('/login.php')) {
    presenceData.details = 'Logging into their account '
  }
  else if (path.startsWith('/register.php')) {
    presenceData.details = 'Registering a new account  '
  }
  else if (path.endsWith('.font')) {
    presenceData.details = 'Viewing a font\'s page :'
    presenceData.state = `${
      document.querySelector('#width > div > div > div > div:nth-child(9) > h1')
        ?.textContent
    } ( ${
      document.querySelector(
        '#width > div > div > div > div:nth-child(9) > div.lv2right > span',
      )?.textContent
    } )`
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
