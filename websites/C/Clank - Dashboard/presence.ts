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

  return 'en-US' // fallback
}

window.addEventListener('load', (): void => {
  sectionIds.forEach((id: string): void => {
    const section: HTMLElement | null = document.getElementById(id)
    if (section)
      observer.observe(section)
  })
})

enum ActivityAssets {
  Logo = 'https://clank.dev/assets/img/logo/android-chrome-512x512.png',
}

let currentSubImg: string = Assets.Reading
let currentLogo: string = ActivityAssets.Logo
presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const showButton: boolean = await presence.getSetting<boolean>('showButton')
  const { details, state, sections, dashboard, invite_button } = translations[getUserLanguage()] || translations['de-DE']

  let sectionDetails: string
  let sectionState: string = state

  if (pathname.includes('/dashboard')) {
    sectionDetails = dashboard
    currentLogo = ActivityAssets.Logo
    currentSubImg = Assets.Search
    if (pathname.endsWith('/dashboard')) {
      sectionState = sections['dashboard-intro'] as string
    }
    else {
      const path_list: string[] = pathname.split('/dashboard/')[1]!.split('/')
      const key: string = `dashboard-${path_list[path_list.length - 1]}`
      if (path_list && sections[key]) {
        sectionState = sections[key]
      }
      else {
        sectionState = sections['dashboard-intro'] as string // Fallback
      }
    }
  }
  else {
    currentLogo = 'https://i.imgur.com/fxYUKmB.png'
    sectionDetails = details
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
    largeImageKey: currentLogo,
    smallImageKey: currentSubImg,
    details: sectionDetails,
    state: sectionState,
    startTimestamp: browsingTimestamp,
  }

  if (showButton) {
    presenceData.buttons = [
      {
        label: invite_button,
        url: document.location.href,
      },
    ]
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
