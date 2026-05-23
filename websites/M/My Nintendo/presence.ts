import { Assets } from 'premid'

const presence = new Presence({
  clientId: '680498892651233310',
})

async function getStrings() {
  return presence.getStrings(
    {
      browsing: 'general.browsing',
      reading: 'general.reading',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const path = window.location.pathname.split('/').slice(1)
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/My%20Nintendo/assets/logo.png',
  }
  const newLang = await presence.getSetting<string>('lang').catch(() => 'en')
  oldLang = newLang
  if (!strings || oldLang !== newLang)
    strings = await getStrings()

  switch (path[0]) {
    // Reward Categories
    case 'reward_categories':
      presenceData.details = document.querySelector<HTMLHeadingElement>('h1')?.textContent
        ?? document.title
      presenceData.smallImageText = strings.browsing
      presenceData.smallImageKey = Assets.Reading

      if (path.length > 1) {
        presenceData.state = document.querySelector<HTMLHeadingElement>(
          '.PageSubHeader_title',
        )?.textContent
      }
      break
      // Rewards
    case 'rewards':
      presenceData.details = document.querySelector<HTMLHeadingElement>('h1')?.textContent
        ?? document.title
      presenceData.smallImageText = strings.browsing
      presenceData.smallImageKey = Assets.Reading

      if (path.length > 1) {
        presenceData.state = document.querySelector<HTMLHeadingElement>(
          '.RewardHeader_title',
        )?.textContent
      }
      break
      // Missions
    case 'missions':
      presenceData.details = document.querySelector<HTMLHeadingElement>('h1')?.textContent
        ?? document.title

      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'reading'
      break
      // Points
    case 'point':
      if (path.length < 2)
        return presence.setActivity()

      presenceData.details = document.querySelector<HTMLHeadingElement>('h1')?.textContent
      presenceData.state = document.querySelector<HTMLHeadingElement>('h2')?.textContent
      break
      // News
    case 'news':
      presenceData.details = document.querySelector<HTMLHeadingElement>('h1')?.textContent
        ?? document.title
      presenceData.smallImageText = strings.reading
      presenceData.smallImageKey = Assets.Reading

      if (path.length > 1) {
        presenceData.state = document.querySelector<HTMLHeadingElement>(
          '.NewsDetail_title',
        )?.textContent
      }
      else {
        presenceData.state = document.querySelector<HTMLHeadingElement>(
          '.PageSubHeader_title',
        )?.textContent
      }
      break
      // Redeem Point Codes
    case 'serial_number':
      presenceData.details = document.querySelector<HTMLHeadingElement>('h1')?.textContent
        ?? document.title
      break
      // Getting Started, About Points, About Gold Points
    case 'getting_started':
    case 'about_point':
    case 'about_gold_point':
      presenceData.details = document.querySelector<HTMLHeadingElement>('h1')?.textContent
        ?? document.title

      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'reading'
      break
      // Startpage, Unknown
    default:
      return presence.setActivity()
  }
})
