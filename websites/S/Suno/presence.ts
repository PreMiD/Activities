import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1345681912458641469',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/Suno/assets/logo.png',
  Loading = 'https://cdn.rcd.gg/PreMiD/websites/S/Suno/assets/0.gif',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Listening,
  }
  const { href, pathname } = document.location
  const pathArray = pathname.split('/')
  const browsing = await presence.getSetting('browsing')
  const playState = JSON.parse(localStorage.getItem('play-state') ?? '{}')
  const song = document.querySelector('audio')

  if (browsing) {
    presenceData.details = 'Browsing Suno'

    switch (pathArray[1]) {
      case '': {
        presenceData.details = 'Viewing Home'
        break
      }
      case 'me': {
        presenceData.details = 'Viewing their library'
        presenceData.state = document.querySelector(`[role='tab'][tabindex='0']`)?.textContent
        break
      }
      case 'explore': {
        presenceData.details = 'Exploring Suno'
        if (song && !song.paused) {
          presenceData.state = document.querySelector('.musicPlayerHeader span')?.textContent
          presenceData.details = document.querySelector('.musicPlayerTitle a')?.textContent;
          [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(song)
        }
        break
      }
      case 'create': {
        presenceData.details = 'Viewing their Workspace'
        break
      }
      case 'search': {
        presenceData.details = `Searching ${document.querySelector(`[role='tab'][tabindex='0']`)?.textContent?.toLowerCase()}`
        break
      }
      case 'song': {
        presenceData.details = document.querySelector<HTMLInputElement>('input[disabled]')?.value
        presenceData.state = document.querySelectorAll(`a[href^='/@']`)[1]?.textContent
        presenceData.largeImageText = document.querySelector(`[role='tab'][aria-selected='true'] span`)?.textContent
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>(`img[src*='${pathArray[2]}']`)?.src ?? ActivityAssets.Logo
        presenceData.buttons = [
          {
            label: 'View Song',
            url: href,
          },
          {
            label: 'View Creator',
            url: document.querySelector<HTMLAnchorElement>(`a[href^='/@']`),
          },
        ]
        break
      }
      case 'playlist': {
        presenceData.details = 'Viewing a playlist'
        presenceData.state = document.querySelector('h1')?.textContent
        presenceData.largeImageText = document.querySelectorAll(`a[href^='/@']`)[1]?.textContent
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('#main-container img')?.src ?? ActivityAssets.Logo
        presenceData.buttons = [
          {
            label: 'View Playlist',
            url: href,
          },
          {
            label: 'View Creator',
            url: document.querySelector<HTMLAnchorElement>(`a[href^='/@']`),
          },
        ]
        break
      }
      case 'persona': {
        presenceData.details = 'Viewing a persona'
        presenceData.state = document.querySelector('h1')?.textContent
        presenceData.largeImageText = document.querySelector(`a[href^='/@']`)?.textContent
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('#main-container img')?.src ?? ActivityAssets.Logo
        presenceData.buttons = [
          {
            label: 'View Persona',
            url: href,
          },
          {
            label: 'View Creator',
            url: document.querySelector<HTMLAnchorElement>(`#main-container a[href^='/@']`)?.href ?? href,
          },
        ]
        break
      }
      default: {
        if (pathArray[1]?.startsWith('@')) {
          presenceData.details = 'Viewing a profile'
          presenceData.state = document.querySelector(`h1`)?.textContent
          presenceData.largeImageText = document.querySelector('#main-container button.text-lg.text-foreground-primary')?.textContent
          presenceData.largeImageKey = document.querySelector<HTMLImageElement>('img.rounded-full')?.src ?? ActivityAssets.Logo
          presenceData.buttons = [
            {
              label: 'View Page',
              url: href,
            },
          ]
        }
      }
    }
  }

  if (navigator.mediaSession.metadata && song && !song.paused && song) {
    const artwork = navigator.mediaSession.metadata?.artwork?.[0]?.src
    const songUrl = document.querySelector<HTMLAnchorElement>(`a[aria-label*='Playbar: Title']`)?.href
    const creatorUrl = document.querySelector<HTMLAnchorElement>(`a[aria-label*='Playbar: Artist']`)?.href
    presenceData.details = navigator.mediaSession.metadata.title
    presenceData.state = document.querySelector(`a[aria-label*='Playbar: Artist'] span`)?.textContent
    presenceData.largeImageKey = artwork ? `${artwork}?width=256` : ActivityAssets.Logo
    presenceData.largeImageText = `${navigator.mediaSession.metadata.artist.replace('Suno - ', '').slice(0, 125)}${navigator.mediaSession.metadata.artist.length > 125 ? '...' : ''}`
    presenceData.smallImageKey = song.duration === Infinity
      ? ActivityAssets.Loading
      : playState.repeat
        ? Assets.RepeatOne
        : Assets.Play
    presenceData.smallImageText = song.duration === Infinity
      ? 'Generating'
      : playState.repeat
        ? 'Repeat One'
        : 'Playing';
    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(song)
    if (songUrl && creatorUrl) {
      presenceData.buttons = [
        {
          label: 'View Song',
          url: songUrl,
        },
        {
          label: 'View Creator',
          url: creatorUrl,
        },
      ]
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
