const presence = new Presence({
  clientId: '1190448612778463242',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/SlimeRead/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { href, pathname } = document.location

  switch (pathname.split('/')[1]) {
    case 'login':
      presenceData.details = 'Fazendo login'
      break

    case 'registrar':
      presenceData.details = 'Fazendo registro'
      break

    case 'esqueci-senha':
      presenceData.details = 'Recuperando senha'
      break

    case 'nacional':
    case 'nsfw':
      presenceData.details = 'Na página inicial'
      presenceData.state = 'Visualizando nacionais'
      break

    case 'biblioteca':
      presenceData.details = 'Visualizando biblioteca'
      break

    case 'recentes':
      presenceData.details = 'Visualizando recentes'
      break

    case 'admin':
      if (pathname.includes('/scan'))
        presenceData.details = 'Visualizando scan'
      else if (pathname.includes('/criar/novo'))
        presenceData.details = 'Criando mangá'
      else if (pathname.includes('/listar'))
        presenceData.details = 'Listando mangás'
      else if (pathname.includes('/criar-scan'))
        presenceData.details = 'Criando scan'
      else presenceData.details = 'Visualizando painel'
      break

    case 'pesquisa-obras':
      if (pathname.includes('/pesquisar')) {
        const searchValue = document.querySelector<HTMLInputElement>('input[type="text"]')?.value
        presenceData.details = 'Pesquisando mangás'
        if (searchValue)
          presenceData.state = `Mangá: ${searchValue}`
      }
      break

    case 'manga': {
      presenceData.largeImageKey = document.querySelectorAll<HTMLImageElement>(
        'img[title="Imagem"]',
      )[2]?.src
      presenceData.details = document.querySelector(
        '[class="mt-4 sm:ml-4 sm:mt-0  "] > p',
      )?.textContent
      presenceData.buttons = [{ label: 'Ler mangá', url: href }]
      break
    }

    case 'ler': {
      const chapterInfo = document.querySelector(
        '[class="ml-4 mt-4"] > h1',
      )?.textContent
      const mediaCover = document.querySelector<HTMLMetaElement>(
        'meta[property="image"]',
      )?.content
      if (mediaCover)
        presenceData.largeImageKey = mediaCover
      presenceData.details = chapterInfo?.split('/')[0]?.trim()
      presenceData.state = chapterInfo?.split('/')[1]?.trim()
      presenceData.buttons = [
        { label: 'Ler capítulo', url: href.replace(/\/[^/]*$/, '') },
        {
          label: 'Ler mangá',
          url: document.querySelector<HTMLAnchorElement>(
            '[class="ml-4 mt-4"] > h1 > a',
          )?.href ?? '',
        },
      ]
      break
    }

    default:
      presenceData.details = 'Na página inicial'
      break
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
