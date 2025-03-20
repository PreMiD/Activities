import { Assets } from 'premid'

const presence = new Presence({
  clientId: '761617743593209869',
})

function getTime() {
  const time = document
    .querySelector('.vjs-current-time-display')
    ?.textContent
    ?.split(':')
    .map(n => Number(n)) ?? []
  if (time.length === 3)
    return Date.now() - (time[0]! * 3600 + time[1]! * 60 + time[2]!) * 1000
  else return Date.now() - (time[0]! * 60 + time[1]!) * 1000
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/I/Invidious/assets/logo.png',
    smallImageKey: 'https://cdn.rcd.gg/PreMiD/websites/I/Invidious/assets/0.png',
  }
  let clear = false

  const privacy = await presence.getSetting<boolean>('privacy')

  switch (document.location.pathname.replace('/feed', '').split('/')[1]) {
    case '':
    case 'popular':
      presenceData.details = 'Browsing popular videos'
      break

    case 'trending':
      presenceData.details = 'Browsing trending videos'
      break

    case 'subscriptions':
    case 'subscription_manager':
      presenceData.details = 'Browsing subscriptions'
      break

    case 'view_all_playlists':
      presenceData.details = 'Browsing playlists'
      break

    case 'history':
      presenceData.details = 'Browsing watch history'
      break

    case 'change_password':
    case 'clear_watch_history':
    case 'data_control':
    case 'delete_account':
    case 'licenses':
    case 'preferences':
    case 'privacy':
    case 'token_manager':
      presenceData.details = 'Managing preferences'
      break

    case 'watch':
      if (!privacy) {
        presenceData.smallImageKey = document.querySelector('.vjs-playing')
          ? Assets.Play
          : Assets.Pause
        presenceData.details = document.querySelector('h1')?.textContent?.trim()
        presenceData.state = document.querySelector('#channel-name')?.textContent
        if (document.querySelector('.vjs-playing'))
          presenceData.startTimestamp = getTime()
      }
      break

    case 'playlist':
      presenceData.details = 'Viewing playlist'
      if (!privacy)
        presenceData.state = document.querySelector('h3')?.textContent
      break

    case 'channel':
      presenceData.details = 'Viewing channel'

      if (!privacy) {
        presenceData.state = document
          .querySelector('.channel-profile')
          ?.textContent
          ?.trim()
      }

      break

    default:
      clear = true
      break
  }

  if (clear)
    presence.setActivity()
  else presence.setActivity(presenceData)
})
