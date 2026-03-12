import { ActivityType, Assets, getTimestamps, StatusDisplayType, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '802958833214423081',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/SoundCloud/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings(
    {
      pause: 'general.paused',
      browse: 'general.browsing',
      search: 'general.searchSomething',
    },
  )
}
function getElement(query: string): string | undefined {
  let text: string | undefined = ''

  const element = document.querySelector(query)
  if (element) {
    if (element.childNodes.length > 1)
      text = element.childNodes[0]?.textContent ?? undefined
    else text = element.textContent ?? undefined
  }
  return text?.trimStart().trimEnd()
}
function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

let elapsed = Math.floor(Date.now() / 1000)
let prevUrl = document.location.href
let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

const statics = {
  '/stream/': {
    details: 'Browsing...',
    state: 'Latest Posts',
  },
  '/terms-of-use/': {
    details: 'Viewing...',
    state: 'Terms of Service',
  },
  '/pages/privacy/': {
    details: 'Viewing...',
    state: 'Privacy Policy',
  },
  '/pages/cookies/': {
    details: 'Viewing...',
    state: 'Cookies Policy',
  },
  '/pages/copyright/': {
    details: 'Viewing...',
    state: 'Copyright',
  },
  '/pages/copyright/report': {
    details: 'Viewing...',
    state: 'Report Copyright Infringement',
  },
  '/pages/contact': {
    details: 'Viewing...',
    state: 'Contact',
  },
  '/imprint/': {
    details: 'Viewing...',
    state: 'Imprint',
  },
  '/community-guidelines/': {
    details: 'Viewing...',
    state: 'Community Guidelines',
  },
  '/law-enforcement-guidelines/': {
    details: 'Viewing...',
    state: 'Law Enforcement Guidelines',
  },
  '/network-enforcement-act/': {
    details: 'Viewing...',
    state: 'Network Enforcement Act',
  },
  '/mobile/': {
    details: 'Viewing App...',
    state: 'SoundCloud Mobile',
  },
  '/mobile/pulse/': {
    details: 'Viewing App...',
    state: 'Pulse',
  },
  '/notifications/': {
    details: 'Browsing...',
    state: 'Notifications',
  },
  '/messages/': {
    details: 'Browsing...',
    state: 'Messages',
  },
  '/popular/searches/': {
    details: 'Browsing...',
    state: 'Popular Searches',
  },
  '/people/': {
    details: 'Viewing...',
    state: 'Who to Follow',
  },
  '/upload': {
    details: 'Uploading...',
  },
  '/logout': {
    details: 'Logged Out',
  },
}

