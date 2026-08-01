const presence = new Presence({
  clientId: '1244143703660953651',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/W/WordEngine/assets/logo.png',
}

interface ProgressCache {
  goal: string | null
  current: string | null
}

interface StoredProgressCache {
  data: ProgressCache
  key: string
}

const WEEKLY_GOAL_SELECTORS = [
  '.weekly-goal .goal-data .score',
  '.chart-weekly .goal-data .score',
  '.weekly-goal .score',
  '.goal-data .score',
]

const WEEKLY_CURRENT_SELECTORS = [
  '.weekly-goal .goal-data .crGoal',
  '.chart-weekly .goal-data .crGoal',
  '.weekly-goal .crGoal',
  '.goal-data .crGoal',
]

const DAILY_GOAL_SELECTORS = [
  '.daily-goal .goal-data .score',
  '.today-goal .goal-data .score',
  '.chart-daily .goal-data .score',
  '.chart-today .goal-data .score',
  '.daily-goal .score',
  '.today-goal .score',
]

const DAILY_CURRENT_SELECTORS = [
  '.daily-goal .goal-data .crGoal',
  '.today-goal .goal-data .crGoal',
  '.chart-daily .goal-data .crGoal',
  '.chart-today .goal-data .crGoal',
  '.daily-goal .crGoal',
  '.today-goal .crGoal',
]

const cacheKey = 'premid_wordengine_progress_v1'
const timestampKey = 'premid_wordengine_start_ts'
const languageKey = 'premid_wordengine_lang'

let cachedDay: ProgressCache | null = null
let cachedWeek: ProgressCache | null = null
let cachedIsJa: boolean | null = null

function loadCache(): void {
  try {
    const raw = localStorage.getItem(cacheKey)
    if (!raw)
      return
    const parsed = JSON.parse(raw) as { day?: StoredProgressCache | null, week?: StoredProgressCache | null }
    const currentDayKey = getDayKey()
    const currentWeekKey = getWeekKey()
    cachedDay = parsed.day?.key === currentDayKey ? parsed.day.data : null
    cachedWeek = parsed.week?.key === currentWeekKey ? parsed.week.data : null
  }
  catch {
  }
}

function loadLanguageCache(): void {
  try {
    const raw = localStorage.getItem(languageKey)
    if (raw === null)
      return
    cachedIsJa = raw === 'ja'
  }
  catch {
  }
}

function saveLanguageCache(value: boolean): void {
  try {
    localStorage.setItem(languageKey, value ? 'ja' : 'en')
  }
  catch {
  }
}

function saveCache(): void {
  try {
    const payload = JSON.stringify({
      day: cachedDay ? { data: cachedDay, key: getDayKey() } : null,
      week: cachedWeek ? { data: cachedWeek, key: getWeekKey() } : null,
    })
    localStorage.setItem(cacheKey, payload)
  }
  catch {
  }
}

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

function getDayKey(date = new Date()): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function getWeekKey(date = new Date()): string {
  const monday = new Date(date)
  monday.setHours(0, 0, 0, 0)
  const day = (monday.getDay() + 6) % 7
  monday.setDate(monday.getDate() - day)
  return getDayKey(monday)
}

function loadStartTimestamp(): number | null {
  try {
    const raw = sessionStorage.getItem(timestampKey)
    const parsed = raw ? Number(raw) : Number.NaN
    return Number.isFinite(parsed) ? parsed : null
  }
  catch {
    return null
  }
}

function saveStartTimestamp(value: number): void {
  try {
    sessionStorage.setItem(timestampKey, String(value))
  }
  catch {
  }
}

function clearSessionTimestamp(): void {
  try {
    sessionStorage.removeItem(timestampKey)
  }
  catch {
  }
}

loadCache()
loadLanguageCache()

function extractNumber(text: string | null): string | null {
  if (!text)
    return null
  const cleaned = text.replace(/[,\s]/g, '')
  const m = cleaned.match(/\d+/)
  return m ? m[0] : cleaned || null
}

function queryProgress(goalSelectors: string[], currentSelectors: string[]): ProgressCache {
  let goal: string | null = null
  let current: string | null = null

  for (const s of goalSelectors) {
    const el = document.querySelector<HTMLElement>(s)
    if (el) {
      goal = extractNumber((el.textContent || '').trim())
      if (goal)
        break
    }
  }

  for (const s of currentSelectors) {
    const el = document.querySelector<HTMLElement>(s)
    if (el) {
      current = extractNumber((el.textContent || '').trim())
      if (current)
        break
    }
  }

  if (!goal && !current)
    return { goal: null, current: null }

  return { goal: current, current: goal }
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  function isJapanesePage(): boolean {
    const jaEl = document.getElementById('btSignInButtonCultureJa') as HTMLElement | null
    const enEl = document.getElementById('btSignInButtonCultureEn') as HTMLElement | null
    const isBold = (value: string): boolean => value === 'bold' || Number(value) >= 600
    const hasInlineBold = (el: HTMLElement | null): boolean => {
      if (!el)
        return false
      const inline = el.getAttribute('style') || ''
      const match = inline.match(/font-weight\s*:\s*([a-z]+|\d+)/i)
      const weight = match?.[1]
      if (weight)
        return isBold(weight.toLowerCase())
      return isBold(getComputedStyle(el).fontWeight)
    }

    if (hasInlineBold(jaEl)) {
      cachedIsJa = true
      saveLanguageCache(true)
      return true
    }
    if (hasInlineBold(enEl)) {
      cachedIsJa = false
      saveLanguageCache(false)
      return false
    }
    return cachedIsJa ?? false
  }

  function isStudyPage(): boolean {
    const path = document.location.pathname.toLowerCase()
    return path.endsWith('/flashwords.html') || path.endsWith('/wordpanic.html')
  }

  function isLoginPage(): boolean {
    return document.location.pathname.toLowerCase().endsWith('/login.html')
  }

  function getStudyMethod(isJa: boolean): string | null {
    const path = document.location.pathname.toLowerCase()
    if (path.endsWith('/flashwords.html'))
      return isJa ? 'フラッシュワード' : 'Flash Words'
    if (path.endsWith('/wordpanic.html'))
      return isJa ? 'ワードパニック' : 'Word Panic'
    return null
  }

  function getCourseName(): string | null {
    const el = document.querySelector<HTMLElement>('h3.courseListDisplayName')
    const name = (el?.textContent || '').trim()
    return name || null
  }

  function formatProgress(label: string, current: string | null, goal: string | null, isJa: boolean): string {
    const hasCurrent = current !== null
    const hasGoal = goal !== null
    const parseCount = (value: string | null): number | null => {
      if (!value)
        return null
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : null
    }
    const currentCount = parseCount(current)
    const goalCount = parseCount(goal)
    const achieved = currentCount !== null && goalCount !== null && currentCount >= goalCount
    if (isJa) {
      const unit = '単語'
      if (hasCurrent && hasGoal) {
        if (achieved)
          return `${label}: ${current} ${unit} (目標: ${goal} ✅)`
        return `${label}: ${current} ${unit} (目標: ${goal})`
      }
      if (hasCurrent && !hasGoal)
        return `${label}: ${current} ${unit}`
      if (!hasCurrent && hasGoal)
        return `${label}の目標: ${goal}`
      return `${label}のデータを読み込み中...`
    }

    const unitFor = (value: string | null): string => {
      const parsed = value ? Number(value) : Number.NaN
      return Number.isFinite(parsed) && parsed === 1 ? 'Word' : 'Words'
    }

    if (hasCurrent && hasGoal) {
      if (achieved)
        return `${label}: ${current} ${unitFor(current)} (Goal: ${goal} ✅)`
      return `${label}: ${current} ${unitFor(current)} (Goal: ${goal})`
    }
    if (hasCurrent && !hasGoal)
      return `${label}: ${current} ${unitFor(current)}`
    if (!hasCurrent && hasGoal)
      return `${label} Goal: ${goal}`
    return `Loading ${label.toLowerCase()} data...`
  }

  const savedTimestamp = loadStartTimestamp()
  const startTimestamp = savedTimestamp ?? browsingTimestamp
  presenceData.startTimestamp = startTimestamp
  if (!savedTimestamp)
    saveStartTimestamp(startTimestamp)

  if (isLoginPage()) {
    clearSessionTimestamp()
    presence.setActivity(presenceData)
    return
  }

  const isJa = isJapanesePage()
  const todayLabel = isJa ? '今日' : 'Today'
  const weekLabel = isJa ? '今週' : 'This Week'

  const { goal: weekGoal, current: weekCurrent } = queryProgress(WEEKLY_GOAL_SELECTORS, WEEKLY_CURRENT_SELECTORS)
  if (weekGoal || weekCurrent)
    cachedWeek = { goal: weekGoal, current: weekCurrent }

  const { goal: dayGoal, current: dayCurrent } = queryProgress(DAILY_GOAL_SELECTORS, DAILY_CURRENT_SELECTORS)
  if (dayGoal || dayCurrent)
    cachedDay = { goal: dayGoal, current: dayCurrent }

  saveCache()

  const weekText = cachedWeek ? formatProgress(weekLabel, cachedWeek.current, cachedWeek.goal, isJa) : null
  const dayText = cachedDay ? formatProgress(todayLabel, cachedDay.current, cachedDay.goal, isJa) : null

  if (isStudyPage()) {
    const courseName = getCourseName()
    const methodName = getStudyMethod(isJa)
    if (courseName && methodName) {
      presenceData.details = `${courseName} - ${methodName}`
    }
    else if (dayText) {
      presenceData.details = dayText
    }

    if (weekText)
      presenceData.state = weekText
  }
  else {
    if (dayText)
      presenceData.details = dayText
    if (weekText)
      presenceData.state = weekText
  }

  presence.setActivity(presenceData)
})
