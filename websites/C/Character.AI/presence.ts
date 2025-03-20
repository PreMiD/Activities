const presence = new Presence({
  clientId: '939893082546114611',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/Character.AI/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const [time, buttons] = await Promise.all([
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('buttons'),
  ])
  const { pathname, href, origin } = document.location
  const button = {
    label: 'View Page',
    url: href,
  }

  switch (pathname.split('/')[1]) {
    case '': {
      presenceData.details = 'Browsing Homepage'
      break
    }
    case 'chat2': {
      presenceData.details = 'Chatting with'
      presenceData.state = document
        .querySelector('.swiper-no-swiping')
        ?.parentElement
        ?.firstChild
        ?.textContent
        ?.replace('c.ai', '')
      presenceData.buttons = [button]
      break
    }
    case 'chat': {
      presenceData.details = 'Chatting with'
      presenceData.state = document.querySelector('.chattitle')?.childNodes[1]?.textContent
        || document.title.split('|')[0]?.replace('Chat with', '').trim()
      presenceData.buttons = [button]
      break
    }
    case 'feed': {
      presenceData.details = 'Browsing feed'
      break
    }
    case 'post': {
      presenceData.details = 'Viewing post'
      presenceData.state = document.querySelector(
        `a[href^='${href.replace(origin, '')}']`,
      )?.textContent
      presenceData.buttons = [button]
      break
    }
    case 'public-profile': {
      presenceData.details = 'Viewing profile'
      presenceData.state = document.querySelector('span')?.childNodes[1]?.textContent
      presenceData.buttons = [button]
      break
    }
    case 'chats': {
      presenceData.details = 'Browsing chats'
      break
    }
    case 'profile': {
      const { pathname } = document.location
      presenceData.details = 'Viewing profile'
      presenceData.state = `for ${pathname.split('/')[2]}`
      break
    }
    case 'character': {
      presenceData.details = 'Creating character'
      break
    }
    case 'editing': {
      presenceData.details = 'Editing character'
      break
    }
  }

  if (!time) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  if (!buttons && presenceData.buttons)
    delete presenceData.buttons

  presence.setActivity(presenceData)
})
