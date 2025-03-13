import { Assets } from 'premid'

const presence = new Presence({
  clientId: '883446187099840562',
})

async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      live: 'general.live',
    },

  )
}

let channel: string
let channelTimestamp: number | undefined
let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/Cosmote%20TV/assets/logo.png',
  }

  const pages: Record<string, PresenceData> = {
    '#!': {
      details: 'Browsing',
    },
    'search': {
      details: 'Searching',
      state: document.querySelector<HTMLInputElement>('#searchFieldInput')?.value,
      smallImageKey: Assets.Search,
      smallImageText: 'Searching',
    },
    'loginSplash': {
      details: 'Logging In',
    },
    'channels': {
      details: 'Browsing Channels',
    },
    'watchlist': {
      details: 'Viewing Watchlist',
    },
    'settings': {
      details: 'Viewing Settings',
    },
    'privacy': {
      details: 'Viewing Privacy Policy',
    },
    'livetv': {
      details: 'Browsing Live TV',
    },
    'inbox': {
      details: 'Viewing Inbox',
    },
    'livetv/replaytv': {
      details: 'Browsing Replay TV',
    },
    'livetv/guide': {
      details: 'Browsing Live TV Guide',
    },
    'onDemand/FILMS': {
      details: 'Browsing Films',
    },
    'onDemand/SERIES': {
      details: 'Browsing Series',
    },
    'onDemand/MOVIES_CLUB': {
      details: 'Browsing Movies Club',
    },
    'onDemand/SPORTS': {
      details: 'Browsing Sports',
    },
    'onDemand/DOCUMENTARIES': {
      details: 'Browsing Documentaries',
    },
    'onDemand/KIDS': {
      details: 'Browsing Kids Content',
    },
  }
  const [newLang, logo, timestamps] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('logo'),
    presence.getSetting<boolean>('timestamps'),
  ])

  for (const [path, data] of Object.entries(pages)) {
    if (document.location.hash.includes(path))
      presenceData = { ...presenceData, ...data } as PresenceData
  }

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  if (document.querySelector<HTMLDivElement>('div[ng-if=\'showPlayer\']')) {
    const { paused, currentTime, duration } = document.querySelector<HTMLVideoElement>('video#arxPlayer')!
    // TV
    if (
      document.querySelector<HTMLImageElement>(
        'div[ng-if=\'details.channelLogoWide\'] > .wide-logo',
      )
    ) {
      presenceData.details = document.querySelector<HTMLSpanElement>(
        '.meta-title[ng-bind~=\'details.title\']',
      )?.textContent
      presenceData.state = document.querySelector<HTMLSpanElement>(
        '.meta-title[ng-bind=\'details.channel.title\']',
      )?.textContent
      if (logo) {
        presenceData.largeImageKey = document
          .querySelector<HTMLImageElement>(
            'div[ng-if=\'details.channelLogoWide\'] > .wide-logo',
          )
          ?.src
          .replace('-wide', '-normal')
      }

      // Live
      if (document.querySelector<HTMLSpanElement>('.meta-remain')) {
        if (channel !== presenceData.state || !channelTimestamp)
          channelTimestamp = Math.floor(Date.now() / 1000)

        presenceData.startTimestamp = channelTimestamp

        presenceData.smallImageKey = paused ? Assets.Pause : Assets.Live
        presenceData.smallImageText = paused ? strings.pause : strings.live
      }
      else {
        // Replay / Timeshift
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
          presence.timestampFromFormat(
            document.querySelector<HTMLSpanElement>('#VcurrentTime')
              ?.textContent ?? '',
          ),
          presence.timestampFromFormat(
            document.querySelector<HTMLSpanElement>('#Vduration')
              ?.textContent ?? '',
          ),
        )

        presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = paused ? strings.pause : strings.play
      }
      channel = presenceData.state as string
    }
    else {
      // On Demand
      presenceData.details = document.querySelector<HTMLSpanElement>(
        '.meta-title[ng-bind~=\'details.title\']',
      )?.textContent
      // Series
      if (
        (document.querySelector<HTMLSpanElement>(
          'span[ng-bind=\'details.seriesSubs\']',
        )?.textContent?.length ?? 0) > 0
      ) {
        const episode = document
          .querySelector<HTMLSpanElement>('span[ng-bind=\'details.seriesSubs\']')
          ?.textContent
          ?.split(' / ', 3)
          .map(str => str.trim()) ?? []

        switch (episode.length) {
          case 3:
            if (
              presenceData.details !== episode[2]
              && !episode[2]?.endsWith(` ${episode[1]}`)
              && !episode[2]?.endsWith(` ${episode[1]?.replace('Ε', 'E')}`)
            ) {
              presenceData.state = `${episode[0]}:${episode[1]} ${episode[2]}`
            }
            else {
              presenceData.state = `${episode[0]
                ?.replace('S', 'Season ')
                .replace('Κ', 'Κύκλος ')} ${episode[1]
                ?.replace('E', 'Episode ')
                .replace('Ε', 'Επεισόδιο ')}`
            }
            break
          case 2:
            presenceData.state = episode[0]
              ?.replace('E', 'Episode ')
              .replace('Ε', 'Επεισόδιο ')
            if (
              presenceData.details !== episode[1]
              && !episode[1]?.endsWith(` ${episode[0]}`)
            ) {
              presenceData.state += `: ${episode[1]}`
            }
            break
          case 1:
            presenceData.state = episode[0]
        }
      }

      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(Math.floor(currentTime), Math.floor(duration))

      presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = paused ? strings.pause : strings.play
    }

    if (paused || !timestamps) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
      channelTimestamp = undefined
    }
  }
  presence.setActivity(presenceData)
})
