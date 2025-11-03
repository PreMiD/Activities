import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1380925833371451482',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/Anixl/assets/logo.png',
}

function videoActive() {
  return !!document.querySelector('#app-wrapper > main > div.player-container > div > div > video')
}

async function getVideoInformation() {
  const videoEl = document.querySelector<HTMLVideoElement>('#app-wrapper > main > div.player-container > div > div > video')
  const animeName = document.querySelector('#app-wrapper > main > div.space-y-2 > div:nth-child(1) > a')?.textContent?.trim()
  const episodeTitle = document.querySelector('#app-wrapper > main > div.space-y-2 > div:nth-child(2) > a')?.textContent?.trim()
  const bannerSrc = document.querySelector('#app-wrapper > main > div.flex.flex-col.md\\:flex-row > div.flex > div.w-24.md\\:w-52.flex-none.justify-start.items-start > div > img')?.getAttribute('src')

  let currentTime: string | undefined, totalDuration: string | undefined
  const timeEl = document.querySelector('.art-control-time')
  const timeText = timeEl?.textContent?.trim() || ''
  if (timeText.includes(' / ')) {
    [currentTime, totalDuration] = timeText.split(' / ').map(s => s.trim())
  }

  const isPlaying = videoEl ? !videoEl.paused && !videoEl.ended : false

  let startTs: number | undefined, endTs: number | undefined
  if (videoEl && isPlaying && !Number.isNaN(videoEl.duration)) {
    [startTs, endTs] = getTimestampsFromMedia(videoEl)
  }

  return {
    animeName,
    episodeTitle,
    bannerSrc,
    currentTime,
    totalDuration,
    isPlaying,
    startTs,
    endTs,
  }
}

let cacheSeason = {
  titleId: '',
  bannerUrl: '',
  nameAnime: '',
}

async function updateSeasonInformation(titleId: string) {
  if (cacheSeason.titleId === titleId)
    return
  try {
    const res = await fetch(`https://anixl.to/title/${titleId}`)
    const html = await res.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const banner = doc.querySelector('#app-wrapper > main > div.flex.flex-col.md\\:flex-row > div.flex > div.w-24.md\\:w-52.flex-none.justify-start.items-start > div > img')?.getAttribute('src')
    const bannerUrl = `https://anixl.to${banner}`
    const fullName = doc.querySelector('#app-wrapper > main > div.flex.flex-col.md\\:flex-row > div.mt-3.md\\:mt-0.md\\:pl-3.grow.grid.gap-3.grid-cols-1.lg\\:grid-cols-3 > div.space-y-2.hidden.md\\:block > h3 > a')?.textContent
    const cleanName = fullName!.split(/Season\s+\d+/i)[0]!.trim()
    cacheSeason = {
      bannerUrl,
      titleId,
      nameAnime: cleanName,
    }
  }
  catch (e) {
    console.error('Error fetching banner', e)
  }
}

const routeMap: Record<string, string> = {
  '/': 'On Homepage',
  '/latest': 'Browsing Latest Releases',
  '/search': 'Searching Anime',
  '/anilists': 'Exploring AniLists',
  '/reviews': 'Reading Reviews',
  '/comments': 'Viewing Comments',
  '/reports': 'Checking Reports',
  '/changelog': 'Viewing Changelog',
  '/my/history': 'Viewing Watch History',
  '/my/follows': 'Viewing Followed Shows',
  '/my/folders': 'Browsing Folders',
  '/my/status': 'Browsing Watch Status',
  '/my/scores': 'Browsing Scores',
  '/my/emotions': 'Browsing Emotions',
  '/my/ctags': 'Browsing Custom Tags',
  '/my/notes': 'Reading Notes',
  '/my/anilists': 'Viewing My AniLists',
  '/my/anilists/liked': 'Viewing Liked AniLists',
  '/my/reviews': 'Viewing My Reviews',
  '/my/comments': 'Viewing My Comments',
  '/site-settings': 'Viewing Site Settings',
  '/my/messages': 'Viewing Messages',
  '/my/contacts': 'Viewing Contacts',
  '/my/contacts/pending': 'Pending Contact Requests',
  '/my/contacts/ignored': 'Ignored Contacts',
  '/my/contacts/accepted': 'Accepted Contacts',
  '/my/contacts/request': 'Contact Requests',
  '/my/contacts/blocked': 'Blocked Contacts',
  '/account/profiles': 'Editing Profile',
  '/account/emails': 'Managing Emails',
  '/account/password': 'Changing Password',
  '/account/sessions': 'Managing Sessions',
  '/account/deletion': 'Account Deletion Page',
}

