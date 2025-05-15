import {
  presence,
  registerSlideshowKey,
  renderMatchupIcon,
  slideshow,
} from './util.js'

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.discordapp.com/icons/528327242875535372/a_ff168617165e959a877a5b5f01ccb423.gif?size=512&hack=.gif',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: 'RoyaleAPI',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const strings = await presence.getStrings({
    search: 'general.search',
    viewPage: 'general.viewPage',
    viewCard: 'royaleapi.viewCard',
    viewClan: 'royaleapi.viewClan',
    viewHome: 'general.viewHome',
    viewProfile: 'general.viewProfile',
    viewAccount: 'general.viewAccount',
    browseCards: 'royalapi.browseCards',
    browsingBlog: 'royaleapi.browsingBlog',
    browseBlogTag: 'royaleapi.browseBlogTag',
    buttonViewCard: 'royaleapi.buttonViewCard',
    viewClanFamily: 'royaleapi.viewClanFamily',
    buttonViewClan: 'royaleapi.buttonViewClan',
    readingAnArticle: 'general.readingAnArticle',
    buttonReadArticle: 'general.buttonReadArticle',
    buttonViewProfile: 'general.buttonViewProfile',
    buttonViewClanGame: 'royaleapi.buttonViewClanGame',
    buttonViewPlayerGame: 'royaleapi.buttonViewPlayerGame',
  })
  const { pathname, href, search } = document.location
  const searchParams = new URLSearchParams(search)
  const pathList = pathname.split('/').filter(Boolean)
  let useSlideshow = false

  switch (pathList[0] ?? '/') {
    case '/': {
      presenceData.details = strings.viewHome
      break
    }
    case 'blog': {
      switch (pathList[1] ?? '/') {
        case '/': {
          presenceData.details = strings.browsingBlog
          break
        }
        case 'search': {
          presenceData.details = strings.search
          break
        }
        case 'tags': {
          if (pathList[2]) {
            presenceData.details = strings.browseBlogTag
            presenceData.state = document.querySelector(
              '#page_content div.tag',
            )
          }
          else {
            presenceData.details = strings.browsingBlog
          }
          break
        }
        default: {
          presenceData.details = strings.readingAnArticle
          presenceData.state = document.querySelector('h1')
          presenceData.buttons = [
            { label: strings.buttonReadArticle, url: href },
          ]
        }
      }
      break
    }
    case 'card': {
      const cardName = document.querySelector('h1')?.textContent ?? ''
      presenceData.details = strings.viewCard
      presenceData.smallImageKey
        = document.querySelector<HTMLImageElement>('.card_image img')
      presenceData.buttons = [{ label: strings.viewCard, url: href }]
      switch (pathList[2] ?? '/') {
        case '/': {
          presenceData.state = cardName
          break
        }
        case 'matchup': {
          useSlideshow = true
          presenceData.state = `${cardName} - ${document.querySelector('.nav_menu .active')?.textContent}`
          if (registerSlideshowKey('matchup')) {
            const matches = document.querySelectorAll<HTMLAnchorElement>(
              '.items_container .card',
            )
            for (const match of matches) {
              presenceData.smallImageKey = renderMatchupIcon(match!)
              const opposingName = match.querySelector<HTMLImageElement>(
                '.matchup_chart + .image img',
              )?.alt
              const competition = [
                ...match.querySelectorAll('.matchup_chart > div > div'),
              ]
                .map(text => text.textContent)
                .join(' - ')
              presenceData.smallImageText = `${cardName} / ${opposingName}: ${competition}`
            }
          }
          break
        }
        case 'season': {
          presenceData.state = `${cardName} - ${document.querySelector('.nav_menu .active')?.textContent}`
          break
        }
      }
      break
    }
    case 'cards': {
      switch (pathList[1]) {
        case 'popular': {
          const mainSection = document.querySelector(
            '.card_filter_menu .text',
          )?.textContent
          const filter
            = document.querySelector('.filter_menu .active')?.textContent ?? ''
          presenceData.details = strings.browseCards
          presenceData.state = `${mainSection} - ${filter}`
          useSlideshow = true
          if (registerSlideshowKey(filter)) {
            const cards = document.querySelectorAll('[data-card]')
            for (const card of cards) {
              const rank = card.querySelector('.card_rank_label_container')
              const name = card.querySelector('.card_name')?.textContent ?? ''
              const data: PresenceData = {
                ...presenceData,
                smallImageKey: card.querySelector('img'),
                smallImageText: `#${rank?.textContent} - ${name}`,
                buttons: [
                  {
                    label: strings.buttonViewCard,
                    url: card.querySelector('a'),
                  },
                ],
              }
              slideshow.addSlide(name, data, MIN_SLIDE_TIME)
            }
          }
          break
        }
        case 'viz': {
          presenceData.details = strings.viewPage
          presenceData.details = document.querySelector('h2')?.firstChild
          break
        }
      }
      break
    }
    case 'clan': {
      if (pathList[1] === 'family') {
        presenceData.details = strings.viewClanFamily
        presenceData.state = document.querySelector(
          '#page_content .header.item',
        )
        break
      }

      presenceData.details = strings.viewClan
      presenceData.state = `${document.querySelector('h1')?.textContent} - ${document.querySelector('.clan__menu .item.active')}`
      presenceData.smallImageKey
        = document.querySelector<HTMLImageElement>('img.floated.right')
      presenceData.buttons = [
        {
          label: strings.buttonViewClan,
          url: href,
        },
        {
          label: strings.buttonViewClanGame,
          url: `clashroyale://clanInfo?id=${pathList[1]}`,
        },
      ]

      switch (pathList[2] ?? '/') {
        case '/': {
          useSlideshow = true
          const stats = document.querySelectorAll(
            '.clan_stats .column .content',
          )
          for (const stat of stats) {
            const text = `${stat.querySelector('h5')?.textContent}: ${stat.querySelector('.value')?.textContent}`
            const data: PresenceData = {
              ...presenceData,
              smallImageText: text,
            }
            slideshow.addSlide(text, data, MIN_SLIDE_TIME)
          }
          break
        }
      }
      break
    }
    case 'clans': {
      switch (pathList[1] ?? '/') {
        case '/': {
          break
        }
        case 'families': {
          break
        }
        case 'leaderboard': {
          break
        }
        case 'war': {
          break
        }
      }
      break
    }
    case 'content': {
      if (searchParams.get('id')) {
        // video
      }
      else {
        // browsing
      }
      break
    }
    case 'esports': {
      switch (pathList[1]) {
        case 'leagues': {
          break
        }
        case 'players': {
          break
        }
        case 'teams': {
          break
        }
        case 'schedule': {
          break
        }
      }
      break
    }
    case 'feature': {
      break
    }
    case 'game-mode': {
      break
    }
    case 'me': {
      presenceData.details = strings.viewAccount
      presenceData.state = document.querySelector('.menu .item.active')
      break
    }
    case 'player': {
      presenceData.details = strings.viewProfile
      presenceData.state = `${document.querySelector('h1')?.textContent} - ${document.querySelector('.menu[class*=player_profile] .item.active')?.textContent}`
      presenceData.buttons = [
        {
          label: strings.buttonViewProfile,
          url: href,
        },
        {
          label: strings.buttonViewPlayerGame,
          url: `clashroyale://playerInfo?id=${pathList[1]}`,
        },
      ]
      break
    }
    case 'players': {
      switch (pathList[1] ?? '/') {
        case '/': {
          break
        }
        case 'leaderboard': {
          if (pathList[2]) {
            if (pathList[2] === 'season') {
              // by season
            }
            else {
              // regional leaderboard
            }
          }
          else {
            // global leaderboard
          }
          break
        }
        case 'leaderboard_history': {
          if (pathList[3]) {
            // by year
          }
          else {
            // just by category
          }
          break
        }
        default: {
          // other stat sorting
        }
      }
      break
    }
    case 'pro': {
      // searching pros
      if (searchParams.get('q')) {
        //
      }
      else {
        //
      }
      break
    }
    case 'replay': {
      if (searchParams.get('overlay')) {
        // summary
      }
      else {
        // main view
      }
      break
    }
    case 'strategy': {
      break
    }
    case 'team': {
      // esports team
      break
    }
    case 'tournament': {
      break
    }
    case 'tournaments': {
      break
    }
    default: {
      break
    }
  }

  presence.setActivity(useSlideshow ? slideshow : presenceData)
})
