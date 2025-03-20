import {
  Details,
  format,
  getRenderingState,
  Icons,
  ImageTexts,
  States,
} from './shared.js'

const presence = new Presence({ clientId: '1241878965535248527' })
const browsingTimestamp = Math.floor(Date.now() / 1000)

let legacyData: PresenceData = {
  details: '',
  state: '',
}

// CM3 and CM2 are built inside iframes, unlike Gen4
presence.on('iFrameData', (data: unknown) => {
  legacyData = data as typeof legacyData
})

presence.on('UpdateData', async () => {
  // Default presence data
  const presenceData: PresenceData = {
    largeImageKey: Icons.Discord,
    startTimestamp: browsingTimestamp,
    details: Details.Website,
  }

  // The order in which the URL is checked matters here
  if (document.location.hostname === 'app.panzoid.com')
    getGen4Data(presenceData)
  else if (document.location.pathname.startsWith('/community'))
    presenceData.details = Details.Community
  else if (document.location.pathname.includes('/backgrounder'))
    presenceData.details = Details.Backgrounder
  else if (document.location.pathname.includes('/videoeditor'))
    presenceData.details = Details.VideoEditor
  else if (document.location.pathname.includes('/gen1'))
    presenceData.details = Details.CM1
  else if (document.location.pathname.includes('/clipmaker'))
    getLegacyData(presenceData)

  // Finally set the presence
  presence.setActivity(presenceData)
})

function getGen4Data(presenceData: PresenceData): void {
  presenceData.smallImageKey = Icons.Gen4
  presenceData.smallImageText = ImageTexts.Gen4

  if (document.location.pathname.startsWith('/edit'))
    getGen4EditorData(presenceData)
  else getGen4MenuData(presenceData)
}

function getGen4EditorData(presenceData: PresenceData): void {
  // Look for the project name
  const projectNameInput = document.querySelector<HTMLInputElement>(
    '.editortabs-name > input',
  )

  // Project name not found means the editor is still loading
  if (projectNameInput === null) {
    presenceData.details = Details.Gen4Loading
    return
  }
  else {
    presenceData.details = format(
      Details.Gen4Editor,
      projectNameInput.value.trim(),
    )
  }

  const renderingState = getRenderingState()

  // Check if rendering is running or not
  if (renderingState !== null) {
    presenceData.state = renderingState
  }
  else {
    presenceData.state = format(
      States.Gen4Editor,
      document.querySelectorAll('.trackTimeline-track').length,
      document.querySelectorAll('.clip:not(.empty)').length,
    )
  }
}

function getGen4MenuData(presenceData: PresenceData): void {
  presenceData.details = Details.Gen4Menu

  // Get the total number of projects
  presenceData.state = format(
    States.Gen4Menu,
    document.querySelectorAll('button[class*=projectItem]').length,
  )
}

function getLegacyData(presenceData: PresenceData): void {
  // See iframe.ts for CM3 and CM2 specifically
  presenceData.details = legacyData.details
  presenceData.state = legacyData.state
  presenceData.smallImageKey = Icons.Legacy
  presenceData.smallImageText = ImageTexts.Legacy
}
