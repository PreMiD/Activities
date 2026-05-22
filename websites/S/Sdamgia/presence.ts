const presence = new Presence({
  clientId: '1500109253170692187',
})

const subjectNames: Record<string, string> = {
  // ЕГЭ / ОГЭ
  rus: 'русскому языку',
  math: 'математике',
  mathb: 'базовой математике',
  phys: 'физике',
  inf: 'информатике',
  chem: 'химии',
  bio: 'биологии',
  en: 'английскому языку',
  geo: 'географии',
  de: 'немецкому языку',
  soc: 'обществознанию',
  fr: 'французскому языку',
  lit: 'литературе',
  sp: 'испанскому языку',
  hist: 'истории',
  ruso: 'русскому языку (устное собеседование)',
  // ВПР — математика
  math4: 'математике (4 класс)',
  math5: 'математике (5 класс)',
  math6: 'математике (6 класс)',
  math7: 'математике (7 класс)',
  math7p: 'математике (7 класс)',
  math8: 'математике (8 класс)',
  math8p: 'математике (8 класс)',
  math10: 'математике (10 класс)',
  // ВПР — физика
  phys7: 'физике (7 класс)',
  phys7p: 'физике (7 класс)',
  phys8: 'физике (8 класс)',
  phys8p: 'физике (8 класс)',
  phys10: 'физике (10 класс)',
  phys11: 'физике (11 класс)',
  // ВПР — информатика
  inf7: 'информатике (7 класс)',
  inf8: 'информатике (8 класс)',
  // ВПР — химия
  chem8: 'химии (8 класс)',
  chem10: 'химии (10 класс)',
  chem11: 'химии (11 класс)',
  // ВПР — русский язык
  rus2: 'русскому языку (2 класс)',
  rus4: 'русскому языку (4 класс)',
  rus5: 'русскому языку (5 класс)',
  rus6: 'русскому языку (6 класс)',
  rus7: 'русскому языку (7 класс)',
  rus8: 'русскому языку (8 класс)',
  rus10: 'русскому языку (10 класс)',
  // ВПР — биология
  bio5: 'биологии (5 класс)',
  bio6: 'биологии (6 класс)',
  bio6c: 'биологии (6 класс)',
  bio7: 'биологии (7 класс)',
  bio8: 'биологии (8 класс)',
  bio8c: 'биологии (8 класс)',
  bio10: 'биологии (10 класс)',
  bio11: 'биологии (11 класс)',
  // ВПР — английский
  en4: 'английскому языку (4 класс)',
  en5: 'английскому языку (5 класс)',
  en6: 'английскому языку (6 класс)',
  en7: 'английскому языку (7 класс)',
  en8: 'английскому языку (8 класс)',
  en10: 'английскому языку (10 класс)',
  en11: 'английскому языку (11 класс)',
  // ВПР — география
  geo5: 'географии (5 класс)',
  geo6: 'географии (6 класс)',
  geo7: 'географии (7 класс)',
  geo8: 'географии (8 класс)',
  geo10: 'географии (10 класс)',
  geo11: 'географии (11 класс)',
  // ВПР — немецкий
  de4: 'немецкому языку (4 класс)',
  de5: 'немецкому языку (5 класс)',
  de6: 'немецкому языку (6 класс)',
  de7: 'немецкому языку (7 класс)',
  de8: 'немецкому языку (8 класс)',
  de10: 'немецкому языку (10 класс)',
  de11: 'немецкому языку (11 класс)',
  // ВПР — обществознание
  soc6: 'обществознанию (6 класс)',
  soc7: 'обществознанию (7 класс)',
  soc8: 'обществознанию (8 класс)',
  soc10: 'обществознанию (10 класс)',
  // ВПР — французский
  fr4: 'французскому языку (4 класс)',
  fr5: 'французскому языку (5 класс)',
  fr6: 'французскому языку (6 класс)',
  fr7: 'французскому языку (7 класс)',
  fr8: 'французскому языку (8 класс)',
  fr10: 'французскому языку (10 класс)',
  fr11: 'французскому языку (11 класс)',
  // ВПР — литература
  lit4: 'литературе (4 класс)',
  lit5: 'литературе (5 класс)',
  lit6: 'литературе (6 класс)',
  lit7: 'литературе (7 класс)',
  lit8: 'литературе (8 класс)',
  lit10: 'литературе (10 класс)',
  // ВПР — история
  hist5: 'истории (5 класс)',
  hist6: 'истории (6 класс)',
  hist7: 'истории (7 класс)',
  hist8: 'истории (8 класс)',
  hist10: 'истории (10 класс)',
  hist11: 'истории (11 класс)',
  // ВПР — окружающий мир
  nat4: 'окружающему миру (4 класс)',
}

