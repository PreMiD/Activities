import type { Resolver } from '../util/interfaces.js'
import { ActivityType } from 'premid'
import { ActivityAssets } from '../util/index.js'

const tvResolver: Resolver = {
  isActive: pathname => pathname.includes('/tv'),

  getDetails: t => t.media_tv,

  getState: (t, doc) => {
    let streamerName = null

    const playerDiv = doc.querySelector('#tv-player')
    if (playerDiv) {
      streamerName = playerDiv.getAttribute('data-channel')
    }

    if (!streamerName) {
      const containerDiv = doc.querySelector('#view-tv-index')
      if (containerDiv) {
        streamerName = containerDiv.getAttribute('data-live-video-show-title')
      }
    }

    if (!streamerName) {
      const iframe = doc.querySelector<HTMLIFrameElement>('iframe.tv-player-iframe')
      if (iframe && iframe.src) {
        try {
          const url = new URL(iframe.src)
          if (url.hostname.includes('kick.com'))
            streamerName = url.pathname.replace(/^\//, '')
          else if (url.hostname.includes('twitch.tv'))
            streamerName = url.searchParams.get('channel')
        }
        catch {}
      }
    }

    if (streamerName) {
      return streamerName.charAt(0).toUpperCase() + streamerName.slice(1)
    }

    return t.tv_checking
  },

  getType: () => ActivityType.Watching,

  getLargeImageKey: () => ActivityAssets.Logo,

  getSmallImageKey: () => ActivityAssets.TV,

  getSmallImageText: t => t.media_tv,
}

export default tvResolver
