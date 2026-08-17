import { Assets } from 'premid'

const presence = new Presence({
  clientId: '812176837748457483',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let user
presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/MKPC/assets/logo.jpeg',
    startTimestamp: browsingTimestamp,
  }

  if (
    document.location.pathname === '/'
    || document.location.pathname === '/index.php'
    || document.location.pathname === '/fr.php'
    || document.location.pathname === '/en.php'
  ) {
    presenceData.details = 'Viewing home page'
  }
  else if (document.location.pathname === '/forum.php') {
    presenceData.details = 'Viewing the Forum\'s menu'
    presenceData.smallImageKey = Assets.Search
    presenceData.buttons = [
      { label: 'View Forum', url: document.location.href },
    ]
  }
  const elt = document.querySelector('#compteur0 > div') as HTMLElement
  if (elt) {
    presenceData.details = `Lap ${elt.textContent?.replace(/.+? /g, '')}`
    presenceData.buttons = [
      { label: 'Play Game', url: 'https://mkpc.malahieude.net/mariokart.php' },
    ]
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/MKPC/assets/0.png'
  }
  else {
    switch (document.location.pathname) {
      case '/mariokart.php': {
        presenceData.details = 'browsing map\'s'
        presenceData.smallImageKey = Assets.Search

        break
      }
      case '/category.php': {
        user = document.querySelector('html > body > main > h1')
        presenceData.details = `Viewing the following category: ${user?.textContent}`
        presenceData.smallImageKey = Assets.Search
        presenceData.buttons = [
          { label: 'View category', url: document.location.href },
        ]

        break
      }
      case '/topic.php': {
        user = document.querySelector('html > body > main > h1')
        presenceData.details = `Viewing: ${user?.textContent}`
        presenceData.smallImageKey = Assets.Search
        presenceData.buttons = [
          { label: 'View topic', url: document.location.href },
        ]

        break
      }
      case '/ban-player.php':
      case '/admin.php':
      case 'doublecomptes.php': {
        presenceData.details = 'Viewing staff backend'
        break
      }
      case '/profil.php': {
        user = document.querySelector(
          'body > main > div > div.profile-summary > h1',
        )
        presenceData.details = `Viewing: ${user?.textContent}`
        presenceData.smallImageKey = Assets.Search
        presenceData.buttons = [
          { label: 'View profile', url: document.location.href },
        ]

        break
      }
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
