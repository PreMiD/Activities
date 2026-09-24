const presence = new Presence({
  clientId: '1522265954686337255',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  const data: PresenceData = {
    startTimestamp: browsingTimestamp,
  }

  if (pathname === '/') {
    data.details = 'Viewing the homepage'
    data.state = 'SLAAYD WIDGETS'
  }
  else {
    data.details = 'Browsing SLAAYD WIDGETS'
    data.state = document.title
  }

  presence.setActivity(data)
})
