const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const slideshow = presence.createSlideshow()

enum ActivityAssets {
  Logo = 'https://needcoolershoes.com/icon.png',
}

let imageCacheDate = 0
let imageCache = ''
function captureImage(canvas: HTMLCanvasElement | null | undefined) {
  if (Date.now() - imageCacheDate > 10000) {
    imageCacheDate = Date.now()
    imageCache = canvas?.toDataURL() ?? ''
  }
  return imageCache
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const pathList = pathname.split('/').filter(Boolean)
  const editorImage = await presence.getSetting<boolean>('editorImage')

  switch (pathList[0] ?? '/') {
    case '/': {
      presenceData.details = 'Creating a Skin'
      if (editorImage) {
        presenceData.smallImageKey = captureImage(
          document
            .querySelector('ncrs-ui')
            ?.shadowRoot
            ?.querySelector('ncrs-editor')
            ?.shadowRoot
            ?.querySelector<HTMLCanvasElement>('canvas'),
        )
      }
      break
    }
    case 'banner': {
      presenceData.details = 'Creating a Banner'
      presenceData.buttons = [
        {
          label: 'View Banner',
          url: href,
        },
      ]
      break
    }
    case 'banners': {
      presenceData.details = 'Viewing a Banner'
      presenceData.state = document.querySelector('h1')
      presenceData.buttons = [{ label: 'View Banner', url: href }]
      break
    }
    case 'hall-of-fame': {
      presenceData.details = 'Viewing Hall of Fame'
      break
    }
    case 'gallery': {
      presenceData.details = `Browsing ${document.querySelector('#gallery ul li[class*=py-1]')?.textContent} Gallery`
      presenceData.buttons = [{ label: 'View Gallery', url: href }]
      if (pathList[1] === 'skins') {
        const skins = document.querySelectorAll('.card')
        for (const skin of skins) {
          const data: PresenceData = {
            ...presenceData,
            smallImageKey:
              skin.querySelector<HTMLDivElement>('[data-save]')?.dataset.save,
            smallImageText: `${skin.querySelector('h2')?.textContent} by ${skin.querySelector('p:last-child a')?.textContent}`,
          }
          slideshow.addSlide(
            skin.querySelector('a')?.href ?? '',
            data,
            MIN_SLIDE_TIME,
          )
        }
        presence.setActivity(slideshow)
        return
      }
      break
    }
    case 'modlog': {
      presenceData.details = 'Vieiwng Moderation Log'
      break
    }
    case 'skins': {
      presenceData.details = 'Viewing a Skin'
      presenceData.state = `${document.querySelector('h2')?.textContent} by ${document.querySelector('p > a[href*="@"]')?.textContent}`
      if (editorImage) {
        presenceData.smallImageKey = captureImage(document.querySelector<HTMLCanvasElement>('#skin_container'))
      }
      presenceData.buttons = [{ label: 'View Skin', url: href }]
      break
    }
    case 'users': {
      presenceData.details = 'Managing Their Account'
      break
    }
    default: {
      if (pathList[0]?.startsWith('@')) {
        presenceData.details = 'Viewing a User\'s Profile'
        presenceData.state = document.querySelector('h1')
        if (editorImage) {
          presenceData.smallImageKey = captureImage(
            document.querySelector<HTMLCanvasElement>('#skin_container'),
          )
        }
        presenceData.buttons = [{ label: 'View Profile', url: href }]
      }
    }
  }

  presence.setActivity(presenceData)
})
