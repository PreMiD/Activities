import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1460511327771426848',
})

enum ActivityAssets {
  Settings = 'https://raw.githubusercontent.com/nikovaxx/Pics/refs/heads/main/Settings.png',
  Notification = 'https://raw.githubusercontent.com/nikovaxx/Pics/refs/heads/main/Notification.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://raw.githubusercontent.com/sirschubert/assets/refs/heads/main/assets/communityIcon_p626ghkfd91g1.png',
  }

  const { pathname, search } = document.location
  const searchParams = new URLSearchParams(search)
  const tab = searchParams.get('tab')?.toLowerCase()
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/'

  const mangaName = document.querySelector('.title')?.textContent?.trim() || 'Manga'
  const rawString = document.querySelector('.number')?.textContent?.trim()
  const groupName = document.querySelector('.user-name')?.textContent?.trim()
  const chapter = rawString?.split('/')[0]?.replace('Ch. ', '')?.trim()

  const getImg = (selector: string) => {
    const el = document.querySelector(selector)
    const src = el?.getAttribute('data-src') || el?.getAttribute('src')
    return src ? new URL(src, document.location.href).href : null
  }

  const poster = getImg('.poster div img') || getImg('.poster img')
  const readerPoster = getImg('.d-none img') || getImg('.reader-image img')

  if (pathname === '/') {
    presenceData.state = 'Stepping into magical world...'
  }
  else if (pathname === '/home') {
    presenceData.state = 'Browsing homepage...'
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname === '/genres') {
    presenceData.details = 'Browsing genres...'
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname === '/groups/popular') {
    presenceData.details = 'Browsing popular groups...'
    presenceData.smallImageKey = Assets.Search
  }
  else if (/\/groups\/\d+/.test(pathname)) {
    presenceData.details = `Watching at '${groupName || 'Unknown'}' group`
  }
  else if (normalizedPathname === '/user') {
    presenceData.details = 'Editing profile...'
    presenceData.smallImageKey = ActivityAssets.Settings
  }
  else if (normalizedPathname === '/user/notifications') {
    if (tab === 'chapter') {
      presenceData.details = 'Viewing chapter notifications...'
      presenceData.smallImageKey = ActivityAssets.Notification
    }
    else if (tab === 'community') {
      presenceData.details = 'Viewing community notifications...'
      presenceData.smallImageKey = ActivityAssets.Notification
    }
    else {
      presenceData.details = 'Viewing chapter notifications...'
      presenceData.smallImageKey = ActivityAssets.Notification
    }
  }
  else if (normalizedPathname === '/user/history') {
    presenceData.details = 'Viewing reading history...'
    presenceData.smallImageKey = Assets.Viewing
  }
  else if (normalizedPathname === '/user/settings') {
    presenceData.details = 'Managing account settings...'
    presenceData.smallImageKey = ActivityAssets.Settings
  }
  else if (normalizedPathname === '/user/bookmarks') {
    if (tab === 'list') {
      presenceData.details = 'Managing bookmark list...'
      presenceData.smallImageKey = ActivityAssets.Settings
    }
    else if (tab === 'import') {
      presenceData.details = 'Importing bookmarks...'
      presenceData.smallImageKey = Assets.Downloading
    }
    else if (tab === 'export') {
      presenceData.details = 'Exporting bookmarks...'
      presenceData.smallImageKey = Assets.Uploading
    }
    else if (tab === 'folder') {
      presenceData.details = 'Managing bookmark folders...'
      presenceData.smallImageKey = ActivityAssets.Settings
    }
    else {
      presenceData.details = 'Managing bookmarks list...'
      presenceData.smallImageKey = ActivityAssets.Settings
    }
  }
  else if (pathname.includes('/browser')) {
    presenceData.details = 'Searching for manga...'
    presenceData.smallImageKey = Assets.Search
  }

  if (pathname.includes('/title')) {
    if (!rawString) {
      presenceData.details = `Viewing "${mangaName}" mainpage`
      presenceData.largeImageKey = poster || presenceData.largeImageKey
      presenceData.smallImageKey = Assets.Viewing
    }
    else {
      presenceData.details = mangaName
      presenceData.state = `Chapter: ${chapter || 'Unknown'}`
      presenceData.largeImageKey = readerPoster || poster || presenceData.largeImageKey
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = `Chapter: ${chapter}`
    }
  }

  presence.setActivity(presenceData)
})
