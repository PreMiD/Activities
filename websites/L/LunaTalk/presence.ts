const presence = new Presence({
  clientId: '1480793340931735552',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://i.urusai.cc/9daCG.png',
    startTimestamp: browsingTimestamp,
  }

  const path = document.location.pathname
  const search = document.location.search

  if (path.includes('/pages/chat/chat') && search.includes('roleId=')) {
    presenceData.details = 'In a conversation'

    const roleNameElement = document.querySelector('.role-name')
    if (roleNameElement && roleNameElement.textContent) {
      const roleName = roleNameElement.textContent.trim()
      presenceData.state = `Chatting with ${roleName}`
    }
    else {
      presenceData.state = 'Chatting with AI'
    }

    const avatarImg = document.querySelector('img[src*="objects.lunatalk.ai"]')
    if (avatarImg) {
      const avatarUrl = avatarImg.getAttribute('src')
      if (avatarUrl) {
        presenceData.largeImageKey = avatarUrl
        presenceData.smallImageKey = 'https://i.urusai.cc/9daCG.png'
        presenceData.smallImageText = 'LunaTalk'
      }
    }
  }
  else {
    presenceData.details = 'Browsing the website'
    presenceData.state = 'Looking for a character on the home page'
  }

  presence.setActivity(presenceData)
})
