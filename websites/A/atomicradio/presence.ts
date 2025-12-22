import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '904084297831571518',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/atomicradio/assets/logo.png',
    smallImageKey: Assets.Search,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Listening,
  }
  const player = document.querySelector<HTMLDivElement>('div.player')

  const currentSpaceItem = localStorage.getItem('currentSpace')
  if (player && currentSpaceItem) {
    const currentSpace = JSON.parse(currentSpaceItem)
    presenceData.largeImageKey = currentSpace.current_track.artwork
    presenceData.smallImageKey = player.querySelector<HTMLButtonElement>('[id*="-button"]')?.id
      === 'play-button'
      ? Assets.Play
      : Assets.Pause
    presenceData.details = currentSpace.current_track.title
    presenceData.state = currentSpace.current_track.artist
    presenceData.startTimestamp = Math.floor(new Date(currentSpace.current_track.startingAt).getTime() / 1000)
    presenceData.endTimestamp = Math.floor(new Date(currentSpace.current_track.endingAt).getTime() / 1000)
    presenceData.smallImageText = currentSpace.name
    presenceData.buttons = [
      {
        label: 'Listen',
        url: `https://atomic.radio/${currentSpace.id}`,
      },
    ]
  }
  else if (document.location.pathname === '/') {
    presenceData.details = 'Browsing spaces...'
  }
  else {
    presenceData.details = `Browsing ${document.location.pathname.split('/').at(-1)}...`
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
