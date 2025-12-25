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
  const { pathname } = document.location
  const { details, state, title, pages } = translations[getUserLanguage()] || translations['de-DE']
  let pageDetails: string | null
  let pageState: string

  // check if translation key is part of the pathname
  const matchedPage: string | undefined = Object.keys(pages).find((key: string): boolean => pathname.includes(key))

  if (matchedPage) {
    pageDetails = title
    pageState = pages[matchedPage] as string
  }
  else {
    // fallback
    pageDetails = details
    pageState = state
  }

  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/IlaDOsb.png',
    smallImageKey: Assets.Reading,
    details: pageDetails,
    state: pageState,
    startTimestamp: browsingTimestamp,
  }

  if (presenceData.state)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
