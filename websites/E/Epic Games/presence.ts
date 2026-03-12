const presence = new Presence({
  clientId: '749642170813907004',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/E/Epic%20Games/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { hostname, href, pathname } = document.location
  const [privacy, buttons, covers] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('covers'),
  ])
  const video = document.querySelector('video')
  const search = document.querySelector<HTMLInputElement>('[data-testid="input-input"]')
    ?? document.querySelector('[type="search"]')
  if (privacy) {
    presenceData.details = 'Browsing'
  }
  else if (search?.value) {
    presenceData.details = 'Searching for'
    presenceData.state = search.value
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/E/Epic%20Games/assets/0.png'
  }
  else if (hostname === 'store.epicgames.com') {
    if (
      pathname
      === `/${document
        .querySelector('[data-baseurl="https://store.epicgames.com"]')
        ?.getAttribute('lang')}/`
    ) {
      presenceData.details = 'Viewing homepage'
    }
    else {
      switch (pathname.split('/')[2]) {
        case 'p': {
          if (video?.muted || !video) {
            presenceData.details = 'Viewing game'
          }
          else {
            delete presenceData.startTimestamp
            presenceData.details = 'Viewing trailer of'
            if (!video.paused) {
              presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/E/Epic%20Games/assets/1.png';
              [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
            }
            else {
              presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/E/Epic%20Games/assets/2.png'
            }
          }
          presenceData.state = JSON.parse(
            document.querySelector('[type="application/ld+json"]')?.innerHTML ?? '{}',
          )?.name
          ?? document
            .querySelector<HTMLMetaElement>('[property="og:title"]')
            ?.content
            .split('|')[0]
          presenceData.buttons = [
            {
              label: 'View Game',
              url: href,
            },
          ]
          presenceData.largeImageKey = document
            .querySelector('[class="css-7i770w"]')
            ?.getAttribute('src')

          break
        }
        case 'news': {
          if (document.querySelector('[id="storeNews"]')) {
            presenceData.details = 'Reading about'
            presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/E/Epic%20Games/assets/3.png'
            presenceData.state = document.querySelector('title')?.textContent
          }
          else {
            presenceData.details = 'Browsing all news'
          }
          presenceData.buttons = [
            {
              label: 'Read The News',
              url: href,
            },
          ]
          break
        }
        case 'browse': {
          presenceData.buttons = [
            {
              label: 'Browse Games',
              url: href,
            },
          ]
          if (document.querySelector('[aria-checked="true"]')) {
            presenceData.details = 'Viewing results for'
            presenceData.state = document.querySelector(
              '[aria-checked="true"]',
            )?.textContent
          }
          else if (document.querySelector('[class="css-71iht3"]')) {
            delete presenceData.buttons
            presenceData.details = 'Viewing results for'
            presenceData.state = href?.split('?q=')?.at(0)?.split('&')?.at(0)
          }
          else {
            presenceData.details = 'Browsing games'
          }
          break
        }
        default: {
          presenceData.details = 'Browsing'
          break
        }
      }
    }
  }
  else if (hostname === 'www.epicgames.com') {
    if (
      pathname
      === `/site/${document
        .querySelector('[data-baseurl="https://www.epicgames.com/site"]')
        ?.getAttribute('lang')}/`
    ) {
      presenceData.details = 'Viewing homepage'
    }
    else if (pathname.includes('/help/')) {
      presenceData.details = 'Reading about'
      presenceData.state = document.querySelector(
        '[class*="ArticleAnchorLink--active"]',
      )?.textContent
      presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/E/Epic%20Games/assets/3.png'
    }
    else {
      switch (pathname.split('/')[3]) {
        case 'epic-games-store-faq': {
          presenceData.details = 'Reading the FAQ'
          presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/E/Epic%20Games/assets/3.png'
          break
        }
        default: {
          presenceData.details = 'Browsing'
          break
        }
      }
    }
  }
  if (!buttons)
    delete presenceData.buttons
  if (!covers) {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/E/Epic%20Games/assets/logo.png'
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
