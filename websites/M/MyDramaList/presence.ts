import { Assets } from 'premid'

const presence = new Presence({
  clientId: '739290632463319141',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

interface FilmData {
  '@type': string
  'name': string
  'image': string
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/MyDramaList/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const coverEnabled = await presence.getSetting('cover')

  if (document.location.pathname === '/') {
    presenceData.details = 'Viewing the homepage'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Browsing'
  }
  else if (document.location.pathname.startsWith('/episode-calendar')) {
    presenceData.details = 'Viewing Upcomming Shows'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'MDL'
  }
  else if (document.location.pathname.startsWith('/search')) {
    let searchThing = decodeURIComponent(
      document.location.search.substring(3),
    ).replaceAll('+', ' ')

    if (searchThing.includes('&'))
      searchThing = searchThing.substring(0, searchThing.indexOf('&'))

    presenceData.details = 'Searching for a show...'
    presenceData.state = searchThing
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/MyDramaList/assets/logo.png'
    presenceData.smallImageText = 'MDL'
  }
  else if (document.location.pathname.startsWith('/article/')) {
    presenceData.details = 'Reading an article:'
    presenceData.state = document.querySelector(
      '#article > div.box-header > h1 > a',
    )?.textContent
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Reading and article'
  }
  else if (document.location.pathname === '/articles') {
    presenceData.details = 'Browsing articles'
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/MyDramaList/assets/logo.png'
    presenceData.smallImageText = 'MDL'
  }
  else if (document.location.pathname.startsWith('/trailers')) {
    presenceData.details = 'Looking at Trailers'
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/MyDramaList/assets/logo.png'
    presenceData.smallImageText = 'MDL'
  }
  else if (document.location.pathname.startsWith('/feeds')) {
    presenceData.details = 'Browsing through feeds'
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/MyDramaList/assets/logo.png'
    presenceData.smallImageText = 'MDL'
  }
  else if (document.location.pathname.startsWith('/list')) {
    presenceData.details = 'Looking at user lists'
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/MyDramaList/assets/logo.png'
    presenceData.smallImageText = 'MDL'
  }
  else if (document.location.pathname.startsWith('/contributors')) {
    presenceData.details = 'Looking at Top Contributors'
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/MyDramaList/assets/logo.png'
    presenceData.smallImageText = 'MDL'
  }
  else if (document.location.pathname.startsWith('/discussions')) {
    presenceData.details = 'Browsing forums'
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/MyDramaList/assets/logo.png'
    presenceData.smallImageText = 'MDL'
  }
  else if (document.location.pathname.startsWith('/shows/')) {
    presenceData.details = 'Browsing Shows List'
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/MyDramaList/assets/logo.png'
    presenceData.smallImageText = 'MDL'
  }
  else if (document.location.pathname.startsWith('/reviews/')) {
    presenceData.details = 'Reading Reviews'
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/MyDramaList/assets/logo.png'
    presenceData.smallImageText = 'MDL'
  }
  else if (document.location.pathname.startsWith('/profile/')) {
    const profilePicture = document.querySelector(
      '.box-user-profile :is(video, img)',
    )

    presenceData.details = `Viewing ${document
      .querySelector('.profile-header h1')
      ?.textContent
      ?.trim()}'s profile`
    presenceData.largeImageKey = profilePicture?.getAttribute('poster')
      ?? profilePicture?.getAttribute('src')
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/MyDramaList/assets/logo.png'
    presenceData.smallImageText = 'MDL'
  }
  else if (document.location.pathname.startsWith('/recommendations')) {
    presenceData.details = 'Looking at personailized recommendations'
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/MyDramaList/assets/logo.png'
  }
  else if (document.location.pathname.startsWith('/people/')) {
    presenceData.details = 'Viewing actor:'
    presenceData.state = document.querySelector('.box-header > h1')?.textContent
    presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.box-body > img')?.src
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/MyDramaList/assets/logo.png'
    presenceData.smallImageText = 'MDL'
  }
  else if (document.location.href.match('/[^-][0-9]{1,5}')) {
    const filmData: FilmData = (() => {
      const title = document.querySelector('.film-title > a')?.textContent

      if (!title) {
        const jsonData = document.querySelector(
          '[type="application/ld+json"]',
        )?.textContent

        if (!jsonData)
          return
        else return JSON.parse(jsonData)
      }

      return {
        'name': title,
        'image': document.querySelector<HTMLImageElement>(
          '.box-body > .row > div img',
        )?.src,
        '@type': document
          .querySelector('.container-fluid.title-container')
          ?.getAttribute('itemtypex')
          ?.split('/')
          ?.pop(),
      }
    })()

    if (filmData) {
      presenceData.details = `Viewing ${filmData['@type'] === 'Movie' ? 'movie' : 'show'
      }:`
      presenceData.state = filmData.name
      presenceData.largeImageKey = filmData.image
      presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/MyDramaList/assets/logo.png'
      presenceData.smallImageText = 'MDL'
    }
  }

  if (
    (presenceData.largeImageKey as unknown as string | undefined)?.includes('http')
    && !coverEnabled
  ) {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/MyDramaList/assets/logo.png'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
