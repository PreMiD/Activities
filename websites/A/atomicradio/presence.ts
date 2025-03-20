import { Assets } from 'premid'

const presence = new Presence({
  clientId: '904084297831571518',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/atomicradio/assets/logo.png',
    smallImageKey: Assets.Search,
    startTimestamp: browsingTimestamp,
  }
  const player = document.querySelector<HTMLDivElement>('div.player')

  if (player) {
    presenceData.largeImageKey = player.querySelector('#artwork')?.textContent
    presenceData.smallImageKey = player.querySelector<HTMLButtonElement>('[id*="-button"]')?.id
      === 'play-button'
      ? Assets.Play
      : Assets.Pause
    presenceData.details = player.querySelector<HTMLAnchorElement>('div.track-title')?.textContent
    presenceData.state = player.querySelector<HTMLDivElement>('div.track-artist')?.textContent
    presenceData.endTimestamp = new Date(
      player.querySelector('#endingAt')?.textContent ?? '',
    ).getTime()
    presenceData.smallImageText = player.querySelector('div.track-space')?.textContent
    presenceData.buttons = [
      {
        label: 'Listen',
        url: `https://atomic.radio/${player.querySelector('#spaceId')?.textContent ?? ''}`,
      },
    ]
  }
  else {
    presenceData.details = 'Browsing...'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
