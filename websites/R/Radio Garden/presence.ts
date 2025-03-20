import { Assets } from 'premid'

const presence = new Presence({
  clientId: '687070418804408445', // The client ID of the Application created at https://discordapp.com/developers/applications
})
const elapsed = Math.floor(Date.now() / 1000)

let details: string, state: string, currentState: string | undefined | null

presence.on('UpdateData', async () => {
  if (!document.title.includes('Explore live radio by rotating')) {
    details = document
      .querySelector('[class*="_channel_"]')
      ?.querySelector('[class*="_title_"]')
      ?.textContent ?? 'Unknown Radio' // which radio we're tuning right now
    state = document
      .querySelector('[class*="_channel_"]')
      ?.querySelector('[class*="_subtitle_"]')
      ?.textContent
      ?? 'Unknown State/Country' // the state where the radio serves

    const presenceData: PresenceData = {
      details,
      state,
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/Radio%20Garden/assets/logo.png',
      startTimestamp: elapsed,
    }
    currentState = document
      .querySelector('[class*=\'_modPlay_\']')
      ?.getAttribute('aria-label') // get current state of the "button", not the "player", except when loading
    if (currentState) {
      switch (currentState) {
        case 'stop': {
          // currently playing
          presenceData.smallImageKey = Assets.Play
          presenceData.smallImageText = 'Playing'
          presenceData.details = details
          presenceData.state = state
          presenceData.buttons = [
            { label: 'Listen', url: document.location.href },
          ]
          break
        }
        case 'loading': {
          // currently loading
          presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/R/Radio%20Garden/assets/0.gif'
          presenceData.smallImageText = 'Tuning'
          presenceData.details = 'Tuning'
          delete presenceData.startTimestamp
          delete presenceData.state
          delete presenceData.buttons

          break
        }
        case 'play': {
          // currently stopped
          presenceData.smallImageKey = Assets.Stop
          presenceData.smallImageText = 'Stopped'
          presenceData.details = 'Stopped'
          delete presenceData.startTimestamp
          delete presenceData.state
          delete presenceData.buttons

          break
        }
      }
    }
    presence.setActivity(presenceData)
  }
})
