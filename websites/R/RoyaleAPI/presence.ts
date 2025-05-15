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
    viewClan: 'royaleapi.viewClan',
    viewClanFamily: 'royaleapi.viewClanFamily',
    buttonViewClan: 'royaleapi.buttonViewClan',
    buttonViewClanGame: 'royaleapi.buttonViewClanGame',
    buttonViewPlayerGame: 'royaleapi.buttonViewPlayerGame',
  })
  const { pathname, href } = document.location
  const pathList = pathname.split('/').filter(Boolean)
  let useSlideshow = false

  switch (pathList[0] ?? '/') {
    case '/': {
      presenceData.details = strings.viewHome
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
  }

  presence.setActivity(useSlideshow ? slideshow : presenceData)
})
