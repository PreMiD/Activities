import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1044942179958804552',
})
const browsingStamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      paused: 'general.paused',
      browse: 'general.browsing',
      buttonWatchVideo: 'general.buttonWatchVideo',
      viewCategory: 'general.viewCategory',
      search: 'general.searchFor',
    },

  )
}

interface Directors {
  name: string
  name_upcase: string
  slug: string
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/MUBI/assets/logo.png',
}
let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    startTimestamp: browsingStamp,
    largeImageKey: ActivityAssets.Logo,
  }
  const { href, pathname } = document.location
  const [newLang, privacy, buttons, covers, viewState] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('covers'),
    presence.getSetting<string>('viewState'),
  ])
  const search = document.querySelectorAll(
    'input[name="query"]',
  )[1] as HTMLInputElement

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }
  if (privacy) {
    presenceData.details = strings.browse
    presence.setActivity(presenceData)
    return
  }
  if (search?.value || pathname.includes('/search/')) {
    presenceData.details = `${strings.search} ${
      search.value !== '' ? search.value : href.split('=')[1]
    }`
    presenceData.state = `In ${
      document
        .querySelector('.css-1ws58ev.e175rd72"]')
        ?.textContent
        ?.replace(/\d*,*\.*/g, '')
        ?.toLowerCase() ?? 'All categories'
    }`
    presenceData.smallImageKey = Assets.Search
    presence.setActivity(presenceData)
    return
  }
  switch (true) {
    case pathname.includes('showing'):
    case pathname === '': {
      presenceData.details = 'Viewing the home page'
      break
    }

    case pathname.includes('specials'): {
      presenceData.buttons = [
        {
          label: 'Browse',
          url: href,
        },
      ]
      presenceData.details = `Browsing ${
        document.querySelector('.css-9ziruj.e1cgaodc1')?.textContent
        ?? 'specials'
      }`

      break
    }
    case pathname.includes('notebook'): {
      if (document.querySelector('.css-dve9fb.earvnqh7')) {
        presenceData.details = 'Reading notebook interview about:'
        presenceData.state = document.querySelector(
          '[class="css-dve9fb earvnqh7"]',
        )?.textContent
      }
      else {
        presenceData.details = 'Reading all notebook interviews'
      }
      presenceData.buttons = [
        {
          label: 'Read Notebook Interview',
          url: href,
        },
      ]
      break
    }
    case pathname.includes('/users/'): {
      presenceData.details = `Viewing ${
        document.querySelector('[data-cy="profile-name"]')?.textContent
      }'s Profile`
      presenceData.largeImageKey = document
        .querySelector('[data-cy="avatar-image-container"]')
        ?.querySelector('img')
        ?.getAttribute('src') ?? ActivityAssets.Logo
      break
    }
    case pathname.includes('films'):
    case pathname.includes('shows'): {
      const video = document.querySelector<HTMLVideoElement>('video')
      const title = document.querySelector('[itemprop="name"]')?.textContent
      const infoJSON = JSON.parse(
        document.querySelector('#__NEXT_DATA__')?.textContent ?? '{}',
      )?.props?.initialProps?.pageProps?.initFilm
      if (!video) {
        presenceData.details = `${title?.charAt(0)}${title
          ?.slice(1)
          .toLowerCase()}`
        presenceData.largeImageKey = document
          .querySelector('[property="og:image"]')
          ?.getAttribute('content')
        presenceData.state = viewState
          .replace('%tags%', infoJSON?.genres?.toString()?.replace(/,/g, ', '))
          .replace(
            '%director%',
            infoJSON?.directors?.length === 1
              ? infoJSON?.directors?.[0]?.name
              : infoJSON?.directors?.map((x: Directors) => x?.name)?.join(', '),
          )
          .replace(
            '%locationAndDate%',
            infoJSON?.historic_countries?.length === 1
              ? `${infoJSON?.historic_countries}, ${infoJSON?.year}`
              : `${infoJSON?.historic_countries?.join(', ')}, ${infoJSON?.year}`,
          )
          .replace(
            '%minutes%',
            `${
              infoJSON?.duration
              ?? document.querySelector('[itemprop="duration"]')?.textContent
            } minutes long`,
          ) // Genre(s) of the content: Documentary, Drama, etc.
        presenceData.buttons = [
          {
            label: 'View Content',
            url: href,
          },
        ]
      }
      else {
        delete presenceData.startTimestamp
        presenceData.details = document
          .querySelector('__next-route-announcer__')
          ?.textContent
          ?.split('|')[0]
          ?? document.querySelector('title')?.textContent?.split('|')[0]
        if (video.duration && !video.paused) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
        }
        presenceData.largeImageKey = document
          .querySelector('#__NEXT_DATA__')
          ?.textContent
          ?.match(
            /https:\/\/images\.mubicdn\.net\/images\/(film|show)\/\d*\/cache-\d*-\d*\/image-w1280\.jpg/,
          )
          ?.at(0) ?? ActivityAssets.Logo
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
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
      break
    }
    case pathname.includes('film'): {
      presenceData.buttons = [
        {
          label: 'Browse',
          url: href,
        },
      ]
      presenceData.details = 'Browsing movies'
      break
    }
    case pathname.includes('cast'): {
      presenceData.details = 'Viewing cast member'
      presenceData.state = document.querySelector<HTMLMetaElement>(
        '[property="og:title"]',
      )?.content
      presenceData.largeImageKey = document
        .querySelector('[data-testid="resp-img-src"] > img')
        ?.getAttribute('src')
      break
    }
    default: {
      const active = document.querySelector('.css-1dccbe3.ej6uv270')
      if (active?.textContent) {
        presenceData.details = `Browsing ${active.textContent}`
      }
      else if (document.querySelector('.css-1ljf7si.eugzkiw0')?.textContent) {
        presenceData.details = `Viewing ${
          document.querySelector('.css-1ljf7si.eugzkiw0')?.textContent
        } settings`
      }
      else {
        presenceData.details = 'Browsing...'
      }
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
