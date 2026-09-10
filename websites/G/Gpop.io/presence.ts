import { ActivityType, Assets, getTimestamps, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/G6q4Taa.png',
}

type PlayState = 'playing' | 'waiting' | 'starting' | 'restart' | 'results'

function textContent(selector: string): string | undefined {
  const value = document.querySelector(selector)?.textContent?.trim()
  return value || undefined
}

function isShown(selector: string): boolean {
  const el = document.querySelector(selector)
  if (!el || el.classList.contains('hide'))
    return false
  const style = getComputedStyle(el)
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
}

function coverImage(): string {
  const preview = document.querySelector<HTMLImageElement>(
    '.pixii-level-preview, img[src*="ytimg.com"]',
  )?.src
  if (preview?.includes('ytimg.com')) {
    return preview
      .replace('http://', 'https://')
      .replace('/default.jpg', '/hqdefault.jpg')
      .replace('/mqdefault.jpg', '/hqdefault.jpg')
  }
  return ActivityAssets.Logo
}

function levelTitle(): string | undefined {
  const speed = textContent('.pixii-level-speed')
  const candidates = [
    textContent('.pixii-level-title'),
    textContent('.pp-info-level-title'),
    textContent('.playpage-left-title-span'),
  ].filter((value): value is string => Boolean(value) && value !== 'Untitled')
  const raw = candidates[0]
  if (!raw)
    return undefined
  if (speed && raw.startsWith(speed))
    return raw.slice(speed.length).trim() || raw
  return raw
}

function roomName(): string | undefined {
  return document.title.replace(/\s*-\s*Gpop\.io$/i, '').trim() || undefined
}

function playState(): PlayState {
  if (isShown('.playpage-over'))
    return 'results'
  if (isShown('.pp-overlay-restart'))
    return 'restart'
  if (isShown('.pp-overlay-load'))
    return 'starting'
  if (document.querySelector('.pp-container')?.classList.contains('pp-showoverlay'))
    return 'waiting'
  return 'playing'
}

function applyPlayPresence(
  presenceData: PresenceData,
  options: {
    showButtons: boolean
    showTimestamp: boolean
    showScore: boolean
    multiplayer: boolean
    playing: string
    paused: string
  },
): void {
  const title = levelTitle()
  const author = textContent('.pp-info-level-author') || textContent('.pixii-level-author')
  const song = textContent('.pp-info-title')
  const score = textContent('.pp-score')
  const accuracy = textContent('.pp-score2')
  const combo = textContent('.pp-longest')
  const difficulty = textContent('.pixii-level-speed')
  const players = textContent('.pl-header-nofplayers')
  const state = playState()
  const room = roomName()

  presenceData.largeImageKey = coverImage()

  if (difficulty)
    presenceData.smallImageText = `Difficulty ${difficulty}`
  if (options.multiplayer && players) {
    presenceData.smallImageText = [presenceData.smallImageText, players]
      .filter(Boolean)
      .join(' • ')
  }

  if (options.multiplayer && room)
    presenceData.state = room
  else if (author && author !== 'Unknown')
    presenceData.state = author.startsWith('@') ? `by ${author}` : `by @${author}`

  switch (state) {
    case 'playing': {
      presenceData.details = title ? `Playing ${title}` : options.playing
      presenceData.smallImageKey = Assets.Play
      if (!presenceData.smallImageText)
        presenceData.smallImageText = options.playing
      if (options.showScore && score) {
        const bits = [`Score ${score}`]
        if (accuracy)
          bits.push(accuracy)
        if (combo && combo !== '0')
          bits.push(`Combo ${combo}`)
        presenceData.state = bits.join(' • ')
      }
      else if (song) {
        presenceData.state = song
      }
      if (options.showTimestamp) {
        const current = timestampFromFormat(textContent('.pp-info-timenow') ?? '')
        const duration = timestampFromFormat(textContent('.pp-info-timetotal') ?? '')
        if (duration > 0) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
            current,
            duration,
          )
        }
      }
      break
    }
    case 'starting': {
      presenceData.details = title ? `Starting ${title}` : 'Level starting'
      presenceData.smallImageKey = Assets.Play
      break
    }
    case 'waiting': {
      presenceData.details = options.multiplayer
        ? 'In a multiplayer room'
        : title
          ? `Ready to play ${title}`
          : 'Ready to play'
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = options.paused
      if (options.showTimestamp)
        presenceData.startTimestamp = browsingTimestamp
      break
    }
    case 'restart': {
      presenceData.details = title ? `Restarting ${title}` : 'Restarting a level'
      presenceData.smallImageKey = Assets.Repeat
      break
    }
    case 'results': {
      presenceData.details = textContent('.playpage-over-status-title') || 'Level finished'
      presenceData.smallImageKey = Assets.Stop
      if (title)
        presenceData.state = title
      if (options.showScore) {
        const resultScore = textContent('.playpage-over-status-score') || score
        if (resultScore) {
          presenceData.state = [title, `Score ${resultScore}`, accuracy]
            .filter(Boolean)
            .join(' • ')
        }
      }
      break
    }
  }

  if (options.showButtons) {
    presenceData.buttons = [
      {
        label: options.multiplayer ? 'Join Room' : 'Play Level',
        url: document.location.href,
      },
    ]
  }
}

