const presence = new Presence({ clientId: '818822000176791553' })
const assets = {
  'word-logo': 'https://cdn.rcd.gg/PreMiD/websites/O/OneDrive/assets/0.png',
  'excel-logo': 'https://cdn.rcd.gg/PreMiD/websites/O/OneDrive/assets/1.png',
  'powerpoint-logo': 'https://cdn.rcd.gg/PreMiD/websites/O/OneDrive/assets/2.png',
  'onedrive-logo': 'https://cdn.rcd.gg/PreMiD/websites/O/OneDrive/assets/3.png',
  'office-logo': 'https://cdn.rcd.gg/PreMiD/websites/O/OneDrive/assets/4.png',
}

presence.on('UpdateData', async () => {
  const title = document.title.split('-')
  const [fileName] = title
  const fileType = title[1]?.replace('Microsoft', '').replace('Online', '').trim()
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/OneDrive/assets/logo.png',
    startTimestamp: Math.round(Date.now() / 1000),
  }

  if (fileType === 'OneDrive') {
    presenceData.details = 'Browsing a directory'
    presenceData.state = fileName
  }
  else if (
    fileType === 'Word'
    || fileType === 'Excel'
    || fileType === 'PowerPoint'
  ) {
    presenceData.largeImageKey = assets[`${fileType.toLowerCase()}-logo` as keyof typeof assets]
    presenceData.smallImageKey = assets['office-logo']
    presenceData.smallImageText = 'Microsoft Office Online'
    presenceData.details = `Editing ${
      fileType.charAt(0) === 'E' ? 'an' : 'a'
    } ${fileType} file`
    presenceData.state = fileName
  }
  presence.setActivity(presenceData)
})
