import { Assets } from 'premid'

const presence = new Presence({
  clientId: '823408394098311178',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Key = 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/0.png',
  Slide = 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/1.png',
  Catch = 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/2.png',
  Taiko = 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/3.png',
  Ring = 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/4.png',
  Pad = 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/5.png',
  User = 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/6.png',
  Skin = 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/7.png',
  Talk = 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/8.png',
  Gameplay = 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/9.png',
  Home = 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/10.png',
  Leaderboard = 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/11.png',
  Song = 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/12.png',
  Charting = 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/13.png',
  Inventory = 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/14.png',
  Resource = 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/15.png',
  Feedback = 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/16.png',
  Notification = 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/17.png',
  Wiki = 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/18.png',
  Store = 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/19.png',
  Discuss = 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/20.png',
  Malody = 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/21.png',
  Jail = 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/22.png',
  Livem = 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/23.png',
}

presence.on('UpdateData', async () => {
  const privacy = await presence.getSetting<boolean>('privacy')
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/Mugzone/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  if (privacy) {
    presenceData.details = 'Browsing Malody Website'
  }
  else if (document.location.pathname === '/') {
    presenceData.details = 'Malody Main Page'
  }
  else if (document.location.pathname === '/index') {
    presenceData.smallImageKey = ActivityAssets.Home
    presenceData.details = 'Viewing Home Page'
  }
  else if (document.location.pathname.endsWith('/chart')) {
    presenceData.smallImageKey = ActivityAssets.Store
    presenceData.details = 'Browsing Chart Store'
  }
  else if (document.location.pathname.startsWith('/page/all/player')) {
    presenceData.smallImageKey = ActivityAssets.Leaderboard
    presenceData.details = 'Viewing Leaderboard'
    if (document.location.href.endsWith('?from=0&mode=0')) {
      presenceData.smallImageKey = ActivityAssets.Key
      presenceData.smallImageText = 'KeyMode'
      presenceData.state = 'Key Mode'
    }
    else if (document.location.href.endsWith('?from=0&mode=3')) {
      presenceData.smallImageKey = ActivityAssets.Catch
      presenceData.smallImageText = 'CatchMode'
      presenceData.state = 'Catch Mode'
    }
    else if (document.location.href.endsWith('?from=0&mode=4')) {
      presenceData.smallImageKey = ActivityAssets.Pad
      presenceData.smallImageText = 'PadMode'
      presenceData.state = 'Pad mode'
    }
    else if (document.location.href.endsWith('?from=0&mode=5')) {
      presenceData.smallImageKey = ActivityAssets.Taiko
      presenceData.smallImageText = 'TaikoMode'
      presenceData.state = 'Taiko Mode'
    }
    else if (document.location.href.endsWith('?from=0&mode=6')) {
      presenceData.smallImageKey = ActivityAssets.Ring
      presenceData.smallImageText = 'RingMode'
      presenceData.state = 'Ring Mode'
    }
    else if (document.location.href.endsWith('?from=0&mode=7')) {
      presenceData.smallImageKey = ActivityAssets.Slide
      presenceData.smallImageText = 'SlideMode'
      presenceData.state = 'Slide Mode'
    }
    else if (document.location.pathname.endsWith('/player')) {
      presenceData.smallImageKey = ActivityAssets.Key
      presenceData.smallImageText = 'KeyMode'
      presenceData.state = 'Key Mode'
    }
  }
  else if (document.location.href.includes('/song')) {
    presenceData.smallImageKey = ActivityAssets.Song
    presenceData.details = 'Viewing a song'
    presenceData.state = document.querySelector(
      '#content > div.song_title.g_rblock > div.right > h2.textfix.title',
    )?.textContent
    presenceData.buttons = [
      {
        label: 'View Song',
        url: document.URL,
      },
    ]
  }
  else if (document.location.href.includes('/chart')) {
    presenceData.smallImageKey = ActivityAssets.Song
    presenceData.details = document.querySelector(
      '#content > div.song_title.g_rblock > div.right > h2.textfix.title',
    )?.textContent
    presenceData.state = document.querySelector(
      '#content > div.song_title.g_rblock > div.right > h2.mode > span:nth-child(2)',
    )?.textContent
    presenceData.buttons = [
      {
        label: 'View Chart',
        url: document.URL,
      },
    ]
  }
  else if (document.location.pathname.startsWith('/store')) {
    if (document.location.pathname.endsWith('/skin')) {
      presenceData.smallImageKey = ActivityAssets.Skin
      presenceData.details = 'Browsing Skin Store'
    }
    else if (document.location.pathname.includes('/skin/detail')) {
      presenceData.smallImageKey = ActivityAssets.Skin
      presenceData.details = 'Viewing a skin:'
      presenceData.state = document.querySelector(
        '#content > div.song_title.g_rblock > div.right > h2.textfix.title',
      )?.textContent
      presenceData.buttons = [
        {
          label: 'View Skin',
          url: document.URL,
        },
      ]
    }
    else if (document.location.pathname.endsWith('/all')) {
      presenceData.smallImageKey = ActivityAssets.Store
      presenceData.details = 'Browsing Item Store'
    }
    else if (document.location.pathname.endsWith('/my')) {
      presenceData.smallImageKey = ActivityAssets.Inventory
      presenceData.details = 'Viewing Inventory'
    }
  }
  else if (document.location.pathname.startsWith('/talk')) {
    if (document.location.pathname.includes('/topic')) {
      presenceData.smallImageKey = ActivityAssets.Talk
      presenceData.details = `Viewing topic: ${
        document.querySelector('#chead > div > a')?.textContent
      }`
      presenceData.state = document.querySelector(
        '#g_talk > div.g_talk_title > p > span',
      )?.textContent
    }
    else if (document.location.pathname.includes('/user')) {
      if (document.location.pathname.endsWith('/user')) {
        presenceData.smallImageKey = ActivityAssets.Talk
        presenceData.details = 'Checking Inbox'
      }
      else if (document.location.pathname.endsWith('/notify')) {
        presenceData.smallImageKey = ActivityAssets.Notification
        presenceData.details = 'Viewing Notification'
      }
    }
    else if (document.location.pathname.includes('/group')) {
      presenceData.details = 'Viewing Discussion Page'
      if (document.location.href.endsWith('/1')) {
        presenceData.smallImageKey = ActivityAssets.Gameplay
        presenceData.state = 'Gameplay Disscussion'
      }
      else if (document.location.href.endsWith('/2')) {
        presenceData.smallImageKey = ActivityAssets.Charting
        presenceData.state = 'Chart Discussion'
      }
      else if (document.location.href.endsWith('/3')) {
        presenceData.smallImageKey = ActivityAssets.Resource
        presenceData.state = 'Skin & Resource'
      }
      else if (document.location.href.endsWith('/4')) {
        presenceData.smallImageKey = ActivityAssets.Feedback
        presenceData.state = 'Feedback'
      }
    }
  }
  else if (document.location.pathname.startsWith('/accounts')) {
    if (document.location.pathname.includes('/login')) {
      presenceData.details = 'Logging in'
    }
    else if (document.location.pathname.endsWith('/accounts/limit')) {
      presenceData.smallImageKey = ActivityAssets.Jail
      presenceData.details = 'Visiting the Jail'
      presenceData.state = 'What Is This Place Anyway?'
      presenceData.buttons = [
        {
          label: `Go with ${
            document.querySelector('#header > div > a:nth-child(4) > b')
              ?.textContent
          }`,
          url: document.URL,
        },
      ]
    }
    else if (document.location.pathname.includes('/user')) {
      if (
        document.querySelector(
          '#content > div.user_head.g_rblock > div.right > p.name > span',
        )?.textContent
        === document.querySelector('#header > div > a:nth-child(4) > b')?.textContent
      ) {
        const top = Math.min(
          +document
            .querySelector(
              '#content > div.body > div.panel > div.rank.g_rblock > div:nth-child(1) > div > p.rank',
            )!
            .textContent!
            .replace('#', ''),
          +document
            .querySelector(
              '#content > div.body > div.panel > div.rank.g_rblock > div:nth-child(2) > div > p.rank',
            )!
            .textContent!
            .replace('#', ''),
          +document
            .querySelector(
              '#content > div.body > div.panel > div.rank.g_rblock > div:nth-child(3) > div > p.rank',
            )!
            .textContent!
            .replace('#', ''),
          +document
            .querySelector(
              '#content > div.body > div.panel > div.rank.g_rblock > div:nth-child(4) > div > p.rank',
            )!
            .textContent!
            .replace('#', ''),
          +document
            .querySelector(
              '#content > div.body > div.panel > div.rank.g_rblock > div:nth-child(5) > div > p.rank',
            )!
            .textContent!
            .replace('#', ''),
          +document
            .querySelector(
              '#content > div.body > div.panel > div.rank.g_rblock > div:nth-child(6) > div > p.rank',
            )!
            .textContent!
            .replace('#', ''),
        )
        presenceData.details = `User: ${
          document.querySelector(
            '#content > div.user_head.g_rblock > div.right > p.name > span',
          )?.textContent
        }`
        presenceData.state = `Best Rank: ${top}`
        presenceData.smallImageKey = ActivityAssets.User
        presenceData.buttons = [
          {
            label: 'Visit My Profile!',
            url: document.URL,
          },
        ]
      }
      else {
        presenceData.details = 'Viewing User: '
        presenceData.state = document.querySelector(
          '#content > div.user_head.g_rblock > div.right > p.name > span',
        )?.textContent
        presenceData.smallImageKey = ActivityAssets.User
      }
    }
    else if (document.location.pathname.endsWith('/friend')) {
      presenceData.smallImageKey = ActivityAssets.User
      presenceData.details = 'Viewing Friends List'
    }
    else if (document.location.pathname.includes('/config/profile')) {
      presenceData.smallImageKey = Assets.Writing
      presenceData.details = 'Editing Profile'
    }
  }
  else if (document.location.pathname.includes('/page/userpage/edit/')) {
    presenceData.smallImageKey = Assets.Writing
    presenceData.details = `${
      document.querySelector('#content > div.g_title')?.textContent
    }profile`
  }
  else if (document.location.pathname.includes('/page/search')) {
    presenceData.smallImageKey = Assets.Search
    presenceData.details = document.querySelector(
      '#content > div.g_title',
    )?.textContent
  }
  else if (document.location.pathname.includes('/page/all')) {
    presenceData.smallImageKey = Assets.Viewing
    presenceData.details = 'Viewing All Pages'
  }
  else if (document.location.pathname.includes('/page/latest')) {
    presenceData.smallImageKey = Assets.Viewing
    presenceData.details = 'Viewing Recent Changes'
    presenceData.state = 'Pages'
  }
  else if (document.location.pathname.includes('/page/create')) {
    presenceData.smallImageKey = Assets.Writing
    presenceData.details = 'Creating a New Page'
  }
  else if (document.location.href.includes('/page/create?type=6')) {
    presenceData.smallImageKey = Assets.Writing
    presenceData.details = 'Creating a Template'
  }
  else if (document.location.pathname.startsWith('/wiki')) {
    presenceData.smallImageKey = ActivityAssets.Wiki
    presenceData.details = 'Viewing Wiki'
    presenceData.state = document.querySelector(
      '#content > div.wiki_title.g_rblock > div.title',
    )?.textContent
  }
  presence.setActivity(presenceData)
})