const examTypeNames: Record<string, string> = {
  ege: 'ЕГЭ',
  oge: 'ОГЭ',
  vpr: 'ВПР',
}

function parseTimeToSeconds(timeStr: string): number {
  const parts = timeStr.trim().split(':').map(Number)
  if (parts.length === 3)
    return (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0)
  if (parts.length === 2)
    return (parts[0] ?? 0) * 60 + (parts[1] ?? 0)
  return 0
}

function formatSeconds(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`
}

presence.on('UpdateData', async () => {
  const { pathname, hostname, search } = document.location

  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/7uZXeCU.png',
  }

  // Special top-level subdomains
  let subdomain = hostname.split('.')[0] ?? ''
  if (subdomain === 'vpr')
    subdomain = 'phys11-vpr'
  else if (subdomain === 'ege')
    subdomain = 'math-ege'
  else if (subdomain === 'oge')
    subdomain = 'math-oge'

  const lastDash = subdomain.lastIndexOf('-')
  const subject = lastDash !== -1 ? subdomain.slice(0, lastDash) : subdomain
  const examType = lastDash !== -1 ? subdomain.slice(lastDash + 1) : ''

  const subjectName = subjectNames[subject]
  const examTypeName = examTypeNames[examType]

  if (!subjectName || !examTypeName) {
    presenceData.details = 'Решает экзамен'
    presence.setActivity(presenceData)
    return
  }

  if (pathname === '/test') {
    const params = new URLSearchParams(search)
    const themeId = params.get('theme')
    const testId = params.get('id')

    if (themeId) {
      presenceData.details = `Решает задания ${examTypeName} по ${subjectName}`

      const headerEl = document.querySelector<HTMLElement>('.new_header b')
      if (headerEl) {
        const themeName = headerEl.textContent?.replace(/\s+/g, ' ').trim() ?? ''
        presenceData.state = themeName
      }
    }
    else if (testId) {
      presenceData.details = `Решает вариант №${testId} ${examTypeName} по ${subjectName}`

      const elapsedEl = document.querySelector<HTMLElement>('#tview')
      const remainingEl = document.querySelector<HTMLElement>('#rtview')

      if (elapsedEl && remainingEl) {
        const elapsedText = elapsedEl.textContent?.trim() ?? '0:00:00'
        const remainingText = remainingEl.textContent?.trim() ?? '0:00:00'

        const elapsedSec = parseTimeToSeconds(elapsedText)
        const remainingSec = parseTimeToSeconds(remainingText)
        const totalSec = elapsedSec + remainingSec

        presenceData.state = `Прошло ${elapsedText} из ${formatSeconds(totalSec)}`

        const now = Math.floor(Date.now() / 1000)
        presenceData.startTimestamp = now - elapsedSec
        presenceData.endTimestamp = now + remainingSec
      }
    }
    else {
      presenceData.details = `Решает вариант ${examTypeName} по ${subjectName}`
    }
  }
  else if (pathname === '/problem' || pathname === '/problem/') {
    const params = new URLSearchParams(search)
    const problemId = params.get('id')

    presenceData.details = `Решает ${examTypeName} по ${subjectName}`

    if (problemId) {
      const problemLink = document.querySelector<HTMLAnchorElement>(`a[href="/problem?id=${problemId}"]`)
      const typeMatch = problemLink?.parentElement?.textContent?.match(/Тип\s*(\d+)/)
      presenceData.state = typeMatch
        ? `Задание Тип ${typeMatch[1]} №${problemId}`
        : `Задание №${problemId}`
    }
  }
  else if (pathname === '/') {
    presenceData.details = `Просматривает главную страницу ${examTypeName} по ${subjectName}`
  }
  else {
    presenceData.details = `Изучает ${examTypeName} по ${subjectName}`
  }

  presence.setActivity(presenceData)
})
