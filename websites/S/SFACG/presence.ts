import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1396393095100104785',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/SFACG/assets/logo.png',
}

enum NovelTypeID {
  Magic = 21, // 魔幻
  Fantasy = 22, // 玄幻
  Historical = 23, // 古风
  SciFi = 24, // 科幻
  School = 25, // 校园
  Urban = 26, // 都市
  Game = 27, // 游戏
  Doujin = 28, // 同人
  Mystery = 29, // 悬疑
}

const NovelType: Record<number, { zh: string, en: string }> = {
  [NovelTypeID.Magic]: { zh: '魔幻', en: 'Magic' },
  [NovelTypeID.Fantasy]: { zh: '玄幻', en: 'Fantasy' },
  [NovelTypeID.Historical]: { zh: '古风', en: 'Historical' },
  [NovelTypeID.SciFi]: { zh: '科幻', en: 'Sci-Fi' },
  [NovelTypeID.School]: { zh: '校园', en: 'School' },
  [NovelTypeID.Urban]: { zh: '都市', en: 'Urban' },
  [NovelTypeID.Game]: { zh: '游戏', en: 'Game' },
  [NovelTypeID.Doujin]: { zh: '同人', en: 'Doujin' },
  [NovelTypeID.Mystery]: { zh: '悬疑', en: 'Mystery' },
}

const NovelProgressStatusMap: Record<number, { zh: string, en: string }> = {
  0: { zh: '连载中', en: 'Ongoing' },
  1: { zh: '完结', en: 'Completed' },
}

const UpdatedWithinDaysMap: Record<number, { zh: string, en: string }> = {
  7: { zh: '7天内更新', en: 'Updated within 7 days' },
  15: { zh: '15天内更新', en: 'Updated within 15 days' },
  30: { zh: '30天内更新', en: 'Updated within 30 days' },
}

function decodeUnicode(str: string) {
  return str.replace(/%u[0-9a-fA-F]{4}/g, match => String.fromCharCode(Number.parseInt(match.slice(2), 16)))
}

function decodeSearchKey(str: string) {
  try {
    return decodeURIComponent(str) // 尝试标准 URI 解码
  }
  catch {
    return decodeUnicode(str) // 如果失败则用 %u 解码
  }
}

const outlineCache: Record<string, string | null> = {}

function extractNovelIdFromPath(path: string): string | null {
  const match = path.match(/^\/Novel\/(\d+)/)
  return match?.[1] || null
}

async function fetchOutlinePage(novelId: string): Promise<string | null> {
  const cached = outlineCache[novelId]
  if (cached !== undefined) {
    return cached
  }

  const url = `https://book.sfacg.com/Novel/${novelId}/`
  try {
    const res = await fetch(url)
    if (!res.ok) {
      outlineCache[novelId] = null
      return null
    }
    const html = await res.text()
    outlineCache[novelId] = html
    return html
  }
  catch (e) {
    console.error('Failed to fetch outline page:', e)
    outlineCache[novelId] = null
    return null
  }
}

function extractCoverUrlFromHTML(html: string): string | null {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const imgEl = doc.querySelector('.left-part .pic img')
  if (imgEl instanceof HTMLImageElement) {
    return imgEl.src
  }
  return null
}

async function resolveCoverFromOutline(): Promise<string | null> {
  const novelId = extractNovelIdFromPath(document.location.pathname)
  if (!novelId) {
    return null
  }

  const html = await fetchOutlinePage(novelId)
  if (!html) {
    return null
  }

  return extractCoverUrlFromHTML(html)
}

