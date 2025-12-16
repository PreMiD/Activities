import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})

async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      browse: 'general.browsing',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/U/UKTV/assets/logo.png',
    name: 'UKTV',
  }
  const video = document.querySelector<HTMLVideoElement>('video')
  const { href, pathname } = document.location
  const search = document.querySelector<HTMLInputElement>('#search-input')
  const [newLang, privacy, covers, buttons] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('covers'),
    presence.getSetting<boolean>('buttons'),
  ])
  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }
  if (privacy) {
    presenceData.details = strings.browse
  }
  else if (search) {
    presenceData.details = 'Searching for'
    presenceData.state = search.value
    presenceData.smallImageKey = Assets.Search
  }
  else if (video?.duration) {
    const title = document.querySelector<HTMLMetaElement>(
      '[property="og:title"]',
    )
    const episodeSeason = document
      .querySelector('[class="vod-episode__ep-num"]')
      ?.lastChild
      ?.textContent
      ?.replace(/,/g, '')
      ?? title?.content.replace(title.content.split(',')[0] ?? '', '')

    presenceData.details = document.querySelector(
      '[class="vod-episode__title margin-bottom--xxs invert-text semi-bold"]',
    )?.textContent
    ?? document.querySelector('[id="brand-page"]')?.textContent
    ?? title?.content.split(',')[0]
    presenceData.state = episodeSeason
      ?.split('-')[0]
      ?.replace(/,/g, '')
      .replace('Series', 'S')
      .replace('Episode', ':E')
      .replace(/ /g, '')
      .trim()
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused ? strings.pause : strings.play;
    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
    if (covers) {
      presenceData.largeImageKey = document
        .querySelector('[id="longInfo"]')
        ?.firstElementChild
        ?.getAttribute('src')
        ?? document.querySelector<HTMLMetaElement>('[property="og:image"]')
          ?.content
          ?? 'lm'
    }

    if (video.paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
    presenceData.buttons = [
      {
        label: 'View Show',
        url: href,
      },
    ]
  }
  else if (
    pathname.includes('/genre/')
    || pathname.includes('/collections/')
  ) {
    presenceData.buttons = [
      {
        label: 'Browse',
        url: href,
      },
    ]
    presenceData.details = 'Browsing'
    presenceData.state = document.querySelector(
      '[class="dropdown-item nuxt-link-exact-active nuxt-link-active"]',
    )?.textContent
  }
  else if (pathname.includes('/box-sets/')) {
    presenceData.details = 'Viewing boxsets'
  }
  else {
    presenceData.buttons = [
      {
        label: 'Browse Boxsets',
        url: href,
      },
    ]
    presenceData.details = strings.browse
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = strings.browse
    presenceData.buttons = [
      {
        label: 'Browse',
        url: href,
      },
    ]
  }
  if (!buttons)
    delete presenceData.buttons
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
