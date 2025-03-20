import { Assets } from 'premid'

const presence = new Presence({
  clientId: '630896385889271819',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/Messenger/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const [messageRecipient, callRecipient] = await Promise.all([
    presence.getSetting<boolean>('message'),
    presence.getSetting<boolean>('call'),
  ])

  if (document.location.pathname.includes('/groupcall/')) {
    const users = document
      .querySelector('div > div > span')
      ?.textContent
      ?.split(', ')
      ?.slice(1)
    if (users) {
      if (new URLSearchParams(location.search).get('has_video') === 'true') {
        presenceData.details = 'In a video call with:'
        presenceData.smallImageKey = Assets.VideoCall
      }
      else {
        presenceData.details = 'In a call with:'
        presenceData.smallImageKey = Assets.Call
      }
      presenceData.state = callRecipient ? users.join(', ') : '(Hidden)'
    }
    else if (document.querySelector('span')?.textContent) {
      presenceData.details = 'In a Messenger room'
      presenceData.smallImageKey = Assets.Call
    }
    else {
      presenceData.details = 'Joining a call...'
    }
  }
  else if (document.location.pathname.includes('/t/')) {
    if (!document.querySelector('[data-text="true"]')?.textContent) {
      presenceData.details = 'Reading messages from:'
      presenceData.smallImageKey = Assets.Reading
    }
    else {
      presenceData.details = 'Writing to:'
      presenceData.smallImageKey = Assets.Writing
    }
    presenceData.state = messageRecipient
      ? document.querySelector('div.t6p9ggj4.tkr6xdv7 span > span')
        ?.textContent ?? 'Unknown'
      : '(Hidden)'
  }
  else if (document.location.pathname.includes('/new')) {
    presenceData.details = 'Composing a new message'
    presenceData.smallImageKey = Assets.Writing
  }
  else if (document.location.pathname.includes('/about')) {
    presenceData.details = 'Viewing the about page'
  }

  presence.setActivity(presenceData)
})