presence.on('UpdateData', async () => {
  const [showButtons, showTimestamp, showScore, strings] = await Promise.all([
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showScore'),
    presence.getStrings({
      browsing: 'general.browsing',
      playing: 'general.playing',
      paused: 'general.paused',
      viewHome: 'general.viewHome',
      search: 'general.search',
      viewProfile: 'general.viewProfile',
      buttonViewProfile: 'general.buttonViewProfile',
      buttonViewPage: 'general.buttonViewPage',
    }),
  ])
  const presenceData: PresenceData = {
    type: ActivityType.Playing,
    largeImageKey: ActivityAssets.Logo,
  }
  const { pathname, href, search } = document.location
  const path = pathname.replace(/\/+$/, '') || '/'
  const [, section, extra] = path.split('/')
  const params = new URLSearchParams(search)
  const inRoom = document.body.classList.contains('roompagebody') || section === 'room'

  if (inRoom || section === 'play') {
    applyPlayPresence(presenceData, {
      showButtons,
      showTimestamp,
      showScore,
      multiplayer: Boolean(inRoom),
      playing: strings.playing,
      paused: strings.paused,
    })
  }
  else if (path === '/') {
    presenceData.details = strings.viewHome
    presenceData.smallImageKey = Assets.Viewing
    if (showTimestamp)
      presenceData.startTimestamp = browsingTimestamp
  }
  else if (section === 'choose') {
    presenceData.details = 'Choosing a gamemode'
    presenceData.state = 'Creating a level'
    presenceData.smallImageKey = Assets.Writing
    if (showTimestamp)
      presenceData.startTimestamp = browsingTimestamp
  }
  else if (section === 'create' || section === 'create2' || section === 'create3') {
    const modeNames: Record<string, string> = {
      create: 'Classic Mode',
      create2: 'Star Road Mode',
      create3: 'Tokyo Mode',
    }
    presenceData.details = 'Creating a level'
    presenceData.state = modeNames[section]
    presenceData.smallImageKey = Assets.Writing
    if (showTimestamp)
      presenceData.startTimestamp = browsingTimestamp
  }
  else if (section === 'search') {
    const query = params.get('q')
    presenceData.details = strings.search
    if (query)
      presenceData.state = query
    presenceData.smallImageKey = Assets.Search
    if (showTimestamp)
      presenceData.startTimestamp = browsingTimestamp
  }
  else if (section === 'tag') {
    const tag = params.get('t')
    presenceData.details = 'Browsing a tag'
    if (tag)
      presenceData.state = `#${tag}`
    presenceData.smallImageKey = Assets.Search
    if (showTimestamp)
      presenceData.startTimestamp = browsingTimestamp
    if (showButtons) {
      presenceData.buttons = [
        {
          label: strings.buttonViewPage,
          url: href,
        },
      ]
    }
  }
  else if (section === 'profile') {
    const user = extra || textContent('.profile-name')
    presenceData.details = strings.viewProfile
    if (user)
      presenceData.state = user
    presenceData.smallImageKey = Assets.Viewing
    if (showTimestamp)
      presenceData.startTimestamp = browsingTimestamp
    if (showButtons && user) {
      presenceData.buttons = [
        {
          label: strings.buttonViewProfile,
          url: href,
        },
      ]
    }
  }
  else if (section === 'levels') {
    const lists: Record<string, string> = {
      popular: 'Popular levels',
      recommended: 'Recommended levels',
      recentbest: 'Recent best levels',
      alltime: 'All-time levels',
      challenges: 'Challenge levels',
      new: 'New levels',
    }
    presenceData.details = 'Browsing levels'
    if (extra)
      presenceData.state = lists[extra] || extra
    presenceData.smallImageKey = Assets.Search
    if (showTimestamp)
      presenceData.startTimestamp = browsingTimestamp
  }
  else if (section === 'halloffame') {
    presenceData.details = 'Viewing the Hall of Fame'
    presenceData.smallImageKey = Assets.Viewing
    if (showTimestamp)
      presenceData.startTimestamp = browsingTimestamp
  }
  else if (section === 'gshop') {
    presenceData.details = 'Browsing the G-Shop'
    presenceData.smallImageKey = Assets.Viewing
    if (showTimestamp)
      presenceData.startTimestamp = browsingTimestamp
  }
  else if (section === 'settings') {
    presenceData.details = 'Changing settings'
    if (showTimestamp)
      presenceData.startTimestamp = browsingTimestamp
  }
  else if (section === 'signup') {
    presenceData.details = 'Creating an account'
  }
  else if (section === 'signin') {
    presenceData.details = 'Logging in'
  }
  else if (section === 'updates' || section === 'partners') {
    presenceData.details = 'Reading updates'
    presenceData.smallImageKey = Assets.Reading
    if (showTimestamp)
      presenceData.startTimestamp = browsingTimestamp
  }
  else {
    presenceData.details = strings.browsing
    if (showTimestamp)
      presenceData.startTimestamp = browsingTimestamp
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
