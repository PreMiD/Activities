
import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1431609990623264908',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/M9hZA8h.jpeg',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  // Home page
  if (document.location.pathname === '/') {
    presenceData.details = 'Przegląda stronę główną'
  }
  // Forum topic
  else if (document.location.pathname.includes('/topic/')) {
  const title = document.querySelector('h1')
  presenceData.details = 'Przegląda temat na forum'
  presenceData.state = title?.textContent || 'Temat forum'
  }
  // User profile
  else if (document.location.pathname.includes('/profile/')) {
  const user = document.querySelector('h1')
  presenceData.details = 'Przegląda profil użytkownika'
  presenceData.state = user?.textContent || 'Profil użytkownika'
  }
  // Forum category
  else if (document.location.pathname.includes('/forum/')) {
  const category = document.querySelector('h1')
  presenceData.details = 'Przegląda kategorię forum'
  presenceData.state = category?.textContent || 'Kategoria forum'
  }
  // Search
  else if (document.location.pathname.includes('/search')) {
  const search = document.querySelector('input[type="text"]') as HTMLInputElement
  presenceData.details = 'Wyszukuje na forum'
  presenceData.state = search?.value || 'Wyszukiwanie'
  }
  // Other pages
  else {
    presenceData.details = 'Przegląda Katujemy.eu'
    presenceData.state = document.title
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