presence.on('UpdateData', async () => {
  const path = location.pathname.replace(/\/?$/, '/')
  const [
    showBrowsing,
    showSong,
    hidePaused,
    showTimestamps,
    showCover,
    links,
    displayType,
    newLang,
  ] = await Promise.all([
    presence.getSetting<boolean>('browse'),
    presence.getSetting<boolean>('song'),
    presence.getSetting<boolean>('hidePaused'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('links'),
    presence.getSetting<number>('displayType'),
    presence.getSetting<string>('lang').catch(() => 'en'),
  ])
  const playing = Boolean(document.querySelector('.playControls__play.playing'))

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  if (showSong && hidePaused && !playing && !showBrowsing)
    return presence.clearActivity()

  let presenceData: PresenceData = {
    type: ActivityType.Listening,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: elapsed,
  }

  if (document.location.href !== prevUrl) {
    prevUrl = document.location.href
    elapsed = Math.floor(Date.now() / 1000)
  }

  if ((playing || (!playing && !showBrowsing)) && showSong) {
    presenceData.details = getElement(
      '.playbackSoundBadge__titleLink > span:nth-child(2)',
    )
    presenceData.state = getElement('.playbackSoundBadge__lightLink')
    switch (displayType) {
      case 1:
        presenceData.statusDisplayType = StatusDisplayType.State
        break
      case 2:
        presenceData.statusDisplayType = StatusDisplayType.Details
        break
    }
    const timePassed = document.querySelector(
      'div.playbackTimeline__timePassed > span:nth-child(2)',
    )?.textContent
    const durationString = document.querySelector(
      'div.playbackTimeline__duration > span:nth-child(2)',
    )?.textContent
    const [currentTime, duration] = [
      timestampFromFormat(timePassed ?? ''),
      (() => {
        if (!durationString?.startsWith('-')) {
          return timestampFromFormat(durationString ?? '')
        }
        else {
          return (
            timestampFromFormat(durationString.slice(1))
            + timestampFromFormat(timePassed ?? '')
          )
        }
      })(),
    ]
    const linkSong = document
      .querySelector<HTMLAnchorElement>('.playbackSoundBadge__titleLink')
      ?.href
    const linkArtist = document
      .querySelector<HTMLAnchorElement>('.playbackSoundBadge__lightLink')
      ?.href

    if (playing) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(currentTime, duration)
    }
    else {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = strings.pause
    }

    if (showCover) {
      presenceData.largeImageKey = document
        .querySelector<HTMLSpanElement>(
          '.playbackSoundBadge__avatar.sc-media-image > div > span',
        )
        ?.style
        .backgroundImage
        .match(/"(.*)"/)?.[1]
        ?.replace('-t50x50.jpg', '-t500x500.jpg') ?? ActivityAssets.Logo
    }

    if (links) {
      if (linkSong) {
        presenceData.detailsUrl = linkSong
        presenceData.largeImageUrl = linkSong
      }
      if (linkArtist)
        presenceData.stateUrl = linkArtist
    }
  }
  else if ((!playing || !showSong) && showBrowsing) {
    for (const [k, v] of Object.entries(statics)) {
      if (path.match(k))
        presenceData = { ...presenceData, ...v }
    }

    if (path === '/') {
      presenceData.details = 'Browsing...'
      presenceData.state = 'Home'
    }
    else if (path.includes('/charts/')) {
      presenceData.details = 'Browsing Charts...'

      const [heading] = path.split('/').slice(-2)
      if (heading && !heading.includes('charts'))
        presenceData.state = capitalize(heading)
    }
    else if (path.includes('/you/')) {
      presenceData.details = 'Browsing My Content...'

      const heading = location.pathname.split('/').pop()
      presenceData.state = heading && capitalize(heading)
    }
    else if (path.includes('/settings/')) {
      presenceData.details = 'Browsing Settings...'
      presenceData.state = getElement('.g-tabs-link.active')
    }
    else if (path.includes('/search/')) {
      presenceData.details = 'Searching...'

      const searchBox = document.querySelector<HTMLInputElement>(
        '.headerSearch__input',
      )
      presenceData.state = searchBox && searchBox.value
    }
    else if (path.includes('/discover/')) {
      presenceData.details = 'Discovering...'
      presenceData.state = 'Music'

      const setLabel = getElement('.fullHero__titleTextLineBig > span')
      if (setLabel) {
        presenceData.details = 'Browsing Set...'
        presenceData.state = setLabel
      }
    }
    else if (path.includes('/stats/')) {
      presenceData.details = 'Viewing Stats...'
      presenceData.state = getElement('.statsNavigation .g-tabs-link.active')
    }

    const username = getElement('.profileHeaderInfo__userName')
      || getElement('.userNetworkTop__title > a')
    if (username) {
      presenceData.details = 'Viewing Profile...'
      presenceData.state = `${username} (${getElement('.g-tabs-link.active')})`
    }

    const waveform = document.querySelector('.fullListenHero .waveform__layer')
    if (waveform) {
      if (waveform.childElementCount >= 3)
        presenceData.details = 'Viewing Song...'
      else presenceData.details = 'Browsing Playlist/Album...'

      presenceData.state = `${getElement(
        '.soundTitle__title > span',
      )} by ${getElement('.soundTitle__username')}`
    }
  }

  if (presenceData.details && typeof presenceData.details === 'string') {
    if (presenceData.details.match('(Browsing|Viewing|Discovering)')) {
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = strings.browse
    }
    else if (presenceData.details.match('(Searching)')) {
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = strings.search
    }
    else if (presenceData.details.match('(Uploading)')) {
      presenceData.smallImageKey = Assets.Uploading
      presenceData.smallImageText = 'Uploading...' // no string available
    }
    else if (!showTimestamps || (!playing && !showBrowsing)) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
    presence.setActivity(presenceData)
  }
})
