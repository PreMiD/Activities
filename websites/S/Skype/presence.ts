import { Assets } from 'premid'

const presence = new Presence({
  clientId: '617500416887881748',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/Skype/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings(
    {
      browse: 'general.browsing',
      search: 'general.searchFor',
      readDm: 'general.readingDM',
      typeDm: 'general.typeDM',
    },

  )
}
let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const [newLang, privacy] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
  ])
  const typing = document.querySelector(
    '[class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr"]',
  )
  const user = document.querySelectorAll('button[aria-label*=":"]')[1]
    ?? document.querySelectorAll('button[aria-label*=","]')[6]
  const search = document.querySelector<HTMLInputElement>('input[type="text"]')

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  if (privacy) {
    presenceData.details = strings.browse
    presence.setActivity(presenceData)
    return
  }

  switch (document.location.hostname) {
    case 'preview.web.skype.com':
    case 'web.skype.com': {
      if (search?.value) {
        presenceData.details = strings.search
        presenceData.state = search.value
        presenceData.smallImageKey = Assets.Search
      }
      else if (user) {
        if (typing?.textContent) {
          presenceData.details = strings.typeDm
        }
        else {
          presenceData.details = strings.readDm
          presenceData.smallImageKey = Assets.Reading
        }
        presenceData.state = user.textContent
      }
      else {
        presenceData.details = strings.browse
      }
      break
    }
    case 'www.skype.com': {
      presenceData.details = 'Skype'
      presenceData.state = 'Browsing...'

      break
    }
    default:
      presenceData.details = strings.browse
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
