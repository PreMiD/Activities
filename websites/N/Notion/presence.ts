import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1455312389837684951',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/IVQpP2j.png',
  Calendar = 'https://i.imgur.com/MPUipsT.png',
  Mail = 'https://i.imgur.com/vIGQhCL.png',
  Talking = 'https://i.imgur.com/aWWXjuc.png',
}

async function svgToPng(svgUrl: string): Promise<string | undefined> {
  if (!svgUrl || !svgUrl.includes('.svg'))
    return

  const response = await fetch(svgUrl)
  const svgText = await response.text()

  const img = new Image()
  const svgBlob = new Blob([svgText], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(svgBlob)
  img.src = url

  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
  })

  const maxSize = Math.max(img.width, img.height)
  const canvas = document.createElement('canvas')
  canvas.width = maxSize
  canvas.height = maxSize
  const ctx = canvas.getContext('2d')

  let png: string | undefined
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const x = (maxSize - img.width) / 2
    const y = (maxSize - img.height) / 2
    ctx.drawImage(img, x, y, img.width, img.height)

    png = canvas.toDataURL('image/png')
  }

  URL.revokeObjectURL(url)
  return png
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const strings = await presence.getStrings({
    aiResponding: 'notion.aiResponding',
    browseCategory: 'notion.browseCategory',
    browsingTemplates: 'notion.browsingTemplates',
    category: 'notion.category',
    conversationStats: 'notion.conversationStats',
    editAMeetingNote: 'notion.editAMeetingNote',
    editMeetingNote: 'notion.editMeetingNote',
    editing: 'notion.editing',
    editingAPage: 'notion.editingAPage',
    editingPage: 'notion.editingPage',
    reading: 'notion.reading',
    readingAPage: 'notion.readingAPage',
    readingAnArticle: 'general.readingAnArticle',
    readingArticle: 'general.readingArticle',
    readingBlogs: 'notion.readingBlogs',
    readingCustomerReview: 'notion.readingCustomerReview',
    readingPage: 'notion.readingPage',
    searchingTemplate: 'notion.searchingTemplate',
    startNewConversation: 'notion.startNewConversation',
    talkingWithAI: 'notion.talkingWithAI',
    template: 'notion.template',
    thinkingOfPrompt: 'notion.thinkingOfPrompt',
    unknown: 'notion.unknown',
    viewAProfile: 'general.viewAProfile',
    viewDownloadsPage: 'notion.viewDownloadsPage',
    viewHome: 'general.viewHome',
    viewPage: 'general.viewPage',
    viewProductsPage: 'notion.viewProductsPage',
    viewProfile: 'general.viewProfile',
    viewPublicWebsite: 'notion.viewPublicWebsite',
    viewUpcomingMeeting: 'notion.viewUpcomingMeeting',
  })
  const { hostname, pathname, search } = document.location
  const privacy = await presence.getSetting<boolean>('privacy')

  switch (true) {
    case hostname === 'www.notion.com':
      if (/^\/(?:[a-z]{2}(?:-[a-z]{2})?)?$/i.test(pathname) || /^(?:\/[a-zA-Z]{2}(?:-[a-zA-Z]{2})?)?\/product(?:$|\/.*)/.test(pathname)) {
        if (/^\/(?:[a-z]{2}(?:-[a-z]{2})?)?$/i.test(pathname) || /^(?:\/[a-zA-Z]{2}(?:-[a-zA-Z]{2})?)?\/product$/.test(pathname)) {
          presenceData.details = strings.viewHome
        }
        else if (pathname.endsWith('/download') || pathname.includes('/download')) {
          presenceData.details = strings.viewDownloadsPage
        }
        else {
          presenceData.details = strings.viewProductsPage
        }
      }
      else if (pathname.includes('/desktop') || pathname.includes('/mobile') || pathname.includes('/web-clipper')) {
        presenceData.details = strings.viewDownloadsPage
      }
      else if (pathname.includes('/blog')) {
        const blogTitle = document.querySelector('h1[class*="title"]')
        if (blogTitle) {
          presenceData.details = privacy ? strings.readingAnArticle : strings.readingArticle
          presenceData.state = privacy ? '' : blogTitle?.textContent?.trim() || document.title
        }
        else {
          presenceData.details = strings.readingBlogs
        }
      }
      else if (pathname.includes('/customers')) {
        presenceData.details = strings.readingCustomerReview
      }
      else if (pathname.includes('/templates')) {
        if (pathname.includes('/category')) {
          if (/^(?:\/[a-z]{2}(?:-[a-z]{2})?)?\/templates\/category$/i.test(pathname)) {
            presenceData.details = strings.browseCategory
          }
          else {
            presenceData.details = strings.browsingTemplates
            presenceData.state = strings.category?.replace('{0}', document.querySelector('h1')?.textContent?.trim() || strings.unknown)
          }
        }
        else if (/^(?:\/[a-z]{2}(?:-[a-z]{2})?)?\/templates\/.*$/i.test(pathname)) {
          presenceData.details = strings.browsingTemplates
          presenceData.state = strings.template?.replace('{0}', document.querySelector('div[role="dialog"] h1')?.textContent?.trim() || document.querySelector('main h1')?.textContent?.trim() || strings.unknown)
        }
        else {
          presenceData.details = strings.browsingTemplates
        }
      }
      else if (pathname.includes('/@')) {
        presenceData.details = privacy ? strings.viewAProfile : strings.viewProfile
        presenceData.state = privacy ? '' : document.querySelector('main h3')?.textContent
      }
      else {
        presenceData.details = strings.viewPage
        presenceData.state = document.title?.split('|')[0]?.trim()
      }
      break
    case hostname === 'www.notion.so': {
      const isHome = document.querySelector('.layout-home')
      if (isHome) {
        presenceData.details = strings.viewHome
      }
      else if (pathname.startsWith('/ai')) {
        presenceData.details = strings.startNewConversation
        presenceData.state = strings.thinkingOfPrompt
      }
      else if (pathname.startsWith('/chat') && search.startsWith('?t=')) {
        const isTalking = document.querySelector(
          'div[data-testid="agent-stop-inference-button"]',
        )
        let wordCount = 0
        for (const element of document.querySelectorAll(
          'div[role="textbox"]',
        )) {
          const text = element.textContent
            ?.replace(/, |,\n|,|\. |\./g, ' ')
            // eslint-disable-next-line regexp/no-dupe-disjunctions
            .replace(/\d*|[/', ]/g, '')
          if (text) {
            wordCount += text.split(' ').slice(2, text.split(' ').length).length
          }
        }
        presenceData.details = !privacy ? document.title : strings.talkingWithAI
        presenceData.state = isTalking
          ? strings.aiResponding
          : strings.conversationStats
              .replace(
                '{0}',
                `${Number(
                  document.querySelectorAll('div[role="textbox"].content-editable-leaf-rtl')
                    .length,
                )}`,
              )
              .replace('{1}', `${wordCount}`)
        presenceData.smallImageKey = isTalking ? ActivityAssets.Talking : null
      }
      else if (pathname.startsWith('/chat')) {
        presenceData.details = strings.startNewConversation
        presenceData.state = strings.thinkingOfPrompt
      }
      else if (pathname.startsWith('/meet') && search.startsWith('?p=')) {
        const pageIcon = document.querySelector<HTMLImageElement>('div[style*="display: flow-root"] .notion-record-icon img:not([src^="data:image"]):not([src*="notion-emojis"])')
        presenceData.details = privacy ? strings.editAMeetingNote : strings.editMeetingNote
        presenceData.state = privacy ? '' : document.querySelector('.notion-peek-renderer .layout-content h1')?.textContent || document.querySelector('h1')?.textContent || strings.unknown
        if (pageIcon && !privacy) {
          presenceData.smallImageKey = pageIcon?.src?.includes('.svg') ? await svgToPng(pageIcon?.src) : pageIcon?.src
        }
        else {
          presenceData.smallImageKey = Assets.Writing
        }
        presenceData.smallImageText = strings.editing
      }
      else if (pathname.startsWith('/meet')) {
        presenceData.details = strings.viewUpcomingMeeting
      }
      else if (pathname.startsWith('/marketplace')) {
        presenceData.details = strings.browsingTemplates
        if (pathname.startsWith('/marketplace/categories')) {
          const categoryPath = document.querySelectorAll('.layout-full[style*="position: sticky"] a')
          const categoryName = categoryPath[categoryPath.length - 1]?.textContent?.trim() || document.querySelector('.layout-marketplace > .layout-content')?.textContent?.trim() || strings.unknown
          presenceData.state = strings.category?.replace('{0}', categoryName)
        }
        else if (pathname.startsWith('/marketplace/templates')) {
          const templatePath = document.querySelectorAll('.layout-full a')
          const templateName = document.querySelector('.layout-marketplace > .layout-content div[role="link"]')?.nextElementSibling?.textContent?.trim() || templatePath[templatePath.length - 1]?.textContent?.trim() || strings.unknown
          presenceData.state = strings.template?.replace('{0}', templateName)
        }
        else if (pathname.startsWith('/marketplace/search')) {
          const params = new URLSearchParams(search)
          presenceData.state = strings.searchingTemplate?.replace('{0}', params.get('query')!)
        }
        else if (pathname.startsWith('/marketplace/profiles')) {
          const profilePath = document.querySelectorAll('.layout-full a')
          const profileName = profilePath[profilePath.length - 1]?.textContent?.trim() || strings.unknown
          presenceData.details = privacy ? strings.viewAProfile : strings.viewProfile
          presenceData.state = privacy ? '' : profileName
        }
        else {
          presenceData.details = strings.browsingTemplates
        }
      }
      else {
        const isEditable = document.querySelector('.notion-page-controls > div[role="button"]')
        const topBarIcon = document.querySelectorAll<HTMLImageElement>('.notion-topbar .notion-record-icon img:not([src^="data:image"]):not([src*="notion-emojis"])')
        const pageIcon = document.querySelector<HTMLImageElement>('div[style*="display: flow-root"] .notion-record-icon img:not([src^="data:image"]):not([src*="notion-emojis"])') || topBarIcon[topBarIcon.length - 1]
        if (isEditable) {
          presenceData.details = privacy ? strings.editingAPage : strings.editingPage
          presenceData.state = privacy ? '' : document.querySelector('.notion-overlay-container h1')?.textContent || document.querySelector('.notion-peek-renderer .layout-content h1')?.textContent || document.querySelector('h1')?.textContent || document.querySelector('.notion-topbar div[role="button"] > div.notranslate')?.textContent || document.title
          if (pageIcon && !privacy) {
            presenceData.smallImageKey = pageIcon?.src?.includes('.svg') ? await svgToPng(pageIcon?.src) : pageIcon?.src
          }
          else {
            presenceData.smallImageKey = Assets.Writing
          }
          presenceData.smallImageText = strings.editing
        }
        else {
          presenceData.details = privacy ? strings.readingAPage : strings.readingPage
          presenceData.state = privacy ? '' : document.querySelector('.notion-overlay-container h1')?.textContent || document.querySelector('.notion-peek-renderer .layout-content h1')?.textContent || document.querySelector('h1')?.textContent || document.querySelector('.notion-topbar div[role="button"] > div.notranslate')?.textContent || document.title
          if (pageIcon && !privacy) {
            presenceData.smallImageKey = pageIcon?.src?.includes('.svg') ? await svgToPng(pageIcon?.src) : pageIcon?.src
          }
          else {
            presenceData.smallImageKey = Assets.Reading
          }
          presenceData.smallImageText = strings.reading
        }
      }
      break
    }
    case /^[a-z0-9-]+\.notion\.site$/.test(hostname): {
      const websiteLogo = document.querySelector<HTMLImageElement>('div[style*="display: flow-root"] .notion-record-icon img:not([src^="data:image"]):not([src*="notion-emojis"])')?.src || document.querySelector<HTMLImageElement>('.notion-topbar .notion-record-icon img:not([src^="data:image"]):not([src*="notion-emojis"])')?.src || ActivityAssets.Logo
      presenceData.details = strings.viewPublicWebsite
      presenceData.state = privacy ? '' : document.querySelector('h1')?.textContent || document.querySelector('.notion-topbar span')?.textContent || document.title
      presenceData.largeImageKey = privacy ? ActivityAssets.Logo : (websiteLogo.includes('.svg') ? await svgToPng(websiteLogo) || ActivityAssets.Logo : websiteLogo || ActivityAssets.Logo)
      break
    }
    case hostname === 'calendar.notion.so':
      presenceData.name = 'Notion Calendar'
      presenceData.largeImageKey = ActivityAssets.Calendar
      break
    case hostname === 'mail.notion.so':
      presenceData.name = 'Notion Mail'
      presenceData.largeImageKey = ActivityAssets.Mail
      break
    default:
      presenceData.details = strings.viewPage
      presenceData.state = document.title?.split('|')[0]?.trim()
      break
  }

  presence.setActivity(presenceData)
})
