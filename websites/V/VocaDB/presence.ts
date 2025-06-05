import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1349694202942066742',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
let media = {
  duration: 0,
  currentTime: 0,
  paused: true,
}
let PlayQueueStore: any
const soundcloud = {
  duration: 0,
  currentTime: 0,
}

window.addEventListener(
  'message',
  (event) => {
    if (event.origin === 'https://w.soundcloud.com'
    ) {
      const data = JSON.parse(event.data)
      if (data.method === 'playProgress') {
        soundcloud.currentTime = (Math.ceil(data.value.currentPosition / 1000))
      }
      if (data.method === 'getDuration') {
        soundcloud.duration = (Math.floor(data.value / 1000))
      }
    }
  },
  false,
)

setInterval(() => {
  PlayQueueStore = JSON.parse(localStorage.getItem('PlayQueueStore') || '{}')
}, 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/V/VocaDB/assets/logo.png',
}

presence.on(
  'iFrameData',
  (data: { duration: number, currentTime: number, paused: boolean }) => {
    media = data
  },
)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, hostname } = document.location
  const pathArr = pathname.split('/')
  if (hostname === 'vocadb.net') {
    if (media.paused || !media || !document.querySelector('iframe')) {
      const pageTitle = document.querySelector('.page-title')?.firstChild
      const activeTab = document.querySelector('.ui-tabs-active')?.textContent?.replace(/ \(\d+\)$/g, '') || document.querySelector('.nav li.active')?.textContent
      const busy = document.querySelector('.nprogress-busy')
      switch (pathArr[1]) {
        case '':{
          presenceData.details = 'Viewing the homepage'
          break
        }
        case 'S':{
          if (!pageTitle || busy)
            return
          presenceData.details = 'Viewing a song'
          presenceData.state = pageTitle
          presenceData.largeImageText = activeTab
          presenceData.buttons = [
            {
              label: 'View Page',
              url: href,
            },
          ]
          break
        }
        case 'Ar':{
          if (!pageTitle || busy)
            return
          presenceData.details = 'Viewing an artist'
          presenceData.state = pageTitle
          presenceData.largeImageText = activeTab
          presenceData.buttons = [
            {
              label: 'View Page',
              url: href,
            },
          ]
          break
        }
        case 'Al':{
          if (!pageTitle || busy)
            return
          presenceData.details = 'Viewing an album'
          presenceData.state = pageTitle
          presenceData.largeImageText = activeTab
          presenceData.buttons = [
            {
              label: 'View Page',
              url: href,
            },
          ]
          break
        }
        case 'E':{
          if (!pageTitle || busy)
            return
          presenceData.details = 'Viewing an event'
          presenceData.state = pageTitle
          presenceData.largeImageText = activeTab
          presenceData.buttons = [
            {
              label: 'View Page',
              url: href,
            },
          ]
          break
        }
        case 'T':{
          if (!pageTitle || busy)
            return
          presenceData.details = 'Viewing a tag'
          presenceData.state = pageTitle
          presenceData.largeImageText = activeTab
          presenceData.buttons = [
            {
              label: 'View Page',
              url: href,
            },
          ]
          break
        }
        case 'L':{
          if (!pageTitle || busy)
            return
          presenceData.details = 'Viewing a list'
          presenceData.state = pageTitle
          presenceData.buttons = [
            {
              label: 'View Page',
              url: href,
            },
          ]
          break
        }
        case 'Profile':{
          if (!pageTitle || busy)
            return
          presenceData.details = 'Viewing a profile'
          presenceData.state = pageTitle
          presenceData.largeImageText = activeTab
          presenceData.buttons = [
            {
              label: 'View Page',
              url: href,
            },
          ]
          break
        }
        case 'Event':{
          if (!activeTab || busy)
            return
          presenceData.details = 'Browsing events'
          presenceData.state = activeTab
          break
        }
        case 'SongList':{
          presenceData.details = 'Browsing song lists'
          presenceData.state = activeTab
          break
        }
        case 'stats':{
          if (!document.querySelector('select') || busy)
            return
          presenceData.details = 'Viewing statistics'
          presenceData.state = document.querySelector('select')?.selectedOptions?.[0]
          if (document.querySelectorAll('select')[1])
            presenceData.largeImageText = document.querySelectorAll('select')[1]?.selectedOptions?.[0]
          break
        }
        case 'Tag':{
          presenceData.details = 'Browsing tags'
          break
        }
        case 'ActivityEntry':{
          if (!pageTitle || busy)
            return
          presenceData.details = 'Viewing recent activity'
          presenceData.state = activeTab
          break
        }
        case 'Comment':{
          presenceData.details = 'Viewing recent comments'
          break
        }
        case 'User':{
          switch (pathArr[2]) {
            case 'MySettings':{
              presenceData.details = 'Viewing settings'
              break
            }
            case 'Messages':{
              presenceData.details = 'Viewing messages'
              break
            }
            default:{
              presenceData.details = 'Browsing users'
              break
            }
          }
          break
        }
        case 'Search':{
          if (!document.querySelector('.nav li.active'))
            return
          presenceData.details = `Searching for ${activeTab}`
          break
        }
        case 'discussion':{
          if (pathArr[2] === 'folders') {
            if (!activeTab || busy)
              return
            presenceData.details = 'Browsing topics'
            presenceData.state = activeTab
          }
          if (pathArr[2] === 'topics') {
            if (!document.querySelector('h3') || busy)
              return
            presenceData.details = 'Viewing a topic'
            presenceData.state = document.querySelector('h3')
            presenceData.buttons = [
              {
                label: 'View Page',
                url: href,
              },
            ]
          }
          break
        }
        case 'rewind':{
          presenceData.details = 'Viewing the rewind'
          break
        }
        default:{
          presenceData.details = pathname
          break
        }
      }
    }
    else if (!media.paused) {
      presenceData.details = PlayQueueStore.items[PlayQueueStore.currentIndex]?.entry?.name
      presenceData.state = PlayQueueStore.items[PlayQueueStore.currentIndex]?.entry?.artistString
      presenceData.largeImageKey = PlayQueueStore.items[PlayQueueStore.currentIndex]?.entry?.urlThumb || ActivityAssets.Logo
      presenceData.smallImageKey = PlayQueueStore.repeat === 'One' ? Assets.RepeatOne : PlayQueueStore.repeat === 'All' ? Assets.Repeat : Assets.Play
      if (!document.querySelector('iframe')?.src?.includes('soundcloud') && media.duration) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(media.currentTime, media.duration)
      }
      else if (soundcloud.duration) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(soundcloud.currentTime, soundcloud.duration)
      }
      presenceData.buttons = [
        {
          label: 'View Song',
          url: `https://vocadb.net/S/${PlayQueueStore.items[PlayQueueStore.currentIndex]?.entry?.id}`,
        },
        {
          label: 'View Artist',
          url: `https://vocadb.net/Ar/${PlayQueueStore.items[PlayQueueStore.currentIndex]?.entry?.artistIds[0]}`,
        },
      ]
    }
  }
  if (hostname === 'wiki.vocadb.net') {
    presenceData.name = 'VocaDB Wiki';
    (presenceData as PresenceData).type = ActivityType.Playing
    if (pathArr[1])
      presenceData.details = document.querySelector('h1')
  }
  if (hostname === 'blog.vocadb.net') {
    presenceData.name = 'VocaDB Blog';
    (presenceData as PresenceData).type = ActivityType.Playing
    if (pathArr[1]) {
      presenceData.details = 'Viewing a post'
      presenceData.state = document.querySelector('h1')
      presenceData.buttons = [
        {
          label: 'View Post',
          url: href,
        },
      ]
    }
  }

  presence.setActivity(presenceData)
})
