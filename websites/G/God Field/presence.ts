import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1564987185709588580',
})

const LOGO = 'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/9d/d4/8a/9dd48a1d-0ff3-123f-7b8f-de54f35da71c/Placeholder.mill/512x512bb.png'
const LANGS = ['ja', 'en', 'fr', 'ko', 'pt', 'ru', 'zh-hans', 'zh-hant']
const browsingTimestamp = Math.floor(Date.now() / 1000)

type Mode = 'training' | 'private' | 'duel'
interface Texts {
  modeNames: Record<Mode, string>
  home: { setUserName: string }
  menu: { roomPassword: string, userCount: string }
  training: { playerCount: string, players: string }
  private: { startGame: string, shuffleTeams: string, chatLog: string, userCount: string }
  duel: { ranking: string, rating: string }
  game: { abandon: string, resetGame: string, opening: string, endingWin: string, endingDraw: string, usedMiracles: string }
}

// ゲームの言語ファイル (/i18n/*.json) から、画面ごとの目印になる文言を集める。
// UpdateData は1秒に何度も呼ばれるので、読み込んだ結果はキャッシュして使い回す。
// 読み込みに失敗したときは、毎回 fetch しないように一定時間あけてから再試行する。
const CACHE_TTL = 6 * 60 * 60 * 1000
const RETRY_INTERVAL = 60 * 1000
let texts: Texts[] = []
let loadedAt = 0
let lastAttempt = 0
let loading: Promise<void> | null = null

function loadTexts(): Promise<void> {
  const now = Date.now()
  if (texts.length && now - loadedAt < CACHE_TTL)
    return Promise.resolve()
  if (loading)
    return loading
  if (now - lastAttempt < RETRY_INTERVAL)
    return Promise.resolve()
  lastAttempt = now
  loading = Promise.all(LANGS.map(async (lang) => {
    try {
      const res = await fetch(`${location.origin}/i18n/${lang}.json`)
      return res.ok ? ((await res.json()) as { texts: Texts }).texts : null
    }
    catch {
      return null
    }
  })).then((list) => {
    const loaded = list.filter((t): t is Texts => !!t)
    if (loaded.length) {
      texts = loaded
      loadedAt = Date.now()
    }
  }).finally(() => {
    loading = null
  })
  return loading
}

const strip = (s: string) => s.replace(/<br>/g, '\n').trim()
const has = (body: string, pick: (t: Texts) => string) => texts.find(t => body.includes(strip(pick(t))))

// 「預言者 {{count}} 人」のような文言から人数を読み取る
function readCount(body: string, pick: (t: Texts) => string): number | null {
  for (const t of texts) {
    const [before, after] = pick(t).split('{{count}}')
    if (before === undefined || after === undefined)
      continue
    const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const m = body.match(new RegExp(`${escape(before.trim())}\\s*(\\d+)\\s*${escape(after.trim())}`))
    if (m)
      return Number(m[1])
  }
  return null
}

let lastMode: Mode | null = null
let battleSince = 0

