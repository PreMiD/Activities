const presence = new Presence({
  clientId: '997455719840370729',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    startTimestamp: browsingTimestamp,
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Serializd/assets/0.png',
  }
  if (document.location.pathname === '/') {
    presenceData.details = 'Viewing the home page'
  }
  else if (document.location.pathname.includes('popular')) {
    presenceData.details = 'Viewing Popular Shows'
  }
  else if (document.location.pathname.includes('upcoming')) {
    presenceData.details = 'Viewing upcoming episodes'
  }
  else if (document.location.pathname.includes('signup')) {
    presenceData.details = 'Making a new account'
  }
  else if (document.location.pathname.includes('settings')) {
    presenceData.details = 'Editing their profile/account settings'
  }
  else if (document.location.pathname.includes('login')) {
    presenceData.details = 'Logging in'
  }
  else if (document.location.pathname.startsWith('/reviews/')) {
    if (document.location.pathname.endsWith('trending')) {
      presenceData.details = 'Viewing trending reviews'
    }
    else if (document.location.pathname.endsWith('friends')) {
      presenceData.details = 'Viewing their friend activity'
    }
    else {
      presenceData.details = `Viewing reviews of ${
        document.querySelector('.subheading')?.textContent
      }`
    }
  }
  else if (document.location.pathname.includes('review')) {
    presenceData.details = `Viewing a review for ${
      document.querySelector('.subheading')?.textContent
    }`
  }
  else if (document.location.pathname.includes('user')) {
    presenceData.details = `Viewing ${
      document.querySelector('.heading')?.textContent
    }'s Profile`
  }
  else if (document.location.pathname.includes('season')) {
    presenceData.largeImageKey = `${
      document.querySelector<HTMLImageElement>('.sticky-top-fixed-header > img')
        ?.src
    }`
    presenceData.details = 'Viewing Season:'
    presenceData.state = `${
      document.querySelector('.heading span')?.textContent
    }`
  }
  else if (document.location.pathname.includes('show')) {
    presenceData.largeImageKey = `${
      document.querySelector<HTMLImageElement>('.show-image')?.src
    }`
    presenceData.details = `Viewing ${
      document.querySelector('.heading span')?.textContent
    }`
    presenceData.state = `With ${
      document.querySelectorAll('.show-stats-icon-container span')[2]
        ?.textContent
    } reviews`
  }
  else if (document.location.pathname.includes('search')) {
    presenceData.details = `Searching for ${
      document.querySelector<HTMLInputElement>(
        'input.search-page-search-input.form-control',
      )?.value
    }`
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
