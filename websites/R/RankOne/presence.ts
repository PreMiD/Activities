const presence = new Presence({
  clientId: '1374768959899041924',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/dRN96t2.png',
}

async function getStrings() {
  return presence.getStrings({
    browsing: 'general.browsing',
    buttonViewGame: 'general.buttonViewGame',
    buttonViewProfile: 'general.buttonViewProfile',
    viewGame: 'general.viewGame',
    viewUser: 'general.viewProfile',
    viewList: 'general.viewList',
    viewNews: 'RankOne.viewNews',
    viewFAQ: 'RankOne.viewFAQ',
    discover: 'RankOne.discover',
    viewFeed: 'RankOne.viewFeed',
    viewFollowing: 'RankOne.viewFollowing',
    viewNot: 'RankOne.viewNot',
    terms: 'general.terms',
    about: 'RankOne.viewAbout',
    twitchExtension: 'RankOne.twitchExtension',
    viewPressKit: 'RankOne.viewPressKit',
    viewSuggestions: 'RankOne.viewSuggestions',
    viewCommunity: 'RankOne.viewCommunity',
    viewACommunity: 'RankOne.viewACommunity',
  })
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const strings = await getStrings()

  switch (pathname.split('/')[1]) {
    case 'discover':
      presenceData.details = strings.discover
      break
    case 'board':
      presenceData.details = strings.viewFeed
      break
    case 'following':
      presenceData.details = strings.viewFollowing
      break
    case 'terms-and-conditions':
      presenceData.details = strings.terms
      break
    case 'notifications':
      presenceData.details = strings.viewNot
      break
    case 'about-us':
      presenceData.details = strings.about
      break
    case 'twitch-extension':
      presenceData.details = strings.twitchExtension
      break
    case 'news':
      presenceData.details = strings.viewNews
      break
    case 'faq':
      presenceData.details = strings.viewFAQ
      break
    case 'press-kit':
      presenceData.details = strings.viewPressKit
      break
    case 'game':
      presenceData.details = strings.viewGame
      presenceData.state = document.querySelector('h1.mb-0')?.textContent
      presenceData.largeImageKey = document.querySelector<HTMLDivElement>('.game-art-container > div > div > div > div > div')?.style.backgroundImage.replace('url("', '').replace('")', '') ?? ActivityAssets.Logo
      presenceData.buttons = [
        {
          label: strings.buttonViewGame,
          url: href,
        },
      ]
      break
    case 'community':
      presenceData.details = strings.viewCommunity
      if (pathname.split('/')[2]) {
        presenceData.details = strings.viewACommunity
        presenceData.state = document.querySelector('h1')?.textContent
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('img.absolute')?.src ?? ActivityAssets.Logo
      }
      break
    default: {
      if (pathname.split('/')[1]) {
        presenceData.details = strings.viewUser
        if (pathname.split('/')[2] === 'lists')
          presenceData.details = strings.viewList
        if (pathname.split('/')[2] === 'suggestions')
          presenceData.details = strings.viewSuggestions
        presenceData.state = document.querySelector('h1')?.textContent
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('img.object-cover')?.src ?? ActivityAssets.Logo
        presenceData.buttons = [
          {
            label: strings.buttonViewProfile,
            url: href,
          },
        ]
        break
      }
      else {
        presenceData.details = strings.browsing
        break
      }
    }
  }

  presence.setActivity(presenceData)
})
