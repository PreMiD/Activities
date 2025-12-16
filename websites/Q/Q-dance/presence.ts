import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const elapsed = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings(
    {
      browse: 'general.browsing',
      live: 'general.live',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null
presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Q/Q-dance/assets/logo.png',
    name: 'Q-dance',
  }
  const [newLang, privacy, buttons, covers] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('covers'),
  ])
  const { href } = document.location
  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }
  if (privacy) {
    presenceData.details = 'Browsing'
  }
  else if (!document.querySelector('svg.audioplayer-controls__icon--play')) {
    presenceData.details = document.querySelector(
      '.audioplayer-nowplaying__track',
    )?.textContent
    presenceData.state = document.querySelector(
      '.audioplayer-nowplaying__artist',
    )?.textContent
    presenceData.smallImageKey = Assets.Live
    presenceData.smallImageText = strings.live
    presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
      'div.audioplayer-nowplaying__image > img',
    )?.src ?? 'https://cdn.rcd.gg/PreMiD/websites/Q/Q-dance/assets/logo.png'
    presenceData.startTimestamp = elapsed
    presenceData.buttons = [
      {
        label: 'Tune In Live',
        url: href,
      },
    ]
  }
  else {
    presenceData.buttons = [
      {
        label: 'Browse',
        url: href,
      },
    ]
    presenceData.details = `${strings.browse} ${
      document.querySelector(
        '[class="nav-item__link router-link-exact-active router-link-active active"]',
      )?.textContent ?? ''
    }`
  }
  if (!buttons)
    delete presenceData.buttons
  if (!covers) {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/Q/Q-dance/assets/logo.png'
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
