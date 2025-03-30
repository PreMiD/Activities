const presence = new Presence({
  clientId: '1355724922483114115',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)
enum ActivityAssets {
  Logo = 'https://i.imgur.com/8DAVgZT.png',
}
presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const { pathname, href } = window.location
  const pathParts = pathname.split('/').filter(part => part !== '')

  try {
    // Página inicial
    if (pathname === '/') {
      presenceData.details = 'em: mangalivre.tv'
      presenceData.state = 'Escolhendo o que ler na página inicial'
    }

    else if (pathParts[0] === 'manga' && pathParts[2]?.startsWith('capitulo-')) {
      const mangaName = pathParts[1]?.replace(/-/g, ' ') || 'Desconhecido'
      const chapterNumber = pathParts[2]?.replace('capitulo-', '') || '0'
const mangaCover = document.querySelector<HTMLImageElement>('.manga-thumb > div > a > img')?.src 
      presenceData.details = `Lendo: ${mangaName}`
      presenceData.state = `Capítulo: ${chapterNumber}`
      presenceData.largeImageKey = mangaCover ?? ActivityAssets.Logo
      presenceData.buttons = [
        {
          label: `Capítulo ${chapterNumber}`,
          url: href,
        },
      ]
    }

    else if (pathParts[0] === 'manga' && pathParts.length === 2) {
      const mangaName = pathParts[1]?.replace(/-/g, ' ') || 'Desconhecido'

      presenceData.details = 'Visualizando mangá'
      presenceData.state = mangaName
    }
    // Outras páginas
    else {
      presenceData.details = 'Navegando no Mangá Livre'
      presenceData.state = 'Explorando conteúdo'
    }

    if (presenceData.details) presence.setActivity(presenceData)
  else presence.setActivity()
  }
  catch (error) {
    presence.error('Erro no Presence:', error)
  }
})