presence.on('UpdateData', async () => {
  await loadTexts()
  const [showMode, showCount] = await Promise.all([
    presence.getSetting<boolean>('showMode'),
    presence.getSetting<boolean>('showCount'),
  ])

  const presenceData: PresenceData = {
    name: 'ゴッドフィールド',
    type: ActivityType.Playing,
    largeImageKey: LOGO,
    startTimestamp: browsingTimestamp,
  }
  // 画面に表示されている文字だけを見たい (隠れている要素の文字は含めたくない) ので innerText を使う
  // eslint-disable-next-line unicorn/prefer-dom-node-text-content
  const body = document.body.innerText
  const modeName = (t: Texts | undefined) => (lastMode && t ? t.modeNames[lastMode] : null)

  // ***** 対戦中・決着 *****
  // 対戦画面: 「戦いをあきらめる」などのボタンは常に見えているとは限らないので、
  // 各プレイヤーの HP・MP 表示や開始・決着の文言でも判定する
  const inGame = has(body, t => t.game.abandon)
    ?? has(body, t => t.game.resetGame)
    ?? has(body, t => t.game.opening)
    ?? has(body, t => t.game.endingWin)
    ?? has(body, t => t.game.endingDraw)
    ?? has(body, t => t.game.usedMiracles)
    ?? (/HP\s*\d+/.test(body) && /MP\s*\d+/.test(body) ? texts[0] : undefined)
  if (inGame) {
    battleSince ||= Math.floor(Date.now() / 1000)
    const ended = has(body, t => t.game.endingWin) ?? has(body, t => t.game.endingDraw)
    presenceData.details = ended ? '決着がついた' : '対戦中'
    const name = showMode ? modeName(inGame) : null
    // 「HP77 MP27」のような表示の数 = 対戦しているプレイヤーの数
    const alive = (body.match(/HP\s*\d+/g) ?? []).length
    if (name)
      presenceData.state = showCount && alive > 0 && !ended ? `${name}（${alive}人）` : name
    presenceData.smallImageKey = Assets.Play
    presenceData.startTimestamp = battleSince
    presence.setActivity(presenceData)
    return
  }
  battleSince = 0

  // ***** メニュー (3つのモードのカードが並ぶ画面) *****
  const menu = texts.find(t => (['training', 'private', 'duel'] as const).every(m => body.includes(t.modeNames[m])))
  if (menu) {
    if (has(body, t => t.menu.roomPassword)) {
      // 隠れ乱闘を押したときに出る「部屋の合言葉」の入力
      lastMode = 'private'
      presenceData.details = '部屋の合言葉を入力中'
      if (showMode)
        presenceData.state = menu.modeNames.private
    }
    else {
      presenceData.details = 'モードを選んでいます'
      // 各モードのカードに出ている「預言者 N 人」を合計して、オンラインの人数にする
      if (showCount) {
        const [before, after] = menu.menu.userCount.split('{{count}}')
        const escape = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const re = new RegExp(`${escape((before ?? '').trim())}\\s*(\\d+)\\s*${escape((after ?? '').trim())}`, 'g')
        const total = [...body.matchAll(re)].reduce((sum, m) => sum + Number(m[1]), 0)
        if (total > 0)
          presenceData.state = `オンライン ${total}人`
      }
    }
    presence.setActivity(presenceData)
    return
  }

  // ***** 真剣タイマン (待機画面・ランキング) *****
  const duel = has(body, t => t.duel.ranking)
  if (duel && body.includes(duel.modeNames.duel)) {
    lastMode = 'duel'
    const name = showMode ? duel.modeNames.duel : null
    if (has(body, t => t.duel.rating)) {
      presenceData.details = '対戦相手を待っています'
      if (name)
        presenceData.state = name
    }
    else {
      presenceData.details = 'ランキングを見ています'
      if (name)
        presenceData.state = name
    }
    presence.setActivity(presenceData)
    return
  }

  // ***** 修行・隠れ乱闘の待機画面 *****
  // 修行の画面にも「戦いを始める」ボタンがあるので、修行 (「修行者 N 人」) を先に判定する
  const training = has(body, t => t.training.players)
  const priv = training ? undefined : (has(body, t => t.private.shuffleTeams) ?? has(body, t => t.private.chatLog) ?? has(body, t => t.private.startGame))
  if (training || priv) {
    lastMode = training ? 'training' : 'private'
    presenceData.details = '対戦相手を待っています'
    const name = showMode ? modeName(training || priv) : null
    if (name)
      presenceData.state = name
    const count = showCount
      ? lastMode === 'private' ? readCount(body, t => t.private.userCount) : readCount(body, t => t.training.playerCount)
      : null
    if (count !== null && name)
      presenceData.state = `${name}（${count}人）`
    presence.setActivity(presenceData)
    return
  }

  presenceData.details = 'タイトル画面'
  presence.setActivity(presenceData)
})
