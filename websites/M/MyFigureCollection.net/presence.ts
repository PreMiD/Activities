import type ActivityStrings from './MyFigureCollection.net.json'

declare global {
  interface StringKeys {
    MyFigureCollection: keyof typeof ActivityStrings
  }
}

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const slideshow = presence.createSlideshow()

const BACKGROUND_URL_REGEX = /url\("(.*)"\)/

enum ActivityAssets {
  Logo = 'https://i.imgur.com/bRgn1zR.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    name: 'MyFigureCollection',
  }
  const { pathname, href, search } = document.location
  const params = new URLSearchParams(search)
  const pathList = pathname.split('/').filter(Boolean)
  const title = document.querySelector('h1')
  const strings = await presence.getStrings({
    browseClubs: 'myfigurecollection.browseClubs',
    browseEntries: 'myfigurecollection.browseEntries',
    browseItems: 'myfigurecollection.browseItems',
    browseTag: 'myfigurecollection.browseTag',
    browsing: 'general.browsing',
    buttonReadArticle: 'general.buttonReadArticle',
    buttonViewAd: 'myfigurecollection.buttonViewAd',
    buttonViewClub: 'myfigurecollection.buttonViewClub',
    buttonViewEntry: 'myfigurecollection.buttonViewEntry',
    buttonViewItem: 'myfigurecollection.buttonViewItem',
    buttonViewList: 'myfigurecollection.buttonViewList',
    buttonViewPage: 'general.buttonViewPage',
    buttonViewPicture: 'myfigurecollection.buttonViewPicture',
    buttonViewProfile: 'general.buttonViewProfile',
    buttonViewShop: 'myfigurecollection.buttonViewShop',
    byAuthor: 'myfigurecollection.byAuthor',
    readingAnArticle: 'general.readingAnArticle',
    viewAd: 'myfigurecollection.viewAd',
    viewClub: 'myfigurecollection.viewClub',
    viewEntry: 'myfigurecollection.viewEntry',
    viewHome: 'general.viewHome',
    viewItem: 'myfigurecollection.viewItem',
    viewItemComments: 'myfigurecollection.viewItemComments',
    viewList: 'general.viewList',
    viewPage: 'general.viewPage',
    viewPicture: 'myfigurecollection.viewPicture',
    viewPictureComments: 'myfigurecollection.viewPictureComments',
    viewProfile: 'general.viewProfile',
    viewShop: 'myfigurecollection.viewShop',
    viewThread: 'general.viewThread',
  })
  let useSlideshow = false

  const searchSection = params.get('_tb')
  const searchTab = params.get('tab')
  const searchMode = params.get('mode')
  if (searchSection) { // Search
    //
  }
  else if (pathList.length === 1) {
    presenceData.details = strings.viewPage
    presenceData.state = title
  }
  else {
    switch (pathList[0] ?? '/') {
      case '/': {
        presenceData.details = strings.viewHome
        break
      }
      case 'blogpost': {
        presenceData.details = strings.readingAnArticle
        presenceData.state = title
        presenceData.smallImageKey = document.querySelector<HTMLImageElement>('.thumbnail')
        presenceData.buttons = [{ label: strings.buttonReadArticle, url: href }]
        break
      }
      case 'classified': {
        presenceData.details = strings.viewAd
        // presenceData.state = title // TODO: extract item name
        presenceData.buttons = [{ label: strings.buttonViewAd, url: href }]
        break
      }
      case 'club': {
        if (pathList[1] === 'browse') {
          presenceData.details = strings.browseClubs
          break
        }
        presenceData.details = strings.viewClub
        presenceData.state = title
        presenceData.smallImageKey = document.querySelector<HTMLImageElement>('.thumbnail')
        presenceData.smallImageText = document.querySelector('.current')
        presenceData.buttons = [{ label: strings.buttonViewClub, url: href }]
        break
      }
      case 'entry': {
        if (pathList[1] === 'browse') {
          presenceData.details = strings.browseEntries
          presenceData.state = document.querySelector('.current')
          break
        }
        presenceData.details = strings.viewEntry
        presenceData.state = title
        presenceData.smallImageKey = document.querySelector<HTMLImageElement>('.entry-picture')
        presenceData.smallImageText = document.querySelector('.entry-data .data-value')
        presenceData.buttons = [{ label: strings.buttonViewEntry, url: href }]
        break
      }
      case 'item': {
        if (pathList[1] === 'browse') {
          presenceData.details = strings.browseItems
          presenceData.state = document.querySelector('.current')
          break
        }

        presenceData.buttons = [{ label: strings.buttonViewItem, url: href }]
        if (pathList[2]) {
          presenceData.details = strings.viewItemComments
          presenceData.state = document.querySelector('.subtitle')
        }
        else {
          useSlideshow = true
          presenceData.details = strings.viewItem
          presenceData.state = title
          presenceData.smallImageKey = document.querySelector<HTMLImageElement>('.main img')

          const dataFields = document.querySelectorAll('.object .data-field')
          for (const field of dataFields) {
            const heading = field.querySelector('.data-label')?.textContent ?? 'Unknown'
            const value = field.querySelector('.data-value')
            const elements = [...value?.querySelectorAll('.item-entries') ?? []]
            const data = { ...presenceData }
            if (elements.length) {
              data.smallImageText = `${heading} - ${value?.textContent}`
            }
            else {
              data.smallImageText = `${heading} - ${elements.join(', ')}`
            }
            slideshow.addSlide(heading, data, MIN_SLIDE_TIME)
          }
        }
        break
      }
      case 'list': {
        presenceData.details = strings.viewList
        presenceData.state = title
        presenceData.smallImageKey = document.querySelector<HTMLImageElement>('.thumbnail')
        presenceData.buttons = [{ label: strings.buttonViewList, url: href }]
        break
      }
      case 'picture': {
        if (pathList[1] === 'browse') {
          useSlideshow = true
          presenceData.details = strings.viewList
          presenceData.state = document.querySelector('.current')
          const pictures = document.querySelectorAll('.results .picture-icon')
          for (const picture of pictures) {
            const data = { ...presenceData }
            const link = picture.querySelector('a')?.href ?? href
            data.smallImageKey = picture.querySelector('span')?.style.background.match(BACKGROUND_URL_REGEX)?.[1]
            data.buttons = [{ label: strings.buttonViewPicture, url: link }]
            slideshow.addSlide(link, data, MIN_SLIDE_TIME)
          }
          break
        }
        presenceData.buttons = [{ label: strings.buttonViewPicture, url: href }]
        if (pathList[2]) {
          presenceData.details = strings.viewPictureComments
        }
        else {
          presenceData.details = strings.viewPicture
          presenceData.state = `#${pathList[1]}`
          presenceData.smallImageKey = document.querySelector<HTMLImageElement>('.the-picture img')
          presenceData.smallImageText = strings.byAuthor.replace(
            '{author}',
            document.querySelector('.object-meta .user-anchor')?.textContent ?? 'Unknown',
          )
          const relatedItem = document.querySelector('.tbx-target-ITEMS .stamp')
          if (relatedItem) {
            presenceData.state += ` - ${relatedItem.textContent}`
            presenceData.buttons.push({ label: strings.viewItem, url: relatedItem.querySelector('a') })
          }
        }
        break
      }
      case 'profile': {
        const profilePicture = document.querySelector<HTMLImageElement>('.thumbnail')
        const tab = document.querySelector('.content-tabs .selected')?.textContent ?? 'Unknown'
        presenceData.details = strings.viewProfile
        presenceData.state = title
        presenceData.smallImageKey = profilePicture
        presenceData.smallImageText = tab
        presenceData.buttons = [{ label: strings.buttonViewProfile, url: href }]
        switch (pathList[2]) {
          case 'collection': {
            useSlideshow = true
            const items = document.querySelectorAll('.content-wrapper .item-icon')
            for (const item of items) {
              const data = { ...presenceData }
              const itemLink = item.querySelector('a')
              const image = item.querySelector('img')
              data.largeImageKey = profilePicture
              data.smallImageKey = image
              data.smallImageText = `${tab} - ${image?.alt}`
              data.buttons?.push({ label: strings.buttonViewItem, url: itemLink })
              slideshow.addSlide(itemLink?.textContent ?? 'unknown', data, MIN_SLIDE_TIME)
            }
            break
          }
          case 'pictures': {
            useSlideshow = true
            const items = document.querySelectorAll('.content-wrapper .picture-icon')
            for (const item of items) {
              const data = { ...presenceData }
              const itemLink = item.querySelector('a')
              const image = item.querySelector('span')
              data.largeImageKey = profilePicture
              data.smallImageKey = image?.style.background.match(BACKGROUND_URL_REGEX)?.[1]
              data.buttons?.push({ label: strings.buttonViewPicture, url: itemLink })
              slideshow.addSlide(itemLink?.textContent ?? 'unknown', data, MIN_SLIDE_TIME)
            }
            break
          }
        }
        break
      }
      case 'shop': {
        presenceData.details = strings.viewShop
        presenceData.state = title
        presenceData.smallImageKey = document.querySelector<HTMLImageElement>('.thumbnail')
        presenceData.smallImageText = document.querySelector('.current')
        presenceData.buttons = [{ label: strings.buttonViewShop, url: href }]
        break
      }
      case 'tag': {
        presenceData.details = strings.browseTag
        presenceData.state = title
        break
      }
      case 'thread': {
        presenceData.details = strings.viewThread
        presenceData.state = title
        presenceData.buttons = [{ label: strings.buttonViewPage, url: href }]
        break
      }
      default: {
        presenceData.details = strings.browsing
      }
    }
  }

  presence.setActivity(useSlideshow ? slideshow : presenceData)
})
