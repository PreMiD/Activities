import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '736620343279484959',
})

const LOGO = 'https://cdn.rcd.gg/PreMiD/websites/R/Radiko/assets/logo.png'
const browsingTimestamp = Math.floor(Date.now() / 1000)

interface Program {
  ft: string
  to: string
  title: string
  pfm: string
  img: string | null
}

interface Station {
  name: string
  programs: Program[]
  fetchedAt: number
}

const stations = new Map<string, Station>()
const pending = new Map<string, Promise<void>>()
// 再生中に別のページへ移動しても、最後に聴いていた局を覚えておく
let lastLive: { station: string, timefree: string | null } | null = null

function loadStation(id: string): void {
  const cached = stations.get(id)
  if ((cached && Date.now() - cached.fetchedAt < 60 * 60 * 1000) || pending.has(id))
    return
  pending.set(id, (async () => {
    try {
      const res = await fetch(`https://radiko.jp/v3/program/station/weekly/${id}.xml`)
      if (!res.ok)
        return
      const xml = new DOMParser().parseFromString(await res.text(), 'text/xml')
      const programs: Program[] = [...xml.querySelectorAll('prog')].map(prog => ({
        ft: prog.getAttribute('ft') ?? '',
        to: prog.getAttribute('to') ?? '',
        title: prog.querySelector('title')?.textContent?.trim() ?? '',
        pfm: prog.querySelector('pfm')?.textContent?.trim() ?? '',
        img: prog.querySelector('img')?.textContent?.trim() || null,
      }))
      stations.set(id, {
        name: xml.querySelector('station > name')?.textContent?.trim() ?? id,
        programs,
        fetchedAt: Date.now(),
      })
    }
    catch {}
    finally {
      pending.delete(id)
    }
  })())
}

// radiko の時刻表記 (JST, yyyyMMddHHmmss) と UNIX 時間の変換
function toUnix(time: string): number {
  const m = time.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/)
  if (!m)
    return 0
  return Math.floor(Date.parse(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}+09:00`) / 1000)
}

function formatDate(time: string): string {
  const m = time.match(/^\d{4}(\d{2})(\d{2})(\d{2})(\d{2})/)
  return m ? `${Number(m[1])}/${Number(m[2])} ${m[3]}:${m[4]}` : ''
}

function findProgram(station: Station | undefined, unix: number): Program | undefined {
  return station?.programs.find(p => toUnix(p.ft) <= unix && unix < toUnix(p.to))
}

function isPlaying(): boolean | null {
  const media = document.querySelector<HTMLMediaElement>('audio, video')
  if (media && !Number.isNaN(media.duration))
    return !media.paused
  const player = document.querySelector<HTMLElement>('#stream-player')
  if (player && player.style.display === 'block')
    return !!document.querySelector('.icon--play-02.on')
  return null
}

function readElapsed(): number | null {
  for (const el of document.querySelectorAll('.player-area .start')) {
    const m = el.textContent?.trim().match(/^(\d{1,2}):(\d{2}):(\d{2})$/)
    if (m)
      return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])
  }
  const media = document.querySelector<HTMLMediaElement>('audio, video')
  return media && !Number.isNaN(media.duration) && Number.isFinite(media.currentTime) ? Math.floor(media.currentTime) : null
}

function cut(text: string, max = 120): string {
  return text.length > max ? `${text.slice(0, max)}…` : text
}

presence.on('UpdateData', async () => {
  const [showProgram, showImage, isTimeVisible, showButtons] = await Promise.all([
    presence.getSetting<boolean>('showProgram'),
    presence.getSetting<boolean>('showImage'),
    presence.getSetting<boolean>('isTimeVisible'),
    presence.getSetting<boolean>('buttons'),
  ])
  const { hash } = document.location
  const live = hash.match(/^#!\/live\/([\w-]+)/)
  const timefree = hash.match(/^#!\/ts\/([\w-]+)\/(\d{14})/)
  const playing = isPlaying()
  if (live || timefree)
    lastLive = { station: (live?.[1] ?? timefree?.[1])!, timefree: timefree?.[2] ?? null }
  else if (!playing)
    lastLive = null
  const stationId = lastLive?.station
  const timefreeTime = lastLive?.timefree ?? null

  if (stationId && playing !== null) {
    const presenceData: PresenceData = {
      type: ActivityType.Listening,
      largeImageKey: LOGO,
      largeImageText: 'radiko',
    }
    loadStation(stationId)
    const station = stations.get(stationId)
    const stationName = station?.name ?? stationId
    const program = timefreeTime
      ? station?.programs.find(p => p.ft === timefreeTime) ?? findProgram(station, toUnix(timefreeTime))
      : findProgram(station, Math.floor(Date.now() / 1000))

    if (showProgram && program?.title) {
      presenceData.details = cut(program.title)
      presenceData.state = cut(program.pfm ? `${stationName}｜${program.pfm}` : stationName)
    }
    else {
      presenceData.details = stationName
      presenceData.state = timefreeTime ? 'タイムフリー' : 'ライブで聴いています'
    }
    if (timefreeTime && program)
      presenceData.largeImageText = `タイムフリー：${formatDate(program.ft)} 放送`
    if (showImage && program?.img) {
      presenceData.largeImageKey = program.img
      presenceData.smallImageKey = playing ? Assets.Play : Assets.Pause
    }
    else {
      presenceData.smallImageKey = playing ? Assets.Play : Assets.Pause
    }
    presenceData.smallImageText = playing ? '再生中' : '一時停止中'

    if (playing && isTimeVisible) {
      if (!timefreeTime && program) {
        presenceData.startTimestamp = toUnix(program.ft)
        presenceData.endTimestamp = toUnix(program.to)
      }
      else if (timefreeTime && program) {
        // radiko の音声は <audio> を通らないので、再生バーの経過時間 (例: 00:12:34) を読む
        const elapsed = readElapsed()
        if (elapsed !== null) {
          const now = Math.floor(Date.now() / 1000)
          presenceData.startTimestamp = now - elapsed
          presenceData.endTimestamp = now - elapsed + (toUnix(program.to) - toUnix(program.ft))
        }
      }
    }
    if (showButtons) {
      presenceData.buttons = timefreeTime
        ? [{ label: 'タイムフリーで聴く', url: `https://radiko.jp/#!/ts/${stationId}/${timefreeTime}` }]
        : [{ label: `${cut(stationName, 20)} を聴く`, url: `https://radiko.jp/#!/live/${stationId}` }]
    }
    presence.setActivity(presenceData)
    return
  }

  const presenceData: PresenceData = {
    largeImageKey: LOGO,
    startTimestamp: browsingTimestamp,
  }
  if (hash.startsWith('#!/search')) {
    presenceData.details = '番組を検索しています'
    presenceData.smallImageKey = Assets.Search
  }
  else if (hash.startsWith('#!/timeshift') || hash.startsWith('#!/ts')) {
    presenceData.details = 'タイムフリーの番組を探しています'
  }
  else if (hash.startsWith('#!/timetable') || hash.startsWith('#!/live')) {
    presenceData.details = '番組表を見ています'
  }
  else if (hash.startsWith('#!/mypage')) {
    presenceData.details = 'マイページを見ています'
  }
  else {
    presenceData.details = '聴く番組を選んでいます'
  }

  presence.setActivity(presenceData)
})
