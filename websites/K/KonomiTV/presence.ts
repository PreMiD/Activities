import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1564620013367730256',
})

const LOGO = 'https://cdn.rcd.gg/PreMiD/websites/K/KonomiTV/assets/logo.png'
const browsingTimestamp = Math.floor(Date.now() / 1000)

interface ProgramInfo {
  title: string
  start_time: string
  end_time: string
}
interface ChannelInfo {
  id: string
  type: string
  network_id: number
  service_id: number
  is_subchannel: boolean
  name: string
  channel_number?: string
  program_present: ProgramInfo | null
}
interface VideoInfo {
  title: string
  channel: ChannelInfo | null
}

// 局ロゴ: KonomiTV に同梱されている 256x256 のロゴ (GitHub 上で公開されている) の URL を使う
// サーバーの /api/channels/:id/logo と同じ優先順位でファイル名を決める
const LOGO_BASE = 'https://raw.githubusercontent.com/tsukumijima/KonomiTV/master/server/static/logos/'
// 同梱ロゴの一覧 (KonomiTV リポジトリの server/static/logos から生成)
const BUNDLED = new Set<string>([
  'NID1-SID400',
  'NID10-SID33286',
  'NID10-SID33289',
  'NID10-SID33291',
  'NID10-SID33293',
  'NID10-SID33295',
  'NID10-SID33296',
  'NID10-SID33297',
  'NID10-SID33303',
  'NID10-SID33304',
  'NID10-SID33305',
  'NID10-SID33308',
  'NID10-SID33310',
  'NID10-SID33312',
  'NID10-SID33314',
  'NID10-SID33328',
  'NID10-SID33333',
  'NID10-SID33334',
  'NID10-SID33335',
  'NID10-SID33336',
  'NID10-SID33338',
  'NID10-SID33339',
  'NID10-SID33340',
  'NID10-SID33347',
  'NID10-SID33348',
  'NID10-SID33349',
  'NID10-SID33352',
  'NID10-SID33353',
  'NID10-SID33354',
  'NID10-SID33355',
  'NID10-SID33356',
  'NID10-SID33357',
  'NID10-SID33358',
  'NID10-SID33359',
  'NID10-SID33360',
  'NID10-SID33361',
  'NID10-SID33362',
  'NID10-SID33364',
  'NID10-SID33367',
  'NID10-SID33368',
  'NID10-SID33369',
  'NID10-SID33370',
  'NID10-SID33371',
  'NID10-SID33372',
  'NID10-SID33373',
  'NID10-SID33374',
  'NID10-SID33375',
  'NID10-SID33376',
  'NID10-SID33377',
  'NID10-SID33379',
  'NID10-SID33380',
  'NID10-SID33381',
  'NID10-SID33382',
  'NID10-SID33383',
  'NID10-SID33384',
  'NID10-SID33385',
  'NID10-SID33386',
  'NID10-SID33387',
  'NID10-SID33388',
  'NID10-SID33389',
  'NID10-SID33390',
  'NID10-SID33391',
  'NID10-SID33393',
  'NID10-SID33394',
  'NID10-SID33395',
  'NID10-SID33396',
  'NID10-SID33397',
  'NID10-SID33398',
  'NID10-SID33399',
  'NID10-SID33400',
  'NID10-SID33401',
  'NID10-SID33402',
  'NID10-SID33403',
  'NID10-SID33404',
  'NID10-SID33406',
  'NID10-SID33408',
  'NID10-SID33409',
  'NID10-SID33410',
  'NID10-SID33411',
  'NID10-SID33412',
  'NID10-SID33413',
  'NID10-SID33415',
  'NID10-SID33417',
  'NID10-SID33418',
  'NID10-SID33419',
  'NID10-SID33422',
  'NID10-SID33423',
  'NID10-SID33424',
  'NID10-SID33425',
  'NID10-SID33426',
  'NID10-SID33427',
  'NID10-SID33428',
  'NID10-SID33429',
  'NID10-SID33430',
  'NID10-SID33431',
  'NID10-SID33432',
  'NID10-SID33433',
  'NID10-SID33435',
  'NID10-SID33436',
  'NID10-SID33437',
  'NID10-SID33438',
  'NID10-SID33440',
  'NID10-SID33442',
  'NID10-SID33443',
  'NID10-SID33444',
  'NID10-SID33445',
  'NID10-SID33446',
  'NID10-SID33448',
  'NID10-SID33449',
  'NID10-SID33450',
  'NID10-SID33451',
  'NID10-SID33452',
  'NID10-SID33456',
  'NID10-SID33457',
  'NID10-SID33458',
  'NID10-SID33459',
  'NID10-SID33460',
  'NID10-SID33461',
  'NID10-SID33462',
  'NID10-SID33463',
  'NID10-SID33469',
  'NID10-SID33470',
  'NID10-SID33471',
  'NID10-SID33710',
  'NID10-SID33711',
  'NID10-SID33712',
  'NID10-SID33713',
  'NID10-SID33714',
  'NID10-SID33715',
  'NID10-SID33725',
  'NID10-SID33726',
  'NID10-SID33727',
  'NID10-SID33728',
  'NID10-SID33731',
  'NID10-SID33732',
  'NID10-SID33733',
  'NID10-SID33734',
  'NID10-SID33735',
  'NID11-SID101',
  'NID11-SID102',
  'NID11-SID141',
  'NID11-SID151',
  'NID11-SID161',
  'NID11-SID171',
  'NID11-SID181',
  'NID11-SID211',
  'NID11-SID221',
  'NID11-SID231',
  'NID31762-SID63504',
  'NID31764-SID63520',
  'NID31767-SID63544',
  'NID31778-SID62480',
  'NID31794-SID61456',
  'NID31795-SID61464',
  'NID31796-SID61472',
  'NID31810-SID60432',
  'NID31811-SID60440',
  'NID31826-SID59408',
  'NID31827-SID59416',
  'NID31828-SID59424',
  'NID31829-SID59432',
  'NID31842-SID58384',
  'NID31843-SID58392',
  'NID31844-SID58400',
  'NID31845-SID58408',
  'NID31858-SID57360',
  'NID31859-SID57368',
  'NID31860-SID57376',
  'NID31861-SID57384',
  'NID31874-SID56336',
  'NID31875-SID56344',
  'NID31876-SID56352',
  'NID31877-SID56360',
  'NID31878-SID56368',
  'NID31890-SID59312',
  'NID31891-SID55320',
  'NID31892-SID55328',
  'NID31906-SID54288',
  'NID31938-SID52240',
  'NID31939-SID52248',
  'NID31940-SID52256',
  'NID31941-SID52264',
  'NID31954-SID51216',
  'NID31955-SID51224',
  'NID31956-SID51232',
  'NID32018-SID47120',
  'NID32019-SID47128',
  'NID32020-SID47136',
  'NID32021-SID47144',
  'NID32038-SID46128',
  'NID32054-SID45104',
  'NID32070-SID44080',
  'NID32086-SID43056',
  'NID32102-SID42032',
  'NID32118-SID41008',
  'NID32118-SID41009',
  'NID32118-SID41010',
  'NID32134-SID39984',
  'NID32150-SID38960',
  'NID32150-SID38961',
  'NID32162-SID37904',
  'NID32163-SID37912',
  'NID32164-SID37920',
  'NID32178-SID36880',
  'NID32179-SID36888',
  'NID32194-SID35856',
  'NID32195-SID35864',
  'NID32196-SID35872',
  'NID32197-SID35880',
  'NID32210-SID34832',
  'NID32211-SID34840',
  'NID32212-SID34848',
  'NID32213-SID34856',
  'NID32230-SID33840',
  'NID32242-SID32784',
  'NID32243-SID32792',
  'NID32258-SID31760',
  'NID32259-SID31768',
  'NID32260-SID31776',
  'NID32261-SID31784',
  'NID32274-SID30736',
  'NID32275-SID30744',
  'NID32276-SID30752',
  'NID32277-SID30760',
  'NID32295-SID29752',
  'NID32311-SID28728',
  'NID32327-SID27704',
  'NID32359-SID25656',
  'NID32359-SID25657',
  'NID32375-SID24632',
  'NID32391-SID23608',
  'NID32391-SID23610',
  'NID32402-SID22544',
  'NID32403-SID22552',
  'NID32404-SID22560',
  'NID32418-SID21520',
  'NID32419-SID21528',
  'NID32420-SID21536',
  'NID32421-SID21544',
  'NID32434-SID20496',
  'NID32435-SID20504',
  'NID32436-SID20512',
  'NID32437-SID20520',
  'NID32450-SID19472',
  'NID32451-SID19480',
  'NID32452-SID19488',
  'NID32453-SID19496',
  'NID32466-SID18448',
  'NID32467-SID18456',
  'NID32468-SID18464',
  'NID32482-SID17424',
  'NID32483-SID17432',
  'NID32484-SID17440',
  'NID32485-SID17448',
  'NID32658-SID6160',
  'NID32659-SID6168',
  'NID32660-SID6176',
  'NID32674-SID5136',
  'NID32675-SID5144',
  'NID32676-SID5152',
  'NID32677-SID5160',
  'NID32678-SID5168',
  'NID32690-SID4112',
  'NID32691-SID4120',
  'NID32692-SID4128',
  'NID32693-SID4136',
  'NID32694-SID4144',
  'NID32706-SID3088',
  'NID32707-SID3096',
  'NID32708-SID3104',
  'NID32709-SID3112',
  'NID32722-SID2064',
  'NID32723-SID2072',
  'NID32724-SID2080',
  'NID32725-SID2088',
  'NID32736-SID1024',
  'NID32737-SID1032',
  'NID32738-SID1040',
  'NID32739-SID1048',
  'NID32740-SID1056',
  'NID32741-SID1064',
  'NID32741-SID1065',
  'NID32741-SID1066',
  'NID32742-SID1072',
  'NID4-SID101',
  'NID4-SID103',
  'NID4-SID141',
  'NID4-SID151',
  'NID4-SID161',
  'NID4-SID171',
  'NID4-SID181',
  'NID4-SID191',
  'NID4-SID192',
  'NID4-SID193',
  'NID4-SID200',
  'NID4-SID201',
  'NID4-SID202',
  'NID4-SID211',
  'NID4-SID222',
  'NID4-SID231',
  'NID4-SID232',
  'NID4-SID234',
  'NID4-SID236',
  'NID4-SID241',
  'NID4-SID242',
  'NID4-SID243',
  'NID4-SID244',
  'NID4-SID245',
  'NID4-SID251',
  'NID4-SID252',
  'NID4-SID255',
  'NID4-SID256',
  'NID4-SID260',
  'NID4-SID263',
  'NID4-SID265',
  'NID4-SID531',
  'NID6-SID055',
  'NID6-SID218',
  'NID6-SID219',
  'NID6-SID296',
  'NID6-SID298',
  'NID6-SID299',
  'NID6-SID317',
  'NID6-SID318',
  'NID6-SID339',
  'NID6-SID349',
  'NID6-SID800',
  'NID6-SID801',
  'NID7-SID161',
  'NID7-SID223',
  'NID7-SID227',
  'NID7-SID240',
  'NID7-SID250',
  'NID7-SID254',
  'NID7-SID257',
  'NID7-SID262',
  'NID7-SID290',
  'NID7-SID292',
  'NID7-SID293',
  'NID7-SID294',
  'NID7-SID295',
  'NID7-SID297',
  'NID7-SID300',
  'NID7-SID301',
  'NID7-SID305',
  'NID7-SID307',
  'NID7-SID308',
  'NID7-SID309',
  'NID7-SID310',
  'NID7-SID311',
  'NID7-SID312',
  'NID7-SID314',
  'NID7-SID316',
  'NID7-SID321',
  'NID7-SID322',
  'NID7-SID323',
  'NID7-SID324',
  'NID7-SID325',
  'NID7-SID329',
  'NID7-SID330',
  'NID7-SID331',
  'NID7-SID333',
  'NID7-SID340',
  'NID7-SID341',
  'NID7-SID342',
  'NID7-SID343',
  'NID7-SID351',
  'NID7-SID353',
  'NID7-SID354',
  'NID7-SID363',
])
const logoCache = new Map<string, string | null>()
const logoPending = new Map<string, Promise<string | null>>()

