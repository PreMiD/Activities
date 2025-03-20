const presence = new Presence({
  clientId: '805098006625517599',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/Altearn/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const privacy = await presence.getSetting<boolean>('privacy')
  const button = await presence.getSetting<boolean>('button')
  if (privacy) {
    presenceData.details = 'Browsing'
  }
  else if (window.location.pathname.startsWith('/articles')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Activities'
  }
  else if (window.location.pathname.startsWith('/category/')) {
    presenceData.details = 'Searching an article:'
    presenceData.state = `in category ${document.title.replace(
      ' | Altearn',
      '',
    )}`
    if (window.location.pathname.endsWith('category/ag/')) {
      presenceData.details = 'Viewing a page:'
      presenceData.state = 'General Assembly'
    }
  }
  else if (window.location.pathname.startsWith('/assemblee-generale-')) {
    presenceData.details = 'Viewing an General Assembly'
    presenceData.state = document.title
      .replace(' | Altearn', '')
      .replace('Assemblée Générale - ', '')
    if (button) {
      presenceData.buttons = [
        {
          label: 'View General Assembly',
          url: document.URL,
        },
      ]
    }
  }
  else if (window.location.pathname.endsWith('/notre-organisation/')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Our organisation'
  }
  else if (
    window.location.pathname.startsWith('/')
    && window.location.pathname.length !== 1
  ) {
    presenceData.details = 'Reading an article:'
    presenceData.state = document.title.replace(' | Altearn', '')
    if (button) {
      presenceData.buttons = [
        {
          label: 'View article',
          url: document.URL,
        },
      ]
    }
    if (window.location.pathname.includes('/author/')) {
      presenceData.details = 'Looking for an user:'
      presenceData.state = document.title.replace(' | Altearn', '')
      if (button) {
        presenceData.buttons = [
          {
            label: 'View user',
            url: document.URL,
          },
        ]
      }
    }
    if (document.title.includes('Fiche de poste:')) {
      presenceData.details = 'Viewing a place as'
      presenceData.state = document.title
        .replace(' | Altearn', '')
        .replace('Fiche de poste:', '')
      if (button) {
        presenceData.buttons = [
          {
            label: 'View place',
            url: document.URL,
          },
        ]
      }
    }
  }
  else if (window.location.pathname.length === 1) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Home'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
