import { Assets } from 'premid'

const presence = new Presence({
  clientId: '691669470057594940',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Senpa.io/assets/logo.png',
  }

  if (document.location.host.split('.')[0] !== 'forum') {
    if (document.location.pathname === '/') {
      presenceData.details = 'Home'
    }
    else if (document.location.pathname.includes('/web/')) {
      const profile = JSON.parse(localStorage.getItem('senpaio:profiles')!)
      presenceData.details = `Playing on server : ${localStorage.getItem(
        'senpaio:region',
      )} ${localStorage.getItem('senpaio:server')} | ${
        document.querySelector('#room-stats-hud')?.textContent
      }`
      presenceData.state = `Player : ${profile.tag === '' ? '' : `[${profile.tag}]`} ${
        profile.list[profile.selected].nick === ''
          ? 'no nick'
          : profile.list[profile.selected].nick
      }` + ` | ${document.querySelector('#stats-hud')?.textContent}`
      presenceData.startTimestamp = browsingTimestamp
    }
    else {
      [, presenceData.details] = document
        .querySelector('title')
        ?.textContent
        ?.split('-') ?? []
      presenceData.smallImageKey = Assets.Reading
    }

    if (!presenceData.details) {
      presence.setActivity()
    }
    else {
      if (!presenceData.state)
        presenceData.state = 'Navigating...'
      presence.setActivity(presenceData)
    }
  }
})
