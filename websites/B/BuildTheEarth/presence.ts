const presence = new Presence({
  clientId: '805070274847440916',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/BuildTheEarth/assets/logo.png',
  }
  const browsingTimestamp = Math.floor(Date.now() / 1000)
  const [privacy, button, pmap] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('button'),
    presence.getSetting<boolean>('pmap'),
  ])

  presenceData.startTimestamp = browsingTimestamp
  if (privacy) {
    presenceData.details = 'Browsing'
  }
  else if (window.location.pathname.endsWith('me')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Profil'
  }
  else if (window.location.pathname.endsWith('faq')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'FAQ'
  }
  else if (window.location.pathname.endsWith('map')) {
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/B/BuildTheEarth/assets/0.png'
    presenceData.details = 'Viewing a page:'
    if (pmap) {
      presenceData.state = 'Map'
    }
    else {
      presenceData.state = `Map : ${
        Math.floor(
          Number(
            document
              ?.querySelector('#map_tpll_command')
              ?.textContent
              ?.replace('/tpll ', '')
              ?.split(' ')[0],
          ) * 10,
        ) / 10
      } | ${
        Math.floor(
          Number(
            document
              ?.querySelector('#map_tpll_command')
              ?.textContent
              ?.replace('/tpll ', '')
              ?.split(' ')[1],
          ) * 10,
        ) / 10
      }`
    }
  }
  else if (window.location.pathname.endsWith('buildteams')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'BuildTeams'
  }
  else if (window.location.pathname.endsWith('contact')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Contact'
  }
  else if (window.location.pathname.endsWith('upload')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Upload your world'
  }
  else {
    presenceData.details = 'Viewing a page:'
    presenceData.state = document.title.replace(' - BuildTheEarth', '')
    if (window.location.pathname.length !== 1) {
      presenceData.details = 'Viewing a BuildTeam:'
      if (button) {
        presenceData.buttons = [
          {
            label: 'View the team',
            url: document.URL,
          },
        ]
      }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
