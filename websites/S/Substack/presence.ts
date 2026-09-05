import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1525054064201830440',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/Substack/assets/logo.png',
}

function resizeImageUrl(url: string, size: number): string {
  if (!url)
    return url
  if (url === ActivityAssets.Logo)
    return url
  return url.replace(/\bw_\d+\b/g, `w_${size}`).replace(/\bh_\d+\b/g, `h_${size}`)
}

let cacheInfoChat: { username: string, picture: string } | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const [privacy, userPic, buttons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('userPic'),
    presence.getSetting<boolean>('buttons'),
  ])

  const { pathname, href, hostname } = document.location
  const splitPathname = pathname.split('/').filter(Boolean)
  const username = document.querySelector('.reader-nav-page > .pc-display-contents [class*=body] span')?.textContent?.trim() || document.querySelector(`a[href="/${splitPathname[0]}"]`)?.textContent?.trim() || 'Unknown User'
  const userProfilePicture = document.querySelector<HTMLImageElement>('.reader-nav-page > .pc-display-contents [class*=body] img')?.src || document.querySelector<HTMLImageElement>(`a[href^="/${splitPathname[0]}"] img`)?.src || ''

  if (hostname === 'substack.com') {
    if (pathname === '/') {
      presenceData.details = 'Viewing the homepage'
    }
    else if (pathname === '/onboarding') {
      presenceData.details = 'Viewing the onboarding page'
    }
    else if (pathname.startsWith('/explore')) {
      presenceData.details = 'Viewing the explore page'
    }
    else if (pathname.startsWith('/settings')) {
      presenceData.details = 'Managing account settings'
    }
    else if (pathname.startsWith('/search')) {
      const searchInput = document.querySelector<HTMLInputElement>('.reader-nav-page input')
      presenceData.details = privacy ? 'Searching for content' : 'Searching for:'
      presenceData.state = privacy ? '' : searchInput?.value || decodeURIComponent(splitPathname[1] || '').trim() || ''
      presenceData.smallImageKey = Assets.Search
    }
    else if (pathname.startsWith('/leaderboard')) {
      presenceData.details = 'Viewing the leaderboard'
    }
    else if (pathname.startsWith('/activity')) {
      presenceData.details = 'Viewing their Activity'
    }
    else if (/^\/inbox$/.test(pathname)) {
      presenceData.details = 'Viewing their Inbox'
    }
    else if (/^\/inbox\/post\/[^/]+$/.test(pathname)) {
      presenceData.details = 'Viewing a Post in their Inbox'
    }
    else if (/^\/chat$/.test(pathname)) {
      presenceData.details = 'Viewing the Chat'
    }
    else if (/^\/chat\/.*$/.test(pathname)) {
      if (/^\/chat\/[^/]+$/.test(pathname)) {
        const chatUserTag = document.querySelector<HTMLAnchorElement>('.reader-nav-page a[class*=header]')?.href || document.querySelector<HTMLAnchorElement>('.reader-nav-page a[href^="/@"]')?.href
        const chatUserName = document.querySelector(`.reader-nav-page a[href="${chatUserTag}"] div[class*="font-text"]`)?.textContent?.trim() || document.querySelector(`.reader-nav-page a[href="/@${chatUserTag?.split('@')[1]}"] div[class*="font-text"]`)?.textContent?.trim() || 'Unknown User'
        const chatUserPic = document.querySelector<HTMLImageElement>(`.reader-nav-page a[href="${chatUserTag}"] img`)?.src || document.querySelector<HTMLImageElement>(`.reader-nav-page a[href="/@${chatUserTag?.split('@')[1]}"] img`)?.src
        presenceData.details = privacy ? 'Chatting with someone' : `Chatting with ${chatUserName}`
        presenceData.largeImageKey = !privacy && userPic && chatUserTag ? resizeImageUrl(chatUserPic || ActivityAssets.Logo, 512) : ActivityAssets.Logo
        cacheInfoChat = {
          username: chatUserName,
          picture: chatUserPic || ActivityAssets.Logo,
        }
      }
      else if (/^\/chat\/[^/]+\/post/.test(pathname)) {
        presenceData.details = privacy ? 'Viewing a Post in Chat' : `Viewing a Post in ${cacheInfoChat?.username} Chat` || 'Viewing a Post in Chat'
        presenceData.largeImageKey = !privacy && cacheInfoChat?.picture ? cacheInfoChat.picture : ActivityAssets.Logo
      }
    }
    else if (/^\/@[^/]+$/.test(pathname) || /^\/@[^/]+\/notes$/.test(pathname)) {
      presenceData.details = privacy ? 'Viewing someones Activity' : `Viewing ${username}'s Activity`
      if (!privacy) {
        presenceData.largeImageKey = userPic && userProfilePicture ? resizeImageUrl(userProfilePicture, 512) : ActivityAssets.Logo
        if (buttons) {
          presenceData.buttons = [
            {
              label: 'View Profile',
              url: href,
            },
          ]
        }
      }
    }
    else if (/^\/@[^/]+\/posts$/.test(pathname)) {
      presenceData.details = privacy ? 'Viewing someones Posts' : `Viewing ${username}'s Posts`
      if (!privacy) {
        presenceData.largeImageKey = userPic && userProfilePicture ? resizeImageUrl(userProfilePicture, 512) : ActivityAssets.Logo
        if (buttons) {
          presenceData.buttons = [
            {
              label: 'View Profile',
              url: href,
            },
          ]
        }
      }
    }
    else if (/^\/@[^/]+\/likes$/.test(pathname)) {
      presenceData.details = privacy ? 'Viewing someones Likes & Replies' : `Viewing ${username}'s Likes & Replies`
      if (!privacy) {
        presenceData.largeImageKey = userPic && userProfilePicture ? resizeImageUrl(userProfilePicture, 512) : ActivityAssets.Logo
        if (buttons) {
          presenceData.buttons = [
            {
              label: 'View Profile',
              url: href,
            },
          ]
        }
      }
    }
    else if (/^\/@[^/]+\/reads$/.test(pathname)) {
      presenceData.details = privacy ? 'Viewing someones Reads' : `Viewing ${username}'s Reads`
      if (!privacy) {
        presenceData.largeImageKey = userPic && userProfilePicture ? resizeImageUrl(userProfilePicture, 512) : ActivityAssets.Logo
        if (buttons) {
          presenceData.buttons = [
            {
              label: 'View Profile',
              url: href,
            },
          ]
        }
      }
    }
    else if (/^\/@[^/]+\/note\/[^/]+$/.test(pathname)) {
      presenceData.details = privacy ? 'Viewing someones Note' : `Viewing ${username}'s Note`
      if (!privacy) {
        presenceData.largeImageKey = userPic && userProfilePicture ? resizeImageUrl(userProfilePicture, 512) : ActivityAssets.Logo
        if (buttons) {
          presenceData.buttons = [
            {
              label: 'View Note',
              url: href,
            },
            {
              label: 'View Profile',
              url: href.split('/note/')[0]!,
            },
          ]
        }
      }
    }
    else {
      presenceData.details = 'Browsing...'
    }
  }
  else {
    const websiteLogo = document.querySelector<HTMLImageElement>('div[class^="logoContainer"] img')?.src || ActivityAssets.Logo
    presenceData.largeImageKey = websiteLogo
    if (pathname === '/') {
      presenceData.details = 'Viewing the homepage'
    }
    else {
      presenceData.details = `Viewing page: ${document.title?.split(/\s*[|\-–—•·:~]\s*(?=Substack$)/i)[0]?.trim()}` || 'Browsing...'
    }
  }

  if (presenceData.largeImageKey !== ActivityAssets.Logo && !presenceData.smallImageKey)
    presenceData.smallImageKey = ActivityAssets.Logo

  presence.setActivity(presenceData)
})
