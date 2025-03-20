import { Assets } from 'premid'

const presence = new Presence({
  clientId: '714733112499896343',
})
// Const thing
const browsingTimestamp = Math.floor(Date.now() / 1000)
const path = document.location

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/Blockdit/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  // Presence
  if (path.hostname === 'blockdit.com' || path.hostname.includes('www.')) {
    // Home
    if (document.location.pathname === '/') {
      presenceData.details = 'Viewing home page'
    }
    else if (path.pathname.includes('/home')) {
      presenceData.details = 'Viewing home page'
    }
    else if (path.pathname.includes('articles')) {
      if (path.href.includes('bookmark')) {
        presenceData.details = 'Viewing on bookmark'
        presenceData.state = 'Favorite articles'
      }
      else if (path.href.includes('draft')) {
        presenceData.details = 'Viewing on page creator'
        presenceData.state = 'Draft: articles'
      }
      else if (path.href.includes('schedule')) {
        presenceData.details = 'Viewing on page creator'
        presenceData.state = 'Schedulet: articles'
      }
      else if (path.href.includes('popural')) {
        presenceData.details = 'Viewing on popular'
        presenceData.state = 'Trending articles'
      }
      else if (path.href.includes('pages')) {
        presenceData.details = 'Viewing on page'
        presenceData.state = `${
          document.querySelector('head > title')?.textContent ?? 'Unknow page'
        } | Articles`
      }
      else {
        presenceData.details = 'Reading on articles'
        presenceData.state = `${
          document.querySelector('head > title')?.textContent ?? 'Unknow page'
        } | Articles`
        presenceData.smallImageKey = Assets.Reading
      } // Videos
    }
    else if (path.pathname.includes('videos')) {
      if (path.href.includes('bookmark')) {
        presenceData.details = 'Viewing on bookmark'
        presenceData.state = 'Favorite videos'
      }
      else if (path.href.includes('draft')) {
        presenceData.details = 'Viewing on page creator'
        presenceData.state = 'Draft: videos'
      }
      else if (path.href.includes('schedule')) {
        presenceData.details = 'Viewing on page creator'
        presenceData.state = 'Schedulet: videos'
      }
      else if (path.href.includes('popular')) {
        presenceData.details = 'Viewing on popular'
        presenceData.state = 'Trending videos'
      }
      else if (path.href.includes('pages')) {
        presenceData.details = 'Viewing on page'
        presenceData.state = `${
          document.querySelector('head > title')?.textContent ?? 'Unknow page'
        } | Videos`
      }
      else {
        presenceData.details = 'Viewing on page'
        presenceData.state = `${
          document.querySelector('head > title')?.textContent ?? 'Unknow page'
        } | Videos`
        presenceData.smallImageKey = Assets.Play
      } // Podcast
    }
    else if (path.pathname.includes('podcasts')) {
      if (path.href.includes('bookmark')) {
        presenceData.details = 'Viewing on bookmark'
        presenceData.state = 'Favorite podcasts'
      }
      else if (path.href.includes('draft')) {
        presenceData.details = 'Viewing on page creator'
        presenceData.state = 'Draft: podcasts'
      }
      else if (path.href.includes('schedule')) {
        presenceData.details = 'Viewing on page creator'
        presenceData.state = 'Schedulet: podcast'
      }
      else if (path.href.includes('popular')) {
        presenceData.details = 'Viewing on popular'
        presenceData.state = 'Trending podcasts'
      }
      else if (path.href.includes('pages')) {
        presenceData.details = 'Viewing on page'
        presenceData.state = document.querySelector('head > title')?.textContent ?? 'Unknow page'
      }
      else {
        presenceData.details = 'Viewing on page'
        presenceData.state = document.querySelector('head > title')?.textContent ?? 'Unknow page'
        presenceData.smallImageKey = Assets.Play
      } // Series
    }
    else if (path.pathname.includes('series')) {
      if (path.href.includes('bookmark')) {
        presenceData.details = 'Viewing on bookmark'
        presenceData.state = 'Favorite series'
      }
      else if (path.href.includes('draft')) {
        presenceData.details = 'Viewing on page creator'
        presenceData.state = 'Draft: series'
      }
      else if (path.href.includes('schedule')) {
        presenceData.details = 'Viewing on page creator'
        presenceData.state = 'Schedulet: series'
      }
      else if (path.href.includes('popular')) {
        presenceData.details = 'Viewing on popular'
        presenceData.state = 'Trending series'
      }
      else {
        presenceData.details = 'Viewing on page'
        presenceData.state = `${
          document.querySelector('head > title')?.textContent ?? 'Unknow page'
        } | Series`
      } // Explore
    }
    else if (
      path.pathname.includes('explore')
      || path.pathname.includes('all')
    ) {
      presenceData.details = 'Viewing on exploring'
      presenceData.state = `About ${path.pathname.replace('/explore/', '| ')}`
      presenceData.smallImageKey = Assets.Search
    }
    else if (path.pathname.includes('notification')) {
      presenceData.details = 'Viewing on notification'
    }
    else if (path.pathname.includes('activity-log')) {
      presenceData.details = 'Viewing on activity log'
    }
    else if (path.pathname.includes('boost-manager')) {
      if (path.pathname.includes('boosts')) {
        presenceData.details = 'Viewing on boosts manage'
        presenceData.state = 'All boosts'
      }
      else if (path.pathname.includes('histories')) {
        presenceData.details = 'Viewing on boosts manage'
        presenceData.state = 'Boosts histories'
      }
      else {
        presenceData.details = 'Viewing on boosts manage'
        presenceData.state = 'Unknow boosts manage'
      } // settings
    }
    else if (path.pathname.includes('sttings')) {
      if (path.pathname.includes('pages')) {
        presenceData.details = 'Viewing on page creator'
        presenceData.state = 'Settings'
      }
      else if (path.pathname.includes('user-settings')) {
        presenceData.details = 'Viewing on user settings'
      }
      else {
        presenceData.details = 'Viewing on settings'
        presenceData.state = 'Unknow settings'
      }
    }
    else if (path.pathname.includes('draft')) {
      if (path.pathname.includes('pages')) {
        presenceData.details = 'Viewing on page creator'
        presenceData.state = 'All draft'
      }
      else {
        presenceData.details = 'Viewing on draft'
        presenceData.state = 'Draft: Post'
      }
    }
    else if (path.pathname.includes('schedule')) {
      if (path.pathname.includes('pages')) {
        presenceData.details = 'Viewing on page creator'
        presenceData.state = 'All schedule'
      }
      else {
        presenceData.details = 'Viewing on schedule'
        presenceData.state = 'Schedule: Post'
      }
    }
    else if (path.pathname.includes('monetize')) {
      if (path.pathname.includes('page')) {
        presenceData.details = 'Viewing on page creator'
        presenceData.state = 'Page monetize'
      }
      else {
        presenceData.details = 'Viewing on profile'
        presenceData.state = 'Start monetize'
      }
    }
    else if (path.pathname.includes('insights')) {
      if (path.pathname.includes('page')) {
        presenceData.details = 'Viewing on page creator'
        presenceData.state = 'Insights: all'
        if (path.pathname.includes('followers')) {
          presenceData.details = 'Viewing on page creator'
          presenceData.state = 'Insights: followers'
        }
        else if (path.pathname.includes('demographics')) {
          presenceData.details = 'Viewing on page creator'
          presenceData.state = 'Insights: demographics'
        }
      }
      else {
        presenceData.details = 'Viewing on Insights'
        presenceData.state = 'Insights: all'
        if (path.pathname.includes('followers')) {
          presenceData.details = 'Viewing on Insights'
          presenceData.state = 'Insights: followers'
        }
        else if (path.pathname.includes('demographics')) {
          presenceData.details = 'Viewing on Insights'
          presenceData.state = 'Insights: demographics'
        }
      }
    }
    else if (path.pathname.includes('user')) {
      presenceData.details = 'Viewing on profile'
      presenceData.state = document.querySelector('head > title')?.textContent ?? 'Unknow username'
    }
    else if (path.pathname.includes('terms')) {
      if (path.pathname.includes('ads')) {
        presenceData.details = 'Terms of ads and boosts'
        presenceData.smallImageKey = Assets.Reading
      }
      else {
        presenceData.details = 'Privacy Policy'
        presenceData.smallImageKey = Assets.Reading
      }
    }
    else if (path.pathname.includes('faqs')) {
      presenceData.details = 'FAQS'
      presenceData.smallImageKey = Assets.Reading
    }
    else if (path.pathname.includes('brand')) {
      presenceData.details = 'Guild to use brand'
      presenceData.smallImageKey = Assets.Reading
    }
    else if (path.pathname.includes('search')) {
      presenceData.details = 'Searching for:'
      presenceData.state = document
        .querySelector(
          '#__next > div > div.container.flex-grow-1.d-flex.flex-column > div > div.jsx-3959159148.col-12.col-md-8.col-lg-6.col-xl-5.px-0 > div > div:nth-child(2) > div > form > div.jsx-1849148460.d-flex.align-items-center > label > input',
        )
        ?.getAttribute('value') ?? 'Unknow search'
      presenceData.smallImageKey = Assets.Search
    }
    else if (path.pathname.includes('bookmark')) {
      presenceData.details = 'Viewing on bookmark'
    }
    else if (path.pathname.includes('popular')) {
      presenceData.details = 'Viewing on popular page'
      presenceData.state = 'Trending'
    }
    else {
      presenceData.details = 'Viewing on page'
      presenceData.state = document.querySelector('head > title')?.textContent ?? 'Unknow page'
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
  // console.log(presenceData);
})
