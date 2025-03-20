const presence = new Presence({
  clientId: '1187606265829019689',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Taiy%C5%8D/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { href, pathname } = document.location

  switch (pathname.split('/')[1]) {
    case 'auth':
      presenceData.details = 'Fazendo login'
      break

    case 'dashboard': {
      if (pathname.includes('/medias/import')) {
        presenceData.details = 'Importando mangá'
      }
      else if (pathname.includes('/medias/edit')) {
        presenceData.details = 'Editando mangá'
      }
      else if (
        pathname.includes('/chapters/upload')
        || pathname.includes('/chapters/bulk-upload')
      ) {
        const chapterNumber = document.querySelector<HTMLInputElement>(
          '.chapter-number input[type="number"]',
        )?.value
        const chapterVolume = document.querySelector<HTMLInputElement>(
          '.chapter-volume input[type="number"]',
        )?.value
        const chapterTitle = document.querySelectorAll<HTMLInputElement>(
          'input[data-slot="input"]',
        )[1]?.value
        if (chapterTitle) {
          presenceData.details = `Upando: ${chapterTitle}`
          if (chapterNumber && chapterVolume)
            presenceData.state = `Cap. ${chapterNumber} - Vol. ${chapterVolume}`
        }
        else {
          presenceData.details = 'Upando mangá...'
        }
      }
      else if (pathname.includes('/scans/add')) {
        presenceData.details = 'Adicionando scan'
      }
      else {
        presenceData.details = 'No dashboard...'
      }
      break
    }

    case 'chapter': {
      const mediaLink = document.querySelector<HTMLAnchorElement>('.media-title')!.href
      const links = getCover(mediaLink.split('/')[4]!)
      if (links.length > 0)
        presenceData.largeImageKey = `https://www.taiyo.moe${links[1]}`
      presenceData.details = document.querySelector('.media-title')?.textContent
      presenceData.state = `${
        document.querySelector('.chapter-number')?.textContent
      } - Página ${
        document.querySelector('.chapter-currentPage')?.textContent
      }`
      presenceData.buttons = [
        { label: 'Ler capítulo', url: href.replace(/\/[^/]*$/, '') },
        { label: 'Ler mangá', url: mediaLink },
      ]
      break
    }

    case 'media': {
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.cover-url')?.src
      presenceData.details = document.querySelector('.media-title')?.textContent
      presenceData.buttons = [{ label: 'Ler mangá', url: href }]
      break
    }

    default:
      presenceData.details = 'Na página inicial...'
      break
  }

  function getCover(uuid: string) {
    const elements = document.querySelectorAll(
      'link[rel="preload"][as="image"]',
    )
    const links: string[] = []
    for (const element of elements) {
      const imageSrcSet = element.getAttribute('imagesrcset')
      if (imageSrcSet)
        links.push(imageSrcSet.split(', ')[0]!.split(' ')[0]!)
    }
    return links.filter(link => link.includes(uuid))
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