async function resolveLogo(ch: ChannelInfo): Promise<string | null> {
  const candidates = [ch.id]
  if (ch.type === 'GR' && ch.name.startsWith('NHK総合'))
    candidates.push('NID32736-SID1024')
  if (ch.type === 'GR' && ch.name.startsWith('NHKEテレ'))
    candidates.push('NID32737-SID1032')
  // ケーブルテレビのコミュニティチャンネルは地域ごとに ID が違うため、チャンネル名で決め打ち
  const community = ['J:COMテレビ', 'J:COMチャンネル', 'イッツコムch10', 'イッツコムch11', 'スカパー！ナビ1', 'スカパー！ナビ2', 'eo光チャンネル', 'ZTV', 'BaycomCH', 'ベイコム12CH']
    .find(n => ch.type === 'GR' && ch.name.startsWith(n))
  if (community)
    return `${LOGO_BASE}community-channels/${encodeURIComponent(community.replace(':', '：'))}.png`
  // スターデジオは 100 チャンネルすべて同じロゴ
  if (ch.type === 'SKY' && ch.service_id >= 400 && ch.service_id <= 499)
    candidates.push('NID1-SID400')
  if (ch.is_subchannel) {
    // サブチャンネルはメインチャンネル (同じネットワークで一番若いサービス ID) のロゴを使う
    const all = await fetchJson<Record<string, ChannelInfo[]>>('/api/channels')
    const main = Object.values(all ?? {})
      .flat()
      .filter(c => c.network_id === ch.network_id)
      .reduce<ChannelInfo | null>((min, c) => (!min || c.service_id < min.service_id ? c : min), null)
    if (main)
      candidates.push(main.id)
  }
  const hit = candidates.find(id => BUNDLED.has(id))
  return hit ? `${LOGO_BASE}${hit}.png` : null
}

