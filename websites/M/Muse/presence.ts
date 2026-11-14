import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1570043946585817139',
})

async function getStrings() {
  return presence.getStrings({
    browsing: 'general.browsing',
    paused: 'general.paused',
    playing: 'general.playing',
    search: 'general.search',
  })
}

const LOGO = 'https://i.imgur.com/ZOkEmUL.png'
const TALKING_ICON = 'https://i.imgur.com/l5SUX1w.png'

function isGenerating(): boolean {
  return Boolean(
    document.querySelector(
      '[data-is-streaming="true"], [data-streaming="true"], button[aria-label*="Stop"], button[aria-label*="停止"]',
    ),
  )
}

function isTyping(): boolean {
  // チャットの入力欄 (textarea / contenteditable) に未送信の文字がある間だけ true。
  // 判定に使うのは「文字があるかどうか」だけで、入力内容そのものは表示に使わない
  const editors = document.querySelectorAll<HTMLElement>(
    'textarea, [contenteditable="true"]',
  )
  for (const el of editors) {
    const text = el instanceof HTMLTextAreaElement
      ? el.value
      : (el.textContent ?? '')
    if (text.replace(/\u200B/g, '').trim().length > 0)
      return true
  }
  return false
}
const browsingTimestamp = Math.floor(Date.now() / 1000)

let chatKey = ''
let chatSince = browsingTimestamp

// ページごとの表示名。URL は 2026-11-11 にユーザーの実環境で確認したもの:
// メインチャット=/、サイドチャット=/thread/:id、/goals、/ideas、/feed、
// /library/artifacts?view=web|documents、/library/podcasts、/library/media?view=video|images
const simplePages: Record<string, string> = {
  feed: 'Viewing the feed',
  ideas: 'Viewing ideas',
  goals: 'Viewing goals',
}

function libraryPage(segments: string[], search: string): string {
  const view = new URLSearchParams(search).get('view')
  switch (segments[1]) {
    case 'artifacts':
      if (view === 'web')
        return 'Viewing web artifacts'
      if (view === 'documents')
        return 'Viewing documents'
      return 'Viewing artifacts'
    case 'podcasts':
      return 'Viewing podcasts'
    case 'media':
      if (view === 'video')
        return 'Viewing a video'
      if (view === 'images')
        return 'Viewing images'
      return 'Viewing media'
    default:
      return 'Viewing the library'
  }
}

presence.on('UpdateData', async () => {
  const [showTitle, showTimestamp, showBrowsing, strings] = await Promise.all([
    presence.getSetting<boolean>('showTitle'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('browsing'),
    getStrings(),
  ])

  const { pathname, search } = document.location
  const segments = pathname.split('/').filter(Boolean)
  const first = segments[0] ?? ''
  // ルート (メインチャット) と /thread/:id (サイドチャット) をチャット画面として扱う
  const isChat = first === '' || first === 'thread'

  if (!isChat && !showBrowsing) {
    presence.clearActivity()
    return
  }

  // largeImageText を付けると型が MediaPresenceData 扱いになり type が必須になるため、
  // 通常表示では付けない (メディア再生時は専用オブジェクト側で付ける)
  const presenceData: PresenceData = {
    largeImageKey: LOGO,
  }
  if (showTimestamp)
    presenceData.startTimestamp = browsingTimestamp

  // クイック検索 (コマンドパレット) が開いている間は検索中表示にする。
  // URL は変わらないため、スクリム要素の data-state で判定する (2026-11-11 実機確認)
  if (document.querySelector('[data-slot="quick-search-scrim"][data-state="open"]')) {
    presenceData.details = strings.search
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = strings.search
    presence.setActivity(presenceData)
    return
  }

  // ポッドキャスト再生中はメディア要素からそのまま取る (標準パターン)。
  // アプリが <audio> を使っていない場合は media が null で通常表示に落ちる
  const media = document.querySelector<HTMLMediaElement>('audio, video')
  if (media && ((first === 'library' && segments[1] === 'podcasts') || !media.paused)) {
    const isVideo = media instanceof HTMLVideoElement
      || (first === 'library' && segments[1] === 'media')
    const mediaTitle = document.title.replace(/\s*[-|]\s*Muse\s*$/, '').trim()
    // メディア再生は MediaPresenceData として組み立てる (type が必須)
    const mediaData: PresenceData = {
      type: isVideo ? ActivityType.Watching : ActivityType.Listening,
      largeImageKey: LOGO,
      largeImageText: 'Muse',
      details: showTitle && mediaTitle && mediaTitle !== 'Muse'
        ? mediaTitle
        : (isVideo ? 'Video' : 'Podcast'),
      state: media.paused ? strings.paused : strings.playing,
      smallImageKey: media.paused ? Assets.Pause : Assets.Play,
      smallImageText: media.paused ? strings.paused : strings.playing,
    }
    if (!media.paused && showTimestamp) {
      const [startTimestamp, endTimestamp] = getTimestampsFromMedia(media)
      if (endTimestamp > 0) {
        mediaData.startTimestamp = startTimestamp
        mediaData.endTimestamp = endTimestamp
      }
    }
    // 一時停止中はタイマーを付けない (進捗表示と矛盾するため)
    presence.setActivity(mediaData)
    return
  }

  if (isChat) {
    // チャットが切り替わったら経過時間を数え直す
    if (pathname !== chatKey) {
      chatKey = pathname
      chatSince = Math.floor(Date.now() / 1000)
    }
    if (showTimestamp)
      presenceData.startTimestamp = chatSince
    // 状態は 生成中 → 入力中 → 通常 の優先順で切り替える
    let chatState: string = 'Chatting'
    if (isGenerating()) {
      presenceData.smallImageKey = TALKING_ICON
      presenceData.smallImageText = 'Generating a response...'
      chatState = 'Generating a response...'
    }
    else if (isTyping()) {
      presenceData.smallImageKey = Assets.Writing
      presenceData.smallImageText = 'Typing...'
      chatState = 'Typing...'
    }
    else {
      presenceData.smallImageKey = Assets.Writing
      presenceData.smallImageText = 'Chatting'
    }
    // タイトルが「Muse」単体でないときはチャットタイトルとして使う
    const title = document.title.replace(/\s*[-|]\s*Muse\s*$/, '').trim()
    presenceData.details = showTitle && title && title !== 'Muse'
      ? title
      : 'Chatting with Muse'
    presenceData.state = chatState
  }
  else {
    presenceData.details = first === 'library'
      ? libraryPage(segments, search)
      : (simplePages[first] ?? 'Browsing Muse')
    presenceData.state = strings.browsing
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = strings.browsing
  }

  presence.setActivity(presenceData)
})
