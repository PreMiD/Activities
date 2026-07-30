import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1532069734961647827',
})

const LOGO_URL = 'https://www.codiquest.online/icon-512.png'

let activeKind: string | undefined
let activityStartedAt = Date.now()

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const bridge = document.documentElement.dataset

  // Public, authentication, and legal surfaces never publish an activity. The
  // game removes the bridge on sign-out as a second layer of protection.
  if (pathname !== '/play' || bridge.cqPresence !== 'ready') {
    presence.clearActivity()
    return
  }

  const [showLocation, showCharacter, showTimestamp, showParty] = await Promise.all([
    presence.getSetting<boolean>('showLocation'),
    presence.getSetting<boolean>('showCharacter'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showParty'),
  ])

  if (activeKind !== bridge.cqActivity) {
    activeKind = bridge.cqActivity
    activityStartedAt = Date.now()
  }

  const presenceData: PresenceData = {
    type: ActivityType.Playing,
    details: bridge.cqDetails || 'Adventuring in Hollowreach',
    largeImageKey: LOGO_URL,
  }

  const state: string[] = []
  if (showLocation && bridge.cqLocation)
    state.push(bridge.cqLocation)
  if (showCharacter && bridge.cqClass && bridge.cqLevel) {
    state.push(`Level ${bridge.cqLevel} ${bridge.cqClass}`)
  }
  if (state.length)
    presenceData.state = state.join(' · ')
  if (showTimestamp)
    presenceData.startTimestamp = activityStartedAt

  if (showParty) {
    const partySize = Number.parseInt(bridge.cqPartySize ?? '', 10)
    const partyMax = Number.parseInt(bridge.cqPartyMax ?? '', 10)
    if (Number.isInteger(partySize) && Number.isInteger(partyMax) && partySize > 0 && partyMax >= partySize) {
      presenceData.party = { partySize, maxPartySize: partyMax }
    }
  }

  presence.setActivity(presenceData)
})
