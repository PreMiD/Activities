import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1396529263095582890',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/W/WatchPeopleLive/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
    details: 'Viewing other pages',
  }

  const curPath = document.location.pathname
  if (curPath === '/') {
    presenceData.details = 'Viewing the main page'
  }
  else {
    // /h/nature/post/352201/new-hole-discovered-hnature
    const parts = curPath.split('/')
    if (parts.length === 3 && parts[1] === 'h') {
      // 只有板块，没有帖子
      const section = `/${parts[1]}/${parts[2]}` // "/h/nature"
      presenceData.details = `Browsing section: ${section}`
    }
    else if (parts.length >= 6 && parts[1] === 'h' && parts[3] === 'post') {
      // 具体帖子
      const section = `/${parts[1]}/${parts[2]}` // "/h/nature"
      const postId = parts[4]
      const postTitleRaw = parts[5] ?? ''
      const postTitle = postTitleRaw.replace(/-/g, ' ')
      presenceData.details = `Watching Post: ${postTitle}`
      presenceData.state = `From section "${section}", #${postId}`
      presenceData.buttons = [
        {
          label: 'Watch Post',
          url: document.location.href,
        },
      ]
    }
    else {
      // 其他路径处理
      presenceData.details = `Browsing ${curPath}`
    }
  }
  presence.setActivity(presenceData)
})
