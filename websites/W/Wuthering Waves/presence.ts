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
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const strings = await presence.getStrings({
    viewHome: 'general.viewHome',
    viewingResonator: 'wuthering waves.viewingResonator',
    browsingNews: 'wuthering waves.browsingNews',
    readingArticle: 'general.readingArticle',
    readingAbout: 'general.readingAbout',
    buttonViewArticle: 'general.buttonViewArticle',
    browsingResonators: 'wuthering waves.browsingResonators',
  })
  const { pathname, href, hash } = document.location
  const [...pathList] = pathname.split('/').filter(Boolean).slice(1)

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
            presenceData.state = document.querySelector('.news-tit')
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
              const groupName = document.querySelector('.group-active .name')
              const groupImage = document.querySelector<HTMLImageElement>('.group-active .icon')
              const activeCharacter = document.querySelector<HTMLImageElement>('.role-detail .role-visible .role-img')
              presenceData.smallImageKey = groupImage
              presenceData.smallImageText = groupName
              if (activeCharacter) {
                presenceData.details = strings.viewingResonator
                presenceData.state = document.querySelector('.detail-box .role-name')
                presenceData.largeImageKey = activeCharacter.nextElementSibling?.classList.contains('show')
                  ? (activeCharacter.nextElementSibling as HTMLImageElement) // splash art if available and visible
                  : activeCharacter // large character portrait
                presenceData.smallImageText = document.querySelector('.detail-box .role-text')
              }
              else {
                const characters = document.querySelectorAll('.role-item-box')
                presenceData.details = strings.browsingResonators
                registerSlideshowKey(`resonators-${groupName?.textContent}`)
                for (let i = 0; i < characters.length; i++) {
                  const character = characters[i]
                  slideshow.addSlide(
                    `resonator-${i}`,
                    {
                      ...presenceData,
                      largeImageKey: character?.querySelector<HTMLImageElement>('.role-item-active2'),
                      state: character?.querySelector('.role-name'),
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
              presenceData.state = document.querySelector('.swiper-slide-visible .world-msg-name')
              presenceData.smallImageKey = document.querySelector<HTMLImageElement>('.swiper-slide-active.active img')
              presenceData.smallImageText = document.querySelector('.swiper-slide-visible .world-msg-desc')
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
