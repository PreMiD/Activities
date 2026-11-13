import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1568839930954916004',
})

const LOGO = 'https://raw.githubusercontent.com/pachiris/Activities/premid-assets/syosetu/logo.png'
const browsingTimestamp = Math.floor(Date.now() / 1000)

let readingKey = ''
let readingSince = browsingTimestamp

// 作品名・話名の取得（2026-11-04 に ncode.syosetu.com の実ページで検証済み）
// - 目次ページ: h1.p-novel__title が作品名
// - 各話ページ: h1.p-novel__title は「話タイトル」になる（作品名ではない）。
//   作品名は目次へのリンク a[href="/{ncode}/"] のテキストから取る
// 旧デザインの .novel_title / .novel_subtitle / .p-novel__subtitle は現行HTMLに存在しない
function getNovelTitle(ncode: string, isEpisode: boolean): string | null {
  if (isEpisode) {
    return document.querySelector(`a[href="/${ncode}/"]`)?.textContent?.trim() || null
  }
  return document.querySelector('.p-novel__title')?.textContent?.trim() || null
}

function getEpisodeTitle(isEpisode: boolean): string | null {
  if (!isEpisode)
    return null
  return document.querySelector('.p-novel__title')?.textContent?.trim() || null
}

presence.on('UpdateData', async () => {
  const [showNovel, showEpisode] = await Promise.all([
    presence.getSetting<boolean>('showNovel'),
    presence.getSetting<boolean>('showEpisode'),
  ])

  const { hostname, pathname } = document.location

  // novel18（R18側）は NSFW のため常時表示しない（設定で有効化もしない）。
  // Activity 自体を消して終了する
  if (hostname === 'novel18.syosetu.com') {
    presence.clearActivity()
    return
  }

  const presenceData: PresenceData = {
    name: '小説家になろう',
    type: ActivityType.Playing,
    largeImageKey: LOGO,
    startTimestamp: browsingTimestamp,
  }

  // ***** 作品の本文・目次 (ncode.syosetu.com) *****
  // /n1234ab/ が目次、/n1234ab/5/ のように末尾が数字だと各話。
  // 短編は話番号なしのURLのまま本文が表示されるため、本文要素の有無でも判定する
  const segments = pathname.split('/').filter(s => s !== '')
  const ncode = segments[0] && /^n[a-z0-9]+$/.test(segments[0]) ? segments[0] : null
  const episodeNum = segments[1] && /^\d+$/.test(segments[1]) ? segments[1] : undefined
  if (hostname === 'ncode.syosetu.com' && ncode) {
    const isEpisode = !!episodeNum
    const isReading = isEpisode || !!document.querySelector('.p-novel__text')
    const key = `${ncode}/${episodeNum ?? ''}`
    if (readingKey !== key) {
      readingKey = key
      readingSince = Math.floor(Date.now() / 1000)
    }
    presenceData.details = isReading ? '小説を読んでいます' : '作品ページを見ています'
    if (isReading) {
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = '読書中'
    }
    if (showNovel) {
      const title = getNovelTitle(ncode, isEpisode)
      const episode = showEpisode ? getEpisodeTitle(isEpisode) : null
      const state = title && episode ? `${title} - ${episode}` : (title ?? episode)
      if (state)
        presenceData.state = state
    }
    presenceData.startTimestamp = readingSince
    presence.setActivity(presenceData)
    return
  }
  readingKey = ''

  // ***** 小説を読もう！ (yomou.syosetu.com) *****
  // ランキングの実パスは /rank/...（/ranking ではない）。検索は /search.php
  if (hostname === 'yomou.syosetu.com') {
    presenceData.details = pathname.startsWith('/rank/')
      ? 'ランキングを見ています'
      : pathname.includes('search')
        ? '作品を探しています'
        : '小説を読もう！を見ています'
    presence.setActivity(presenceData)
    return
  }

  // ***** 小説家になろう 本体 (syosetu.com) *****
  if (pathname.startsWith('/rank/')) {
    presenceData.details = 'ランキングを見ています'
  }
  else if (pathname.includes('search')) {
    presenceData.details = '作品を探しています'
  }
  else if (pathname === '/' || pathname === '/0/') {
    presenceData.details = 'トップページを見ています'
  }
  else {
    presenceData.details = '小説家になろうを見ています'
  }
  presence.setActivity(presenceData)
})
