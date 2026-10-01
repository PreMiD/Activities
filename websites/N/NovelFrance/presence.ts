import { Assets, ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1549749315554123837',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const path = window.location.pathname
  const parts = path.split('/')

  // Home page
  if (path === '/') {
    presence.setActivity({
      type: ActivityType.Watching,
      details: 'Browsing NovelFrance',
      state: 'Home page',
      startTimestamp: browsingTimestamp,
      largeImageKey: 'https://i.imgur.com/ZndzvPu.png',
      largeImageText: 'NovelFrance',
      smallImageKey: Assets.Play,
    })

    return
  }

  // Get novel name
  if (parts[1] === 'novel' && parts[2]) {
    const novelName = parts[2]
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase())

    // Get novel cover from og:image
    const cover = document.querySelector(
      'meta[property="og:image"]',
    )?.getAttribute('content')

    // Chapter page
    if (parts[3]?.startsWith('chapter-')) {
      const chapter = parts[3].replace('chapter-', '')

      presence.setActivity({
        type: ActivityType.Watching,
        details: `Reading ${novelName}`,
        state: `Chapter ${chapter}`,
        startTimestamp: browsingTimestamp,
        largeImageKey: cover ?? Assets.Play,
        largeImageText: novelName,
        smallImageKey: Assets.Play,
      })

      return
    }

    // Novel page
    presence.setActivity({
      type: ActivityType.Watching,
      details: `Viewing ${novelName}`,
      state: 'Novel page',
      startTimestamp: browsingTimestamp,
      largeImageKey: cover ?? Assets.Play,
      largeImageText: novelName,
      smallImageKey: Assets.Play,
    })

    return
  }

  // Other pages
  presence.setActivity({
    type: ActivityType.Watching,
    details: 'Browsing NovelFrance',
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Play,
  })
})
