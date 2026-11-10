import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1568835180276219986',
})

const LOGO = 'https://raw.githubusercontent.com/pachiris/Activities/premid-assets/sushida/logo.png'
const browsingTimestamp = Math.floor(Date.now() / 1000)

let playingSince = 0

presence.on('UpdateData', async () => {
  const [showButtons, showTimestamp] = await Promise.all([
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showTimestamp'),
  ])

  const presenceData: PresenceData = {
    name: '寿司打',
    type: ActivityType.Playing,
    largeImageKey: LOGO,
  }

  if (showTimestamp)
    presenceData.startTimestamp = browsingTimestamp

  const { pathname } = document.location

  // ***** プレイ画面 *****
  // ゲーム本体は Unity WebGL (canvas) のため、コース名やスコアはDOMに現れない
  // （2026-11-04 に play.html 本体と共通JS (parts.js) を確認済み）。
  // 入口のクエリ (?soundless / ?kana) は初期プリセットにすぎず、タイトル画面の
  // 「設定」でサウンド／ふりがなをどのモードからでも変更できる（トップページ
  // 本人の注意書き）ため、現在の設定とは限らず state には使わない
  if (pathname.startsWith('/play.html')) {
    playingSince ||= Math.floor(Date.now() / 1000)
    presenceData.details = 'プレイ中'
    presenceData.smallImageKey = Assets.Play
    if (showTimestamp)
      presenceData.startTimestamp = playingSince
    if (showButtons) {
      presenceData.buttons = [
        {
          label: '寿司打で遊ぶ',
          url: document.location.href,
        },
      ]
    }
    presence.setActivity(presenceData)
    return
  }
  playingSince = 0

  // ***** その他のページ *****
  presenceData.details = pathname === '/' || pathname === '/index.html'
    ? 'トップページを見ています'
    : pathname.startsWith('/qa.html')
      ? 'Q&Aを見ています'
      : pathname.startsWith('/icon.html')
        ? '寿司アイコンの素材を見ています'
        : 'サイトを見ています'
  if (pathname.startsWith('/qa.html')) {
    presenceData.smallImageKey = Assets.Question
    presenceData.smallImageText = 'Q&A'
  }
  presence.setActivity(presenceData)
})
