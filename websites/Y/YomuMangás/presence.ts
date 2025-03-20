const presence = new Presence({ clientId: '869377195682983957' })

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Y/YomuMang%C3%A1s/assets/0.png',
  }
  const { pathname, href } = document.location
  const privacy = await presence.getSetting<boolean>('privacy')
  const pages: Record<string, PresenceData> = {
    '/': { details: 'Página Inicial' },
    '/404': { details: '404', state: 'Uhn? Onde estamos?' },
    '/500': { details: '500', state: 'Uhn? Algo deu errado...' },
    '/search': { details: 'Pesquisa Avançada' },
    '/donate': { details: 'Página de Doações' },
    '/help': { details: 'Página de Ajuda' },
    '/tutorial': { details: 'Página de Tutorial' },
    '/shop': { details: 'Loja', state: 'Gastando Pães de Mel' },
  }

  if (!privacy) {
    if (pathname.startsWith('/manga')) {
      const isChapter = pathname.includes('/chapter/')
      const chapter = document.querySelector('#premid-manga-chapter')?.textContent || '0'
      if (
        document.querySelector('#premid-manga-nsfw')?.textContent !== 'true'
      ) {
        presenceData.details = document.querySelector('#premid-manga-title')?.textContent || 'Obra'
        presenceData.state = !isChapter
          ? 'Perfil da Obra'
          : Number.isNaN(Number(chapter))
            ? chapter
            : `Capítulo ${chapter}`
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('#premid-manga-cover')
          ?.src
          || 'https://cdn.rcd.gg/PreMiD/websites/Y/YomuMang%C3%A1s/assets/1.png'
        presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/Y/YomuMang%C3%A1s/assets/logo.png'
        presenceData.buttons = [
          { label: 'Acessar Obra', url: href.split('/chapter/')[0]! },
          { label: 'Ler Capítulo', url: href },
        ]
        if (!isChapter)
          presenceData.buttons?.pop()
      }
      else {
        presenceData.details = 'Sua biblioteca virtual de mangás'
        presenceData.state = 'manhwas, doujin e mais!'
      }
    }
    else if (pathname.startsWith('/user')) {
      const username = document.querySelector('#premid-user-name')?.textContent || 'あれ？'
      presenceData.details = `Perfil de ${username}`
      presenceData.state = pathname.endsWith('/settings')
        ? 'Configurando'
        : 'Vizualizando'
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>('#premid-user-avatar')?.src || 'https://cdn.rcd.gg/PreMiD/websites/Y/YomuMang%C3%A1s/assets/2.png'
      presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/Y/YomuMang%C3%A1s/assets/logo.png'
      presenceData.buttons = [
        {
          label: 'Ver Perfil',
          url: href.replace('settings', username.split('(')[0]?.trim() ?? ''),
        },
      ]
    }
    else {
      for (const [path, data] of Object.entries(pages)) {
        if (pathname.includes(path))
          presenceData = { ...presenceData, ...data } as PresenceData
      }
    }
  }
  else {
    presenceData.details = 'Sua biblioteca virtual de mangás'
    presenceData.state = 'manhwas, doujin e mais!'
  }

  presence.setActivity(presenceData)
})
