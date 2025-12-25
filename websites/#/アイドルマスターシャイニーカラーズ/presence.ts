const presence = new Presence({
  clientId: '1103931016525127792',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

let iframeState: { pathname: string, hash: string } | null = null
let lastDetails = ''

presence.on('iFrameData', (data: any) => {
  if (data && data.hash && data.hash.startsWith('#/')) {
    iframeState = data
  }
})

presence.on('UpdateData', async () => {
  const { pathname: parentPath, hash: parentHash } = document.location

  const currentPath = iframeState?.pathname ?? parentPath
  const currentHash = iframeState?.hash ?? parentHash

  const cleanHash = currentHash ? currentHash.split('?')[0] : ''
  const currentRoute = (cleanHash && cleanHash.length > 1) ? cleanHash.substring(1) : currentPath

  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/e6Zr6HQ.png',
    startTimestamp: browsingTimestamp,
    state: 'シャニマスをプレイ中',
  }

  presenceData.details = 'シャニマス'

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
    '/photo': { details: 'フォトモード' },
    '/memoryBoost': { details: 'メモリーブースト' },
  }

  const pathDetails = pathMap[currentRoute]?.details
  if (typeof pathDetails !== 'undefined') {
    presenceData.details = pathDetails
  }
  else if (currentRoute.includes('/idolAlbum/')) {
    const idolNames: string[] = [
      '櫻木真乃',
      '風野灯織',
      '八宮めぐる',
      '月岡恋鐘',
      '田中摩美々',
      '白瀬咲耶',
      '三峰結華',
      '幽谷霧子',
      '小宮果穂',
      '園田智代子',
      '西城樹里',
      '杜野凛世',
      '有栖川夏葉',
      '大崎甘奈',
      '大崎甜花',
      '桑山千雪',
      '芹沢あさひ',
      '黛冬優子',
      '和泉愛依',
      '浅倉透',
      '樋口円香',
      '福丸小糸',
      '市川雛菜',
      '七草にちか',
      '緋田美琴',
      '斑鳩ルカ',
      '鈴木羽那',
      '郁田はるき',
    ]

    const parts = currentRoute.split('/')
    const idStr = parts[parts.length - 1]
    const albumIndex = Number(idStr) - 1

    if (albumIndex >= 0 && albumIndex < idolNames.length) {
      presenceData.details = `${idolNames[albumIndex]}のアルバムを閲覧中`
    }

    const oshiId = Number(idStr)
    const oshiMap: Record<number, string> = {
      91: '七草はづき',
      801: 'ルビー',
      802: '有馬かな',
      803: 'MEMちょ',
      804: '黒川あかね',
    }
    if (oshiMap[oshiId]) {
      presenceData.details = `${oshiMap[oshiId]}のアルバムを閲覧中`
    }
  }

  if (presenceData.details !== lastDetails) {
    lastDetails = presenceData.details as string
  }

  presence.setActivity(presenceData)
})
