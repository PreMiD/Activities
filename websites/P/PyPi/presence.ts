const presence = new Presence({
  clientId: '685491676155871281',
})

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/PyPi/assets/logo.png',
  }
  const Path = document.location.pathname
  presenceData.startTimestamp = Math.floor(Date.now() / 1000)
  if (Path === '/') {
    presenceData.details = 'Viewing the home-page :'
    presenceData.state = `${
      document.querySelector(
        '#content > div.horizontal-section.horizontal-section--grey.horizontal-section--thin.horizontal-section--statistics > div > p:nth-child(1)',
      )?.textContent
    }`
  }
  else if (Path.startsWith('/help')) {
    presenceData.details = 'Viewing the help-page :'
    presenceData.state = `${
      document.querySelector('#content > div:nth-child(1) > div')?.children.length
    } total topics`
  }
  else if (Path.startsWith('/account/login')) {
    presenceData.details = 'Logging into their account '
  }
  else if (Path.startsWith('/account/register')) {
    presenceData.details = 'Registering a new account '
  }
  else if (Path.startsWith('/search')) {
    presenceData.details = `Searching for ${
      (document.querySelector('#search') as HTMLInputElement).value
    } :`
    presenceData.state = `${
      document.querySelector(
        '#content > div > div > div.left-layout__main > form > div.split-layout.split-layout--table.split-layout--wrap-on-tablet > div:nth-child(1) > p > strong',
      )?.textContent
    } total results`
  }
  else if (Path.startsWith('/project')) {
    presenceData.details = 'Viewing a package :'
    presenceData.state = `${
      document.querySelector(
        '#content > div.banner > div > div.package-header__left > h1',
      )?.textContent
    } BY ${
      document.querySelector(
        '#content > div:nth-child(3) > div > div > div.vertical-tabs__tabs > div:nth-child(5) > span > a > span.sidebar-section__user-gravatar-text',
      )?.textContent
    }`
  }
  else if (Path.startsWith('/security')) {
    presenceData.details = 'Reporting a security flaw '
  }
  else if (Path.startsWith('/policy/terms-of-use/')) {
    presenceData.details = 'Viewing the terms of use '
  }
  else {
    presenceData.details = 'Browsing the site '
  }

  presence.setActivity(presenceData)
})
