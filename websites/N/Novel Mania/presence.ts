import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '738522217221980222',
})
let browsingTimestamp = Math.floor(Date.now() / 1000)
let lastSlug: string = ''

function updateTimestampBySlug(slug: string) {
  if (lastSlug !== slug) {
    lastSlug = slug
    browsingTimestamp = Math.floor(Date.now() / 1000)
  }
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/N/Novel%20Mania/assets/logo.png',
}
let largeImage: any = ActivityAssets.Logo

async function getStrings() {
  return presence.getStrings({
    page: 'general.page',
    view: 'general.view',
    news: 'novelmania.news',
    home: 'general.viewHome',
    search: 'general.search',
    genre: 'novelmania.genre',
    novel: 'novelmania.novel',
    browse: 'general.browsing',
    privacy: 'general.privacy',
    reading: 'general.reading',
    chapter: 'general.chapter',
    lists: 'general.viewAList',
    volume: 'novelmania.volume',
    profile: 'general.viewProfile',
    searchfor: 'general.searchFor',
    viewPage: 'general.buttonViewPage',
    readListButton: 'novelmania.readListButton',
    readNewsButton: 'novelmania.readNewsButton',
    readNovelButton: 'novelmania.readNovelButton',
    readChapterButton: 'novelmania.readChapterButton',
    visitUserProfileButton: 'novelmania.visitUserProfileButton',
  })
}
let oldUserLanguage: string | null = null
let strings: Awaited<ReturnType<typeof getStrings>>

