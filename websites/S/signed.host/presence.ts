const presence = new Presence({
  clientId: '1000664778404016230',
})

let lastUnique: string
let lastTimestamp = Date.now()

presence.on('UpdateData', async () => {
  if (document.querySelector('.next-error-h1'))
    return presence.clearActivity()

  const { pathname, hostname, href } = document.location

  if (lastUnique !== pathname) {
    lastUnique = pathname
    lastTimestamp = Date.now()
  }

  let details = `Currently on ${pathname}`
  let buttonLabel = null
  let buttonURL = null
  let state = null

  const loggedUsername = document.querySelector('#premid-username')?.textContent
  const pages: Record<string, PresenceData> = {
    '/': { details: 'Viewing the front page' },
    '/terms': { details: 'Reading the terms of the service' },
    '/login': { details: 'Logging into their dashboard' },

    '/dash': { details: 'Watching their general statistics' },
    '/dash/service/account': { details: 'Editing account information' },
    '/dash/service/domains': { details: 'Changing their domain' },
    '/dash/service/settings': {
      details: 'Configuring their upload preferences',
    },
    '/dash/service/subscription': { details: 'Viewing subscription options' },
    '/dash/service/gallery': { details: 'Viewing their image gallery' },
    '/dash/service/warns': { details: 'Viewing their warns' },
    '/dash/service/invites': { details: 'Viewing their invite inventory' },
    '/dash/service/upload': {
      details: 'Uploading file(s) with the web uploader',
    },
    '/dash/service/email': { details: 'Configuring their email preferences' },
    '/dash/connections/discord': {
      details: 'Modifying their Discord connection',
    },
    '/dash/bio/customize': { details: 'Customizing their bio page' },
    '/dash/bio/css': { details: 'Editing their custom CSS' },
  }

  switch (hostname) {
    case 'signed.host':
      if (pathname.includes('/dash')) {
        if (loggedUsername)
          state = `Logged in as ${loggedUsername}`
        else state = 'Not logged in!'
      }

      details = pages[pathname]?.details as string

      break
    case 'bio.signed.host':
      if (pathname === '/') {
        details = 'Viewing the front bio page'
        break
      }
      details = `Viewing ${
        document
          .querySelector('#premid-username')
          ?.textContent
          ?.replace(/#.*/g, '') ?? 'someone'
      }'s bio page`
      state = `${
        document.querySelector('#premid-status')?.textContent ?? 'unknown'
      } | ${
        Number.parseInt(document.querySelector('#premid-bioviews')?.textContent || '0') > 0
          ? document.querySelector('#premid-bioviews')?.textContent
          : 'no'
      } views | uid ${
        document.querySelector('#premid-uid')?.textContent ?? 'no'
      }`
      buttonLabel = 'Visit Bio'
      buttonURL = href
      break
  }

  presence.setActivity({
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/signed.host/assets/logo.png',
    state,
    startTimestamp: lastTimestamp,
    details,
    buttons: buttonLabel && buttonURL
      ? [{ label: buttonLabel, url: buttonURL }]
      : undefined,
  })
})
