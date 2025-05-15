const presence = new Presence({
  clientId: '503557087041683458',
})
const slideshow = presence.createSlideshow()
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
    viewHome: 'general.viewHome',
    viewProfile: 'general.viewProfile',
    buttonViewProfile: 'general.buttonViewProfile',
    viewAccount: 'general.viewAccount',
    viewClan: 'royaleapi.viewClan',
    viewClanFamily: 'royaleapi.viewClanFamily',
    buttonViewClan: 'royaleapi.buttonViewClan',
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
          break
        }
        case 'search': {
          break
        }
        case 'tags': {
          if (pathList[2]) {
            // specific tag
          }
          else {
            // list
          }
          break
        }
        default: {
          // article
        }
      }
      break
    }
    case 'card': {
      switch (pathList[2] ?? '/') {
        case '/': {
          break
        }
        case 'matchup': {
          break
        }
        case 'season': {
          break
        }
      }
      break
    }
    case 'cards': {
      switch (pathList[1]) {
        case 'popular': {
          break
        }
        case 'viz': {
          break
        }
      }
      break
    }
    case 'clan': {
      if (pathList[1] === 'family') {
        presenceData.details = strings.viewClanFamily
        presenceData.state = document.querySelector('#page_content .header.item')
        break
      }

      presenceData.details = strings.viewClan
      presenceData.state = `${document.querySelector('h1')?.textContent} - ${document.querySelector('.clan__menu .item.active')}`
      presenceData.smallImageKey = document.querySelector<HTMLImageElement>('img.floated.right')
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
          const stats = document.querySelectorAll('.clan_stats .column .content')
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