presence.on('UpdateData', async () => {
  const [showButtons, showTime, hideInfo, userLanguage] = await Promise.all([
    presence.getSetting<boolean>('showButtons') || true,
    presence.getSetting<boolean>('showTimestamp') || true,
    presence.getSetting<boolean>('hideInfo') || false,
    presence.getSetting<string>('lang').catch(() => 'pt'),
  ])

  if (oldUserLanguage !== userLanguage) {
    oldUserLanguage = userLanguage
    strings = await getStrings()
  }

  const presenceData: PresenceData = {
    largeImageKey: largeImage,
    type: ActivityType.Watching,
  }
  const { pathname, origin } = window.location
  const cleanPath = pathname.replace(/\/$/, '') || '/'
  const [part1, part2, part3, part4] = cleanPath.slice(1).split('/') // page, slug (if any), chapter (if any), volume/book  (if any)
  const getPageTitle = (): string => document.querySelector('#main h1')?.textContent || strings.novel
  let buttons: [ButtonData, ButtonData?] | undefined
  let currentImage: any

  switch (part1) {
    case '':
      if (cleanPath === '/') {
        presenceData.state = strings.home
      }
      break
    case 'u': /* Seeing some user profile */
      updateTimestampBySlug('u')
      if (hideInfo) {
        presenceData.state = `${strings.profile} ${strings.privacy}`
        break
      }
      presenceData.details = `${strings.profile}`
      presenceData.state = getPageTitle()
      buttons = [{ label: strings.visitUserProfileButton, url: `${origin}/u/${part2}` }]

      currentImage = document.querySelector<HTMLImageElement>('#main img')?.src
      if (currentImage) {
        largeImage = currentImage
        presenceData.largeImageKey = largeImage
        presenceData.largeImageText = getPageTitle() || strings.profile
      }

      break
    case 'novels':
      if (!part2) { /* Searching some novel */
        updateTimestampBySlug('novel-searching')
        if (hideInfo) {
          presenceData.state = `${strings.browse} ${strings.novel}`
          break
        }
        presenceData.details = `${strings.search}`
        presenceData.state = getPageTitle()
        const params = new URLSearchParams(window.location.search)
        const searchTerm = (document.querySelector<HTMLInputElement>('input[name="q"]'))?.value || params.get('q')

        if (searchTerm) {
          presenceData.details = `${strings.searchfor} ${decodeURIComponent(searchTerm)}`
        }

        /* Extract query params while searching for some novel */
        if (searchTerm || window.location.search) {
          const badges = document.querySelectorAll('span.inline-flex.rounded-full.border')
          if (badges.length > 0) {
            const visibleFilters: string[] = []
            for (let i = 0; i < badges.length; i++) {
              const text = badges[i]?.childNodes[0]?.textContent?.trim()
              if (text)
                visibleFilters.push(text)
            }
            if (visibleFilters.length) {
              presenceData.state = visibleFilters.join(', ')
            }
          }
        }
      }
      if (part3 === 'capitulos' && part4) { /* Reading some novel's chapter */
        updateTimestampBySlug(`novel-${part2}-chapter-${part4}`)
        if (hideInfo) {
          presenceData.state = `${strings.reading} ${strings.novel} ${strings.chapter.toLowerCase()}`
          break
        }
        const novelName = document.querySelector('#conteudo-principal > div > header > div > p')?.textContent || part2?.split('-').slice(0, 2).join(' ') || part2?.split('-').join(' ')
        const noveltype = document.querySelector('#conteudo-principal > div > main > div > div > header > p')?.textContent || part4?.split('-').slice(0, 2).join(' ') || part4?.split('-').join(' ')
        const currentChapTitle = document.querySelector('#reader-chapter-title')?.textContent || novelName

        presenceData.details = `${strings.reading} ${novelName}`
        presenceData.state = `${currentChapTitle} -  ${noveltype}`

        buttons = [{ label: strings.readNovelButton, url: `${origin}/novels/${part2}` }, { label: strings.readChapterButton, url: `${origin}/novels/${part2}/capitulos/${part4}` }]

        if (largeImage) {
          presenceData.largeImageKey = largeImage
          presenceData.largeImageText = novelName
        }
      }

      if (part2 && !part3) { /* At some novel's page */
        updateTimestampBySlug(`novel-${part2}`)
        if (hideInfo) {
          presenceData.state = `${strings.view} ${strings.novel}`
          break
        }
        const novelName = document.querySelector('#main > div > h1')?.textContent || part2.split('-').join(' ')
        presenceData.state = `${strings.view} ${novelName}`
        buttons = [{ label: strings.readNovelButton, url: `${origin}/novels/${part2}` }]

        currentImage = document.querySelector<HTMLImageElement>('#main img')?.src
        if (currentImage && currentImage !== largeImage) {
          largeImage = currentImage
          presenceData.largeImageKey = largeImage
          delete presenceData.largeImageText
          presenceData.largeImageText = novelName // Its not showing and idk why
        }
      }
      break
    case 'listas': /* Searching some lists */
      updateTimestampBySlug('list-browsing')
      if (!hideInfo && part2) {
        updateTimestampBySlug('list-reading')
        const listName = document.querySelector('#main > div > div:nth-child(2) > a')?.textContent
        presenceData.details = strings.lists
        presenceData.state = getPageTitle() || listName

        buttons = [{ label: strings.readListButton, url: `${origin}/listas/${part2}` }]

        currentImage = document.querySelector<HTMLImageElement>('#main img')?.src
        if (currentImage && currentImage !== largeImage) {
          largeImage = currentImage
          presenceData.largeImageKey = largeImage
          presenceData.largeImageText = getPageTitle() || listName
        }

        break
      }
      presenceData.state = `${strings.lists}`
      break
    case 'noticias':
      updateTimestampBySlug('news-reading')
      if (hideInfo) {
        presenceData.state = `${strings.view} ${strings.news}`
        break
      }
      if (!part2) { /* Searching some news */
        updateTimestampBySlug('news-browsing')
        presenceData.details = `${strings.reading} ${strings.news}` /* reading news list */
        presenceData.state = getPageTitle()

        break
      }

      presenceData.details = `${strings.reading} ${strings.news}` /* reading a news */
      presenceData.state = `${getPageTitle()}`
      buttons = [{ label: strings.readNewsButton, url: `${origin}/noticias/${part2}` }]

      currentImage = document.querySelector<HTMLImageElement>('#main img')?.src
      if (currentImage) {
        largeImage = currentImage
        presenceData.largeImageKey = largeImage
        presenceData.largeImageText = getPageTitle() || largeImage
      }

      break
    case 'genero': /* Browsing some genres */
      updateTimestampBySlug('genre-searching')
      if (hideInfo) {
        presenceData.state = `${strings.view} ${strings.genre}`
        break
      }
      if (part2) {
        presenceData.details = `${strings.browse} ${strings.genre}`
        presenceData.state = getPageTitle()
      }
      break
    default: /* At any other page, it doesn't matter */
      updateTimestampBySlug('page-reading')
      if (hideInfo) {
        presenceData.state = `${strings.reading} ${strings.page}`
        break
      }
      presenceData.state = `${strings.view} ${getPageTitle()}`

      buttons = [{ label: strings.viewPage, url: origin + pathname }]

      currentImage = document.querySelector<HTMLImageElement>('#main img')?.src
      if (currentImage && currentImage !== largeImage) {
        largeImage = currentImage
        presenceData.largeImageKey = largeImage
        presenceData.largeImageText = getPageTitle() || largeImage
      }

      break
  }
  // Someday I'll make it better.
  if (!lastSlug.includes(`novel-${part2}`) && !lastSlug.includes('list-reading') && !lastSlug.includes('news-reading') && !lastSlug.includes('page-reading') && part1 === '/') {
    largeImage = ActivityAssets.Logo
    presenceData.largeImageKey = largeImage
    delete presenceData.largeImageText
  }
  if (presenceData.state) {
    if (!showTime) {
      delete presenceData.startTimestamp
    }
    else {
      presenceData.startTimestamp = browsingTimestamp
    }
    if (showButtons && buttons && !hideInfo) {
      presenceData.smallImageKey = Assets.Reading
      presenceData.buttons = buttons
    }

    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
