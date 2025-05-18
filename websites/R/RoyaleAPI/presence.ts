import type { FrameData } from './iframe.js'
import { ActivityType, Assets } from 'premid'
import {
  presence,
  registerSlideshowKey,
  renderMatchupIcon,
  slideshow,
} from './util.js'

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/R/RoyaleAPI/assets/logo.gif',
}

let currentData: FrameData | null = null
presence.on('iFrameData', (data: FrameData) => {
  currentData = data
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: 'RoyaleAPI',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const strings = await presence.getStrings({
    paused: 'general.paused',
    search: 'general.search',
    playing: 'general.playing',
    viewHome: 'general.viewHome',
    browsing: 'general.browsing',
    viewPage: 'general.viewPage',
    viewCard: 'royaleapi.viewCard',
    viewTeam: 'royaleapi.viewTeam',
    viewClan: 'royaleapi.viewClan',
    viewDeck: 'royaleapi.viewDeck',
    viewEvent: 'royaleapi.viewEvent',
    viewReplay: 'royaleapi.viewReplay',
    viewProfile: 'general.viewProfile',
    watchingVid: 'general.watchingVid',
    viewAccount: 'general.viewAccount',
    browseCards: 'royalapi.browseCards',
    browseDecks: 'royaleapi.browseDecks',
    browseClans: 'royaleapi.browseClans',
    viewPlaylist: 'general.viewPlaylist',
    browsingBlog: 'royaleapi.browsingBlog',
    buildingDeck: 'royaleapi.buildingDeck',
    browseBlogTag: 'royaleapi.browseBlogTag',
    browsePlayers: 'royaleapi.browsePlayers',
    buttonUseDeck: 'royaleapi.buttonUseDeck',
    browseESports: 'royaleapi.browseESports',
    browseStrategy: 'royaleapi.browseStrategy',
    buttonViewCard: 'royaleapi.buttonViewCard',
    buttonViewTeam: 'royaleapi.buttonViewTeam',
    viewClanFamily: 'royaleapi.viewClanFamily',
    buttonViewClan: 'royaleapi.buttonViewClan',
    buttonViewDeck: 'royaleapi.buttonViewDeck',
    buttonViewEvent: 'royaleapi.buttonViewEvent',
    buttonWatchVideo: 'general.buttonWatchVideo',
    readingAnArticle: 'general.readingAnArticle',
    buttonReadArticle: 'general.buttonReadArticle',
    buttonViewReplay: 'royaleapi.buttonViewReplay',
    buttonViewProfile: 'general.buttonViewProfile',
    browseTournaments: 'royaleapi.browseTournaments',
    buttonViewPlaylist: 'general.buttonViewPlaylist',
    buttonViewClanGame: 'royaleapi.buttonViewClanGame',
    buttonJoinTournament: 'royaleapi.buttonJoinTournament',
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
              const opposingName = match.querySelector<HTMLImageElement>(
                '.matchup_chart + .image img',
              )?.alt
              const competition = [
                ...match.querySelectorAll('.matchup_chart > .text_container > div'),
              ]
                .map(text => text.textContent)
                .join(' - ')
              const data: PresenceData = {
                ...presenceData,
                smallImageKey: await renderMatchupIcon(match!),
                smallImageText: `${cardName} / ${opposingName}: ${competition}`,
              }
              console.warn(data)
              slideshow.addSlide(opposingName ?? '', data, MIN_SLIDE_TIME)
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
      presenceData.state = `${document.querySelector('h1')?.textContent} - ${document.querySelector('.clan__menu .item.active')?.textContent}`
      presenceData.smallImageKey
        = document.querySelector<HTMLImageElement>('img.floated.right')
      presenceData.buttons = [
        {
          label: strings.buttonViewClan,
          url: href,
        },
        {
          label: strings.buttonViewClanGame,
          url: `https://link.clashroyale.com/?clanInfo?id=${pathList[1]}`,
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
      presenceData.details = strings.browseClans
      presenceData.state = document.querySelector('h1')
      break
    }
    case 'content': {
      const userLink
        = document.querySelector<HTMLAnchorElement>('.header.sub a')
      if (searchParams.get('id')) {
        presenceData.details = strings.watchingVid
        presenceData.state = `${document.querySelector('h3')?.firstChild?.textContent} - ${userLink?.textContent}`
        presenceData.buttons = [
          { label: strings.buttonViewPlaylist, url: userLink },
          {
            label: strings.buttonWatchVideo,
            url: `https://youtu.be/${searchParams.get('id')}`,
          },
        ]
        if (currentData) {
          presenceData.type = ActivityType.Watching
          presenceData.startTimestamp = currentData.startTimestamp
          presenceData.endTimestamp = currentData.endTimestamp
          presenceData.smallImageKey = currentData.paused
            ? Assets.Pause
            : Assets.Play
          presenceData.smallImageText = currentData.paused
            ? strings.paused
            : strings.playing
        }
      }
      else {
        presenceData.details = strings.viewPlaylist
        presenceData.state = userLink
        presenceData.buttons = [
          { label: strings.buttonViewPlaylist, url: userLink },
        ]
      }
      break
    }
    case 'decks': {
      switch (pathList[1]) {
        case 'winner': {
          presenceData.details = strings.browseDecks
          presenceData.state = document.querySelector('#page_content .decks__winners_challenge_type_menu .header')
          break
        }
        case 'stats': {
          if (pathList[2]) {
            presenceData.details = strings.viewDeck
            presenceData.state = document.querySelector('h1')
            presenceData.buttons = [{
              label: strings.buttonViewDeck,
              url: href,
            }, {
              label: strings.buttonUseDeck,
              url: document.querySelector<HTMLAnchorElement>('.button_menu a:nth-child(2)'),
            }]
          }
          else {
            presenceData.details = strings.buildingDeck
          }
          break
        }
        default: {
          presenceData.details = strings.browseDecks
          presenceData.state = document.querySelector('h1, .menu .item.active')
        }
      }
      break
    }
    case 'esports': {
      presenceData.details = strings.browseESports
      presenceData.state = document.querySelector('.menu .active')
      switch (pathList[1]) {
        case 'teams': {
          useSlideshow = true
          const search
            = document.querySelector<HTMLInputElement>('#tablesearch')
          if (registerSlideshowKey(search?.value ?? '')) {
            const teams = document.querySelectorAll('table tr')
            for (const team of teams) {
              const teamName = team.querySelector('a')
              const data: PresenceData = {
                ...presenceData,
                smallImageKey: team.querySelector('img'),
                smallImageText: teamName,
                buttons: [{ label: strings.buttonViewTeam, url: teamName }],
              }
              slideshow.addSlide(
                teamName?.textContent ?? '',
                data,
                MIN_SLIDE_TIME,
              )
            }
          }
          break
        }
      }
      break
    }
    case 'events': {
      presenceData.details = strings.viewEvent
      presenceData.state = document.querySelector(
        '#page_content div.header.item',
      )
      presenceData.buttons = [{ label: strings.buttonViewEvent, url: href }]
      break
    }
    case 'game-mode': {
      presenceData.details = strings.browseCards
      presenceData.state = document.querySelector('h1')
      break
    }
    case 'me': {
      presenceData.details = strings.viewAccount
      presenceData.state = document.querySelector('.menu .item.active')
      break
    }
    case 'player': {
      const name = document.querySelector('h1')?.textContent?.trim()
      const tab = document
        .querySelector('.menu[class*=player_profile] .item.active')
        ?.textContent
        ?.trim()
      presenceData.details = strings.viewProfile
      presenceData.state = `${name} - ${tab || 'Home'}`
      presenceData.buttons = [
        {
          label: strings.buttonViewProfile,
          url: href,
        },
        {
          label: strings.buttonViewPlayerGame,
          url: `https://link.clashroyale.com?playerInfo?id=${pathList[1]}`,
        },
      ]
      break
    }
    case 'players': {
      presenceData.details = strings.browsePlayers
      if (pathList[1] === 'leaderboard_history') {
        const title = document.querySelector('h1')?.textContent
        const group = document.querySelector(
          '.player_leaderboard_history__menu .item.active',
        )?.textContent
        let state = `${title} - ${group}`
        if (pathList[3]) {
          state += ` - ${document.querySelector('.player_leaderboard_history__year_menu .item.active')?.textContent}`
        }
        presenceData.state = state
      }
      else {
        presenceData.state = document.querySelector('h1')
      }
      break
    }
    case 'replay': {
      presenceData.details = strings.viewReplay
      presenceData.buttons = [{ label: strings.buttonViewReplay, url: href }]
      const [playerA, playerB] = document.querySelectorAll(
        searchParams.get('overlay') ? '.player_name' : '.stats h5',
      )
      presenceData.state = `${playerA?.textContent} / ${playerB?.textContent}`
      if (searchParams.get('overlay')) {
        presenceData.smallImageKey = Assets.Question
        presenceData.smallImageText = [...document.querySelectorAll('.score')]
          .map(score => score.textContent)
          .join(' - ')
      }
      break
    }
    case 'strategy': {
      presenceData.details = strings.browseStrategy
      break
    }
    case 'team': {
      presenceData.details = strings.viewTeam
      presenceData.state = document.querySelector('h1')
      presenceData.smallImageKey = document.querySelector<HTMLImageElement>(
        '#page_content > .segment .floated.right.image',
      )
      presenceData.buttons = [{ label: strings.viewTeam, url: href }]
      break
    }
    case 'tournament': {
      presenceData.details = strings.viewEvent
      presenceData.state = document.querySelector('h1')
      presenceData.buttons = [
        { label: strings.buttonViewEvent, url: href },
        {
          label: strings.buttonJoinTournament,
          url: `https://link.clashroyale.com?joinTournament?id=${pathList[1]}`,
        },
      ]
      break
    }
    case 'tournaments': {
      presenceData.details = strings.browseTournaments
      break
    }
    default: {
      presenceData.details = strings.browsing
      break
    }
  }

  presence.setActivity(useSlideshow ? slideshow : presenceData)
})
