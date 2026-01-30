import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1464240194999025685',
})

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://raw.githubusercontent.com/excalidraw/excalidraw/refs/heads/master/public/android-chrome-512x512.png',
    name: 'Excalidraw',
  }

  const hash = document.location.hash

  if (hash.startsWith('#room=')) {
    presenceData.details = 'Collaborating'
    presenceData.state = 'In a shared room'
    presenceData.smallImageKey = Assets.Writing
  }
  else {
    presenceData.details = 'Creating a sketch'
    presenceData.state = 'On the whiteboard'
    presenceData.smallImageKey = Assets.Writing
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
