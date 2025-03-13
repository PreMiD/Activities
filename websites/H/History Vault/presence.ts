import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1047847313118351421',
})
const browsingStamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/H/History%20Vault/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings(
    {
      browse: 'general.browsing',
      buttonWatchVideo: 'general.buttonWatchVideo',
      home: 'general.viewHome',
      paused: 'general.paused',
      play: 'general.playing',
      search: 'general.searchFor',
      viewShow: 'general.viewShow',
    },

  )
}
async function imgPath(path: string) {
  if (path)
    return `https://${path.replace('//', '')}`
  else return ActivityAssets.Logo
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    startTimestamp: browsingStamp,
    largeImageKey: ActivityAssets.Logo,
  }
  const { href, pathname } = document.location
  const [newLang, privacy, buttons, covers] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('covers'),
  ])
  const search = document.querySelector<HTMLInputElement>(
    'input[class*="Component-input-"]',
  )
  const video = document.querySelectorAll('video')[1] ?? document.querySelector('video')
  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }
  if (privacy) {
    presenceData.details = strings.browse
    presence.setActivity(presenceData)
    return
  }
  if (search?.value && pathname.includes('search')) {
    presenceData.details = strings.search
    presenceData.state = search.value
    presenceData.smallImageKey = Assets.Search
    presence.setActivity(presenceData)
    return
  }

  switch (pathname.split('/')[1]) {
    case '': {
      presenceData.details = strings.home
      break
    }
    case 'documentaries': {
      presenceData.details = `${strings.viewShow} ${
        document
          .querySelector('[id="hero-section"]')
          ?.querySelector('[class*="Component-title-"]')
          ?.textContent
      }`
      presenceData.state = document
        .querySelector('[aria-label="Select season dropdown"]')
        ?.textContent
        ?.replace(/\)k/g, '')
        .replace('(', ' - ')

      presenceData.buttons = [
        {
          label: 'Browse',
          url: href,
        },
      ]
      break
    }
    case 'topics': {
      presenceData.details = 'Viewing shows about'
      presenceData.state = document.querySelector(
        '[data-testid="typography"]',
      )?.textContent
      presenceData.buttons = [
        {
          label: 'Browse',
          url: href,
        },
      ]
      break
    }
    case 'shows':
    case 'specials': {
      if (pathname === '/shows' || pathname === '/documentaries') {
        presenceData.details = 'Viewing all documentaries'
      }
      else {
        const img = await imgPath(
          document
            .querySelector('img[class*="Component-imageImg-"]')
            ?.getAttribute('src')
            ?.slice(2) ?? '',
        )
        if (img)
          presenceData.largeImageKey = `https://${img}`
        if (video?.duration) {
          delete presenceData.startTimestamp
          presenceData.details = document.querySelector(
            '[class*="Component-typeSectionTitleMd"]',
          )?.textContent
          if (video.duration && !video.paused) {
            [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
          }
          presenceData.smallImageKey = video.paused
            ? Assets.Pause
            : Assets.Play
          presenceData.smallImageText = video.paused
            ? strings.paused
            : strings.play
          presenceData.buttons = [
            {
              label: strings.buttonWatchVideo,
              url: href,
            },
          ]
        }
        else {
          presenceData.details = 'Viewing show'
          presenceData.state = document
            .querySelector('[class*="Component-contentWrapper"]')
            ?.querySelector('[data-testid="typography"]')
            ?.textContent
          presenceData.buttons = [
            {
              label: 'Browse',
              url: href,
            },
          ]
        }
      }
      break
    }
    default: {
      presenceData.details = strings.browse
      break
    }
  }

  if (!covers && presenceData.largeImageKey !== ActivityAssets.Logo)
    presenceData.largeImageKey = ActivityAssets.Logo
  if (!buttons && presenceData.buttons)
    delete presenceData.buttons
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
