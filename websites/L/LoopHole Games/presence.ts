const presence = new Presence({
  clientId: '1571240539536367626',
})

// Set by the site on every page (js/lh-presence.js on loopholegames.co.uk)
interface LoopHolePage {
  kind: 'home' | 'game' | 'gamepage' | 'stats' | 'other'
  id: string | null
  game: string
  image: string
  url: string
  details: string
  state: string
  partyUrl: string
  partySize: number
  partyMax: number
  since: number
}

const LOGO = 'https://loopholegames.co.uk/assets/discord/loophole.png'
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const [showDetails, showButtons, showTimestamp] = await Promise.all([
    presence.getSetting<boolean>('showDetails'),
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showTimestamp'),
  ])
  const { LH_PRESENCE: page } = await presence.getPageVariable<{ LH_PRESENCE?: LoopHolePage }>('LH_PRESENCE')

  const presenceData: PresenceData = {
    largeImageKey: LOGO,
    largeImageText: 'LoopHole Games',
    details: 'Browsing the arcade',
    startTimestamp: browsingTimestamp,
  }

  if (page?.game && page.kind === 'game') {
    presenceData.name = page.game
    presenceData.largeImageKey = page.image
    presenceData.largeImageText = page.game
    presenceData.details = showDetails && page.details ? page.details : `Playing ${page.game}`
    if (showDetails && page.state)
      presenceData.state = page.state
    presenceData.startTimestamp = Math.floor(page.since / 1000)

    if (showButtons) {
      const buttons: [ButtonData, ButtonData?] = [
        { label: `Play ${page.game}`.slice(0, 32), url: page.url },
      ]
      if (page.partyUrl) {
        buttons.push({
          label: `Join Party (${page.partySize}/${page.partyMax})`,
          url: page.partyUrl,
        })
      }
      presenceData.buttons = buttons
    }
  }
  else if (page?.game && page.kind === 'gamepage') {
    presenceData.largeImageKey = page.image
    presenceData.largeImageText = page.game
    presenceData.details = 'Looking at a game'
    presenceData.state = page.game
    if (showButtons)
      presenceData.buttons = [{ label: `Play ${page.game}`.slice(0, 32), url: page.url }]
  }
  else if (page?.kind === 'stats') {
    presenceData.details = 'Viewing the arcade stats'
  }

  if (!showTimestamp)
    delete presenceData.startTimestamp

  presence.setActivity(presenceData)
})
