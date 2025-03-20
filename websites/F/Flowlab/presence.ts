const presence = new Presence({ clientId: '991160367629750372' })
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/Flowlab/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, hostname } = document.location

  if (hostname === 'flowlab.io') {
    switch (pathname) {
      case '/': {
        presenceData.details = 'Viewing home page'
        break
      }
      case '/game/list': {
        presenceData.details = 'Viewing their games'
        break
      }
      case '/game/browse': {
        presenceData.details = 'Viewing games page'
        break
      }
    }
  }
  if (pathname.includes('/profile')) {
    presenceData.details = `Viewing ${document
      .querySelectorAll('.username')
      .item(0)
      ?.textContent
      ?.trim()}'s profile`
  }
  else if (pathname.includes('/view/')) {
    presenceData.details = `Editing "${
      document.querySelector('#game_title')?.textContent
    }"`
    presenceData.state = document.querySelector('#game_author')?.textContent
  }
  else if (pathname.includes('/play/')) {
    presenceData.details = `Playing "${document.querySelector('#game_title')?.textContent}"`
    presenceData.state = `${document.querySelector('#game_author')?.textContent}`
  }
  else if (pathname === '/resources') {
    presenceData.details = 'Viewing Flowlab examples'
  }
  else if (pathname === '/lab/blog/') {
    presenceData.details = 'Viewing Flowlab blog'
  }
  else if (pathname.includes('/blog/')) {
    presenceData.state = 'Reading blog entry'
    presenceData.details = document
      .querySelectorAll('.display-2.text-white')
      .item(0)
      .textContent
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
