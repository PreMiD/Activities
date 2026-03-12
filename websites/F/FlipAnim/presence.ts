import { Assets } from 'premid'

const presence = new Presence({
  clientId: '642119548803219466',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/FlipAnim/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.hostname === 'flipanim.com') {
    if (document.location.pathname === '/') {
      presenceData.details = 'Viewing home page'
      presenceData.smallImageKey = Assets.Writing
    }
    else if (document.location.pathname.includes('/anim')) {
      presenceData.details = 'Viewing anim:'
      presenceData.state = `${
        document.querySelector('#mainDivActive > div:nth-child(6) > div')
          ?.textContent
      } by: ${
        document.querySelector(
          '#mainDivActive > div:nth-child(10) > div:nth-child(2) > div.anim_author > a:nth-child(1)',
        )?.textContent
      }`
      presenceData.smallImageKey = Assets.Reading
    }
    else if (document.location.pathname.includes('/profile')) {
      presenceData.details = 'Viewing profile of:'
      presenceData.state = document.querySelector(
        '#mainDivActive > div:nth-child(4) > div.profileAvatar > div.text_normal',
      )?.textContent
      presenceData.smallImageKey = Assets.Reading
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
