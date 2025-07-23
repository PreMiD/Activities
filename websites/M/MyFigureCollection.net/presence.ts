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
    browseEntries: 'myfigurecollection.browseEntries',
    browseItems: 'myfigurecollection.browseItems',
    browseTag: 'myfigurecollection.browseTag',
    browsing: 'general.browsing',
    buttonViewEntry: 'myfigurecollection.buttonViewEntry',
    buttonViewItem: 'myfigurecollection.buttonViewItem',
    buttonViewPicture: 'myfigurecollection.buttonViewPicture',
    byAuthor: 'myfigurecollection.byAuthor',
    viewEntry: 'myfigurecollection.viewEntry',
    viewHome: 'general.viewHome',
    viewItem: 'myfigurecollection.viewItem',
    viewItemComments: 'myfigurecollection.viewItemComments',
    viewList: 'general.viewList',
    viewPage: 'general.viewPage',
    viewPicture: 'myfigurecollection.viewPicture',
    viewPictureComments: 'myfigurecollection.viewPictureComments',
  })
  let useSlideshow = false

  const searchSection = params.get('_tb')
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
      case 'picture': {
        if (pathList[1] === 'browse') {
          useSlideshow = true
          presenceData.details = strings.viewList
          presenceData.state = document.querySelector('.current')
          const pictures = document.querySelectorAll('.results .picture-icon')
          for (const picture of pictures) {
            const data = { ...presenceData }
            const link = picture.querySelector('a')?.href ?? href
            data.smallImageKey = picture.querySelector('span')?.style.background.match(/url\("(.*)"\)/)?.[1]
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
      case 'tag': {
        presenceData.details = strings.browseTag
        presenceData.state = title
        break
      }
      default: {
        presenceData.details = strings.browsing
      }
    }
  }

  presence.setActivity(useSlideshow ? slideshow : presenceData)
})
