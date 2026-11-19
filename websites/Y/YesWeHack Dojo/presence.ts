import type { ClassifiedPresence } from './utils.js'
import { ActivityType, Assets } from 'premid'
import { clamp, classify, segmentsFromPathname, shouldShowButton } from './utils.js'

const presence = new Presence({
  clientId: '1572552418951041184',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

const LOGO = 'https://imgur.com/a/gqz1VNt'

const ICONS = {
  reading: Assets.Reading,
  search: Assets.Search,
  viewing: Assets.Viewing,
} as const

function lessonHeading(): string | null | undefined {
  return document.querySelector<HTMLElement>('.p-4.text-center.text-3xl.font-semibold')?.textContent
}

function challengeHeading(): string | null | undefined {
  return document.querySelector<HTMLElement>('h1.text-shadow')?.textContent
    ?? document.querySelector<HTMLElement>('h1')?.textContent
}

function buildPresence(data: ClassifiedPresence): PresenceData {
  const shared = {
    details: data.details,
    ...(data.state ? { state: data.state } : {}),
    largeImageKey: LOGO,
    smallImageKey: ICONS[data.icon],
    smallImageText: data.competing
      ? 'Competing'
      : data.icon === 'reading' ? 'Learning' : 'Browsing',
    startTimestamp: browsingTimestamp,
  }

  return data.competing
    ? { ...shared, type: ActivityType.Competing }
    : { ...shared, type: ActivityType.Watching }
}

presence.on('UpdateData', async () => {
  const [showTimestamp, showButtons, privacyMode, hideProfileName] = await Promise.all([
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('privacyMode'),
    presence.getSetting<boolean>('hideProfileName'),
  ])

  const pathname = document.location.pathname
  const presenceData = buildPresence(classify({
    segments: segmentsFromPathname(pathname),
    title: document.title,
    lessonHeading: lessonHeading(),
    challengeHeading: challengeHeading(),
    privacyMode: Boolean(privacyMode),
    hideProfileName: Boolean(hideProfileName),
  }))

  if (!showTimestamp) {
    delete presenceData.startTimestamp
  }

  if (showButtons && shouldShowButton(pathname)) {
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
