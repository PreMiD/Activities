import { Details, format, getRenderingState, States } from './shared.js'

const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const presenceData: PresenceData = {}

  if (document.location.pathname === '/legacy/gen3/clipmaker.html')
    getCM3Data(presenceData)
  else if (document.location.pathname === '/legacy/gen2/clipmaker.html')
    getCM2Data(presenceData)

  // Trigger the iframe event in presence.ts
  iframe.send(presenceData)
})

function getCM3Data(presenceData: PresenceData): void {
  presenceData.details = Details.CM3
  const renderingState = getRenderingState()

  // Check if rendering is running or not
  if (renderingState !== null) {
    presenceData.state = renderingState
  }
  else {
    // Get the number of tracks and the number of clips
    presenceData.state = format(
      States.CM3,
      document.querySelectorAll('span.noselect').length,
      document.querySelectorAll('.clip').length,
    )
  }
}

function getCM2Data(presenceData: PresenceData): void {
  presenceData.details = Details.CM2
  const renderingState = getRenderingState()

  // Check if rendering is running or not
  if (renderingState !== null) {
    presenceData.state = renderingState
  }
  else {
    // Get the number of objects and the number of effects
    presenceData.state = format(
      States.CM2,
      document.querySelectorAll(
        '#controls > div:nth-child(4) > ul.pz-listbox > li',
      ).length,
      document.querySelectorAll(
        '#controls > div:nth-child(5) > ul.pz-listbox > li',
      ).length,
    )
  }
}
