export const pageLabels = {
  home: 'ホーム',
  album: 'アルバム',
  preparation: 'プロデュース準備',
  event: 'プロデュースイベント',
  stage: '283ステージ',
  profile: 'プロフィール',
  matchLive: 'マッチライブ',
  fes: 'フェス',
  fesUnit: 'フェスユニット編成',
  shop: 'ショップ',
  producerDesk: 'Pデスク',
  miniGame: 'ミニゲーム',
} as const

const idolPageNames: Record<string, string> = {
  '/unit': 'ユニット編成',
  '/training': 'トレーニング',
  '/evolution': '特訓',
  '/memoryBoost': 'メモリーブースト',
  '/exSkill': 'Exスキル',
  '/idolRoad': 'アイドルロード',
  '/idolList': 'アイドル一覧',
}

const pageGroups: { details: string, sections: Record<string, string> }[] = [
  {
    details: pageLabels.fes,
    sections: {
      '/fesConcert': 'フェスリハーサル',
      '/fesResult': 'フェスリハーサル ／ リザルト',
      '/fesReady': 'グレードフェス',
      '/fesMatchConcert': 'グレードフェス',
      '/fesMatchResult': 'グレードフェス ／ リザルト',
    },
  },
  {
    details: pageLabels.shop,
    sections: {
      '/shop/premium': 'プレミアムショップ',
      '/shop/skin': '衣装ショップ',
      '/shop/game_event': 'イベントショップ',
      '/shop/money': 'マニーショップ',
      '/shop/piece': 'ピースショップ',
      '/shop/staff_item_point': 'シールショップ',
      '/shop/trade': 'リサイクルショップ',
      '/shop/monthly_passport': '283パスショップ',
      '/shop/shiny_passport': 'シャイニーパスショップ',
    },
  },
  { details: pageLabels.producerDesk, sections: { '/producerDeskShop': 'Pレベルショップ' } },
  { details: pageLabels.miniGame, sections: { '/daifugo': '大富豪', '/characterProfile': 'プロフィール' } },
]

const pageNames: Record<string, string> = {
  ...idolPageNames,
  '/home': pageLabels.home,
  '/present': 'プレゼント',
  '/shop': pageLabels.shop,
  '/item': 'アイテム一覧',
  '/album': pageLabels.album,
  '/homeDeck': 'ホームユニット',
  '/comic': '4コマ漫画',
  '/profile': pageLabels.profile,
  '/gasha': 'ガシャ',
  '/gashaAnimation': 'ガシャ',
  '/idolPortal': 'アイドル',
  '/producerDesk': pageLabels.producerDesk,
  '/producerLevel': 'Pレベル',
  '/mission': 'ミッション',
  '/workActivity': '営業',
  '/produceReady': pageLabels.preparation,
  '/produce': 'プロデュース',
  '/autoPlaySchedule': 'オートプロデュース設定',
  '/matchLiveReady': 'マッチライブ準備',
  '/fesTop': pageLabels.fes,
  '/jewelCounter': 'フェザージュエルミッション',
  '/help': 'ヘルプ',
  '/fesTours': 'フェスツアーズ',
  '/fesToursConcert': 'フェスツアーズ',
  '/mastersFes': 'マスターズフェス',
  '/miniGamePortal': pageLabels.miniGame,
  '/photo': 'フォトモード',
}

const pagePrefixes: Record<string, string> = {
  '/283Stage': pageLabels.stage,
  '/collaboFes/': 'コラボフェス',
  '/produceMarathon/': pageLabels.event,
}

export function getIdolPageDetails(route: string): string | undefined {
  return idolPageNames[route]
}

export function getRouteDisplay(route: string): { details?: string, state?: string } {
  const group = pageGroups.find(group => group.sections[route])
  if (group)
    return { details: group.details, state: group.sections[route] }

  const matchLiveSection = route === '/matchLiveTop'
    ? 'エリア選択'
    : route.startsWith('/matchLiveStageSelect/')
      ? 'ステージ選択'
      : route === '/matchLiveConcert' ? 'プレイ中' : undefined
  if (matchLiveSection)
    return { details: pageLabels.matchLive, state: matchLiveSection }

  const name = pageNames[route]
  if (name !== undefined)
    return { details: name }

  const prefix = Object.keys(pagePrefixes).find(prefix => route.includes(prefix))
  if (prefix !== undefined)
    return { details: pagePrefixes[prefix] }

  return { details: route.startsWith('/idolAlbum/') ? pageLabels.album : undefined }
}
