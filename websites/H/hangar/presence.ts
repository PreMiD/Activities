const presence = new Presence({
  clientId: '1003332362823802949'
})

const startTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const title = document.title || 'Hangar'
  const path = window.location.pathname

  let presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: 'logo',
    largeImageText: 'usehangar.gg',
    startTimestamp,
    details: 'Browsing Hangar',
    state: 'Viewing pages'
  }

  if (path === '/' || path === '/feed') {
    presenceData.details = 'Browsing the homepage'
    presenceData.state = 'Viewing the feed'
  }

  else if (path.startsWith('/hub/')) {
    const hubName = title.split(' | ')[0] || 'A Hub'

    presenceData = {
      type: ActivityType.Watching,
      largeImageKey: 'logo',
      largeImageText: 'usehangar.gg',
      startTimestamp,
      details: 'Viewing a Hub',
      state: hubName,
      smallImageKey: 'logo',
      smallImageText: 'Hangar'
    }
  }

  else if (path.startsWith('/profile/')) {
    const user = title.split(' | ')[0] || 'A profile'

    presenceData = {
      type: ActivityType.Watching,
      largeImageKey: 'logo',
      largeImageText: 'usehangar.gg',
      startTimestamp,
      details: 'Viewing a profile',
      state: user
    }
  }

  else if (path.startsWith('/post/')) {
    const postTitle = title.split(' | ')[0] || 'A post'

    presenceData = {
      type: ActivityType.Watching,
      largeImageKey: 'logo',
      largeImageText: 'usehangar.gg',
      startTimestamp,
      details: 'Reading a post',
      state: postTitle
    }
  }

  presence.setActivity(presenceData)
})
