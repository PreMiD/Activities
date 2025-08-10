import { Assets } from 'premid'
import { translations } from './util/translations.js'

const presence = new Presence({
  clientId: '775415193760169995',
})
const browsingTimestamp: number = Math.floor(Date.now() / 1000)
const sectionIds: string[] = ['discord-bot', 'discord-bot-features', 'discord-bot-tutorial', 'discord-bot-footer']
let currentVisibleId: string | null = null

const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]): void => {
  entries.forEach((entry: IntersectionObserverEntry): void => {
    if (entry.intersectionRatio > 0.25) {
      currentVisibleId = entry.target.id
    }
  })
}, { threshold: [0.25] })

function getUserLanguage(): 'de-DE' | 'en-US' {
  const lang: string = navigator.language.toLowerCase()

  if (lang.startsWith('de'))
    return 'de-DE'
  if (lang.startsWith('en'))
    return 'en-US'

  return 'de-DE' // fallback
}

window.addEventListener('load', (): void => {
  sectionIds.forEach((id: string): void => {
    const section: HTMLElement | null = document.getElementById(id)
    if (section)
      observer.observe(section)
  })
})

enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = 'https://clank.dev/assets/img/logo/android-chrome-512x512.png',
}

const currentLogo: string = ActivityAssets.Logo
presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const { details, state, sections } = translations[getUserLanguage()] || translations['de-DE']

  let sectionState: string = state
  let sectionLogo: string = currentLogo

  if (pathname.includes('/dashboard')) {
    sectionState = 'Watching YouTube'
  }
  else {
    sectionLogo = 'https://i.imgur.com/3fFYVXV.png'
    switch (currentVisibleId) {
      case 'discord-bot':
        sectionState = sections['discord-bot']!
        break
      case 'discord-bot-features':
        sectionState = sections['discord-bot-features']!
        break
      case 'discord-bot-tutorial':
        sectionState = sections['discord-bot-tutorial']!
        break
      case 'discord-bot-footer':
        sectionState = sections['discord-bot-footer']!
        break
    }
  }

  const presenceData: PresenceData = {
    largeImageKey: sectionLogo,
    smallImageKey: Assets.Reading,
    details,
    state: sectionState,
    startTimestamp: browsingTimestamp,
  }

  presence.setActivity(presenceData)
})
