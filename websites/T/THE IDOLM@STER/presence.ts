import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1564987621883510934',
})

const LOGO = 'https://idolmaster-official.jp/icon-512x512.png'
const browsingTimestamp = Math.floor(Date.now() / 1000)

// URL (ブランドページ) とアイドル名鑑の ID の先頭の数字から、ブランド名を決める
const BRANDS: Record<string, string> = {
  'idolmaster': 'THE IDOLM@STER',
  'cinderellagirls': 'シンデレラガールズ',
  'millionlive': 'ミリオンライブ！',
  'sidem': 'SideM',
  'shinycolors': 'シャイニーカラーズ',
  'gakuen': '学園アイドルマスター',
  'va-liv': 'ヴイアライヴ',
}
const BRANDS_BY_ID: Record<string, string> = {
  1: 'THE IDOLM@STER',
  2: 'シンデレラガールズ',
  3: 'ミリオンライブ！',
  4: 'SideM',
  5: 'シャイニーカラーズ',
  6: '学園アイドルマスター',
}
const SECTIONS: Record<string, string> = {
  'news': 'ニュース',
  'information': 'お知らせ',
  'schedule': 'スケジュール',
  'live_event': 'ライブ・イベント情報',
  'music': '楽曲情報',
  'goods': 'グッズ情報',
  'game': 'ゲーム情報',
  'anime': 'アニメ情報',
  'webcast': 'Web配信情報',
  'radio': 'ラジオ情報',
  'book-comic': '書籍・コミック情報',
  'media': 'メディア情報',
  'movie': '動画',
  'collab-campaign': 'コラボ・キャンペーン',
  'serial-code': 'シリアルコード',
  'mydesk': 'マイデスク',
}

// 「記事タイトル | 【公式】アイドルマスター ポータル（アイマス）」→「記事タイトル」
function pageTitle(): string {
  return document.title.split(/\s*\|\s*【公式】/)[0]?.trim() ?? ''
}

function ogImage(): string | null {
  return document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content ?? null
}

presence.on('UpdateData', async () => {
  const [showTitle, showIdolImage, buttons] = await Promise.all([
    presence.getSetting<boolean>('showTitle'),
    presence.getSetting<boolean>('showIdolImage'),
    presence.getSetting<boolean>('buttons'),
  ])

  const presenceData: PresenceData = {
    name: 'THE IDOLM@STER',
    type: ActivityType.Watching,
    largeImageKey: LOGO,
    largeImageText: 'THE IDOLM@STER',
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Reading,
  }
  const { hostname, pathname, href } = document.location
  const parts = pathname.split('/').filter(Boolean)

  // ***** アイドル名鑑 *****
  if (hostname.startsWith('idollist.')) {
    const id = pathname.match(/\/search\/detail\/(\d+)/)?.[1]
    if (id) {
      // 「相川 千夏（あいかわ ちなつ）」→「相川 千夏」
      const name = pageTitle().replace(/（.*）$/, '').trim()
      const brand = BRANDS_BY_ID[id.charAt(0)]
      presenceData.details = showTitle && name ? `${name} のプロフィール` : 'アイドルのプロフィールを閲覧中'
      if (brand)
        presenceData.state = brand
      const image = showIdolImage ? ogImage() : null
      if (image && image.includes('/character_main/')) {
        presenceData.largeImageKey = image
        presenceData.largeImageText = name || 'アイドル名鑑'
        presenceData.smallImageKey = LOGO
        presenceData.smallImageText = 'アイドル名鑑'
      }
      if (buttons)
        presenceData.buttons = [{ label: 'プロフィールを見る', url: href }]
    }
    else if (parts[0] === 'search') {
      presenceData.details = 'アイドル名鑑で検索中'
      presenceData.smallImageKey = Assets.Search
    }
    else if (parts[0] === 'fortunetelling') {
      presenceData.details = 'アイドル占い'
    }
    else {
      presenceData.details = 'アイドル名鑑を閲覧中'
    }
    presence.setActivity(presenceData)
    return
  }

  // ***** ポータル *****
  const first = parts[0] ?? ''
  const brand = BRANDS[first]
  const section = SECTIONS[first] ?? (parts[1] ? SECTIONS[parts[1]] : undefined)

  // 記事ページ (/news/01_20212 など)
  if ((first === 'news' || first === 'information') && parts[1]) {
    presenceData.details = section ?? 'ニュース'
    const title = pageTitle()
    if (showTitle && title)
      presenceData.state = title.length > 120 ? `${title.slice(0, 120)}…` : title
    if (buttons)
      presenceData.buttons = [{ label: '記事を読む', url: href }]
  }
  // ブランドページ (/cinderellagirls、/cinderellagirls/news など)
  else if (brand) {
    presenceData.details = `${brand}${section ? ` の${section}` : ''}`
    presenceData.state = 'ブランドページを閲覧中'
  }
  // 各コーナー
  else if (section) {
    presenceData.details = section
    presenceData.state = '一覧を閲覧中'
  }
  else if (!first) {
    presenceData.details = 'ポータルのトップページ'
  }
  else {
    const title = pageTitle()
    presenceData.details = title && !title.startsWith('【公式】') ? title : 'ポータルを閲覧中'
  }
  presence.setActivity(presenceData)
})
