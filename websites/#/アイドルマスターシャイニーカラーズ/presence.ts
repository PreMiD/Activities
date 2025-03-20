const presence = new Presence({
  clientId: '1103931016525127792',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/%23/%E3%82%A2%E3%82%A4%E3%83%89%E3%83%AB%E3%83%9E%E3%82%B9%E3%82%BF%E3%83%BC%E3%82%B7%E3%83%A3%E3%82%A4%E3%83%8B%E3%83%BC%E3%82%AB%E3%83%A9%E3%83%BC%E3%82%BA/assets/logo.png',
    startTimestamp: browsingTimestamp,
    details: 'シャニマスをプレイ中',
  }
  const pathMap: Record<string, PresenceData> = {
    '/home': { details: 'ホーム画面' },
    '/present': { details: 'プレゼント' },
    '/shop': { details: 'ショップ' },
    '/shop/skin': { details: '衣装ショップ' },
    '/shop/game_event': { details: 'イベントショップ' },
    '/shop/money': { details: 'マニーショップ' },
    '/shop/piece': { details: 'ピースショップ' },
    '/shop/staff_item_point': { details: 'シールショップ' },
    '/shop/trade': { details: 'リサイクルショップ' },
    '/shop/monthly_passport': { details: '283パスショップ' },
    '/shop/shiny_passport': { details: 'シャイニーパスショップ' },
    '/item': { details: 'アイテム一覧' },
    '/album': { details: 'アルバムを閲覧中' },
    '/homeDeck': { details: 'ホームユニットを編集中' },
    '/comic': { details: '4コマ漫画を閲覧中' },
    '/profile': { details: 'プロフィールを閲覧中' },
    '/gasha': { details: 'ガシャ' },
    '/idolPortal': { details: 'アイドル' },
    '/unit': { details: 'ユニット編成' },
    '/training': { details: 'トレーニング' },
    '/evolution': { details: '特訓' },
    '/exSkill': { details: 'Exスキル' },
    '/idolRoad': { details: 'アイドルロード' },
    '/idolList': { details: 'アイドル一覧' },
    '/producerDesk': { details: 'Pデスク' },
    '/producerLevel': { details: 'Pレベル' },
    '/mission': { details: 'ミッションを閲覧中' },
    '/workActivity': { details: '営業' },
    '/produceReady': { details: 'プロデュース準備中' },
    '/produce': { details: 'プロデュース中' },
    '/autoPlaySchedule': { details: 'オートプロデュース設定中' },
    '/matchLiveTop': { details: 'マッチライブ' },
    '/matchLiveReady': { details: 'マッチライブ準備中' },
    '/matchLiveConcert': { details: 'マッチライブをプレイ中' },
    '/fesTop': { details: 'フェス' },
    '/fesConcert': { details: 'フェスリハーサルをプレイ中' },
    '/fesReady': { details: 'フェス準備中' },
    '/fesMatchConcert': { details: 'グレードフェスをプレイ中' },
    '/jewelCounter': { details: 'フェザージュエルミッション' },
    '/help': { details: 'ヘルプを閲覧中' },
    '/fesTours': { details: 'フェスツアーズをプレイ中' },
    '/fesToursConcert': { details: 'フェスツアーズをプレイ中' },
    '/mastersFes': { details: 'マスターズフェスをプレイ中' },
    '/miniGamePortal': { details: 'ミニゲーム' },
    '/daifugo': { details: '大富豪をプレイ中' },
    '/characterProfile': { details: 'アイドルプロフィールを閲覧中' },
  }
  const pathDetails = pathMap[pathname]?.details
  if (typeof pathDetails !== 'undefined') {
    presenceData.details = pathDetails
  }
  else if (pathname.includes('/idolAlbum/')) {
    const idolNames: string[] = [
      '真乃',
      '灯織',
      'めぐる',
      '恋鐘',
      '摩美々',
      '咲耶',
      '結華',
      '霧子',
      '果穂',
      '智代子',
      '樹里',
      '凛世',
      '夏葉',
      '甘奈',
      '甜花',
      '千雪',
      'あさひ',
      '冬優子',
      '愛依',
      '透',
      '円香',
      '小糸',
      '雛菜',
      'にちか',
      '美琴',
      'ルカ',
      '羽那',
      'はるき',
    ]
    const albumIndex = Number(pathname.split('/')[2]) - 1
    if (albumIndex >= 0 && albumIndex < idolNames.length)
      presenceData.details = `${idolNames[albumIndex]}のアルバムを閲覧中`
  }
  for (const [index, idolName] of ['ルビー', '有馬かな', 'MEMちょ'].entries()) {
    if (pathname === `/idolAlbum/${801 + index}`)
      presenceData.details = `${idolName}のアルバムを閲覧中`
  }
  presence.setActivity(presenceData)
})
