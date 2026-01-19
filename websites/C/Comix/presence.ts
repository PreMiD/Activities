import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1460511327771426848',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://raw.githubusercontent.com/sirschubert/assets/refs/heads/main/assets/communityIcon_p626ghkfd91g1.png',
  }

  const { pathname } = document.location

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
  }
  else if (pathname === '/genres') {
    presenceData.details = 'Browsing genres...'
  }
  else if (pathname === '/groups/popular') {
    presenceData.details = 'Browsing popular groups...'
  }
  else if (/\/groups\/\d+/.test(pathname)) {
    presenceData.details = `Watching at '${groupName || 'Unknown'}' group`
  }
  else if (pathname.includes('/browser')) {
    presenceData.details = 'Searching for manga...'
  }

  if (pathname.includes('/title')) {
    if (!rawString) {
      presenceData.details = `Watching "${mangaName}" mainpage`
      presenceData.largeImageKey = poster || presenceData.largeImageKey
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
