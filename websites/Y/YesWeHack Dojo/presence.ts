import { ActivityType, Assets } from 'premid'
import { categoryLabel, clamp, pickTitle } from './utils.js'

const presence = new Presence({
  clientId: '000000000000000000',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

interface PresenceInput {
  details: string
  state?: string
  type: ActivityType.Watching | ActivityType.Competing
  smallImageKey: string
  smallImageText: string
}

function lessonHeading(): string | null | undefined {
  return document.querySelector<HTMLElement>('.p-4.text-center.text-3xl.font-semibold')?.textContent
}

function challengeHeading(): string | null | undefined {
  return document.querySelector<HTMLElement>('h1.text-shadow')?.textContent
    ?? document.querySelector<HTMLElement>('h1')?.textContent
}

function buildPresence(input: PresenceInput): PresenceData {
  if (input.type === ActivityType.Competing) {
    return {
      details: input.details,
      state: input.state,
      type: ActivityType.Competing,
      largeImageKey: Assets.Search,
      smallImageKey: input.smallImageKey,
      smallImageText: input.smallImageText,
      startTimestamp: browsingTimestamp,
    }
  }

  return {
    details: input.details,
    state: input.state,
    type: ActivityType.Watching,
    largeImageKey: Assets.Search,
    smallImageKey: input.smallImageKey,
    smallImageText: input.smallImageText,
    startTimestamp: browsingTimestamp,
  }
}

function renderPresence(segments: string[]): PresenceData {
  const [first, second] = segments
  const last = segments.at(-1)

  if (segments.length === 0) {
    return buildPresence({
      details: 'Improving bug hunting skills',
      state: 'Home',
      type: ActivityType.Watching,
      smallImageKey: Assets.Reading,
      smallImageText: 'Learning',
    })
  }

  if (first === 'learn') {
    if (segments.length === 1) {
      return buildPresence({
        details: 'Browsing training modules',
        state: 'All categories',
        type: ActivityType.Watching,
        smallImageKey: Assets.Reading,
        smallImageText: 'Learning',
      })
    }

    if (segments.length === 2) {
      return buildPresence({
        details: 'Browsing training modules',
        state: categoryLabel(second ?? '') ?? 'All categories',
        type: ActivityType.Watching,
        smallImageKey: Assets.Reading,
        smallImageText: 'Learning',
      })
    }

    return buildPresence({
      details: pickTitle([lessonHeading(), document.title], last) ?? 'Training module',
      state: categoryLabel(second ?? '') ?? 'Training module',
      type: ActivityType.Watching,
      smallImageKey: Assets.Reading,
      smallImageText: 'Learning',
    })
  }

  if (first === 'challenge-of-the-month') {
    return buildPresence({
      details: segments.length === 1
        ? 'Browsing monthly challenges'
        : pickTitle([challengeHeading(), document.title], last) ?? 'Challenge of the month',
      state: 'Challenge of the month',
      type: ActivityType.Competing,
      smallImageKey: Assets.Search,
      smallImageText: 'Competing',
    })
  }

  if (first === 'challenge' && second === 'play') {
    return buildPresence({
      details: pickTitle([challengeHeading(), document.title], last) ?? 'Official challenge',
      state: 'Official challenge',
      type: ActivityType.Competing,
      smallImageKey: Assets.Search,
      smallImageText: 'Competing',
    })
  }

  if (first === 'challenge' && second === 'tutorial') {
    return buildPresence({
      details: 'Solving the tutorial',
      state: 'Tutorial',
      type: ActivityType.Competing,
      smallImageKey: Assets.Search,
      smallImageText: 'Competing',
    })
  }

  if (first === 'challenge' && second === 'create') {
    return buildPresence({
      details: 'Creating a challenge',
      state: 'Challenge editor',
      type: ActivityType.Competing,
      smallImageKey: Assets.Search,
      smallImageText: 'Competing',
    })
  }

  if (first === 'user') {
    return buildPresence({
      details: pickTitle([document.title]) ?? 'Viewing a Dojo profile',
      state: 'Dojo profile',
      type: ActivityType.Watching,
      smallImageKey: Assets.Viewing,
      smallImageText: 'Browsing',
    })
  }

  return buildPresence({
    details: 'Browsing Dojo',
    type: ActivityType.Watching,
    smallImageKey: Assets.Search,
    smallImageText: 'Browsing',
  })
}

presence.on('UpdateData', async () => {
  const [showTimestamp, showButtons] = await Promise.all([
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showButtons'),
  ])

  const segments = document.location.pathname.split('/').filter(Boolean)
  const presenceData = renderPresence(segments)

  if (!showTimestamp) {
    delete presenceData.startTimestamp
  }

  if (showButtons) {
    presenceData.buttons = [
      {
        label: 'View page',
        url: document.location.href,
      },
    ]
  }

  if (!presenceData.details) {
    presence.clearActivity()
    return
  }

  presenceData.details = clamp(String(presenceData.details))

  if (presenceData.state) {
    presenceData.state = clamp(String(presenceData.state))
  }

  presence.setActivity(presenceData)
})
