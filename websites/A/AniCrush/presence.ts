import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1208440916461887488',
})
enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AniCrush/assets/logo.png',
}
let video = {
  exists: false,
  duration: 0,
  currentTime: 0,
  paused: true,
}

presence.on(
  'iFrameData',
  (data: {
    exists: boolean
    duration: number
    currentTime: number
    paused: boolean
  }) => {
    video = data
  },
)
presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  } as PresenceData
  const { pathname, href, search } = document.location
  const [showButtons, showW2Button, showTimestamps] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('watch2getherJoinRoomButton'),
    presence.getSetting<boolean>('timestamps'),
  ])
  switch (true) {
    case pathname.startsWith('/watch/'): {
      const streamingType = Array.from(
        document.querySelectorAll('.list .w-type').values(),
      )
        .find(div => div.querySelector('.avail .active'))
        ?.querySelector('.item-sub .name')
        ?.textContent
        ?.toLowerCase()
      const currentEpisodeNumber = Number(
        document.querySelector('.active .btn-ep')?.textContent,
      )
      const totalEpisodeNumber = Number(
        document.querySelector(`.item.item-${streamingType} .name`)
          ?.textContent,
      )

      presenceData.details = `Watching ${
        document.querySelector('.seoWidget.d-none')?.textContent ?? '?'
      }`
      presenceData.largeImageKey = document
        .querySelector('.anime-thumbnail-img')
        ?.getAttribute('src')

      presenceData.state = `Episode ${
        Number.isNaN(currentEpisodeNumber) || !currentEpisodeNumber
          ? '?'
          : currentEpisodeNumber.toLocaleString()
      }/${
        Number.isNaN(totalEpisodeNumber) || !totalEpisodeNumber
          ? '?'
          : totalEpisodeNumber.toLocaleString()
      }`
      if (video.exists) {
        if (showTimestamps) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
            Math.floor(video.currentTime),
            Math.floor(video.duration),
          )
        }
        if (video.paused) {
          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = 'Paused'
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
        else {
          presenceData.smallImageKey = Assets.Play
          presenceData.smallImageText = 'Playing'
        }
      }
      presenceData.type = ActivityType.Watching
      break
    }
    case pathname.startsWith('/detail/'): {
      presenceData.details = `Viewing ${
        document.querySelector(
          '.about-anime .infor .heading .main .heading-md.mb-0.text-white',
        )?.textContent || '?'
      }`
      presenceData.state = `Rating ${
        document.querySelector('.score .s-mark')?.textContent || '?'
      }/10.0`
      break
    }
    case pathname.startsWith('/watch2gether/create/'): {
      presenceData.details = `Watch2gether ${
        document.querySelector('.anime-name a')?.textContent || '?'
      }`
      presenceData.state = 'Creating room'
      break
    }
    case pathname.startsWith('/watch2gether/'): {
      const streamingType = document
        .querySelector('.live-header .other-items')
        ?.children[1]
        ?.querySelector('.text')
        ?.textContent
        ?.toLowerCase()
      const totalEpisodes = Number(
        Array.from(
          document.querySelectorAll(`.item.item-${streamingType} .text`),
        ).at(-1)?.textContent,
      )
      const viewers = Number(
        document.querySelector('.item-viewers span')?.textContent?.[0],
      )
      presenceData.details = `Watch2gether ${
        document.querySelector('.anime-block .main h3 a')?.textContent || '?'
      }`
      presenceData.state = `Episode ${
        Number(
          document
            .querySelector('.other-items .item-ep span')
            ?.textContent
            ?.replace('Episode ', ''),
        ).toLocaleString() || '?'
      }/${
        Number.isNaN(totalEpisodes) || !totalEpisodes
          ? '?'
          : totalEpisodes.toLocaleString() || '?'
      } | ${
        Number.isNaN(viewers) || !viewers
          ? '? viewers'
          : viewers > 1
            ? `${viewers.toLocaleString()} viewers`
            : `${viewers} viewer`
      }`
      if (showW2Button && showButtons) {
        presenceData.buttons = [
          {
            label: 'Join Room',
            url: href,
          },
        ]
      }
      if (video.exists) {
        if (showTimestamps) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
            Math.floor(video.currentTime),
            Math.floor(video.duration),
          )
        }
        if (video.paused) {
          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = 'Paused'
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
        else {
          presenceData.smallImageKey = Assets.Play
          presenceData.smallImageText = 'Playing'
        }
      }
      presenceData.type = ActivityType.Watching
      break
    }
    case pathname.startsWith('/watch2gether'): {
      presenceData.details = 'Browsing Watch2gether'
      break
    }
    default: {
      const searchParams = new URLSearchParams(search)
      const letter = searchParams.get('letter')
      const pages: Record<string, PresenceData> = {
        '/home': {
          details: 'Browsing homepage',
        },
        '/most-popular': {
          details: 'Browsing most popular anime',
        },
        '/az-list': {
          details: `Browsing ${!letter ? 'all ' : ''}anime${
            letter ? ` starting with ${letter}` : ''
          }`,
        },
        '/estimated-schedule': {
          details: 'Browsing estimated anime schedules',
        },
        '/search': {
          details: `Searching for ${searchParams.get('keyword') || 'anime'}`,
        },
      }
      for (const [path, data] of Object.entries(pages)) {
        if (pathname.startsWith(path)) {
          presenceData = { ...presenceData, ...data } as PresenceData
          if (!presenceData.buttons && showButtons) {
            presenceData.buttons = [
              {
                label: 'Browse Anime',
                url: href,
              },
            ]
          }
        }
      }
      if (!presenceData.details) {
        presenceData.details = 'Browsing...'
        presenceData.smallImageKey = Assets.Search
      }
      break
    }
  }
  if (presenceData.endTimestamp && presenceData.startTimestamp)
    presenceData.type = ActivityType.Watching
  presence.setActivity(presenceData)
})
