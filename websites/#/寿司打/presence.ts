import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1568835180276219986',
})

const LOGO = 'https://raw.githubusercontent.com/pachiris/Activities/premid-assets/sushida/logo.png'
const browsingTimestamp = Math.floor(Date.now() / 1000)

let playingSince = 0

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: '寿司打',
    type: ActivityType.Playing,
    largeImageKey: LOGO,
    startTimestamp: browsingTimestamp,
  }

  const { pathname } = document.location

  // ***** プレイ画面 *****
  // ゲーム本体は Unity WebGL (canvas) のため、コース名や結果はDOMに現れない
  // （2026-11-04 に play.html 本体と共通JS (parts.js) を確認し、コース名を含む
  // テキストがDOM側に存在しないことを検証済み）。表示は「プレイ中」のみになる
  if (pathname.startsWith('/play.html')) {
    playingSince ||= Math.floor(Date.now() / 1000)
    presenceData.details = 'プレイ中'
    presenceData.smallImageKey = Assets.Play
    presenceData.startTimestamp = playingSince
    presence.setActivity(presenceData)
    return
  }
  playingSince = 0

  // ***** その他のページ *****
  presenceData.details = pathname === '/' || pathname === '/index.html'
    ? 'タイトル画面'
    : 'サイトを見ています'
  presence.setActivity(presenceData)
})
