// Assets are edited to follow PreMid standards, all rights reserved to pwn.college

const presence = new Presence({
  clientId: '1397042912386224280',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const { pathname } = document.location

const beltsURLs: Record<string, string> = {
  orange: 'https://cdn.imgchest.com/files/739cxk66w87.png',
  yellow: 'https://cdn.imgchest.com/files/y2pck5oolk7.png',
  green: 'https://cdn.imgchest.com/files/4jdcv6jj8g4.png',
  blue: 'https://cdn.imgchest.com/files/yq9c3veema4.png',
  white: 'https://cdn.imgchest.com/files/7lxcpxddle7.png',
}

const beltsArray: string[] = Object?.keys(beltsURLs)
let currentBelt = 'white'
let nextBelt = 'orange'

const utils = {
  stripPercent: (percentage: string = '0%') => +percentage.replace('%', ''),
}

enum ActivityAssets {
  Logo = 'https://cdn.imgchest.com/files/yd5cemrrpz4.png',
  thumbnail = 'https://cdn.imgchest.com/files/yrgcn9zz3b4.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: beltsURLs[currentBelt],
  }
  presenceData.details = currentBelt !== 'blue' ? `🥋 Grinding for the ${nextBelt} belt!` : `☯️ You're now a sensei; help others cross the path!`

  if (pathname === '/') {
    const cards = document.querySelectorAll<HTMLElement>('html body main div.container ul.card-list')[1]
    const beltsCards = cards?.querySelectorAll<HTMLElement>('.progress-bar')
    if (cards && beltsCards) {
      beltsCards?.forEach((element, i) => {
        const progress = utils.stripPercent(element?.style?.width)
        if (progress === 100) {
          currentBelt = beltsArray[i]!
          nextBelt = beltsArray[++i]!
        }
      })
    }
  }

  if (pathname.split('/').length === 3) {
    const moduleName = document.querySelector('h1.brand-white')?.textContent
    presenceData.state = moduleName ? `📜 Meditating on module selection: ${moduleName}` : ''
  }

  if (pathname.split('/').length === 4) {
    const moduleName = document.querySelector('h1.brand-white')?.textContent
    presenceData.state = moduleName ? `⚔️ Mastering ${moduleName}...` : ''
  }

  if (pathname.includes('/hacker')) {
    presenceData.details = '🎋 Looking at their profile'
    presenceData.state = `🌸 Reflecting on their journey...`
  }

  if (pathname.includes('/settings')) {
    presenceData.details = '⚙️ Tweaking the experience...'
    presenceData.state = ''
  }
  presence.setActivity(presenceData)
})
