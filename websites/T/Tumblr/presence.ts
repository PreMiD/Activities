import { Assets } from 'premid'

const presence = new Presence({
  clientId: '640963335826833418',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Tumblr/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { hostname, href, pathname } = document.location
  const search = document.querySelector<HTMLInputElement>(
    '[type="search"],#search_actions_search',
  )

  switch (hostname) {
    case 'www.tumblr.com': {
      switch (true) {
        case !!search?.value: {
          presenceData.details = 'Searching for'
          presenceData.state = search.value
          presenceData.smallImageKey = Assets.Search
          break
        }
        case !!pathname.match(/\d{18}/g)?.[0]: {
          const author = document.querySelector<HTMLAnchorElement>('[rel="author"]')
          const video = document.querySelector<HTMLVideoElement>('video')

          if (video && !Number.isNaN(video.duration)) {
            delete presenceData.startTimestamp
            presenceData.smallImageKey = video.paused
              ? Assets.Pause
              : Assets.Play
            presenceData.smallImageText = video.paused ? 'Paused' : 'Playing'
            if (!video.paused) {
              [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
            }
            presenceData.buttons = author
              ? [
                  { label: 'Watch Video', url: href },
                  {
                    label: 'View Creator\'s Profile',
                    url: author.href,
                  },
                ]
              : [{ label: 'Watch Video', url: href }]
          }
          else {
            presenceData.buttons = author
              ? [
                  { label: 'View Post', url: href },
                  {
                    label: 'View Creator\'s Profile',
                    url: author.href,
                  },
                ]
              : [{ label: 'View Post', url: href }]
          }
          presenceData.details = document.querySelector('.k31gt')
          presenceData.state = author?.textContent

          break
        }
        case pathname === '/': {
          presenceData.details = 'Viewing the home page'
          break
        }
        case document.querySelector<HTMLMetaElement>('[property="og:type"]')
          ?.content === 'profile': {
          presenceData.details = `Viewing user: ${
            document.querySelector('header h1')?.textContent
          }`
          presenceData.state = [
            ...document.querySelectorAll('header + div a'),
          ].find(e => e.classList.length > 1)?.textContent
          presenceData.buttons = [{ label: 'View Profile', url: href }]
          break
        }
        case pathname.includes('/explore/answertime'): {
          presenceData.details = 'Exploring answer time content'
          break
        }
        case pathname.includes('/explore/staff-picks'): {
          presenceData.details = 'Exploring staff picks'
          break
        }
        case pathname.includes('/explore/trending'): {
          presenceData.details = 'Exploring trending content'
          break
        }
        case pathname.includes('/explore/today'): {
          presenceData.details = 'Exploring daily content'
          break
        }
        case pathname.includes('/dashboard'): {
          presenceData.details = 'Viewing their dashboard'
          break
        }
        case pathname.includes('/new'): {
          presenceData.details = 'Making a new post...'
          presenceData.smallImageKey = Assets.Writing
          break
        }
        case pathname.includes('/photos'): {
          presenceData.details = 'Viewing photos'
          break
        }
        case pathname.includes('/gif'): {
          presenceData.details = 'Viewing GIFs'
          break
        }
        case pathname.includes('/audio'): {
          presenceData.details = 'Viewing audio\'s'
          break
        }
        case pathname.includes('/video'): {
          presenceData.details = 'Viewing videos'
          break
        }
        case pathname.includes('/inbox'): {
          presenceData.details = 'Viewing their inbox'
          break
        }
        case pathname.includes('/chats'):
        case pathname.includes('/text'): {
          presenceData.details = 'Reading texts'
          presenceData.smallImageKey = Assets.Reading
          break
        }
        case pathname.includes('/recommended-for-you'): {
          presenceData.details = 'Viewing recommendations'
          break
        }
        case pathname.includes('/settings'): {
          presenceData.details = 'Viewing their settings'
          break
        }
        case pathname.includes('/asks'): {
          presenceData.details = 'Reading questions'
          presenceData.smallImageKey = Assets.Reading
          break
        }
        case pathname.includes('/quotes'): {
          presenceData.details = 'Reading quotes'
          presenceData.smallImageKey = Assets.Reading
          break
        }
      }
      break
    }
    case 'help.tumblr.com': {
      const article = document.querySelector('.article-title')
      if (search?.value) {
        presenceData.details = 'Searching the help center for'

        presenceData.state = search.value
        presenceData.smallImageKey = Assets.Search
      }
      else if (
        pathname.endsWith(
          `/${document
            .querySelector('html')
            ?.getAttribute('lang')
            ?.toLowerCase()}`,
        )
      ) {
        presenceData.details = 'Help center'
        presenceData.state = 'Viewing the homepage'
      }
      else if (article) {
        presenceData.details = 'Help center - reading an article'
        presenceData.state = article.textContent
        presenceData.smallImageKey = Assets.Reading
        presenceData.buttons = [{ label: 'Read Article', url: href }]
      }
      else {
        presenceData.details = 'Browsing through the help center'
      }

      break
    }
    default: {
      if (
        document.querySelector<HTMLMetaElement>('[property="og:type"]')
          ?.content !== 'profile'
      ) {
        return
      }
      const username = document.querySelector('header h1')?.textContent
      presenceData.details = `Viewing user${username ? `: ${username}` : ''}`
      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
