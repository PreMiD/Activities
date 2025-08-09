const presence = new Presence({
  clientId: '503557087041683458',
})
const slideshow = presence.createSlideshow()
const browsingTimestamp = Math.floor(Date.now() / 1000)

let oldSlideshowKey: string
function registerSlideshowKey(key: string): boolean {
  if (oldSlideshowKey !== key) {
    slideshow.deleteAllSlides()
    oldSlideshowKey = key
    return true
  }
  return false
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/W/Wuthering%20Waves/assets/logo.png',
}

function getSelectors(isMobile: boolean) {
  return {
    newsTabActive: isMobile ? '.news .tab-item-active' : '.news-container .tab-item-active',
    newsTitle: isMobile ? '.title' : '.news-tit',
    resonatorGroupActive: isMobile ? '.group-active .group_name' : '.group-active .name',
    resonatorGroupImage: isMobile ? '.group-active img' : '.group-active .icon',
    resonatorCharacterImage: isMobile
      ? '.role-detail .role-container .role-visible img'
      : '.role-detail .role-visible .role-img',
    resonatorCharacterName: isMobile ? '.role-intro .name' : '.detail-box .role-name',
    resonatorCharacterDescription: isMobile ? '.role-intro .role-line' : '.detail-box .role-text',
    resonatorCharacterList: isMobile ? '.role-list-container .swiper-slide' : '.role-item-box',
    resonatorCharacterListImage: isMobile ? 'img' : '.role-item-active2',
    resonatorCharacterListName: isMobile ? '.role-list-name' : '.role-name',
    loreName: isMobile ? '.swiper-slide-active .feature-name' : '.swiper-slide-visible .world-msg-name',
    loreImage: isMobile ? '#feature-swiper .swiper-slide-active img' : '.swiper-slide-active.active img',
    loreDescription: isMobile ? '.swiper-slide-active .feature-des' : '.swiper-slide-visible .world-msg-desc',
    regionContainer: isMobile ? '.map-content' : '.map-detail',
    regionImage: isMobile ? '.swiper-slide-visible .world-bg' : '.swiper-slide-active .map-imgbox img',
    regionName: isMobile ? '.swiper-slide-visible .world-name' : '.slide-custom.is-current-slide .map-names-box',
    regionSubImage: isMobile ? '.swiper-slide-visible .map-bg' : 'img.show',
    regionSubName: isMobile ? '.swiper-slide-visible .map-name' : '.md-name',
    regionSubDescription: isMobile ? '.swiper-slide-visible .map-text' : '.md-desc',
  }
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: 'Wuthering Waves',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const strings = await presence.getStrings({
    browsing: 'general.browsing',
    browsingNews: 'wuthering waves.browsingNews',
    browsingResonators: 'wuthering waves.browsingResonators',
    readingAbout: 'general.readingAbout',
    readingArticle: 'general.readingArticle',
    readingRegion: 'wuthering waves.readingRegion',
    viewingResonator: 'wuthering waves.viewingResonator',
    viewHome: 'general.viewHome',
    buttonViewArticle: 'general.buttonViewArticle',
  })
  const { pathname, href, hash } = document.location
  let [...pathList] = pathname.split('/').filter(Boolean)
  const isMobile = pathList[0] === 'm'
  pathList = pathList.slice(isMobile ? 2 : 1)
  const selectors = getSelectors(isMobile)

  let useSlideshow = false

  const displayBrowsingNews = () => {
    presenceData.details = strings.browsingNews
    presenceData.state = document.querySelector(selectors.newsTabActive)
  }

  switch (pathList[0] ?? '/') {
    case '/': {
      presenceData.details = strings.viewHome
      break
    }
    case 'main': {
      switch (pathList[1]) {
        case 'news': {
          if (pathList[2]) {
            presenceData.details = strings.readingArticle
            presenceData.state = document.querySelector(selectors.newsTitle)
            presenceData.buttons = [
              { label: strings.buttonViewArticle, url: href },
            ]
          }
          else {
            displayBrowsingNews()
          }
          break
        }
        default: {
          switch (hash.slice(1) || 'main') {
            case 'main': {
              presenceData.details = strings.viewHome
              break
            }
            case 'news': {
              displayBrowsingNews()
              break
            }
            case 'resonators': {
              const groupName = document.querySelector(selectors.resonatorGroupActive)
              const groupImage = document.querySelector<HTMLImageElement>(selectors.resonatorGroupActive)
              const activeCharacterImage = document.querySelector<HTMLImageElement>(selectors.resonatorCharacterImage)
              presenceData.smallImageKey = groupImage
              presenceData.smallImageText = groupName
              if (
                activeCharacterImage
                && (isMobile
                  ? document.querySelector<HTMLDivElement>('.role-detail')?.style.display !== 'none'
                  : true)
              ) {
                presenceData.details = strings.viewingResonator
                presenceData.state = document.querySelector(selectors.resonatorCharacterName)
                presenceData.largeImageKey = activeCharacterImage.nextElementSibling?.classList.contains('show')
                  ? (activeCharacterImage.nextElementSibling as HTMLImageElement) // splash art if available and visible
                  : activeCharacterImage // large character portrait
                presenceData.smallImageText = document.querySelector(selectors.resonatorCharacterDescription)
              }
              else {
                const characters = document.querySelectorAll(selectors.resonatorCharacterList)
                presenceData.details = strings.browsingResonators
                registerSlideshowKey(`resonators-${groupName?.textContent}`)
                for (let i = 0; i < characters.length; i++) {
                  const character = characters[i]
                  slideshow.addSlide(
                    `resonator-${i}`,
                    {
                      ...presenceData,
                      largeImageKey: character?.querySelector<HTMLImageElement>(selectors.resonatorCharacterListImage),
                      state: character?.querySelector(selectors.resonatorCharacterListName),
                    },
                    5000,
                  )
                }
                useSlideshow = true
              }
              break
            }
            case 'lore': {
              presenceData.details = strings.readingAbout
              presenceData.state = document.querySelector(selectors.loreName)
              presenceData.smallImageKey = document.querySelector<HTMLImageElement>(selectors.loreImage)
              presenceData.smallImageText = document.querySelector(selectors.loreDescription)
              break
            }
            case 'regions': {
              const mapDetail = document.querySelector<HTMLDivElement>(selectors.regionContainer)
              presenceData.largeImageKey = document.querySelector<HTMLImageElement>(selectors.regionImage)
              presenceData.details = strings.readingRegion
              presenceData.state = document.querySelector(selectors.regionName)
              if (mapDetail && (isMobile ? mapDetail.style.display !== 'none' : true)) {
                presenceData.smallImageKey = mapDetail.querySelector<HTMLImageElement>(selectors.regionSubImage)
                presenceData.smallImageText = `${mapDetail.querySelector(selectors.regionSubName)?.textContent} - ${mapDetail.querySelector(selectors.regionSubDescription)?.textContent}`
              }
              break
            }
            case 'end': {
              presenceData.details = strings.browsing
              break
            }
          }
        }
      }
      break
    }
  }

  presence.setActivity(useSlideshow ? slideshow : presenceData)
})
