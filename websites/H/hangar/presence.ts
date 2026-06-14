import Presence from 'premid'

const presence = new (Presence as any)()

const startTimestamp = Math.floor(Date.now() / 1000)
const defaultImage = 'logo'

presence.on('UpdateData', async () => {
  const title = document.title || 'Hangar'
  const path = window.location.pathname

  const presenceData: any = {
    largeImageKey: defaultImage,
    largeImageText: 'usehangar.gg',
    startTimestamp,
    details: 'Hangar’da geziniyor',
    state: 'Sayfaları inceliyor',
  }

  if (path === '/' || path === '/feed') {
    presenceData.details = 'Ana sayfayı inceliyor'
    presenceData.state = 'Akışı geziyor'
  }
  else if (path.startsWith('/hub/')) {
    const hubName = title.split(' | ')[0] || 'Bir Hub'
    presenceData.details = 'Bir Hub inceliyor'
    presenceData.state = hubName
    presenceData.smallImageKey = defaultImage
    presenceData.smallImageText = 'Hangar'
  }
  else if (path.startsWith('/profile/')) {
    const user = title.split(' | ')[0] || 'Bir profili'
    presenceData.details = 'Bir profili inceliyor'
    presenceData.state = user
  }
  else if (path.startsWith('/post/')) {
    const postTitle = title.split(' | ')[0] || 'Bir gönderi'
    presenceData.details = 'Bir gönderiyi okuyor'
    presenceData.state = postTitle
  }

  presence.setActivity(presenceData)
})
