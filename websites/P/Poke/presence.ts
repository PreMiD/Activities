import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1188371319776100463',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/Poke/assets/logo.png',
  }
  let clear = false

  switch (document.location.pathname.replace('/feed', '').split('/')[1]) {
    case '':
    case 'app':
      presenceData.details = 'Browsing trending videos'
      break

    case 'my-acc':
      presenceData.details = 'Browsing subscriptions'
      break

    case 'license':
    case 'privacy':
      presenceData.details = 'Managing preferences'
      break

    case 'watch': {
      presenceData.smallImageKey = document.querySelector('video')
        && !document.querySelector('video')?.paused
        ? Assets.Play
        : Assets.Pause
      const videoTitleElement = document.querySelector('.video-title.t')
      presenceData.details = videoTitleElement
        ? videoTitleElement.textContent?.trim()
        : 'No Title Available'

      const channelNameElement = document.querySelector(
        '.video-info-pill-channelname',
      )
      presenceData.state = channelNameElement
        ? channelNameElement.textContent?.trim()
        : 'No Channel Name Available'
      const videoPlayer = document.querySelector('video')

      if (videoPlayer && !videoPlayer.paused) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(document.querySelector('video')!)
      }
      break
    }
    case 'channel': {
      const nameElement = document.querySelector('.name p')
      presenceData.details = 'Viewing channel'
      presenceData.state = nameElement
        ? nameElement.textContent?.trim()
        : 'No Name Available'
      break
    }
    default:
      clear = true
      break
  }

  if (clear)
    presence.setActivity()
  else presence.setActivity(presenceData)
})
