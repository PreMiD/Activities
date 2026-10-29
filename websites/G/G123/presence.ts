import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1564985155863580781',
})

const LOGO = 'https://g123.jp/icons/G123_512.png'
const browsingTimestamp = Math.floor(Date.now() / 1000)

let playingSlug = ''
let playingSince = browsingTimestamp

function getOgImage(): string | null {
  const content = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content
  if (!content || content.includes('/admin/'))
    return null
  // 画像サイズ指定のクエリを外す
  return content.split('?')[0] ?? null
}

// 「薬屋のひとりごと 後宮異聞録 | ゲームスタート - G123」→「薬屋のひとりごと 後宮異聞録」
// 「「薬屋のひとりごと 後宮異聞録」- ゲーム詳細 - G123」→「薬屋のひとりごと 後宮異聞録」
function getGameName(): string | null {
  const title = document.title
    .replace(/\s*\|\s*ゲームスタート\s*-\s*G123\s*$/, '')
    .replace(/\s*-\s*ゲーム詳細\s*-\s*G123\s*$/, '')
    .replace(/^「(.+)」$/, '$1')
    .trim()
  if (!title || title.endsWith('G123'))
    return document.querySelector('h1')?.textContent?.trim() || null
  return title
}

presence.on('UpdateData', async () => {
  const [showGame, showImage] = await Promise.all([
    presence.getSetting<boolean>('showGame'),
    presence.getSetting<boolean>('showImage'),
  ])

  const presenceData: PresenceData = {
    name: 'G123',
    type: ActivityType.Playing,
    largeImageKey: LOGO,
    startTimestamp: browsingTimestamp,
  }

  const { hostname, pathname } = document.location
  const slug = pathname.match(/^\/game\/([^/]+)/)?.[1]

  // ***** ゲームのプレイ画面 (h5.g123.jp/game/:slug) *****
  if (hostname.startsWith('h5.') && slug) {
    if (playingSlug !== slug) {
      playingSlug = slug
      playingSince = Math.floor(Date.now() / 1000)
    }
    const game = getGameName()
    if (showGame && game) {
      presenceData.name = game
      presenceData.details = 'G123 でプレイ中'
      const image = showImage ? getOgImage() : null
      if (image) {
        presenceData.largeImageKey = image
        presenceData.smallImageKey = LOGO
        presenceData.smallImageText = 'G123'
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

  // ***** ゲーム詳細 (g123.jp/game/:slug) *****
  if (slug) {
    presenceData.details = 'ゲーム詳細を閲覧中'
    const game = showGame ? getGameName() : null
    if (game)
      presenceData.state = game
  }
  // ***** 一覧・ランキング *****
  else if (pathname.startsWith('/games')) {
    presenceData.details = pathname.includes('ranking') ? 'ランキングを閲覧中' : 'ゲームを探しています'
  }
  else {
    presenceData.details = 'トップページを閲覧中'
  }
  presence.setActivity(presenceData)
})
