import { Presence } from 'premid'

const presence = new Presence()

// Captured once when the extension initializes on your tab
const startTimestamp = Math.floor(Date.now() / 1000)
const defaultImage = 'logo'

presence.on('UpdateData', async () => {
  const title = document.title || 'Hangar'
  const path = window.location.pathname

  // Safely default presence fields with required type constraints
  const presenceData: any = {
    largeImageKey: defaultImage,
    largeImageText: 'usehangar.gg',
    startTimestamp: startTimestamp,
    details: 'Hangar’da geziniyor', // Solid default fallback
    state: 'Sayfaları inceliyor'   // Solid default fallback
  }

  if (path === '/' || path === '/feed') {
    presenceData.details = 'Ana sayfayı inceliyor'
    presenceData.state = 'Akışı geziyor'
  } else if (path.startsWith('/hub/')) {
    const hubName = title.split(' | ')[0] || 'Bir Hub'
    presenceData.details = 'Bir Hub inceliyor'
    presenceData.state = hubName
    presenceData.smallImageKey = defaultImage
    presenceData.smallImageText = 'Hangar'
  } else if (path.startsWith('/profile/')) {
    const user = title.split(' | ')[0] || 'Bir profil'
    presenceData.details = 'Bir profili inceliyor'
    presenceData.state = user
  } else if (path.startsWith('/post/')) {
    const postTitle = title.split(' | ')[0] || 'Bir gönderi'
    presenceData.details = 'Bir gönderiyi okuyor'
    presenceData.state = postTitle
  }

  presence.setActivity(presenceData)
})
