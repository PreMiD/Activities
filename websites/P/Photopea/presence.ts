const presence = new Presence({
  clientId: '685559589625659492',
})

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/Photopea/assets/logo.png',
  }
  const Path = document.location.pathname
  presenceData.startTimestamp = Math.floor(Date.now() / 1000)

  if (Path.startsWith('/learn')) {
    presenceData.details = 'Learning new cool tricks :'
    presenceData.state = `${
      Path.replace('/learn/', '').length < 1
        ? 'Main Section'
        : `${Path.replace('/learn/', '').toUpperCase()} Section`
    }`
  }
  else if (Path === '/') {
    switch (
      document.querySelector(
        'body > div[class=\'flexrow app\'] > div:nth-child(1) > div.flexrow > div.panelblock.mainblock > div > div.panelhead',
      )?.children.length
    ) {
      case 0:
        presenceData.details = 'Viewing the home page '
        break
      default: {
        const name = document.querySelector('div.active > span')?.textContent
        presenceData.details = `Editing a ${
          name && name.split('.').length > 1
            ? name.split('.')[name.split('.').length - 1]
            : name?.split('.')[1]
        } file :`
        presenceData.state = name
      }
    }
  }
  else if (Path.startsWith('/api')) {
    presenceData.details = 'Consulting the api docs :'
    presenceData.state = `${
      Path.replace('/api/', '').length < 1
        ? 'Main Section'
        : `${Path.replace('/api/', '').toUpperCase()} Section`
    }`
  }
  else if (Path.startsWith('/tuts')) {
    presenceData.details = 'Consulting the tutorials :'
    presenceData.state = `${
      Path.replace('/tuts/', '').length < 1
        ? 'Main Section'
        : `${document.querySelector('#post-396 > h1')?.textContent}`
    }`
  }
  else {
    presenceData.details = 'Browsing the site '
  }

  presence.setActivity(presenceData)
})
