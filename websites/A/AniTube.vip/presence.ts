import { getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '853327058054545438',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AniTube.vip/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const search = document.querySelector<HTMLInputElement>(
    '.searchContainer > form > input',
  )
  const { pathname, href } = document.location

  if (
    document.querySelector<HTMLDivElement>('.searchContainer')?.style.display
    === 'block'
  ) {
    presenceData.details = `Searching for ${search ? search.value : null}`
  }
  else {
    switch (pathname) {
      case '/': {
        presenceData.details = 'Browsing Home Page'
        break
      }
      case '/busca.php': {
        presenceData.details = 'Looking at search results for'
        presenceData.state = (
          document.querySelector(
            '.mContainer_title_small_content',
          )
        )?.textContent?.substring(17) ?? ''

        break
      }
      case '/anime':
      case '/animes-dublado':
      case '/doramas':
      case '/tokusatsu':
      case '/donghua': {
        presenceData.details = 'Looking at all Animes'
        break
      }
      default:
        if (
          pathname.startsWith('/anime/letra/')
          || pathname.startsWith('/animes-dublado/letra/')
          || pathname.startsWith('/doramas/letra/')
          || pathname.startsWith('/tokusatsu/letra/')
          || pathname.startsWith('/donghua/letra/')
        ) {
          const query: string = pathname.substring(
            pathname.length - pathname.split('').reverse().join('').indexOf('/'),
          )
          if (query !== 'todos') {
            presenceData.details = 'Looking for Animes'
            presenceData.state = `starting with ${query}`
          }
          else {
            presenceData.details = 'Looking at all Animes'
          }
        }
        else if (
          pathname.startsWith('/anime/')
          || pathname.startsWith('/animes-dublado/')
          || pathname.startsWith('/doramas/')
          || pathname.startsWith('/tokusatsu/')
          || pathname.startsWith('/donghua/')
        ) {
          presenceData.details = 'Checking synopsis'
          presenceData.state = document.querySelector<HTMLDivElement>(
            '.anime_container_titulo',
          )?.textContent
        }
        else if (pathname.startsWith('/video/')) {
          const title: string = (
            document.querySelector(
              '.mContainer_title_small_content',
            ) as HTMLDivElement
          ).textContent!
          const videoElement: HTMLVideoElement = document.querySelector('video')!

          presenceData.details = `Watching ${title.substring(
            9,
            title.substring(9).indexOf('ep'),
          )}`
          presenceData.state = `Episode ${Number.parseInt(
            title.substring(title.indexOf('ep') + 2),
          )}`
          presenceData.buttons = [
            {
              label: 'Watch Along',
              url: href,
            },
          ]
          if (!videoElement.paused) {
            [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(videoElement)
          }
        }
        else if (pathname === '/contato.php') {
          presenceData.details = 'At contact us page'
        }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
