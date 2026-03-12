const presence = new Presence({
  clientId: '630441527826579467',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/htmlcsscolor/assets/logo.png',
  }

  // My special Format
  // Detail: The action (viewing/generating/listening/etc).
  // State: tells you what they are doing with the action (viewing blah/generating blah/listening blah/etc)

  if (document.location.pathname.startsWith('/hex')) {
    presenceData.details = `Viewing ${
      document.querySelector('#uscBootStrapHeader_lblTitle > strong')
        ?.textContent
    }`
    presenceData.state = `${
      document
        .querySelector('#uscBootStrapHeader_lblTitle > small')
        ?.textContent
        ?.split('#')[0]
    }`
  }

  // Wheel. Since its on main page the main page is also considered wheel.
  if (
    document.location.href.endsWith('/#wheel')
    || document.location.pathname === '/'
  ) {
    presenceData.details = 'Viewing on wheel'
    presenceData.state = `${
      (document.querySelector('#cntMain_txtColor') as HTMLInputElement).value
    }`
  }

  // Sub pages
  if (document.location.pathname.startsWith('/html-color-names')) {
    presenceData.details = 'Viewing the list of'
    presenceData.state = 'html color names.'
  }
  if (document.location.pathname.startsWith('/color-names-rgb-values')) {
    presenceData.details = 'Viewing the list of'
    presenceData.state = 'RGB color names.'
  }
  if (document.location.pathname.startsWith('/web-safe-colors')) {
    presenceData.details = 'Viewing the list of'
    presenceData.state = 'web save colors.'
  }
  if (document.location.pathname.startsWith('/random-colors')) {
    presenceData.details = 'Viewing a list of'
    presenceData.state = 'random colors.'
  }
  if (document.location.pathname.startsWith('/color-gradient')) {
    presenceData.details = 'Generating a'
    presenceData.state = 'color gradient.'
  }
  if (document.location.pathname.startsWith('/contacts')) {
    presenceData.details = 'Viewing the'
    presenceData.state = 'contacts page.'
  }

  presence.setActivity(presenceData)
})
