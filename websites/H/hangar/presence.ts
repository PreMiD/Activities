import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1004301145348526090',
})

const startTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const title = document.title || 'Hangar'
  const path = window.location.pathname

  const data: PresenceData = {
    type: ActivityType.Playing,
    largeImageKey: 'https://i.imgur.com/w5FbdFC.png',
    startTimestamp,
    details: 'Browsing Hangar',
    state: 'Viewing pages',
  }

  if (path === '/' || path === '/feed') {
    data.details = 'Browsing the homepage'
    data.state = 'Viewing the feed'
  }
  else if (path.startsWith('/hub/')) {
    const hubName = title.split(' | ')[0] || 'A Hub'

    data.details = 'Viewing a Hub'
    data.state = hubName
    data.smallImageKey = 'https://i.imgur.com/w5FbdFC.png'
    data.smallImageText = 'Hangar'
  }
  else if (path.startsWith('/profile/')) {
    const user = title.split(' | ')[0] || 'A profile'

    data.details = 'Viewing a profile'
    data.state = user
  }
  else if (path.startsWith('/post/')) {
    const postTitle = title.split(' | ')[0] || 'A post'

    data.details = 'Reading a post'
    data.state = postTitle
  }

  presence.setActivity(data)
})
