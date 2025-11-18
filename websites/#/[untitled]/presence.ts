import { ActivityType, getTimestamps, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '1440157128500314122',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/mQBrqv7.png',
}

function getElementText(selector: string) {
  const element = document.querySelector(selector)
  return element?.textContent?.trim() ?? ''
}

function isPlaying() {
  const audioTag = document.querySelector<HTMLAudioElement>('body > audio')

  return !!audioTag && audioTag?.paused === false
}

presence.on('UpdateData', async () => {
  if (!isPlaying()) {
    return presence.clearActivity()
  }

  const showLogo = await presence.getSetting<boolean>('show-logo')

  const title = getElementText('.playbar-title')
  const subtitle = getElementText('.playbar-subtitle')
  const coverArt = document.querySelector<HTMLImageElement>('.bg-playbar img')?.src

  const presenceData: PresenceData = {
    name: title,
    details: title,
    state: subtitle,
    type: ActivityType.Listening,
    largeImageKey: coverArt,
  }

  if (showLogo) {
    Object.assign(presenceData, {
      smallImageKey: ActivityAssets.Logo,
      smallImageUrl: 'https://untitled.stream',
      smallImageText: '[untitled]',
      largeImageText: 'Listening on [untitled]',
    })
  }

  const timestamp = getElementText('.timestamp').split(' / ')
  if (timestamp.length === 2) {
    const [currentTime, duration] = timestamp.map(timestampFromFormat);

    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(currentTime!, duration!)
  }

  presence.setActivity(presenceData)
})
