import { Assets } from 'premid'

const presence: Presence = new Presence({
  clientId: '897325334200975360',
})

async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      browsing: 'general.browsing',
      watchingMovie: 'general.watchingMovie',
      watchingSeries: 'general.watchingSeries',
      watchingLive: 'general.watchingLive',
      watchEpisode: 'general.buttonViewEpisode',
      watchVideo: 'general.buttonWatchVideo',
      watchLive: 'general.live',
      watchStream: 'general.buttonWatchStream',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const newLang: string = await presence
    .getSetting<string>('lang')
    .catch(() => 'en')
  const privacy = await presence.getSetting<boolean>('privacy')
  const time = await presence.getSetting<boolean>('time')
  const buttons = await presence.getSetting<boolean>('buttons')
  const groupWatchBtn = await presence.getSetting<boolean>('groupWatchBtn')
  const isHostSP = /(?:www\.)?starplus\.com/.test(location.hostname)
  const presenceData: PresenceData & {
    partySize?: number
    partyMax?: number
  } = {}

  // Update strings when user sets language
  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  if (isHostSP) {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/S/Star%2B/assets/logo.png'
  }

  // Star+ videos
  if (isHostSP && location.pathname.includes('/video/')) {
    const video = document.querySelector<HTMLVideoElement>(
      '.btm-media-clients video',
    )

    if (video && !Number.isNaN(video.duration)) {
      const groupWatchId = new URLSearchParams(location.search).get(
        'groupWatchId',
      )

      let groupWatchCount: number | undefined
      if (!privacy && groupWatchId) {
        groupWatchCount = Number(
          document.querySelector(
            '.btm-media-overlays-container .group-profiles-control .group-profiles-control__count',
          )?.textContent,
        )
      }

      const title = document.querySelector<HTMLDivElement>(
        '.btm-media-overlays-container .title-field',
      )?.textContent
      const subtitle = document.querySelector<HTMLDivElement>(
        '.btm-media-overlays-container .subtitle-field',
      )?.textContent // episode or empty if it's a movie

      if (!privacy && groupWatchId) {
        presenceData.details = `${title} ${subtitle ? `- ${subtitle}` : ''}`
        presenceData.state = 'In a GroupWatch'
      }
      else if (privacy) {
        presenceData.state = subtitle
          ? (await strings).watchingSeries
          : (await strings).watchingMovie
      }
      else {
        presenceData.details = title
        presenceData.state = subtitle || 'Movie'
      }

      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused
        ? (await strings).pause
        : (await strings).play;
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)

      // remove timestamps if video is paused or user disabled timestamps
      if (video.paused || !time) {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }

      // set GroupWatch participants size
      if (!privacy && groupWatchId) {
        presenceData.partySize = groupWatchCount
        presenceData.partyMax = 7
      }

      // add buttons, if enabled
      if (!privacy && buttons) {
        presenceData.buttons = [
          {
            label: subtitle
              ? (await strings).watchEpisode
              : (await strings).watchVideo,
            url: `https://www.starplus.com${location.pathname}`,
          },
        ]

        // change button if GroupWatch is active and user enabled the button
        if (groupWatchId && groupWatchBtn) {
          presenceData.buttons.push({
            label: 'Join GroupWatch',
            url: `https://www.starplus.com/groupwatch/${groupWatchId}`,
          })
        }
      }

      if (title)
        presence.setActivity(presenceData, !video.paused)
    }

    // Star+ Livestreams
  }
  else if (isHostSP && location.pathname.includes('/live-event/')) {
    const video = document.querySelector<HTMLVideoElement>(
      '.btm-media-clients video',
    )

    if (video && !Number.isNaN(video.duration)) {
      const title = document.querySelector<HTMLDivElement>(
        '.btm-media-overlays-container .title-field',
      )?.textContent
      const subtitle = document.querySelector<HTMLDivElement>(
        '.btm-media-overlays-container .subtitle-field',
      )?.textContent // episode or empty if it's a movie

      if (!privacy) {
        presenceData.details = `${title} ${subtitle ? `- ${subtitle}` : ''}`
        presenceData.state = (await strings).watchLive
      }
      else if (privacy) {
        presenceData.state = (await strings).watchingLive
      }

      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused
        ? (await strings).pause
        : (await strings).play

      // add buttons, if enabled
      if (!privacy && buttons) {
        presenceData.buttons = [
          {
            label: (await strings).watchStream,
            url: `https://www.starplus.com${location.pathname}`,
          },
        ]
      }
      if (title)
        presence.setActivity(presenceData, !video.paused)
    }

    // GroupWatch lobby
  }
  else if (
    isHostSP
    && !privacy
    && location.pathname.includes('/groupwatch/')
  ) {
    const groupWatchCount = document.querySelectorAll(
      '.gw-avatar-enter-done:not([id=gw-invite-button])',
    ).length

    const seriesFields: NodeListOf<HTMLDivElement> = document.querySelectorAll(`
      #webAppScene main #group + div:not([id]) h3[style]:nth-of-type(1),
      #webAppScene main #group + div:not([id]) h3[style]:nth-of-type(2)
    `)

    let title: string | undefined
    let subtitle: string | undefined
    if (seriesFields.length > 0) {
      title = seriesFields[0]?.textContent ?? undefined
      subtitle = seriesFields[1]?.textContent ?? undefined
    }
    else {
      title = document.querySelector<HTMLImageElement>(
        '#webAppScene main #group + div:not([id]) img[alt]',
      )?.alt ?? undefined
    }

    presenceData.details = `${title} ${subtitle ? `- ${subtitle}` : ''}`
    presenceData.state = 'Starting a GroupWatch'
    // set GroupWatch participants size
    presenceData.partySize = groupWatchCount
    presenceData.partyMax = 7

    // add button, if enabled
    if (buttons && groupWatchBtn) {
      presenceData.buttons = [
        {
          label: 'Join GroupWatch',
          url: location.pathname,
        },
      ]
    }

    if (title)
      presence.setActivity(presenceData, false)

    // Browsing
  }
  else {
    presenceData.details = (await strings).browsing
    presence.setActivity(presenceData)
  }
})