async function getLogo(ch: ChannelInfo | null | undefined): Promise<string | null> {
  if (!ch?.id)
    return null
  if (logoCache.has(ch.id))
    return logoCache.get(ch.id)!
  let pending = logoPending.get(ch.id)
  if (!pending) {
    pending = resolveLogo(ch)
    logoPending.set(ch.id, pending)
  }
  const url = await pending
  logoPending.delete(ch.id)
  logoCache.set(ch.id, url)
  return url
}

// API 結果のキャッシュ (チャンネル/録画ごと)
let cacheKey = ''
let cacheTime = 0
let channelCache: ChannelInfo | null = null
let videoCache: VideoInfo | null = null

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${location.origin}${path}`, { credentials: 'include' })
    if (!res.ok)
      return null
    return await res.json() as T
  }
  catch {
    return null
  }
}

async function getChannel(id: string): Promise<ChannelInfo | null> {
  const now = Date.now()
  const end = channelCache?.program_present ? new Date(channelCache.program_present.end_time).getTime() : 0
  // チャンネルが変わった・30秒経った・番組が終わった ときに取り直す
  if (cacheKey !== `ch:${id}` || now - cacheTime > 30000 || (end && now > end)) {
    channelCache = await fetchJson<ChannelInfo>(`/api/channels/${encodeURIComponent(id)}`)
    cacheKey = `ch:${id}`
    cacheTime = now
  }
  return channelCache
}

async function getVideo(id: string): Promise<VideoInfo | null> {
  if (cacheKey !== `vid:${id}`) {
    videoCache = await fetchJson<VideoInfo>(`/api/videos/${encodeURIComponent(id)}`)
    cacheKey = `vid:${id}`
    cacheTime = Date.now()
  }
  return videoCache
}

const pageNames: Record<string, string> = {
  '/': 'ホーム',
  '/tv/': 'テレビのチャンネル一覧',
  '/tv/search': 'テレビ番組を検索中',
  '/videos/': 'ビデオ一覧',
  '/videos/search': 'ビデオを検索中',
  '/videos/programs': 'ビデオ一覧',
  '/timetable/': '番組表',
  '/reservations/': '録画予約',
  '/reservations/all': '録画予約',
  '/mylist/': 'マイリスト',
  '/watched-history/': '視聴履歴',
  '/mypage/': 'マイページ',
}

presence.on('UpdateData', async () => {
  const [showTimestamp, showProgram, browsing] = await Promise.all([
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('showProgram'),
    presence.getSetting<boolean>('browsing'),
  ])

  const presenceData: PresenceData = {
    name: 'KonomiTV',
    type: ActivityType.Watching,
    largeImageKey: LOGO,
    largeImageText: 'KonomiTV',
  }

  const { pathname } = document.location
  const video = document.querySelector<HTMLVideoElement>('video')

  // ***** テレビのライブ視聴 *****
  const live = pathname.match(/^\/tv\/watch\/([^/]+)/)
  if (live) {
    const ch = await getChannel(live[1]!)
    const prog = ch?.program_present
    presenceData.details = showProgram ? (prog?.title ?? 'テレビを視聴中') : 'テレビを視聴中'
    presenceData.state = ch?.name ?? live[1]
    const liveLogo = await getLogo(ch)
    if (liveLogo) {
      presenceData.largeImageKey = liveLogo
      presenceData.largeImageText = ch?.name ?? 'KonomiTV'
      presenceData.smallImageKey = LOGO
      presenceData.smallImageText = video?.paused ? 'KonomiTV (一時停止中)' : 'KonomiTV (ライブ視聴中)'
    }
    else {
      presenceData.smallImageKey = video?.paused ? Assets.Pause : Assets.Live
      presenceData.smallImageText = video?.paused ? '一時停止中' : 'ライブ視聴中'
    }
    if (showTimestamp && prog && !video?.paused) {
      presenceData.startTimestamp = Math.floor(new Date(prog.start_time).getTime() / 1000)
      presenceData.endTimestamp = Math.floor(new Date(prog.end_time).getTime() / 1000)
    }
    presence.setActivity(presenceData)
    return
  }

  // ***** 録画番組の再生 *****
  const rec = pathname.match(/^\/videos\/watch\/([^/]+)/)
  if (rec) {
    const v = await getVideo(rec[1]!)
    presenceData.details = showProgram ? (v?.title ?? '録画番組を視聴中') : '録画番組を視聴中'
    presenceData.state = v?.channel?.name ?? '録画番組'
    const recLogo = await getLogo(v?.channel)
    if (recLogo) {
      presenceData.largeImageKey = recLogo
      presenceData.largeImageText = v?.channel?.name ?? 'KonomiTV'
      presenceData.smallImageKey = LOGO
      presenceData.smallImageText = video?.paused ? 'KonomiTV (一時停止中)' : 'KonomiTV (録画再生中)'
    }
    else {
      presenceData.smallImageKey = video?.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video?.paused ? '一時停止中' : '再生中'
    }
    if (showTimestamp && video && !video.paused && Number.isFinite(video.duration))
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
    presence.setActivity(presenceData)
    return
  }

  // ***** その他のページ *****
  if (!browsing) {
    presence.clearActivity()
    return
  }
  presenceData.details = pathname.startsWith('/settings') ? '設定' : (pageNames[pathname] ?? 'ブラウジング中')
  presenceData.startTimestamp = browsingTimestamp
  presence.setActivity(presenceData)
})
