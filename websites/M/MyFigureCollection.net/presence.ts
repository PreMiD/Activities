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
    browsing: 'general.browsing',
    browseItems: 'myfigurecollection.browseItems',
    buttonViewItem: 'myfigurecollection.buttonViewItem',
    viewHome: 'general.viewHome',
    viewItem: 'myfigurecollection.viewItem',
    viewPage: 'general.viewPage',
    viewItemComments: 'myfigurecollection.viewItemComments',
  })
  let useSlideshow = false

  if (params.get('_tb') === 'item') { // Search
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
      case 'item': {
        if (pathList[1] === 'browse') {
          presenceData.details = strings.browseItems
          presenceData.state = document.querySelector('.current')
        }
        else {
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

            const dataFields = document.querySelectorAll<HTMLDivElement>('.object .data-field')
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
        }
        break
      }
      default: {
        presenceData.details = strings.browsing
      }
    }
  }

  presence.setActivity(useSlideshow ? slideshow : presenceData)
})
