import { Assets } from 'premid'

const presence = new Presence({
  clientId: '641394369651277834',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Vcall = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/0.png',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/logo.png',
  Gnt = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/1.png',
  Viva = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/2.png',
  Gloobinho = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/3.png',
  Megapix = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/4.png',
  Universalplus = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/5.png',
  Universaltv = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/6.png',
  Syfy = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/7.png',
  Studiouniversal = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/8.png',
  Bis = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/9.png',
  Canalbrasil = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/10.png',
  Canaloff = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/11.png',
  Maisnatela = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/12.png',
  Combate = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/13.png',
  Cbn = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/14.png',
  Bbb = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/15.png',
  Modoviagem = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/16.png',
  TVGlobo = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/17.png',
  Sportv2 = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/18.png',
  Sportv = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/19.png',
  Sportv3 = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/20.png',
  Telecine = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/21.png',
  Tcpremium = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/22.png',
  Tcaction = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/23.png',
  Tctouch = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/24.png',
  Tcfun = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/25.png',
  Tcpipoca = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/26.png',
  Tccult = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/27.png',
  Starzplay = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/28.png',
  Gloob = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/29.png',
  Futura = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/30.png',
  Multishow = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/31.png',
  Globonews = 'https://cdn.rcd.gg/PreMiD/websites/G/globoplay/assets/32.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  if (document.location.hostname === 'globoplay.globo.com') {
    if (document.location.pathname === '/') {
      presenceData.details = 'Página inicial'
    }
    else if (document.location.pathname.includes('/categorias/')) {
      const categoryName = document.title.match(
        /Assistir (.+) online no Globoplay/,
      )?.[1]
      const categoryNamealt = document.querySelector(
        'div.application-controller__view > span > div > div > div > h1',
      )
      if (categoryName) {
        presenceData.details = 'Vendo a categoria:'
        presenceData.state = categoryName
        presenceData.smallImageKey = Assets.Reading
      }
      else if (categoryNamealt) {
        presenceData.details = 'Vendo a categoria:'
        presenceData.state = categoryNamealt.textContent
        presenceData.smallImageKey = Assets.Reading
      }
      else {
        presenceData.details = 'Categorias'
      }
    }
    else if (document.location.pathname.includes('/busca/')) {
      presenceData.details = 'Se preparando para'
      presenceData.state = 'pesquisar algo...'
      const search = document.querySelector<HTMLInputElement>('#search-bar-input')
      if (search && search.value.length > 2) {
        presenceData.details = 'Pesquisando por:'
        presenceData.state = search.value
        presenceData.smallImageKey = Assets.Search
      }
    }
    else if (document.location.pathname.includes('/programacao')) {
      presenceData.details = 'Programação'
    }
    else if (document.location.pathname.includes('/programas-locais')) {
      presenceData.details = 'Programas Locais'
    }
    else if (document.location.pathname.includes('/regiao/')) {
      const user = document.querySelector('h1.view-title')
      presenceData.details = `Vendo programas locais de ${user?.textContent}`
    }
    else if (document.location.pathname.includes('/configuracoes')) {
      presenceData.details = 'Configurações'
    }
    else if (document.location.pathname.includes('/minha-lista')) {
      presenceData.details = 'Minha Lista'
    }
    else if (document.location.pathname.includes('/t/')) {
      const user = document.querySelector('.media-cover__header-text')
      presenceData.details = 'Vendo o programa/filme:'
      presenceData.state = user?.textContent
      presenceData.smallImageKey = Assets.Reading
    }
    else if (document.location.pathname.includes('/v/')) {
      const video = document.querySelector<HTMLVideoElement>(
        '.id-playback > video',
      )
      const episodeTitle = document.querySelector(
        ':is(.video-info__data-program, .playkit-video-info__link-text)',
      )?.textContent
      if (
        episodeTitle
        && episodeTitle
        !== document.querySelector('.video-info__data-title')?.textContent
      ) {
        presenceData.state = document.querySelector(
          '.video-info__data-title',
        )?.textContent
      }

      if (video && !Number.isNaN(video.duration)) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
          Math.floor(video.currentTime),
          Math.floor(video.duration),
        )
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video.paused
          ? (await strings).pause
          : (await strings).play

        presenceData.details = episodeTitle

        if (video.paused) {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
      }
      else if (video && Number.isNaN(video.duration)) {
        presenceData.details = 'Olhando para:'
        presenceData.state = episodeTitle
      }
    }
    else if (document.location.pathname.includes('/podcasts/')) {
      const podcastTitle = document.querySelector(
        'div > div.podcast-view__header-info > h1',
      )?.textContent
      const podcastTitlealt = document.querySelector(
        'div.podcast-episode-view__header-info > div:nth-child(1) > a',
      )?.textContent
      const podcastCover = document.querySelector<HTMLImageElement>(
        'div.podcast-view__podcast-thumb > div > img',
      )?.srcset.match(/(https.+\.(png|jpg)) 360w/)?.[1]
      const podcastCoveralt = document.querySelector<HTMLImageElement>(
        'div.podcast-episode-view__thumb > div > img',
      )?.src
      const playingPodcast = Array.from(
        document.querySelectorAll('.episode-card'),
      ).find(element => element.querySelector('button[aria-label=Pausar]'))
      if (document.location.pathname.includes('/episode/')) {
        const playingPodcastalt = Array.from(
          document.querySelectorAll('.podcast-episode-view__header'),
        ).find(element => element.querySelector('button[aria-label=Pausar]'))
        presenceData.details = `Vendo o episódio do podcast ${podcastTitlealt}`
        presenceData.state = document.querySelector(
          'div.podcast-episode-view__header-info > h1',
        )?.textContent
        presenceData.largeImageKey = podcastCoveralt
        if (playingPodcastalt instanceof HTMLElement) {
          presenceData.largeImageKey = playingPodcastalt
            .querySelector<HTMLImageElement>('img')
            ?.srcset
            .match(/(https.+\.(png|jpg)) 360w/)?.[1]

          presenceData.details = podcastTitlealt

          // Podcast name
          presenceData.state = document.querySelector(
            'div.podcast-episode-view__header-info > h1',
          )?.textContent

          // Boolean if podcast is playing or paused
          const playing = playingPodcastalt.querySelector<HTMLButtonElement>(
            'button[aria-label=Pausar]',
          )?.style.display !== 'none'

          delete presenceData.startTimestamp

          if (playing) {
            const currentTime = playingPodcastalt.querySelector<HTMLSpanElement>('[data-testid=\'current-time\'')?.textContent
            const totalTime = playingPodcastalt.querySelector<HTMLSpanElement>(
              '[data-testid=\'total-time\'',
            )?.textContent

            if (currentTime && totalTime) {
              [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
                presence.timestampFromFormat(currentTime),
                presence.timestampFromFormat(totalTime),
              )
            }
          }

          presenceData.smallImageKey = playing ? Assets.Play : Assets.Pause
          presenceData.smallImageText = playing ? 'Playing' : 'Paused'
        }
      }
      else if (playingPodcast instanceof HTMLElement) {
        // Podcast image
        presenceData.largeImageKey = playingPodcast
          .querySelector<HTMLImageElement>('img')
          ?.srcset
          .match(/(https.+\.(png|jpg)) 360w/)?.[1]

        presenceData.details = podcastTitle

        // Podcast name
        presenceData.state = playingPodcast.querySelector<HTMLHeadingElement>(
          '.episode-card__headline',
        )?.textContent

        // Boolean if podcast is playing or paused
        const playing = playingPodcast.querySelector<HTMLButtonElement>('button[aria-label=Pausar]')?.style.display !== 'none'

        delete presenceData.startTimestamp

        if (playing) {
          const currentTime = playingPodcast.querySelector<HTMLSpanElement>(
            '[data-testid=\'current-time\'',
          )?.textContent
          const totalTime = playingPodcast.querySelector<HTMLSpanElement>(
            '[data-testid=\'total-time\'',
          )?.textContent

          if (currentTime && totalTime) {
            [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
              presence.timestampFromFormat(currentTime),
              presence.timestampFromFormat(totalTime),
            )
          }
        }

        presenceData.smallImageKey = playing ? Assets.Play : Assets.Pause
        presenceData.smallImageText = playing ? 'Playing' : 'Paused'
      }
      else if (podcastTitle) {
        presenceData.details = 'Vendo o podcast:'
        presenceData.state = podcastTitle
        presenceData.largeImageKey = podcastCover
      }
      else {
        presenceData.details = 'Podcasts'
      }
    }
    else if (document.location.pathname.includes('/ao-vivo/')) {
      const programTitle = document.querySelector(
        'span.playkit-channels-navigation__program-name',
      )
      const programMetadata = document.querySelector(
        'div.playkit-channels-navigation__program-metadata__text',
      )

      if (document.location.pathname.includes('/6120663/')) {
        presenceData.details = `TV Globo - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.TVGlobo
      }
      else if (document.location.pathname.includes('/7339131/')) {
        presenceData.details = `Multishow - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Multishow
      }
      else if (document.location.pathname.includes('/7339101/')) {
        presenceData.details = `GloboNews - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Globonews
      }
      else if (document.location.pathname.includes('/7339108/')) {
        presenceData.details = `sportv - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Sportv
      }
      else if (document.location.pathname.includes('/7339117/')) {
        presenceData.details = `sportv2 - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Sportv2
      }
      else if (document.location.pathname.includes('/7339123/')) {
        presenceData.details = `sportv3 - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Sportv3
      }
      else if (document.location.pathname.includes('/7339128/')) {
        presenceData.details = `GNT - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Gnt
      }
      else if (document.location.pathname.includes('/7339091/')) {
        presenceData.details = `Viva - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Viva
      }
      else if (document.location.pathname.includes('/7339146/')) {
        presenceData.details = `Gloob - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Gloob
      }
      else if (document.location.pathname.includes('/7339323/')) {
        presenceData.details = `Gloobinho - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Gloobinho
      }
      else if (document.location.pathname.includes('/7339152/')) {
        presenceData.details = `Megapix - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Megapix
      }
      else if (document.location.pathname.includes('/7339279/')) {
        presenceData.details = `Universal TV - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Universalplus
      }
      else if (document.location.pathname.includes('/7339326/')) {
        presenceData.details = `Studio Universal - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Studiouniversal
      }
      else if (document.location.pathname.includes('/7339224/')) {
        presenceData.details = `SYFY - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Syfy
      }
      else if (document.location.pathname.includes('/7339060/')) {
        presenceData.details = `Canal Brasil - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Canalbrasil
      }
      else if (document.location.pathname.includes('/7339078/')) {
        presenceData.details = `Canal OFF - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Canaloff
      }
      else if (document.location.pathname.includes('/7339140/')) {
        presenceData.details = `BIS - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Bis
      }
      else if (document.location.pathname.includes('/7339135/')) {
        presenceData.details = `Modo Viagem - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Modoviagem
      }
      else if (document.location.pathname.includes('/7420604/')) {
        presenceData.details = `Futura - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Futura
      }
      else if (document.location.pathname.includes('/8223631/')) {
        presenceData.details = `Premiere - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = Assets.Premiere
      }
      else if (document.location.pathname.includes('/8221785/')) {
        presenceData.details = `Premiere 2 - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = Assets.Premiere
      }
      else if (document.location.pathname.includes('/8221838/')) {
        presenceData.details = 'Mosaico Premiere'
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = Assets.Premiere
      }
      else if (document.location.pathname.includes('/8310612/')) {
        presenceData.details = `Combate - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Combate
      }
      else if (document.location.pathname.includes('/10221110/')) {
        presenceData.details = `Telecine Premium - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Tcpremium
      }
      else if (document.location.pathname.includes('/10221184/')) {
        presenceData.details = `Telecine Action - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Tcaction
      }
      else if (document.location.pathname.includes('/10221239/')) {
        presenceData.details = `Telecine Touch - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Tctouch
      }
      else if (document.location.pathname.includes('/10223522/')) {
        presenceData.details = `Telecine Fun - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Tcfun
      }
      else if (document.location.pathname.includes('/10221225/')) {
        presenceData.details = `Telecine Pipoca - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Tcpipoca
      }
      else if (document.location.pathname.includes('/10221109/')) {
        presenceData.details = `Telecine Cult - ${programTitle?.textContent}`
        presenceData.state = programMetadata?.textContent
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Tccult
      }
      else if (document.location.pathname.includes('/9182156/')) {
        presenceData.details = 'CBN São Paulo'
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Cbn
      }
      else if (document.location.pathname.includes('/9182126/')) {
        presenceData.details = 'CBN Rio de Janeiro'
        presenceData.smallImageKey = Assets.Live
        presenceData.largeImageKey = ActivityAssets.Cbn
      }
    }
    else if (document.location.pathname.includes('/canais/')) {
      if (document.location.pathname.includes('/globo/')) {
        presenceData.details = 'TV Globo'
        presenceData.largeImageKey = ActivityAssets.TVGlobo
      }
      else if (document.location.pathname.includes('/multishow/')) {
        presenceData.details = 'Multishow'
        presenceData.largeImageKey = ActivityAssets.Multishow
      }
      else if (document.location.pathname.includes('/globonews/')) {
        presenceData.details = 'GloboNews'
        presenceData.largeImageKey = ActivityAssets.Globonews
      }
      else if (document.location.pathname.includes('/sportv/')) {
        presenceData.details = 'sportv'
        presenceData.largeImageKey = ActivityAssets.Sportv
      }
      else if (document.location.pathname.includes('/gnt/')) {
        presenceData.details = 'GNT'
        presenceData.largeImageKey = ActivityAssets.Gnt
      }
      else if (document.location.pathname.includes('/viva/')) {
        presenceData.details = 'Viva'
        presenceData.largeImageKey = ActivityAssets.Viva
      }
      else if (document.location.pathname.includes('/gloob/')) {
        presenceData.details = 'Gloob'
        presenceData.largeImageKey = ActivityAssets.Gloob
      }
      else if (document.location.pathname.includes('/gloobinho/')) {
        presenceData.details = 'Gloobinho'
        presenceData.largeImageKey = ActivityAssets.Gloobinho
      }
      else if (document.location.pathname.includes('/megapix/')) {
        presenceData.details = 'Megapix'
        presenceData.largeImageKey = ActivityAssets.Megapix
      }
      else if (document.location.pathname.includes('/universal/')) {
        presenceData.details = 'Universal+'
        presenceData.largeImageKey = ActivityAssets.Universalplus
      }
      else if (document.location.pathname.includes('/canal-brasil/')) {
        presenceData.details = 'Canal Brasil'
        presenceData.largeImageKey = ActivityAssets.Canalbrasil
      }
      else if (document.location.pathname.includes('/canal-off/')) {
        presenceData.details = 'Canal OFF'
        presenceData.largeImageKey = ActivityAssets.Canaloff
      }
      else if (document.location.pathname.includes('/bis/')) {
        presenceData.details = 'BIS'
        presenceData.largeImageKey = ActivityAssets.Bis
      }
      else if (document.location.pathname.includes('/modo-viagem/')) {
        presenceData.details = 'Modo Viagem'
        presenceData.largeImageKey = ActivityAssets.Modoviagem
      }
      else if (document.location.pathname.includes('/futura/')) {
        presenceData.details = 'Futura'
        presenceData.largeImageKey = ActivityAssets.Futura
      }
      else if (document.location.pathname.includes('/premiere/')) {
        presenceData.details = Assets.Premiere
        presenceData.largeImageKey = Assets.Premiere
      }
      else if (document.location.pathname.includes('/combate/')) {
        presenceData.details = 'Combate'
        presenceData.largeImageKey = ActivityAssets.Combate
      }
      else if (document.location.pathname.includes('/telecine/')) {
        presenceData.details = 'Telecine'
        presenceData.largeImageKey = ActivityAssets.Telecine
      }
      else if (document.location.pathname.includes('/starzplay/')) {
        presenceData.details = 'STARZPLAY'
        presenceData.largeImageKey = ActivityAssets.Starzplay
      }
      else {
        presenceData.details = 'Canais'
      }
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
