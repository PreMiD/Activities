import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1561789522931482645',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/yxA3FNI.png',
}

const sectionDetails: Record<string, string> = {
  db: 'Searching the database',
  tools: 'Using tools',
  about: 'Reading about QBReader',
  settings: 'Changing settings',
}

function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment)
  }
  catch {
    return segment
  }
}

/** Text of an element, or undefined if it is empty, a "-" placeholder, or hidden by the user. */
function getText(selector: string): string | undefined {
  const element = document.querySelector(selector)
  if (!element || element.classList.contains('d-none'))
    return undefined

  const text = element.textContent?.trim()
  return text && text !== '-' ? text : undefined
}

function getProgress(): string | undefined {
  const packet = getText('#packet-number-info')
  const question = getText('#question-number-info')
  const position = [
    packet && `Packet ${packet}`,
    question && `Question ${question}`,
  ].filter(Boolean).join(', ')

  return [getText('#set-name-info'), position].filter(Boolean).join(' - ') || undefined
}

function isPaused(): boolean {
  return document.querySelector('#pause i')?.classList.contains('bi-play-fill') ?? false
}

/** Only public rooms are shown, so private room names and links never leak. */
function isPublicRoom(): boolean {
  return document.querySelector<HTMLInputElement>('#toggle-public')?.checked ?? false
}

presence.on('UpdateData', async () => {
  const [showRoom, showProgress, buttons] = await Promise.all([
    presence.getSetting<boolean>('showRoom'),
    presence.getSetting<boolean>('showProgress'),
    presence.getSetting<boolean>('buttons'),
  ])
  const { pathname, origin } = document.location
  const [section, mode, room] = pathname.split('/').filter(Boolean)

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: 'Browsing',
  }
  let isQuestionPage = false

  if (section === 'play') {
    switch (mode) {
      case 'mp': {
        isQuestionPage = !!room
        if (!room) {
          presenceData.details = 'Multiplayer - Lobby'
          break
        }

        const showName = showRoom && isPublicRoom()
        presenceData.details = showName
          ? `Multiplayer - ${decodeSegment(room)}`
          : 'Multiplayer - Private room'
        if (showName && buttons) {
          presenceData.buttons = [
            {
              label: 'Join Room',
              url: `${origin}${pathname}`,
            },
          ]
        }
        break
      }
      case 'tossups':
        isQuestionPage = true
        presenceData.details = 'Singleplayer - Tossups'
        break
      case 'bonuses':
        isQuestionPage = true
        presenceData.details = 'Singleplayer - Bonuses'
        break
      case 'geoword':
        presenceData.details = 'Playing Geoword'
        break
    }
  }
  else if (section && section in sectionDetails) {
    presenceData.details = sectionDetails[section]
    if (section === 'db')
      presenceData.smallImageKey = Assets.Search
  }

  if (isQuestionPage) {
    const paused = isPaused()
    presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = paused ? 'Paused' : 'Playing'

    const progress = showProgress ? getProgress() : undefined
    if (progress)
      presenceData.state = progress
  }

  presence.setActivity(presenceData)
})
