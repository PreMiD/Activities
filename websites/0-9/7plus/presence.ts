import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/0-9/7plus/assets/logo.png',
    name: '7plus',
  }
  const { pathname, href } = document.location
  const [privacy, buttons, covers] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('covers'),
  ])
  const video = document.querySelector('video')

  if (privacy && !video) {
    presenceData.details = 'Browsing'
  }
  else if (pathname.includes('/home/') || pathname === '/') {
    presenceData.details = 'Viewing 7plus home'
  }
  else {
    switch (pathname) {
      case '/shows-a-z': {
        presenceData.details = 'Browsing 7plus Shows'
        presenceData.buttons = [
          {
            label: 'Browse Shows',
            url: href,
          },
        ]
        break
      }
      case '/sport': {
        presenceData.details = 'Browsing 7plus Sports'

        presenceData.buttons = [
          {
            label: 'Browse All Sports',
            url: href,
          },
        ]
        break
      }
      case '/search': {
        presenceData.details = 'Searching for'
        presenceData.state = document.querySelector<HTMLInputElement>(
          '[placeholder="Search for shows"]',
        )?.value ?? 'Nothing'
        break
      }
      case '/live-tv':
      case '/watch-live-tv': {
        const showName = document.querySelector(
          'h2.h3§3Lep4.fw700§1YAxq.truncate2§d57BK.truncateMobile§1Yywu',
        )
        presenceData.largeImageKey = document.querySelector<HTMLMetaElement>('[property="og:image"]')
          ?.content
          ?? 'https://cdn.rcd.gg/PreMiD/websites/0-9/7plus/assets/logo.png'
        presenceData.smallImageKey = Assets.Live
        presenceData.smallImageText = 'Live'
        presenceData.details = document
          .querySelector('[class="swiper-slide swiper-slide-active"]')
          ?.querySelector('[class*="title"]')
          ?.textContent
        presenceData.state = `Watching: ${showName?.textContent}`
        presenceData.buttons = [
          {
            label: 'Tune In Live',
            url: href,
          },
        ]
        break
      }
      case '/query': {
        presenceData.details = 'Searching 7plus!'
        break
      }
      default: {
        if (privacy && video && document.querySelector('[class*="showPlayer"]')) {
          presenceData.details = 'Watching'
        }
        else if (privacy && video) {
          presenceData.details = 'Browsing'
        }
        else if (video && document.querySelector('[class*="showPlayer"]')) {
          presenceData.buttons = [
            {
              label: 'View The Video',
              url: href,
            },
          ]
          if (video.paused) {
            delete presenceData.endTimestamp
            presenceData.smallImageKey = Assets.Pause
          }
          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
          presenceData.details = document.querySelector(
            '[class="vjs-top-bar-title"]',
          )?.textContent
          presenceData.smallImageKey = Assets.Play
          presenceData.largeImageKey = video.getAttribute('poster') ?? 'https://cdn.rcd.gg/PreMiD/websites/0-9/7plus/assets/logo.png'
        }
        else {
          presenceData.buttons = [
            {
              label: 'View Show',
              url: href,
            },
          ]
          presenceData.largeImageKey = document
            .querySelector('[class="logoWrapper"]')
            ?.getAttribute('src')
            ?? document.querySelector<HTMLMetaElement>('[property="og:image"]')
              ?.content
              ?? 'https://cdn.rcd.gg/PreMiD/websites/0-9/7plus/assets/logo.png'

          presenceData.details = `Viewing "${
            document.querySelector('[class="vjs-top-bar-title"]')
              ?.textContent
              ?? document.querySelector('[class*="tintable"]')?.textContent
          }"`
        }
      }
    }
  }
  if (!covers) {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/0-9/7plus/assets/logo.png'
  }
  if (!buttons)
    delete presenceData.buttons
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
