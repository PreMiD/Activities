const presence = new Presence({
  clientId: '630494559956107285',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Google%20Drive/assets/logo.png',
    details: 'Viewing page:',
  }
  const path = document.location.pathname
    .toLowerCase()
    .replace(/(\/u\/(\d)+)/g, '')
  const privacy = await presence.getSetting<boolean>('privacy')

  if (path.startsWith('/drive/folders')) {
    presenceData.details = 'Viewing a folder'
    if (!privacy)
      presenceData.state = document.title.replace('- Google Drive', '')
  }
  else if (path.startsWith('/drive/computer')) {
    presenceData.state = 'Linked computers'
  }
  else if (path.startsWith('/drive/shared-with-me')) {
    presenceData.state = 'Shared files'
  }
  else if (path.startsWith('/drive/recent')) {
    presenceData.state = 'Recently updated files'
  }
  else if (path.startsWith('/drive/starred')) {
    presenceData.state = 'Starred files'
  }
  else if (path.startsWith('/drive/trash')) {
    presenceData.state = 'Deleted files'
  }
  else if (path.startsWith('/drive/backups')) {
    presenceData.state = 'Backups'
  }
  else if (path.startsWith('/drive/quota')) {
    presenceData.state = 'Storage quota'
  }
  else if (path.startsWith('/file/')) {
    const main = document.title.split('.')
    presenceData.details = 'Viewing a file'
    if (!privacy) {
      presenceData.state = `${
        main.length === 2 ? main[0] : main.slice(0, -1).join('').toString()
      }.${main
        .slice(-1)
        .toString()
        .replace('- Google Drive', '')
        .toUpperCase()}`
    }
  }
  else {
    presenceData.details = 'Browsing...'
  }

  presence.setActivity(presenceData)
})
