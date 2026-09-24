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

function parseTrackTitle(title: string | undefined, uploader?: string): {
  artist?: string
  title?: string
} {
  const versionLabel = /\b(?:slow(?:ed)?|sped[\s-]*up|speed[\s-]*up|nightcore|daycore|reverb|remix|mix|edit|version|remaster(?:ed)?|live|instrumental|acoustic|demo|cover|extended|radio|original|bass[\s-]*boosted|8d)\b/iu
  const featureLabel = /^(?:(?:ft|feat|featuring)\.?\s|(?:w\/(?!o\b)|with\/)\s*|with\.\s+)/iu
  let normalizedTitle = title?.replace(/[\u200B-\u200D\uFEFF]/g, '').trim()
  let previousTitle: string | undefined
  do {
    previousTitle = normalizedTitle
    normalizedTitle = normalizedTitle?.replace(/\([^()]*\)/gu, (credit) => {
      const text = credit.slice(1, -1).trim()
      return versionLabel.test(text) || featureLabel.test(text) || /^w\/o\b/iu.test(text) ? credit : ''
    }).replace(/\s{2,}/gu, ' ').trim()
  } while (normalizedTitle !== previousTitle)
  const separatorIndex = normalizedTitle?.search(/\s[-\u2010-\u2015\u2212]\s/u) ?? -1

  if (!normalizedTitle)
    return { title }

  let artist = separatorIndex > 0 ? normalizedTitle.slice(0, separatorIndex).trim() : undefined
  let song = separatorIndex > 0 ? normalizedTitle.slice(separatorIndex + 3).trim() : normalizedTitle
  if (!song)
    return { title }

  // "x + y - song".
  if (separatorIndex > 0 && artist) {
    const collaborators = artist.split('+').map(name => name.trim())
    if (collaborators.length > 1 && collaborators.every(Boolean))
      artist = `${collaborators[0]} feat. ${collaborators.slice(1).join(', ')}`
  }

  const producerCredit = /\s\[prod(?:uced)?\.?\s[^()[\]]+\]$/iu
  song = song.replace(producerCredit, '').trim()

  const producer = /\sprod(?:uced)?\.?\s+/iu.exec(song)
  if (producer) {
    const tail = song.slice(producer.index + producer[0].length)
    const nextFeature = /\s[([]?(?:(?:ft|feat|featuring)\.?\s+|(?:w\/(?!o\b)|with\/)\s*|with\.\s+)/iu.exec(tail)
    const credit = nextFeature ? tail.slice(0, nextFeature.index) : tail
    const versions = (credit.match(/\([^()]*\)|\[[^[\]]*\]/gu) ?? [])
      .filter(label => versionLabel.test(label))
    if (credit.trim()) {
      song = [song.slice(0, producer.index).trim(), ...versions].join(' ')
        + (nextFeature ? tail.slice(nextFeature.index) : '')
    }
  }

  const feature = /\s[([]?(?:(?:ft|feat|featuring)\.?\s+|(?:w\/(?!o\b)|with\/)\s*|with\.\s+)/iu.exec(song)
  if (feature) {
    const credit = song.slice(feature.index + feature[0].length).trim()
    const opener = feature[0].trimStart()[0]
    const closer = opener === '(' ? ')' : opener === '[' ? ']' : ''
    let featureText = credit
    let suffix = ''
    if (closer) {
      let depth = 1
      let closingIndex = -1
      for (let index = 0; index < credit.length; index++) {
        if (credit[index] === opener)
          depth++
        else if (credit[index] === closer)
          depth--
        if (depth === 0) {
          closingIndex = index
          break
        }
      }
      if (closingIndex < 0)
        return { artist, title: song }
      featureText = credit.slice(0, closingIndex).trim()
      suffix = credit.slice(closingIndex + 1).trim()
    }
    const versions: string[] = []
    const featuredArtist = featureText.replace(/\([^()]*\)|\[[^[\]]*\]/gu, (label) => {
      if (!versionLabel.test(label))
        return label
      versions.push(label)
      return ''
    }).trim()
    const baseTitle = song.slice(0, feature.index).trim()
    const mainArtist = artist || uploader
    const brackets: string[] = []
    let balanced = true
    for (const character of featuredArtist) {
      if (character === '(' || character === '[')
        brackets.push(character === '(' ? ')' : ']')
      else if ((character === ')' || character === ']') && brackets.pop() !== character)
        balanced = false
    }
    if (baseTitle && featuredArtist && mainArtist
      && balanced && brackets.length === 0) {
      song = [baseTitle, ...versions, suffix].filter(Boolean).join(' ')
      artist = `${mainArtist}${mainArtist.includes(' feat. ') ? ', ' : ' feat. '}${featuredArtist}`
    }
  }

  return { artist, title: song }
}

let elapsed = Math.floor(Date.now() / 1000)
let prevUrl = document.location.href
let strings: { pause: string, browse: string, search: string }
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

let updating = false
let updateRequested = false
let refreshTimer: ReturnType<typeof setTimeout> | undefined
let lastTrackUrl = ''
let trackChangedAt = 0

async function withTimeout<T>(request: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      request,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('SoundCloud request timed out')), 3000)
      }),
    ])
  }
  finally {
    clearTimeout(timer)
  }
}

