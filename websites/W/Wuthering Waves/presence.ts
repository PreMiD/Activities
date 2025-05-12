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
  Logo = 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/e6/b0/e3/e6b0e320-c0b5-8c6c-b5aa-3b47db549a8d/Client.png/512x0w.png',
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

  let useSlideshow = false

  const displayBrowsingNews = () => {
    presenceData.details = strings.browsingNews
    presenceData.state = document.querySelector('.news-container .tab-item-active')
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
            presenceData.state = document.querySelector(isMobile ? '.title' : '.news-tit')
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
              const groupName = document.querySelector(isMobile ? '.group-active .group_name' : '.group-active .name')
              const groupImage = document.querySelector<HTMLImageElement>(isMobile ? '.group-active img' : '.group-active .icon')
              const activeCharacterImage = document.querySelector<HTMLImageElement>(
                isMobile
                  ? '.role-detail .role-container .role-visible img'
                  : '.role-detail .role-visible .role-img',
              )
              presenceData.smallImageKey = groupImage
              presenceData.smallImageText = groupName
              if (
                activeCharacterImage
                && (isMobile
                  ? document.querySelector<HTMLDivElement>('.role-detail')?.style.display !== 'none'
                  : true)
              ) {
                presenceData.details = strings.viewingResonator
                presenceData.state = document.querySelector(isMobile ? '.role-intro .name' : '.detail-box .role-name')
                presenceData.largeImageKey = activeCharacterImage.nextElementSibling?.classList.contains('show')
                  ? (activeCharacterImage.nextElementSibling as HTMLImageElement) // splash art if available and visible
                  : activeCharacterImage // large character portrait
                presenceData.smallImageText = document.querySelector(isMobile ? '.role-intro .role-line' : '.detail-box .role-text')
              }
              else {
                const characters = document.querySelectorAll(isMobile ? '.role-list-container .swiper-slide' : '.role-item-box')
                presenceData.details = strings.browsingResonators
                registerSlideshowKey(`resonators-${groupName?.textContent}`)
                for (let i = 0; i < characters.length; i++) {
                  const character = characters[i]
                  slideshow.addSlide(
                    `resonator-${i}`,
                    {
                      ...presenceData,
                      largeImageKey: character?.querySelector<HTMLImageElement>(isMobile ? 'img' : '.role-item-active2'),
                      state: character?.querySelector(isMobile ? '.role-list-name' : '.role-name'),
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
              presenceData.state = document.querySelector(isMobile ? '.swiper-slide-active .feature-name' : '.swiper-slide-visible .world-msg-name')
              presenceData.smallImageKey = document.querySelector<HTMLImageElement>(isMobile ? '#feature-swiper .swiper-slide-active img' : '.swiper-slide-active.active img')
              presenceData.smallImageText = document.querySelector(isMobile ? '.swiper-slide-active .feature-des' : '.swiper-slide-visible .world-msg-desc')
              break
            }
            case 'regions': {
              const mapDetail = document.querySelector<HTMLDivElement>(isMobile ? '.map-content' : '.map-detail')
              presenceData.largeImageKey = document.querySelector<HTMLImageElement>(isMobile ? '.swiper-slide-visible .world-bg' : '.swiper-slide-active .map-imgbox img')
              presenceData.details = strings.readingRegion
              presenceData.state = document.querySelector(isMobile ? '.swiper-slide-visible .world-name' : '.slide-custom.is-current-slide .map-names-box')
              if (mapDetail && (isMobile ? mapDetail.style.display !== 'none' : true)) {
                presenceData.smallImageKey = mapDetail.querySelector<HTMLImageElement>(isMobile ? '.swiper-slide-visible .map-bg' : 'img.show')
                presenceData.smallImageText = `${mapDetail.querySelector(isMobile ? '.swiper-slide-visible .map-name' : '.md-name')?.textContent} - ${mapDetail.querySelector(isMobile ? '.swiper-slide-visible .map-text' : '.md-desc')?.textContent}`
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
