import { Assets } from 'premid'

const presence = new Presence({ clientId: '906057236927893576' })
const browsingStamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/MangaLife/assets/logo.png',
  LogoPng = 'https://cdn.rcd.gg/PreMiD/websites/M/MangaLife/assets/0.png',
  Subscriptions = 'https://cdn.rcd.gg/PreMiD/websites/M/MangaLife/assets/1.png',
  Discussions = 'https://cdn.rcd.gg/PreMiD/websites/M/MangaLife/assets/2.png',
  Contact = 'https://cdn.rcd.gg/PreMiD/websites/M/MangaLife/assets/3.png',
  Privacy = 'https://cdn.rcd.gg/PreMiD/websites/M/MangaLife/assets/4.png',
  Hot = 'https://cdn.rcd.gg/PreMiD/websites/M/MangaLife/assets/5.png',
  Bookmark = 'https://cdn.rcd.gg/PreMiD/websites/M/MangaLife/assets/6.png',
  Home = 'https://cdn.rcd.gg/PreMiD/websites/M/MangaLife/assets/7.png',
  Settings = 'https://cdn.rcd.gg/PreMiD/websites/M/MangaLife/assets/8.png',
}

presence.on('UpdateData', async () => {
  const [privacy, cover, timestamps, buttons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('buttons'),
  ])
  const path = document.location.pathname
  const pages: Record<string, PresenceData> = {
    '/manga/': {
      details: 'Viewing a Manga...',
      state: document.title.split(' | MangaLife')[0],
    },
    '/read-online/': {
      smallImageKey: Assets.Reading,
    },
    '/search': {
      smallImageKey: Assets.Search,
      details: 'Searching...',
    },
    '/discussion': {
      smallImageKey: !privacy ? ActivityAssets.Discussions : '',
      state: 'Discussions',
    },
    'hot.php': {
      smallImageKey: !privacy ? ActivityAssets.Hot : '',
      state: 'Hot Manga Updates',
      buttons: [{ label: 'Hot Manga Updates', url: `${document.location}` }],
    },
    'subscription.php': {
      smallImageKey: !privacy ? ActivityAssets.Subscriptions : '',
      state: 'Subscriptions',
    },
    'feed.php': {
      smallImageKey: !privacy ? ActivityAssets.Subscriptions : '',
      state: 'Subscriptions Feed',
    },
    'bookmark.php': {
      smallImageKey: !privacy ? ActivityAssets.Bookmark : '',
      state: 'Bookmarks',
    },
    'settings.php': {
      smallImageKey: ActivityAssets.Settings,
      details: 'Editing...',
      state: 'User Settings',
    },
    '/contact': {
      smallImageKey: !privacy ? ActivityAssets.Contact : '',
      state: 'Contact Page',
    },
    '/privacy': {
      smallImageKey: !privacy ? ActivityAssets.Privacy : '',
      state: 'Privacy Policy Page',
    },
  }
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: !privacy ? ActivityAssets.Home : '',
    details: 'Browsing...',
    state: 'Home Page',
    startTimestamp: browsingStamp,
  }

  for (const [path, data] of Object.entries(pages)) {
    if (
      document.location.pathname.startsWith(path)
      || document.location.pathname.includes(path)
    ) {
      presenceData = { ...presenceData, ...data } as PresenceData
    }
  }

  switch (true) {
    case path.startsWith('/manga/'):
      presenceData.largeImageKey = !privacy && cover
        ? `https://temp.compsci88.com/cover/${path.split('/manga/')[1]}.jpg`
        : ActivityAssets.Logo
      presenceData.smallImageKey = !privacy && cover ? ActivityAssets.LogoPng : Assets.Search
      presenceData.buttons = [
        {
          label: (presenceData.state as string).length >= 30
            ? 'View Manga'
            : presenceData.state as string,
          url: `${document.location}`,
        },
      ]
      break
    case path.startsWith('/read-online/'):
      presenceData.largeImageKey = !privacy && cover
        ? `https://temp.compsci88.com/cover/${
          path.split('/read-online/')[1]?.split('-chapter-')[0]
        }.jpg`
        : ActivityAssets.Logo
      presenceData.details = !privacy
        ? document.querySelector('.col-12 > a')?.textContent?.trim()
        : 'Reading a Manga...'
      presenceData.state = path.includes('-page-')
        ? `Chapter ${path.split('-chapter-')[1]?.split('-page-')[0]} | Page ${
          path.split('-page-')[1]?.split('.html')[0]
        }`
        : `Chapter ${path.split('-chapter-')[1]?.split('.html')[0]}`
      presenceData.buttons = [
        {
          label: (presenceData.details ?? '').length >= 30
            ? 'View Manga'
            : presenceData.details as string,
          url: `${document.location.origin}/manga/${
            path.split('/read-online/')[1]?.split('-chapter-')[0]
          }`,
        },
        {
          label: `${presenceData.state.replace(/\|/g, ' ')}`,
          url: `${document.location}`,
        },
      ]
      break
    case path.startsWith('/search'):
      // todo show state as search query, for now just delete state
      delete presenceData.state
      break
  }

  if (!timestamps)
    delete presenceData.startTimestamp
  if (privacy)
    delete presenceData.state
  if (privacy || !buttons)
    delete presenceData.buttons
  if (privacy && !presenceData.smallImageKey)
    delete presenceData.smallImageKey

  presence.setActivity(presenceData)
})
