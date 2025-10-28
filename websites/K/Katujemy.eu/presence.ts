const presence = new Presence({
  clientId: '1431609990623264908',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/UV283Lg.jpeg',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  if (document.location.pathname === '/' || document.location.pathname === '') {
    presenceData.details = 'Przegląda stronę główną'
  }
  else if (document.location.pathname.includes('/topic/')) {
    const title = document.querySelector<HTMLHeadingElement>('h1')
    presenceData.details = 'Przegląda temat na forum'
    presenceData.state = title?.textContent || 'Temat forum'
  }
  else if (document.location.pathname.includes('/profile/')) {
    const user = document.querySelector<HTMLHeadingElement>('h1')
    presenceData.details = 'Przegląda profil użytkownika'
    presenceData.state = user?.textContent || 'Profil użytkownika'
  }
  else if (document.location.pathname.includes('/forum/')) {
    const category = document.querySelector<HTMLHeadingElement>('h1')
    presenceData.details = 'Przegląda kategorię forum'
    presenceData.state = category?.textContent || 'Kategoria forum'
  }
  else if (document.location.pathname.includes('/search')) {
    const search = document.querySelector<HTMLInputElement>('input[type="text"]')
    presenceData.details = 'Wyszukuje na forum'
    presenceData.state = search?.value || 'Wyszukiwanie'
  }
  else {
    presenceData.details = 'Przegląda Katujemy.eu'
    presenceData.state = document.title
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
