import { ActivityType, Assets} from 'premid'

const presence = new Presence({
  clientId: '1396393095100104785',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/ejBneYz.png',
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

const NovelType: Record<number, string> = {
  [NovelTypeID.Magic]: '魔幻',
  [NovelTypeID.Fantasy]: '玄幻',
  [NovelTypeID.Historical]: '古风',
  [NovelTypeID.SciFi]: '科幻',
  [NovelTypeID.School]: '校园',
  [NovelTypeID.Urban]: '都市',
  [NovelTypeID.Game]: '游戏',
  [NovelTypeID.Doujin]: '同人',
  [NovelTypeID.Mystery]: '悬疑',
}

const NovelProgressStatusMap: Record<number, string> = {
  0: '连载中',
  1: '完结',
}

const UpdatedWithinDaysMap: Record<number, string> = {
  7: '7天内更新',
  15: '15天内更新',
  30: '30天内更新',
}

function decodeUnicode(str: string) {
  return str.replace(/%u[0-9a-fA-F]{4}/g, match =>
    String.fromCharCode(parseInt(match.slice(2), 16))
  );
}

function decodeSearchKey(str: string) {
  try {
    return decodeURIComponent(str); // 尝试标准 URI 解码
  } catch {
    return decodeUnicode(str);      // 如果失败则用 %u 解码
  }
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: '浏览其他页面',
    state: 'SF轻小说',
    // smallImageKey: Assets.Play,
    type: ActivityType.Watching,
  }

  const currentHostname = document.location.hostname
  const currentPathname = document.location.pathname

  switch (currentHostname) {
    case 'book.sfacg.com': {
      switch (true) {
        case currentPathname === '/': {
          presenceData.details = '浏览主页'
          presenceData.state = 'SF轻小说'
          presenceData.startTimestamp = browsingTimestamp
          break
        }
        case currentPathname.includes('/List/'): {
          presenceData.details = '查看小说列表'

          // 提取筛选参数
          const params = new URLSearchParams(document.location.search)
          const novelTypeId = Number.parseInt(params.get('tid') ?? '-1')
          const novelProgressStatus = Number.parseInt(params.get('if') ?? '2')
          const novelUpdatedWithinDays = Number.parseInt(params.get('ud') ?? '-1')
          const novelInitialLetter = params.get('l') ?? '*'

          // 按优先级获取显示值，符合“不限”则返回 undefined
          const novelTypeName = NovelType[novelTypeId] ?? undefined
          const progressStatusName = novelProgressStatus !== 2 ? (NovelProgressStatusMap[novelProgressStatus] ?? undefined) : undefined
          const updatedWithinName = novelUpdatedWithinDays !== -1 ? (UpdatedWithinDaysMap[novelUpdatedWithinDays] ?? undefined) : undefined
          const initialLetterName = (novelInitialLetter !== '*' && novelInitialLetter !== '') ? novelInitialLetter : undefined

          // 先按顺序把可能的值放进数组
          const stateParts = [novelTypeName, progressStatusName, updatedWithinName]

          // 首字母放最后（如果有）
          if (initialLetterName) {
            stateParts.push(`首字母： ${initialLetterName}`)
          }
          // 过滤掉所有 undefined 或空字符串项
          const filteredParts = stateParts.filter(part => part && part.trim() !== '')

          // 根据个数决定如何赋值 state
          if (filteredParts.length === 0) {
            presenceData.state = 'SF轻小说' // 全部不限，state为空
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
          presenceData.details = '查看排行榜'
          presenceData.state = 'SF轻小说'
          break
        }
        case currentPathname.includes('/Novel/'): {
          switch (true) {
            case /^\/Novel\/\d+\/?$/.test(currentPathname): {
              // 小说简介页
              presenceData.details = '浏览小说简介'
              const titleElement = document.querySelector("h1.title .text");
              const authorElement = document.querySelector(".author-name span");

              const title = titleElement?.childNodes[0]?.nodeValue?.trim();
              const author = authorElement?.textContent?.trim();

              let displayTitle: string | undefined
              if (title && author) {
                displayTitle = `《${title}》· ${author}`
              } else if (title) {
                displayTitle = `《${title}》· 未知作者`
              } else if (author) {
                displayTitle = `未知作品 · ${author}`
              } else {
                displayTitle = `未知作品 · 未知作者`
              }
              presenceData.state = displayTitle
              break
            }
          
            case /^\/Novel\/\d+\/MainIndex\/?$/.test(currentPathname): {
              // 章节索引页
              presenceData.details = '查看章节目录'
              const novelTitle = document.querySelector('h1')?.textContent?.trim()
              presenceData.state = novelTitle ? `《${novelTitle}》` : '未知作品'
              break
            }
          
            case /^\/Novel\/\d+\/\d+\/\d+\/?$/.test(currentPathname): {
              // 正在阅读章节中
              presenceData.smallImageKey = Assets.Reading
              const title = document.querySelector('a.item.bold')?.textContent?.trim();
              const chapterName = document.querySelector('h1')?.textContent?.trim();
              const authorText = document.querySelector('.article-desc .text')?.textContent;
              const author = authorText?.replace(/^作者：/, '').trim();
              
              const detailsText = title ? `《${title}》` : '未知作品'
              let stateText: string | undefined
              if (chapterName && author) {
                stateText = `${chapterName} · ${author}`
              } else if (chapterName) {
                stateText = `${chapterName} · 未知作者`
              } else if (author) {
                stateText = `未知章节 · ${author}`
              } else {
                stateText = `未知章节 · 未知作者`
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
      const key = urlParams.get('Key') ?? "";
      const decodedKey = decodeSearchKey(key) ?? undefined;
      
      presenceData.details = '搜索小说';
      presenceData.state = decodedKey ? `>> "${decodedKey}"` : '未知关键词';
    }
  }
  presence.setActivity(presenceData)
})
