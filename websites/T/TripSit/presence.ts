const browsingTimestamp = Math.floor(Date.now() / 1000)

const presence = new Presence({
  clientId: '1458986324362002474',
})

presence.on('UpdateData', async () => {
  const rawHostname = document.location.hostname
  const hostname = rawHostname.replace(/^www\./, '')
  const { pathname, hash } = document.location

  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/TripSit/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  /* TripSit main site */
  if (hostname === 'tripsit.me') {
    if (pathname === '/' && !hash) {
      presenceData.details = 'Browsing TripSit'
    }
    else if (hash === '#about') {
      presenceData.details = 'Reading About TripSit'
    }
    else if (hash === '#resources') {
      presenceData.details = 'Browsing Resources'
    }
    else if (hash === '#faq') {
      presenceData.details = 'Reading the FAQ'
    }
    else if (hash === '#cta') {
      presenceData.details = 'Viewing TripSit Volunteering'
    }
    else if (pathname === '/factsheets') {
      presenceData.details = 'Browsing Factsheets'
    }
    else if (pathname === '/appeal') {
      presenceData.details = 'Viewing Ban Appeals'
    }
    else if (pathname === '/webchat') {
      presenceData.details = 'Using Web Chat'
    }
    else {
      presenceData.details = 'Browsing TripSit'
    }
  }

  /* Subdomains */
  else if (hostname === 'learn.tripsit.me') {
    presenceData.details = 'Using the Learning Portal'
  }
  else if (hostname === 'dxm.tripsit.me') {
    presenceData.details = 'Using the DXM Dosage Calculator'
  }
  else if (hostname === 'volume.tripsit.me') {
    presenceData.details = 'Using the Volumetric Dosing Tool'
  }
  else if (hostname === 'benzos.tripsit.me') {
    presenceData.details = 'Using the Benzodiazepine Dose Converter'
  }
  else if (hostname === 'uptime.tripsit.me') {
    presenceData.details = 'Viewing Service Status'
  }
  else if (hostname === 'updates.tripsit.me') {
    presenceData.details = 'Reading Updates'
  }
  else if (hostname === 'combo.tripsit.me') {
    presenceData.details = 'Reading Drug Combinations'
  }

  /* TripSit Wiki */
  else if (hostname === 'wiki.tripsit.me') {
    let articleName: string | null = null

    if (pathname.startsWith('/wiki/')) {
      articleName = decodeURIComponent(pathname.replace('/wiki/', ''))
        .replace(/_/g, ' ')
        .trim()
    }

    presenceData.details = articleName
      ? `Reading the article "${articleName}"`
      : 'Browsing the Wiki'
  }
  else {
    return
  }

  presence.setActivity(presenceData)
})
