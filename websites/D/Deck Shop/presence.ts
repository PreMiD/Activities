const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const slideshow = presence.createSlideshow()

enum ActivityAssets {
  Logo = 'https://i.imgur.com/UxgNHpE.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: 'Deck Shop',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, search } = document.location
  const searchParams = new URLSearchParams(search)
  const pathList = pathname.split('/').filter(Boolean)
  if (pathList[0]?.length === 2) {
    // remove language code from path logic
    pathList.splice(0, 1)
  }
  const strings = await presence.getStrings({
    viewHome: 'general.viewHome',
    browsing: 'general.browsing',
    browseGuides: 'deck-shop.browseGuides',
    readGuide: 'deck-shop.readGuide',
    buttonReadArticle: 'general.buttonReadArticle',
    search: 'general.search',
    searchFor: 'general.searchFor',
    viewProfile: 'general.viewProfile',
    buttonViewProfile: 'general.buttonViewProfile',
    viewClan: 'deck-shop.viewClan',
    buttonViewClan: 'deck-shop.buttonViewClan',
    buildDeck: 'deck-shop.buildDeck',
    viewDeck: 'deck-shop.viewDeck',
    buttonViewDeck: 'deck-shop.buttonViewDeck',
    buttonUseDeck: 'deck-shop.buttonUseDeck',
    findDeck: 'deck-shop.findDeck',
    browseCards: 'deck-shop.browseCards',
    viewCard: 'deck-shop.viewCard',
    buttonViewCard: 'deck-shop.buttonViewCard',
  })

  let useSlideshow = false

  switch (pathList[0] ?? '/') {
    case '/': {
      presenceData.details = strings.viewHome
      break
    }
    case 'card': {
      if (pathList[1] === 'detail') {
        presenceData.details = strings.viewCard
        presenceData.state = document.querySelector('h1')
        presenceData.smallImageKey = document.querySelector<HTMLImageElement>(
          'article > section:first-child img[src*=card]',
        )
        presenceData.buttons = [{ label: strings.buttonViewCard, url: href }]
      }
      else {
        presenceData.details = strings.browseCards
        presenceData.state = document.querySelector('nav > a.disabled')
      }
      break
    }
    case 'check': {
      presenceData.details = strings.viewDeck
      if (searchParams.get('deck')) {
        useSlideshow = true
        presenceData.state = document.querySelector('h2')
        presenceData.buttons = [
          { label: strings.buttonViewDeck, url: href },
          {
            label: strings.buttonUseDeck,
            url: document.querySelector<HTMLAnchorElement>('a[href*=copyDeck]'),
          },
        ]
        const cards = document.querySelectorAll('.deck a')
        const ratings = document.querySelectorAll('h3 + div > div')
        for (const rating of ratings) {
          for (const card of cards) {
            const image = card.querySelector('img')
            const data: PresenceData = {
              ...presenceData,
              smallImageKey: image,
              smallImageText: `${rating.firstElementChild?.textContent}: ${rating.lastElementChild?.textContent}`,
            }
            slideshow.addSlide(image?.alt ?? '', data, MIN_SLIDE_TIME)
          }
        }
      }
      break
    }
    case 'deck': {
      presenceData.details = strings.findDeck
      switch (pathList[1]) {
        case 'list': {
          presenceData.state = document.querySelector('h1')
          break
        }
        case 'detail': {
          useSlideshow = true
          presenceData.details = strings.viewDeck
          presenceData.state = document.querySelector('h1')
          presenceData.buttons = [
            { label: strings.buttonViewDeck, url: href },
            {
              label: strings.buttonUseDeck,
              url: document.querySelector<HTMLAnchorElement>(
                'a[href*=copyDeck]',
              ),
            },
          ]
          const cards = document.querySelectorAll(
            'section:first-child .deck a',
          )
          const ratings = document.querySelectorAll(
            'section:first-child div:nth-child(2) > div:nth-child(2) h3 + div > div',
          )
          for (const rating of ratings) {
            for (const card of cards) {
              const image = card.querySelector('img')
              const data: PresenceData = {
                ...presenceData,
                smallImageKey: image,
                smallImageText: `${rating.firstElementChild?.textContent}: ${rating.lastElementChild?.textContent}`,
              }
              slideshow.addSlide(image?.alt ?? '', data, MIN_SLIDE_TIME)
            }
          }
          break
        }
      }
      break
    }
    case 'deck-builder': {
      presenceData.details = strings.buildDeck
      break
    }
    case 'guide': {
      if (pathList[1]) {
        presenceData.details = strings.readGuide
        presenceData.state = document.querySelector('h1')
        presenceData.buttons = [
          { label: strings.buttonReadArticle, url: href },
        ]
      }
      else {
        presenceData.details = strings.browseGuides
      }
      break
    }
    case 'spy': {
      switch (pathList[1]) {
        case 'player': {
          const tab = document.querySelector('article nav div > a[class]')
          presenceData.details = strings.viewProfile
          presenceData.state = `${document.querySelector('h1')?.textContent} - ${(tab?.firstElementChild ?? tab?.firstChild)?.textContent?.trim()}`
          presenceData.buttons = [
            { label: strings.buttonViewProfile, url: href },
          ]
          break
        }
        case 'clan': {
          const tab = document.querySelector(
            'article nav > div:first-child a[class]',
          )
          presenceData.details = strings.viewClan
          presenceData.state = `${document.querySelector('h1')?.textContent} - ${(tab?.firstElementChild ?? tab?.firstChild)?.textContent?.trim()}`
          presenceData.smallImageKey = document.querySelector<HTMLImageElement>(
            'article section > div:first-child > img',
          )
          presenceData.buttons = [{ label: strings.buttonViewClan, url: href }]
          break
        }
        case 'top': {
          presenceData.details = strings.searchFor
          presenceData.state = document.querySelector('h1')
          break
        }
        default: {
          presenceData.details = strings.search
        }
      }
      break
    }
    default: {
      presenceData.details = strings.browsing
    }
  }

  presence.setActivity(useSlideshow ? slideshow : presenceData)
})
