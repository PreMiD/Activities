const presence = new Presence({
  clientId: '925204937225416704',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings({
    browsingAlbums: 'googlephotos.browsingAlbums',
    browsingPhotos: 'googlephotos.browsingPhotos',
    browsingSettings: 'googlephotos.browsingSettings',
    playingBackAMemory: 'googlephotos.playingBackAMemory',
    searchingFor: 'googlephotos.searchingFor',
    updates: 'googlephotos.updates',
    viewingAPhoto: 'googlephotos.viewingAPhoto',
    viewingAnAlbum: 'googlephotos.viewingAnAlbum',
    viewingDocuments: 'googlephotos.viewingDocuments',
    viewingPlaces: 'googlephotos.viewingPlaces',
    viewingTheArchive: 'googlephotos.viewingTheArchive',
    viewingTheLockedFolder: 'googlephotos.viewingTheLockedFolder',
    viewingThePrintStore: 'googlephotos.viewingThePrintStore',
    viewingTheQuotaManagement: 'googlephotos.viewingTheQuotaManagement',
    viewingTheTrash: 'googlephotos.viewingTheTrash',
  })
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Google%20Photos/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const strings = await getStrings()

  const path = document.location.pathname
  if (path === '' || path === '/') {
    presenceData.details = strings.browsingPhotos
  }
  else if (path.startsWith('/updates')) {
    presenceData.details = strings.updates
  }
  else if (path.startsWith('/printstore')) {
    presenceData.details = strings.viewingThePrintStore
  }
  else if (path.startsWith('/documents')) {
    presenceData.details = strings.viewingDocuments
    if (path.split('/')[2] != null) {
      presenceData.state = document.title.replace(/- Google[\xA0 ]Photos/, '').trim()
    }
  }
  else if (path.startsWith('/memory')) {
    presenceData.details = strings.playingBackAMemory;
    [presenceData.state] = document.title.split(/-/, 1)
  }
  else if (path.includes('/photo')) {
    presenceData.details = strings.viewingAPhoto
  }
  else if (path.startsWith('/search')) {
    presenceData.details = strings.searchingFor;
    [presenceData.state] = document.title.split(/-/, 1)
  }
  else if (path === '/albums') {
    presenceData.details = strings.browsingAlbums
  }
  else if (path.startsWith('/album')) {
    presenceData.details = strings.viewingAnAlbum
    if (await presence.getSetting<boolean>('albumname'))
      [presenceData.state] = document.title.split(/-/, 1)
  }
  else if (path.startsWith('/archive')) {
    presenceData.details = strings.viewingTheArchive
  }
  else if (path.startsWith('/places')) {
    presenceData.details = strings.viewingPlaces
    if (path.split('/')[2] != null) {
      presenceData.state = document.title.replace(/- Google[\xA0 ]Photos/, '').trim()
    }
  }
  else if (path.startsWith('/lockedfolder')) {
    presenceData.details = strings.viewingTheLockedFolder
  }
  else if (path.startsWith('/trash')) {
    presenceData.details = strings.viewingTheTrash
  }
  else if (path.startsWith('/quotamanagement')) {
    presenceData.details = strings.viewingTheQuotaManagement
  }
  else if (path.startsWith('/settings')) {
    presenceData.details = strings.browsingSettings
  }
  presence.setActivity(presenceData)
})
