const presence = new Presence({
  clientId: '1001831947611426877',
})
const browsingTimestamp = Date.now()

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/Doordash/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const [hideSearch, hideFood] = await Promise.all([
    presence.getSetting<boolean>('hideSearch'),
    presence.getSetting<boolean>('hideFood'),
  ])

  if (pathname.includes('/store/') && !pathname.includes('/search/')) {
    const name = document.querySelector<HTMLSpanElement>(
      'h1.styles__TextElement-sc-1jrzcv7-0',
    )?.textContent
    const image = document
      .querySelector<HTMLImageElement>(
        '.menu-header-styles__LogoInner-sc-1kgi6s8-6 > picture:nth-child(1) > img:nth-child(5)',
      )
      ?.getAttribute('src')

    if (
      !document
        .querySelector<HTMLImageElement>('.styles__ModalContainer-sc-1r4qbfh-0')
        ?.getAttribute('src')
    ) {
      presenceData.largeImageKey = image
      presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/D/Doordash/assets/logo.png'
      presenceData.details = `Viewing the menu of ${name}`
    }
    else {
      if (!hideFood) {
        const menuItemImage = document
          .querySelector<HTMLImageElement>(
            '.BaseItemModalStyles__PictureFrame-sc-mpq8va-1 > picture:nth-child(1) > img:nth-child(5)',
          )
          ?.getAttribute('src')
        presenceData.state = `Looking at ${
          document.querySelector<HTMLSpanElement>('.bbOfWk')?.textContent
        }`
        presenceData.largeImageKey = menuItemImage
      }

      presenceData.details = `Viewing the menu of ${name}`
      presenceData.smallImageKey = image
    }
  }
  else if (pathname.includes('/search/store/') && !hideSearch) {
    const search = document.querySelector<HTMLInputElement>('#FieldWrapper-0')
    presenceData.details = `Searching for ${
      search ? search.value : 'something'
    }`
  }

  switch (pathname) {
    case '/': {
      presenceData.details = 'Browsing Doordash'
      let activeSpan: HTMLSpanElement | null = null

      const spanArray = Array.from(document.querySelectorAll('.sc-hFLmAl'))

      for (const span of spanArray) {
        if (span.attributes[1]?.value === '#EB1700')
          activeSpan = span as HTMLSpanElement
      }

      if (activeSpan)
        presenceData.state = `Looking for ${activeSpan.textContent}`

      break
    }
    case '/orders': {
      presenceData.details = 'Viewing their orders'
      break
    }
    case '/consumer/edit_profile/': {
      presenceData.details = 'Editing their profile'
      break
    }
    case '/saved-stores/': {
      presenceData.details = 'Viewing their saved stores'
      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
