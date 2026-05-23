import { ActivityType, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1361737326522531971',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/U/Udio/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Listening,
  }
  const browsing = await presence.getSetting('browsing')
  const song = document.querySelector<HTMLAudioElement>('audio')
  const { pathname, href } = document.location
  const pathArray = pathname.split('/')

  if (song && !song.paused) {
    if (song.currentTime <= 0)
      return
    presenceData.details = document.querySelector('#player h1')
    presenceData.state = document.querySelector('#player p');
    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(song)
    presenceData.largeImageKey = document.querySelector<HTMLImageElement>('#player img')
    presenceData.buttons = [
      {
        label: 'View Song',
        url: document.querySelector<HTMLAnchorElement>('#player a[href^="/songs"]')?.href ?? null,
      },
      {
        label: 'View Creator',
        url: document.querySelector<HTMLAnchorElement>('#player a[href^="/creators"]')?.href ?? null,
      },
    ]
  }
  else {
    if (browsing) {
      switch (pathArray[1]) {
        case 'home':{
          presenceData.details = 'Browsing homepage'
          break
        }
        case 'create': {
          presenceData.details = 'Creating a song'
          break
        }
        case 'library': {
          presenceData.details = 'Browsing library'
          break
        }
        case 'following': {
          presenceData.details = 'Browsing following'
          break
        }
        case 'blog': {
          if (!pathArray[2]) {
            presenceData.details = 'Browsing blog'
          }
          else if (document.querySelector('h1')) {
            presenceData.details = 'Viewing blog post'
            presenceData.state = document.querySelector('h1')
            presenceData.buttons = [
              {
                label: 'View Page',
                url: href,
              },
            ]
          }
          else {
            return
          }
          break
        }
        case 'creators': {
          if (!document.querySelector('h1'))
            return
          presenceData.details = 'Viewing creator'
          presenceData.state = document.querySelector('h1')
          presenceData.buttons = [
            {
              label: 'View Page',
              url: href,
            },
          ]
          break
        }
        case 'songs': {
          if (!document.querySelector('h1'))
            return
          presenceData.details = 'Viewing song'
          presenceData.state = document.querySelector('h1')
          presenceData.largeImageKey = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content
          presenceData.buttons = [
            {
              label: 'View Page',
              url: href,
            },
          ]
          break
        }
      }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
