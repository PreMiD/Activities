const presence = new Presence({
  clientId: '860857600203554816',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/Animes%20Games/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, search, href } = document.location
  const fav: HTMLDivElement | null = document.querySelector('.favFixed')

  if (fav && fav.style.display === 'block') {
    presenceData.details = 'Olhando os favoritos'
  }
  else {
    switch (pathname) {
      case '/': {
        if (search) {
          presenceData.details = 'Procurando'
          presenceData.state = `Procurando por ${search.substring(3)}`
        }
        else {
          presenceData.details = 'Explorando animesgames.net'
        }

        break
      }
      case '/lancamentos': {
        presenceData.details = 'Navegando os lançamentos'
        break
      }
      case '/lista-de-animes': {
        presenceData.details = 'Vendo Lista de Animes'
        break
      }
      case '/filmes': {
        presenceData.details = 'Vendo Lista de Filmes'
        if (search)
          presenceData.state = `Procurando por ${search.substring(8)}`

        break
      }
      case '/desenhos': {
        presenceData.details = 'Olhando para desenhos'
        if (search)
          presenceData.state = `Procurando por ${search.substring(8)}`

        break
      }
      case '/calendario': {
        const day: HTMLLIElement | null = document.querySelector(
          'ul#calen-nav > li.active',
        )
        presenceData.details = 'Olhando o Calendário'
        if (day)
          presenceData.state = `No dia: ${day.textContent}`

        break
      }
      default:
        if (pathname.startsWith('/genero/')) {
          const genre: HTMLHeadingElement | null = document.querySelector(
            'body > div.conteudoAlinhado > div.conteudoGen > section:nth-child(1) > section > h1',
          )
          presenceData.details = 'Procurando por gênero'
          if (genre)
            presenceData.state = genre.textContent
        }
        else if (/\/[a-z]\/animes\//.test(pathname)) {
          const anime: HTMLHeadingElement | null = document.querySelector(
            'body > div.conteudoAlinhado > div.conteudo > section:nth-child(1) > section.tituloPrincipal > h1',
          )
          presenceData.details = 'Vendo Sinopse'
          if (anime)
            presenceData.state = anime.textContent
          presenceData.buttons = [
            {
              label: 'Vendo Sinopse',
              url: href,
            },
          ]
        }
        else {
          const anime: HTMLHeadingElement | null = document.querySelector(
            'body > div.conteudoAlinhado > div.conteudo > section:nth-child(1) > section > h1',
          )
          const video: HTMLVideoElement | null = document.querySelector('video')
          if (anime) {
            const episode = Number.parseInt(anime.textContent?.split(' ').pop() ?? '');
            [presenceData.details] = anime.textContent?.split('-') ?? []
            if (!Number.isNaN(episode))
              presenceData.state = `Episódio: ${episode}`
            if (video) {
              [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
            }

            presenceData.buttons = [
              {
                label: 'Assistir Episódio',
                url: href,
              },
            ]
          }
        }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