const savedSettings = {
  browse: false,
  song: false,
  hidePaused: true,
  timestamp: false,
  cover: false,
  links: false,
  displayType: 1,
  lang: 'en',
}

async function readSetting<K extends keyof typeof savedSettings>(id: K): Promise<typeof savedSettings[K]> {
  try {
    savedSettings[id] = await withTimeout(presence.getSetting<typeof savedSettings[K]>(id))
  }
  catch {
    // gshfgsdhjfgsdhjdshj
  }
  return savedSettings[id]
}

function scheduleUpdate() {
  clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => void requestUpdate(), 150)
}

async function requestUpdate() {
  updateRequested = true
  if (updating)
    return

  updating = true
  try {
    while (updateRequested) {
      updateRequested = false
      await updateActivity()
    }
  }
  catch (error) {
    console.error('SoundCloud activity update failed', error)
  }
  finally {
    updating = false
    if (updateRequested)
      scheduleUpdate()
  }
}

async function updateActivity() {
  observePlayer()
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
    readSetting('browse'),
    readSetting('song'),
    readSetting('hidePaused'),
    readSetting('timestamp'),
    readSetting('cover'),
    readSetting('links'),
    readSetting('displayType'),
    readSetting('lang'),
  ])
  if (oldLang !== newLang || !strings) {
    try {
      strings = await withTimeout(getStrings())
      oldLang = newLang
    }
    catch {
      strings ??= { pause: 'Paused', browse: 'Browsing', search: 'Searching' }
    }
  }

  const playing = Boolean(document.querySelector('.playControls__play.playing'))
  const titleLink = document.querySelector<HTMLAnchorElement>('.playbackSoundBadge__titleLink')
  const trackUrl = titleLink?.href ?? ''
  if (trackUrl !== lastTrackUrl) {
    lastTrackUrl = trackUrl
    trackChangedAt = Date.now()
  }

  if (showSong && !playing && Date.now() - trackChangedAt < 1200) {
    scheduleUpdate()
    return presence.clearActivity()
  }

  if (showSong && hidePaused && !playing && !showBrowsing)
    return presence.clearActivity()

  if (document.location.href !== prevUrl) {
    prevUrl = document.location.href
    elapsed = Math.floor(Date.now() / 1000)
  }

  let presenceData: PresenceData = {
    type: ActivityType.Listening,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: elapsed,
  }

  const showingTrack = (playing || !showBrowsing) && showSong
  if (showingTrack) {
    const track = parseTrackTitle(
      document.querySelector('.playbackSoundBadge__titleLink > span:nth-child(2)')?.textContent?.trim()
      ?? titleLink?.textContent?.trim(),
      getElement('.playbackSoundBadge__lightLink'),
    )
    presenceData.details = track.title
    presenceData.state = track.artist
      ?? getElement('.playbackSoundBadge__lightLink')
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
    )?.textContent?.trim()
    const durationString = document.querySelector(
      'div.playbackTimeline__duration > span:nth-child(2)',
    )?.textContent?.trim()
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

    const validTiming = Boolean(timePassed && durationString
      && /^\d+(?::\d{1,2}){0,2}$/.test(timePassed)
      && /^-?\d+(?::\d{1,2}){0,2}$/.test(durationString)
      && timePassed.split(':').slice(-2).every(part => Number(part) < 60)
      && durationString.replace(/^-/, '').split(':').slice(-2).every(part => Number(part) < 60)
      && duration > 0 && currentTime <= duration)
    delete presenceData.startTimestamp
    if (playing && validTiming) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(currentTime, duration)
    }
    else if (!playing) {
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
      if (linkArtist && !track.artist)
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

      const uploader = getElement('.soundTitle__username')
      const track = parseTrackTitle(getElement('.soundTitle__title > span'), uploader)
      presenceData.state = [track.title, track.artist || uploader].filter(Boolean).join(' by ')
    }
  }

  if (presenceData.details && typeof presenceData.details === 'string') {
    if (!showingTrack && presenceData.details.match('(Browsing|Viewing|Discovering)')) {
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = strings.browse
    }
    else if (!showingTrack && presenceData.details.match('(Searching)')) {
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = strings.search
    }
    else if (!showingTrack && presenceData.details.match('(Uploading)')) {
      presenceData.smallImageKey = Assets.Uploading
      presenceData.smallImageText = 'Uploading...' // no string available
    }
    if (!showTimestamps || (showingTrack && !playing)) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
    await withTimeout(presence.setActivity(presenceData))
  }
  else {
    presence.clearActivity()
  }
}

presence.on('UpdateData', requestUpdate)

let playerSnapshot = ''
const playerObserver = new MutationObserver(() => {
  const title = document.querySelector<HTMLAnchorElement>('.playbackSoundBadge__titleLink')
  const snapshot = JSON.stringify([
    title?.href,
    title?.textContent,
    document.querySelector('.playbackSoundBadge__lightLink')?.textContent,
    Boolean(document.querySelector('.playControls__play.playing')),
  ])
  if (snapshot !== playerSnapshot) {
    playerSnapshot = snapshot
    scheduleUpdate()
  }
})
let observedPlayer: Element | null = null
function observePlayer() {
  const player = document.querySelector('.playControls')
  if (player === observedPlayer)
    return
  playerObserver.disconnect()
  observedPlayer = player
  if (player) {
    playerObserver.observe(player, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['class', 'href'],
    })
  }
}
observePlayer()
