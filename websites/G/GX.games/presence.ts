const presence = new Presence({
  clientId: '873897838260678666',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/G/GX.games/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const [buttons, cover, time] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('time'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location

  switch (
    document.querySelector('footer button')?.textContent === 'English'
      ? pathname.split('/')[1]
      : pathname.split('/')[2]
  ) {
    case '': {
      presenceData.details = 'Browsing games'
      break
    }
    case 'discover': {
      presenceData.details = 'Searching games'
      break
    }
    case 'tags': {
      presenceData.details = 'Browsing tag'
      presenceData.state = document.querySelector('main > div')?.textContent
      break
    }
    case 'feed': {
      presenceData.details = 'Browsing feed'
      presenceData.state = document.querySelector('main > div')?.textContent
      break
    }
    case 'games': {
      const tags = document.querySelectorAll('[href*=\'tagAlias\'] > span')
      presenceData.details = document.querySelector('h3')
      presenceData.state = `${tags[0]?.textContent}, ${tags[1]?.textContent}, ${tags[2]?.textContent}`
      presenceData.buttons = [{ label: 'View Game', url: href }]
      if (cover) {
        presenceData.largeImageKey = document.querySelector<HTMLMetaElement>(
          'meta[property=\'og:image\']',
        )?.content
      }
      break
    }
    case 'challenges': {
      presenceData.details = document.querySelector('h3')
      presenceData.state = `Challenge: ${
        document.querySelector('main h6')?.textContent
      }`
      presenceData.buttons = [{ label: 'View Game', url: href }]
      if (cover) {
        presenceData.largeImageKey = document.querySelector<HTMLMetaElement>(
          'meta[property=\'og:image\']',
        )?.content
      }
      break
    }
    case 'library': {
      presenceData.details = 'Viewing library'
      presenceData.state = document
        .querySelector('h1')
        ?.textContent
        ?.split(' - ')[1]
      break
    }
    case 'studios': {
      presenceData.details = 'Viewing studio'
      presenceData.state = `${
        document.querySelector('main [href=\'/\'] ')?.parentElement?.lastChild?.textContent
      }`
      presenceData.buttons = [{ label: 'View Page', url: href }]
      break
    }
    case 'profile': {
      presenceData.details = 'Viewing their profile'
      break
    }
    case 'messages': {
      presenceData.details = 'Viewing messages'
      break
    }
  }

  if (!buttons)
    delete presenceData.buttons
  if (!time) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  presence.setActivity(presenceData)
})
