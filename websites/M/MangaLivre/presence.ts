const presence = new Presence({
  clientId: '1355724922483114115',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'logo',
    startTimestamp: browsingTimestamp,
  }

  const { pathname, href } = window.location
  const pathParts = pathname.split('/').filter(part => part !== '')

  try {
    // Página inicial
    if (pathname === '/') {
      presenceData.details = 'em: mangalivre.tv'
      presenceData.state = 'Escolhendo o que ler na página inicial'
      presenceData.smallImageKey = 'https://i.imgur.com/JEt3cEP.png'
      presenceData.largeImageKey = 'https://i.imgur.com/JEt3cEP.png'
    }

    else if (pathParts[0] === 'manga' && pathParts[2]?.startsWith('capitulo-')) {
      const mangaName = pathParts[1]?.replace(/-/g, ' ') || 'Desconhecido'
      const chapterNumber = pathParts[2]?.replace('capitulo-', '') || '0'

      presenceData.details = `Lendo: ${mangaName}`
      presenceData.state = `Capítulo: ${chapterNumber}`
      presenceData.largeImageKey = 'https://i.imgur.com/JEt3cEP.png'
      presenceData.smallImageKey = 'https://i.imgur.com/JEt3cEP.png'
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
      presenceData.largeImageKey = 'https://i.imgur.com/JEt3cEP.png'
      presenceData.smallImageKey = 'https://i.imgur.com/JEt3cEP.png'
    }
    // Outras páginas
    else {
      presenceData.details = 'Navegando no Mangá Livre'
      presenceData.state = 'Explorando conteúdo'
      presenceData.largeImageKey = 'https://i.imgur.com/JEt3cEP.png'
      presenceData.smallImageKey = 'https://i.imgur.com/JEt3cEP.png'
    }

    if (presenceData.details) {
      presence.setActivity(presenceData)
    }
    else {
      presence.setActivity()
    }
  }
  catch (error) {
    console.error('Erro no Presence:', error)
  }
})
