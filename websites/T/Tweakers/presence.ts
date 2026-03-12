const presence = new Presence({
  clientId: '889467818020597790',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Tweakers/assets/logo.png',
  }

  if (document.location.href.includes('nieuws/')) {
    if (document.location.href.endsWith('.html')) {
      presenceData.details = 'Leest een artikel...'
      presenceData.state = `Artikel: '${document.location.pathname
        .split('/')[3]
        ?.replace('.html', '')}'`
    }
    else {
      presenceData.details = 'Scrollt nieuws artikelen...'
    }
  }
  else if (document.location.href.includes('reviews/')) {
    if (document.location.href.endsWith('.html')) {
      presenceData.details = 'Leest een review...'
      presenceData.state = `Review: '${document.location.pathname
        .split('/')[3]
        ?.replace('.html', '')}'`
    }
    else if (
      document.location.pathname.split('/')[2]
      && document.location.pathname.split('/')[2] === 'reviews'
    ) {
      presenceData.details = 'Scrollt reviews...'
      presenceData.state = `Categorie: '${
        document.location.pathname.split('/')[1]
      }'`
    }
    else {
      presenceData.details = 'Scrollt reviews...'
    }
  }
  else if (document.location.href.includes('pricewatch/')) {
    if (document.location.pathname.split('/')[3]) {
      presenceData.details = 'Bekijkt een product...'
      presenceData.state = `Product: '${document.location.pathname
        .split('/')[3]
        ?.replace('.html', '')}'`
    }
    else {
      presenceData.details = 'Scrollt pricewatch...'
    }
  }
  else if (document.location.href.includes('aanbod/')) {
    if (document.location.pathname.split('/')[3]) {
      presenceData.details = 'Bekijkt een aanbod...'
      presenceData.state = `Aanbod: '${document.location.pathname
        .split('/')[3]
        ?.replace('.html', '')}'`
    }
    else {
      presenceData.details = 'Scrollt Vraag en Aanbod...'
    }
  }
  else if (document.location.href.includes('gathering.')) {
    presenceData.details = 'Bekijkt het forum...'
  }
  else if (document.location.href.includes('carriere/')) {
    if (document.location.pathname.split('/')[4]) {
      presenceData.details = 'Bekijkt een baan...'
      presenceData.state = `Baan: '${document.location.pathname
        .split('/')[4]
        ?.replace('.html', '')}'`
    }
    else {
      presenceData.details = 'Zoekt een baan via tweakers...'
    }
  }
  else if (document.location.href.includes('video/')) {
    if (document.location.href.endsWith('.html')) {
      presenceData.details = 'Bekijkt een video...'
      presenceData.state = `Video: '${document.location.pathname
        .split('/')[3]
        ?.replace('.html', '')}'`
    }
    else {
      presenceData.details = 'Scrollt video\'s...'
    }
  }
  else if (document.location.href.includes('podcast/')) {
    presenceData.details = 'Luistert naar de podcast...'
  }
  else if (document.location.href.includes('downloads/')) {
    if (document.location.href.endsWith('.html')) {
      presenceData.details = 'Download een bestand...'
      presenceData.state = `Download: '${document.location.pathname
        .split('/')[3]
        ?.replace('.html', '')}'`
    }
    else {
      presenceData.details = 'Scrollt downloads...'
    }
  }
  else if (document.location.href.includes('it-pro/')) {
    presenceData.details = 'Scrollt IT Pro specials...'
  }
  else if (document.location.href.includes('gallery')) {
    if (document.location.pathname.split('/')[2])
      presenceData.details = 'Bekijkt een profiel...'
    else presenceData.details = 'Scrollt profielen...'
  }
  else if (document.location.href.includes('acties-en-evenementen/')) {
    presenceData.details = 'Bekijkt acties en evenementen...'
  }
  else if (document.location.href.includes('plan/')) {
    if (document.location.href.endsWith('.html')) {
      presenceData.details = 'Bekijkt een plan...'
      presenceData.state = `Plan: '${document.location.pathname
        .split('/')[3]
        ?.replace('.html', '')}'`
    }
    else {
      presenceData.details = 'Scrollt plannen...'
    }
  }
  else if (document.location.href.includes('abbonementen')) {
    presenceData.details = 'Bekijkt abbonementen...'
  }
  else if (document.location.href.includes('over-tweakers')) {
    presenceData.details = 'Bekijkt informatie over tweakers...'
  }
  else if (document.location.href.includes('karmastore')) {
    presenceData.details = 'Bekijkt zijn/haar karma...'
  }
  else if (document.location.href.includes('instellingen')) {
    presenceData.details = 'Bekijkt instellingen...'
  }
  else if (
    document.location.pathname
    && document.location.pathname.length > 2
  ) {
    presenceData.details = 'Bladert...'
    presenceData.state = `Op pagina '${
      document.location.pathname.split('/')[1]
    }'`
  }
  else {
    presenceData.details = 'Bezoekt de tweakers pagina...'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
