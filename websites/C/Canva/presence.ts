const presence = new Presence({
  clientId: '670612134878773297',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/Canva/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.pathname === '/') {
    presenceData.details = 'In the Homepage'
  }
  else if (document.location.pathname.startsWith('/folder')) {
    if (document.location.pathname.startsWith('/folder/all-designs')) {
      presenceData.details = 'Browsing his designs'
    }
    else if (document.location.pathname.startsWith('/folder/uploads')) {
      presenceData.details = 'Browsing the photos he'
      presenceData.state = 'uploaded'
    }
    else if (document.location.pathname.startsWith('/folder/purchased')) {
      presenceData.details = 'Browsing the photos he'
      presenceData.state = 'purchased'
    }
    else if (document.location.pathname.startsWith('/folder/likes')) {
      presenceData.details = 'Browsing the photos he'
      presenceData.state = 'likes'
    }
    else if (document.location.pathname.startsWith('/folder/shared')) {
      presenceData.details = 'Browsing the designs and'
      presenceData.state = 'photos shared with him'
    }
    else if (document.location.pathname.startsWith('/folder/trash')) {
      presenceData.details = 'Browsing the trash'
    }
    else if (document.location.pathname === '/folder/') {
      presenceData.details = 'Browsing his folders'
    }
    else if (document.location.pathname === '/folder') {
      presenceData.details = 'Browsing the folders'
    }
    else {
      presenceData.details = 'Browsing the folder: '
      presenceData.state = document
        .querySelector('head > title')
        ?.textContent
        ?.replace(' - Canva', '')
    }
  }
  else if (document.location.pathname.startsWith('/templates/')) {
    if (document.location.pathname.startsWith('/templates/search/'))
      presenceData.details = 'Searching templates'
    else presenceData.details = 'Browsing the templates'
  }
  else if (document.location.pathname.startsWith('/photos/')) {
    if (document.location.pathname.startsWith('/photos/search/')) {
      presenceData.details = 'Searching photos of:';
      [presenceData.state] = document
        ?.querySelector('head > title')
        ?.textContent
        ?.split(' - ') ?? []
    }
    else {
      presenceData.details = 'Browsing the photos'
    }
  }
  else if (document.location.pathname.startsWith('/brand')) {
    presenceData.details = 'Editing his brand'
  }
  else if (document.location.pathname.startsWith('/teams')) {
    if (document.location.pathname.startsWith('/teams/designs')) {
      presenceData.details = 'Browsing the team designs'
    }
    else if (document.location.pathname.startsWith('/teams/folders')) {
      presenceData.details = 'Browsing the team folders'
    }
    else if (document.location.pathname.startsWith('/teams/members')) {
      presenceData.details = 'Viewing the team'
      presenceData.state = 'members'
    }
    else if (document.location.pathname.startsWith('/teams/groups')) {
      presenceData.details = 'Viewing the team groups'
    }
    else if (document.location.pathname.startsWith('/teams/create')) {
      presenceData.details = 'Creating a new group'
    }
    else {
      presenceData.details = 'Browsing the team info'
    }
  }
  else if (document.location.pathname.startsWith('/groups/')) {
    if (document.location.pathname.endsWith('/designs')) {
      presenceData.details = 'Browsing the group'
      presenceData.state = 'designs'
    }
    else if (document.location.pathname.endsWith('/folders')) {
      presenceData.details = 'Browsing the group folders'
    }
    else if (document.location.pathname.endsWith('/members')) {
      presenceData.details = 'Viewing the group'
      presenceData.state = 'members'
    }
    else {
      presenceData.details = 'Browsing the group info'
    }
  }
  else if (document.location.pathname.startsWith('/account')) {
    if (document.location.pathname.startsWith('/account/information'))
      presenceData.details = 'In the account settings'
    else if (document.location.pathname.startsWith('/account/billing'))
      presenceData.details = 'In the billing settings'
    else if (document.location.pathname.startsWith('/account/print-orders'))
      presenceData.details = 'Viewing his Print Orders'
    else presenceData.details = 'In the account settings'
  }
  else if (document.location.pathname.startsWith('/rewards')) {
    presenceData.details = 'Inviting friends'
  }
  else if (document.location.pathname.startsWith('/design/')) {
    if (document.location.pathname.endsWith('/edit')) {
      presenceData.details = 'Editing the design:'
      presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/C/Canva/assets/0.png'
      presenceData.smallImageText = 'Editing'
      presenceData.state = document.querySelector('head > title')?.textContent
    }
    else if (document.location.pathname.endsWith('/view')) {
      presenceData.details = 'Watching the design:'
      presenceData.state = document.querySelector('head > title')?.textContent
    }
    else {
      presenceData.details = 'Viewing a design'
    }
  }
  else {
    presenceData.details = 'Browsing...'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
