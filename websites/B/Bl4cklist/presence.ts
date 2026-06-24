import { Assets } from 'premid'
import { translations } from './util/translations.js'

const presence = new Presence({
  clientId: '775415193760169995',
})
const browsingTimestamp: number = Math.floor(Date.now() / 1000)

function getUserLanguage(): 'de-DE' | 'en-US' {
  const lang: string = navigator.language.toLowerCase()

  if (lang.startsWith('de'))
    return 'de-DE'
  if (lang.startsWith('en'))
    return 'en-US'

  return 'en-US' // fallback
}

presence.on('UpdateData', async (): Promise<void> => {
  const { href } = document.location
  const { details, state, title, pages } = translations[getUserLanguage()] || translations['de-DE']
  const matchedPage: string | undefined = Object.keys(pages).find((key: string): boolean => href.includes(key))

  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/Bl4cklist/assets/0.png',
    smallImageKey: Assets.Reading,
    startTimestamp: browsingTimestamp,
  }

  // our discord help subdomain
  if (href.includes('discord.bl4cklist.de/')) {
    const title_split: string[] = document.title.split(' | ')
    presenceData.details = `Bl4cklist's ${title_split[1]}` // page name
    presenceData.state = `💬 ~ ${title_split[0]}..` // article name
  }
  // check if translation key is part of the pathname
  else if (matchedPage) {
    presenceData.details = title
    presenceData.state = pages[matchedPage] as string
  }
  else { // fallback
    presenceData.details = details
    presenceData.state = state
  }

  if (presenceData.state)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
