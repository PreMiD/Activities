import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1565002054227726456',
})

const LOGO = 'https://cdn.discordapp.com/app-icons/1565002054227726456/35e0778b7cba4d71fbcb58e9f6ccdcbe.png'
const browsingTimestamp = Math.floor(Date.now() / 1000)

let playingSlug = ''
let playingSince = browsingTimestamp
let cachedIcon: { slug: string, url: string | null } | null = null

// 「艦隊これくしょん -艦これ- - DMM GAMES」→「艦隊これくしょん -艦これ-」
function gameName(): string | null {
  const name = document.title.replace(/\s*-\s*DMM GAMES\s*$/, '').trim()
  return name && name !== document.title.trim() ? name : null
}

// ゲームのアイコン (200x200): ページ内のリンク等に含まれるアプリ ID から組み立てる
function gameIcon(slug: string): string | null {
  if (cachedIcon?.slug === slug)
    return cachedIcon.url
  const html = document.body.innerHTML
  const appId = html.match(/\/setting\/game\/detail\/(\d+)/)?.[1]
    ?? html.match(/app_id=(\d+)/)?.[1]
  const url = appId ? `https://media.games.dmm.com/freegame/app/${appId}/200.gif` : null
  cachedIcon = { slug, url }
  return url
}

presence.on('UpdateData', async () => {
  const [showGame, showImage] = await Promise.all([
    presence.getSetting<boolean>('showGame'),
    presence.getSetting<boolean>('showImage'),
  ])

  const presenceData: PresenceData = {
    name: 'DMM GAMES',
    type: ActivityType.Playing,
    largeImageKey: LOGO,
    startTimestamp: browsingTimestamp,
  }

  const { hostname, pathname } = document.location
  const slug = pathname.match(/^\/game\/([^/]+)/)?.[1]

  // ***** ブラウザゲームのプレイ画面 (play.games.dmm.com/game/:slug) *****
  if (hostname === 'play.games.dmm.com' && slug) {
    if (playingSlug !== slug) {
      playingSlug = slug
      playingSince = Math.floor(Date.now() / 1000)
    }
    const name = showGame ? gameName() : null
    if (name) {
      presenceData.name = name
      presenceData.details = name
      presenceData.state = 'DMM GAMES でプレイ中'
      const icon = showImage ? gameIcon(slug) : null
      if (icon) {
        presenceData.largeImageKey = icon
        presenceData.smallImageKey = LOGO
        presenceData.smallImageText = 'DMM GAMES'
      }
    }
    else {
      presenceData.details = 'ゲームをプレイ中'
    }
    presenceData.startTimestamp = playingSince
    presence.setActivity(presenceData)
    return
  }

  playingSlug = ''
  presenceData.details = 'ゲームを探しています'
  presence.setActivity(presenceData)
})
