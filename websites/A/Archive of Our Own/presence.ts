const presence = new Presence({
  clientId: '1005873313551220757',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/Archive%20of%20Our%20Own/assets/logo.png',
  }
  const [work, tag] = await Promise.all([
    presence.getSetting<string>('work'),
    presence.getSetting<string>('tag'),
  ])
  const { pathname, href } = document.location
  if (pathname === '/') {
    presenceData.details = 'Viewing home page'
  }
  else if (pathname.includes('/tags/')) {
    if (tag) {
      presenceData.details = `Browsing tag: ${
        document.querySelector('.heading > .tag')?.textContent
      }`
      presenceData.state = document.querySelector('h2.heading')?.textContent
    }
    else {
      presenceData.details = ' Browsing tags...'
    }
  }
  else if (pathname.includes('/works/')) {
    if (work) {
      presenceData.details = `Reading : ${
        document.querySelector('h2')?.textContent
      }`

      presenceData.state = document.querySelector('div.chapter > h3')
        ?.textContent ?? 'Oneshot'
      presenceData.buttons = [
        {
          label: 'View',
          url: href,
        },
      ]
    }
    else {
      presenceData.details = ' Reading a work...'
    }
  }
  else if (pathname.includes('/users')) {
    presenceData.details = 'Viewing profile...'
  }
  else if (pathname.includes('/series')) {
    presenceData.details = `Viewing Series : ${
      document.querySelector('h2.heading')?.textContent
    }`
    presenceData.state = `By ${
      document.querySelector('a[rel=author]')?.textContent
    }`
    presenceData.buttons = [
      {
        label: 'View',
        url: href,
      },
    ]
  }
  else {
    presenceData.details = 'Browsing the website...'
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
