const presence = new Presence({
  clientId: '814919836835905566',
})
const tmb = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Google%20Fonts/assets/logo.png',
    smallImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Google%20Fonts/assets/0.png',
    startTimestamp: tmb,
  }
  const path = document.location.pathname.toLowerCase()
  const showButton = await presence.getSetting<boolean>('showButton')

  if (path === '/') {
    const categ = document
      ?.querySelector(
        '#main-content > gf-global-toolbar > div.global-toolbar__filters-area > gf-global-filters-row > div > div > gf-toolbar-category-filter > button > span.mat-button-wrapper',
      )
      ?.querySelectorAll('.gf-outlined-menu-button-content')[0]
      ?.textContent
    if (categ === ' Categories ') {
      presenceData.state = 'All categories'
    }
    else if (categ?.includes('+')) {
      presenceData.state = `Categories: ${new URL(
        document.location.href,
      ).searchParams.get('category')?.replace(/,/g, ', ')}`
    }
    else {
      presenceData.state = `Category: ${categ}`
    }
    presenceData.details = 'Browsing fonts'
  }
  else if (path.includes('/specimen')) {
    presenceData.details = `Looking at font: ${
      document.querySelector('#main-content > gf-sticky-header > div > h1')
        ?.textContent
    }`
    presenceData.state = `Viewing the "${document
      .querySelectorAll('.gf-nav__link--active')[0]
      ?.textContent
      ?.trim()}" tab`
    if (showButton) {
      presenceData.buttons = [
        {
          label: 'View font',
          url: document.URL,
        },
      ]
    }
  }
  else if (path === '/featured') {
    presenceData.details = 'Looking at the featured fonts'
  }
  else if (path.includes('/featured/')) {
    let featuredFonts
    if (document.querySelectorAll('.gmat-headline-1')[0]) {
      featuredFonts = document.querySelectorAll('.gmat-headline-1')[0]?.textContent
    }
    else if (!document.querySelectorAll('.gmat-headline-1')[0]) {
      featuredFonts = document.querySelectorAll('.gmat-headline-4')[0]?.textContent
    }
    presenceData.details = 'Looking at a featured font:'
    presenceData.state = featuredFonts

    if (showButton) {
      presenceData.buttons = [
        {
          label: 'View featured font',
          url: document.URL,
        },
      ]
    }
  }
  else if (path === '/icons') {
    if (
      new URL(document.location.href).searchParams.get('icon.query') === null
    ) {
      if (document.querySelectorAll('.mdc-chip--selected')[0]) {
        presenceData.details = 'Browsing Material icons' // The icons are named "Material icons" like this on the Fonts website
        presenceData.state = `Looking at the ${document
          .querySelectorAll('.mdc-chip--selected')[0]
          ?.textContent
          ?.toLowerCase()} icons`
      }
      else {
        presenceData.details = 'Browsing Material icons'
        presenceData.state = 'Looking at all icons'
      }
    }
    else {
      presenceData.details = 'Searching for icons'
      presenceData.state = `Search query: ${new URL(
        document.location.href,
      ).searchParams.get('icon.query')}`
    }
  }
  else if (path === '/about') {
    presenceData.details = 'Viewing the about page'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
