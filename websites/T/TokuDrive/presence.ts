import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1551484024109670421',
})

presence.on('UpdateData', async () => {
  const { pathname, search } = document.location
  const params = new URLSearchParams(search)

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: 'https://i.imgur.com/4so3zr3.png',
    largeImageText: 'TokuDrive',
  }

  if (pathname.includes('/app/catalogo.php')) {
    const franquia = params.get('franquia')

    if (franquia) {
      presenceData.details = `Visualizando ${franquia} Series`
      presenceData.state = 'Catálogo'
    }
    else {
      presenceData.details = 'Explorando o Catálogo'
      presenceData.state = 'TokuDrive'
    }
  }
  else if (pathname.includes('/app/serie.php')) {
    const logoEl = document.querySelector<HTMLImageElement>('img.title-logo-img')
    const showName = logoEl?.alt?.trim() ?? 'Tokusatsu desconhecido'

    presenceData.name = showName
    presenceData.details = showName
    presenceData.state = 'TokuDrive'

    if (logoEl?.src)
      presenceData.largeImageKey = logoEl.src
  }
  else if (pathname.includes('/app/player.php')) {
    const showNameEl = document.querySelector('.playlist-header h3')
    const showName = showNameEl?.textContent?.trim() ?? 'Tokusatsu desconhecido'
    const episodeTitle = params.get('title') ?? 'Episódio'

    const video = document.querySelector('video')

    presenceData.name = showName
    presenceData.details = `${showName}`
    presenceData.state = episodeTitle

    // Busca a capa do episódio atual (só o item com a classe "active" tem)
    // Se o anime/tokusatsu não tiver capa de episódio, mantém a logo do TokuDrive
    const activeCover = document.querySelector<HTMLImageElement>(
      'a.ep-list-item.active .ep-thumb-img',
    )

    if (activeCover?.src)
      presenceData.largeImageKey = activeCover.src

    if (video && !Number.isNaN(video.duration) && video.duration > 0) {
      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused ? 'Pausado' : 'Assistindo'

      if (!video.paused) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
          Math.floor(video.currentTime),
          Math.floor(video.duration),
        )
      }
    }
  }
  else {
    presenceData.details = 'Navegando no site'
    presenceData.state = 'TokuDrive'
  }

  presence.setActivity(presenceData)
})