const browserLang = navigator.language
const userLang = browserLang.includes('zh') ? 'zh' : 'en'
function t(zh: string, en: string): string {
  return userLang === 'zh' ? zh : en
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: t('浏览其他页面', 'Viewing other pages'),
    state: t('SF轻小说', 'SF Novels'),
    // smallImageKey: Assets.Play,
    type: ActivityType.Watching,
  }

  const currentHostname = document.location.hostname
  const currentPathname = document.location.pathname

  switch (currentHostname) {
    case 'book.sfacg.com': {
      switch (true) {
        case currentPathname === '/': {
          presenceData.details = t('浏览主页', 'Viewing home page')
          presenceData.state = t('SF轻小说', 'SF Novels')
          presenceData.startTimestamp = browsingTimestamp
          break
        }
        case currentPathname.includes('/List/'): {
          presenceData.details = t('查看小说列表', 'Viewing novels list')

          // 提取筛选参数
          const params = new URLSearchParams(document.location.search)
          const novelTypeId = Number.parseInt(params.get('tid') ?? '-1')
          const novelProgressStatus = Number.parseInt(params.get('if') ?? '2')
          const novelUpdatedWithinDays = Number.parseInt(params.get('ud') ?? '-1')
          const novelInitialLetter = params.get('l') ?? '*'

          // 按优先级获取显示值，符合“不限”则返回 undefined
          const novelTypeName = NovelType[novelTypeId]?.[userLang] ?? undefined
          const progressStatusName = novelProgressStatus !== 2 ? (NovelProgressStatusMap[novelProgressStatus]?.[userLang] ?? undefined) : undefined
          const updatedWithinName = novelUpdatedWithinDays !== -1 ? (UpdatedWithinDaysMap[novelUpdatedWithinDays]?.[userLang] ?? undefined) : undefined
          const initialLetterName = (novelInitialLetter !== '*' && novelInitialLetter !== '') ? novelInitialLetter : undefined

          // 先按顺序把可能的值放进数组
          const stateParts = [novelTypeName, progressStatusName, updatedWithinName]

          // 首字母放最后（如果有）
          if (initialLetterName) {
            stateParts.push(`${t('首字母', 'InitialLetter')}： ${initialLetterName}`)
          }
          // 过滤掉所有 undefined 或空字符串项
          const filteredParts = stateParts.filter(part => part && part.trim() !== '')

          // 根据个数决定如何赋值 state
          if (filteredParts.length === 0) {
            presenceData.state = t('SF轻小说', 'SF Novels') // 全部不限，state为空
          }
          else if (filteredParts.length === 1) {
            presenceData.state = filteredParts[0] // 只有一个筛选项，不加“·”
          }
          else {
            presenceData.state = filteredParts.join(' · ') // 多个筛选项，用“·”连接
          }
          break
        }
        case currentPathname.includes('/rank/'): {
          presenceData.details = t('查看排行榜', 'Viewing rankings')
          presenceData.state = t('SF轻小说', 'SF Novels')
          break
        }
        case currentPathname.includes('/Novel/'): {
          let coverUrl = ''
          switch (true) {
            case /^\/Novel\/\d+\/?$/.test(currentPathname): {
              // 小说简介页
              const el = document.querySelector('.summary-pic img')
              if (el instanceof HTMLImageElement) {
                coverUrl = el.src
              }
              if (!coverUrl) {
                const el2 = document.querySelector('.left-part .pic img')
                if (el2 instanceof HTMLImageElement) {
                  coverUrl = el2.src
                }
              }
              presenceData.details = t('浏览小说简介', 'Viewing novel description')
              presenceData.largeImageKey = coverUrl
              const titleElement = document.querySelector('h1.title .text')
              const authorElement = document.querySelector('.author-name span')

              const title = titleElement?.childNodes[0]?.nodeValue?.trim()
              const author = authorElement?.textContent?.trim()

              let displayTitle: string | undefined
              if (title && author) {
                displayTitle = `《${title}》· ${author}`
              }
              else if (title) {
                displayTitle = `《${title}》· ${t('未知作者', 'Unknow Author')}`
              }
              else if (author) {
                displayTitle = `${t('未知作品', 'Unknow Title')} · ${author}`
              }
              else {
                displayTitle = `${t('未知作品', 'Unknow Title')} · ${t('未知作者', 'Unknow Author')}`
              }
              presenceData.state = displayTitle
              break
            }
            case /^\/Novel\/\d+\/MainIndex\/?$/.test(currentPathname): {
              // 章节索引页
              coverUrl = await resolveCoverFromOutline() ?? ActivityAssets.Logo
              presenceData.largeImageKey = coverUrl
              presenceData.details = t('查看章节目录', 'Viewing chapter index')
              const novelTitle = document.querySelector('h1')?.textContent?.trim()
              presenceData.state = novelTitle ? `《${novelTitle}》` : t('未知作品', 'Unknow Title')
              break
            }
            case /^\/Novel\/\d+\/\d+\/\d+\/?$/.test(currentPathname): {
              // 正在阅读章节中
              coverUrl = await resolveCoverFromOutline() ?? ActivityAssets.Logo
              presenceData.largeImageKey = coverUrl
              presenceData.smallImageKey = Assets.Reading
              const title = document.querySelector('a.item.bold')?.textContent?.trim()
              const chapterName = document.querySelector('h1')?.textContent?.trim()
              const authorText = document.querySelector('.article-desc .text')?.textContent
              const author = authorText?.replace(/^作者：/, '').trim()
              const detailsText = title ? `${t('阅读', 'Reading')}《${title}》` : t('未知作品', 'Unknow Title')
              let stateText: string | undefined
              if (chapterName && author) {
                stateText = `${chapterName} · ${author}`
              }
              else if (chapterName) {
                stateText = `${chapterName} · ${t('未知作者', 'Unknow Author')}`
              }
              else if (author) {
                stateText = `${t('未知章节', 'Unknow Chapter')} · ${author}`
              }
              else {
                stateText = `${t('未知章节', 'Unknow Chapter')} · ${t('未知作者', 'Unknow Author')}`
              }
              presenceData.details = detailsText
              presenceData.state = stateText
              break
            }
          }
          break
        }
      }
      break
    }
    case 's.sfacg.com': {
      // 此处获取QueryKey
      const urlParams = new URLSearchParams(document.location.search)
      const key = urlParams.get('Key') ?? ''
      const decodedKey = decodeSearchKey(key) ?? undefined
      presenceData.details = t('搜索小说', 'Searching Novels')
      presenceData.state = decodedKey ? `>> "${decodedKey}"` : t('未知关键词', 'Unknow Keys')
    }
  }
  presence.setActivity(presenceData)
})
