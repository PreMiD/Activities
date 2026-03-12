import { Assets } from 'premid'

const presence = new Presence({
  clientId: '970743721404530798',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Forums512 = 'https://cdn.rcd.gg/PreMiD/websites/S/Sonic%20Retro/assets/0.png',
  Home512 = 'https://cdn.rcd.gg/PreMiD/websites/S/Sonic%20Retro/assets/1.png',
  Info512 = 'https://cdn.rcd.gg/PreMiD/websites/S/Sonic%20Retro/assets/2.png',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/Sonic%20Retro/assets/3.png',
  Forums = 'https://cdn.rcd.gg/PreMiD/websites/S/Sonic%20Retro/assets/4.png',
  Category = 'https://cdn.rcd.gg/PreMiD/websites/S/Sonic%20Retro/assets/5.png',
  Home = 'https://cdn.rcd.gg/PreMiD/websites/S/Sonic%20Retro/assets/6.png',
  Info = 'https://cdn.rcd.gg/PreMiD/websites/S/Sonic%20Retro/assets/7.png',
  Logo1024 = 'https://cdn.rcd.gg/PreMiD/websites/S/Sonic%20Retro/assets/8.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    startTimestamp: browsingTimestamp,
  }
  const { pathname, search, hostname, href } = window.location
  switch (hostname) {
    case 'sonicretro.org': {
      presenceData.smallImageKey = ActivityAssets.Home512
      if (search) {
        presenceData.largeImageKey = Assets.Search
        if (!new URLSearchParams(search).get('s')) {
          presenceData.details = 'Searching for something...'
        }
        else {
          presenceData.details = `Searching for "${
            document.querySelector('#main > div.archive-box > h1')?.textContent
          }"`
        }
      }
      else if (
        !search
        && (pathname === '/' || pathname === '/#' || pathname.includes('/page/'))
      ) {
        presenceData.largeImageKey = ActivityAssets.Home
        presenceData.details = 'Zooming through the main page'
      }
      else if (pathname.includes('/category/')) {
        presenceData.largeImageKey = Assets.Search
        presenceData.details = `Looking through ${
          document.querySelector('#main > div.archive-box > h1')?.textContent
        }`
      }
      else if (
        /https:\/\/sonicretro.org\/\d{4}\/\d{2}\/(?:\d{2})*\//.test(pathname)
      ) {
        presenceData.largeImageKey = Assets.Search
        presenceData.details = `Looking for posts from ${
          document.title.split('-')[0]
        }`
      }
      else if (
        /https:\/\/sonicretro.org\/\d+(?:\/\d+)+\/+[\w\-]*\//.test(
          href,
        )
      ) {
        presenceData.largeImageKey = Assets.Reading
        presenceData.details = 'Reading an article'
        presenceData.state = document.title.split(' - Sonic Retro')[0]
        presenceData.buttons = [
          {
            label: 'Read Article',
            url: href,
          },
        ]
      }
      else {
        presenceData.largeImageKey = ActivityAssets.Logo1024
        presenceData.details = 'Viewing an unsupported page'
      }
      break
    }
    case 'info.sonicretro.org': {
      // a full on wiki or index for the site
      const unsupported = [
        'Cite This Page - Sonic Retro',
        'Compare pages - Sonic Retro',
        'Export pages - Sonic Retro',
        'What links here - Sonic Retro',
        'Create account - Sonic Retro',
        'Log in - Sonic Retro',
        'Reset password - Sonic Retro',
        'Login required - Sonic Retro',
        'Preferences - Sonic Retro',
        'Watchlist - Sonic Retro',
        'Reset tokens - Sonic Retro',
        'Blocked users - Sonic Retro',
        'File list - Sonic Retro',
      ]
      presenceData.smallImageKey = ActivityAssets.Info512
      if (
        pathname === '/'
        || pathname.includes('/Main_Page')
        || (pathname.includes('/index.php') && !search)
      ) {
        presenceData.largeImageKey = ActivityAssets.Info
        presenceData.details = 'Zooming through the main page'
      }
      else if (pathname.includes('Special:')) {
        if (unsupported.includes(document.title)) {
          presenceData.largeImageKey = ActivityAssets.Logo1024
          presenceData.details = 'Viewing an unsupported page'
        }
        else if (pathname.includes('/Special:SpecialPages')) {
          presenceData.largeImageKey = Assets.Search
          presenceData.details = 'Browsing special pages'
        }
        else if (pathname.includes('/Special:Search')) {
          presenceData.largeImageKey = Assets.Search
          presenceData.details = 'Searching for something...'
        }
        else {
          presenceData.largeImageKey = ActivityAssets.Category
          presenceData.details = 'Browsing a special page:'
          presenceData.state = document.title.split(' - Sonic Retro')[0]
          presenceData.buttons = [
            {
              label: 'View Special Page',
              url: href,
            },
          ]
        }
      }
      else if (document.title.startsWith('Category:')) {
        presenceData.largeImageKey = Assets.Reading
        presenceData.details = 'Reading an article:'
        presenceData.state = document.title
          .split('Category:')[1]
          ?.split(' - Sonic Retro')[0]
        presenceData.buttons = [
          {
            label: 'View Article',
            url: href,
          },
        ]
      }
      else if (document.title.startsWith('Talk:')) {
        presenceData.largeImageKey = Assets.Reading
        presenceData.details = 'Browsing a talk page:'
        presenceData.state = document.title
          .split('Talk:')[1]
          ?.split(' - Sonic Retro')[0]
      }
      else if (document.title.startsWith('Sonic Retro:')) {
        presenceData.largeImageKey = Assets.Reading
        presenceData.details = 'Reading an article:'
        presenceData.state = document.title
          .split('Sonic Retro:')[1]
          ?.split(' - Sonic Retro')[0]
        presenceData.buttons = [
          {
            label: 'View Article',
            url: href,
          },
        ]
      }
      else if (document.title.startsWith('User:')) {
        presenceData.largeImageKey = Assets.Reading
        presenceData.details = 'Viewing a user\'s page:'
        presenceData.state = `@${
          document.title.split('User:')[1]?.split(' - Sonic Retro')[0]
        }`
        presenceData.buttons = [
          {
            label: 'View User',
            url: href,
          },
        ]
      }
      else if (
        pathname.includes('/File:')
        || pathname.includes('/Sonic_Retro:General_disclaimer')
      ) {
        presenceData.largeImageKey = ActivityAssets.Logo1024
        presenceData.details = 'Viewing an unsupported page'
      }
      else if (pathname === '/index.php' && search.includes('search=')) {
        presenceData.largeImageKey = Assets.Search
        if (document.title.startsWith('Search -')) {
          presenceData.details = 'Searching for something...'
        }
        else {
          presenceData.details = `Searching for ${
            document.title
              .split('Search results for ')[1]
              ?.split(' - Sonic Retro')[0]
          }`
        }
      }
      else if (
        pathname === '/index.php'
        || pathname.startsWith('User_talk:')
      ) {
        presenceData.largeImageKey = ActivityAssets.Logo1024
        presenceData.details = 'Viewing an unsupported page'
      }
      else {
        presenceData.largeImageKey = Assets.Reading
        presenceData.details = 'Reading an article:'
        presenceData.state = document.title.split(' - Sonic Retro')[0]
        presenceData.buttons = [
          {
            label: 'Read Article',
            url: href,
          },
        ]
      }
      break
    }
    case 'forums.sonicretro.org': {
      presenceData.smallImageKey = ActivityAssets.Forums512
      if (search) {
        const forumTitle = document.title.split(
          ' | Sonic and Sega Retro Forums',
        )[0]
        presenceData.largeImageKey = Assets.Search
        if (search.includes('?watched/forums')) {
          presenceData.details = 'Browsing watched forums'
        }
        else if (search.startsWith('?watched/threads')) {
          presenceData.details = 'Browsing watched threads'
        }
        else if (search.startsWith('?find-new/') && search.includes('/posts')) {
          presenceData.details = 'Browsing new posts'
        }
        else if (
          search.startsWith('?find-new/')
          && search.includes('/profile-posts')
        ) {
          presenceData.details = 'Browsing new profile posts'
        }
        else if (search.startsWith('?forums/')) {
          presenceData.details = 'Browsing a forum:'
          presenceData.state = forumTitle
          presenceData.buttons = [
            {
              label: 'View Forum',
              url: href,
            },
          ]
        }
        else if (search.startsWith('?threads/')) {
          presenceData.largeImageKey = Assets.Reading
          presenceData.details = 'Reading a thread:'
          presenceData.state = forumTitle
          presenceData.buttons = [
            {
              label: 'Read Thread',
              url: href,
            },
          ]
        }
        else if (search.startsWith('?members/')) {
          if (document.title.startsWith('Notable Members')) {
            presenceData.largeImageKey = Assets.Search
            presenceData.details = 'Browsing notable members'
          }
          else {
            presenceData.largeImageKey = Assets.Reading
            presenceData.details = 'Viewing a member\'s page'
            presenceData.state = `@${forumTitle}`
            presenceData.buttons = [
              {
                label: 'View Member',
                url: href,
              },
            ]
          }
        }
        else if (search.startsWith('?search/')) {
          presenceData.largeImageKey = Assets.Search
          if (
            document.title.startsWith('Error')
            || document.title.startsWith('Search')
          ) {
            presenceData.details = 'Searching for something...'
          }
          else {
            presenceData.details = `Searching for ${
              document.title
                .split('Search Results for Query: ')[1]
                ?.split(' | Sonic and Sega Retro Forums')[0]
            }`
          }
        }
        else if (
          /\?conversations\/|\?account\/|\?help\/|\?forums\/-\/index.rss/.test(
            search,
          )
        ) {
          presenceData.largeImageKey = ActivityAssets.Logo1024
          presenceData.details = 'Viewing an unsupported page'
        }
      }
      else if (pathname === '/index.php' && !search) {
        presenceData.largeImageKey = ActivityAssets.Forums
        presenceData.details = 'Zooming through the main page'
      }
      else {
        presenceData.largeImageKey = ActivityAssets.Logo1024
        presenceData.details = 'Viewing an unsupported page'
      }
      break
    }
    default: {
      presenceData.smallImageKey = Assets.Question
      presenceData.smallImageText = 'Unknown Page'
      presenceData.largeImageKey = ActivityAssets.Logo1024
      presenceData.details = 'Viewing an unsupported page'
    }
  }
  presence.setActivity(presenceData)
})
