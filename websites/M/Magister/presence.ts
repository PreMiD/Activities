const presence = new Presence({
  clientId: '864581253930680341',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/Magister/assets/logo.png',
  }

  if (document.location.href.includes('account/login')) {
    presenceData.details = 'Meldt zich aan'
  }
  else if (document.location.href.includes('Logout')) {
    presenceData.details = 'Wordt uitgelogd...'
  }
  else if (document.location.href.includes('oidc')) {
    presenceData.details = 'Wordt doorgestuurd...'
  }
  else if (document.location.href.includes('auth')) {
    presenceData.details = 'Wordt geauthoriseerd...'
  }
  else if (document.location.href.includes('magister/#/vandaag')) {
    presenceData.details = 'Bekijkt startpagina'
  }
  else if (document.location.href.includes('magister/#/agenda/')) {
    presenceData.details = 'Bekijkt agenda'
  }
  else if (document.location.href.includes('magister/#/agenda')) {
    presenceData.details = 'Bekijkt afsprakenlijst'
  }
  else if (document.location.href.includes('magister/#/afwezigheid')) {
    presenceData.details = 'Bekijkt afwezigheid'
  }
  else if (
    document.location.href.includes('magister/#/cijfers/cijferoverzicht')
  ) {
    presenceData.details = 'Bekijkt cijferoverzicht'
  }
  else if (document.location.href.includes('magister/#/cijfers')) {
    presenceData.details = 'Bekijkt laatste cijfers'
  }
  else if (document.location.href.includes('magister/#/lvs')) {
    presenceData.details = 'Bekijkt logboeken'
  }
  else if (document.location.href.includes('magister/#/elo/bronnen')) {
    presenceData.details = 'Bekijkt bronnen'
  }
  else if (document.location.href.includes('magister/#/elo/studiewijzer/')) {
    presenceData.details = 'Bekijkt een studiewijzer'
  }
  else if (document.location.href.includes('magister/#/elo/studiewijzer')) {
    presenceData.details = 'Bekijkt studiewijzers'
  }
  else if (document.location.href.includes('magister/#/elo/opdrachten/')) {
    presenceData.details = 'Bekijkt een opdracht'
  }
  else if (document.location.href.includes('magister/#/elo/opdrachten')) {
    presenceData.details = 'Bekijkt opdrachten'
  }
  else if (document.location.href.includes('magister/#/elo/activiteiten')) {
    presenceData.details = 'Bekijkt activiteiten'
  }
  else if (document.location.href.includes('magister/#/elo')) {
    presenceData.details = 'Bekijkt elektronische leeromgeving'
  }
  else if (document.location.href.includes('magister/#/leermiddelen')) {
    presenceData.details = 'Bekijkt leermiddelen'
  }
  else if (document.location.href.includes('magister/#/berichten')) {
    presenceData.details = 'Bekijkt berichten'
  }
  else if (document.location.href.includes('magister/#/mijn-instellingen')) {
    presenceData.details = 'Bekijkt instellingen'
  }
  else if (document.location.href.includes('profile')) {
    presenceData.details = 'Bekijkt Magister-profiel'
  }
  else if (document.location.href.includes('error')) {
    presenceData.details = 'Ziet een foutmelding'
  }
  else if (document.location.href.includes('magister')) {
    presenceData.details = 'Bladert'
    presenceData.state = `Op pagina '${document.location.pathname
      .replace('/magister', '')
      .replace('/#/', '')
      .replace('/#', '')
      .replace('-', '')
      .replace('/', '')}'`
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
