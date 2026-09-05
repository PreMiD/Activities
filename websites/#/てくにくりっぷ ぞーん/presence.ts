import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1460489830478778554',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/%23/%E3%81%A6%E3%81%8F%E3%81%AB%E3%81%8F%E3%82%8A%E3%81%A3%E3%81%B7%20%E3%81%9E%E3%83%BC%E3%82%93/assets/logo.png', // Replace with a direct URL to the site logo
  }

  const pathname = document.location.pathname

  // Video watching page
  if (pathname.startsWith('/video/')) {
    const videoTitle = document.querySelector('.vp-title')?.textContent?.trim()
    const singleAuthor = document.querySelector('.vp-channel-name')?.textContent?.trim()
    const multiAuthors = Array.from(document.querySelectorAll('.vp-author-names a')).map(el => el.textContent?.trim()).filter(Boolean).join(', ')
    const authorName = singleAuthor || multiAuthors || 'Unknown Author'
    const player = document.querySelector<HTMLVideoElement>('video')

    // Try to get video thumbnail from og:image or video poster
    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content')
    const posterImage = player?.getAttribute('poster')
    if (ogImage) {
      // Ensure ogImage is absolute URL and fit into a 1:1 transparent square
      const absoluteUrl = new URL(ogImage, document.location.href).href
      presenceData.largeImageKey = `https://wsrv.nl/?url=${encodeURIComponent(absoluteUrl)}&w=512&h=512&fit=contain&cbg=transparent&output=png`
    }
    else if (posterImage) {
      // Ensure posterImage is absolute URL and fit into a 1:1 transparent square
      const absoluteUrl = new URL(posterImage, document.location.href).href
      presenceData.largeImageKey = `https://wsrv.nl/?url=${encodeURIComponent(absoluteUrl)}&w=512&h=512&fit=contain&cbg=transparent&output=png`
    }

    presenceData.details = videoTitle || '動画を視聴中'
    presenceData.state = authorName || 'てくにくりっぷ ぞーん'
    presenceData.smallImageKey = player && player.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = player && player.paused ? '一時停止中' : '再生中'

    // Playback time tracking
    if (player && !player.paused) {
      const [startTimestamp, endTimestamp] = getTimestampsFromMedia(player)
      presenceData.startTimestamp = startTimestamp
      presenceData.endTimestamp = endTimestamp
    }
  }
  // User profile page
  else if (pathname.startsWith('/user/')) {
    presenceData.details = 'ユーザーページを閲覧中'
    presenceData.state = 'てくにくりっぷ ぞーん'
  }
  // Search page
  else if (pathname.startsWith('/search')) {
    const query = new URLSearchParams(document.location.search).get('q')
    presenceData.details = query ? `「${query}」を検索中` : '検索ページを閲覧中'
    presenceData.state = 'てくにくりっぷ ぞーん'
  }
  // Other pages (Home, etc)
  else {
    presenceData.details = 'ホーム画面を閲覧中'
    presenceData.state = 'てくにくりっぷ ぞーん'
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
