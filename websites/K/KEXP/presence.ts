import { Assets } from 'premid'

const presence = new Presence({ clientId: '1138970637440917504' })
const browsingTimestamp = Math.floor(Date.now() / 1000)
const defaultImageUrl = 'https://cdn.rcd.gg/PreMiD/websites/K/KEXP/assets/logo.png'
const watchPaths = ['/archive/', '/djs/', '/podcasts/', '/schedule/', '/shows/']

async function updatePresence() {
  const strings = await presence.getStrings({
    about: 'general.readingAbout',
    article: 'general.readingAnArticle',
    pause: 'general.paused',
    play: 'general.playing',
    searching: 'general.searchSomething',
    watching: 'general.watching',
  })
  const currentPagePath = document.location.pathname
  const presenceData: PresenceData = {
    startTimestamp: browsingTimestamp,
    largeImageKey: defaultImageUrl,
  }

  function setDetails(
    detailsKey: keyof typeof strings,
    imageKey: string,
    textKey: keyof typeof strings,
    selectElement: string,
  ) {
    presenceData.details = strings[detailsKey]
    presenceData.smallImageKey = imageKey
    presenceData.smallImageText = strings[textKey]
    presenceData.state = document.querySelector(selectElement)?.textContent
  }

  switch (true) {
    case watchPaths.includes(currentPagePath):
      setDetails(
        'watching',
        Assets.Viewing,
        'searching',
        '.InlineMenu-current',
      )
      break

    case currentPagePath.startsWith('/djs/'):
      setDetails('about', Assets.Reading, 'article', 'h3')
      break

    case currentPagePath.startsWith('/podcasts/'):
      setDetails('article', Assets.Reading, 'article', 'h1')
      break

    case currentPagePath.startsWith('/read/')
      && /^\/read\/\d{4}\/\d{1,2}\/\d{1,2}\/[\w-]+\/?$/.test(currentPagePath): {
      setDetails('about', Assets.Reading, 'article', 'h1')
      break
    }

    case currentPagePath.startsWith('/shows/'):
      setDetails('about', Assets.Reading, 'article', 'h1')
      break

    default: {
      const coverImage = document
        .querySelector('.Player-coverImage')
        ?.getAttribute('src')

      presenceData.details = document.querySelector('a.Player-show')?.textContent
      presenceData.largeImageKey = coverImage?.startsWith('https://')
        ? coverImage
        : defaultImageUrl
      presenceData.state = document.querySelector('div.Player-title')?.textContent

      const playBackStatus = document.querySelector('button.Player-ctaButton')
      if (playBackStatus) {
        presenceData.smallImageKey = playBackStatus.ariaLabel === 'Play Stream'
          ? Assets.Pause
          : Assets.Play
        presenceData.smallImageText = strings[
          playBackStatus.ariaLabel === 'Play Stream' ? 'pause' : 'play'
        ]
      }
      break
    }
  }

  presence.setActivity(presenceData)
}

presence.on('UpdateData', updatePresence)
