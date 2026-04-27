const presence = new Presence({
  clientId: '1498049243368390736',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const path = document.location.pathname

  let details = 'Using ccLeaf'
  let state = 'In the app'

  if (path === '/animations') {
    details = 'Browsing animations'
    state = 'Looking for templates'
  }
  else if (/^\/animations\/\d+\/.+/.test(path)) {
    details = 'In the editor'
    state = 'Editing an animation'
  }

  presence.setActivity({
    details,
    state,
    startTimestamp: browsingTimestamp,
    largeImageKey: 'ccleaf',
  })
})
