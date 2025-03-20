import { Assets } from 'premid'

const presence = new Presence({
  clientId: '696341580096733185',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let currentTime = 0
let currentTime2 = '00:00'
let duration = 0
let duration2 = '00:00'
let paused = true // true if the current gogoanime domain is a clone

const detailed = {
  // both the state and logo to use
  NOTFOUND: ['404', ''],
  BROWSING: ['Browsing...', 'browsing'],
  READING: ['Reading...', 'reading'],
  SEARCHING: ['Searching...', 'browsing'],
  WATCHING: ['Watching...', ''],
  LOGIN: ['Logging in...', 'login'],
  SIGNUP: ['Signing up...', 'signup'],
  BOOKMARK: ['Managing bookmarks...', 'bookmark'],
  REQUESTING: ['Requesting an anime...', 'request'],
  CONTACTING: ['Contacting the support...', 'contact'],
}
interface IFrameData {
  iframeVideo: {
    version: number
    currentTime: number
    currentTime2: string
    duration: number
    duration2: string
    paused: boolean
  }
}

presence.on('iFrameData', (inc: unknown) => {
  const data = inc as IFrameData
  if (data.iframeVideo.version === 0) {
    if (data.iframeVideo.duration) {
      ({
        paused,
        currentTime,
        duration,
      } = data.iframeVideo)
    }
  }
  else {
    ({
      paused,
      currentTime2,
      duration2,
    } = data.iframeVideo)
  }
})

function upperCaseFirstChar(word: string | undefined) {
  if (word)
    return `${word[0]?.toUpperCase()}${word.slice(1, word.length)}`
}

function formatStr(anime: string[]): string {
  return anime
    .reduce((t, c): string => {
      return `${t + upperCaseFirstChar(c)} `
    }, '')
    .replaceAll('Dub', '(Dub)')
}

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location
  const dataPage = document
    .querySelector('[class="pagination-list"]')
    ?.querySelector('a')
    ?.getAttribute('data-page')
  const dataMaxPage = document
    .querySelector('[class="pagination-list"]')
    ?.lastElementChild
    ?.querySelector('a')
    ?.getAttribute('data-page')

  let usedSearchEl: HTMLInputElement | null = null
  if (!pathname.includes('login.html')) {
    const allInput: NodeListOf<HTMLInputElement> = document.querySelectorAll(
      'input[type="search"],input[name="keyword"]',
    )
    const inputArray: HTMLInputElement[] = []
    let inputElement: HTMLInputElement
    for (const i in allInput) inputArray.push(allInput[i] as HTMLInputElement)

    for (inputElement of inputArray) {
      if (
        inputElement?.value?.trim()?.length >= 2
        && inputElement.className !== 'btngui'
        && inputElement.className !== 'reset'
      ) {
        usedSearchEl = inputElement
      }
    }
  }
  else {
    usedSearchEl = null
  }
  let state: string | undefined
  let detail: string[] = detailed.BROWSING
  if (
    document.querySelector('#wrapper_bg > section h1.entry-title')
      ?.textContent === '404'
  ) {
    detail = detailed.NOTFOUND
  }
  else {
    switch (true) {
      case pathname.includes('/watch/'):
      case document.querySelector('[class="title_name"]') !== null:
      case document.querySelector('[class="anime_video_body_watch"]') !== null:
      case document.querySelector('[class="anime_muti_link"]') !== null: {
        let title = document.querySelector('[class="anime-info"] > a')?.textContent
          ?? document.querySelector('[class="title_name"]')?.textContent

        if (!title) {
          title = pathname.includes('/movie/')
            ? pathname
              .split('/')?.[2]
              ?.replace(/-/g, ' ')
              ?.replace(/\(dub\)/g, '')
            : pathname
              .split('/')?.[1]
              ?.replace(/-/g, ' ')
              ?.replace(/\(dub\)/g, '')
        }
        const titleReplaced = document
          .querySelector('[id="episode_related"] > li > [class*="active"]')
          ?.textContent
          ?.replace(/(DUB)|(dub)|(SUB)|(sub)|(\n)/g, '')
          ?.replace('EP', 'Episode')
          ?.trim()
          ?? document
            .querySelector('[class="each_episode active"]')
            ?.textContent
            ?.trim()
            ?? document.querySelector('[class="active"]')?.textContent?.trim()
            ?? document
              .querySelector('[class="anime_video_body"] > h1')
              ?.textContent
              ?.toLowerCase()
              ?.replace(
                /(for free on gogoanime at gogoanime)|(english subbed at gogoanime)|(watch)/g,
                '',
              )
        detail = detailed.WATCHING
        state = titleReplaced
          ? `${upperCaseFirstChar(title?.toLowerCase())} | ${upperCaseFirstChar(
            titleReplaced
              .toLowerCase()
              ?.replace(/(sub)|(dub)(ova)/g, '')
              ?.replace('ep ', 'Episode '),
          )}`
          : `${upperCaseFirstChar(title?.toLowerCase())}`
        break
      }
      case pathname.includes('/anime-list'): {
        state = 'The anime list'
        break
      }
      case pathname.includes('/new-season'):
      case pathname.includes('/recent-release-anime'): {
        state = 'Most recent anime'
        break
      }
      case pathname.includes('/anime-movies'): {
        state = 'Anime movies'
        break
      }
      case pathname.includes('/popular'): {
        state = 'Most popular anime'
        break
      }
      case pathname.includes('/news/reviews'): {
        state = 'Anime reviews'
        break
      }
      case pathname.includes('/news/trailers'): {
        state = 'Anime trailers'
        break
      }
      case pathname.includes('/requested-list'): {
        state = 'The requested anime list'
        break
      }
      case pathname.includes('/upcoming-anime'): {
        state = 'Upcoming anime'
        break
      }
      case pathname.includes('/genre/'): {
        // element otherwise use the url path as fallback
        state = `Anime: ${
          document.querySelector(
            '#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > h1',
          )?.textContent ?? formatStr(pathname.split('/').pop()!.split('-'))
        }`
        break
      }
      case pathname.includes('/season/'):
      case pathname.includes('/sub-category/'): {
        state = `${formatStr(pathname.split('/').pop()!.split('-'))}`
        break
      }
      case pathname === '/announcement.html': {
        state = 'Announcements'
        break
      }
      case pathname === '/news.html': {
        state = 'News'
        break
      }
      case pathname === '/privacy.html': {
        state = 'Announcements'
        break
      }
      case pathname === '/about.html':
      case pathname === '/about-us.html': {
        state = 'About us'
        break
      }
      case pathname === 'contact-us.html': {
        detail = detailed.CONTACTING
        break
      }
      case pathname === '/login.html': {
        detail = detailed.LOGIN
        break
      }
      case pathname === '/register.html': {
        detail = detailed.SIGNUP
        break
      }
      case pathname === '/user/bookmark': {
        detail = detailed.BOOKMARK
        break
      }
      case pathname === '//search.html': {
        detail = detailed.SEARCHING
        state = `Keyword: ${formatStr(
          new URLSearchParams(window.location.search).get('keyword')!.split(' '),
        )}`

        break
      }
      case pathname === '/request-anime.html': {
        detail = detailed.REQUESTING

        state = `Anime: ${
          (document.getElementsByName('title')[0] as HTMLInputElement)?.value
        }`
        break
      }
      case pathname.includes('/requested/'): {
        state = `Requested anime: ${
          document.querySelector(
            '#wrapper_bg > section > section.content_left > div > div.anime_info_body > div > h1',
          )?.textContent ?? formatStr(pathname.split('/').pop()!.split('-'))
        }`
        break
      }
      case pathname.includes('/news/'): {
        detail = detailed.READING
        state = `News: ${
          document.querySelector(
            '#wrapper_bg > section > section.content_left > div > div.page_content > h1',
          )?.textContent
        }`
        break
      }
      case pathname.includes('/announcement/'): {
        detail = detailed.READING
        state = `Announcement: ${
          document.querySelector(
            '#wrapper_bg > section > section.content_left > div > div.page_content > h1',
          )?.textContent
        }`
        break
      }
      case pathname.includes('/reviews/'): {
        detail = detailed.READING
        state = `Review Of: ${
          document.querySelector(
            '#wrapper_bg > section > section.content_left > div > div.page_content > h1',
          )?.textContent
        }`
        break
      }
      case pathname.includes('/trailers/'): {
        detail = detailed.WATCHING
        const anime = document.querySelector(
          '#wrapper_bg > section > section.content_right.block_mb > div:nth-child(1) > div > div.related_right.center_col1 > div > ul > li > div.name > a > h4',
        )?.textContent
        state = `Trailer Of: ${anime}`
        break
      }
      case pathname === '/': {
        const sel = document.querySelector(
          '#load_recent_release > div.anime_name.recent_release > h2',
        )?.children
        if (sel) {
          for (const child of sel) {
            if (child.className.includes('active')) {
              switch (child.textContent) {
                case 'DUB':
                  state = dataPage && dataMaxPage
                    ? `Recent dubbed anime releases (page ${dataPage}/${dataMaxPage})`
                    : 'Recent dubbed anime releases'
                  break
                case 'Chinese':
                  state = dataPage && dataMaxPage
                    ? `Recent Chinese anime releases (page ${dataPage}/${dataMaxPage})`
                    : 'Recent Chinese anime releases'
                  break
                default:
                  state = dataPage && dataMaxPage
                    ? `Recent anime releases (page ${dataPage}/${dataMaxPage})`
                    : 'Recent anime releases'
                  break
              }
              break
            }
          }
        }
        else {
          state = 'Home'
        }

        break
      }
    }
  }
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Gogoanime/assets/logo.png',
    state,
    details: detail[0],
  }
  if (usedSearchEl?.value) {
    presenceData.details = 'Searching for:'
    presenceData.state = usedSearchEl.value.replace(/ /g, '')
    presenceData.smallImageKey = Assets.Search
    return presence.setActivity(presenceData)
  }
  if (detail === detailed.NOTFOUND) {
    presence.setActivity()
  }
  else if (duration || duration2) {
    if (!duration && duration2) {
      duration = presence.timestampFromFormat(duration2)
      currentTime = presence.timestampFromFormat(currentTime2)
    }
    if (paused) {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = `${
        presence.getTimestamps(currentTime, duration)[1]
      } left`
    }
    else {
      presenceData.smallImageKey = Assets.Play;
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(currentTime, duration)
    }
    presenceData.buttons = [
      {
        label: 'Watch Video',
        url: href,
      },
    ]
    presence.setActivity(presenceData)
  }
  else {
    presenceData.startTimestamp = browsingTimestamp
    presence.setActivity(presenceData)
    presenceData.buttons = [
      {
        label: 'Browse',
        url: href,
      },
    ]
  }
})
