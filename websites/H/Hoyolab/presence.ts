const presence = new Presence({
  clientId: '836534947170353173',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings(
    {
      readingArticle: 'general.readingArticle',
      view: 'general.view',
      viewingList: 'general.viewList',
      viewingUser: 'general.viewUser',
      viewingHomepage: 'general.viewHome',
      searchingFor: 'general.searchFor',
      viewProfileButton: 'general.buttonViewProfile',
      readArticleButton: 'general.buttonReadArticle',
    },

  )
}

presence.on('UpdateData', async () => {
  const strings = await getStrings()
  const circleName: Record<number, string> = {
    1: 'Honkai Impact 3rd',
    2: 'Genshin Impact',
    4: 'Tears of Themis',
    5: 'HoYoLAB',
    6: 'Honkai: Star Rail',
    8: 'Zenless Zone Zero',
  }
  const circleTabName: Record<number, string> = {
    // Genshin Impact
    27: 'Official posts',
    28: 'Player guides',
    29: 'Fan arts',
    30: 'the Tavern',
    // Honkai Impact 3rd
    31: 'Official posts',
    32: 'Player guides',
    33: 'Fan arts',
    34: 'the Hyperion',
    // Tears of Themis
    35: 'Official posts',
    36: 'Player guides',
    37: 'Fan arts',
    38: 'the Law Firm',
    // Honkai: Star Rail
    39: 'Official posts',
    40: 'Player guides',
    41: 'Fan arts',
    42: 'the Astral Express',
    // Zenless Zone Zero
    46: 'the Coff Cafe',
    47: 'Official posts',
    48: 'Fan arts',

    // HoYoLAB
    43: 'Offical posts',
    44: 'the LAB',
  }
  const accountCenterState: Record<string, string> = {
    postList: 'Posts',
    replyList: 'Comments',
    favList: 'Favorites',
    topicList: 'Topics',
    followList: 'Following',
    fanList: 'Followers',
  }
  const homepageName: Record<string, string> = {
    timeline: 'Timeline',
    events: 'Events',
  }
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/Hoyolab/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { location } = document
  const pathList = location.pathname.split('/')

  pathList.shift()

  switch (pathList[0]) {
    case 'home': {
      if (!pathList[1]) {
        presenceData.details = `${strings.viewingHomepage}`
      }
      else {
        presenceData.details = `${strings.view} ${
          homepageName[pathList[1]]
        }`
      }
      break
    }
    case 'circles': {
      presenceData.details = `${circleName[Number.parseInt(pathList[1]!)]} Circle`
      presenceData.state = `Scrolling through ${
        circleTabName[Number.parseInt(pathList[2]!)]
      }`
      break
    }
    case 'accountCenter': {
      const username = document.querySelector(
        'body > div > div > div > div.root-page-container > div > div > div > div > div > div.account-center-user-wrap > div > div > span.user-basic-nickname',
      )?.textContent

      presenceData.details = `${strings.viewingUser} ${username}`
      presenceData.state = `${strings.viewingList} ${
        accountCenterState[pathList[1]!]
      }`
      presenceData.buttons = [
        {
          label: strings.viewProfileButton,
          url: location.search,
        },
      ]

      break
    }
    case 'setting': {
      presenceData.details = `${strings.view} Account settings`
      break
    }
    case 'search': {
      presenceData.details = `${strings.searchingFor} ${new URLSearchParams(
        location.search,
      ).get('keyword')}`
      break
    }
    case 'article': {
      presenceData.details = `${strings.readingArticle} ${
        document.querySelector(
          'body > div > div > div > div.root-page-container > div > div > div > div > div.mhy-article-page__body > div > div > h1',
        )?.textContent
      }`
      presenceData.buttons = [
        {
          label: strings.readArticleButton,
          url: `https://www.hoyolab.com/article/${pathList[1]}`,
        },
      ]
      break
    }
    case 'topicDetail': {
      const topicName = document
        .querySelector(
          'body > div > div > div > div.root-page-container > div > div > div > div > div > div > div.mhy-topic-basic > div > div.mhy-topic-basic-title > div',
        )
        ?.textContent
        ?.replaceAll('\n', '')
        .trimEnd()

      presenceData.details = `Viewing Topic: ${topicName}`

      break
    }
    case 'newArticle': {
      presenceData.details = 'Creating a new article'
      break
    }
  }

  presence.setActivity(presenceData)
})