const statusMap: Record<string, string> = {
  wish: 'Wishlisted Anime',
  doing: 'Currently Watching',
  completed: 'Completed Anime',
  on_hold: 'On Hold',
  dropped: 'Dropped Anime',
  repeat: 'Rewatching Anime',
}

presence.on('UpdateData', async () => {
  const { pathname, search } = document.location

  const presenceData: PresenceData = {
    details: 'Browsing AniXL',
    state: 'Browsing AniXL!',
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'AniXL',
    smallImageKey: Assets.Search,
    smallImageText: 'Home Page',
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp,
  }

  let titleId: string | undefined
  if (pathname.startsWith('/title/')) {
    const parts = pathname.split('/')
    titleId = parts[2]
    if (titleId) {
      await updateSeasonInformation(titleId)
    }
  }

  if (videoActive()) {
    const info = await getVideoInformation()
    if (info.animeName && info.episodeTitle) {
      presenceData.name = cacheSeason.nameAnime
      presenceData.state = info.animeName
      presenceData.details = info.episodeTitle
      if (cacheSeason.bannerUrl) {
        presenceData.largeImageKey = cacheSeason.bannerUrl
        presenceData.largeImageText = info.animeName!
      }
      presenceData.smallImageKey = info.isPlaying ? Assets.Play : Assets.Pause
      presenceData.smallImageText = info.isPlaying ? 'Playing' : 'Paused'
      if (info.isPlaying && info.startTs && info.endTs) {
        presenceData.startTimestamp = info.startTs
        presenceData.endTimestamp = info.endTs
      }
      else {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }
  }
  else if (pathname.startsWith('/title/') && pathname.split('/').length > 3) {
    const segments = pathname.split('/')
    const rawEp = segments[segments.length - 1]!
    presenceData.state = `Episode: ${rawEp.replace(/-/g, ' ')}`
    presenceData.details = 'Loading...'
    if (cacheSeason.bannerUrl) {
      presenceData.largeImageKey = cacheSeason.bannerUrl
    }
  }
  else {
    if (pathname.startsWith('/my/status') && search.includes('status=')) {
      const key = new URLSearchParams(search).get('status') || ''
      presenceData.details = statusMap[key] || presenceData.details
    }
    else if (pathname.startsWith('/my/notifications')) {
      presenceData.details = 'Viewing Notifications'
    }
    else if (pathname.startsWith('/title/') && pathname.split('/').length === 3) {
      const animeName = document.querySelector('img')?.alt
      const banner = document.querySelector('#app-wrapper > main > div.flex.flex-col.md\\:flex-row > div.flex > div.w-24.md\\:w-52.flex-none.justify-start.items-start > div > img')?.getAttribute('src')
      if (animeName) {
        presenceData.state = animeName
        presenceData.details = 'Browsing Anime'
        presenceData.largeImageKey = banner?.startsWith('http') ? banner! : `https://anixl.to${banner}`
        presenceData.largeImageText = animeName
      }
    }
    else {
      for (const [route, desc] of Object.entries(routeMap)) {
        if (pathname === route) {
          presenceData.details = desc
          break
        }
      }
    }
  }
  presence.setActivity(presenceData)
})
