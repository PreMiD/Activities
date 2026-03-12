import { Assets } from 'premid'

const presence = new Presence({
  clientId: '684885381728043048',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})

function settingSetter(): void {
  if (document.location.pathname.includes('/pokedex'))
    presence.showSetting('pdexID')
  else presence.hideSetting('pdexID')
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Pokemontv = 'https://cdn.rcd.gg/PreMiD/websites/P/Pok%C3%A9mon/assets/0.png',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/P/Pok%C3%A9mon/assets/logo.png',
  Pokemonplay = 'https://cdn.rcd.gg/PreMiD/websites/P/Pok%C3%A9mon/assets/1.png',
  Pokeball = 'https://cdn.rcd.gg/PreMiD/websites/P/Pok%C3%A9mon/assets/2.png',
  Tcg = 'https://cdn.rcd.gg/PreMiD/websites/P/Pok%C3%A9mon/assets/3.png',
  Store = 'https://cdn.rcd.gg/PreMiD/websites/P/Pok%C3%A9mon/assets/4.png',
  Storejp = 'https://cdn.rcd.gg/PreMiD/websites/P/Pok%C3%A9mon/assets/5.png',
  Cafe = 'https://cdn.rcd.gg/PreMiD/websites/P/Pok%C3%A9mon/assets/6.png',
  Sweets = 'https://cdn.rcd.gg/PreMiD/websites/P/Pok%C3%A9mon/assets/7.png',
  Storekr = 'https://cdn.rcd.gg/PreMiD/websites/P/Pok%C3%A9mon/assets/8.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  settingSetter()

  switch (document.location.host) {
    case 'www.pokemon.com': {
      if (
        document.location.pathname.includes('/pokemon-news/')
        || document.location.pathname.includes('/actus-pokemon/')
        || document.location.pathname.includes('/novita-pokemon/')
        || document.location.pathname.includes('/pokemon-nieuws/')
        || document.location.pathname.includes('/pokemon-nyheter/')
        || document.location.pathname.includes('/noticias-pokemon/')
      ) {
        const title = document.querySelector('.full-article > h1')
        if (title) {
          presenceData.details = 'Reading article:'
          presenceData.state = title.textContent
          presenceData.smallImageKey = Assets.Reading
        }
        else {
          presenceData.details = 'Pokémon News'
          presenceData.state = 'Browsing...'
        }
      }
      else if (document.location.pathname.includes('/play-pokemon/')) {
        presenceData.largeImageKey = ActivityAssets.Pokemonplay
        const title = document.querySelector('.full-article > h1')
        if (title) {
          presenceData.details = 'Reading article:'
          presenceData.state = title.textContent
          presenceData.smallImageKey = Assets.Reading
        }
        else {
          presenceData.details = 'Play! Pokémon'
          presenceData.state = 'Browsing...'
        }
      }
      else if (document.location.pathname.includes('/pokedex/')) {
        presenceData.smallImageKey = ActivityAssets.Pokeball
        presenceData.smallImageText = 'Pokédex'
        const search = document.querySelector<HTMLInputElement>('#searchInput')

        if (
          document.querySelector('.pokedex-pokemon-pagination-title > div')
          !== null
        ) {
          const pdexID = await presence.getSetting<boolean>('pdexID')
          let name = document.querySelector(
            '.pokedex-pokemon-pagination-title > div',
          )?.textContent
          let number = document.querySelector(
            '.pokedex-pokemon-pagination-title > div > span',
          )?.textContent
          name = name?.replace(number ?? '', '').trim()
          number = number?.replace(/\D+/g, '')

          presenceData.details = 'Viewing Pokémon:'
          if (pdexID)
            presenceData.state = `${name} (#${number})`
          else presenceData.state = name
        }
        else if (search && search.value !== '') {
          if (search.value.length > 2) {
            presenceData.details = 'Pokédex - Searching for:'
            presenceData.state = search.value
          }
          else {
            presenceData.details = 'Pokédex'
            presenceData.state = 'Searching something up...'
          }
          presenceData.largeImageKey = ActivityAssets.Pokeball
          presenceData.smallImageKey = Assets.Search
        }
        else {
          presenceData.details = 'Pokédex'
          presenceData.state = 'Browsing...'
        }
      }
      else if (document.location.pathname.includes('/app')) {
        const title = document.querySelector('.full-article > h1')
        if (title) {
          presenceData.details = 'Viewing app:'
          presenceData.state = title.textContent
          presenceData.smallImageKey = Assets.Reading
        }
        else {
          presenceData.details = 'Viewing Pokémon Apps'
        }
      }
      else if (
        document.location.pathname.includes('/pokemon-video-games')
        || document.location.pathname.includes('/pokemon-videospiele')
        || document.location.pathname.includes('/jeux-video-pokemon')
        || document.location.pathname.includes('/videogiochi')
        || document.location.pathname.includes('/videojuegos-pokemon')
      ) {
        const title = document.querySelector('.full-article > h1')
        presenceData.smallImageKey = Assets.Reading
        if (title) {
          presenceData.details = 'Reading about game:'
          presenceData.state = title.textContent
        }
        else if (
          document.location.pathname.includes('/all-pokemon-games')
          || document.location.pathname.includes('/alle-pokemon-spiele')
          || document.location.pathname.includes('/todos-los-juegos-pokemon')
        ) {
          presenceData.details = 'Viewing all'
          presenceData.state = 'Pokémon games'
        }
        else {
          presenceData.details = 'Browsing through'
          presenceData.state = 'Pokémon\'s games'
        }
      }
      else if (
        document.querySelector(
          'body > nav > div.content-wrapper > ul > li.home > a',
        )
        && document.querySelector<HTMLLinkElement>(
          'body > nav > div.content-wrapper > ul > li.home > a',
        )?.href === document.URL
      ) {
        presenceData.details = 'Viewing the homepage...'
      }
      else if (
        document.location.pathname.includes('/pokemon-tcg')
        || document.location.pathname.includes('/pokemon-sammelkartenspiel')
        || document.location.pathname.includes('/jcc-pokemon')
        || document.location.pathname.includes('/pokemon-estampas-ilustradas')
        || document.location.pathname.includes('/gcc')
      ) {
        presenceData.largeImageKey = ActivityAssets.Tcg
        presenceData.smallImageKey = Assets.Reading

        if (
          document.location.pathname.includes('/pokemon-cards')
          || document.location.pathname.includes('/pokemon-karten')
          || document.location.pathname.includes('/cartas-pokemon')
          || document.location.pathname.includes('/cartes-pokemon')
          || document.location.pathname.includes('/archivio-carte')
        ) {
          presenceData.details = 'Viewing card:'
          presenceData.state = document.querySelector(
            '.card-description > div > h1',
          )?.textContent
        }
        else if (
          document.location.pathname.includes('/product-gallery')
          || document.location.pathname.includes('/Produktgalerie')
        ) {
          const title = document.querySelector('.full-article > h1')
          if (title) {
            presenceData.details = 'Viewing product:'
            presenceData.state = title.textContent
          }
          else {
            presenceData.details = 'Viewing Pokémon Card Game'
            presenceData.state = 'product galery'
          }
        }
        else if (document.location.pathname.includes('/leaderboards')) {
          presenceData.details = 'Viewing Trading Card Game'
          presenceData.state = 'Online leadersboards'
        }
        else {
          presenceData.details = 'Reading about Pokémon\'s'
          presenceData.state = 'Trading Card Game'
        }
      }
      else if (
        document.location.pathname.includes('/pokemon-episodes')
        || document.location.pathname.includes('/pokemon-folgen')
        || document.location.pathname.includes('/episodios-pokemon')
        || document.location.pathname.includes('/pokemon-afsnit')
        || document.location.pathname.includes('/pokemon-jaksot')
        || document.location.pathname.includes('/episodes-pokemon')
        || document.location.pathname.includes('/episodi-tv')
        || document.location.pathname.includes('/pokemon-afleveringen')
        || document.location.pathname.includes('/pokemon-episoder')
        || document.location.pathname.includes('/pokemon-avsnitt')
      ) {
        presenceData.largeImageKey = ActivityAssets.Pokemontv
        presenceData.details = 'Viewing PokémonTV'
      }
      else if (
        document.location.pathname.includes('/country-region')
        || document.location.pathname.includes('/land-region')
        || document.location.pathname.includes('/pais-region')
        || document.location.pathname.includes('/pais-regiao')
        || document.location.pathname.includes('/maa-alue')
        || document.location.pathname.includes('/pays-region')
        || document.location.pathname.includes('/seleziona-paese-regione')
        || document.location.pathname.includes('/land-regio')
      ) {
        presenceData.details = 'Changing region'
      }

      break
    }
    case 'tcg.pokemon.com': {
      presenceData.largeImageKey = ActivityAssets.Tcg
      if (document.location.pathname.includes('/how-to-play/')) {
        presenceData.details = 'Learning how to play'
      }
      else if (document.location.pathname.includes('/expansions/')) {
        presenceData.details = 'Viewing expansion:'
        presenceData.state = document.title.split('|')[1]?.trim()
      }
      else if (document.location.pathname.includes('/galleries/')) {
        presenceData.details = 'Viewing cards of expansion:'
        presenceData.state = document.title.split('|')[1]?.trim()
      }
      else if (document.location.pathname.includes('/parents-guide/')) {
        presenceData.details = 'Viewing parents guide'
      }
      else if (document.location.pathname.includes('/where-to-buy/')) {
        presenceData.details = 'Viewing where to buy'
      }

      break
    }
    case 'forums.pokemontcg.com': {
      presenceData.largeImageKey = ActivityAssets.Tcg
      if (document.location.pathname.includes('/topic')) {
        presenceData.details = 'Reading thread:'
        presenceData.state = document
          .querySelector('.ipsType_pageTitle')
          ?.textContent
          ?.trim()
        presenceData.smallImageKey = Assets.Reading
      }
      else if (document.location.pathname.includes('/forum')) {
        presenceData.details = 'Viewing category:'
        presenceData.state = document
          .querySelector('.ipsType_pageTitle')
          ?.textContent
          ?.trim()
        presenceData.smallImageKey = Assets.Reading
      }
      else if (document.location.pathname.includes('/leaderboard')) {
        presenceData.details = 'Viewing the leaderboards'
      }
      else if (document.location.pathname.includes('/pastleaders')) {
        presenceData.details = 'Viewing the pastleaders'
      }
      else if (document.location.pathname.includes('/topmembers')) {
        presenceData.details = 'Viewing the topmembers'
      }
      else if (document.location.pathname.includes('/discover')) {
        presenceData.details = 'Viewing the recent activity'
      }
      else if (document.location.pathname.includes('/search')) {
        presenceData.details = 'Searching for:'

        presenceData.state = document.querySelector<HTMLInputElement>('#elMainSearchInput')?.value
        presenceData.smallImageKey = Assets.Search
      }
      else {
        presenceData.details = 'Browsing the forums'
      }

      break
    }
    case 'www.pokemoncenter.com': {
      presenceData.largeImageKey = ActivityAssets.Store
      if (document.querySelector('.main_header')) {
        presenceData.details = 'Viewing product:'
        presenceData.state = document.querySelector('.main_header')?.textContent
      }
      else if (document.querySelector('.row > div > div > h1')) {
        presenceData.details = 'Viewing category:'
        presenceData.state = document
          .querySelector('.row > div > div > h1')
          ?.textContent
          ?.trim()
      }
      else if (
        document.location.pathname.includes('/AjaxOrderItemDisplayView')
      ) {
        presenceData.details = 'Viewing their cart'
      }
      else {
        presenceData.details = 'Browsing through the store'
      }

      break
    }
    case 'www.pokemoncenter-online.com': {
      presenceData.largeImageKey = ActivityAssets.Storejp
      if (document.location.pathname.includes('/cafe')) {
        presenceData.largeImageKey = ActivityAssets.Cafe
        if (document.location.pathname.includes('/pikachu_sweets')) {
          presenceData.largeImageKey = ActivityAssets.Sweets
          presenceData.details = 'Viewing the'
          presenceData.state = 'Pikachu Sweets Cafe'
        }
        else if (document.location.pathname.includes('/menu')) {
          presenceData.details = 'Viewing the menu'
        }
        else if (document.location.pathname.includes('/goods')) {
          presenceData.details = 'Viewing the goods'
        }
        else if (document.location.pathname.includes('/news')) {
          if (
            document.querySelector(
              '#mainContent > section > div > div > div.boxStyle03 > div > h3',
            )
          ) {
            presenceData.details = 'Reading article:'
            presenceData.state = document.querySelector(
              '#mainContent > section > div > div > div.boxStyle03 > div > h3',
            )?.textContent
            presenceData.smallImageKey = Assets.Reading
          }
          else {
            presenceData.details = 'Viewing the articles'
          }
        }
        else if (document.URL.includes('access')) {
          presenceData.details = 'Viewing the access points'
        }
        else if (document.location.pathname.includes('/faq')) {
          presenceData.details = 'Viewing the FAQs'
        }
        else if (document.location.pathname.includes('/reservation')) {
          presenceData.details = 'Making a reservation'
        }
      }
      else if (
        document.querySelector(
          '#contents > section > div.item_detail > article > h1',
        )
      ) {
        presenceData.details = 'Viewing product:'
        presenceData.state = document.querySelector(
          '#contents > section > div.item_detail > article > h1',
        )?.textContent
      }
      else if (
        document.querySelector(
          '#contents > div.topic_path > ul > li:nth-child(2) > span',
        )
      ) {
        presenceData.details = 'Viewing category:'
        presenceData.state = document.querySelector(
          '#contents > div.topic_path > ul > li:nth-child(2) > span',
        )?.textContent
      }
      else if (document.URL.includes('shopping_cart')) {
        presenceData.details = 'Viewing their cart'
      }
      else {
        presenceData.details = 'Browsing through the store'
      }

      break
    }
    default:
      if (
        document.location.host.match(
          '([a-z0-9]+)[.]pokemon-cafe[.]([a-z0-9]+)([.]([a-z0-9]+))?',
        )
      ) {
        presenceData.largeImageKey = ActivityAssets.Cafe
        presenceData.details = 'Making a reservation'
      }
      else {
        switch (document.location.host) {
          case 'watch.pokemon.com': {
            presenceData.largeImageKey = ActivityAssets.Pokemontv
            if (document.location.pathname.includes('/player')) {
              const video = document.querySelector('video')!

              presenceData.smallImageKey = video.paused
                ? Assets.Pause
                : Assets.Play
              presenceData.smallImageText = video.paused
                ? (await strings).pause
                : (await strings).play;
              [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)

              const title = document
                .querySelector('.header-bar-small > span:nth-child(4)')
                ?.textContent
                ?.split(' - ')[1]
                ?.trim()
              presenceData.details = `${document
                .querySelector('.header-bar-small > span:nth-child(2)')
                ?.textContent
                ?.trim()} - ${document
                .querySelector('.header-bar-small > span:nth-child(4)')
                ?.textContent
                ?.split(' - ')[0]
                ?.trim()}`
              presenceData.state = title

              if (video.paused) {
                delete presenceData.startTimestamp
                delete presenceData.endTimestamp
              }
            }
            else if (document.location.pathname.includes('/season')) {
              presenceData.details = 'Viewing season:'
              presenceData.state = document.querySelector('#lbl_season_title')?.textContent
            }
            else {
              presenceData.details = 'Browsing PokémonTV'
            }

            break
          }
          case 'pokemonkorea.co.kr': {
            if (document.location.pathname.includes('/news/')) {
              presenceData.smallImageKey = Assets.Reading
              presenceData.details = 'Reading article:'

              const title = document.querySelector('.section-title')
              const tag = document.querySelector('.section-title > span')
              const publish = document.querySelector('.section-title > small')
              if (tag) {
                presenceData.state = title?.textContent
                  ?.replace(tag.textContent ?? '', '')
                  ?.replace(publish?.textContent ?? '', '')
              }
              else {
                presenceData.state = title?.textContent?.replace(
                  publish?.textContent ?? '',
                  '',
                )
              }
            }
            else if (document.location.pathname.includes('/news')) {
              presenceData.details = 'Viewing the recent'
              presenceData.state = 'News and Announcements'
            }
            else if (document.location.pathname.includes('/game/')) {
              const title = document.querySelector('.medium-title')
              if (title) {
                presenceData.details = 'Viewing game:'
                presenceData.state = title.textContent
              }
              else if (document.location.pathname.includes('/category/')) {
                presenceData.details = 'Viewing category:'
                presenceData.state = document.querySelector('.section-title')?.textContent
              }
            }
            else if (document.location.pathname.includes('/game')) {
              presenceData.details = 'Viewing Pokémon\'s games'
            }
            else if (document.location.pathname.includes('/pokedex')) {
              presenceData.smallImageKey = ActivityAssets.Pokeball
              presenceData.smallImageText = 'Pokédex'
              const search = document.querySelector<HTMLInputElement>('#word.form-control')
              if (
                document.querySelector(
                  'body > div.single_header_wrap > div > h1',
                ) !== null
              ) {
                const pdexID = await presence.getSetting<boolean>('pdexID')
                let name = document
                  .querySelector('body > div.single_header_wrap > div > h1')
                  ?.textContent
                  ?.trim()
                let number = document.querySelector(
                  'body > div.single_header_wrap > div > h1 > span',
                )?.textContent
                name = name?.replace(number ?? '', '')
                number = number?.replace('No. ', '')

                presenceData.details = 'Viewing Pokémon:'
                if (pdexID)
                  presenceData.state = `${name} (#${number})`
                else presenceData.state = name
              }
              else if (search && search.value !== '') {
                if (search.value.length > 2) {
                  presenceData.details = 'Pokédex - Searching for:'
                  presenceData.state = search.textContent
                }
                else {
                  presenceData.details = 'Pokédex'
                  presenceData.state = 'Searching something up...'
                }
                presenceData.largeImageKey = ActivityAssets.Pokeball
                presenceData.smallImageKey = Assets.Search
              }
              else {
                presenceData.details = 'Pokédex'
                presenceData.state = 'Browsing...'
              }
            }
            else if (document.location.pathname.includes('/animation')) {
              const title = document.querySelector('.medium-title')
              if (title) {
                presenceData.details = 'Reading about animation:'
                presenceData.state = title.textContent
                presenceData.smallImageKey = Assets.Reading
              }
              else {
                presenceData.details = 'Viewing Pokémon\'s animations'
              }
            }
            else if (document.location.pathname.includes('/product')) {
              presenceData.largeImageKey = ActivityAssets.Storekr
              const title = document.querySelector('.medium-title')
              if (title) {
                presenceData.details = 'Viewing product:'
                presenceData.state = title.textContent
              }
              else {
                presenceData.details = 'Browsing through'
                presenceData.state = 'Pokémon\'s products'
              }
            }

            break
          }
          case 'pokemoncard.co.kr': {
            presenceData.largeImageKey = ActivityAssets.Tcg
            if (document.location.pathname.includes('/main')) {
              presenceData.details = 'Browsing...'
            }
            else if (document.location.pathname.includes('/news/')) {
              presenceData.smallImageKey = Assets.Reading
              presenceData.details = 'Reading article:'

              const title = document.querySelector('.section-title')
              const tag = document.querySelector('.section-title > span')
              const publish = document.querySelector('.section-title > small')
              if (tag) {
                presenceData.state = title?.textContent
                  ?.replace(tag.textContent ?? '', '')
                  ?.replace(publish?.textContent ?? '', '')
              }
              else {
                presenceData.state = title?.textContent?.replace(
                  publish?.textContent ?? '',
                  '',
                )
              }
            }
            else if (document.location.pathname.includes('/news')) {
              presenceData.details = 'Viewing the recent'
              presenceData.state = 'News and Announcements'
            }
            else if (document.location.pathname.includes('/card')) {
              if (document.location.pathname.includes('/category')) {
                if (document.location.pathname.includes('/event')) {
                  presenceData.details = 'Viewing upcoming events'
                }
                else {
                  presenceData.details = 'Viewing category:'
                  presenceData.state = document
                    .querySelector('#partners > div > div > ul > li.active')
                    ?.textContent
                    ?.trim()
                }
              }
              else if (document.location.pathname.includes('/play')) {
                presenceData.details = 'Learning how to play'
              }
              else if (
                document
                  .querySelector<HTMLLinkElement>(
                    '#header-top-menu > li.active > a',
                  )
                  ?.href
                  .includes('/event')
              ) {
                presenceData.details = 'Viewing event:'
                presenceData.state = document.querySelector('.medium-title')?.textContent
              }
              else if (document.location.pathname.includes('/cards')) {
                const input = document.querySelector<HTMLInputElement>('#search_text')
                if (document.location.pathname.includes('/detail')) {
                  presenceData.details = 'Viewing card:'
                  presenceData.state = document.querySelector('.card-hp.title')?.textContent
                }
                else if (input && input.value !== '') {
                  if (input.value.length > 2) {
                    presenceData.details = 'Searching for:'
                    presenceData.state = input.value
                  }
                  else {
                    presenceData.details = 'Searching up something...'
                  }

                  presenceData.smallImageKey = Assets.Search
                }
                else {
                  presenceData.details = 'Browsing through the cards'
                }
              }
              else if (document.querySelector('.medium-title')) {
                presenceData.details = 'Viewing card:'
                presenceData.state = document.querySelector('.medium-title')?.textContent
              }
              else {
                presenceData.details = 'Browsing through the cards'
              }
            }
            else if (document.location.pathname.includes('/players')) {
              presenceData.details = 'Viewing players'
            }

            break
          }
          case 'www.pokemonstore.co.kr': {
            presenceData.largeImageKey = ActivityAssets.Storekr
            if (document.location.pathname.includes('/goods_view')) {
              presenceData.details = 'Viewing product:'
              presenceData.state = document
                .querySelector('.goods-header > div.top > div')
                ?.textContent
                ?.trim()
            }
            else if (document.location.pathname.includes('/goods_list')) {
              presenceData.details = 'Viewing category:'
              presenceData.state = document.querySelector(
                '#content > div > div > div.cg-main > h2',
              )?.textContent
            }
            else if (document.location.pathname.includes('/main')) {
              presenceData.details = 'Browsing...'
            }
            else if (document.location.pathname.includes('/board/list')) {
              presenceData.details = 'Viewing product reviews'
            }
            else if (document.location.pathname.includes('/board/view')) {
              presenceData.details = 'Viewing review of product:'
              presenceData.state = document.querySelector('.itemorder-name')?.textContent
            }
            else if (
              document.location.pathname.includes('/mypage/order_list')
            ) {
              presenceData.details = 'Viewing their orders'
            }
            else if (document.location.pathname.includes('/mypage/wish_list')) {
              presenceData.details = 'Viewing their wish list'
            }
            else if (document.location.pathname.includes('/mypage/index')) {
              presenceData.details = 'Viewing their page'
            }
            else if (document.location.pathname.includes('/order/cart')) {
              presenceData.details = 'Viewing their cart'
            }

            break
          }
          case 'www.pokemon.co.jp': {
            if (document.location.pathname.includes('/app')) {
              presenceData.details = 'Viewing Pokémon Apps'
            }
            else if (document.location.pathname.includes('/game')) {
              presenceData.details = 'Viewing Pokémon Games'
            }
            else if (document.location.pathname.includes('/ex/')) {
              presenceData.details = 'Viewing game:'
              presenceData.state = document.title
            }
            else if (document.location.pathname.includes('/card')) {
              presenceData.details = 'Viewing Pokémon Cards'
            }
            else if (document.location.pathname.includes('/event')) {
              presenceData.details = 'Viewing Pokémon Events'
            }
            else if (document.location.pathname.includes('/anime')) {
              presenceData.largeImageKey = ActivityAssets.Pokemontv
              const title = document.querySelector('.m-ttl-top')
                || document.querySelector('.m-ttl-dot')
              if (title) {
                presenceData.details = 'Viewing show:'
                presenceData.state = title.textContent
              }
              else {
                presenceData.details = 'Viewing Pokémon TV/Movies'
              }
            }
            else if (document.location.pathname.includes('/gp')) {
              const title = document.querySelector('.m-ttl-top')
              if (title && title.textContent?.includes('ポケモンセンタ')) {
                presenceData.details = 'Viewing Pokémon Center:'
                presenceData.state = title.textContent
                  .replace('ポケモンセンター', '')
                  .trim()
              }
              else if (
                title
                && title.textContent?.includes('ポケモンストア')
              ) {
                presenceData.details = 'Viewing Pokémon Store:'
                presenceData.state = title.textContent
                  .replace('ポケモンストア', '')
                  .trim()
              }
              else {
                presenceData.details = 'Viewing Pokémon Centers'
              }
            }
            else if (document.location.pathname.includes('/sp')) {
              const title = document.querySelector('.m-ttl-top')
              if (title) {
                presenceData.details = 'Viewing Upcoming Pokémon Center:'
                presenceData.state = title.textContent
                  ?.split('、')[0]
                  ?.replace('ポケモンセンター', '')
                  .trim()
              }
              else {
                presenceData.details = 'Viewing Upcoming Pokémon Centers'
              }
            }
            else if (document.location.pathname.includes('/goods')) {
              presenceData.smallImageKey = ActivityAssets.Storejp
              const title = document.querySelector('.m-ttl-hd')
              if (title) {
                presenceData.details = 'Viewing Pokémon Goods'
                presenceData.state = `in category: ${title.textContent}`
              }
              else {
                presenceData.details = 'Viewing Pokémon Goods'
              }
            }

            break
          }
          case 'www.pokemon-movie.jp': {
            presenceData.largeImageKey = ActivityAssets.Pokemontv
            if (document.location.pathname.includes('/news/')) {
              if (document.URL.includes('?p=')) {
                presenceData.smallImageKey = Assets.Reading
                presenceData.details = 'Reading article:'
                presenceData.state = document.querySelector(
                  '#pagemain_newbig > div > div.entry_header > h2 > a',
                )?.textContent
              }
              else {
                presenceData.details = 'Viewing the recent articles'
              }
            }
            else if (document.location.pathname === '/') {
              presenceData.details = 'Pokémon Movie'
              presenceData.state = 'Browsing...'
            }
            else if (document.location.pathname.includes('/chara/')) {
              presenceData.details = 'Pokémon Movie'
              presenceData.state = 'Viewing the characters'
            }
            else if (document.location.pathname.includes('/story/')) {
              presenceData.smallImageKey = Assets.Reading
              presenceData.details = 'Pokémon Movies'
              presenceData.state = 'Reading the story'
            }
            else if (document.location.pathname.includes('/tickets/')) {
              presenceData.details = 'Pokémon Movies'
              presenceData.state = 'Getting tickets'
            }
            else if (document.location.pathname.includes('/playground/')) {
              presenceData.details = 'Pokémon Movies'
              presenceData.state = 'Viewing the playground'
            }
            else if (document.location.pathname.includes('/history/')) {
              if (document.querySelector('#main > h1 > img')) {
                presenceData.details = 'Viewing history of:'
                presenceData.state = document.querySelector<HTMLImageElement>(
                  '#main > h1 > img',
                )?.alt
              }
              else {
                presenceData.details = 'Pokémon Movies'
                presenceData.state = 'Viewing the history'
              }
            }
            else if (document.location.pathname.includes('/melmaga/form')) {
              presenceData.details = 'Pokémon Movies'
              presenceData.state = 'Signing up for the magazine'
            }

            break
          }
          case 'www.pokemon-card.com': {
            presenceData.largeImageKey = ActivityAssets.Tcg
            if (document.location.pathname.includes('/about')) {
              presenceData.details = 'Viewing the tutorial'
            }
            else if (document.location.pathname.includes('/rules')) {
              if (document.location.pathname.includes('/regulation'))
                presenceData.details = 'Viewing the regulation'
              else presenceData.details = 'Viewing the Q&A'
            }
            else if (document.location.pathname.includes('/products')) {
              if (document.location.pathname.includes('/products/s')) {
                presenceData.details = 'Viewing product:'
                presenceData.state = document.querySelector(
                  '.MainArea > div > nav > ul > li.current',
                )?.textContent
              }
              else {
                presenceData.details = 'Viewing products'
              }
            }
            else if (document.location.pathname.includes('/ex')) {
              presenceData.details = 'Viewing extension pack:';
              [, presenceData.state] = document.title
                .split('」 ｜ ')[0]
                ?.split('「') ?? []
            }
            else if (document.location.pathname.includes('/event')) {
              if (
                document.querySelector(
                  '.detailCalenderEventArea > section:nth-child(1) > ul > li:nth-child(1) > div > div.List_body',
                )
              ) {
                let title = document.querySelector(
                  '.detailCalenderEventArea > section:nth-child(1) > ul > li:nth-child(1) > div > div.List_body',
                )?.textContent
                const tags = document.querySelector(
                  '.detailCalenderEventArea > section:nth-child(1) > ul > li:nth-child(1) > div > div.List_body > ul',
                )
                const warning = document.querySelector(
                  '.detailCalenderEventArea > section:nth-child(1) > ul > li:nth-child(1) > div > div.List_body > div',
                )

                if (tags)
                  title = title?.replace(tags.textContent ?? '', '')

                if (warning)
                  title = title?.replace(warning.textContent ?? '', '')

                presenceData.details = 'Viewing event:'
                presenceData.state = title
              }
              else {
                presenceData.details = 'Browsing through the'
                presenceData.state = 'upcoming events'
              }
            }
            else if (document.location.pathname.includes('/card-search/')) {
              if (document.location.pathname.includes('/card/')) {
                presenceData.details = 'Viewing card:'
                presenceData.state = document.querySelector(
                  'body > div > div.PopupMain > section.Section > h1',
                )?.textContent
              }
              else {
                presenceData.details = 'Searching through'
                presenceData.state = 'the cards...'
                presenceData.smallImageKey = Assets.Search
              }
            }
            else if (document.location.pathname.includes('/info/')) {
              presenceData.details = 'Reading article:'
              presenceData.state = document.querySelector(
                'body > div.WrapperArea > div.MainArea > div > section > h1',
              )?.textContent
              presenceData.smallImageKey = Assets.Reading
            }
            else if (document.location.pathname.includes('/deck/')) {
              presenceData.details = 'Browsing decks...'
            }

            break
          }
          case 'map.pokemon-card.com': {
            presenceData.largeImageKey = ActivityAssets.Tcg
            presenceData.details = 'Viewing the map'

            break
          }
          case 'www.portal-pokemon.com': {
            presenceData.details = 'Changing region'
            break
          }
          default:
            if (
              document.location.host.match(
                '(([a-z0-9]+)[.])?portal-pokemon[.]com',
              )
            ) {
              if (document.location.pathname.includes('/anime')) {
                presenceData.largeImageKey = ActivityAssets.Pokemontv
                if (document.location.pathname.includes('/series')) {
                  presenceData.details = 'Viewing serie:'
                  presenceData.state = document.querySelector(
                    '.article-detail__title',
                  )?.textContent
                }
                else {
                  presenceData.details = 'Viewing ongoing series'
                }
              }
              else if (document.location.pathname.includes('/topics')) {
                if (document.location.pathname.includes('/movie')) {
                  presenceData.smallImageKey = Assets.Reading
                  presenceData.details = 'Reading about movie:'
                  presenceData.state = document.querySelector(
                    '.article-detail__title',
                  )?.textContent
                }
                else if (document.location.pathname.includes('/apps')) {
                  presenceData.smallImageKey = Assets.Reading
                  presenceData.details = 'Reading about app:'
                  presenceData.state = document.querySelector(
                    '.article-detail__title',
                  )?.textContent
                }
                else if (document.location.pathname.includes('/game')) {
                  presenceData.smallImageKey = Assets.Reading
                  presenceData.details = 'Reading about game:'
                  presenceData.state = document.querySelector(
                    '.article-detail__title',
                  )?.textContent
                }
                else if (document.location.pathname.includes('/event')) {
                  presenceData.smallImageKey = Assets.Reading
                  presenceData.details = 'Reading about event:'
                  presenceData.state = document.querySelector(
                    '.article-detail__title',
                  )?.textContent
                }
              }
              else if (document.location.pathname.includes('/movie')) {
                presenceData.details = 'Viewing Pokémon\'s movies'
              }
              else if (document.location.pathname.includes('/goods')) {
                if (document.querySelector('.article-detail__title')) {
                  presenceData.details = 'Viewing product:'
                  presenceData.state = document.querySelector(
                    '.article-detail__title',
                  )?.textContent
                }
                else if (
                  document.querySelector('.category-list__element--current')
                  && document.querySelector('.category-list__element--current')
                    ?.textContent
                    !== document.querySelector('.category-list__element')
                      ?.textContent
                ) {
                  presenceData.details = 'Goods - Viewing category:'
                  presenceData.state = document.querySelector(
                    '.category-list__element--current',
                  )?.textContent
                }
                else {
                  presenceData.details = 'Browsing through'
                  presenceData.state = 'Pokémon\'s goods'
                }
              }
              else if (document.location.pathname.includes('/apps')) {
                presenceData.details = 'Viewing Pokémon Apps'
              }
              else if (document.location.pathname.includes('/game')) {
                presenceData.details = 'Viewing Pokémon Games'
              }
              else if (document.location.pathname.includes('/event')) {
                presenceData.details = 'Viewing Pokémon Events'
              }
              else if (document.location.pathname.includes('/pokedex')) {
                presenceData.smallImageKey = ActivityAssets.Pokeball
                presenceData.smallImageText = 'Pokédex'
                const search = document.querySelector<HTMLInputElement>('#search_input')

                if (document.querySelector('.pokemon-detail__profile')) {
                  const pdexID = await presence.getSetting<boolean>('pdexID')
                  const name = document.querySelector(
                    '.pokemon-slider__main-name',
                  )?.textContent

                  presenceData.details = 'Viewing Pokémon:'
                  if (pdexID) {
                    presenceData.state = `${name} (#${
                      document.querySelector('.pokemon-slider__main-no')
                        ?.textContent
                    })`
                  }
                  else {
                    presenceData.state = name
                  }
                }
                else if (search && search.textContent) {
                  if (search.textContent.length > 2) {
                    presenceData.details = 'Pokédex - Searching for:'
                    presenceData.state = search.textContent
                  }
                  else {
                    presenceData.details = 'Pokédex'
                    presenceData.state = 'Searching something up...'
                  }
                  presenceData.largeImageKey = ActivityAssets.Pokeball
                  presenceData.smallImageKey = Assets.Search
                }
                else {
                  presenceData.details = 'Pokédex'
                  presenceData.state = 'Browsing...'
                }
              }
              else if (document.location.pathname.includes('/card')) {
                presenceData.largeImageKey = ActivityAssets.Tcg
                if (document.querySelector('.article-detail__title')) {
                  presenceData.details = 'Viewing extension pack:'
                  presenceData.state = document.querySelector(
                    '.article-detail__title',
                  )?.textContent
                }
                else if (document.location.pathname.includes('/map')) {
                  presenceData.details = 'Viewing the map'
                }
                else {
                  presenceData.details = 'Reading about the'
                  presenceData.state = 'Trading Card Game'
                  presenceData.smallImageKey = Assets.Reading
                }
              }
              else if (
                document.location.pathname.includes('/pokemoncenter')
              ) {
                presenceData.details = 'Reading about the'
                presenceData.state = 'Pokémon Center'
                presenceData.smallImageKey = Assets.Reading
              }
            }
        }
      }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
